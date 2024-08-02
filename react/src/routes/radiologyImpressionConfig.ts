import axios from 'axios';
import { Bahmni } from '../utils/constants/bahmni';

export const configurationService = {
    radiologyImpressionConfig: async function () {
        try {
            const response = await axios.get(Bahmni.Common.Constants.conceptSearchByFullNameUrl, {
                params: { v: 'custom:(uuid,name)', name: Bahmni.Common.Constants.impressionConcept },
                withCredentials: true
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching radiology impression config:', error);
            throw error;
        }
    }
};
