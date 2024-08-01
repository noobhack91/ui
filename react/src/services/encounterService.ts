import axios from 'axios';
import { BahmniConstants } from '../utils/constants/BahmniConstants';
import { configurationsService } from './configurationsService';

interface Encounter {
    observations?: any[];
    providers?: any[];
    extensions?: any;
}

class EncounterService {
    private stripExtraConceptInfo(obs: any) {
        this.deleteIfImageOrVideoObsIsVoided(obs);
        obs.concept = { uuid: obs.concept.uuid, name: obs.concept.name, dataType: obs.concept.dataType };
        obs.groupMembers = obs.groupMembers || [];
        obs.groupMembers.forEach((groupMember: any) => {
            this.stripExtraConceptInfo(groupMember);
        });
    }

    private deleteIfImageOrVideoObsIsVoided(obs: any) {
        if (obs.voided && obs.groupMembers && !obs.groupMembers.length && obs.value
            && this.isObsConceptClassVideoOrImage(obs)) {
            const url = `${BahmniConstants.RESTWS_V1}/bahmnicore/visitDocument?filename=${obs.value}`;
            axios.delete(url, { withCredentials: true });
        }
    }

    private isObsConceptClassVideoOrImage(obs: any) {
        return (obs.concept.conceptClass === 'Video' || obs.concept.conceptClass === 'Image');
    }

    private getBacteriologyGroupMembers(encounter: Encounter) {
        const addBacteriologyMember = (bacteriologyGroupMembers: any[], member: any) => {
            bacteriologyGroupMembers = member.groupMembers.length ? bacteriologyGroupMembers.concat(member.groupMembers) :
                bacteriologyGroupMembers.concat(member);
            return bacteriologyGroupMembers;
        };

        return encounter.extensions && encounter.extensions.mdrtbSpecimen ? encounter.extensions.mdrtbSpecimen.map((observation: any) => {
            let bacteriologyGroupMembers: any[] = [];
            observation.sample.additionalAttributes && observation.sample.additionalAttributes.groupMembers.forEach((member: any) => {
                bacteriologyGroupMembers = addBacteriologyMember(bacteriologyGroupMembers, member);
            });

            observation.report.results && observation.report.results.groupMembers.forEach((member: any) => {
                bacteriologyGroupMembers = addBacteriologyMember(bacteriologyGroupMembers, member);
            });
            return bacteriologyGroupMembers;
        }) : [];
    }

    private async getDefaultEncounterType() {
        const url = BahmniConstants.encounterTypeUrl;
        const response = await axios.get(`${url}/${configurationsService.defaultEncounterType()}`);
        return response.data;
    }

    private async getEncounterTypeBasedOnLoginLocation(loginLocationUuid: string) {
        return axios.get(BahmniConstants.entityMappingUrl, {
            params: {
                entityUuid: loginLocationUuid,
                mappingType: 'location_encountertype',
                s: 'byEntityAndMappingType'
            },
            withCredentials: true
        });
    }

    private async getEncounterTypeBasedOnProgramUuid(programUuid: string) {
        return axios.get(BahmniConstants.entityMappingUrl, {
            params: {
                entityUuid: programUuid,
                mappingType: 'program_encountertype',
                s: 'byEntityAndMappingType'
            },
            withCredentials: true
        });
    }

    private async getDefaultEncounterTypeIfMappingNotFound(entityMappings: any) {
        let encounterType = entityMappings.data.results[0] && entityMappings.data.results[0].mappings[0];
        if (!encounterType) {
            encounterType = await this.getDefaultEncounterType();
        }
        return encounterType;
    }

    public async getEncounterType(programUuid?: string, loginLocationUuid?: string) {
        if (programUuid) {
            const response = await this.getEncounterTypeBasedOnProgramUuid(programUuid);
            return this.getDefaultEncounterTypeIfMappingNotFound(response);
        } else if (loginLocationUuid) {
            const response = await this.getEncounterTypeBasedOnLoginLocation(loginLocationUuid);
            return this.getDefaultEncounterTypeIfMappingNotFound(response);
        } else {
            return this.getDefaultEncounterType();
        }
    }

    public async create(encounter: Encounter) {
        encounter = this.buildEncounter(encounter);
        return axios.post(BahmniConstants.bahmniEncounterUrl, encounter, {
            withCredentials: true
        });
    }

    public async delete(encounterUuid: string, reason: string) {
        return axios.delete(`${BahmniConstants.bahmniEncounterUrl}/${encounterUuid}`, {
            params: { reason: reason }
        });
    }

    public buildEncounter(encounter: Encounter) {
        encounter.observations = encounter.observations || [];
        encounter.observations.forEach((obs: any) => {
            this.stripExtraConceptInfo(obs);
        });
        let bacteriologyMembers = this.getBacteriologyGroupMembers(encounter);
        bacteriologyMembers = bacteriologyMembers.reduce((mem1: any, mem2: any) => {
            return mem1.concat(mem2);
        }, []);
        bacteriologyMembers.forEach((mem: any) => {
            this.deleteIfImageOrVideoObsIsVoided(mem);
        });
        encounter.providers = encounter.providers || [];
        const providerData = JSON.parse(localStorage.getItem(BahmniConstants.grantProviderAccessDataCookieName) || '{}');
        if (!encounter.providers.length) {
            if (providerData && providerData.uuid) {
                encounter.providers.push({ "uuid": providerData.uuid });
            } else if (localStorage.getItem('currentProvider')) {
                const currentProvider = JSON.parse(localStorage.getItem('currentProvider') || '{}');
                if (currentProvider.uuid) {
                    encounter.providers.push({ "uuid": currentProvider.uuid });
                }
            }
        }
        return encounter;
    }

    public async search(visitUuid: string, encounterDate?: string) {
        if (!encounterDate) {
            return this.searchWithoutEncounterDate(visitUuid);
        }

        return axios.get(BahmniConstants.emrEncounterUrl, {
            params: {
                visitUuid: visitUuid,
                encounterDate: encounterDate,
                includeAll: BahmniConstants.includeAllObservations
            },
            withCredentials: true
        });
    }

    private async searchWithoutEncounterDate(visitUuid: string) {
        return axios.post(`${BahmniConstants.bahmniEncounterUrl}/find`, {
            visitUuids: [visitUuid],
            includeAll: BahmniConstants.includeAllObservations
        }, {
            withCredentials: true
        });
    }

    public async find(params: any) {
        return axios.post(`${BahmniConstants.bahmniEncounterUrl}/find`, params, {
            withCredentials: true
        });
    }

    public async findByEncounterUuid(encounterUuid: string, params: any = { includeAll: true }) {
        return axios.get(`${BahmniConstants.bahmniEncounterUrl}/${encounterUuid}`, {
            params: params,
            withCredentials: true
        });
    }

    public async getEncountersForEncounterType(patientUuid: string, encounterTypeUuid: string) {
        return axios.get(BahmniConstants.encounterUrl, {
            params: {
                patient: patientUuid,
                order: "desc",
                encounterType: encounterTypeUuid,
                v: "custom:(uuid,provider,visit:(uuid,startDatetime,stopDatetime),obs:(uuid,concept:(uuid,name),groupMembers:(id,uuid,obsDatetime,value,comment)))"
            },
            withCredentials: true
        });
    }

    public async getDigitized(patientUuid: string) {
        const patientDocumentEncounterTypeUuid = configurationsService.encounterConfig().getPatientDocumentEncounterTypeUuid();
        return axios.get(BahmniConstants.encounterUrl, {
            params: {
                patient: patientUuid,
                encounterType: patientDocumentEncounterTypeUuid,
                v: "custom:(uuid,obs:(uuid))"
            },
            withCredentials: true
        });
    }

    public async discharge(encounterData: Encounter) {
        const encounter = this.buildEncounter(encounterData);
        return axios.post(BahmniConstants.dischargeUrl, encounter, {
            withCredentials: true
        });
    }
}

export const encounterService = new EncounterService();
