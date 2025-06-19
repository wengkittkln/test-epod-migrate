import React, {useState} from 'react';
import {View, TouchableOpacity, Text, StyleSheet, Image} from 'react-native';
import {WHITE} from '../CommonConfig/Constants';
import {translationString} from '../Assets/translation/Translation';
import * as JobSortRealmManager from '../Database/realmManager/JobSortRealmManager';
import {IndexContext} from '../../app/Context/IndexContext';

const SortButton = ({setNormalSortSelect, setVIPSortSelect, sortOptions}) => {
  const [showSortOptions, setShowSortOptions] = useState(false);
  const [selectedVIPStatus, setSelectedVIPStatus] = useState(null);
  const [selectedSortType, setSelectedSortType] = useState(null);
  const {epodRealm} = React.useContext(IndexContext);

  const handleSortPress = () => {
    setShowSortOptions(!showSortOptions);
    setSelectedVIPStatus(null);
    setSelectedSortType(null);
  };

  const handleVIPSelection = (isVIP) => {
    setSelectedVIPStatus(isVIP);
  };

  const handleSortTypeSelection = (type) => {
    setSelectedSortType(type);
  };

  const handleSortOrderSelection = (order) => {
    setShowSortOptions(false);
    if (selectedVIPStatus !== null) {
      setVIPSortSelect({
        type: selectedSortType,
        order,
      });
      JobSortRealmManager.updateJobSortOption(
        selectedSortType,
        order,
        selectedVIPStatus,
        epodRealm,
      );
    } else {
      setNormalSortSelect({
        type: selectedSortType,
        order,
      });
      JobSortRealmManager.updateJobSortOption(
        selectedSortType,
        order,
        selectedVIPStatus,
        epodRealm,
      );
    }

    setSelectedVIPStatus(null);
    setSelectedSortType(null);
  };

  // New back function to handle navigation
  const handleBack = () => {
    if (selectedSortType !== null) {
      // If sort type is selected, go back to type selection
      setSelectedSortType(null);
    } else if (selectedVIPStatus !== null) {
      // If VIP status is selected, go back to VIP selection
      setSelectedVIPStatus(null);
    } else {
      // If at the first level, close the dropdown
      setShowSortOptions(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.floatingButton} onPress={handleSortPress}>
        <Image
          source={require('../Assets/image/arrow-up-down.png')}
          style={styles.sortIcon}
        />
        <Text style={{color: WHITE, fontWeight: 'bold', marginLeft: 5}}>
          {translationString.sort}
        </Text>
      </TouchableOpacity>

      {showSortOptions && (
        <View style={styles.sortDropdown}>
          {!selectedVIPStatus && selectedVIPStatus !== false ? (
            // Select VIP or Normal Jobs
            <>
              <TouchableOpacity onPress={() => handleVIPSelection(true)}>
                <Text style={styles.normalSortOption}>
                  {translationString.vipJob}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleVIPSelection(false)}>
                <Text style={styles.normalSortOption}>
                  {translationString.normalJob}
                </Text>
              </TouchableOpacity>
            </>
          ) : !selectedSortType ? (
            <>
              {sortOptions.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => handleSortTypeSelection(option.value)}>
                  <Text style={styles.normalSortOption}>{option.label}</Text>
                </TouchableOpacity>
              ))}
            </>
          ) : (
            <>
              <TouchableOpacity onPress={() => handleSortOrderSelection('asc')}>
                <Text style={styles.normalSortOption}>
                  {translationString.ascending}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleSortOrderSelection('desc')}>
                <Text style={styles.normalSortOption}>
                  {translationString.descending}
                </Text>
              </TouchableOpacity>
            </>
          )}
          {(selectedVIPStatus !== null || selectedSortType !== null) && (
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
              <Image
                source={require('../Assets/image/arrow-left.png')}
                style={styles.backIcon}
              />
              <Text style={styles.backText}>{translationString.back}</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 20,
    right: 20,
  },
  floatingButton: {
    display: 'flex',
    flexDirection: 'row',
    backgroundColor: '#F26101',
    width: 90,
    height: 40,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  sortDropdown: {
    position: 'absolute',
    bottom: 50,
    right: 0,
    backgroundColor: 'white',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 15,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
    width: 250,
  },
  normalSortOption: {
    fontSize: 16,
    paddingVertical: 8,
    color: '#333',
  },
  sortIcon: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingVertical: 10,
  },
  backIcon: {
    width: 16,
    height: 16,
    resizeMode: 'contain',
    marginRight: 5,
  },
  backText: {
    color: '#F26101',
    fontSize: 14,
    fontWeight: '500',
  },
  dropdownTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 8,
    color: '#333',
  },
});

export default SortButton;
