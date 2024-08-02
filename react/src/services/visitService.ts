import axios from 'axios';
import { BahmniCommonConstants } from '../utils/constants/BahmniCommonConstants';

class VisitService {
    getVisit(uuid: string, params?: string) {
        const parameters = params ? params : "custom:(uuid,visitId,visitType,patient,encounters:(uuid,encounterType,voided,orders:(uuid,orderType,voided,concept:(uuid,set,name),),obs:(uuid,value,concept,obsDatetime,groupMembers:(uuid,concept:(uuid,name),obsDatetime,value:(uuid,name),groupMembers:(uuid,concept:(uuid,name),value:(uuid,name),groupMembers:(uuid,concept:(uuid,name),value:(uuid,name)))))))";
        return axios.get(`${BahmniCommonConstants.visitUrl}/${uuid}`, {
            params: {
                v: parameters
            }
        });
    }

    endVisit(visitUuid: string) {
        return axios.post(`${BahmniCommonConstants.endVisitUrl}?visitUuid=${visitUuid}`, {}, {
            withCredentials: true
        });
    }

    endVisitAndCreateEncounter(visitUuid: string, bahmniEncounterTransaction: any) {
        return axios.post(`${BahmniCommonConstants.endVisitAndCreateEncounterUrl}?visitUuid=${visitUuid}`, bahmniEncounterTransaction, {
            withCredentials: true
        });
    }

    updateVisit(visitUuid: string, attributes: any) {
        return axios.post(`${BahmniCommonConstants.visitUrl}/${visitUuid}`, attributes, {
            withCredentials: true
        });
    }

    createVisit(visitDetails: any) {
        return axios.post(BahmniCommonConstants.visitUrl, visitDetails, {
            withCredentials: true
        });
    }

    checkIfActiveVisitExists(patientUuid: string, visitLocationUuid: string) {
        return axios.get(BahmniCommonConstants.visitUrl, {
            params: {
                includeInactive: false,
                patient: patientUuid,
                location: visitLocationUuid
            },
            withCredentials: true
        });
    }

    getVisitSummary(visitUuid: string) {
        return axios.get(BahmniCommonConstants.visitSummaryUrl, {
            params: {
                visitUuid: visitUuid
            },
            withCredentials: true
        });
    }

    search(parameters: any) {
        return axios.get(BahmniCommonConstants.visitUrl, {
            params: parameters,
            withCredentials: true
        });
    }

    getVisitType() {
        return axios.get(BahmniCommonConstants.visitTypeUrl, {
            withCredentials: true
        });
    }
}

export default new VisitService();
