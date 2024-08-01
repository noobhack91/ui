import { useEffect } from 'react';
import { useInterval } from '../hooks/useInterval';
import { getAppDescriptor } from './appService';
import { BahmniConstants } from '../utils/constants/BahmniConstants';

declare const Offline: any;

const useOfflineStatusService = () => {
    const checkOfflineStatus = () => {
        if (Offline.state === 'up') {
            Offline.check();
        }
    };

    const setOfflineOptions = () => {
        const networkConnectivity = getAppDescriptor().getConfigValue("networkConnectivity");
        const showNetworkStatusIndicator = networkConnectivity != null ? networkConnectivity.showNetworkStatusMessage : null;
        let intervalFrequency = networkConnectivity != null ? networkConnectivity.networkStatusCheckInterval : null;
        intervalFrequency = intervalFrequency ? intervalFrequency : 5000;

        Offline.options = {
            game: true,
            checkOnLoad: true,
            checks: { xhr: { url: BahmniConstants.faviconUrl } }
        };

        checkOfflineStatus();

        useInterval(() => {
            checkOfflineStatus();
        }, intervalFrequency);

        if (showNetworkStatusIndicator === false) {
            document.querySelectorAll('.offline-ui').forEach(element => {
                element.setAttribute('style', 'display: none');
            });
        }
    };

    useEffect(() => {
        setOfflineOptions();

        return () => {
            // Cleanup if necessary
        };
    }, []);
};

export default useOfflineStatusService;
