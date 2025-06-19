export interface JobTransfer {
  id?: number;
  jobDetails?: string;
  jobIds?: string;
  transferReason?: string;
  transferTo?: number;
  transferedParcelQuantity: number;
  receivedParcelQuantity?: number;
  status?: number;
  rejectReason?: string;
  createdBy?: number;
  createdByName: string;
  createdDate?: string;
  lastUpdatedDate?: string;
  lastUpdatedBy?: number;
  lastUpdatedByName?: string;
  latitude?: number;
  longitude?: number;
  toDriver?: string;
}
