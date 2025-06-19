import * as Constants from '../../CommonConfig/Constants';

export const JobBinSchema = {
  name: Constants.JOB_BIN_SCHEMA,
  primaryKey: 'id',
  properties: {
    id: {
      type: 'int',
      default: 0,
    },
    jobId: {
      type: 'int',
      default: 0,
    },
    bin: {
      type: 'string?',
      default: '',
    },
    weight: {
      type: 'double',
      default: 0.0,
    },
    netWeight: {
      type: 'double',
      default: 0.0,
    },
    withBin: {
      type: 'bool',
      default: true,
    },
    isReject: {
      type: 'int',
      default: 0,
    },
    rejectedReason: {
      type: 'string?',
      default: '',
    },
    isSynced: {
      type: 'bool',
      default: false,
    },
  },
};
