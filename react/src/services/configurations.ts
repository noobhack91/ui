import axios from 'axios';

interface Configurations {
    dosageInstructionConfig: any[];
    stoppedOrderReasonConfig: any[];
    dosageFrequencyConfig: any[];
    allTestsAndPanelsConcept: any;
    radiologyImpressionConfig: any;
    labOrderNotesConfig: any;
    consultationNoteConfig: any;
    patientConfig: any;
    encounterConfig: any;
    patientAttributesConfig: any;
    identifierTypesConfig: any;
    genderMap: any;
    addressLevels: any;
    relationshipTypeConfig: any;
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
        const missingConfigs = configNames.filter(name => !(name in this.configs));
        if (missingConfigs.length > 0) {
            const response = await axios.get('/path/to/configurations', {
                params: { configs: missingConfigs }
            });
            Object.assign(this.configs, response.data);
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

    allTestsAndPanelsConcept(): any {
        return this.configs.allTestsAndPanelsConcept?.results?.[0] || [];
    }

    impressionConcept(): any {
        return this.configs.radiologyImpressionConfig?.results?.[0] || [];
    }

    labOrderNotesConcept(): any {
        return this.configs.labOrderNotesConfig?.results?.[0] || [];
    }

    consultationNoteConcept(): any {
        return this.configs.consultationNoteConfig?.results?.[0] || [];
    }

    patientConfig(): any {
        return this.configs.patientConfig || {};
    }

    encounterConfig(): any {
        return { ...new EncounterConfig(), ...(this.configs.encounterConfig || []) };
    }

    patientAttributesConfig(): any {
        return this.configs.patientAttributesConfig?.results;
    }

    identifierTypesConfig(): any {
        return this.configs.identifierTypesConfig;
    }

    genderMap(): any {
        return this.configs.genderMap;
    }

    addressLevels(): any {
        return this.configs.addressLevels;
    }

    relationshipTypes(): any[] {
        return this.configs.relationshipTypeConfig?.results || [];
    }

    relationshipTypeMap(): any {
        return this.configs.relationshipTypeMap || {};
    }

    loginLocationToVisitTypeMapping(): any {
        return this.configs.loginLocationToVisitTypeMapping || {};
    }

    defaultEncounterType(): any {
        return this.configs.defaultEncounterType;
    }

    helpDeskNumber(): any {
        return this.configs.helpDeskNumber;
    }

    prescriptionEmailToggle(): any {
        return this.configs.prescriptionEmailToggle;
    }

    quickLogoutComboKey(): any {
        return this.configs.quickLogoutComboKey;
    }

    contextCookieExpirationTimeInMinutes(): any {
        return this.configs.contextCookieExpirationTimeInMinutes;
    }
}

export default new ConfigurationsService();
