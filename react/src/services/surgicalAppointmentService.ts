import axios from 'axios';
import { Bahmni } from '../utils/constants/bahmni';
import { appService } from './appService';

class SurgicalAppointmentService {
    getSurgeons() {
        return axios.get(Bahmni.Common.Constants.providerUrl, {
            params: { v: "custom:(id,uuid,person:(uuid,display),attributes:(attributeType:(display),value))" },
            withCredentials: true
        });
    }

    saveSurgicalBlock(data: any) {
        return axios.post(Bahmni.OT.Constants.addSurgicalBlockUrl, data, {
            params: { v: "full" },
            withCredentials: true,
            headers: { "Accept": "application/json", "Content-Type": "application/json" }
        });
    }

    updateSurgicalBlock(data: any) {
        return axios.post(`${Bahmni.OT.Constants.addSurgicalBlockUrl}/${data.uuid}`, data, {
            params: { v: "full" },
            withCredentials: true,
            headers: { "Accept": "application/json", "Content-Type": "application/json" }
        });
    }

    updateSurgicalAppointment(data: any) {
        return axios.post(`${Bahmni.OT.Constants.updateSurgicalAppointmentUrl}/${data.uuid}`, data, {
            params: { v: "full" },
            withCredentials: true,
            headers: { "Accept": "application/json", "Content-Type": "application/json" }
        });
    }

    getSurgicalAppointmentAttributeTypes() {
        return axios.get(Bahmni.OT.Constants.surgicalAppointmentAttributeTypeUrl, {
            params: { v: "custom:(uuid,name,format)" },
            withCredentials: true
        });
    }

    getSurgicalBlockFor(surgicalBlockUuid: string) {
        return axios.get(`${Bahmni.OT.Constants.addSurgicalBlockUrl}/${surgicalBlockUuid}`, {
            params: { v: "full" },
            withCredentials: true,
            headers: { "Accept": "application/json", "Content-Type": "application/json" }
        });
    }

    getSurgicalBlocksInDateRange(startDatetime: string, endDatetime: string, includeVoided: boolean, activeBlocks: boolean) {
        const additionalCustomParam = appService.getAppDescriptor().getConfigValue("additionalCustomParam");
        return axios.get(Bahmni.OT.Constants.addSurgicalBlockUrl, {
            params: {
                startDatetime: Bahmni.Common.Util.DateUtil.parseLongDateToServerFormat(startDatetime),
                endDatetime: Bahmni.Common.Util.DateUtil.parseLongDateToServerFormat(endDatetime),
                includeVoided: includeVoided || false,
                activeBlocks: activeBlocks || false,
                v: "custom:(id,uuid," +
                    "provider:(uuid,person:(uuid,display),attributes:(attributeType:(display),value,voided))," +
                    "location:(uuid,name),startDatetime,endDatetime,surgicalAppointments:(id,uuid,patient:(uuid,display,person:(age,gender,birthdate))," +
                    "actualStartDatetime,actualEndDatetime,status,notes,sortWeight,bedNumber,bedLocation,surgicalAppointmentAttributes" +
                    (additionalCustomParam ? "," + additionalCustomParam : "") + "))"
            },
            withCredentials: true
        });
    }

    getPrimaryDiagnosisConfigForOT() {
        return axios.get(Bahmni.Common.Constants.globalPropertyUrl, {
            params: {
                property: 'obs.conceptMappingsForOT'
            },
            withCredentials: true,
            headers: {
                Accept: 'text/plain'
            }
        });
    }

    getBulkNotes(startDate: string, endDate: string) {
        return axios.get(Bahmni.OT.Constants.notesUrl, {
            params: {
                noteType: 'OT Module',
                noteStartDate: startDate,
                noteEndDate: endDate
            },
            withCredentials: true
        });
    }
}

export const surgicalAppointmentService = new SurgicalAppointmentService();
