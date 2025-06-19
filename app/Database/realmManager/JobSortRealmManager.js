import Realm from 'realm';
import * as Constants from '../../CommonConfig/Constants';

export const getJobSortOption = (realm, isVIP) => {
  try {
    const jobSort = realm
      .objects(Constants.JOB_SORT_SCHEMA)
      .filtered(`isVIP == $0`, isVIP)[0];
    return jobSort ? {type: jobSort.type, order: jobSort.order} : '';
  } catch (error) {
    console.error('Error getting job sort option:', error);
    return null;
  }
};

export const updateJobSortOption = (type, order, isVIP, realm) => {
  try {
    realm.write(() => {
      let jobSort = realm
        .objects(Constants.JOB_SORT_SCHEMA)
        .filtered(`isVIP == $0`, isVIP)[0];
      if (jobSort) {
        jobSort.type = type;
        jobSort.order = order;
      } else {
        realm.create(Constants.JOB_SORT_SCHEMA, {
          id: Date.now(),
          type,
          order,
          isVIP,
        });
      }
    });
  } catch (error) {
    console.error('Error updating job sort option:', error);
  }
};

export const resetJobSortOption = (realm, isVIP = null) => {
  try {
    realm.write(() => {
      if (isVIP === null) {
        realm.delete(realm.objects(Constants.JOB_SORT_SCHEMA));
      } else {
        const jobSorts = realm
          .objects(Constants.JOB_SORT_SCHEMA)
          .filtered(`isVIP == $0`, isVIP);
        realm.delete(jobSorts);
      }
    });
  } catch (error) {
    console.error('Error resetting job sort option:', error);
  }
};

export const addSortOptionListener = (realm, isVIP, callback) => {
  try {
    const jobSorts = realm
      .objects(Constants.JOB_SORT_SCHEMA)
      .filtered(`isVIP == $0`, isVIP);

    const listener = (sortOptions, changes) => {
      const currentSort = getJobSortOption(realm, isVIP);
      callback(currentSort);
    };

    jobSorts.addListener(listener);

    return {
      remove: () => {
        jobSorts.removeListener(listener);
      },
    };
  } catch (error) {
    console.error('Error setting up sort option listener:', error);

    return {
      remove: () => {},
    };
  }
};
