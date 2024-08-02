import { formService } from './formService';

interface Observation {
    value: any;
    formFieldPath?: string;
    encounterUuid?: string;
    groupMembers?: Observation[];
}

interface Form {
    name: string;
    version: string;
    uuid: string;
    nameTranslation?: string;
}

class FormRecordTreeBuildService {
    formBuildForms: any[] = [];

    build(bahmniObservations: Observation[], hasNoHierarchy: boolean) {
        bahmniObservations.forEach(obs => {
            obs.value = this.preProcessMultiSelectObs(obs.value);
        });

        formService.getAllForms().then(response => {
            const formBuildForms = response.data;
            const obs = this.createObsGroupForForm(bahmniObservations, formBuildForms);
            if (!hasNoHierarchy) {
                this.updateObservationsWithFormDefinition(obs, formBuildForms);
            }
        });
    }

    createMultiSelectObservation(observations: Observation[]) {
        const multiSelectObject = new Bahmni.Common.Obs.MultiSelectObservation(observations, { multiSelect: true });
        multiSelectObject.formFieldPath = observations[0].formFieldPath;
        multiSelectObject.encounterUuid = observations[0].encounterUuid;
        return multiSelectObject;
    }

    preProcessMultiSelectObs(value: Observation[]) {
        const clonedGroupMembers = _.cloneDeep(value);
        clonedGroupMembers.forEach(member => {
            if (member && member.groupMembers.length === 0) {
                const obsWithSameFormFieldPath = this.getRecordObservations(member.formFieldPath, value);
                if (obsWithSameFormFieldPath.length > 1) {
                    const multiSelectObject = this.createMultiSelectObservation(obsWithSameFormFieldPath);
                    value.push(multiSelectObject);
                } else if (obsWithSameFormFieldPath.length === 1) {
                    value.push(obsWithSameFormFieldPath[0]);
                }
            } else if (member.groupMembers.length > 0) {
                const obsGroups = this.getRecordObservations(member.formFieldPath, value);
                obsGroups.forEach(obsGroup => {
                    obsGroup.groupMembers = this.preProcessMultiSelectObs(obsGroup.groupMembers);
                    value.push(obsGroup);
                });
            }
        });
        return value;
    }

    createObsGroupForForm(observations: Observation[], formBuilderForms: Form[]) {
        observations.forEach(obs => {
            const newValues: any[] = [];
            obs.value.forEach(value => {
                if (!value.formFieldPath) {
                    newValues.push(value);
                    return;
                }
                const obsGroup = {
                    groupMembers: [],
                    concept: {
                        shortName: "",
                        conceptClass: null
                    },
                    encounterUuid: ""
                };
                const formName = value.formFieldPath.split('.')[0];
                const formBuilderForm = formBuilderForms.find(form => form.name === formName);
                obsGroup.concept.shortName = formName;
                const locale = localStorage.getItem("NG_TRANSLATE_LANG_KEY") || "en";
                const formNameTranslations = formBuilderForm && formBuilderForm.nameTranslation
                    ? JSON.parse(formBuilderForm.nameTranslation) : [];
                if (formNameTranslations.length > 0) {
                    const currentLabel = formNameTranslations.find(formNameTranslation => formNameTranslation.locale === locale);
                    if (currentLabel) {
                        obsGroup.concept.shortName = currentLabel.display;
                    }
                }
                obsGroup.encounterUuid = value.encounterUuid;
                let previousObsGroupFound = false;
                newValues.forEach(newValue => {
                    if (obsGroup.concept.shortName === newValue.concept.shortName) {
                        newValue.groupMembers.push(value);
                        previousObsGroupFound = true;
                    }
                });
                if (previousObsGroupFound) {
                    return;
                }
                obsGroup.groupMembers.push(value);
                newValues.push(obsGroup);
            });
            obs.value = newValues;
        });
        return observations;
    }

    updateObservationsWithFormDefinition(observations: Observation[], formBuildForms: Form[]) {
        const allForms = formBuildForms;
        observations.forEach(observation => {
            const forms: any[] = [];
            observation.value.forEach(form => {
                if (form.concept.conceptClass) {
                    forms.push(form);
                    return;
                }
                const observationForm = this.getFormByFormName(allForms, this.getFormName(form.groupMembers), this.getFormVersion(form.groupMembers));
                if (!observationForm) {
                    return;
                }
                formService.getFormDetail(observationForm.uuid, { v: "custom:(resources:(value))" }).then(response => {
                    const formDetailsAsString = _.get(response, 'data.resources[0].value');
                    if (formDetailsAsString) {
                        const formDef = JSON.parse(formDetailsAsString);
                        formDef.version = observationForm.version;
                        const locale = localStorage.getItem("NG_TRANSLATE_LANG_KEY") || "en";
                        formService.getFormTranslate(formDef.name, formDef.version, locale, formDef.uuid)
                            .then(response => {
                                const translationData = response.data;
                                forms.push(this.updateObservationsWithRecordTree(formDef, form, translationData));
                                observation.value = forms;
                            });
                    }
                    observation.value = forms;
                });
            });
        });
    }

    getFormByFormName(formList: Form[], formName: string, formVersion: string) {
        return formList.find(form => form.name === formName && form.version === formVersion);
    }

    getFormName(members: Observation[]) {
        const member = members.find(member => member.formFieldPath !== null);
        return member ? member.formFieldPath.split('.')[0] : undefined;
    }

    getFormVersion(members: Observation[]) {
        const member = members.find(member => member.formFieldPath !== null);
        return member ? member.formFieldPath.split('.')[1].split('/')[0] : undefined;
    }

    updateObservationsWithRecordTree(formDef: any, form: any, translationData: any) {
        const recordTree = this.getRecordTree(formDef, form.groupMembers);
        const clonedRecordTree = JSON.parse(JSON.stringify(recordTree));
        this.createGroupMembers(clonedRecordTree, form, form.groupMembers, translationData);
        return form;
    }

    createColumnGroupsForTable(record: any, columns: any[], tableGroup: any, obsList: Observation[], translationData: any) {
        columns.forEach((column, index) => {
            const obsGroup = {
                groupMembers: [],
                concept: {
                    shortName: "",
                    conceptClass: null
                }
            };
            const translationKey = column.translationKey;
            const defaultShortName = column.value;
            obsGroup.concept.shortName = this.getTranslatedShortName(translationData, translationKey, obsGroup, defaultShortName);
            const columnRecord = this.getColumnObs(index, record);
            column.children = columnRecord;
            this.createGroupMembers(column, obsGroup, obsList, translationData);
            if (obsGroup.groupMembers.length > 0) {
                tableGroup.groupMembers.push(obsGroup);
            }
        });
    }

    getTranslatedShortName(translationData: any, translationKey: string, obsGroup: any, defaultShortName: string) {
        if (this.isTranslationKeyPresent(translationData, translationKey)) {
            return translationData.labels[translationKey][0];
        }
        return defaultShortName;
    }

    isTranslationKeyPresent(translationData: any, translationKey: string) {
        return translationData && translationData.labels && translationData.labels[translationKey][0] !== translationKey;
    }

    getColumnObs(columnIndex: number, record: any) {
        const columnChildren: any[] = [];
        record.children.forEach((child: any) => {
            if (child.control.properties && child.control.properties.location.column === columnIndex) {
                columnChildren.push(child);
            }
        });
        return columnChildren;
    }

    createGroupMembers(recordTree: any, obsGroup: any, obsList: Observation[], translationData: any) {
        recordTree.children.forEach((record: any) => {
            if (record.control.type === 'obsControl' || record.control.type === 'obsGroupControl') {
                const recordObservations = this.getRecordObservations(record.formFieldPath, obsList);
                recordObservations.forEach(recordObservation => {
                    obsGroup.groupMembers.push(recordObservation);
                });
            } else if (record.control.type === 'section') {
                const sectionGroup = this.createObsGroup(record, translationData);
                this.createGroupMembers(record, sectionGroup, obsList, translationData);
                if (sectionGroup.groupMembers.length > 0) {
                    obsGroup.groupMembers.push(sectionGroup);
                }
            } else if (record.control.type === "table") {
                const tableGroup = this.createObsGroup(record, translationData);
                const columns = record.control.columnHeaders;
                this.createColumnGroupsForTable(record, columns, tableGroup, obsList, translationData);
                if (tableGroup.groupMembers.length > 0) {
                    obsGroup.groupMembers.push(tableGroup);
                }
            }
        });
    }

    getTableColumns(record: any) {
        return record.control.columnHeaders.filter((child: any) => child.type === "label");
    }

    getRecordObservations(obsFormFieldPath: string, obsList: Observation[]) {
        return obsList.filter(obs => obs.formFieldPath && obs.formFieldPath === obsFormFieldPath);
    }

    createObsGroup(record: any, translationData: any) {
        const obsGroup = {
            groupMembers: [],
            concept: {
                shortName: "",
                conceptClass: null
            }
        };
        const translationKey = record.control.label.translationKey;
        const defaultShortName = record.control.label.value;
        obsGroup.concept.shortName = this.getTranslatedShortName(translationData, translationKey, obsGroup, defaultShortName);
        return obsGroup;
    }

    getRecordTree(formDef: any, groupMembers: any) {
        // SECOND AGENT: [MISSING CONTEXT] - Implementation of getRecordTree is missing
    }
}

export const formRecordTreeBuildService = new FormRecordTreeBuildService();
