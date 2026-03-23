/**
 * Phase 8.1 — Network status hook
 *
 * Returns { isConnected, isInternetReachable }.
 * Subscribes to NetInfo changes so components re-render automatically.
 */
import { useEffect, useState } from 'react';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

interface NetworkStatus {
  isConnected: boolean;
  isInternetReachable: boolean;
}

const DEFAULT: NetworkStatus = { isConnected: true, isInternetReachable: true };

export function useNetworkStatus(): NetworkStatus {
  const [status, setStatus] = useState<NetworkStatus>(DEFAULT);

  useEffect(() => {
    // Fetch once immediately
    NetInfo.fetch().then((state: NetInfoState) => {
      setStatus({
        isConnected: state.isConnected ?? true,
        isInternetReachable: state.isInternetReachable ?? true,
      });
    });

    // Subscribe to changes
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      setStatus({
        isConnected: state.isConnected ?? true,
        isInternetReachable: state.isInternetReachable ?? true,
      });
    });

    return unsubscribe;
  }, []);

  return status;
}
