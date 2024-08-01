import axios from 'axios';

const quickLogoutComboKey = async () => {
    try {
        const response = await axios.get('/openmrs/ws/rest/v1/bahmniie/globalProperty', {
            params: {
                property: 'bahmni.quickLogoutComboKey'
            },
            withCredentials: true,
            transformResponse: [(data) => {
                return data;
            }]
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching quickLogoutComboKey:', error);
        throw error;
    }
};

export default quickLogoutComboKey;
