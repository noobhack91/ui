import { useTranslation } from 'react-i18next';
import appService from './appService';

interface Observation {
    groupMembers: Observation[];
    formNamespace: string | null;
    obsGroupUuid: string | null;
    concept: {
        name: string;
        conceptClass: string;
        conceptSortWeight: number;
    };
    value: {
        name?: string;
    } | string;
}

const useConceptGroupFormatService = () => {
    const { t } = useTranslation();
    const conceptGroupFormatConfig = appService.getAppDescriptor().getConfigValue("obsGroupDisplayFormat") || {};

    const isConceptDefinedInConfig = (observation: Observation) => {
        if (observation.groupMembers.length > 0) {
            if ((observation.formNamespace === null && observation.obsGroupUuid !== null) || observation.formNamespace !== null) {
                return conceptGroupFormatConfig.hasOwnProperty(observation.concept.name);
            }
        }
        return false;
    };

    const isConceptClassConceptDetails = (observation: Observation) => {
        return observation.concept.conceptClass === "Concept Details";
    };

    const isObsGroupFormatted = (observation: Observation) => {
        return isConceptClassConceptDetails(observation) || isConceptDefinedInConfig(observation);
    };

    const groupObs = (observation: Observation) => {
        if (conceptGroupFormatConfig !== {}) {
            if (isConceptDefinedInConfig(observation)) {
                const group = conceptGroupFormatConfig[observation.concept.name];
                const interpolateParams: { [key: string]: string } = {};
                observation.groupMembers.forEach((item) => {
                    if (group.displayObsFormat.concepts.includes(item.concept.name)) {
                        interpolateParams[item.concept.name.replace(/[ ()/,]+/g, '')] = item.value.name || item.value;
                    }
                });
                return t(group.displayObsFormat.translationKey, interpolateParams);
            }
        }

        if (isConceptClassConceptDetails(observation) && observation.groupMembers.length > 0) {
            const sortedGroupMembers = observation.groupMembers.sort((a, b) => a.concept.conceptSortWeight - b.concept.conceptSortWeight);
            const obsValueList: string[] = [];
            sortedGroupMembers.forEach((obs) => {
                if (obs.concept.conceptClass !== "Abnormal") {
                    if (obs.value && typeof obs.value === 'object' && obs.value.name) {
                        obsValueList.push(obs.value.name);
                    } else {
                        obsValueList.push(obs.value as string);
                    }
                }
            });
            return obsValueList.join(", ");
        }
    };

    const getConfig = () => {
        return conceptGroupFormatConfig;
    };

    return {
        getConfig,
        groupObs,
        isObsGroupFormatted
    };
};

export default useConceptGroupFormatService;
