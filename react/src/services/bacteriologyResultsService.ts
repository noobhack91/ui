import axios from 'axios';
import { BahmniCommonConstants } from '../utils/constants/BahmniCommonConstants';

interface BacteriologyResultsParams {
    patientUuid?: string;
    patientProgramUuid?: string;
}

interface Specimen {
    // Define the structure of the specimen object here
}

class BacteriologyResultsService {
    static getBacteriologyResults(data: BacteriologyResultsParams) {
        let params: any = {
            patientUuid: data.patientUuid,
            name: "BACTERIOLOGY CONCEPT SET",
            v: "full"
        };

        if (data.patientProgramUuid) {
            params = {
                patientProgramUuid: data.patientProgramUuid,
                s: "byPatientProgram",
                v: "full"
            };
        }

        return axios.get(BahmniCommonConstants.bahmniBacteriologyResultsUrl, {
            params: params,
            withCredentials: true
        });
    }

    static saveBacteriologyResults(specimen: Specimen) {
        return axios.post(BahmniCommonConstants.bahmniBacteriologyResultsUrl, specimen, {
            withCredentials: true
        });
    }
}

export default BacteriologyResultsService;
