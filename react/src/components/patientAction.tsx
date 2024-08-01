import React, { useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Spinner } from 'react-bootstrap';
import { getVisitTypesAsArray, getDefaultVisitType } from '../services/encounterService';
import { searchVisits, createVisitOnly } from '../services/visitService';
import { showMessage, clearAllMessages } from '../services/messagingService';
import { logAudit } from '../services/auditLogService';
import { formatUrl } from '../services/appService';
import { getCookie } from '../services/cookieService';
import { BahmniConstants } from '../utils/constants';

const PatientAction: React.FC = () => {
    const { patientUuid } = useParams<{ patientUuid: string }>();
    const history = useHistory();
    const { t } = useTranslation();
    const [hasActiveVisit, setHasActiveVisit] = useState(false);
    const [activeVisit, setActiveVisit] = useState<any>(null);
    const [forwardActionKey, setForwardActionKey] = useState<string>('');
    const [visitControl, setVisitControl] = useState<any>(null);
    const [actions, setActions] = useState<any>({ submitSource: '' });
    const [activeVisitConfig, setActiveVisitConfig] = useState<any>(null);
    const [actionConfig, setActionConfig] = useState<any>(null);

    useEffect(() => {
        const init = async () => {
            if (!patientUuid) {
                setHasActiveVisit(false);
                setForwardActionKey('startVisit');
                return;
            }

            const loginLocationUuid = getCookie(BahmniConstants.locationCookieName).uuid;
            const defaultVisitType = getDefaultVisitType(loginLocationUuid) || 'defaultVisitType';
            const visitTypes = getVisitTypesAsArray();
            const visitControlInstance = new VisitControl(visitTypes, defaultVisitType);
            setVisitControl(visitControlInstance);

            const searchParams = {
                patient: patientUuid,
                includeInactive: false,
                v: "custom:(uuid,visitType,location:(uuid))"
            };

            try {
                const response = await searchVisits(searchParams);
                const results = response.data.results;
                const activeVisitForCurrentLoginLocation = results.filter((result: any) => result.location.uuid === loginLocationUuid);
                setHasActiveVisit(activeVisitForCurrentLoginLocation.length > 0);
                if (activeVisitForCurrentLoginLocation.length > 0) {
                    setActiveVisit(activeVisitForCurrentLoginLocation[0]);
                }
                setForwardActionKey(determineForwardActionKey());
            } catch (error) {
                console.error('Error fetching visits', error);
            }
        };

        init();
    }, [patientUuid]);

    const determineForwardActionKey = () => {

        if (!hasActiveVisit) {
            return 'startVisit';
        }

        const matchedEntry = getForwardUrlEntryForVisitFromTheConfig();
        if (matchedEntry) {
            setActiveVisitConfig(matchedEntry);
            if (!matchedEntry.translationKey) {
                matchedEntry.translationKey = "REGISTRATION_LABEL_ENTER_VISIT";
                matchedEntry.shortcutKey = "REGISTRATION_ENTER_VISIT_DETAILS_ACCESS_KEY";
            }
            return 'forwardAction';
        }

        if (editActionsConfig.length === 0) {
            return 'enterVisitDetails';
        } else {
            setActionConfig(editActionsConfig[0]);
            return 'configAction';
        }
    };
        return 'startVisit';
    };

    const handleStartVisit = () => {
        setActions({ ...actions, submitSource: 'startVisit' });
    };

    const handleFollowUpAction = async (patientProfileData: any) => {
        clearAllMessages();
        switch (actions.submitSource) {
            case 'startVisit':
                const entry = getForwardUrlEntryForVisitFromTheConfig();

        if (!forwardUrls) return null;

        const matchedEntry = forwardUrls.find((entry: any) => {
            if (hasActiveVisit) {
                return entry.visitType === activeVisit.visitType.name;
            }
            return entry.visitType === visitControl.selectedVisitType.name;
        });

        return matchedEntry || null;
    };
                await createVisit(patientProfileData, forwardUrl);
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

    const getForwardUrlEntryForVisitFromTheConfig = () => {

        if (!forwardUrls) return null;

        const matchedEntry = forwardUrls.find((entry: any) => {
            if (hasActiveVisit) {
                return entry.visitType === activeVisit.visitType.name;
            }
            return entry.visitType === visitControl.selectedVisitType.name;
        });

        return matchedEntry || null;
    };
        return null;
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

            <div>
                <button onClick={handleStartVisit}>
                    {t('Start Visit')}
                </button>
                <button onClick={() => handleFollowUpAction({ patient: { uuid: patientUuid } })}>
                    {t('Follow Up Action')}
                </button>
            </div>
    };

    const goToVisitPage = (patientData: any) => {
        history.push(`/patient/${patientData.patient.uuid}/visit`);
    };

    const createVisit = async (patientProfileData: any, forwardUrl: string) => {
        if (!visitControl) return;

        try {
            const response = await visitControl.createVisitOnly(patientProfileData.patient.uuid, 'visitLocation');
            logAudit(patientProfileData.patient.uuid, "OPEN_VISIT", { visitUuid: response.data.uuid, visitType: response.data.visitType.display }, 'MODULE_LABEL_REGISTRATION_KEY');
            if (forwardUrl) {
                const updatedForwardUrl = formatUrl(forwardUrl, { 'patientUuid': patientProfileData.patient.uuid });
                window.location.href = updatedForwardUrl;
                showMessage("info", "REGISTRATION_LABEL_SAVE_REDIRECTION");
            } else {
                goToVisitPage(patientProfileData);
            }

            <div>
                <button onClick={handleStartVisit}>
                    {t('Start Visit')}
                </button>
                <button onClick={() => handleFollowUpAction({ patient: { uuid: patientUuid } })}>
                    {t('Follow Up Action')}
                </button>
            </div>
            console.error('Error creating visit', error);
            history.push(`/patient/edit/${patientProfileData.patient.uuid}`);
        }
    };

    return (
        <div>
            <Spinner animation="border" role="status">
                <span className="sr-only">Loading...</span>
            </Spinner>

            <div>
                <button onClick={handleStartVisit}>
                    {t('Start Visit')}
                </button>
                <button onClick={() => handleFollowUpAction({ patient: { uuid: patientUuid } })}>
                    {t('Follow Up Action')}
                </button>
            </div>
    );
};

export default PatientAction;
