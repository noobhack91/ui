// react/src/utils/constants/RESTWS_V1.ts

const hostUrl = localStorage.getItem('host') ? `https://${localStorage.getItem('host')}` : '';
const RESTWS = `${hostUrl}/openmrs/ws/rest`;
const RESTWS_V1 = `${hostUrl}/openmrs/ws/rest/v1`;

export { RESTWS_V1 };
