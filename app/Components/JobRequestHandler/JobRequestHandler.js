import React, {useEffect, useContext} from 'react';
import {useDeltaSync} from '../../Hooks/DeltaSync/useDeltaSync';
import {useMasterData} from '../../Hooks/MasterData/useMasterData';
import {AppContext} from '../../Context/AppContext';

const JobRequestHandler = () => {
  const {callGetMasterDataApi} = useMasterData();
  const {callGetDeltaSyncApi} = useDeltaSync(
    callGetMasterDataApi,
    'JobRequestHandler',
  );
  const {setOnJobApprovedCallback} = useContext(AppContext);

  useEffect(() => {
    const handleJobRequestApproved = async () => {
      console.log('Starting delta sync after job request approval...');
      await callGetDeltaSyncApi();
      console.log('Delta sync completed after job request approval');
    };

    setOnJobApprovedCallback(() => handleJobRequestApproved);

    return () => {
      setOnJobApprovedCallback(null);
    };
  }, []);

  return null; // This component doesn't render anything
};

export default JobRequestHandler;
