import { encounterConfig } from '../routes/encounterConfig';
import { patientConfig } from '../routes/patientConfig';
import { configurationService as patientAttributesService } from '../routes/patientAttributesConfig';
import { configurationService as dosageFrequencyService } from '../routes/dosageFrequencyConfig';
import { dosageInstructionConfig } from '../routes/dosageInstructionConfig';
import { configurationService as stoppedOrderReasonService } from '../routes/stoppedOrderReasonConfig';
import { consultationNoteConfig } from '../routes/consultationNoteConfig';
import { configurationService as radiologyObservationService } from '../routes/radiologyObservationConfig';
import { labOrderNotesConfig } from '../routes/labOrderNotesConfig';
import defaultEncounterType from '../routes/defaultEncounterType';
import { configurationService as radiologyImpressionService } from '../routes/radiologyImpressionConfig';
import { configurationService as addressLevelsService } from '../routes/addressLevels';
import { configurationService as allTestsAndPanelsService } from '../routes/allTestsAndPanelsConcept';
import { identifierTypesConfig } from '../routes/identifierTypesConfig';
import { fetchGenderMap } from '../routes/genderMap';
import { configurationService as relationshipTypeMapService } from '../routes/relationshipTypeMap';
import { relationshipTypeConfig } from '../routes/relationshipTypeConfig';
import { configurationService as loginLocationToVisitTypeMappingService } from '../routes/loginLocationToVisitTypeMapping';
import { enableAuditLog } from '../routes/enableAuditLog';
import { getHelpDeskNumber } from '../routes/helpDeskNumber';
import { prescriptionEmailToggle } from '../routes/prescriptionEmailToggle';
import quickLogoutComboKey from '../routes/quickLogoutComboKey';
import { contextCookieExpirationTimeInMinutes } from '../routes/contextCookieExpirationTimeInMinutes';

interface Configurations {
    [key: string]: any;
}

class ConfigurationsService {
    private configs: Configurations = {};

    async load(configNames: string[]): Promise<void> {
        const configPromises = configNames.map(configName => {
            switch (configName) {
                case 'encounterConfig':
                    return encounterConfig();
                case 'patientConfig':
                    return patientConfig();
                case 'patientAttributesConfig':
                    return patientAttributesService.patientAttributesConfig();
                case 'dosageFrequencyConfig':
                    return dosageFrequencyService.dosageFrequencyConfig();
                case 'dosageInstructionConfig':
                    return dosageInstructionConfig();
                case 'stoppedOrderReasonConfig':
                    return stoppedOrderReasonService.stoppedOrderReasonConfig();
                case 'consultationNoteConfig':
                    return consultationNoteConfig();
                case 'radiologyObservationConfig':
                    return radiologyObservationService.radiologyObservationConfig();
                case 'labOrderNotesConfig':
                    return labOrderNotesConfig();
                case 'defaultEncounterType':
                    return defaultEncounterType();
                case 'radiologyImpressionConfig':
                    return radiologyImpressionService.radiologyImpressionConfig();
                case 'addressLevels':
                    return addressLevelsService.addressLevels();
                case 'allTestsAndPanelsConcept':
                    return allTestsAndPanelsService.allTestsAndPanelsConcept();
                case 'identifierTypesConfig':
                    return identifierTypesConfig();
                case 'genderMap':
                    return fetchGenderMap();
                case 'relationshipTypeMap':
                    return relationshipTypeMapService.relationshipTypeMap();
                case 'relationshipTypeConfig':
                    return relationshipTypeConfig();
                case 'loginLocationToVisitTypeMapping':
                    return loginLocationToVisitTypeMappingService.loginLocationToVisitTypeMapping();
                case 'enableAuditLog':
                    return enableAuditLog();
                case 'helpDeskNumber':
                    return getHelpDeskNumber();
                case 'prescriptionEmailToggle':
                    return prescriptionEmailToggle();
                case 'quickLogoutComboKey':
                    return quickLogoutComboKey();
                case 'contextCookieExpirationTimeInMinutes':
                    return contextCookieExpirationTimeInMinutes();
                default:
                    return Promise.resolve(null);
            }
        });

        const configurations = await Promise.all(configPromises);
        configNames.forEach((configName, index) => {
            this.configs[configName] = configurations[index];
        });
    }

    dosageInstructionConfig() {
        return this.configs.dosageInstructionConfig || [];
    }

    stoppedOrderReasonConfig() {
        return this.configs.stoppedOrderReasonConfig || [];
    }

    dosageFrequencyConfig() {
        return this.configs.dosageFrequencyConfig || [];
    }

    allTestsAndPanelsConcept() {
        return this.configs.allTestsAndPanelsConcept?.results?.[0] || [];
    }

    impressionConcept() {
        return this.configs.radiologyImpressionConfig?.results?.[0] || [];
    }

    labOrderNotesConcept() {
        return this.configs.labOrderNotesConfig?.results?.[0] || [];
    }

    consultationNoteConcept() {
        return this.configs.consultationNoteConfig?.results?.[0] || [];
    }

    patientConfig() {
        return this.configs.patientConfig || {};
    }

    encounterConfig() {
        return { ...new EncounterConfig(), ...this.configs.encounterConfig || [] };
    }

    patientAttributesConfig() {
        return this.configs.patientAttributesConfig?.results;
    }

    identifierTypesConfig() {
        return this.configs.identifierTypesConfig;
    }

    genderMap() {
        return this.configs.genderMap;
    }

    addressLevels() {
        return this.configs.addressLevels;
    }

    relationshipTypes() {
        return this.configs.relationshipTypeConfig?.results || [];
    }

    relationshipTypeMap() {
        return this.configs.relationshipTypeMap || {};
    }

    loginLocationToVisitTypeMapping() {
        return this.configs.loginLocationToVisitTypeMapping || {};
    }

    defaultEncounterType() {
        return this.configs.defaultEncounterType;
    }

    helpDeskNumber() {
        return this.configs.helpDeskNumber;
    }

    prescriptionEmailToggle() {
        return this.configs.prescriptionEmailToggle;
    }

    quickLogoutComboKey() {
        return this.configs.quickLogoutComboKey;
    }

    contextCookieExpirationTimeInMinutes() {
        return this.configs.contextCookieExpirationTimeInMinutes;
    }
}

export const configurationsService = new ConfigurationsService();
