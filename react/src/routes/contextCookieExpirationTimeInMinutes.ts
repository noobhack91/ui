import axios from 'axios';
import { BahmniConstants } from '../utils/constants/BahmniConstants';

export const contextCookieExpirationTimeInMinutes = async (): Promise<string> => {
    try {
        const response = await axios.get(BahmniConstants.globalPropertyUrl, {
            params: {
                property: 'bahmni.contextCookieExpirationTimeInMinutes'
            },
            withCredentials: true,
            transformResponse: [(data) => data]
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching context cookie expiration time:', error);
        throw error;
    }
};
