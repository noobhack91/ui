import axios from 'axios';
import { hostUrl } from '../utils/constants/hostUrl';
import { RESTWS_V1 } from '../utils/constants/RESTWS_V1';

interface Patient {
    uuid?: string;
    identifierPrefix?: { prefix: string };
    // Add other patient properties as needed
}

interface Config {
    params?: { identifier?: string };
    // Add other config properties as needed
}

class PatientServiceStrategy {
    private openmrsUrl: string;
    private baseOpenMRSRESTURL: string;

    constructor() {
        this.openmrsUrl = hostUrl;
        this.baseOpenMRSRESTURL = RESTWS_V1;
    }

    search(config?: Config): Promise<any> {
        const patientSearchUrl = config && config.params?.identifier
            ? `${this.baseOpenMRSRESTURL}/patient/lucene`
            : `${this.baseOpenMRSRESTURL}/patient`;

        return axios.get(patientSearchUrl, config)
            .then(response => response.data)
            .catch(error => Promise.reject(error));
    }

    getByUuid(uuid: string): Promise<any> {
        const url = `${this.openmrsUrl}/ws/rest/v1/patientprofile/${uuid}`;
        const config = {
            params: { v: 'full' },
            withCredentials: true
        };

        return axios.get(url, config)
            .then(response => response.data)
            .catch(error => Promise.reject(error));
    }

    create(patient: Patient, jumpAccepted: boolean): Promise<any> {
        // SECOND AGENT: [MISSING CONTEXT] - Need the implementation details for CreatePatientRequestMapper and $rootScope.patientConfiguration.attributeTypes
        return Promise.resolve();
    }

    update(patient: Patient, openMRSPatient: Patient, attributeTypes: any): Promise<any> {
        // SECOND AGENT: [MISSING CONTEXT] - Need the implementation details for UpdatePatientRequestMapper and moment()
        return Promise.resolve();
    }

    generateIdentifier(patient: Patient): Promise<any> {
        const data = { identifierSourceName: patient.identifierPrefix ? patient.identifierPrefix.prefix : '' };
        const url = `${this.openmrsUrl}/ws/rest/v1/idgen`;
        const config = {
            withCredentials: true,
            headers: { 'Accept': 'text/plain', 'Content-Type': 'application/json' }
        };

        return axios.post(url, data, config)
            .then(response => response.data)
            .catch(error => Promise.reject(error));
    }
}

export default new PatientServiceStrategy();
