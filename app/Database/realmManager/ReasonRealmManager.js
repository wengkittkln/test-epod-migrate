import Realm from 'realm';
import * as Constants from '../../CommonConfig/Constants';

export const getAllReasonByReasonTypeWithoutCustomer = (reasonType, realm) => {
  let allResult = realm.objects(Constants.REASON_SCHEMA);
  let filteredResult = allResult.filtered(`reasonType == ${reasonType}  `);
  return filteredResult;
};
