import * as Actions from '../../Actions/ActionTypes';
import * as Constants from '../../CommonConfig/Constants';
import {translationString} from '../../Assets/translation/Translation';

const initialState = {
  filterType: Constants.JobType.ALL,
  isShowFilterModal: false,
  isRefresh: false,
  filterList: [
    {
      id: Constants.JobType.ALL,
      title: translationString.all,
    },
    {
      id: Constants.JobType.DELIVERY,
      title: translationString.in_progress,
    },
    {
      id: Constants.JobType.PICK_UP,
      title: translationString.in_progress_pick_up,
    },
  ],
  filterSuccessMsg: '',
  totalJobNum: 0,
  pendingJobNum: 0,
  completedJobNum: 0,
  failedJobNum: 0,
};

const JobListReducer = (state = initialState, action) => {
  switch (action.type) {
    case Actions.UPDATE_JOBLIST_FILTER_TYPE:
      return {
        ...state,
        filterType: action.payload.filterType,
      };
    case Actions.SET_JOBLIST_REFRESH:
      return {
        ...state,
        isRefresh: action.payload.isRefresh,
      };
    case Actions.SET_IS_SHOW_FILTER_MODAL:
      return {
        ...state,
        isShowFilterModal: action.payload.isShowFilterModal,
      };
    case Actions.SET_FILTER_SUCCESS_MSG:
      return {
        ...state,
        filterSuccessMsg: action.payload.filterSuccessMsg,
      };
    case Actions.SET_TOTAL_JOB_NUM:
      return {
        ...state,
        totalJobNum: action.payload.totalJobNum,
      };
    case Actions.SET_PENDING_JOB_NUM:
      return {
        ...state,
        pendingJobNum: action.payload.pendingJobNum,
      };
    case Actions.SET_COMPLETED_JOB_NUM:
      return {
        ...state,
        completedJobNum: action.payload.completedJobNum,
      };
    case Actions.SET_FAILED_JOB_NUM:
      return {
        ...state,
        failedJobNum: action.payload.failedJobNum,
      };
    case Actions.JOBLIST_FILTER_TYPE_RESET:
      return initialState;
    default:
      return state;
  }
};
export default JobListReducer;
