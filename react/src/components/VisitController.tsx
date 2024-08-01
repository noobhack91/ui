import React, { useState, useEffect } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { getPatient, updateImage } from '../services/patientService';
import { findEncounter, createEncounter } from '../services/encounterService';
import { getFormList } from '../services/formService';
import { searchVisits, getVisitSummary, endVisit } from '../services/visitService';
import { logAudit } from '../services/auditLogService';
import { showMessage } from '../services/messagingService';
import { getAppDescriptor, getConfigValue } from '../services/appService';
import { getLoginLocationUuid, getCurrentProvider, getCurrentUser } from '../services/sessionService';
import { executeContextChangeHandler } from '../services/contextChangeHandler';
import { filterObservations } from '../utils/observationFilter';
import { ConceptSetSection, ObservationForm } from '../utils/conceptSet';
import { translateAttribute } from '../utils/translationUtil';
import { BahmniConstants } from '../utils/constants';

const VisitController: React.FC = () => {
    const { patientUuid } = useParams<{ patientUuid: string }>();
    const history = useHistory();
    const [patient, setPatient] = useState<any>(null);
    const [encounterUuid, setEncounterUuid] = useState<string>('');
    const [observations, setObservations] = useState<any[]>([]);
    const [conceptSets, setConceptSets] = useState<any[]>([]);
    const [observationForms, setObservationForms] = useState<any[]>([]);
    const [availableConceptSets, setAvailableConceptSets] = useState<any[]>([]);
    const [canCloseVisit, setCanCloseVisit] = useState<boolean>(false);
    const [redirectToDashboard, setRedirectToDashboard] = useState<boolean>(false);
    const [visitUuid, setVisitUuid] = useState<string>('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const patientData = await getPatient(patientUuid);
                setPatient(patientData);
                const encounterData = await findEncounter({
                    patientUuid,
                    providerUuids: getCurrentProvider().uuid ? [getCurrentProvider().uuid] : null,
                    includeAll: false,
                    locationUuid: getLoginLocationUuid(),
                    encounterTypeUuids: [BahmniConstants.registrationEncounterType]
                });
                setEncounterUuid(encounterData.data.encounterUuid);
                setObservations(encounterData.data.observations);
                const formList = await getFormList(encounterData.data.encounterUuid);
                const extensions = getAppDescriptor().getExtensions("org.bahmni.registration.conceptSetGroup.observations", "config");
                const formExtensions = getAppDescriptor().getExtensions("org.bahmni.registration.conceptSetGroup.observations", "forms");
                const conceptSetSections = extensions.map((extension: any) => new ConceptSetSection(extension, getCurrentUser(), {}, [], {}));
                const observationForms = getObservationForms(formExtensions, formList.data);
                setConceptSets([...conceptSetSections, ...observationForms]);
                setAvailableConceptSets(conceptSets.filter((conceptSet: any) => conceptSet.isAvailable({ visitType: encounterData.data.visitType, patient: patientData })));
                const activeVisits = await searchVisits({ patient: patientUuid, includeInactive: false, v: "custom:(uuid,location:(uuid))" });
                const activeVisitForCurrentLoginLocation = activeVisits.data.results.filter((result: any) => result.location.uuid === getLoginLocationUuid());
                const hasActiveVisit = activeVisitForCurrentLoginLocation.length > 0;
                setVisitUuid(hasActiveVisit ? activeVisitForCurrentLoginLocation[0].uuid : "");
                setCanCloseVisit(isUserPrivilegedToCloseVisit() && hasActiveVisit);
            } catch (error) {
                console.error(error);
            }
        };
        fetchData();
    }, [patientUuid]);

    const isUserPrivilegedToCloseVisit = () => {
        const applicablePrivs = [BahmniConstants.closeVisitPrivilege, BahmniConstants.deleteVisitsPrivilege];
        const userPrivs = getCurrentUser().privileges.map((privilege: any) => privilege.name);
        return applicablePrivs.some((privName: string) => userPrivs.includes(privName));
    };

    const closeVisitIfDischarged = async () => {
        try {
            const visitSummary = await getVisitSummary(visitUuid);
            if (visitSummary.data.admissionDetails && !visitSummary.data.dischargeDetails) {
                showMessage("error", 'REGISTRATION_VISIT_CANNOT_BE_CLOSED');
                logAudit(patientUuid, 'CLOSE_VISIT_FAILED', { visitUuid, visitType: visitSummary.data.visitType }, 'MODULE_LABEL_REGISTRATION_KEY');
            } else {
                closeVisit(visitSummary.data.visitType);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const closeVisit = async (visitType: string) => {
        const confirmed = window.confirm("REGISTRATION_CONFIRM_CLOSE_VISIT");
        if (confirmed) {
            try {
                await endVisit(visitUuid);
                history.push(BahmniConstants.patientSearchURL);
                logAudit(patientUuid, 'CLOSE_VISIT', { visitUuid, visitType }, 'MODULE_LABEL_REGISTRATION_KEY');
            } catch (error) {
                console.error(error);
            }
        }
    };

    const updatePatientImage = async (image: string) => {
        try {
            const updateImagePromise = updateImage(patient.uuid, image.replace("data:image/jpeg;base64,", ""));
            await updateImagePromise;
        } catch (error) {
            console.error(error);
        }
    };

    const save = async () => {
        const encounter = {
            patientUuid: patient.uuid,
            locationUuid: getLoginLocationUuid(),
            encounterTypeUuid: BahmniConstants.registrationEncounterType,
            orders: [],
            drugOrders: [],
            extensions: {},
            observations: filterObservations(observations)
        };

        addFormObservations(encounter.observations);

        try {
            const response = await createEncounter(encounter);
            logAudit(patientUuid, 'EDIT_ENCOUNTER', { encounterUuid: response.data.encounterUuid, encounterType: response.data.encounterType }, 'MODULE_LABEL_REGISTRATION_KEY');
            const visitTypeUuid = response.data.visitTypeUuid;
            const visitTypes = await getVisitType();
            const visitType = visitTypes.data.results.find((type: any) => type.uuid === visitTypeUuid);
        } catch (error) {
            console.error(error);
        }
    };

    const validate = async () => {
        const isFormValidated = mandatoryValidate();
        const contxChange = executeContextChangeHandler();
        const allowContextChange = contxChange["allow"];
        let errorMessage;

        if (!isObservationFormValid()) {
            throw new Error("Some fields are not valid");
        }
        if (!allowContextChange) {
            errorMessage = contxChange["errorMessage"] ? contxChange["errorMessage"] : 'REGISTRATION_LABEL_CORRECT_ERRORS';
            showMessage('error', errorMessage);
            throw new Error("Some fields are not valid");
        } else if (!isFormValidated) {
            errorMessage = "REGISTRATION_LABEL_ENTER_MANDATORY_FIELDS";
            showMessage('error', errorMessage);
            throw new Error("Some fields are not valid");
        }
    };

    const isObservationFormValid = () => {
        let valid = true;
        observationForms.forEach((observationForm: any) => {
            if (valid && observationForm.component) {
                const value = observationForm.component.getValue();
                if (value.errors) {
                    showMessage('error', "REGISTRATION_FORM_ERRORS_MESSAGE_KEY");
                    valid = false;
                }
            }
        });
        return valid;
    };

    const mandatoryValidate = () => {
        conceptGroupValidation(observations);
        return isValid(mandatoryConceptGroup);
    };

    const conceptGroupValidation = (observations: any[]) => {
        const concepts = observations.filter((observationNode: any) => isMandatoryConcept(observationNode));
        if (concepts.length > 0) {
            mandatoryConceptGroup = [...mandatoryConceptGroup, ...concepts];
        }
    };

    const isMandatoryConcept = (observation: any) => {
        if (observation.groupMembers && observation.groupMembers.length > 0) {
            conceptGroupValidation(observation.groupMembers);
        } else {
            return observation.conceptUIConfig && observation.conceptUIConfig.required;
        }
    };

    const isValid = (mandatoryConcepts: any[]) => {
        const concept = mandatoryConcepts.filter((mandatoryConcept: any) => {
            if (mandatoryConcept.hasValue()) {
                return false;
            }
            if (mandatoryConcept instanceof ConceptSetSection.Observation &&
                mandatoryConcept.conceptUIConfig && mandatoryConcept.conceptUIConfig.multiSelect) {
                return false;
            }
            if (mandatoryConcept.isMultiSelect) {
                return mandatoryConcept.getValues().length === 0;
            }
            return !mandatoryConcept.value;
        });
        return concept.length === 0;
    };

    const afterSave = () => {
        const forwardUrl = getConfigValue("afterVisitSaveForwardUrl");
        const dashboardUrl = getConfigValue("dashboardUrl") || BahmniConstants.dashboardUrl;
        if (forwardUrl != null) {
            window.location.href = getAppDescriptor().formatUrl(forwardUrl, { 'patientUuid': patientUuid });
        } else if (dashboardUrl != null && redirectToDashboard) {
            window.location.href = getAppDescriptor().formatUrl(dashboardUrl, { 'patientUuid': patientUuid });
        } else {
            history.go(0);
        }
        showMessage('info', 'REGISTRATION_LABEL_SAVED');
    };

    const submit = async () => {
        try {
            await validate();
            await save();
            afterSave();
        } catch (error) {
            console.error(error);
        }
    };

    const addFormObservations = (observations: any[]) => {
        if (observationForms) {
            observations = observations.filter((observation: any) => !observation.formNamespace);
            observationForms.forEach((observationForm: any) => {
                if (observationForm.component) {
                    const formObservations = observationForm.component.getValue();
                    formObservations.observations.forEach((obs: any) => {
                        observations.push(obs);
                    });
                }
            });
        }
    };

    const getObservationForms = (extensions: any[], observationsForms: any[]) => {
        const forms: any[] = [];
        const observations = observations || [];
        extensions.forEach((ext: any) => {
            const options = ext.extensionParams || {};
            const observationForm = observationsForms.find((form: any) => form.formName === options.formName || form.name === options.formName);
            if (observationForm) {
                const formUuid = observationForm.formUuid || observationForm.uuid;
                const formName = observationForm.name || observationForm.formName;
                const formVersion = observationForm.version || observationForm.formVersion;
                forms.push(new ObservationForm(formUuid, getCurrentUser(), formName, formVersion, observations, formName, ext));
            }
        });
        return forms;
    };

    return (
        <div>

            <h1>Visit Controller</h1>
            {patient && (
        
                    <h2>{patient.name}</h2>
                    <img src={`data:image/jpeg;base64,${patient.image}`} alt="Patient" />
                    <button onClick={() => updatePatientImage('newImageBase64String')}>Update Image</button>
                </div>
            )}
    
                <h3>Observations</h3>
                {observations.map((observation, index) => (
                    <div key={index}>
                        <p>{observation.conceptName}</p>
                        <p>{observation.value}</p>
                    </div>
                ))}
            </div>
    
                <h3>Concept Sets</h3>
                {availableConceptSets.map((conceptSet, index) => (
                    <div key={index}>
                        <p>{conceptSet.name}</p>
                    </div>
                ))}
            </div>
            <button onClick={submit}>Submit</button>
            {canCloseVisit && (
                <button onClick={closeVisitIfDischarged}>Close Visit</button>
            )}
        </div>
    );
};

export default VisitController;
