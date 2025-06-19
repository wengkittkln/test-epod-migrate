/* eslint-disable react-hooks/exhaustive-deps */
import React, {useEffect, useState, useLayoutEffect} from 'react';
import {TouchableOpacity, Image} from 'react-native';
import {useSelector, useDispatch} from 'react-redux';
import {translationString} from '../../../../Assets/translation/Translation';
import {IndexContext} from '../../../../Context/IndexContext';
import * as Constants from '../../../../CommonConfig/Constants';
import * as GeneralHelper from '../../../../Helper/GeneralHelper';
import * as JobHelper from '../../../../Helper/JobHelper';
import * as ActionHelper from '../../../../Helper/ActionHelper';
import * as OrderRealmManager from '../../../../Database/realmManager/OrderRealmManager';
import * as ActionRealmManager from '../../../../Database/realmManager/ActionRealmManager';
import * as ActionType from '../../../../Actions/ActionTypes';
import {createAction} from '../../../../Actions/CreateActions';
import BackButton from '../../../../Assets/image/icon_back_white.png';
import {ActionSyncContext} from '../../../../Context/ActionSyncContext';
import * as JobBinRealmManager from '../../../../Database/realmManager/JobBinRealmManager';
import * as JobRealmManager from '../../../../Database/realmManager/JobRealmManager';

import * as OrderItemRealmManager from '../../../../Database/realmManager/OrderItemRealmManager';

export const useCollectAction = (route, navigation) => {
  const job = route.params.job;
  const consigneeName = route.params.consigneeName;
  const trackNumModel = route.params.trackNumModel;
  const stepCode = route.params.stepCode;
  // use to define photo taking flow else it is normal collection
  const photoTaking = route.params?.photoTaking
    ? route.params.photoTaking
    : false;

  const networkModel = useSelector((state) => state.NetworkReducer);
  const locationModel = useSelector((state) => state.LocationReducer);
  const {auth, manifestData, masterData, epodRealm, EpodRealmHelper} =
    React.useContext(IndexContext);
  const {startActionSync} = React.useContext(ActionSyncContext);
  const [actionModel, setActionModel] = useState(route.params?.actionModel);
  const dispatch = useDispatch();
  const [isFoodWasteJob, setIsFoodWasteJob] = useState(false);
  const [isShowDecrypt, setIsShowDecrypt] = useState(false);
  const [decryptedConsignee, setDecryptedConsignee] = useState(consigneeName);

  useEffect(() => {
    if (isShowDecrypt) {
      dispatch({type: 'ENABLE_WATERMARK'});
    } else {
      dispatch({type: 'DISABLE_WATERMARK'});
    }
  }, [isShowDecrypt]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerStyle: {
        backgroundColor: Constants.Dark_Grey,
        shadowColor: 'transparent',
        shadowRadius: 0,
        shadowOffset: {
          height: 0,
        },
        elevation: 0,
      },
      headerLeft: () => (
        <TouchableOpacity
          style={Constants.navStyles.navButton}
          onPress={() => {
            navigation.goBack();
          }}>
          <Image source={BackButton} />
        </TouchableOpacity>
      ),
      headerRight: null,
      headerTitle: translationString.confirm_pickup,
    });
  }, [navigation]);

  useEffect(() => {}, []);

  const checkJobHaveBin = async () => {
    const isJobHaveBin = await JobBinRealmManager.isJobHaveBin(
      epodRealm,
      job.id,
    );

    return isJobHaveBin;
  };

  const getJobBinInfo = (jobId) => {
    const jobBins = JobBinRealmManager.getJobBinByJob(epodRealm, jobId);
    return jobBins;
  };

  const completeJobBinCollection = async () => {
    const step = JobHelper.getStepCode(
      job.customer,
      job.currentStepCode,
      job.jobType,
    );

    let tempOrderList = [];
    let tempOrderItemList = [];
    const orderList = await OrderRealmManager.getOrderByJodId(
      job.id,
      epodRealm,
    );

    if (orderList && orderList.length > 0) {
      orderList.map((orderModel) => {
        const tempOrderModel =
          GeneralHelper.convertRealmObjectToJSON(orderModel);
        tempOrderList.push(tempOrderModel);

        const seletedOrderItems = OrderItemRealmManager.getOrderItemsByOrderId(
          orderModel.id,
          epodRealm,
        );

        seletedOrderItems.map(async (item, index) => {
          let orderItemModel = GeneralHelper.convertRealmObjectToJSON(item);
          orderItemModel.key = index;
          tempOrderItemList.push(orderItemModel);
        });
      });
    }

    // START Update Delivery Job Quantity
    const allJobList = await JobRealmManager.getJobByTrackingNo(
      epodRealm,
      job.orderList,
    );

    const deliveryJob = allJobList.find((j) => j.jobType === 0);

    if (deliveryJob) {
      await JobBinRealmManager.updateCollectionJobBinToDeliveryJobBin(
        epodRealm,
        job.id,
        deliveryJob.id,
      );

      const deliveryJobBin = await getJobBinInfo(deliveryJob.id);

      await JobRealmManager.updateJobTotalQuantity(
        deliveryJob.id,
        deliveryJobBin.length,
        epodRealm,
      );

      const deliveryJobOrderList = await OrderRealmManager.getOrderByJodId(
        deliveryJob.id,
        epodRealm,
      );

      if (deliveryJobOrderList && deliveryJobOrderList.length > 0) {
        deliveryJobOrderList.map((orderModel) => {
          const seletedOrderItems =
            OrderItemRealmManager.getOrderItemsByOrderId(
              orderModel.id,
              epodRealm,
            );

          seletedOrderItems.map(async (item) => {
            await OrderItemRealmManager.updateOrderItemExpQuantity(
              item,
              deliveryJobBin.length,
              epodRealm,
            );
          });
        });
      }
    }
    // END Update Delivery Job Quantity

    const action = ActionHelper.generateActionModel(
      job.id,
      step.stepCode,
      1,
      locationModel,
    );
    await ActionHelper.insertCollectActionAndOrderItem(
      job,
      action,
      orderList,
      tempOrderItemList,
      epodRealm,
    );

    navigation.popToTop();
  };

  const getDecryptData = async () => {
    setDecryptedConsignee(
      !isShowDecrypt && job.decryptedConsignee?.length > 0
        ? job.decryptedConsignee
        : consigneeName,
    );

    setIsShowDecrypt((prevState) => !prevState);
  };

  return {
    job,
    consigneeName,
    trackNumModel,
    stepCode,
    actionModel,
    photoTaking,
    isFoodWasteJob,
    checkJobHaveBin,
    getJobBinInfo,
    setIsFoodWasteJob,
    completeJobBinCollection,
    isShowDecrypt,
    decryptedConsignee,
    getDecryptData,
  };
};
