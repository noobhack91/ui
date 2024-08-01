import axios from 'axios';
import { Bahmni } from '../utils/constants/bahmni';

export const configurationService = {
    allTestsAndPanelsConcept: async function () {
        try {
            const response = await axios.get(Bahmni.Common.Constants.conceptSearchByFullNameUrl, {
                params: {
                    v: 'custom:(uuid,name:(uuid,name),setMembers:(uuid,name:(uuid,name)))',
                    name: Bahmni.Common.Constants.allTestsAndPanelsConceptName
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
