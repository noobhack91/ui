import axios from 'axios';

const HELP_DESK_NUMBER_PROPERTY = 'clinic.helpDeskNumber';
const GLOBAL_PROPERTY_URL = '/openmrs/ws/rest/v1/globalproperty';

export const getHelpDeskNumber = async (): Promise<string> => {
    try {
        const response = await axios.get(GLOBAL_PROPERTY_URL, {
            params: {
                property: HELP_DESK_NUMBER_PROPERTY
            },
            withCredentials: true,
            transformResponse: [(data) => data]
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching help desk number:', error);
        throw error;
    }
};
