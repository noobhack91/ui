const hostUrl = localStorage.getItem('host') ? `https://${localStorage.getItem('host')}` : "";

export const CUSTOM_URL = `${hostUrl}/implementation_config/openmrs/apps/`;
