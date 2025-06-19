import React, {useState} from 'react';
import * as JobBinRealmManager from '../../../Database/realmManager/JobBinRealmManager';
import {IndexContext} from '../../../Context/IndexContext';
import 'react-native-get-random-values';
import {ToastMessageMultiLine} from '../../../Components/Toast/ToastMessage';
import {translationString} from '../../../Assets/translation/Translation';
import * as ActionHelper from '../../../Helper/ActionHelper';
import * as JobHelper from '../../../Helper/JobHelper';
import {useSelector} from 'react-redux';
import * as OrderItemRealmManager from '../../../Database/realmManager/OrderItemRealmManager';
import * as OrderRealmManager from '../../../Database/realmManager/OrderRealmManager';
import * as GeneralHelper from '../../../Helper/GeneralHelper';
import {ToastMessageErrorMultiLine} from '../../../Components/Toast/ToastMessage';

export const useJobBinManagement = (route, navigation) => {
  const {epodRealm} = React.useContext(IndexContext);
  const locationModel = useSelector((state) => state.LocationReducer);
  const [job, setJobInfo] = useState(
    route.params.job
      ? route.params.job
      : {id: 0, consignee: '', destination: ''},
  );
  const sku = route.params.skuId
    ? `${route.params.sku}_${route.params.skuId}`
    : route.params.sku;
  const option = route.params.option;
  const mode = route.params.mode ? route.params.mode : '';

  const saveBinInformation = async (
    weight,
    netWeight,
    isWithBin,
    isSubmit = false,
    isBinExist = false,
    existingBinId = 0,
  ) => {
    const isBinExistInAnotherJob =
      await JobBinRealmManager.isBinDuplicateWithOtherJob(
        epodRealm,
        job.id,
        sku,
      );

    if (isBinExistInAnotherJob) {
      ToastMessageErrorMultiLine({
        text1: translationString.binSubmitFail,
        text1NumberOfLines: 3,
      });
      return;
    }

    const orderList = await OrderRealmManager.getOrderByJodId(
      job.id,
      epodRealm,
    );
    const order = orderList[0];
    const orderItemList = await OrderItemRealmManager.getOrderItemsByOrderId(
      order.id,
      epodRealm,
    );

    const orderItem = orderItemList[0];

    const successMessage = isBinExist
      ? translationString.binUpdateSuccess
      : translationString.binSubmitSuccess;

    if (isBinExist) {
      const existingBinInfo = {
        id: existingBinId,
        weight: Number(weight),
        netWeight: Number(netWeight),
        isReject: Number(false),
        withBin: isWithBin,
      };
      JobBinRealmManager.updateJobBin(epodRealm, existingBinInfo);
    } else {
      const data = await JobBinRealmManager.getAllJobBin(epodRealm);
      const newBinInfo = {
        id: data.length,
        jobId: job.id,
        bin: sku,
        weight: Number(weight),
        netWeight: Number(netWeight),
        withBin: isWithBin,
      };

      JobBinRealmManager.insertNewItem(newBinInfo, epodRealm);
      const newJobBinList = JobBinRealmManager.getJobBinByJob(
        epodRealm,
        job.id,
      );
      await OrderItemRealmManager.updateOrderItemQuantity(
        orderItem,
        newJobBinList.length,
        epodRealm,
      );
    }

    ToastMessageMultiLine({
      text1: successMessage,
      text1NumberOfLines: 3,
    });

    setTimeout(() => {
      if (isSubmit) {
        navigation.popToTop();
      } else {
        navigation.navigate('JobWeightCaptureManualEnter', {
          job,
          option: option,
        });
      }
    }, 1000);
  };

  const onRejectBin = (reason, binId, isSubmit) => {
    if (isSubmit) {
      JobBinRealmManager.rejectJobBin(epodRealm, binId, 1, reason);
      navigation.navigate('FailureSummaryScreen', {
        job: job,
        option: 'fail',
      });
    } else {
      JobBinRealmManager.rejectJobBin(epodRealm, binId, 1, reason);
      navigation.navigate('JobWeightCaptureManualEnter', {
        job: job,
        option: 'fail',
      });
    }
  };

  const checkIsBinExist = () => {
    return JobBinRealmManager.isJobBinExist(epodRealm, job.id, sku);
  };

  const getBinInformation = () => {
    return JobBinRealmManager.getJobBinByBin(epodRealm, sku, job.id);
  };

  const getJobIdBySku = async () => {
    const binList = await JobBinRealmManager.getJobBinBySku(epodRealm, sku);
    if (binList.length > 0) {
      const jobId = binList[0].jobId;
      return jobId;
    }

    return 0;
  };

  const getAllRejectBinInformation = async () => {
    const rejectedBinList = await JobBinRealmManager.getRejectedJobBinByJobId(
      epodRealm,
      job.id,
    );

    return rejectedBinList.map((data) => ({
      id: data.id,
      sku: data.bin,
      weight: data.weight,
      reason: data.rejectedReason,
    }));
  };

  const jobBinPartialDelivery = async (isPartialDelivery) => {
    const step = JobHelper.getStepCode(
      job.customer,
      job.currentStepCode,
      job.jobType,
    );

    const tempOrderList = [];
    const tempOrderItemList = [];
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

        seletedOrderItems.map((item, index) => {
          let orderItemModel = GeneralHelper.convertRealmObjectToJSON(item);
          orderItemModel.key = index;
          tempOrderItemList.push(orderItemModel);
        });
      });
    }

    const action = ActionHelper.generateActionModel(
      job.id,
      step.stepCode,
      0,
      locationModel,
    );

    if (isPartialDelivery) {
      await ActionHelper.insertPartialDeliveryActionAndOrderItem(
        job,
        action,
        orderList,
        tempOrderItemList,
        epodRealm,
      );
    } else {
      await ActionHelper.insertFailDeliveryActionForJobBin(
        job,
        action,
        orderList,
        tempOrderItemList,
        epodRealm,
      );
    }

    navigation.popToTop();
  };

  const isJobBinExceedExpectedQuantity = () => {
    if (!job) {
      return false;
    }

    const expectedQuantity = job.totalQuantity;
    const savedJobBinQuantity = JobBinRealmManager.getJobBinQuantityByJob(
      epodRealm,
      job.id,
    );

    return savedJobBinQuantity >= expectedQuantity;
  };

  return {
    job,
    sku,
    option,
    mode,
    saveBinInformation,
    getBinInformation,
    checkIsBinExist,
    onRejectBin,
    getAllRejectBinInformation,
    setJobInfo,
    getJobIdBySku,
    jobBinPartialDelivery,
    isJobBinExceedExpectedQuantity,
  };
};
