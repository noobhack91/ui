import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getProviderService, getLocationService, getRetrospectiveEntryService } from '../services';
import { getDateWithoutTime, today, formatDateWithoutTime } from '../utils/dateUtil';
import { getCookie, setCookie, removeCookie } from '../utils/cookieUtil';
import { BahmniConstants } from '../utils/constants';
import { Dialog } from 'react-bootstrap';

const PatientListHeaderController: React.FC = () => {
    const { t } = useTranslation();
    const [maxStartDate, setMaxStartDate] = useState(getDateWithoutTime(today()));
    const [selectedProvider, setSelectedProvider] = useState<any>({});
    const [selectedLocationUuid, setSelectedLocationUuid] = useState<any>({});
    const [encounterProvider, setEncounterProvider] = useState<any>(null);
    const [locations, setLocations] = useState<any[]>([]);
    const [date, setDate] = useState<Date | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);

    const retrospectivePrivilege = BahmniConstants.retrospectivePrivilege;
    const locationPickerPrivilege = BahmniConstants.locationPickerPrivilege;
    const onBehalfOfPrivilege = BahmniConstants.onBehalfOfPrivilege;

    const getProviderList = (searchAttrs: any) => {
        return getProviderService().search(searchAttrs.term);
    };

    const getProviderDataResults = (data: any) => {
        return data.data.results.map((providerDetails: any) => {
            return {
                'value': providerDetails.person ? providerDetails.person.display : providerDetails.display,
                'uuid': providerDetails.uuid
            };
        });
    };

    const providerSelected = (providerData: any) => {
        setSelectedProvider(providerData);
    };

    const clearProvider = (data: any) => {
        if (selectedProvider && data !== selectedProvider.value) {
            setEncounterProvider('');
            setSelectedProvider({});
        }
    };

    const windowReload = () => {
        changeCookieData();
        window.location.reload();
    };

    const isCurrentLocation = (location: any) => {
        return getCurrentCookieLocation()?.uuid === location.uuid;
    };

    const popUpHandler = () => {
        setDialogOpen(true);
        document.body.classList.add('show-controller-back');
    };

    const closePopUp = () => {
        setDialogOpen(false);
        document.body.classList.remove('show-controller-back');
    };

    const getTitle = () => {
        const title = [];
        if (getCurrentCookieLocation()) {
            title.push(t(getCurrentCookieLocation().name));
        }
        if (getCurrentProvider() && getCurrentProvider().value) {
            title.push(getCurrentProvider().value);
        }
        if (getRetrospectiveEntryService().getRetrospectiveDate()) {
            title.push(formatDateWithoutTime(getRetrospectiveEntryService().getRetrospectiveDate()));
        }
        return title.join(',');
    };

    const sync = () => {

        // Assuming sync functionality involves re-fetching provider and location data
        const fetchProviderAndLocationData = async () => {
            try {
                const providerData = await getProviderService().search('');
                const locationData = await getLocationService().getAllByTag("Login Location");

                // Update state with fetched data
                setSelectedProvider(providerData.data.results);
                setLocations(locationData.data.results);
            } catch (error) {
                console.error('Error fetching provider or location data:', error);
            }
        };

        fetchProviderAndLocationData();
    };

    const getCurrentCookieLocation = () => {
        return getCookie(BahmniConstants.locationCookieName) || null;
    };

    const getCurrentProvider = () => {
        return getCookie(BahmniConstants.grantProviderAccessDataCookieName);
    };

    const getLocationFor = (uuid: string) => {
        return locations.find(location => location.uuid === uuid);
    };

    const changeCookieData = () => {
        getRetrospectiveEntryService().resetRetrospectiveEntry(date);
        removeCookie(BahmniConstants.grantProviderAccessDataCookieName);
        setCookie(BahmniConstants.grantProviderAccessDataCookieName, selectedProvider, { path: '/', expires: 1 });

        const selectedLocation = getLocationFor(selectedLocationUuid);
        removeCookie(BahmniConstants.locationCookieName);
        setCookie(BahmniConstants.locationCookieName, { name: selectedLocation.display, uuid: selectedLocation.uuid }, { path: '/', expires: 7 });
    };

    useEffect(() => {
        const retrospectiveDate = getRetrospectiveEntryService().getRetrospectiveDate();
        setDate(retrospectiveDate ? new Date(retrospectiveDate) : new Date(maxStartDate));
        setEncounterProvider(getCurrentProvider());
        setSelectedProvider(getCurrentProvider());

        const loginLocations = localStorage.getItem("loginLocations");
        if (loginLocations) {
            setLocations(JSON.parse(loginLocations));
        } else {
            getLocationService().getAllByTag("Login Location").then(response => {
                setLocations(response.data.results);
            });
        }
    }, [maxStartDate]);

    return (
        <div>
            {/* Render the component UI here */}
            <Dialog show={dialogOpen} onHide={closePopUp}>
                <Dialog.Header closeButton>
                    <Dialog.Title>{t('defaultDataPopUpTitle')}</Dialog.Title>
                </Dialog.Header>
                <Dialog.Body>
                    {/* SECOND AGENT: [MISSING CONTEXT] - Add content for the dialog body */}
                </Dialog.Body>
                <Dialog.Footer>
                    <button onClick={closePopUp}>{t('close')}</button>
                </Dialog.Footer>
            </Dialog>
        </div>
    );
};

export default PatientListHeaderController;
