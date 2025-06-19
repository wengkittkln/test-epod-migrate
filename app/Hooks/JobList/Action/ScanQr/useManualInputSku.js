import React, {useEffect, useState, useRef} from 'react';
import moment from 'moment';
import {translationString} from '../../../../Assets/translation/Translation';
import {useSelector, useDispatch} from 'react-redux';
import * as ActionType from '../../../../Actions/ActionTypes';
import {createAction} from '../../../../Actions/CreateActions';


export const useManualInputSku = (route, navigation) => {
  const input = useRef(null);
  const job = route.params.job;
  const orderItemsList = route.params.orderItemsList;
  const [orderItems, setOrderItems] = useState([]);
  const [hasError, setHasError] = useState(false);
  const [skuInputText, setSkuInputText] = useState('');
  const [skuError, setSkuError] = useState('');
  const dispatch = useDispatch();

  const onCancelSkipSkuClicked = () => {
    navigation.goBack();
  };

  const handleScannedSku = (barcode) => {
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
      }, 3000);

      const payload = {
        orderItems: orderItems
      };
     dispatch(createAction(ActionType.UPDATE_SKU_ORDER_ITEMS, payload));
    }

    if (errorDescription) {
      setSkuError(errorDescription);      
    } else {
      setSkuInputText('');
    }
  };

  const onInputSkuConfirmClicked = (inputText) => {
    console.log('SCAN');
    handleScannedSku(inputText);
  };


  const initValue = async () => { 
      setOrderItems(orderItemsList);
  };

  const onChangeSkuText = (text) => {
    setHasError(false);
    setSkuInputText(text);
    setSkuError('');
  };

  useEffect(() => {
    initValue();
  }, []);

  return {
    onCancelSkipSkuClicked,
    skuInputText,
    skuError,
    onChangeSkuText,
    onInputSkuConfirmClicked,
    hasError,
    input,
  };
};
