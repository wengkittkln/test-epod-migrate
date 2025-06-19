import {createStackNavigator, StackScreenProps} from '@react-navigation/stack';
import React from 'react';
import {JobTransferScreen} from '../Screens/JobTransfer/JobTransferScreen';
import * as Constants from '../CommonConfig/Constants';
import {StyleSheet} from 'react-native';
import {JobTransferProvider} from '../Provider/JobTransferProvider';
import {JobTransferJobListScreen} from '../Screens/JobTransfer/JobTransferJobListScreen';
import {JobTransferJobAddScreen as JobTransferAddScreen} from '../Screens/JobTransfer/JobTransferAddScreen';
import {JobTransferDetailScreen} from '../Screens/JobTransfer/JobTransferDetailScreen';
import {JobTransferScanScreen} from '../Screens/JobTransfer/JobTransferScanScreen';
import {DrawerStackNavigator} from '../router';
import PlateScreen from '../Screens/Auth/PlateScreen';
import SelectReasonScreen from '../Screens/JobList/Action/Reason/SelectReasonScreen';

export type JobTransferParamsList = {
  JobTransfer: any;
  JobTransferJobList: any;
  JobTransferAdd: any;
  JobTransferDetail: any;
  PlateNo: any;
  JobTransferScan: any;
  Drawer: any;
  SelectReasonJobTransfer: any;
  // MarketPlaceDetails: {
  //     job: Job
  // }
};

const RootStack = createStackNavigator();
const Stack = createStackNavigator<JobTransferParamsList>();
export type JobTransferProps = StackScreenProps<
  JobTransferParamsList,
  'JobTransfer'
>;
export type JobTransferJobListProps = StackScreenProps<
  JobTransferParamsList,
  'JobTransferJobList'
>;
export type JobTransferAddProps = StackScreenProps<
  JobTransferParamsList,
  'JobTransferAdd'
>;
export type JobTransferDetailProps = StackScreenProps<
  JobTransferParamsList,
  'JobTransferDetail'
>;
export type JobTransferScanProps = StackScreenProps<
  JobTransferParamsList,
  'JobTransferScan'
>;

export type JobTransferSelectReasonProps = StackScreenProps<
  JobTransferParamsList,
  'SelectReasonJobTransfer'
>;

export const JobTransferStackNavigator = ({route: {params}}) => {
  return (
    <JobTransferProvider>
      <Stack.Navigator
        screenOptions={{
          headerStyle: styles.header,
          headerTitleStyle: styles.title,
          headerTitleAlign: 'left',
        }}>
        <Stack.Screen
          name={'JobTransfer'}
          component={JobTransferScreen}
          initialParams={params}
          options={{
            animationEnabled: false,
          }}
        />
        <Stack.Screen
          name={'JobTransferJobList'}
          component={JobTransferJobListScreen}
          initialParams={params}
          options={{
            animationEnabled: false,
          }}
        />
        <Stack.Screen
          name={'JobTransferAdd'}
          component={JobTransferAddScreen}
          options={{
            animationEnabled: false,
          }}
        />
        <Stack.Screen
          name={'JobTransferDetail'}
          component={JobTransferDetailScreen}
          initialParams={params}
          options={{
            animationEnabled: false,
          }}
        />
        <Stack.Screen name={'Drawer'} component={DrawerStackNavigator} />
        <Stack.Screen
          name={'JobTransferScan'}
          component={JobTransferScanScreen}
          initialParams={params}
          options={{
            headerShown: false,
            animationEnabled: false,
          }}
        />
      </Stack.Navigator>
    </JobTransferProvider>
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
