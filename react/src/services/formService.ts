import axios from 'axios';
import { BahmniCommonConstants } from '../utils/constants/BahmniCommonConstants';

class FormService {
    getFormList(encounterUuid: string) {
        return axios.get(BahmniCommonConstants.latestPublishedForms, {
            params: { encounterUuid: encounterUuid }
        });
    }

    getAllForms() {
        return axios.get(BahmniCommonConstants.allFormsUrl, {
            params: { v: "custom:(version,name,uuid)" }
        });
    }

    getFormDetail(formUuid: string, params: any) {
        return axios.get(`${BahmniCommonConstants.formUrl}/${formUuid}`, {
            params: params
        });
    }

    private getUrlWithUuid(url: string, patientUuid: string) {
        return url.replace('{patientUuid}', patientUuid);
    }

    getAllPatientForms(patientUuid: string, numberOfVisits: number, patientProgramUuid: string) {
        const patientFormsUrl = this.getUrlWithUuid(BahmniCommonConstants.patientFormsUrl, patientUuid);
        const params = {
            numberOfVisits: numberOfVisits,
            formType: 'v2',
            patientProgramUuid: patientProgramUuid
        };
        return axios.get(patientFormsUrl, {
            params: params
        });
    }

    getFormTranslations(url: string, form: any) {
        if (url && url !== BahmniCommonConstants.formTranslationsUrl) {
            return axios.get(url);
        }
        return axios.get(BahmniCommonConstants.formTranslationsUrl, {
            params: form
        });
    }

    getFormTranslate(formName: string, formVersion: string, locale: string, formUuid: string) {
        return axios.get(BahmniCommonConstants.formBuilderTranslationApi, {
            params: {
                formName: formName,
                formVersion: formVersion,
                locale: locale,
                formUuid: formUuid
            }
        });
    }
}

export default new FormService();
