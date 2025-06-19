import {useState, useEffect, useCallback} from 'react';
import {getJobsUnreadChatCount} from '../../ApiController/ApiController';
import {useSelector} from 'react-redux';

/**
 * Hook to manage unread chat counts for jobs
 * @returns {Object} Hook methods and state
 */
export const useUnreadChatCount = () => {
  const [unreadCounts, setUnreadCounts] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const networkModel = useSelector((state) => state.NetworkReducer);

  /**
   * Fetch unread chat counts for a list of job IDs
   * @param {Array<number>} jobIds - Array of job IDs to fetch unread counts for
   */
  const fetchUnreadCounts = useCallback(
    async (jobIds) => {
      // Don't fetch if no network connection
      if (!networkModel.isConnected) {
        return;
      }

      // Don't fetch if no job IDs or empty array
      if (!jobIds || jobIds.length === 0) {
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const response = await getJobsUnreadChatCount(jobIds);

        if (response && response.data) {
          // Convert array to object with jobId as key for easier lookup
          const countsMap = {};
          response.data.forEach((item) => {
            countsMap[item.jobId] = item.unreadCount;
          });

          setUnreadCounts((prev) => ({
            ...prev,
            ...countsMap,
          }));
        }
      } catch (err) {
        console.error('Error fetching unread chat counts:', err);
        setError(err);
      } finally {
        setIsLoading(false);
      }
    },
    [networkModel.isConnected],
  );

  /**
   * Get unread count for a specific job
   * @param {number} jobId - Job ID to get unread count for
   * @returns {number} Unread count for the job (0 if not found)
   */
  const getUnreadCount = useCallback(
    (jobId) => {
      return unreadCounts[jobId] || 0;
    },
    [unreadCounts],
  );

  /**
   * Mark a job's messages as read in the local state
   * @param {number} jobId - Job ID to mark as read
   */
  const markAsRead = useCallback((jobId) => {
    setUnreadCounts((prev) => ({
      ...prev,
      [jobId]: 0,
    }));
  }, []);

  /**
   * Reset all unread counts
   */
  const resetUnreadCounts = useCallback(() => {
    setUnreadCounts({});
  }, []);

  return {
    unreadCounts,
    isLoading,
    error,
    fetchUnreadCounts,
    getUnreadCount,
    markAsRead,
    resetUnreadCounts,
  };
};
