/* eslint-disable react-hooks/exhaustive-deps */
import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import * as Constants from '../CommonConfig/Constants';
import {useSelector, useDispatch} from 'react-redux';
import {createAction} from '../Actions/CreateActions';
import * as ActionType from '../Actions/ActionTypes';
import {translationString} from '../Assets/translation/Translation';

const FilterTypeModal = () => {
  const joblistModel = useSelector((state) => state.JobListReducer);
  const dispatch = useDispatch();
  const [selectedFilterType, setSelectedFilterType] = useState(
    joblistModel.filterType,
  );

  useEffect(() => {
    if (joblistModel.filterSuccessMsg) {
      setTimeout(() => {
        let filterMsgPayload = {
          filterSuccessMsg: '',
        };
        dispatch(
          createAction(ActionType.SET_FILTER_SUCCESS_MSG, filterMsgPayload),
        );
      }, 4000);
    }
  }, [joblistModel.filterSuccessMsg]);

  return (
    <Modal
      animationType="none"
      transparent={true}
      visible={joblistModel.isShowFilterModal}>
      <View style={[styles.darkBackground]}>
        <FlatList
          style={{
            width: '95%',
            backgroundColor: 'white',
            flexGrow: 0,
          }}
          data={[
            {
              id: Constants.JobType.ALL,
              title: translationString.all,
            },
            {
              id: Constants.JobType.DELIVERY,
              title: translationString.in_progress,
            },
            {
              id: Constants.JobType.PICK_UP,
              title: translationString.in_progress_pick_up,
            },
          ]}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({item}) => (
            <View style={styles.filterItemBaseView}>
              <TouchableOpacity
                onPress={() => {
                  setSelectedFilterType(item.id);
                }}
                style={[
                  styles.filterButton,
                  {
                    backgroundColor:
                      selectedFilterType === item.id
                        ? Constants.THEME_COLOR
                        : 'rgb(224, 224, 224)',
                  },
                ]}>
                <Text
                  style={[
                    styles.filterButtonText,
                    {
                      color: selectedFilterType === item.id ? 'white' : 'black',
                    },
                  ]}>
                  {item.title}
                </Text>
              </TouchableOpacity>
            </View>
          )}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListHeaderComponent={() => (
            <>
              <View style={styles.header}>
                <Text style={styles.headerTitle}>
                  {translationString.filter_title}
                </Text>
              </View>
              <View style={styles.divider} />
            </>
          )}
          ListFooterComponent={() => (
            <View style={styles.footer}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setSelectedFilterType(joblistModel.filterType);
                  let payload = {
                    isShowFilterModal: false,
                  };
                  dispatch(
                    createAction(ActionType.SET_IS_SHOW_FILTER_MODAL, payload),
                  );
                }}>
                <Text style={styles.cancelButtonText}>
                  {translationString.cancel_btn}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={() => {
                  let filterPayload = {
                    filterType: selectedFilterType,
                  };
                  dispatch(
                    createAction(
                      ActionType.UPDATE_JOBLIST_FILTER_TYPE,
                      filterPayload,
                    ),
                  );
                  let payload = {
                    isShowFilterModal: false,
                  };
                  dispatch(
                    createAction(ActionType.SET_IS_SHOW_FILTER_MODAL, payload),
                  );

                  let filterMsgPayload = {
                    filterSuccessMsg: translationString.filted_successfully,
                  };
                  dispatch(
                    createAction(
                      ActionType.SET_FILTER_SUCCESS_MSG,
                      filterMsgPayload,
                    ),
                  );
                }}>
                <Text style={styles.confirmButtonText}>
                  {translationString.confirm}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  darkBackground: {
    flex: 1,
    backgroundColor: 'rgba(67, 67, 67, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  flatlist: {
    width: '100%',
  },
  content: {
    backgroundColor: 'white',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  headerTitle: {
    color: Constants.Dark_Grey,
    fontSize: 20,
    fontFamily: Constants.NoboSansFont,
  },
  footer: {
    marginTop: 30,
    flexDirection: 'row',
  },
  divider: {
    marginHorizontal: 10,
    backgroundColor: 'lightgrey',
    height: 1,
    marginBottom: 30,
  },
  filterItemBaseView: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterButton: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    borderRadius: 5,
    width: '75%',
  },
  filterButtonText: {
    fontSize: 20,
    fontFamily: Constants.NoboSansFont,
  },
  cancelButton: {
    padding: 16,
    backgroundColor: 'rgb(224, 224, 224)',
    width: '50%',
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomLeftRadius: 5,
  },
  cancelButtonText: {
    fontSize: 20,
    fontFamily: Constants.NoboSansFont,
    color: 'black',
  },
  confirmButton: {
    padding: 16,
    backgroundColor: Constants.Completed_Color,
    width: '50%',
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomRightRadius: 5,
  },
  confirmButtonText: {
    fontSize: 20,
    fontFamily: Constants.NoboSansFont,
    color: 'white',
  },
  separator: {
    height: 15,
  },
});

export default FilterTypeModal;
