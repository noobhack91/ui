// react/src/utils/constants/FHIR_BASE_URL.ts

const hostUrl = localStorage.getItem('host') ? `https://${localStorage.getItem('host')}` : "";
export const FHIR_BASE_URL = `${hostUrl}/openmrs/ws/fhir2/R4`;
