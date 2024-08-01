import axios from 'axios';
import { BahmniConstants } from '../utils/constants/BahmniConstants';

export const configurationService = {
    stoppedOrderReasonConfig: async function () {
        try {
            const response = await axios.get(BahmniConstants.conceptSearchByFullNameUrl, {
                params: {
                    v: 'custom:(uuid,name,answers)',
                    name: BahmniConstants.stoppedOrderReasonConceptName
                },
                withCredentials: true
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching stopped order reason config:', error);
            throw error;
        }
    }
};
