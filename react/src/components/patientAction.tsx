import React, { useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Spinner } from 'react-bootstrap';
import { getAppDescriptor, getExtensions, getConfigValue, formatUrl } from '../services/appService';
import { getVisitTypesAsArray, getDefaultVisitType } from '../services/regEncounterConfiguration';
import { searchVisits, createVisitOnly } from '../services/visitService';
import { showMessage, clearAllMessages } from '../services/messagingService';
import { logAudit } from '../services/auditLogService';
import { getCookie } from '../services/cookieService';
import { BahmniConstants } from '../utils/constants';

const PatientAction: React.FC = () => {
    const { patientUuid } = useParams<{ patientUuid: string }>();
    const history = useHistory();
    const { t } = useTranslation();
    const [hasActiveVisit, setHasActiveVisit] = useState(false);
    const [activeVisit, setActiveVisit] = useState<any>(null);
    const [forwardActionKey, setForwardActionKey] = useState<string>('');
    const [actionConfig, setActionConfig] = useState<any>(null);
    const [activeVisitConfig, setActiveVisitConfig] = useState<any>(null);
    const [submitSource, setSubmitSource] = useState<string>('');

    const loginLocationUuid = getCookie(BahmniConstants.locationCookieName).uuid;
    const defaultVisitType = getDefaultVisitType(loginLocationUuid) || getConfigValue('defaultVisitType');
    const showStartVisitButton = getConfigValue("showStartVisitButton") ?? true;
    const forwardUrlsForVisitTypes = getConfigValue("forwardUrlsForVisitTypes");
    const showSuccessMessage = getConfigValue("showSuccessMessage");
    const visitLocationUuid = ''; // SECOND AGENT: [MISSING CONTEXT] - Visit location UUID needs to be set here

    const getForwardUrlEntryForVisitFromTheConfig = () => {
        const matchedEntry = forwardUrlsForVisitTypes.find((entry: any) => {
            if (hasActiveVisit) {
                return entry.visitType === activeVisit.visitType.name;
            }
            return entry.visitType === ''; // SECOND AGENT: [MISSING CONTEXT] - Selected visit type name needs to be set here
        });
        return matchedEntry;
    };

    const keyForActiveVisitEntry = () => {
        const matchedEntry = getForwardUrlEntryForVisitFromTheConfig();
        if (matchedEntry) {
            setActiveVisitConfig(matchedEntry);
            if (!matchedEntry.translationKey) {
                matchedEntry.translationKey = "REGISTRATION_LABEL_ENTER_VISIT";
                matchedEntry.shortcutKey = "REGISTRATION_ENTER_VISIT_DETAILS_ACCESS_KEY";
            }
            return 'forwardAction';
        }
    };

    const setForwardActionKey = () => {
        const editActionsConfig = getExtensions(BahmniConstants.nextStepConfigId, "config") || [];
        if (editActionsConfig.length === 0) {
            setForwardActionKey(hasActiveVisit ? (getForwardUrlEntryForVisitFromTheConfig() ? keyForActiveVisitEntry() : 'enterVisitDetails') : 'startVisit');
        } else {
            setActionConfig(editActionsConfig[0]);
            setForwardActionKey('configAction');
        }
    };

    const init = () => {
        if (!patientUuid) {
            setHasActiveVisit(false);
            setForwardActionKey();
            return;
        }
        const searchParams = {
            patient: patientUuid,
            includeInactive: false,
            v: "custom:(uuid,visitType,location:(uuid))"
        };
        Spinner.forPromise(searchVisits(searchParams).then((response: any) => {
            const results = response.data.results;
            const activeVisitForCurrentLoginLocation = results.filter((result: any) => result.location.uuid === visitLocationUuid);
            setHasActiveVisit(activeVisitForCurrentLoginLocation.length > 0);
            if (activeVisitForCurrentLoginLocation.length > 0) {
                setActiveVisit(activeVisitForCurrentLoginLocation[0]);
            }
            setForwardActionKey();
        }));
    };

    const goToForwardUrlPage = (patientData: any) => {
        const forwardUrl = formatUrl(activeVisitConfig.forwardUrl, { 'patientUuid': patientData.patient.uuid });
        window.location.href = forwardUrl;
    };

    const followUpAction = (patientProfileData: any) => {
        clearAllMessages();
        switch (submitSource) {
            case 'startVisit':
                const entry = getForwardUrlEntryForVisitFromTheConfig();
                const forwardUrl = entry ? entry.forwardUrl : undefined;
                return createVisit(patientProfileData, forwardUrl);
            case 'forwardAction':
                return goToForwardUrlPage(patientProfileData);
            case 'enterVisitDetails':
                return goToVisitPage(patientProfileData);
            case 'configAction':
                return handleConfigAction(patientProfileData);
            case 'save':
                afterSave();
        }
    };

    const handleConfigAction = (patientProfileData: any) => {
        const forwardUrl = formatUrl(actionConfig.extensionParams.forwardUrl, { 'patientUuid': patientProfileData.patient.uuid });
        if (!hasActiveVisit) {
            createVisit(patientProfileData, forwardUrl);
        } else {
            window.location.href = forwardUrl;
        }
    };

    const goToVisitPage = (patientData: any) => {
        history.push(`/patient/${patientData.patient.uuid}/visit`);
    };

    const isEmptyVisitLocation = () => {
        return !visitLocationUuid;
    };

    const checkIfActiveVisitExists = (patientProfileData: any) => {

        return searchVisits({
            patient: patientProfileData.patient.uuid,
            includeInactive: false,
            v: "custom:(uuid,visitType,location:(uuid))"
        }).then((response: any) => {
            const results = response.data.results;
            const activeVisitForCurrentLoginLocation = results.filter((result: any) => result.location.uuid === visitLocationUuid);
            return activeVisitForCurrentLoginLocation.length > 0;
        }).catch((error: any) => {
            console.error("Error checking if active visit exists:", error);
            return false;
        });
    };

    const createVisit = (patientProfileData: any, forwardUrl: string) => {
        if (isEmptyVisitLocation()) {
            history.push(`/patient/edit/${patientProfileData.patient.uuid}`);
            showMessage("error", "NO_LOCATION_TAGGED_TO_VISIT_LOCATION");
            return;
        }
        checkIfActiveVisitExists(patientProfileData).then((exists: boolean) => {
            if (exists) return showMessage("error", "VISIT_OF_THIS_PATIENT_AT_SAME_LOCATION_EXISTS");

            Spinner.forPromise(createVisitOnly(patientProfileData.patient.uuid, visitLocationUuid).then((response: any) => {
                logAudit(patientProfileData.patient.uuid, "OPEN_VISIT", { visitUuid: response.data.uuid, visitType: response.data.visitType.display }, 'MODULE_LABEL_REGISTRATION_KEY');
                if (forwardUrl) {
                    const updatedForwardUrl = formatUrl(forwardUrl, { 'patientUuid': patientProfileData.patient.uuid });
                    window.location.href = updatedForwardUrl;
                    if (showSuccessMessage) {
                        showMessage("info", "REGISTRATION_LABEL_SAVE_REDIRECTION");
                    }
                } else {
                    goToVisitPage(patientProfileData);
                }

            {showStartVisitButton && (
                <button onClick={() => setSubmitSource('startVisit')}>
                    {t('START_VISIT')}
                </button>
            )}
            {forwardActionKey === 'enterVisitDetails' && (
                <button onClick={() => setSubmitSource('enterVisitDetails')}>
                    {t('ENTER_VISIT_DETAILS')}
                </button>
            )}
            {forwardActionKey === 'configAction' && (
                <button onClick={() => setSubmitSource('configAction')}>
                    {t(actionConfig.translationKey || 'CONFIG_ACTION')}
                </button>
            )}
            {forwardActionKey === 'forwardAction' && (
                <button onClick={() => setSubmitSource('forwardAction')}>
                    {t(activeVisitConfig.translationKey || 'FORWARD_ACTION')}
                </button>
            )}
            <button onClick={() => setSubmitSource('save')}>
                {t('SAVE')}
            </button>
        </div>
                history.push(`/patient/edit/${patientProfileData.patient.uuid}`);
            }));
        });
    };

    useEffect(() => {
        init();
    }, [patientUuid]);

    return (
        <div>

            {showStartVisitButton && (
                <button onClick={() => setSubmitSource('startVisit')}>
                    {t('START_VISIT')}
                </button>
            )}
            {forwardActionKey === 'enterVisitDetails' && (
                <button onClick={() => setSubmitSource('enterVisitDetails')}>
                    {t('ENTER_VISIT_DETAILS')}
                </button>
            )}
            {forwardActionKey === 'configAction' && (
                <button onClick={() => setSubmitSource('configAction')}>
                    {t(actionConfig.translationKey || 'CONFIG_ACTION')}
                </button>
            )}
            {forwardActionKey === 'forwardAction' && (
                <button onClick={() => setSubmitSource('forwardAction')}>
                    {t(activeVisitConfig.translationKey || 'FORWARD_ACTION')}
                </button>
            )}
            <button onClick={() => setSubmitSource('save')}>
                {t('SAVE')}
            </button>
        </div>
    );
};

export default PatientAction;
