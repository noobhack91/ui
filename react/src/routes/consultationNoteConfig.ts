import axios from 'axios';
import { BahmniCommonConstants } from '../utils/constants/BahmniCommonConstants';

export const consultationNoteConfig = async () => {
    try {
        const response = await axios.get(BahmniCommonConstants.conceptSearchByFullNameUrl, {
            params: {
                v: 'custom:(uuid,name,answers)',
                name: BahmniCommonConstants.consultationNoteConceptName
            },
            withCredentials: true
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching consultation note config:', error);
        throw error;
    }
};
