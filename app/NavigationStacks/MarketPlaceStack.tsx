import {createStackNavigator, StackScreenProps} from '@react-navigation/stack';
import React from 'react';
import {MarketPlaceConfirmListScreen} from '../Screens/MarketPlaces/MarketPlaceConfirmListScreen';
import {MarketPlaceScreen} from '../Screens/MarketPlaces/MarketPlaceScreen';
import {MarketPlacesSearchScreen} from '../Screens/MarketPlaces/MarketPlaceSearchScreen';
import * as Constants from '../CommonConfig/Constants';
import {MarketPlaceScanQR} from '../Screens/MarketPlaces/MarketPlaceScanQR';
import {MarketPlaceProvider} from '../Provider/MarketPlaceProvider';
import {MarketPlaceDetailsScreen} from '../Screens/MarketPlaces/MarketPlaceDetailsScreen';
import {Job} from '../Model/Job';
import {StyleSheet} from 'react-native';

export type MarketPlacesParamsList = {
  MarketPlace;
  MarketPlaceSearch;
  MarketPlaceScan;
  MarketPlaceConfirmList;
  MarketPlaceDetails: {
    job: Job;
  };
};

const Stack = createStackNavigator<MarketPlacesParamsList>();
export type MarketPlaceProps = StackScreenProps<
  MarketPlacesParamsList,
  'MarketPlace'
>;
export type MarketPlaceListProps = StackScreenProps<
  MarketPlacesParamsList,
  'MarketPlaceConfirmList'
>;
export type MarketPlaceDetailsProps = StackScreenProps<
  MarketPlacesParamsList,
  'MarketPlaceDetails'
>;

export const MarketPlaceStackNavigator = () => {
  return (
    <MarketPlaceProvider>
      <Stack.Navigator
        screenOptions={{
          headerStyle: styles.header,
          headerTitleStyle: styles.title,
          headerTitleAlign: 'left',
        }}>
        <Stack.Screen
          name={'MarketPlace'}
          component={MarketPlaceScreen}
          options={{
            animationEnabled: false,
          }}
        />
        <Stack.Screen
          name={'MarketPlaceSearch'}
          component={MarketPlacesSearchScreen}
          options={{
            animationEnabled: false,
          }}
        />
        <Stack.Screen
          name={'MarketPlaceConfirmList'}
          component={MarketPlaceConfirmListScreen}
          options={{
            animationEnabled: false,
          }}
        />
        <Stack.Screen
          name={'MarketPlaceScan'}
          component={MarketPlaceScanQR}
          options={{
            headerShown: false,
            animationEnabled: false,
          }}
        />
        <Stack.Screen
          name={'MarketPlaceDetails'}
          component={MarketPlaceDetailsScreen}
          options={{
            animationEnabled: false,
          }}
        />
      </Stack.Navigator>
    </MarketPlaceProvider>
  );
};

const styles = StyleSheet.create({
  title: {
    color: 'white',
    fontSize: 20,
    fontFamily: Constants.fontFamily,
    fontWeight: '500',
  },
  header: {
    backgroundColor: Constants.THEME_COLOR,
    shadowColor: 'transparent',
    shadowRadius: 0,
    shadowOffset: {
      height: 0,
      width: 0,
    },
    elevation: 0,
  },
});
