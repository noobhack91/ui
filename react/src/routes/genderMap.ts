import axios from 'axios';
import { Bahmni } from '../utils/constants/Bahmni';

export const configurationService = {
    genderMap: async function () {
        try {
            const response = await axios.get(Bahmni.Common.Constants.globalPropertyUrl, {
                params: {
                    property: 'mrs.genders'
                },
                withCredentials: true
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching gender map configuration:', error);
            throw error;
        }
    }
};
