const hostUrl = localStorage.getItem('host') ? `https://${localStorage.getItem('host')}` : "";
const BASE_URL = `${hostUrl}/bahmni_config/openmrs/apps/`;

export { BASE_URL };
