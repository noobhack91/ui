import axios from 'axios';

interface PatientAttributesConfig {
    results: any[];
}

export const getPatientAttributesConfig = async (): Promise<PatientAttributesConfig> => {
    try {
        const response = await axios.get('/path/to/patientAttributesConfig');
        return response.data;
    } catch (error) {
        console.error('Error fetching patient attributes config:', error);
        return { results: [] };
    }
};
