import axios from 'axios';
import { Bahmni } from '../utils/constants/Bahmni';

export const relationshipTypeMap = async () => {
    try {
        const response = await axios.get(Bahmni.Common.Constants.globalPropertyUrl, {
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
};
