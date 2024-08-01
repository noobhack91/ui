import axios from 'axios';
import { BahmniCommonConstants } from '../utils/constants/BahmniCommonConstants';

export const patientConfig = async () => {
    try {
        const response = await axios.get(BahmniCommonConstants.patientConfigurationUrl, {
            withCredentials: true
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching patient configuration:', error);
        throw error;
    }
};
