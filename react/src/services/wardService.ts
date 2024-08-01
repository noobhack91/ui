import axios from 'axios';
import { Bahmni } from '../utils/constants/Bahmni';

class WardService {
    async bedsForWard(uuid: string) {
        try {
            const response = await axios.get(`${Bahmni.IPD.Constants.admissionLocationUrl}${uuid}`, {
                params: { v: "full" },
                withCredentials: true
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching beds for ward:', error);
            throw error;
        }
    }

    async getWardsList() {
        try {
            const response = await axios.get(Bahmni.IPD.Constants.admissionLocationUrl);
            return response.data;
        } catch (error) {
            console.error('Error fetching wards list:', error);
            throw error;
        }
    }
}

export default new WardService();
