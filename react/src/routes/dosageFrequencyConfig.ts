import axios from 'axios';
import { BahmniConstants } from '../utils/constants/BahmniConstants';

export const dosageFrequencyConfig = async (): Promise<any[]> => {
    try {
        const response = await axios.get(BahmniConstants.globalPropertyUrl, {
            params: {
                property: 'bahmni.dosageFrequencyConfig'
            },
            withCredentials: true,
            transformResponse: [(data) => JSON.parse(data)]
        });
        return response.data || [];
    } catch (error) {
        console.error('Error fetching dosage frequency config:', error);
        throw error;
    }
};
