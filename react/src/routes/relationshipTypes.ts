import axios from 'axios';
import { BahmniConstants } from '../utils/constants/BahmniConstants';

export const getRelationshipTypes = async (): Promise<any[]> => {
    try {
        const response = await axios.get(BahmniConstants.globalPropertyUrl, {
            params: {
                property: 'relationshipTypeConfig'
            },
            withCredentials: true,
            transformResponse: [(data) => JSON.parse(data)]
        });
        return response.data.results || [];
    } catch (error) {
        console.error('Error fetching relationship types:', error);
        throw error;
    }
};
