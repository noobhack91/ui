import axios from 'axios';
import { getCookie } from '../utils/cookieStore';
import { BahmniConstants } from '../utils/constants/BahmniConstants';

class LocationService {
    async getAllByTag(tags: string, operator: string = "ALL") {
        const response = await axios.get(BahmniConstants.locationUrl, {
            params: { s: "byTags", tags: tags || "", v: "default", operator: operator },
            cache: true
        });
        return response.data;
    }

    async getByUuid(locationUuid: string) {
        const response = await axios.get(`${BahmniConstants.locationUrl}/${locationUuid}`, {
            cache: true
        });
        return response.data;
    }

    async getLoggedInLocation() {
        const cookie = getCookie(BahmniConstants.locationCookieName);
        if (cookie && cookie.uuid) {
            return this.getByUuid(cookie.uuid);
        }
        throw new Error('No logged in location found in cookies');
    }

    async getVisitLocation(locationUuid: string) {
        const response = await axios.get(`${BahmniConstants.bahmniVisitLocationUrl}/${locationUuid}`, {
            headers: { "Accept": "application/json" }
        });
        return response.data;
    }

    async getFacilityVisitLocation() {
        const cookie = getCookie(BahmniConstants.locationCookieName);
        if (cookie && cookie.uuid) {
            const response = await axios.get(`${BahmniConstants.bahmniFacilityLocationUrl}/${cookie.uuid}`, {
                cache: true
            });
            return response.data;
        }
        throw new Error('No facility visit location found in cookies');
    }
}

export default new LocationService();
