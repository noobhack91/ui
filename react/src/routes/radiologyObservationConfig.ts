import axios from 'axios';
import { BahmniConstants } from '../utils/constants/BahmniConstants';

export const configurationService = {
    radiologyObservationConfig: async function () {
        try {
            const response = await axios.get(BahmniConstants.conceptSearchByFullNameUrl, {
                params: { v: 'custom:(uuid,name)', name: BahmniConstants.radiologyResultConceptName },
                withCredentials: true
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching radiology observation config:', error);
            throw error;
        }
    }
};
