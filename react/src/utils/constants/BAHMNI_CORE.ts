const hostUrl = localStorage.getItem('host') ? `https://${localStorage.getItem('host')}` : "";
const RESTWS_V1 = `${hostUrl}/openmrs/ws/rest/v1`;
const BAHMNI_CORE = `${RESTWS_V1}/bahmnicore`;

export { BAHMNI_CORE };
