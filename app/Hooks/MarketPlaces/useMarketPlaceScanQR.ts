import {useRef, useState} from 'react';
import {Alert, Animated} from 'react-native';
import {getUnassignJob} from '../../ApiController/ApiController';
import {translationString} from '../../Assets/translation/Translation';
import {ToastMessage} from '../../Components/Toast/ToastMessage';
import {JobDataArray} from '../../Model/JobDataArray';
import {useMarketPlaceProvider} from '../../Provider/MarketPlaceProvider';

export const useMarketPlaceScanQR = () => {
  const [isShowMessage, setShowMessage] = useState(false);
  const [isSuccess, setSuccess] = useState(false);
  const [dialogMessage, setDialogMessage] = useState('');
  const marketProvider = useMarketPlaceProvider();
  const [isLoading, setLoading] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current; // Initial value for opacity: 0

  const animte = () => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0.8,
        duration: 60,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 30,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const addBarcode = (code: string) => {
    if (isLoading || isShowMessage || isSuccess) {
      return;
    }
    animte();
    setLoading(true);
    getUnassignJob(0, 1000, code)
      .then((value) => {
        const data = value.data as JobDataArray;
        const resultId = data.dataArray.length > 0 ? data.dataArray[0].id : 0;
        const selectedList = marketProvider.selectedJobList;
        if (data.dataArray != null && data.dataArray.length > 0) {
          const exist = selectedList.findIndex(
            (selected) => selected.id == resultId,
          );
          if (exist != -1) {
            setSuccess(true);
            Alert.alert(
              translationString.market_place_title,
              translationString.formatString(
                translationString.market_place_existed_job,
                code,
              ) as string,
              [
                {
                  text: translationString.confirm,
                  onPress: () => {
                    setSuccess(false);
                    setLoading(false);
                  },
                },
              ],
              {cancelable: false},
            );
          } else {
            setSuccess(true);
            // const message = translationString.scan_success;
            // setDialogMessage(message)
            // setShowMessage(true)
            marketProvider.onAdd(data.dataArray);
            ToastMessage({
              duration: 1000,
              text1: translationString.scan_success,
            });
            setTimeout(() => {
              setSuccess(false);
            }, 1000);
            setLoading(false);
          }
          if (data.dataArray.length != 1) {
            const message = translationString.formatString(
              translationString.market_place_scan_duplicate,
              data.dataArray.length.toString(),
              code,
            ) as string;
            setDialogMessage(message);
            setShowMessage(true);
            setLoading(false);
          }
        } else {
          Alert.alert(
            translationString.market_place_title,
            translationString.market_place_not_found,
            [
              {
                text: translationString.okText,
                onPress: () => {
                  setLoading(false);
                },
              },
            ],
            {cancelable: false},
          );
        }
      })
      .catch((e) => {
        setLoading(false);
        console.log(e);
      });
  };

  const getSelectedCount = () => {
    return translationString.formatString(
      translationString.see_full_list,
      marketProvider.selectedJobList.length,
    ) as string;
  };

  return {
    animte,
    fadeAnim,
    addBarcode,
    getSelectedCount,
    isLoading,
    isShowMessage,
    setShowMessage,
    dialogMessage,
  };
};
