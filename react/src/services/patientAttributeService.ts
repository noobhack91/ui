import axios from 'axios';
import { BahmniConstants } from '../utils/constants/BahmniConstants';

interface UrlMap {
    personName: string;
    personAttribute: string;
}

class PatientAttributeService {
    private urlMap: UrlMap;

    constructor() {
        this.urlMap = {
            personName: BahmniConstants.bahmniSearchUrl + "/personname",
            personAttribute: BahmniConstants.bahmniSearchUrl + "/personattribute"
        };
    }

    public async search(fieldName: string, query: string, type: keyof UrlMap) {
        const url = this.urlMap[type];
        const queryWithoutTrailingSpaces = query.trimLeft();

        try {
            const response = await axios.get(url, {
                params: { q: queryWithoutTrailingSpaces, key: fieldName },
                withCredentials: true
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    }
}

export default new PatientAttributeService();
