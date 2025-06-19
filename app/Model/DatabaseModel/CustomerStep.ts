export interface CustomerStep {
  id?: number;
  customerId?: number;
  sequence?: number;
  actionStatus?: number;
  stepCode?: string;
  jobType?: number;
  stepNeedPhoto?: boolean;
  stepNeedScanSku?: boolean;
  stepNeedReason?: boolean;
  stepRemark?: string;
  [k: string]: unknown;
}
