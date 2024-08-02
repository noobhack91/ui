import axios from 'axios';
import { BahmniConstants } from '../utils/constants/BahmniConstants';

interface Configurations {
    dosageInstructionConfig: any[];
    stoppedOrderReasonConfig: any[];
    dosageFrequencyConfig: any[];
    allTestsAndPanelsConcept: any[];
    radiologyImpressionConfig: any[];
    labOrderNotesConfig: any[];
    consultationNoteConfig: any[];
    patientConfig: any;
    encounterConfig: any;
    patientAttributesConfig: any[];
    identifierTypesConfig: any[];
    genderMap: any;
    addressLevels: any;
    relationshipTypeConfig: any[];
    relationshipTypeMap: any;
    loginLocationToVisitTypeMapping: any;
    defaultEncounterType: any;
    helpDeskNumber: any;
    prescriptionEmailToggle: any;
    quickLogoutComboKey: any;
    contextCookieExpirationTimeInMinutes: any;
}

class ConfigurationsService {
    private configs: Partial<Configurations> = {};

    async load(configNames: string[]): Promise<void> {
        try {
            const response = await axios.get(BahmniConstants.globalPropertyUrl, {
                params: {
                    property: configNames.join(',')
                },
                withCredentials: true,
                transformResponse: [(data) => JSON.parse(data)]
            });
            this.configs = { ...this.configs, ...response.data };
        } catch (error) {
            console.error('Error loading configurations:', error);
            throw error;
        }
    }

    dosageInstructionConfig(): any[] {
        return this.configs.dosageInstructionConfig || [];
    }

    stoppedOrderReasonConfig(): any[] {
        return this.configs.stoppedOrderReasonConfig || [];
    }

    dosageFrequencyConfig(): any[] {
        return this.configs.dosageFrequencyConfig || [];
    }

    allTestsAndPanelsConcept(): any[] {
        return this.configs.allTestsAndPanelsConcept && this.configs.allTestsAndPanelsConcept.results && this.configs.allTestsAndPanelsConcept.results[0] ? this.configs.allTestsAndPanelsConcept.results[0] : [];
    }

    impressionConcept(): any[] {
        return this.configs.radiologyImpressionConfig && this.configs.radiologyImpressionConfig.results && this.configs.radiologyImpressionConfig.results[0] ? this.configs.radiologyImpressionConfig.results[0] : [];
    }

    labOrderNotesConcept(): any[] {
        return this.configs.labOrderNotesConfig && this.configs.labOrderNotesConfig.results && this.configs.labOrderNotesConfig.results[0] ? this.configs.labOrderNotesConfig.results[0] : [];
    }

    consultationNoteConcept(): any[] {
        return this.configs.consultationNoteConfig && this.configs.consultationNoteConfig.results && this.configs.consultationNoteConfig.results[0] ? this.configs.consultationNoteConfig.results[0] : [];
    }

    patientConfig(): any {
        return this.configs.patientConfig ? this.configs.patientConfig : {};
    }

    encounterConfig(): any {
        return this.configs.encounterConfig ? this.configs.encounterConfig : {};
    }

    patientAttributesConfig(): any[] {
        return this.configs.patientAttributesConfig ? this.configs.patientAttributesConfig : [];
    }

    identifierTypesConfig(): any[] {
        return this.configs.identifierTypesConfig ? this.configs.identifierTypesConfig : [];
    }

    genderMap(): any {
        return this.configs.genderMap ? this.configs.genderMap : {};
    }

    addressLevels(): any {
        return this.configs.addressLevels ? this.configs.addressLevels : [];
    }

    relationshipTypes(): any[] {
        return this.configs.relationshipTypeConfig && this.configs.relationshipTypeConfig.results ? this.configs.relationshipTypeConfig.results : [];
    }

    relationshipTypeMap(): any {
        return this.configs.relationshipTypeMap ? this.configs.relationshipTypeMap : {};
    }

    loginLocationToVisitTypeMapping(): any {
        return this.configs.loginLocationToVisitTypeMapping ? this.configs.loginLocationToVisitTypeMapping : {};
    }

    defaultEncounterType(): any {
        return this.configs.defaultEncounterType ? this.configs.defaultEncounterType : {};
    }

    helpDeskNumber(): any {
        return this.configs.helpDeskNumber ? this.configs.helpDeskNumber : '';
    }

    prescriptionEmailToggle(): any {
        return this.configs.prescriptionEmailToggle ? this.configs.prescriptionEmailToggle : false;
    }

    quickLogoutComboKey(): any {
        return this.configs.quickLogoutComboKey ? this.configs.quickLogoutComboKey : '';
    }

    contextCookieExpirationTimeInMinutes(): any {
        return this.configs.contextCookieExpirationTimeInMinutes ? this.configs.contextCookieExpirationTimeInMinutes : '';
    }
}

export default new ConfigurationsService();
