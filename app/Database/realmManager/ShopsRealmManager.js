import * as Constants from '../../CommonConfig/Constants';

export const insertNewData = (realm, model) => {
  realm.write(() => {
    realm.create(Constants.SHOPS_SCHEMA, model);
  });
};

export const selectShopById = (realm, id) => {
  return realm.objectForPrimaryKey(Constants.SHOPS_SCHEMA, id);
};

export const updateShop = (realm, model, id) => {
  realm.write(() => {
    let object = realm.objectForPrimaryKey(Constants.SHOPS_SCHEMA, id);

    if (!object) {
      return false;
    }

    object.qrContent = model.qrContent;
    object.isDeleted = model.isDeleted;
    object.lastUpdatedDate = model.lastUpdatedDate;
  });

  return true;
};

export const deleteAllShops = (realm) => {
  realm.write(() => {
    let userlist = realm.objects(Constants.SHOPS_SCHEMA);
    realm.delete(userlist);
  });
};
