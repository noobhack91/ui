import axios from 'axios';

const BAHMNI_COMMON_CONSTANTS = {
    globalPropertyUrl: '/openmrs/ws/rest/v1/bahmnicore/config/globalproperty'
};

export const contextCookieExpirationTimeInMinutes = async (): Promise<string> => {
    try {
        const response = await axios.get(BAHMNI_COMMON_CONSTANTS.globalPropertyUrl, {
            params: {
                property: 'bahmni.contextCookieExpirationTimeInMinutes'
            },
            withCredentials: true
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching context cookie expiration time:', error);
        throw error;
    }
};
