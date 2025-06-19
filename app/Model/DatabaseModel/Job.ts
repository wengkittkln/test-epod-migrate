import { Customer } from "../Customer";

export interface Job {
    id?: number;
    manifestId?: number;
    destination?: string;
    consignee?: string;
    contact?: string;
    requestArrivalTimeFrom?: string;
    requestArrivalTimeTo?: string;
    remark?: string;
    tags?: string;
    totalQuantity?: number;
    totalCbm?: number;
    codCurrency?: string;
    codAmount?: number;
    status?: number;
    podTime?: string;
    podLocation?: string;
    fromSystem?: string;
    createdDate?: string;
    createdBy?: string;
    lastUpdatedDate?: string;
    isDeleted?: boolean;
    customerId?: number;
    orderList?: string;
    trackingList?: string;
    currentStep?: number;
    currentStepCode?: number;
    pendingStatus?: number;
    latestActionId?: string;
    reasonDescription?: string;
    isSynced?: boolean;
    longitude?: number;
    latitude?: number;
    sequence?: number;
    jobType?: number;
    isRemoved?: boolean;
    codValue?: number;
    codReasonCode?: number;
    csPhoneNo?: string;
    jobPassword?: string;
    customer?: Customer;
  }
  
