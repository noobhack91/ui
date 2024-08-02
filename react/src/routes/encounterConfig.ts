import axios from 'axios';
import { BahmniCommonConstants } from '../utils/constants/BahmniCommonConstants';

export const encounterConfig = async () => {
    try {
        const response = await axios.get(BahmniCommonConstants.encounterConfigurationUrl, {
            params: { "callerContext": "REGISTRATION_CONCEPTS" },
            withCredentials: true
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching encounter configuration:', error);
        throw error;
    }
};
