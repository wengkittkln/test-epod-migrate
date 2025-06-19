import Realm from 'realm';
import * as Constants from '../../CommonConfig/Constants';
import {ManifestSchema} from '../schema/ManifestSchema';
import {JobSchema} from '../schema/JobSchema';
import {OrderSchema} from '../schema/OrderSchema';
import {OrderItemSchema} from '../schema/OrderItemSchema';
import {MasterDataSchema} from '../schema/MasterDataSchema';
import {CustomerStepSchema} from '../schema/CustomerStepSchema';
import {ReasonSchema} from '../schema/ReasonSchema';
import {VehicleLocationSchema} from '../schema/VehichleLocationSchema';
import {CustomerSchema} from '../schema/CustomerSchema';
import {ActionSchema} from '../schema/ActionSchema';
import {ActionOrderItemSchema} from '../schema/ActionOrderItemSchema';
import {AttachmentSchema} from '../schema/AttachmentSchema';
import {PhotoEntrySchema} from '../schema/PhotoEntrySchema';
import {CustomerConfigurationSchema} from '../schema/CustomerConfigurationSchema';
import {LogSchema} from './../schema/LogSchema';
import {JobTransferSchema} from '../schema/JobTransferSchema';
import {UsersSchema} from '../schema/UsersSchema';
import {JobContainerSchema} from '../schema/JobContainerSchema';
import {ShopsSchema} from '../schema/ShopsSchema';
import {ConfigurationSchema} from '../schema/ConfigurationSchema';
import {JobBinSchema} from '../schema/JobBinSchema';
import {JobSortSchema} from '../schema/JobSortSchema';

const databaseOptions = {
  path: 'ePOD.realm',
  schema: [
    ManifestSchema,
    JobSchema,
    OrderSchema,
    OrderItemSchema,
    MasterDataSchema,
    CustomerStepSchema,
    ReasonSchema,
    VehicleLocationSchema,
    CustomerSchema,
    ActionOrderItemSchema,
    ActionSchema,
    AttachmentSchema,
    PhotoEntrySchema,
    CustomerConfigurationSchema,
    LogSchema,
    JobTransferSchema,
    UsersSchema,
    JobContainerSchema,
    ShopsSchema,
    ConfigurationSchema,
    JobBinSchema,
    JobSortSchema,
  ],
  schemaVersion: Constants.SCHEMA_VERSION,
};

export const getNewEpodRealm = () => {
  // if (databaseOptions) {
  //   databaseOptions.encryptionKey = toByteArray(key);
  // }
  const realmObject = new Realm(databaseOptions);
  return realmObject;
};

export const AllSchema = databaseOptions.schema;

function toByteArray(string) {
  let array = new Int8Array(string.length);
  let value = '';
  for (let i = 0; i < string.length; i++) {
    array[i] = string.charAt(i);
    value = value + array[i];
  }
  return array;
}
