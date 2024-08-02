const hostUrl = localStorage.getItem('host') ? `https://${localStorage.getItem('host')}` : "";
const RESTWS = `${hostUrl}/openmrs/ws/rest`;

export { RESTWS };
