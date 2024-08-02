import React, { useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Spinner } from 'react-bootstrap';
import { getVisitTypesAsArray, getDefaultVisitType, getVisitLocation } from '../services/visitService';
import { getAppDescriptor, formatUrl } from '../services/appService';
import { searchVisits, createVisitOnly } from '../services/visitService';
import { showMessage, clearAllMessages } from '../services/messagingService';
import { logAudit } from '../services/auditLogService';

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
    const [visitControl, setVisitControl] = useState<any>(null);

    useEffect(() => {
        const init = async () => {
            if (!patientUuid) {
                setHasActiveVisit(false);
                setForwardActionKeyBasedOnConfig();
                return;
            }

            const searchParams = {
                patient: patientUuid,
                includeInactive: false,
                v: "custom:(uuid,visitType,location:(uuid))"
            };

            try {
                const response = await searchVisits(searchParams);
                const results = response.data.results;
                const visitLocationUuid = getVisitLocation().uuid;
                const activeVisitForCurrentLoginLocation = results.filter((result: any) => result.location.uuid === visitLocationUuid);

                setHasActiveVisit(activeVisitForCurrentLoginLocation.length > 0);
                if (activeVisitForCurrentLoginLocation.length > 0) {
                    setActiveVisit(activeVisitForCurrentLoginLocation[0]);
                }
                setForwardActionKeyBasedOnConfig();
            } catch (error) {
                console.error('Error fetching visits:', error);
            }
        };

        init();
    }, [patientUuid]);

    const setForwardActionKeyBasedOnConfig = () => {
        const editActionsConfig = getAppDescriptor().getExtensions('nextStepConfigId', 'config') || [];
        if (editActionsConfig.length === 0) {
            setForwardActionKey(hasActiveVisit ? (getForwardUrlEntryForVisitFromTheConfig() ? keyForActiveVisitEntry() : 'enterVisitDetails') : 'startVisit');
        } else {
            setActionConfig(editActionsConfig[0]);
            setForwardActionKey('configAction');
        }
    };

    const getForwardUrlEntryForVisitFromTheConfig = () => {
        const forwardUrls = getAppDescriptor().getConfigValue('forwardUrlsForVisitTypes') || [];
        return forwardUrls.find((entry: any) => {
            if (hasActiveVisit) {
                return entry.visitType === activeVisit.visitType.name;
            }
            return entry.visitType === visitControl.selectedVisitType.name;
        });
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

    const goToForwardUrlPage = (patientData: any) => {
        const forwardUrl = formatUrl(activeVisitConfig.forwardUrl, { 'patientUuid': patientData.patient.uuid });
        window.location.href = forwardUrl;
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
        return !getVisitLocation();
    };

    const checkIfActiveVisitExists = async (patientProfileData: any) => {
        const response = await visitControl.checkIfActiveVisitExists(patientProfileData.patient.uuid, getVisitLocation());
        return response.data.results.length > 0;
    };

    const createVisit = async (patientProfileData: any, forwardUrl: string) => {
        if (isEmptyVisitLocation()) {
            history.push(`/patient/edit/${patientProfileData.patient.uuid}`);
            showMessage("error", "NO_LOCATION_TAGGED_TO_VISIT_LOCATION");
            return;
        }

        const exists = await checkIfActiveVisitExists(patientProfileData);
        if (exists) {
            showMessage("error", "VISIT_OF_THIS_PATIENT_AT_SAME_LOCATION_EXISTS");
            return;
        }

        try {
            const response = await createVisitOnly(patientProfileData.patient.uuid, getVisitLocation());
            logAudit(patientProfileData.patient.uuid, "OPEN_VISIT", { visitUuid: response.data.uuid, visitType: response.data.visitType.display }, 'MODULE_LABEL_REGISTRATION_KEY');
            if (forwardUrl) {
                const updatedForwardUrl = formatUrl(forwardUrl, { 'patientUuid': patientProfileData.patient.uuid });
                window.location.href = updatedForwardUrl;
                if (getAppDescriptor().getConfigValue("showSuccessMessage")) {
                    showMessage("info", "REGISTRATION_LABEL_SAVE_REDIRECTION");
                }
            } else {
                goToVisitPage(patientProfileData);
            }
        } catch (error) {
            history.push(`/patient/edit/${patientProfileData.patient.uuid}`);
        }
    };

    const followUpAction = (patientProfileData: any) => {
        clearAllMessages();
        switch (submitSource) {
            case 'startVisit':
                const entry = getForwardUrlEntryForVisitFromTheConfig();
                const forwardUrl = entry ? entry.forwardUrl : undefined;
                createVisit(patientProfileData, forwardUrl);
                break;
            case 'forwardAction':
                goToForwardUrlPage(patientProfileData);
                break;
            case 'enterVisitDetails':
                goToVisitPage(patientProfileData);
                break;
            case 'configAction':
                handleConfigAction(patientProfileData);
                break;
            case 'save':

                afterSave();
                break;
            default:
                break;
        }
    };

    return (

            <button onClick={() => setSubmitSource('startVisit')}>
                {t('START_VISIT')}
            </button>
            <button onClick={() => setSubmitSource('forwardAction')}>
                {t('FORWARD_ACTION')}
            </button>
            <button onClick={() => setSubmitSource('enterVisitDetails')}>
                {t('ENTER_VISIT_DETAILS')}
            </button>
            <button onClick={() => setSubmitSource('configAction')}>
                {t('CONFIG_ACTION')}
            </button>
            <button onClick={() => setSubmitSource('save')}>
                {t('SAVE')}
            </button>
            <Spinner animation="border" role="status" style={{ display: hasActiveVisit ? 'none' : 'block' }}>
                <span className="sr-only">{t('LOADING')}</span>
            </Spinner>
        </div>

        <div>
            <button onClick={() => followUpAction({ patient: { uuid: patientUuid } })}>
                {t('FOLLOW_UP_ACTION')}
            </button>
    );
};

export default PatientAction;
