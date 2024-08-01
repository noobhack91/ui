import axios from 'axios';
import { BahmniConstants } from '../utils/constants/BahmniConstants';

interface FormDataParams {
    s: string;
    patient: string;
    numberOfVisits: number;
    v: string;
    conceptNames: string | null;
    patientProgramUuid: string;
}

class VisitFormService {
    async formData(patientUuid: string, numberOfVisits: number, formGroup: string | null, patientProgramUuid: string) {
        const params: FormDataParams = {
            s: "byPatientUuid",
            patient: patientUuid,
            numberOfVisits: numberOfVisits,
            v: "visitFormDetails",
            conceptNames: formGroup,
            patientProgramUuid: patientProgramUuid
        };
        try {
            const response = await axios.get(BahmniConstants.formDataUrl, { params: params });
            return response.data;
        } catch (error) {
            console.error('Error fetching form data', error);
            throw error;
        }
    }
}

export default new VisitFormService();
