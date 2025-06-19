import React, {useEffect, useState, useRef} from 'react';
import {useFocusEffect, useIsFocused} from '@react-navigation/native';
import moment from 'moment';
import {IndexContext} from '../../../../Context/IndexContext';
import * as OrderRealmManager from '../../../../Database/realmManager/OrderRealmManager';
import * as OrderItemRealmManager from '../../../../Database/realmManager/OrderItemRealmManager';
import * as JobRealmManager from '../../../../Database/realmManager/JobRealmManager';
import {translationString} from '../../../../Assets/translation/Translation';
import {useSelector, useDispatch} from 'react-redux';
import * as GeneralHelper from '../../../../Helper/GeneralHelper';

export const useScanSku = (route, navigation) => {
  const input = useRef(null);
  const job = route.params.job;
  const actionModel = route.params.actionModel;
  const photoTaking = route.params.photoTaking;
  const stepCode = route.params.stepCode;
  const orderList = route.params.orderList;
  const isPD = route.params?.isPD ? route.params.isPD : false;
  const {epodRealm, EpodRealmHelper} = React.useContext(IndexContext);
  const [isBarcodeScannerEnabled, setBarcodeScannerEnabled] = useState(true);
  const [orderItems, setOrderItems] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [scannedItems, setScannedItems] = useState(0);
  const [isShowModal, setIsShowModal] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalDesc, setModalDesc] = useState('');
  const [hasError, setHasError] = useState(false);
  const skuOrderItems = useSelector((state) => state.SkuReducer);
  const [isPartialDelivery, setIsPartialDelivery] = useState(isPD);
  const [isShowSkuInputModal, setIsShowSkuInputModal] = useState(false);
  const [skuInputText, setSkuInputText] = useState('');
  const [skuError, setSkuError] = useState('');

  const isInitialMount = useRef(true);

  useFocusEffect(
    React.useCallback(() => {
      setBarcodeScannerEnabled(true);

      if (isInitialMount.current) {
        // First time load - initialize data
        initValue();
        isInitialMount.current = false;
      } else {
        // When coming back from other screens - sync with Redux store
        if (skuOrderItems.orderItems && skuOrderItems.orderItems.length > 0) {
          setOrderItems(skuOrderItems.orderItems);
          const scannedCount = skuOrderItems.orderItems
            .filter((e) => e.skuCode)
            .reduce(
              (accumulator, current) =>
                accumulator + (current.scannedCount || 0),
              0,
            );
          setScannedItems(scannedCount);
        }
      }
    }, [skuOrderItems.orderItems]),
  );

  const handleBack = () => {
    navigation.goBack();
  };

  const confirmButtonOnPress = () => {
    setIsShowModal(false);
    setBarcodeScannerEnabled(true);
  };

  const detailOnPress = () => {
    navigation.navigate('ScanSkuItems', {
      orderItems: orderItems,
      job: job,
      actionModel: actionModel,
      photoTaking: photoTaking,
      stepCode: stepCode,
      orderList: orderList,
      isPD: isPD,
    });
    setBarcodeScannerEnabled(false);
  };

  const onSkipSkuClicked = () => {
    // setIsShowSkuInputModal(true);
    navigation.navigate('ManualInputSku', {
      job: job,
      orderItemsList: orderItems,
    });
    setBarcodeScannerEnabled(false);
  };

  const onCancelSkipSkuClicked = () => {
    // setIsShowSkuInputModal(false);
    setBarcodeScannerEnabled(true);
    setSkuError('');
    setSkuInputText('');
  };

  const handleScannedSku = (barcode, isShowErrorPop) => {
    let scannedItemPosition = -1;
    if (job.customer.skuRegexPatternValue) {
      const regex = new RegExp(job.customer.skuRegexPatternValue, 'gi');
      for (let i = 0; i < orderItems.length; i++) {
        const selectedItem = orderItems[i];
        const matchList = regex.exec(selectedItem.skuCode);
        console.log(
          matchList,
          selectedItem.skuCode,
          regex.exec(selectedItem.skuCode),
        );
        const allMatch = [];
        const inputBarcodeMatch = regex.exec(barcode);
        console.log('inputBarcodeMatch', regex.exec(barcode));
        if (
          matchList &&
          matchList.length &&
          inputBarcodeMatch &&
          inputBarcodeMatch.length
        ) {
          console.log(
            'emmeme',
            JSON.stringify(matchList),
            JSON.stringify(inputBarcodeMatch),
          );
          if (JSON.stringify(matchList) === JSON.stringify(inputBarcodeMatch)) {
            scannedItemPosition = i;
            break;
          }
        }
      }
    } else {
      scannedItemPosition = orderItems.findIndex(
        (orderItem) => orderItem.skuCode === barcode,
      );
    }
    let errorDescription = '';
    let errorTitle = '';
    const orderItem = orderItems[scannedItemPosition];
    let updatedScannedList = orderItems;
    if (scannedItemPosition === -1) {
      errorTitle = translationString.barcode_incorrect;
      errorDescription = translationString.please_rescan_barcode;
      setHasError(true);
    } else if (orderItem.isSkuScanned) {
      errorTitle = translationString.already_item_scanned;
      errorDescription = translationString.you_already_item_scanned;
      setHasError(true);
    } else {
      setHasError(false);
      if (isShowErrorPop) {
        setIsShowModal(true);
        setModalTitle(translationString.barcode_correct);
        setModalDesc(translationString.please_continue_scan_barcode);
      }
      orderItem.scannedCount += 1;
      console.log(
        'count',
        orderItem.scannedCount,
        orderItem.scannedCount === orderItem.quantity,
      );
      orderItem.isSkuScanned =
        orderItem.scannedCount === orderItem.quantity ? true : false;
      orderItem.scanSkuTime = moment().format();
      updatedScannedList = [
        ...orderItems.slice(0, scannedItemPosition),
        orderItem,
        ...orderItems.slice(scannedItemPosition + 1),
      ];
      setTimeout(() => {
        setBarcodeScannerEnabled(true);
      }, 3000);
    }
    const scannedCount = updatedScannedList
      .filter((e) => e.skuCode)
      .reduce((accumulator, current) => accumulator + current.scannedCount, 0);
    setScannedItems(scannedCount);
    if (errorDescription) {
      if (isShowErrorPop) {
        setModalTitle(errorTitle);
        setModalDesc(errorDescription);
        setIsShowModal(true);
      } else {
        setSkuError(errorDescription);
      }
    } else {
      setSkuInputText('');
    }
  };

  const onInputSkuConfirmClicked = (inputText) => {
    console.log('SCAN');
    handleScannedSku(inputText, false);
  };

  const handleBarcode = (barcode) => {
    if (isBarcodeScannerEnabled) {
      setBarcodeScannerEnabled(false);
      handleScannedSku(barcode, true);
    }
  };

  // useEffect(() => {
  //   setOrderItems(skuOrderItems.orderItems);
  //   const scannedCount = skuOrderItems.orderItems
  //     .filter((e) => e.skuCode)
  //     .reduce((accumulator, current) => accumulator + current.scannedCount, 0);
  //   setScannedItems(scannedCount);
  // }, [skuOrderItems.orderItems]);

  const initValue = async () => {
    if (!route.params?.orderItemList) {
      const orderList = await OrderRealmManager.getOrderByJodId(
        job.id,
        epodRealm,
      );
      if (orderList && orderList.length > 0) {
        orderList.forEach((orderModel) => {
          const seletedOrderItems =
            OrderItemRealmManager.getOrderItemsByOrderId(
              orderModel.id,
              epodRealm,
            );

          const orderItemsList = seletedOrderItems.map((item) => {
            let orderItemModel = GeneralHelper.convertRealmObjectToJSON(item);
            orderItemModel.isSkuScanned = !orderItemModel.skuCode
              ? true
              : false;
            orderItemModel.quantity = item.expectedQuantity - item.quantity;
            if (orderItemModel.quantity && orderItemModel.quantity > 0) {
              orderItemModel.expectedQuantity = orderItemModel.quantity;
            }
            orderItemModel.scannedCount =
              orderItemModel.scannedCount > 0 ? orderItemModel.scannedCount : 0;
            return orderItemModel;
          });

          const totalItemCount = orderItemsList
            .filter((e) => e.skuCode)
            .reduce(
              (accumulator, current) => accumulator + current.quantity,
              0,
            );
          setTotalItems(totalItemCount);
          setOrderItems(orderItemsList);
        });
      }
    } else {
      //order item from partial delivery
      const orderItemList = route.params?.orderItemList;
      let orderItemsList = orderItemList.map((item) => {
        let orderItemModel = GeneralHelper.convertRealmObjectToJSON(item);
        orderItemModel.isSkuScanned = !orderItemModel.skuCode ? true : false;
        return orderItemModel;
      });
      orderItemsList = orderItemsList.filter((item) => item.quantity > 0);
      const totalItemCount = orderItemsList
        .filter((e) => e.skuCode)
        .reduce((accumulator, current) => accumulator + current.quantity, 0);
      setTotalItems(totalItemCount);
      setOrderItems(orderItemsList);
    }
  };

  const onChangeSkuText = (text) => {
    setHasError(false);
    setSkuInputText(text);
    setSkuError('');
  };

  return {
    handleBarcode,
    handleBack,
    totalItems,
    scannedItems,
    confirmButtonOnPress,
    isShowModal,
    modalTitle,
    modalDesc,
    detailOnPress,
    isShowSkuInputModal,
    onSkipSkuClicked,
    onCancelSkipSkuClicked,
    onChangeSkuText,
    skuInputText,
    skuError,
    onInputSkuConfirmClicked,
    hasError,
    input,
  };
};
