import * as Actions from '../Actions/ActionTypes';
import * as Constants from '../CommonConfig/Constants';
import {translationString} from '../Assets/translation/Translation';

export interface JobList {
    filterType: number;
    isShowFilterModal: boolean;
    isRefresh: boolean;
    filterList: [
      {
        id: number,
        title: string,
      },
    ],
    filterSuccessMsg: string,
    totalJobNum: number,
    pendingJobNum: number,
    completedJobNum: number,
    failedJobNum: number,
}