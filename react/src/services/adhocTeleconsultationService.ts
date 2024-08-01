import axios from 'axios';
import { Bahmni } from '../utils/constants/Bahmni';

class AdhocTeleconsultationService {
    generateAdhocTeleconsultationLink(params: any) {
        return axios.get(Bahmni.Common.Constants.adhocTeleconsultationLinkServiceUrl, {
            params: params
        });
    }
}

export default new AdhocTeleconsultationService();
