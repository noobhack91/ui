import axios from 'axios';
import { BahmniCommonConstants } from '../utils/constants/BahmniCommonConstants';

export const labOrderNotesConfig = async () => {
    try {
        const response = await axios.get(BahmniCommonConstants.conceptSearchByFullNameUrl, {
            params: {
                v: 'custom:(uuid,name)',
                name: BahmniCommonConstants.labOrderNotesConcept
            },
            withCredentials: true
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching lab order notes config:', error);
        throw error;
    }
};
