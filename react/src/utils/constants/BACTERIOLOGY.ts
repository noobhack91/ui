const hostUrl = localStorage.getItem('host') ? ("https://" + localStorage.getItem('host')) : "";
const RESTWS_V1 = hostUrl + "/openmrs/ws/rest/v1";

export const BACTERIOLOGY = RESTWS_V1;
