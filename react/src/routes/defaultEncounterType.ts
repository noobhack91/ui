import axios from 'axios';
import { Bahmni } from '../utils/constants/Bahmni';

export const defaultEncounterType = async () => {
    try {
        const response = await axios.get(Bahmni.Common.Constants.globalPropertyUrl, {
            params: {
                property: 'bahmni.encounterType.default'
            },
            withCredentials: true,
            transformResponse: [(data) => {
                return data;
            }]
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching default encounter type:', error);
        throw error;
    }
};
