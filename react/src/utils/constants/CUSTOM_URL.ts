// react/src/utils/constants/CUSTOM_URL.ts

const hostUrl = localStorage.getItem('host') ? `https://${localStorage.getItem('host')}` : '';
const CUSTOM_URL = `${hostUrl}/implementation_config/openmrs/apps/`;

export { CUSTOM_URL };
