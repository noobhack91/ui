import axios from 'axios';
import { BahmniConstants } from '../utils/constants/BahmniConstants';

export const configurationService = {
    relationshipTypeMap: async function () {
        try {
            const response = await axios.get(BahmniConstants.globalPropertyUrl, {
                params: {
                    property: 'bahmni.relationshipTypeMap'
                },
                withCredentials: true
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching relationship type map:', error);
            throw error;
        }
    }
};
