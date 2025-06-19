import React, {useState, useEffect} from 'react';
import {createAction} from '../../Actions/CreateActions';
import {useSelector, useDispatch} from 'react-redux';
import * as ActionType from '../../Actions/ActionTypes';
import {translationString} from '../../Assets/translation/Translation';
import * as GeneralHelper from '../../Helper/GeneralHelper';
import * as Constants from '../../CommonConfig/Constants';

export const useAddOrderItemModal = (addOrderItem = (orderItemModel) => {}) => {
  const orderItemModel = useSelector((state) => state.AddOrderItemReducer);
  const [selectedKey, setSelectedKey] = useState(-1);
  const dispatch = useDispatch();

  const productNameOnchangeText = (text) => {
    const payload = {
      productName: text,
    };
    dispatch(createAction(ActionType.INPUT_PRODUCT_NAME, payload));
  };

  const getSelectedOptionKey = () => {
    Constants.uomList.map((uom, index) => {
      if (orderItemModel && orderItemModel.uom === uom.label) {
        setSelectedKey(index + 1);
      }
    });
  };

  const selectedOption = (option) => {
    const payload = {
      uom: option.label,
    };

    setSelectedKey(option.key);
    dispatch(createAction(ActionType.INPUT_UOM, payload));
  };

  const onQuantityTextInputOnChange = (text) => {
    let value = 0;
    if (text !== '') {
      let inputQuantity = parseInt(text);
      value = inputQuantity;
    }
    const payload = {quantity: value};
    dispatch(createAction(ActionType.INPUT_QUANTITY, payload));
  };

  const minusButtonOnPressed = () => {
    const payload = {
      quantity: orderItemModel.quantity === 0 ? 0 : orderItemModel.quantity - 1,
    };

    dispatch(createAction(ActionType.INPUT_QUANTITY, payload));
  };

  const addButtonOnPressed = () => {
    const payload = {
      quantity: orderItemModel.quantity + 1,
    };

    dispatch(createAction(ActionType.INPUT_QUANTITY, payload));
  };

  const inputValidation = () => {
    let errMsg = '';
    if (orderItemModel.description.length === 0) {
      errMsg = translationString.error_prod_name;
    } else if (orderItemModel.uom == null || orderItemModel.uom.length === 0) {
      errMsg = translationString.error_uom;
    } else if (orderItemModel.quantity <= 0) {
      errMsg = translationString.min_amount_0;
    }

    if (errMsg.length > 0) {
      return GeneralHelper.showAlertMessage(errMsg);
    } else {
      orderItemModel.expectedQuantity = orderItemModel.quantity;
      addOrderItem(orderItemModel);
    }
  };

  useEffect(() => {
    getSelectedOptionKey();
  }, []);

  return {
    orderItemModel,
    selectedKey,
    minusButtonOnPressed,
    addButtonOnPressed,
    onQuantityTextInputOnChange,
    selectedOption,
    productNameOnchangeText,
    inputValidation,
  };
};
