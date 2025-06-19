import Realm from 'realm';
import * as Constants from '../../CommonConfig/Constants';

export const insertNewCustomerData = (customerModel, realm) => {
  realm.write(() => {
    realm.create(Constants.CUSTOMER_SCHEMA, customerModel);
  });
};

export const updateCustomerData = (customerModel, realm) => {
  realm.write(() => {
    let updateModel = realm.objectForPrimaryKey(
      Constants.CUSTOMER_SCHEMA,
      customerModel.customerId,
    );

    if (customerModel.customerCode && customerModel.customerCode.length > 0) {
      updateModel.customerCode = customerModel.customerCode;
    }

    if (
      customerModel.regexPatternValue &&
      customerModel.regexPatternValue.length > 0
    ) {
      updateModel.regexPatternValue = customerModel.regexPatternValue;
    }

    if (customerModel.description && customerModel.description.length > 0) {
      updateModel.description = customerModel.description;
    }

    if (customerModel.tnC && customerModel.tnC.length > 0) {
      updateModel.tnC = customerModel.tnC;
    }
  });
};

export const getCustomerDataById = (customerModelID, realm) => {
  let selectedResult = realm.objectForPrimaryKey(
    Constants.CUSTOMER_SCHEMA,
    customerModelID,
  );
  return selectedResult;
};

export const queryAllCustomerData = (realm) => {
  let allResult = realm.objects(Constants.CUSTOMER_SCHEMA);
  return allResult;
};

export const deleteAllCustomerData = (realm) => {
  realm.write(() => {
    let customerList = realm.objects(Constants.CUSTOMER_SCHEMA);
    realm.delete(customerList);
  });
};
