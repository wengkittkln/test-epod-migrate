import {StackNavigationProp} from '@react-navigation/stack';
import {useContext, useRef, useState} from 'react';
import {assignJob, getAllGroupCode} from '../../ApiController/ApiController';
import {translationString} from '../../Assets/translation/Translation';
import {IndexContext} from '../../Context/IndexContext';
import {Job} from '../../Model/Job';
import {JobDataArray} from '../../Model/JobDataArray';
import {MarketPlacesParamsList} from '../../NavigationStacks/MarketPlaceStack';
import {useMarketPlaceProvider} from '../../Provider/MarketPlaceProvider';
import * as RootNavigation from '../../rootNavigation';
import {Alert} from 'react-native';

export const useMarketPlaceConfirmList = (
  navigation: StackNavigationProp<
    MarketPlacesParamsList,
    'MarketPlaceConfirmList'
  >,
) => {
  const [isLoading, setLoading] = useState(false);
  const [isShowError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const marketProvider = useMarketPlaceProvider();
  const {auth, manifestData} = useContext(IndexContext);
  const [allGroupCode, setAllGroupCode] = useState<any[]>([]);
  const isCalledApi = useRef(false);

  const removeSelected = (job: Job) => {
    marketProvider.onRemove(job);
  };

  const getSelectedCount = () => {
    return translationString.formatString(
      translationString.confirm_job_receive,
      `(${marketProvider.selectedJobList.length})`,
    ) as string;
  };

  const getSelectedList = () => {
    return marketProvider.selectedJobList;
  };

  const onConfirmClick = async (selectedGroupId: number) => {
    const foundHasError = marketProvider.selectedJobList.find(
      (item) => item.errorModel != null,
    );
    if (foundHasError) {
      setShowError(true);
      setErrorMessage('Please remove job with error');
      return;
    }

    const list = marketProvider.selectedJobList.map((item: Job) => item.id);
    if (list.length <= 0) {
      setErrorMessage('No job to assign');
      setShowError(true);
      return;
    }
    setLoading(true);
    assignJob(manifestData?.id ?? '', list, selectedGroupId)
      .then((value) => {
        marketProvider.resetSelectedJobList();

        if (
          value.data.statusCode == 400 &&
          value.data.value &&
          value.data.value.errorMessage === 'MANIFEST_CLOSED'
        ) {
          console.warn('MANIFEST_CLOSED');
          Alert.alert(
            translationString.logout,
            translationString.marketPlaceLogoutTryAgain,
            [
              {
                text: translationString.cancel,
                onPress: () => {},
              },
              {
                text: translationString.confirm,
                onPress: () => {
                  auth.logout();
                },
              },
            ],
            {cancelable: false},
          );
        } else {
          const data = value.data as JobDataArray;
          if (data.isSuccess) {
            manifestData.marketDateUpdate = Date();
            manifestData.marketDateUpdateLocation = 'PendingJobListScreen'; // to limit delta sync call one time only
            navigation.popToTop();
            if (manifestData.id != null) RootNavigation.navigate('MainTab');
            else {
              RootNavigation.navigate('Main');
            }
          } else {
            marketProvider.updateList([...data.errorArray, ...data.dataArray]);
          }
        }
      })
      .catch((e) => {
        setErrorMessage(e.message);
        setShowError(true);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const getAllGroupCodeData = () => {
    if (!isCalledApi.current) {
      isCalledApi.current = true;
      setLoading(true);

      getAllGroupCode()
        .then((response) => {
          if (
            response.data &&
            Array.isArray(response.data) &&
            response.data.length > 0
          ) {
            const formatGroup = response.data.map((d) => ({
              label: d.groupCode,
              value: d.id,
            }));
            setAllGroupCode(formatGroup);
          }
        })
        .catch((error) => {
          console.error('Error fetching group codes:', error);
          isCalledApi.current = false;
        })
        .finally(() => {
          setLoading(false);
        });
    }
  };

  return {
    setShowError,
    isShowError,
    errorMessage,
    isLoading,
    getSelectedList,
    removeSelected,
    getSelectedCount,
    onConfirmClick,
    allGroupCode,
    getAllGroupCodeData,
    setAllGroupCode,
  };
};
