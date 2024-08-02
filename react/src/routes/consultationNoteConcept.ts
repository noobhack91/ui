import axios from 'axios';
import { BahmniConstants } from '../utils/constants/BahmniConstants';

export const consultationNoteConcept = async (): Promise<any> => {
    try {
        const response = await axios.get(BahmniConstants.globalPropertyUrl, {
            params: {
                property: 'bahmni.consultationNoteConcept'
            },
            withCredentials: true,
            transformResponse: [(data) => data]
        });
        return response.data && response.data.results && response.data.results[0] ? response.data.results[0] : [];
    } catch (error) {
        console.error('Error fetching consultation note concept:', error);
        throw error;
    }
};
