import Realm from 'realm';
import * as Constants from '../../CommonConfig/Constants';

export const insertNewMasterData = (masterDataModel, realm) => {
  realm.write(() => {
    realm.create(Constants.MASTER_DATA_SCHEMA, masterDataModel);
  });
};

export const updateMasterData = (masterDataModel, realm) => {
  realm.write(() => {
    let updateModel = realm.objectForPrimaryKey(
      Constants.MASTER_DATA_SCHEMA,
      masterDataModel.id,
    );
    updateModel.customerCode = masterDataModel.customerCode;
    updateModel.customerSteps = masterDataModel.customerSteps;
    updateModel.description = masterDataModel.description;
    updateModel.reason = masterDataModel.reason;
    if (masterDataModel.regexPatternValue) {
      updateModel.regexPatternValue = masterDataModel.regexPatternValue;
    }

    if (masterDataModel.tnC) {
      updateModel.tnC = masterDataModel.tnC;
    }
  });
};

export const getMasterDataById = (masterDataModel, realm) => {
  let selectedResult = realm.objectForPrimaryKey(
    Constants.MASTER_DATA_SCHEMA,
    masterDataModel.id,
  );
  return selectedResult;
};

export const queryAllMasterData = (realm) => {
  let allResult = realm.objects(Constants.MASTER_DATA_SCHEMA);
  return allResult;
};

export const deleteAllMasterData = (realm) => {
  realm.write(() => {
    let masterDataList = realm.objects(Constants.MASTER_DATA_SCHEMA);
    let customerStepsList = realm.objects(Constants.CUSTOMER_STEP_SCHEMA);
    let reasonList = realm.objects(Constants.REASON_SCHEMA);
    realm.delete(customerStepsList);
    realm.delete(reasonList);
    realm.delete(masterDataList);
  });
};
