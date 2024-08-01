import axios from 'axios';
import { BahmniConstants } from '../utils/constants/BahmniConstants';

export const configurationService = {
    loginLocationToVisitTypeMapping: async function () {
        const url = BahmniConstants.entityMappingUrl;
        try {
            const response = await axios.get(url, {
                params: {
                    mappingType: 'loginlocation_visittype',
                    s: 'byEntityAndMappingType'
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching login location to visit type mapping:', error);
            throw error;
        }
    }
};
