import axios from 'axios';
import { BahmniCommonConstants } from '../utils/constants/BahmniCommonConstants';

export const enableAuditLog = async () => {
    try {
        const response = await axios.get(BahmniCommonConstants.globalPropertyUrl, {
            params: {
                property: 'bahmni.enableAuditLog'
            },
            withCredentials: true
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching audit log configuration:', error);
        throw error;
    }
};
