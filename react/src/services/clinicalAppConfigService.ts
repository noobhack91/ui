import UrlHelper from './urlHelper';
import appService from './appService';
import { $stateParams } from 'angular'; // Assuming $stateParams is available globally or through some other means

class ClinicalAppConfigService {
    getTreatmentActionLink() {
        return appService.getAppDescriptor().getExtensions("org.bahmni.clinical.treatment.links", "link") || [];
    }

    getAllConceptsConfig() {
        return appService.getAppDescriptor().getConfigValue("conceptSetUI") || {};
    }

    getConceptConfig(name: string) {
        const config = appService.getAppDescriptor().getConfigValue("conceptSetUI") || {};
        return config[name];
    }

    getObsIgnoreList() {
        const baseObsIgnoreList = [Bahmni.Common.Constants.impressionConcept];
        const configuredObsIgnoreList = appService.getAppDescriptor().getConfigValue("obsIgnoreList") || [];
        return baseObsIgnoreList.concat(configuredObsIgnoreList);
    }

    getAllConsultationBoards() {
        return appService.getAppDescriptor().getExtensions("org.bahmni.clinical.consultation.board", "link");
    }

    getAllConceptSetExtensions(conceptSetGroupName: string) {
        return appService.getAppDescriptor().getExtensions("org.bahmni.clinical.conceptSetGroup." + conceptSetGroupName, "config");
    }

    getOtherInvestigationsMap() {
        return appService.getAppDescriptor().getConfig("otherInvestigationsMap");
    }

    getVisitPageConfig(configSection?: string) {
        const visitSection = appService.getAppDescriptor().getConfigValue("visitPage") || {};
        return configSection ? visitSection[configSection] : visitSection;
    }

    getVisitConfig() {
        return appService.getAppDescriptor().getConfigForPage("visit");
    }

    getMedicationConfig() {
        return appService.getAppDescriptor().getConfigForPage('medication') || {};
    }

    getPrintConfig() {
        return appService.getAppDescriptor().getConfigValue("printConfig") || {};
    }

    getConsultationBoardLink() {
        const allBoards = this.getAllConsultationBoards();
        const defaultBoard = allBoards.find((board: any) => board.default);
        const urlHelper = new UrlHelper($stateParams.patientUuid);

        if ($stateParams.programUuid) {
            const programParams = `?programUuid=${$stateParams.programUuid}&enrollment=${$stateParams.enrollment}&dateEnrolled=${$stateParams.dateEnrolled}&dateCompleted=${$stateParams.dateCompleted}`;
            return `/${$stateParams.configName}${urlHelper.getPatientUrl()}/${defaultBoard.url}${programParams}`;
        } else if (defaultBoard) {
            return `/${$stateParams.configName}${urlHelper.getPatientUrl()}/${defaultBoard.url}?encounterUuid=active`;
        }
        return urlHelper.getConsultationUrl();
    }

    getDefaultVisitType() {
        return appService.getAppDescriptor().getConfigValue("defaultVisitType");
    }

    getVisitTypeForRetrospectiveEntries() {
        return appService.getAppDescriptor().getConfigValue("visitTypeForRetrospectiveEntries");
    }
}

export default ClinicalAppConfigService;
