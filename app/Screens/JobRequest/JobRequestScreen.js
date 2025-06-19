import React, {useEffect, useState, useContext, useRef} from 'react';
import {useFocusEffect} from '@react-navigation/native';
import {
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Pressable,
  Image,
  TextInput,
} from 'react-native';
import {useSelector} from 'react-redux';
import {translationString} from '../../Assets/translation/Translation';
import * as Constants from '../../CommonConfig/Constants';
import CustomAlertView from '../../Components/CustomAlertView';
import JobRequestItem from '../../Components/JobRequestItem';
import JobRequestModal from '../../Components/JobRequestModal/JobRequestModal';
import {AppContext} from '../../Context/AppContext';
import {useJobRequest} from '../../Hooks/JobRequest/useJobRequest';
import {ImageRes} from '../../Assets';
import {useRoute} from '@react-navigation/native';

const JobRequestScreen = ({navigation}) => {
  const {signalRConnection} = useContext(AppContext);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [activeTab, setActiveTab] = useState('pending');
  const languageModel = useSelector((state) => state.LanguageReducer);
  const [searchText, setSearchText] = useState('');
  const debounceTimeout = useRef();

  const route = useRoute();

  const {
    handleApproveRequest,
    handleRejectRequest,
    handleRequestJob,
    fetchPendingJobRequests,
    fetchSentJobRequests,
    fetchAvailableJobs,
    pendingRequests,
    sentRequests,
    availableJobs,
    pendingHasMore,
    sentHasMore,
    availableHasMore,
  } = useJobRequest();

  useEffect(() => {
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }
    debounceTimeout.current = setTimeout(() => {
      loadJobRequests(1, searchText);
    }, 1000);
    return () => clearTimeout(debounceTimeout.current);
  }, [searchText, activeTab]);

  useFocusEffect(
    React.useCallback(() => {
      if (route.params?.scannedQRCode) {
        setSearchText(route.params.scannedQRCode);
        loadJobRequests(1, route.params.scannedQRCode);
        navigation.setParams({scannedQRCode: undefined});
      }
      return () => {};
    }, [route.params?.scannedQRCode]),
  );

  const loadJobRequests = async (page = 1, search = searchText) => {
    try {
      setIsLoading(true);
      switch (activeTab) {
        case 'pending':
          await fetchPendingJobRequests(page, search);
          break;
        case 'sent':
          await fetchSentJobRequests(page, search);
          break;
        case 'available':
          if (search && search.trim()) {
            await fetchAvailableJobs(page, search);
          }
          break;
      }
    } catch (error) {
      setAlertMessage(translationString.error_loading_requests);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMore = async () => {
    if (isLoading) {
      return;
    }
    try {
      setIsLoading(true);
      switch (activeTab) {
        case 'pending':
          if (pendingHasMore) {
            await fetchPendingJobRequests(
              pendingRequests.length / 5 + 1,
              searchText,
            );
          }
          break;
        case 'sent':
          if (sentHasMore) {
            await fetchSentJobRequests(sentRequests.length / 5 + 1, searchText);
          }
          break;
        case 'available':
          if (availableHasMore && searchText && searchText.trim()) {
            await fetchAvailableJobs(availableJobs.length / 5 + 1, searchText);
          }
          break;
      }
    } catch (error) {
      console.error('Error loading more data:', error);
      setAlertMessage(translationString.error_loading_requests);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestPress = (request) => {
    setSelectedRequest(request);
    setShowModal(true);
  };

  const handleApprove = async () => {
    try {
      setIsLoading(true);
      await handleApproveRequest(selectedRequest);
      setShowModal(false);
      await loadJobRequests();
      setAlertMessage(translationString.request_approved);
    } catch (error) {
      setAlertMessage(translationString.error_approving_request);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = async (reason) => {
    try {
      setIsLoading(true);
      await handleRejectRequest(selectedRequest, reason);
      setShowModal(false);
      await loadJobRequests();
      setAlertMessage(translationString.request_rejected);
    } catch (error) {
      setAlertMessage(translationString.error_rejecting_request);
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrentData = () => {
    switch (activeTab) {
      case 'pending':
        return pendingRequests;
      case 'sent':
        return sentRequests;
      case 'available':
        return availableJobs;
      default:
        return [];
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchText('');
  };

  const renderRequestItem = ({item}) => (
    <JobRequestItem
      item={item}
      onPress={handleRequestPress}
      translationString={translationString}
      languageModel={languageModel}
      type={activeTab}
    />
  );

  const renderTabBar = () => (
    <View style={[styles.tabBar, {backgroundColor: Constants.THEME_COLOR}]}>
      <TouchableOpacity
        style={[styles.tab, activeTab === 'pending' && styles.activeTab]}
        onPress={() => handleTabChange('pending')}>
        <Text
          style={[
            styles.tabText,
            {
              fontSize: 14,
              fontFamily: Constants.fontFamily,
              fontWeight: 'bold',
              textTransform: 'none',
              color:
                activeTab === 'pending' ? 'white' : 'rgba(255, 255, 255, 0.8)',
            },
          ]}>
          {translationString.pending_requests || 'Pending Requests'}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.tab, activeTab === 'available' && styles.activeTab]}
        onPress={() => handleTabChange('available')}>
        <Text
          style={[
            styles.tabText,
            {
              fontSize: 14,
              fontFamily: Constants.fontFamily,
              fontWeight: 'bold',
              textTransform: 'none',
              color:
                activeTab === 'available'
                  ? 'white'
                  : 'rgba(255, 255, 255, 0.8)',
            },
          ]}>
          {translationString.available_jobs || 'Available Jobs'}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.tab, activeTab === 'sent' && styles.activeTab]}
        onPress={() => handleTabChange('sent')}>
        <Text
          style={[
            styles.tabText,
            {
              fontSize: 14,
              fontFamily: Constants.fontFamily,
              fontWeight: 'bold',
              textTransform: 'none',
              color:
                activeTab === 'sent' ? 'white' : 'rgba(255, 255, 255, 0.8)',
            },
          ]}>
          {translationString.sent_requests || 'Sent Requests'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {renderTabBar()}
      <View style={styles.searchBarContainer}>
        <Pressable
          style={styles.menuIcon}
          onPress={() => navigation.navigate('JobRequestScanQR', {activeTab})}>
          <Image source={ImageRes.ScanIcon} />
        </Pressable>
        <View style={styles.searchBarInner}>
          <TextInput
            style={styles.searchInput}
            placeholder={translationString.search || 'Search'}
            value={searchText}
            onChangeText={setSearchText}
            autoCorrect={false}
            autoCapitalize="none"
            clearButtonMode="while-editing"
          />
          {!!searchText && (
            <TouchableOpacity
              onPress={() => setSearchText('')}
              style={styles.clearButton}>
              <Text style={styles.clearButtonText}>×</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
      <FlatList
        data={getCurrentData()}
        renderItem={renderRequestItem}
        keyExtractor={(item) => item.id.toString()}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {activeTab === 'pending'
                ? translationString.no_pending_requests
                : activeTab === 'sent'
                ? translationString.no_sent_requests
                : translationString.no_available_jobs}
            </Text>
          </View>
        )}
        refreshing={isLoading}
        onRefresh={() => loadJobRequests(1, searchText)}
        onEndReached={loadMore}
        onEndReachedThreshold={0.1}
      />

      <JobRequestModal
        visible={showModal}
        request={selectedRequest}
        onApprove={
          activeTab === 'available'
            ? (jobId) => handleRequestJob(jobId, setShowModal)
            : handleApprove
        }
        onReject={handleReject}
        onClose={() => setShowModal(false)}
        type={activeTab}
      />

      {alertMessage !== '' && (
        <CustomAlertView
          alertMsg={alertMessage}
          onDismiss={() => setAlertMessage('')}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: 'white',
  },
  tabText: {
    fontSize: 14,
    color: '#666',
  },
  activeTabText: {
    color: 'white',
    fontWeight: 'bold',
  },
  baseContainer: {
    flex: 1,
    marginHorizontal: 8,
    marginVertical: 8,
    flexDirection: 'row',
    borderRadius: 2,
    elevation: 2,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  itemContainer: {
    flex: 1,
    paddingLeft: 10,
    paddingRight: 10,
    paddingTop: 9,
  },
  requestItem: {
    backgroundColor: 'white',
    padding: 15,
    marginVertical: 5,
    marginHorizontal: 10,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  requestContent: {
    flex: 1,
  },
  requestTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  requestDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  requestTime: {
    fontSize: 12,
    color: '#999',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  statusContainer: {
    width: 11,
  },
  pendingStatus: {
    backgroundColor: 'grey',
  },
  quantity: {
    color: '#A0A0A0',
    marginBottom: 8,
    flex: 1,
  },
  remark: {
    marginBottom: 16,
    color: '#A0A0A0',
  },
  receiverContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  divider: {
    marginVertical: 9,
    backgroundColor: '#00000029',
    height: 1,
  },
  receiverName: {
    flex: 1,
    marginLeft: 4,
    color: '#A0A0A0',
    fontSize: 18,
  },
  address: {
    marginTop: 8,
    marginBottom: 16,
    color: 'black',
    fontSize: 30,
  },
  receiverLabel: {
    color: '#A0A0A0',
    fontSize: 18,
  },
  doNum: {
    color: '#A0A0A0',
    fontSize: 14,
    marginVertical: 4,
    fontSize: 16,
  },
  horizontalContainer: {
    flexDirection: 'row',
  },
  smallIcon: {
    width: 20,
    height: 20,
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingBottom: 5,
  },
  searchBarInner: {
    flex: 1,
    borderRadius: 5,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 12,
    paddingVertical: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.07,
    shadowRadius: 2,
    elevation: 2,
  },
  searchIcon: {
    fontSize: 20,
    marginRight: 8,
    color: '#888',
  },
  searchInput: {
    flex: 1,
    paddingVertical: 8,
    fontSize: 16,
    backgroundColor: 'transparent',
    borderWidth: 0,
    color: '#333',
  },
  clearButton: {
    marginLeft: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 15,
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#888',
    lineHeight: 18,
  },
  menuIcon: {
    padding: 10,
  },
});

export default JobRequestScreen;
