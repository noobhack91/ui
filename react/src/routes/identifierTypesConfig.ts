import axios from 'axios';
import { BahmniCommonConstants } from '../utils/constants/BahmniCommonConstants';

export const identifierTypesConfig = async () => {
    try {
        const response = await axios.get(BahmniCommonConstants.idgenConfigurationURL, {
            withCredentials: true
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching identifier types config:', error);
        throw error;
    }
};
