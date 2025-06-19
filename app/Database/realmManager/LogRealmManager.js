import * as Constants from '../../CommonConfig/Constants';

export const insertLog = (errString, realm) => {
  if (errString.length > 2000) {
    errString = errString.substring(0, 2000);
  }

  const obj = {
    Message: errString,
  };

  realm.write(() => {
    realm.create(Constants.LOG_SCHEMA, obj);
  });
};

export const deleteAllLog = (realm) => {
  realm.write(() => {
    let logList = realm.objects(Constants.LOG_SCHEMA);

    if (logList) {
      realm.delete(logList);
    }
  });
};
