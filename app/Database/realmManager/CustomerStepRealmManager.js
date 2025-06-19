import Realm from 'realm';
import * as Constants from '../../CommonConfig/Constants';

export const insertNewCustomerStepData = (customerStepModel, realm) => {
  realm.write(() => {
    realm.create(Constants.CUSTOMER_STEP_SCHEMA, customerStepModel);
  });
};

export const updateCustomerStepData = (customerStepModel, realm) => {
  realm.write(() => {
    let updateModel = realm.objectForPrimaryKey(
      Constants.CUSTOMER_STEP_SCHEMA,
      customerStepModel.id,
    );

    if (customerStepModel.customerId) {
      updateModel.customerId = customerStepModel.customerId;
    }

    if (customerStepModel.sequence) {
      updateModel.sequence = customerStepModel.sequence;
    }

    if (customerStepModel.actionStatus) {
      updateModel.actionStatus = customerStepModel.actionStatus;
    }

    if (customerStepModel.stepCode && customerStepModel.stepCode.length > 0) {
      updateModel.tnC = customerStepModel.stepCode;
    }

    if (customerStepModel.jobType) {
      updateModel.jobType = customerStepModel.jobType;
    }
  });
};

export const getCustomerStepDataById = (customerStepID, realm) => {
  let selectedResult = realm.objectForPrimaryKey(
    Constants.CUSTOMER_STEP_SCHEMA,
    customerStepID,
  );
  return selectedResult;
};

export const getCustomerStepDataByCustomerIdAndCurrentStepCodeAndJobType = (
  customerId,
  sequence,
  jobType,
  realm,
) => {
  let allResult = realm.objects(Constants.CUSTOMER_STEP_SCHEMA);
  let filteredResult = allResult.filtered(
    `customerId == ${customerId} AND sequence == ${sequence} AND jobType = ${jobType}`,
  );
  return filteredResult;
};

export const getStepCodeByCustomerIdAndJobType = (
  customerId,
  jobType,
  realm,
) => {
  let allResult = realm.objects(Constants.CUSTOMER_STEP_SCHEMA);
  let filteredResult = allResult.filtered(
    `customerId == ${customerId} AND jobType = ${jobType}`,
  );
  return filteredResult;
};

export const queryAllCustomerStepData = (realm) => {
  let allResult = realm.objects(Constants.CUSTOMER_SCHEMA);
  return allResult;
};

export const deleteAllCustomerStepData = (realm) => {
  realm.write(() => {
    let customerList = realm.objects(Constants.CUSTOMER_STEP_SCHEMA);
    realm.delete(customerList);
  });
};
