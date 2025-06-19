import React, {useState, useEffect, useLayoutEffect} from 'react';
import {translationString} from '../../../../Assets/translation/Translation';
import BackButton from '../../../../Assets/image/icon_back_white.png';
import * as Constants from '../../../../CommonConfig/Constants';
import {TouchableOpacity, Image} from 'react-native';
import * as CustomerRealmManager from '../../../../Database/realmManager/CustomerRealmManager';
import {IndexContext} from '../../../../Context/IndexContext';

export const useTermAndCondition = (route, navigation) => {
  const selectedJob = route.params.job;
  const [tnc, setTnC] = useState();
  const {epodRealm, EpodRealmHelper} = React.useContext(IndexContext);

  useEffect(() => {
    const item = CustomerRealmManager.getCustomerDataById(
      selectedJob.customerId,
      epodRealm,
    );

    setTnC(item.tnC);
  }, []);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity
          style={Constants.navStyles.navButton}
          onPress={() => {
            navigation.goBack();
          }}>
          <Image source={BackButton} />
        </TouchableOpacity>
      ),
      headerRight: null,
      headerTitle: translationString.tnc_title,
    });
  }, [navigation]);

  return {tnc};
};
