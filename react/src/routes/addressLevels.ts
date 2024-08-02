import axios from 'axios';
import { BahmniCommonConstants } from '../utils/constants/BahmniCommonConstants';

export const configurationService = {
    addressLevels: async function () {
        try {
            const response = await axios.get(
                `${BahmniCommonConstants.openmrsUrl}/module/addresshierarchy/ajax/getOrderedAddressHierarchyLevels.form`,
                { withCredentials: true }
            );
            return response.data;
        } catch (error) {
            console.error('Error fetching address levels:', error);
            throw error;
        }
    }
};
