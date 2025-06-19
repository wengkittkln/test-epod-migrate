import { Customer } from "./Customer";
import { Error } from "./Error";

export type Job = {
    status?: number
    codAmount?: number
    jobType?: number
    destination?: string
    id: string
    consignee?: string
    trackingList?: string
    isSelected?: boolean
    customer?: Customer
    isDuplicated?: boolean
    duplicatedMessage?: string
    totalQuantity?: number
    totalCbm?: number
    remark?: string
    contact?: string
    errorModel?: Error
    orderList?: string
    orders: MarketPlaceJobList[]
}

export type MarketPlaceJobList = {
    orderNumber: string;
    trackingNo: string;
}