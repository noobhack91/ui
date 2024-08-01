import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { getAppDescriptor, getAllByTag, updateSession } from '../services/appService';
import { getCookie, setCookie } from '../utils/cookieUtils';
import { BahmniConstants } from '../utils/constants/BahmniConstants';
import { Spinner } from 'react-bootstrap';

const DashboardController: React.FC = () => {
    const [appExtensions, setAppExtensions] = useState<any[]>([]);
    const [selectedLocationUuid, setSelectedLocationUuid] = useState<string | null>(null);
    const [locations, setLocations] = useState<any[]>([]);
    const history = useHistory();

    useEffect(() => {
        const init = async () => {
            const loginLocations = localStorage.getItem("loginLocations");
            if (loginLocations) {
                setLocations(JSON.parse(loginLocations));
                setCurrentLoginLocationForUser();
                return;
            }
            try {
                const response = await getAllByTag("Login Location");
                setLocations(response.data.results);
                setCurrentLoginLocationForUser();
            } catch (error) {
                console.error('Error fetching locations:', error);
            }
        };

        const setCurrentLoginLocationForUser = () => {
            const currentLoginLocation = getCurrentLocation();
            if (currentLoginLocation) {
                setSelectedLocationUuid(currentLoginLocation.uuid);
            } else {
                setSelectedLocationUuid(null);
            }
        };

        const getCurrentLocation = () => {
            return getCookie(BahmniConstants.locationCookieName) ? getCookie(BahmniConstants.locationCookieName) : null;
        };

        const isOnline = () => {
            return window.navigator.onLine;
        };

        const isVisibleExtension = (extension: any) => {
            return extension.exclusiveOnlineModule ? isOnline() : extension.exclusiveOfflineModule ? !isOnline() : true;
        };

        setAppExtensions(getAppDescriptor().getExtensions("link") || []);
        init();
    }, []);

    const getLocationFor = (uuid: string) => {
        return locations.find(location => location.uuid === uuid);
    };

    const isCurrentLocation = (location: any) => {
        const currentLocation = getCurrentLocation();
        if (currentLocation) {
            return currentLocation.uuid === location.uuid;
        } else {
            return false;
        }
    };

    const onLocationChange = async () => {
        const selectedLocation = getLocationFor(selectedLocationUuid!);
        try {
            await updateSession({ name: selectedLocation.display, uuid: selectedLocation.uuid }, null);
            window.location.reload();
        } catch (error) {
            console.error('Error updating session:', error);
        }
    };

    const changePassword = () => {
        history.push('/changePassword');
    };

    return (
        <div>
            <Spinner animation="border" role="status">
                <span className="sr-only">Loading...</span>
            </Spinner>
            {/* Render the rest of the component UI here */}
        </div>
    );
};

export default DashboardController;
