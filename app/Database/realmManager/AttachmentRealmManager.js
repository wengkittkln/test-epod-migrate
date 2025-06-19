import Realm from 'realm';
import * as Constants from '../../CommonConfig/Constants';

export const insertNewAttachment = (attachmentModel, realm) => {
  realm.write(() => {
    realm.create(Constants.ATTACHMENT_SCHEMA, attachmentModel);
  });
};

export const queryAllAttachmentData = (realm) => {
  let allResult = realm.objects(Constants.ATTACHMENT_SCHEMA);
  return allResult;
};

export const deleteAllAttachmentData = (realm) => {
  realm.write(() => {
    let actionList = realm.objects(Constants.ATTACHMENT_SCHEMA);
    realm.delete(actionList);
  });
};
