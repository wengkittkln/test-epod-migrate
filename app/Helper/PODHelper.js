import React, {useEffect} from 'react';
import {Alert} from 'react-native';
import * as OrderRealmManager from './../Database/realmManager/OrderRealmManager';
import * as ActionRealmManager from './../Database/realmManager/ActionRealmManager';
import * as JobRealmManager from './../Database/realmManager/JobRealmManager';
import * as OrderItemRealmManager from './../Database/realmManager/OrderItemRealmManager';
import {v4 as uuidv4} from 'uuid';
import * as ActionHelper from './ActionHelper';
import * as PhotoHelper from './PhotoHelper';
import * as JobHelper from './JobHelper';
import {IndexContext} from '../Context/IndexContext';
import {translationString} from './../Assets/translation/Translation';
import * as Constants from '../CommonConfig/Constants';
import {addEventLog} from '../Helper/AnalyticHelper';

export const PODHelper = () => {
  const {epodRealm, EpodRealmHelper} = React.useContext(IndexContext);

  const batchJobActionMapper = async (
    jobId,
    mainAction,
    stepCode,
    batchJob,
    photoTaking,
    isScanSKU = false,
    orderList = null,
    jobAdditionalParamJson = '',
    phoneNum = '',
  ) => {
    let createdActionList = [];
    let isBatchJobUpdated = true;
    const consolidateGUID = uuidv4();

    for (let i of batchJob) {
      if (!isBatchJobUpdated) {
        continue;
      }

      const tempAction = JSON.parse(JSON.stringify(mainAction));
      const bkJob = JSON.parse(JSON.stringify(i));

      if (jobAdditionalParamJson) {
        i.additionalParamJson = jobAdditionalParamJson;
      }

      if (phoneNum && i.contact !== phoneNum) {
        tempAction.remark = `phone number: ${phoneNum}`;
      }

      let batchJobOrderList = [];
      if (orderList && orderList.length > 0) {
        batchJobOrderList = orderList.filter((x) => x.jobId === i.id);
      } else {
        batchJobOrderList = await OrderRealmManager.getOrderByJodId(
          i.id,
          epodRealm,
        );
      }

      tempAction.remark = `Job consolidation guid: ${consolidateGUID} ;${
        tempAction.remark ?? ''
      }`;

      if (i.id !== jobId) {
        tempAction.jobId = i.id;
        tempAction.guid = uuidv4();
        if (batchJobOrderList && batchJobOrderList.length > 0) {
          tempAction.orderId = batchJobOrderList[0].id;
        }
      }

      const _isExist = await ActionHelper.checkForExsitingAction(
        tempAction,
        epodRealm,
      );

      if (!_isExist) {
        ActionRealmManager.insertNewAction(tempAction, epodRealm);
      }

      const orderItems = [];
      if (batchJobOrderList && batchJobOrderList.length > 0 && isScanSKU) {
        for (const order of batchJobOrderList) {
          let seletedOrderItems = OrderItemRealmManager.getOrderItemsByOrderId(
            order.id,
            epodRealm,
          );
          orderItems.push(...seletedOrderItems);
        }

        await ActionHelper.insertScanSkuActionAction(
          tempAction,
          orderItems,
          epodRealm,
        );
      }

      isBatchJobUpdated = await updateJobInLocalDb(
        i,
        stepCode,
        tempAction,
        true,
      );

      if (!isBatchJobUpdated) {
        JobRealmManager.updateJobData(bkJob, epodRealm);
        Alert(
          translationString.formatString(
            translationString.batchPODPartialyCompleted,
            i.id,
          ),
        );
      } else {
        createdActionList.push(tempAction);
        if (
          stepCode === Constants.StepCode.SIMPLE_POD &&
          tempAction.actionType === Constants.ActionType.POD_SUCCESS
        ) {
          addEventLog('simple_pod', {
            podData: `${JSON.stringify(
              tempAction,
            )}; orderCount: ${batchJobOrderList.length.toString()}`,
          });
        }
      }
    }
    if (photoTaking) {
      await cloneMainActionPhotoToBatchActions(mainAction, createdActionList);
    }

    return {createdActionList};
  };

  const updateJobInLocalDb = async (
    jobModel,
    currentStepCode,
    actionModel,
    isSuccess,
  ) => {
    try {
      JobHelper.updateJob(
        jobModel,
        currentStepCode,
        actionModel,
        isSuccess,
        epodRealm,
      );

      // JobHelper.updateJobWithExceptionReason(
      //   jobModel.id,
      //   actionModel,
      //   currentStepCode,
      //   epodRealm,
      // );

      return true;
    } catch (error) {
      alert('Update Job Error: ' + error);
      return false;
    }
  };

  const cloneMainActionPhotoToBatchActions = async (
    mainAction,
    batchActions,
  ) => {
    if (mainAction) {
      await PhotoHelper.updatePhotoSyncStatusByActionAndCloneToBatchAction(
        mainAction,
        batchActions,
        epodRealm,
      );
    }
  };

  useEffect(() => {
    if (epodRealm.isClosed) {
      EpodRealmHelper.setEpodRealm();
    }
  }, [EpodRealmHelper, epodRealm]);

  return {batchJobActionMapper};
};
