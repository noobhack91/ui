import axios from 'axios';
import { Bahmni } from '../utils/constants/Bahmni';

export const encounterConfig = async () => {
    try {
        const response = await axios.get(Bahmni.Common.Constants.encounterConfigurationUrl, {
            params: { "callerContext": "REGISTRATION_CONCEPTS" },
            withCredentials: true
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching encounter configuration:', error);
        throw error;
    }
};
