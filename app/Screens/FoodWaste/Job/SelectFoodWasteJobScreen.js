import React, {useEffect, useState} from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import {translationString} from '../../../Assets/translation/Translation';
import * as JobBinRealmManager from '../../../Database/realmManager/JobBinRealmManager';
import {IndexContext} from '../../../Context/IndexContext';
import * as Constants from '../../../CommonConfig/Constants';

const SelectFoodWasteJobScreen = ({route, navigation}) => {
  const {epodRealm} = React.useContext(IndexContext);
  const [jobsData, setJobsData] = useState([]);

  useEffect(() => {
    const {jobList} = route.params;

    if (jobList) {
      const newList = jobList
        .filter(({customer, currentStepCode, jobType, status}) => {
          const step = customer.customerSteps.find(
            (s) => s.sequence === currentStepCode && s.jobType === jobType,
          );

          return (
            jobType === 1 &&
            (status === 0 || status === 1) &&
            step?.stepCode === Constants.StepCode.WEIGHT_CAPTURE
          );
        })
        .map(({consignee, id, destination, totalQuantity}) => ({
          consignee,
          id,
          destination,
          collected: JobBinRealmManager.getJobBinByJob(epodRealm, id).length,
          estimated: totalQuantity,
        }))
        .filter((data) => data.collected < data.estimated);

      setJobsData(newList);
    }
  }, [route.params.jobList]);

  const selectJob = (job) => {
    route.params.onGoBack(job);
    navigation.goBack();
  };

  const JobContainer = ({consignee, id, destination, collected, estimated}) => {
    const truncateString = (str, maxLength) => {
      return str.length <= maxLength ? str : str.slice(0, maxLength) + '...';
    };

    return (
      <TouchableWithoutFeedback
        onPress={() =>
          selectJob({consignee, id, destination, collected, estimated})
        }>
        <View style={styles.jobContainer}>
          <Text style={styles.consigneeText}>
            {translationString.consignee}: {consignee}
          </Text>
          <View style={styles.divider} />
          <Text style={styles.jobIdText}>
            {translationString.id}: {id}
          </Text>
          <Text style={styles.addressText}>
            {truncateString(destination, 65)}
          </Text>
          <View style={styles.divider} />
          <Text style={styles.actualCollectedText}>
            {translationString.actualCollectedAndWeighted}
          </Text>
          <View style={styles.collectedContainer}>
            <Text style={styles.collectedText}>
              {collected} {translationString.pcs}
            </Text>
            <Text style={styles.estimatedText}>
              / {estimated} {translationString.pcs} (
              {translationString.estimated})
            </Text>
          </View>
        </View>
      </TouchableWithoutFeedback>
    );
  };

  return (
    <FlatList
      contentContainerStyle={styles.listContentContainer}
      data={jobsData}
      keyExtractor={(item) => item.id}
      renderItem={({item}) => (
        <JobContainer
          consignee={item.consignee}
          id={item.id}
          destination={item.destination}
          collected={item.collected}
          estimated={item.estimated}
        />
      )}
    />
  );
};

export default SelectFoodWasteJobScreen;

const styles = StyleSheet.create({
  listContentContainer: {
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  jobContainer: {
    backgroundColor: '#FFE2C9',
    padding: 10,
    shadowColor: 'rgba(0,0,0, .4)',
    shadowOffset: {height: 1, width: 1},
    shadowOpacity: 1,
    shadowRadius: 1,
    elevation: 6,
    marginBottom: 10,
  },
  consigneeText: {
    fontSize: 15,
    paddingBottom: 5,
  },
  jobIdText: {
    fontSize: 15,
    color: 'grey',
    paddingTop: 5,
  },
  addressText: {
    fontSize: 20,
    paddingBottom: 5,
  },
  actualCollectedText: {
    fontSize: 15,
    color: 'grey',
    paddingTop: 5,
  },
  collectedContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  collectedText: {
    fontSize: 20,
  },
  estimatedText: {
    color: 'grey',
    fontSize: 15,
  },
  divider: {
    borderBottomColor: '#E1DDDA',
    borderBottomWidth: 1,
    borderStyle: 'solid',
  },
});
