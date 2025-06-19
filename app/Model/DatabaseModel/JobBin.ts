export interface JobBin {
  id?: number;
  jobId?: number;
  bin?: string;
  weight?: number;
  netWeight?: number;
  withBin?: boolean;
  isReject?: number;
  isSynced?: boolean;
  rejectedReason?: string;
}
