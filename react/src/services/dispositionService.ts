import axios from 'axios';
import { BahmniConstants } from '../utils/constants/BahmniConstants';

class DispositionService {
    getDispositionActions() {
        return axios.get(`${BahmniConstants.conceptSearchByFullNameUrl}&name=${BahmniConstants.dispositionConcept}&v=custom:(uuid,name,answers:(uuid,name,mappings))`, { cache: true });
    }

    getDispositionNoteConcept() {
        return axios.get(`${BahmniConstants.conceptSearchByFullNameUrl}&name=${BahmniConstants.dispositionNoteConcept}&v=custom:(uuid,name:(name))`, { cache: true });
    }

    getDispositionByVisit(visitUuid: string, locale: string) {
        return axios.get(BahmniConstants.bahmniDispositionByVisitUrl, {
            params: {
                visitUuid: visitUuid,
                locale: locale
            }
        });
    }

    getDispositionByPatient(patientUuid: string, numberOfVisits: number, locale: string) {
        return axios.get(BahmniConstants.bahmniDispositionByPatientUrl, {
            params: {
                patientUuid: patientUuid,
                numberOfVisits: numberOfVisits,
                locale: locale
            }
        });
    }
}

export default new DispositionService();
