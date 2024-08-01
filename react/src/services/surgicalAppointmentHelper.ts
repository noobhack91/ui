import _ from 'lodash';

class SurgicalAppointmentHelper {
    filterProvidersByName(providerNames: string[], providers: any[]): any[] {
        const validProviderNames = _.filter(providerNames, (providerName) => {
            return _.find(providers, (provider) => {
                return providerName === provider.person.display;
            });
        });
        return _.map(validProviderNames, (providerName) => {
            return _.find(providers, (provider) => {
                return providerName === provider.person.display;
            });
        });
    }

    getPatientDisplayLabel(display: string): string {
        return display.split(' - ')[1] + " ( " + display.split(' - ')[0] + " )";
    }

    getAppointmentAttributes(surgicalAppointment: any): Record<string, any> {
        return _.reduce(surgicalAppointment.surgicalAppointmentAttributes, (attributes, attribute) => {
            attributes[attribute.surgicalAppointmentAttributeType.name] = attribute.value;
            return attributes;
        }, {});
    }

    getEstimatedDurationForAppointment(surgicalAppointment: any): number {
        const attributes = this.getAppointmentAttributes(surgicalAppointment);
        return this.getAppointmentDuration(attributes.estTimeHours, attributes.estTimeMinutes, attributes.cleaningTime);
    }

    getAppointmentDuration(estTimeHours: number, estTimeMinutes: string, cleaningTime: string): number {
        return estTimeHours * 60 + (parseInt(estTimeMinutes) || 0) + (parseInt(cleaningTime) || 0);
    }

    filterSurgicalAppointmentsByStatus(surgicalAppointments: any[], appointmentStatusList: string[]): any[] {
        if (_.isEmpty(appointmentStatusList)) {
            return surgicalAppointments;
        }
        return _.filter(surgicalAppointments, (appointment) => {
            return appointmentStatusList.indexOf(appointment.status) >= 0;
        });
    }

    filterSurgicalAppointmentsByPatient(surgicalAppointments: any[], patient: any): any[] {
        if (!patient) {
            return surgicalAppointments;
        }
        return _.filter(surgicalAppointments, (appointment) => {
            return appointment.patient.uuid === patient.uuid;
        });
    }

    getAttributesFromAttributeNames(attributes: Record<string, any>, attributeNames: string[]): Record<string, any> {
        const configuredAttributes: Record<string, any> = {};
        if (attributes) {
            _.each(attributeNames, (attributeName) => {
                configuredAttributes[attributeName] = attributes[attributeName];
            });
        }
        return configuredAttributes;
    }

    getAttributesFromAttributeTypes(attributes: Record<string, any>, attributeTypes: any[]): Record<string, any> {
        const configuredAttributes: Record<string, any> = {};
        if (attributes) {
            _.each(attributeTypes, (attributeType) => {
                configuredAttributes[attributeType.name] = attributes[attributeType.name];
            });
        }
        return configuredAttributes;
    }

    getAttributeTypesByRemovingAttributeNames(defaultAttributeTypes: any[], attributeNames: string[]): any[] {
        if (!attributeNames) {
            return defaultAttributeTypes;
        }
        return _.filter(defaultAttributeTypes, (attributeType) => {
            return !attributeNames.includes(attributeType.name);
        });
    }

    getDefaultAttributeTranslations(): Map<string, string> {
        return new Map([
            ['procedure', "OT_SURGICAL_APPOINTMENT_PROCEDURE"],
            ['estTimeHours', "OT_SURGICAL_APPOINTMENT_HOURS"],
            ['estTimeMinutes', "OT_SURGICAL_APPOINTMENT_MINUTES"],
            ['cleaningTime', "OT_SURGICAL_APPOINTMENT_CLEANING_TIME"],
            ['otherSurgeon', "OT_SURGICAL_APPOINTMENT_OTHER_SURGEON"],
            ['surgicalAssistant', "OT_SURGICAL_APPOINTMENT_SURGICAL_ASSISTANT"],
            ['anaesthetist', "OT_SURGICAL_APPOINTMENT_ANAESTHETIST"],
            ['scrubNurse', "OT_SURGICAL_APPOINTMENT_SCRUB_NURSE"],
            ['circulatingNurse', "OT_SURGICAL_APPOINTMENT_CIRCULATING_NURSE"],
            ['notes', "OT_SURGICAL_APPOINTMENT_NOTES"],
            ['Status', "OT_SURGICAL_APPOINTMENT_STATUS"],
            ['Day', "OT_SURGICAL_BLOCK_START_DAY"],
            ['Date', "OT_SURGICAL_BLOCK_START_DATE"],
            ['Identifier', "PATIENT_ATTRIBUTE_IDENTIFIER"],
            ['Patient Name', "PATIENT_ATTRIBUTE_PATIENT_NAME"],
            ['Patient Age', "PERSON_ATTRIBUTE_PATIENT_AGE"],
            ['Start Time', "OT_SURGICAL_BLOCK_START_TIME"],
            ['Est Time', "OT_SURGICAL_APPOINTMENT_ESTIMATED_TIME"],
            ['Actual Time', "OT_SURGICAL_APPOINTMENT_ACTUAL_TIME"],
            ['OT#', "OT_SURGICAL_BLOCK_LOCATION_NAME"],
            ['Surgeon', "OT_PROVIDER_SURGEON"],
            ['Status Change Notes', "OT_SURGICAL_APPOINTMENT_STATUS_CHANGE_NOTES"],
            ['Bed Location', "OT_SURGICAL_APPOINTMENT_BED_LOCATION"],
            ['Bed ID', "OT_SURGICAL_APPOINTMENT_BED_ID"]
        ]);
    }

    getSurgicalAttributes(surgicalAppointment: any): Record<string, any> {
        return _.reduce(surgicalAppointment.surgicalAppointmentAttributes, (attributes, attribute) => {
            attributes[attribute.surgicalAppointmentAttributeType.name] = attribute.value;
            return attributes;
        }, {});
    }
}

export default new SurgicalAppointmentHelper();
