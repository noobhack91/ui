﻿const hostUrl = "http://example.com"; // Replace with actual host URL
const RESTWS_V1 = `${hostUrl}/openmrs/ws/rest/v1`;

export const patientImageUrlByPatientUuid = `${RESTWS_V1}/patientImage?patientUuid=`;
