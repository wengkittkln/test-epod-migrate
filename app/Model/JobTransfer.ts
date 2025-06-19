export type JobTransferList = {
  Id: string;
  JobList: string;
  Status: number;
  RequestedDate: string;
  RequestedBy: string;
  AcceptedDate: string;
  AcceptedBy: string;
};

export type JobItemList = {
  id: number;
  trackingList: string;
  consignee?: string;
  destination?: string;
  isSelected?: boolean;
  totalQuantity?: number;
  jobType?: number;
  codAmount?: number;
};

export type ReceivedJobItemQR = {
  mode: string,
  parcelQty: number,
  previousManifestId: number,
  trackingList: string[],
  transferReason: string,
  fromUser: string,
};

export type ReceivedJobItem = {
  id: number;
  trackingList: string;
};

export type CreateTransferRequestModel = {
  jobDetails: string;
  transferTo: number;
  transferedParcelQuantity: number;
  transferReason: string;
  longitude: number;
  latitude: number;
}