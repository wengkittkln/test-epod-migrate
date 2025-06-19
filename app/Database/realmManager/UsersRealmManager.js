import * as Constants from '../../CommonConfig/Constants';

export const insertNewData = (model, realm) => {
  realm.write(() => {
    realm.create(Constants.USERS_SCHEMA, model);
  });
};

export const selectAllUsers = (realm, userId) => {
  if (!userId) userId = 0;

  const allResult = realm
    .objects(Constants.USERS_SCHEMA)
    .sorted('displayName', false);

  return allResult.filtered(`id != '${userId}'`);
};

export const selectUserById = (realm, id) => {
  return realm.objectForPrimaryKey(Constants.USERS_SCHEMA, id);
};

export const updateUser = (realm, model, id) => {
  let isUpdate = true;
  realm.write(() => {
    let object = realm.objectForPrimaryKey(Constants.USERS_SCHEMA, id);

    if (!object) {
      return false;
    }

    object.displayName = model.displayName;
    object.isActive = model.isActive;
    object.lastUpdatedDate = model.lastUpdatedDate;
  });

  return isUpdate;
};

export const deleteAllUsers = (realm) => {
  realm.write(() => {
    let userlist = realm.objects(Constants.USERS_SCHEMA);
    realm.delete(userlist);
  });
};
