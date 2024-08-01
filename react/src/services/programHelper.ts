import { appService } from './appService';
import { DateUtil } from '../utils/DateUtil';
import _ from 'lodash';
import moment from 'moment';

interface Attribute {
    attributeType: {
        display: string;
        description?: string;
    };
    value: any;
    required?: boolean;
}

interface Program {
    dateEnrolled: Date;
    dateCompleted: Date;
    program: {
        allWorkflows: Workflow[];
    };
    attributes: Attribute[];
}

interface Workflow {
    retired: boolean;
    states: State[];
}

interface State {
    retired: boolean;
}

interface ProgramConfiguration {
    [key: string]: {
        required: boolean;
    };
}

class ProgramHelper {
    private programConfiguration: ProgramConfiguration | null;

    constructor() {
        const config = appService.getAppDescriptor().getConfig("program");
        this.programConfiguration = config ? config.value : null;
    }

    private isAttributeRequired(attribute: Attribute): boolean {
        const attributeName = attribute.attributeType.display;
        return this.programConfiguration && this.programConfiguration[attributeName] && this.programConfiguration[attributeName].required;
    }

    public filterRetiredPrograms(programs: Program[]): Program[] {
        return _.filter(programs, (program) => !program.retired);
    }

    public filterRetiredWorkflowsAndStates(workflows: Workflow[]): Workflow[] {
        const allWorkflows = _.filter(workflows, (workflow) => !workflow.retired);
        _.forEach(allWorkflows, (workflow) => {
            workflow.states = _.filter(workflow.states, (state) => !state.retired);
        });
        return allWorkflows;
    }

    public filterRetiredOutcomes(outcomes: any[]): any[] {
        return _.filter(outcomes, (outcome) => !outcome.retired);
    }

    private mapAttributes(attribute: Attribute): void {
        attribute.name = attribute.attributeType.description ? attribute.attributeType.description : attribute.name;
        attribute.value = attribute.value;
        attribute.required = this.isAttributeRequired(attribute);
    }

    private mapPrograms(program: Program): void {
        program.dateEnrolled = DateUtil.parseServerDateToDate(program.dateEnrolled);
        program.dateCompleted = DateUtil.parseServerDateToDate(program.dateCompleted);
        program.program.allWorkflows = this.filterRetiredWorkflowsAndStates(program.program.allWorkflows);
        _.forEach(program.attributes, (attribute) => {
            this.mapAttributes(attribute);
        });
    }

    private shouldDisplayAllAttributes(programDisplayControlConfig: any): boolean {
        return (programDisplayControlConfig && programDisplayControlConfig['programAttributes'] == undefined) || programDisplayControlConfig == undefined;
    }

    public filterProgramAttributes(patientPrograms: Program[], programAttributeTypes: any[]): Program[] {
        const programDisplayControlConfig = appService.getAppDescriptor().getConfigValue('programDisplayControl');
        const config = programDisplayControlConfig ? programDisplayControlConfig['programAttributes'] : [];
        let configAttrList = [];

        if (this.shouldDisplayAllAttributes(programDisplayControlConfig)) {
            configAttrList = programAttributeTypes;
        } else {
            configAttrList = programAttributeTypes.filter((each) => {
                return config && config.indexOf(each.name) !== -1;
            });
        }

        if (_.isEmpty(configAttrList)) {
            return patientPrograms.map((patientProgram) => {
                patientProgram.attributes = [];
                return patientProgram;
            });
        }

        patientPrograms.forEach((program) => {
            const attrsToBeDisplayed = [];

            configAttrList.forEach((configAttr) => {
                let attr = _.find(program.attributes, (progAttr) => {
                    return progAttr.attributeType.display === configAttr.name;
                });

                attr = attr ? attr : { value: "" };
                attr.attributeType = configAttr;
                attr.attributeType.display = configAttr.name;
                attrsToBeDisplayed.push(attr);
            });

            program.attributes = attrsToBeDisplayed;
        });
        return patientPrograms;
    }

    public groupPrograms(patientPrograms: Program[]): { activePrograms: Program[], endedPrograms: Program[] } {
        const activePrograms: Program[] = [];
        const endedPrograms: Program[] = [];
        const groupedPrograms: { activePrograms: Program[], endedPrograms: Program[] } = { activePrograms: [], endedPrograms: [] };

        if (patientPrograms) {
            const filteredPrograms = this.filterRetiredPrograms(patientPrograms);
            _.forEach(filteredPrograms, (program) => {
                this.mapPrograms(program);
                if (program.dateCompleted) {
                    endedPrograms.push(program);
                } else {
                    activePrograms.push(program);
                }
            });
            groupedPrograms.activePrograms = _.sortBy(activePrograms, (program) => moment(program.dateEnrolled).toDate()).reverse();
            groupedPrograms.endedPrograms = _.sortBy(endedPrograms, (program) => moment(program.dateCompleted).toDate()).reverse();
        }
        return groupedPrograms;
    }
}

export const programHelper = new ProgramHelper();
