import React, {useLayoutEffect, useState} from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import Svg, {Ellipse} from 'react-native-svg';
import {translationString} from '../../Assets/translation/Translation';
import * as Constants from '../../CommonConfig/Constants';
import {MarketPlaceDetailsProps} from '../../NavigationStacks/MarketPlaceStack';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {ImageRes} from '../../Assets';

export const MarketPlaceDetailsScreen = ({
  route,
  navigation,
}: MarketPlaceDetailsProps) => {
  const {job} = route.params;
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  useLayoutEffect(() => {
    navigation.setOptions({
      headerStyle: styles.header,
      headerLeft: () => (
        <TouchableOpacity
          style={Constants.navStyles.navButton}
          onPress={() => {
            navigation.pop();
          }}>
          <Image source={ImageRes.BackButton} />
        </TouchableOpacity>
      ),
      headerTitle: translationString.job_detail_title,
    });
  }, [job, navigation]);

  return (
    <SafeAreaView
      style={styles.baseContainer}
      onLayout={(e) => {
        const {width, height} = e.nativeEvent.layout;
        setWidth(width);
        setHeight(height);
      }}>
      <ScrollView bounces={false} style={styles.baseContainer}>
        <View
          style={[
            styles.rectangleContainer,
            {
              width,
              height: height * 0.18,
            },
          ]}>
          <Text style={styles.name}>
            {job.consignee + `(${job.customer.customerCode})`}
          </Text>
        </View>
        <Svg
          style={{marginTop: -(height * 0.1)}}
          height={height * 0.22}
          width={width}>
          <Ellipse
            cx={width * 0.5}
            cy="0"
            rx={width * 0.7}
            ry={height * 0.16}
            fill={Constants.THEME_COLOR}
          />
        </Svg>
        <View style={styles.content}>
          <Text style={styles.label}>{translationString.phone_number}</Text>
          <View style={styles.horizontalContainer}>
            <Text style={styles.value}>{job.contact}</Text>
          </View>
          <Text style={styles.label}>{translationString.address}</Text>
          <Text style={styles.value}>{job.destination}</Text>
          <Text style={styles.label}>{translationString.remark}</Text>
          <Text style={styles.value}>{job.remark}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  baseContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  content: {
    marginBottom: 20,
    marginHorizontal: 16,
  },
  rectangleContainer: {
    width: Constants.screenWidth,
    minHeight: hp('18%'),
    backgroundColor: Constants.THEME_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
  },
  name: {
    fontSize: 30,
    color: 'white',
    fontFamily: Constants.NoboSansBoldFont,
    marginHorizontal: 30,
  },
  label: {
    fontFamily: Constants.NoboSansFont,
    fontSize: 20,
    marginHorizontal: 30,
    marginTop: 40,
    marginBottom: 6,
    color: Constants.Pending_Color,
  },
  value: {
    fontFamily: Constants.NoboSansFont,
    fontSize: 20,
    marginHorizontal: 30,
    color: Constants.Dark_Grey,
    fontWeight: 'bold',
    flex: 1,
  },
  button: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  horizontalContainer: {
    flex: 1,
    flexWrap: 'wrap',
    flexDirection: 'row',
    alignItems: 'center',
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
