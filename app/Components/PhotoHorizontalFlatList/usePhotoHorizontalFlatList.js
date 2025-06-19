/* eslint-disable react-hooks/exhaustive-deps */
import React, {useState, useEffect} from 'react';
import {IndexContext} from '../../Context/IndexContext';
import {useSelector, useDispatch} from 'react-redux';

export const usePhotoHorizontalFlatList = (orderModel, job) => {
  const cameraModel = useSelector((state) => state.CameraReducer);
  const [selectedItem, setSelectedItem] = useState(null);
  const {epodRealm} = React.useContext(IndexContext);
  const dispatch = useDispatch();

  return {
    selectedItem,
    setSelectedItem,
    cameraModel,
  };
};
