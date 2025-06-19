import React, {useEffect, useState} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  FlatList,
  View,
  Pressable,
  Text,
  TouchableOpacity,
} from 'react-native';
import JobItem from '../../../Components/JobItem/JobItem';
import {usePendingJobList} from '../../../Hooks/JobList/Pending/usePendingJobList';
import CustomAlertView from '../../../Components/CustomAlertView';
import LoginModal from '../../../Components/LoginModal/LoginModal';
import {translationString} from '../../../Assets/translation/Translation';
import LoadingModal from '../../../Components/LoadingModal';
import {IndexContext} from '../../../Context/IndexContext';
import {useBatchSelectionJob} from './../../../Hooks/JobList/BatchSelection/useBatchSelectionJob';
import * as Constants from '../../../CommonConfig/Constants';

export default ({route, navigation}) => {
  const {onConfirm, onClick, getSelectedCount, onRemove, datalist, jobId} =
    useBatchSelectionJob(route, navigation);

  const [isLoading, setLoading] = useState(false);

  return (
    <SafeAreaView style={styles.baseContainer}>
      <FlatList
        contentContainerStyle={datalist.length === 0 && styles.centerEmptySet}
        style={styles.flatlist}
        data={datalist}
        extraData={datalist}
        renderItem={({item}) => (
          <JobItem
            jobId={jobId}
            item={item}
            isBatchSelection={true}
            action1={onClick}
            action2={onRemove}
          />
        )}
        keyExtractor={(item) => item.id.toString()}
        refreshing={isLoading}
      />
      <LoadingModal
        isShowLoginModal={isLoading}
        message={translationString.loading2}
      />
      <View style={styles.bottomContainer}>
        <Pressable
          style={styles.confirmButton}
          onPress={() => {
            onConfirm();
          }}>
          <Text style={styles.confirmText}>{getSelectedCount()}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  baseContainer: {
    flex: 1,
    backgroundColor: 'rgb(248, 248, 248)',
  },
  flatlist: {
    flex: 1,
  },
  centerEmptySet: {
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
  },
  bottomContainer: {
    flexDirection: 'row',
  },
  confirmButton: {
    backgroundColor: Constants.Completed_Color,
    justifyContent: 'center',
    flex: 1,
  },
  confirmText: {
    padding: 16,
    fontSize: 20,
    color: 'white',
    alignSelf: 'center',
  },
});
