import Realm from 'realm';
import * as Constants from '../../CommonConfig/Constants';

export const AttachmentSchema = {
  name: Constants.ATTACHMENT_SCHEMA,
  properties: {
    actionId: {
      type: 'int',
      default: 0,
    },
    source: {
      type: 'int',
      default: 0,
    },
    thumbnailUrl: {
      type: 'string',
      default: '',
    },
    url: {
      type: 'string',
      default: '',
    },
  },
};
