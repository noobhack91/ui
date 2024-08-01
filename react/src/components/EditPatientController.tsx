import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { patientService } from '../services/patientService';
import { encounterService } from '../services/encounterService';
import { openmrsPatientMapper } from '../services/openmrsPatientMapper';
import { appService } from '../services/appService';
import { messagingService } from '../services/messagingService';
import { auditLogService } from '../services/auditLogService';
import { spinner } from '../services/spinner';
import { Bahmni } from '../utils/constants/Bahmni';
import { DateUtil } from '../utils/constants/DateUtil';
import { ValidationUtil } from '../utils/constants/ValidationUtil';

const EditPatientController: React.FC = () => {
    const { patientUuid } = useParams<{ patientUuid: string }>();
    const [patient, setPatient] = useState<any>({});
    const [openMRSPatient, setOpenMRSPatient] = useState<any>({});
    const [readOnlyFields, setReadOnlyFields] = useState<any>({});
    const [patientLoaded, setPatientLoaded] = useState<boolean>(false);
    const [enableWhatsAppButton, setEnableWhatsAppButton] = useState<boolean>(false);
    const [relatedIdentifierAttribute, setRelatedIdentifierAttribute] = useState<any>(null);
    const [showRelatedIdentifierOption, setShowRelatedIdentifierOption] = useState<boolean>(false);
    const [showDisabledAttrOption, setShowDisabledAttrOption] = useState<boolean>(false);
    const [isDigitized, setIsDigitized] = useState<boolean>(false);

    useEffect(() => {
        const fetchPatientData = async () => {
            try {
                const openmrsPatient = await patientService.get(patientUuid);
                successCallBack(openmrsPatient);
            } catch (error) {
                console.error('Error fetching patient data:', error);
            }
        };

        const fetchDigitizedStatus = async () => {
            try {
                const data = await encounterService.getDigitized(patientUuid);
                const encountersWithObservations = data.data.results.filter((encounter: any) => encounter.obs.length > 0);
                setIsDigitized(encountersWithObservations.length > 0);
            } catch (error) {
                console.error('Error fetching digitized status:', error);
            }
        };

        const fetchPatientIdentifiers = async () => {
            try {
                const response = await patientService.getAllPatientIdentifiers(patientUuid);
                // SECOND AGENT: [MISSING CONTEXT] - Need to set patient identifiers in the global state
            } catch (error) {
                console.error('Error fetching patient identifiers:', error);
            }
        };

        spinner.forPromise(Promise.all([fetchPatientData(), fetchDigitizedStatus(), fetchPatientIdentifiers()]));
    }, [patientUuid]);

    const setReadOnlyFields = () => {
        const readOnlyFieldsConfig = appService.getAppDescriptor().getConfigValue("readOnlyFields");
        const newReadOnlyFields: any = {};
        readOnlyFieldsConfig.forEach((readOnlyField: string) => {
            if (patient[readOnlyField]) {
                newReadOnlyFields[readOnlyField] = true;
            }
        });
        setReadOnlyFields(newReadOnlyFields);
    };

    const successCallBack = (openmrsPatient: any) => {
        setOpenMRSPatient(openmrsPatient["patient"]);
        setPatient(openmrsPatientMapper.map(openmrsPatient));
        setReadOnlyFields();
        expandDataFilledSections();
        setPatientLoaded(true);
        setEnableWhatsAppButton((appService.getAppDescriptor().getConfigValue("enableWhatsAppButton") || Bahmni.Registration.Constants.enableWhatsAppButton) && (patient.phoneNumber !== undefined));
        const relatedIdentifierAttr = appService.getAppDescriptor().getConfigValue('relatedIdentifierAttribute');
        setRelatedIdentifierAttribute(relatedIdentifierAttr);
        if (relatedIdentifierAttr && relatedIdentifierAttr.name) {
            const hideOrDisableAttr = relatedIdentifierAttr.hideOrDisable;
            const hideAttrOnValue = relatedIdentifierAttr.hideOnValue;
            setShowRelatedIdentifierOption(!(hideOrDisableAttr === "hide" && patient[relatedIdentifierAttr.name] && patient[relatedIdentifierAttr.name].toString() === hideAttrOnValue));
            setShowDisabledAttrOption(hideOrDisableAttr === "disable");
        }
    };

    const expandDataFilledSections = () => {
        // SECOND AGENT: [MISSING CONTEXT] - Need to expand data filled sections based on patient configuration
    };

    const update = async () => {
        addNewRelationships();
        const errorMessages = ValidationUtil.validate(patient, patientConfiguration.attributeTypes);
        if (errorMessages.length > 0) {
            errorMessages.forEach((errorMessage: string) => {
                messagingService.showMessage('error', errorMessage);
            });
            return;
        }

        try {
            const result = await spinner.forPromise(patientService.update(patient, openMRSPatient));
            const patientProfileData = result.data;
            if (!patientProfileData.error) {
                successCallBack(patientProfileData);
                // SECOND AGENT: [MISSING CONTEXT] - Need to handle follow-up action after patient update
            }
        } catch (error) {
            console.error('Error updating patient:', error);
        }
    };

    const addNewRelationships = () => {
        const newRelationships = patient.newlyAddedRelationships.filter((relationship: any) => relationship.relationshipType && relationship.relationshipType.uuid);
        newRelationships.forEach((relationship: any) => {
            delete relationship.patientIdentifier;
            delete relationship.content;
            delete relationship.providerName;
        });
        patient.relationships = [...newRelationships, ...patient.deletedRelationships];
    };

    const isReadOnly = (field: string) => {
        return readOnlyFields ? !!readOnlyFields[field] : undefined;
    };

    const notifyOnWhatsApp = () => {
        const name = `${patient.givenName} ${patient.familyName}`;
        const whatsAppMessage = patientService.getRegistrationMessage(patient.primaryIdentifier.identifier, name, patient.age.years, patient.gender);
        const phoneNumber = patient.phoneNumber.replace("+", "");
        const url = `https://api.whatsapp.com/send?phone=${phoneNumber}&text=${encodeURIComponent(whatsAppMessage)}`;
        window.open(url);
    };

    const afterSave = () => {
        auditLogService.log(patient.uuid, Bahmni.Registration.StateNameEvenTypeMap['patient.edit'], undefined, "MODULE_LABEL_REGISTRATION_KEY");
        messagingService.showMessage("info", "REGISTRATION_LABEL_SAVED");
    };

    return (
        <div>
            {/* SECOND AGENT: [MISSING CONTEXT] - Need to add JSX for rendering the component */}
        </div>
    );
};

export default EditPatientController;
