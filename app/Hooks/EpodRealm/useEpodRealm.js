import React, {useEffect, useState, useRef} from 'react';
import * as EpodRealmManager from '../../Database/realmManager/index';
import * as ManifestRealmManager from '../../Database/realmManager/ManifestRealmManager';
import * as GeneralHelper from '../../Helper/GeneralHelper';
import {sha256} from 'react-native-sha256';
import EncryptedStorage from 'react-native-encrypted-storage';
import {v4 as uuidv4} from 'uuid';

export const useEpodRealm = () => {
  const epodRealm = useRef();
  const [keyHash, setKeyHash] = useState('');
  const [manifestData, setManifestData] = useState({});
  const [masterData, setMasterData] = useState([]);

  const getUUId = async () => {
    // const value = await retrieveUUID();
    // const keyHashValue = await sha256(value);
    // setKeyHash(keyHash);
    if (epodRealm.current !== undefined) {
      if (epodRealm.current.isClosed) {
        EpodRealmHelper.setEpodRealm();
      } else {
        try {
          let manisfest = ManifestRealmManager.queryAllManifestData(
            epodRealm.current,
          );
          if (manisfest && manisfest.length > 0) {
            let manifestModel = GeneralHelper.convertRealmObjectToJSON(
              manisfest[0],
            );
            setManifestData(manifestModel);
          }
        } catch (error) {
          alert('Get manifest data error: ' + error);
        }
      }
      return epodRealm.current;
    } else {
      const realm = EpodRealmManager.getNewEpodRealm();
      epodRealm.current = realm;
      try {
        let manisfest = ManifestRealmManager.queryAllManifestData(realm);
        if (manisfest && manisfest.length > 0) {
          let manifestModel = GeneralHelper.convertRealmObjectToJSON(
            manisfest[0],
          );
          setManifestData(manifestModel);
        }
      } catch (error) {
        alert('Get manifest data error: ' + error);
      }
      return realm;
    }
  };

  // useEffect(() => {
  //   getUUId();
  // }, [EpodRealmHelper, epodRealm]);

  async function storeUUID(uuid) {
    try {
      await EncryptedStorage.setItem('uuid', uuid);
    } catch (error) {
      // There was an error on the native side
      alert(error);
    }
  }

  async function retrieveUUID() {
    let value = '';
    try {
      const session = await EncryptedStorage.getItem('uuid');
      if (session && session !== undefined) {
        value = session;
      } else {
        const uuid = uuidv4();
        storeUUID(uuid);
        value = uuid;
      }
    } catch (error) {}
    return value;
  }

  const EpodRealmHelper = React.useMemo(
    () => ({
      setEpodRealm: async () => {
        if (!epodRealm.current || epodRealm.current.isClosed) {
          const realm = EpodRealmManager.getNewEpodRealm();
          epodRealm.current = realm;
          // setEpodRealm(EpodRealmManager.getNewEpodRealm(keyHash));
        }
      },
      closeEpodRealm: async () => {
        if (epodRealm.current && !epodRealm.current.isClosed) {
          epodRealm.current.close();
        }
      },
      updateManifestData: async (manifestModel) => {
        setManifestData(manifestModel);
      },
      updateMasterData: async (masterDatatModel) => {
        setMasterData(masterDatatModel);
      },
    }),
    [epodRealm.current],
  );

  return {
    epodRealm,
    manifestData,
    masterData,
    EpodRealmHelper,
    getUUId,
  };
};
