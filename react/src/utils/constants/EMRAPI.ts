// react/src/utils/constants/EMRAPI.ts

const hostUrl = localStorage.getItem('host') ? `https://${localStorage.getItem('host')}` : '';
const RESTWS = `${hostUrl}/openmrs/ws/rest`;

export const EMRAPI = {
    diagnosisUrl: `${RESTWS}/emrapi/diagnosis`,
    conceptUrl: `${RESTWS}/emrapi/concept`,
    encounterUrl: `${RESTWS}/emrapi/encounter`,
    conditionUrl: `${RESTWS}/emrapi/condition`,
    conditionHistoryUrl: `${RESTWS}/emrapi/conditionhistory`
};

export type EMRAPIType = {
    diagnosisUrl: string;
    conceptUrl: string;
    encounterUrl: string;
    conditionUrl: string;
    conditionHistoryUrl: string;
};
