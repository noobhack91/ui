import axios from 'axios';
import { BahmniConstants } from '../utils/constants/BahmniConstants';

export interface PatientConfig {
    // Define the structure of patientConfig here
    // SECOND AGENT: [MISSING CONTEXT] - Define the properties of the patientConfig object based on the AngularJS codebase
}

export const getPatientConfig = async (): Promise<PatientConfig> => {
    try {
        const response = await axios.get(BahmniConstants.globalPropertyUrl, {
            params: {
                property: 'bahmni.patientConfig'
            },
            withCredentials: true,
            transformResponse: [(data) => data]
        });
        return JSON.parse(response.data);
    } catch (error) {
        console.error('Error fetching patient config:', error);
        throw error;
    }
};
