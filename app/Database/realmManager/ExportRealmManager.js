import * as Constants from '../../CommonConfig/Constants';
import * as GeneralHelper from '../../Helper/GeneralHelper';
import {AllSchema} from './index';

export const exportToJson = (realm) => {
  const finalResult = [];

  for (var schema of AllSchema) {
    const nestedObject = [];

    for (let key in schema.properties) {
      if (schema.properties[key].type === 'list') {
        nestedObject.push(key);
      }
    }

    const realmObject = realm.objects(schema.name);
    const json = GeneralHelper.convertRealmObjectToJSONSkipChild(
      realmObject,
      nestedObject,
    );

    finalResult.push(test(json));
  }

  return finalResult;
};

export const getSchemaNameByIndex = (index) => {
  return AllSchema[index]?.name;
};

const test = (src) => {
  const finalResult = [];
  for (let key in src) {
    finalResult.push(src[key]);
  }
  return finalResult;
};
