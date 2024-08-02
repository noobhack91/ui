import axios from 'axios';
import { BahmniConstants } from '../utils/constants/BahmniConstants';

export const stoppedOrderReasonConfig = async (): Promise<any[]> => {
    try {
        const response = await axios.get(BahmniConstants.globalPropertyUrl, {
            params: {
                property: 'bahmni.stoppedOrderReasonConfig'
            },
            withCredentials: true,
            transformResponse: [(data) => data]
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching stopped order reason config:', error);
        throw error;
    }
};
