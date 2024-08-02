// react/src/utils/constants/IE_APPS_API.ts

const hostUrl = localStorage.getItem('host') ? `https://${localStorage.getItem('host')}` : "";
const RESTWS_V1 = `${hostUrl}/openmrs/ws/rest/v1`;

export const IE_APPS_API = `${RESTWS_V1}/bahmniie`;
