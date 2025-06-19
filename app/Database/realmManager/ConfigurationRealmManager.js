import * as Constants from '../../CommonConfig/Constants';

export const insertNewData = (realm, model) => {
  realm.write(() => {
    let updateModel = realm.objectForPrimaryKey(
      Constants.CONFIGURATION_SCHEMA,
      model.id,
    );
    if (updateModel) {
      updateModel.value = model.value;
    } else {
      realm.create(Constants.CONFIGURATION_SCHEMA, model);
    }
  });
};

export const updateConfiguration = (realm, id, value) => {
  realm.write(() => {
    let object = realm.objectForPrimaryKey(Constants.CONFIGURATION_SCHEMA, id);

    if (!object) {
      return false;
    }

    object.value = value;
  });

  return true;
};

export const getConfigurationByGroupAndKey = (realm, group, key) => {
  let allResult = realm.objects(Constants.CONFIGURATION_SCHEMA);
  let filteredResult = allResult.filtered(
    `group = "${group}" 
    AND key = "${key}"`,
  );
  return filteredResult;
};

export const getUploadImageQuanlity = (realm) => {
  // return 0.5;
  let allResult = realm.objects(Constants.CONFIGURATION_SCHEMA);
  let filteredResult = allResult.filtered(
    `group = "GENERAL"
    AND key = "UPLOAD_IMAGE_QUALITY"`,
  );

  if (
    filteredResult &&
    filteredResult.length > 0 &&
    !isNaN(filteredResult[0].value) &&
    filteredResult[0].value > 0
  ) {
    return +filteredResult[0].value;
  }

  return 0.5;
};

export const deleteAllConfigurations = (realm) => {
  realm.write(() => {
    let list = realm.objects(Constants.CONFIGURATION_SCHEMA);

    if (list) {
      realm.delete(list);
    }
  });
};
