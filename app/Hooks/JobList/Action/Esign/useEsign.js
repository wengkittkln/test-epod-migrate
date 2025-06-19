/* eslint-disable react-hooks/exhaustive-deps */
import React, {useState, useEffect, useRef, useLayoutEffect} from 'react';
import {TouchableOpacity, Image} from 'react-native';
import {translationString} from '../../../../Assets/translation/Translation';
import BackButton from '../../../../Assets/image/icon_back_white.png';
import * as Constants from '../../../../CommonConfig/Constants';
import * as OrderRealmManager from '../../../../Database/realmManager/OrderRealmManager';
import * as OrderItemRealmManager from '../../../../Database/realmManager/OrderItemRealmManager';
import * as PhotoRealmManager from '../../../../Database/realmManager/PhotoRealmManager';
import {IndexContext} from '../../../../Context/IndexContext';
import 'react-native-get-random-values';
import {v4 as uuidv4} from 'uuid';
import * as RootNavigation from '../../../../rootNavigation';
import * as OrderItemHelper from '../../../../Helper/OrderItemHelper';
import * as OrderHelper from '../../../../Helper/OrderHelper';
import * as GeneralHelper from '../../../../Helper/GeneralHelper';
import * as JobRealmManager from '../../../../Database/realmManager/JobRealmManager';
import ImageMarker, {ImageFormat, Position} from 'react-native-image-marker';
import moment from 'moment';
import {captureRef} from 'react-native-view-shot';

export const useEsign = (route, navigation) => {
  const job = route.params.job;
  const action = route.params.action;
  const stepCode = route.params.stepCode;
  const isPD = route.params?.isPD ? route.params.isPD : false;

  // use to define photo taking flow else it is normal flow
  const photoTaking = route.params?.photoTaking
    ? route.params.photoTaking
    : false;

  const {epodRealm, EpodRealmHelper} = React.useContext(IndexContext);

  const ref = useRef();
  const signatureWithOrderNumberRef = useRef();
  const signatureRef = useRef();
  const [orderItemList, setOrderItemList] = useState([]);
  const [orderList, setOrderList] = useState([]);
  const [quantity, setQuantity] = useState(0);
  const [totalCOD, setTotalCOD] = useState('-');
  const [orderNumber, setOrderNumber] = useState('');

  const [isModalVisible, setModalVisible] = useState(false);
  const [checkBoxStatus, setCheckBoxStatus] = useState(false);
  const [isSigned, setSigned] = useState(false);
  const [isNextButtonOnPressed, setIsNextButtonOnPressed] = useState(false);
  const [actionAttachmentModel, setActionAttachmentModel] = useState(null);
  const [actionDocSignAttachmentModel, setDocSignActionAttachmentModel] =
    useState(null);

  useEffect(() => {
    //delete pending photo
    PhotoRealmManager.deleteAllPendingSelectPhotoDataExcptCurrentAction(
      epodRealm,
      action.guid,
    );

    if (route.params?.orderList && route.params?.orderItemList) {
      setOrderNumber(route.params?.job.orderList);
      setOrderList(route.params?.orderList);
      setOrderItemList(route.params?.orderItemList);
    } else {
      let selectedOrderByJobId = OrderRealmManager.getOrderByJodId(
        job.id,
        epodRealm,
      );

      if (selectedOrderByJobId.length > 0) {
        setOrderNumber(
          selectedOrderByJobId.map((order) => order.orderNumber).join(', '),
        );
      }

      setOrderList(selectedOrderByJobId);
      let list = [];
      let normalSku = [];
      let expensiveSku = [];
      let containerSku = [];

      if (selectedOrderByJobId) {
        selectedOrderByJobId.map((item) => {
          let seletedOrderItems = OrderItemRealmManager.getOrderItemsByOrderId(
            item.id,
            epodRealm,
          );

          seletedOrderItems = seletedOrderItems.filter(() => true);

          seletedOrderItems.map((itemModel) => {
            let orderItemModel =
              GeneralHelper.convertRealmObjectToJSON(itemModel);

            orderItemModel.quantity =
              itemModel.expectedQuantity - itemModel.quantity;

            orderItemModel.expectedQuantity = orderItemModel.quantity;

            if (orderItemModel.isExpensive === true) {
              expensiveSku.push(orderItemModel);
            } else {
              normalSku.push(orderItemModel);
            }
          });
        });
      }

      let selectedContainer = JobRealmManager.getJobContainersByJobId(
        job.id,
        epodRealm,
      );

      if (selectedContainer && selectedContainer.length > 0) {
        selectedContainer.map((itemModel) => {
          let containerItemModel =
            GeneralHelper.convertRealmObjectToJSON(itemModel);

          containerItemModel.quantity =
            itemModel.expectedQuantity - itemModel.quantity;

          containerItemModel.expectedQuantity = containerItemModel.quantity;

          containerSku.push(containerItemModel);
        });
      }

      if (expensiveSku) {
        list.push(...expensiveSku);
      }

      if (containerSku) {
        list.push(...containerSku);
      }

      list.push(...normalSku);

      if (list) {
        setOrderItemList(list);
      }
    }
  }, []);

  useEffect(() => {
    getQuantity();
  }, [orderItemList]);

  useEffect(() => {
    getTotalCOD();
  }, [orderList]);

  useEffect(() => {
    if (isNextButtonOnPressed && actionAttachmentModel) {
      setIsNextButtonOnPressed(false);
      gotoEsignConfirm();
    }
  }, [isNextButtonOnPressed, orderItemList, actionAttachmentModel]);

  const clearButtonOnPressed = () => {
    setSigned(false);
    ref.current.resetImage();
  };

  const nextButtonOnPressed = async () => {
    try {
      await deleteEsignPhoto();
      const signatureUri = await captureRef(signatureRef, {
        result: 'base64',
        quality: 1,
      });

      const signatureAttachment = createActionAttachment(
        signatureUri,
        Constants.SourceType.ESIGNATURE_WITHOUT_ORDER_NUMBER,
      );
      await savePhotoToDb(signatureAttachment);
      setDocSignActionAttachmentModel(signatureAttachment);

      const signatureWithOrderNumberUri = await captureRef(
        signatureWithOrderNumberRef,
        {
          result: 'base64',
          quality: 1,
        },
      );

      const signatureWithOrderNumberAttachment = createActionAttachment(
        signatureWithOrderNumberUri,
        Constants.SourceType.ESIGNATURE,
      );

      await savePhotoToDb(signatureWithOrderNumberAttachment);
      setActionAttachmentModel(signatureWithOrderNumberAttachment);

      setIsNextButtonOnPressed(true);
    } catch (error) {
      console.error('Oops, snapshot failed', error);
    }
  };

  const createActionAttachment = (uri, source) => ({
    jobId: job.id,
    actionId: action.guid,
    uuid: uuidv4(),
    filePath: `data:image/png;base64,${uri}`,
    syncStatus: Constants.SyncStatus.PENDING_SELECT_PHOTO,
    source,
    createDate: moment().format(),
  });

  const handleSignature = async (_) => {
    // captureRef(signatureWithOrderNumberRef, {
    //   result: 'base64',
    //   quality: 1,
    // }).then(
    //   async (uri) => {
    //     const actionAttachment = {
    //       jobId: job.id,
    //       actionId: action.guid,
    //       uuid: uuidv4(),
    //       filePath: 'data:image/png;base64,' + uri,
    //       syncStatus: Constants.SyncStatus.PENDING_SELECT_PHOTO,
    //       source: Constants.SourceType.ESIGNATURE,
    //       createDate: moment().format(),
    //     };
    //     await deleteEsignPhoto();
    //     await savePhotoToDb(actionAttachment);
    //     setActionAttachmentModel(actionAttachment);
    //     setIsNextButtonOnPressed(true);
    //   },
    //   (error) => console.error('Oops, snapshot failed', error),
    // );
  };

  const gotoEsignConfirm = () => {
    setSigned(false);
    setCheckBoxStatus(false);
    navigation.navigate('EsignConfirm', {
      job: job,
      orders: orderList,
      orderItemList: orderItemList,
      action: action,
      actionAttachment: actionAttachmentModel,
      actionDocSignAttachment: actionDocSignAttachmentModel,
      stepCode: stepCode,
      totalActualCodAmt: route.params?.totalActualCodAmt,
      photoTaking: photoTaking,
      verificationMethod: route.params?.verificationMethod,
      isPD: isPD,
    });
  };

  const handleEmpty = () => {
    alert(translationString.empty_sign_error);
  };

  const getQuantityText = (isCollect = false) => {
    let title = translationString.formatString(
      translationString.total_delivery,
      quantity,
    );

    return title;
  };

  const getTotalCOD = () => {
    const result = route.params?.totalActualCodAmt
      ? route.params?.totalActualCodAmt
      : OrderHelper.getTotalCOD(orderList);
    setTotalCOD(result);

    return result;
  };

  const getTotalCODText = () => {
    return totalCOD;
  };

  const getQuantity = () => {
    const result = OrderItemHelper.getQuantity(orderItemList);
    setQuantity(result);
  };

  const viewOrderItem = () => {
    showHideDialog(true);
  };

  const showHideDialog = (visible) => {
    setModalVisible(visible);
  };

  const closeDialog = () => {
    showHideDialog(false);
  };

  const deleteEsignPhoto = async () => {
    try {
      await PhotoRealmManager.deletePendingSelectSignaturePhotoByAction(
        epodRealm,
        action.guid,
      );
    } catch (error) {
      console.log('deleteEsignPhoto: ' + error);
    }
  };

  const savePhotoToDb = async (photoModel) => {
    try {
      await PhotoRealmManager.insertNewPhotoData(photoModel, epodRealm);
    } catch (error) {
      alert('Add Photo Error: ' + error);
    }
  };

  const navigateTermAndCondition = () => {
    navigation.navigate('TermNCondition', {
      job: job,
    });
  };

  const checkBoxPressed = () => {
    setCheckBoxStatus(!checkBoxStatus);
  };

  const handleEnd = () => {
    setSigned(true);
  };

  useLayoutEffect(() => {
    navigation.setOptions({
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
      headerTitle: translationString.e_sign_title,
    });
  }, [navigation]);

  return {
    ref,
    signatureWithOrderNumberRef,
    signatureRef,
    isModalVisible,
    orderList,
    orderItemList,
    quantity,
    checkBoxStatus,
    isSigned,
    orderNumber,
    clearButtonOnPressed,
    nextButtonOnPressed,
    handleSignature,
    handleEmpty,
    getQuantityText,
    getTotalCODText,
    viewOrderItem,
    closeDialog,
    navigateTermAndCondition,
    checkBoxPressed,
    handleEnd,
  };
};
