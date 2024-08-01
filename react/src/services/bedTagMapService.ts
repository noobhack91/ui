import axios from 'axios';
import { getAllBedTags, bedTagMapUrl } from '../utils/constants/BahmniIPDConstants';

class BedTagMapService {
    async getAllBedTags() {
        try {
            const response = await axios.get(getAllBedTags, {
                params: {},
                withCredentials: true
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching bed tags:', error);
            throw error;
        }
    }

    async assignTagToABed(bedTagId: number, bedId: number) {
        const requestPayload = {
            "bedTag": { "id": bedTagId },
            "bed": { "id": bedId }
        };
        const headers = { "Content-Type": "application/json", "Accept": "application/json" };
        try {
            const response = await axios.post(bedTagMapUrl, requestPayload, { headers });
            return response.data;
        } catch (error) {
            console.error('Error assigning tag to bed:', error);
            throw error;
        }
    }

    async unAssignTagFromTheBed(bedTagMapUuid: string) {
        try {
            const response = await axios.delete(`${bedTagMapUrl}${bedTagMapUuid}`);
            return response.data;
        } catch (error) {
            console.error('Error unassigning tag from bed:', error);
            throw error;
        }
    }
}

export default new BedTagMapService();
