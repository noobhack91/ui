import axios from 'axios';
import { BahmniConstants } from '../utils/constants/BahmniConstants';

export const impressionConcept = async (): Promise<any> => {
    try {
        const response = await axios.get(BahmniConstants.globalPropertyUrl, {
            params: {
                property: 'bahmni.radiologyImpressionConfig'
            },
            withCredentials: true,
            transformResponse: [(data) => data]
        });
        const config = JSON.parse(response.data);
        return config && config.results && config.results[0] ? config.results[0] : [];
    } catch (error) {
        console.error('Error fetching radiology impression config:', error);
        throw error;
    }
};
