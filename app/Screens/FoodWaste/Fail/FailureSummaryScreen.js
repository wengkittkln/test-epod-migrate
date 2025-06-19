import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableHighlight,
} from 'react-native';
import {translationString} from '../../../Assets/translation/Translation';
import * as Constants from '../../../CommonConfig/Constants';
import {useJobBinManagement} from '../../../Hooks/JobList/JobBinManagement/useJobBinManagement';

const FailureSummaryScreen = ({route, navigation}) => {
  const {job, mode, getAllRejectBinInformation, jobBinPartialDelivery} =
    useJobBinManagement(route, navigation);
  const [failureData, setFailureData] = useState([]);
  const [isPartialDelivery, setIsPartialDelivery] = useState(false);

  useEffect(() => {
    const fetchRejectBinInformation = async () => {
      try {
        const rejectedBinList = await getAllRejectBinInformation();
        if (rejectedBinList.length !== job.totalQuantity) {
          setIsPartialDelivery(true);
        } else {
          setIsPartialDelivery(false);
        }
        setFailureData([...rejectedBinList]);
      } catch (error) {
        console.error('Error fetching reject bin information:', error);
      }
    };

    fetchRejectBinInformation();
  }, []);

  const FailureItem = ({item}) => {
    return (
      <View style={[styles.itemContainer, styles.marginHorizontalContainer]}>
        <View style={styles.itemRow}>
          <View style={styles.itemColumn}>
            <Text style={styles.itemLabel}>{translationString.failedSku}</Text>
            <Text style={styles.itemValue}>{item.sku}</Text>
          </View>
          <View style={styles.itemColumn}>
            <Text style={styles.itemLabel}>{translationString.netWeight}</Text>
            <Text style={styles.itemValue}>{item.weight}</Text>
          </View>
        </View>
        <View style={styles.itemReason}>
          <Text style={styles.itemLabel}>{translationString.reason}</Text>
          <Text style={styles.reasonValue}>{item.reason}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={{flex: 1}}>
      <FlatList
        data={failureData}
        renderItem={({item}) => <FailureItem item={item} />}
        keyExtractor={(item) => item.id}
        style={{flex: 1}}
      />
      {mode !== 'view' && (
        <TouchableHighlight
          style={styles.submitButton}
          onPress={() => {
            jobBinPartialDelivery(isPartialDelivery);
          }}>
          <Text style={styles.submitButtonText}>
            {isPartialDelivery
              ? translationString.confirmForPartialDelivery
              : translationString.confirmForFailDelivery}
          </Text>
        </TouchableHighlight>
      )}
    </View>
  );
};

export default FailureSummaryScreen;

const styles = StyleSheet.create({
  itemContainer: {
    padding: 20,
    borderBottomColor: 'black',
    borderBottomWidth: 1,
    borderStyle: 'solid',
  },
  itemRow: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 10,
  },
  itemColumn: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  itemLabel: {
    fontSize: 17,
  },
  itemValue: {
    fontSize: 20,
    color: '#E54823',
    fontWeight: '700',
  },
  itemReason: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  reasonValue: {
    fontSize: 20,
  },
  marginHorizontalContainer: {
    marginHorizontal: 20,
  },
  actionContainer: {
    display: 'flex',
    flexDirection: 'row',
  },
  submitButton: {
    backgroundColor: '#41c300',
    paddingVertical: 30,
  },
  submitButtonText: {
    color: Constants.WHITE,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
  },
});
