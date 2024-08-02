import axios from 'axios';
import { BahmniConstants } from '../utils/constants/BahmniConstants';

export const configurationService = {
    allTestsAndPanelsConcept: async function () {
        try {
            const response = await axios.get(BahmniConstants.conceptSearchByFullNameUrl, {
                params: {
                    v: 'custom:(uuid,name:(uuid,name),setMembers:(uuid,name:(uuid,name)))',
                    name: BahmniConstants.allTestsAndPanelsConceptName
                },
                withCredentials: true
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching all tests and panels concept:', error);
            throw error;
        }
    }
};
