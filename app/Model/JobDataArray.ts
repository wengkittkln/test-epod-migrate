import { Job } from "./Job";

export type JobDataArray = {
    dataArray: Job[],
    errorArray: Job[],
    total: number,
    skip: number,
    filterCountList: string,
    countStatus: string,
    isSuccess: boolean
}