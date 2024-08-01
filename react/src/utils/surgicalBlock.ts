import _ from 'lodash';

interface SurgicalBlock {
    location: { name: string };
    provider: { uuid: string };
    surgicalAppointments: { patient: { uuid: string }, status: string }[];
}

interface Filters {
    locations: { [key: string]: boolean };
    providers: { uuid: string }[];
    patient: { uuid: string };
    statusList: { name: string }[];
}

const filterByLocation = (surgicalBlocks: SurgicalBlock[], filters: Filters): SurgicalBlock[] => {
    return surgicalBlocks.filter(block => filters.locations[block.location.name]);
};

const filterByProvider = (blocksFilteredByLocation: SurgicalBlock[], filters: Filters): SurgicalBlock[] => {
    if (_.isEmpty(filters.providers)) {
        return blocksFilteredByLocation;
    }
    return blocksFilteredByLocation.filter(block => 
        filters.providers.some(provider => provider.uuid === block.provider.uuid)
    );
};

const filterByPatientUuid = (blocksFilteredByProviders: SurgicalBlock[], filters: Filters): SurgicalBlock[] => {
    if (_.isEmpty(filters.patient)) {
        return blocksFilteredByProviders;
    }
    return blocksFilteredByProviders.filter(block => 
        block.surgicalAppointments.some(appointment => appointment.patient.uuid === filters.patient.uuid)
    );
};

const filterByAppointmentStatus = (blocksFilteredByPatient: SurgicalBlock[], filters: Filters): SurgicalBlock[] => {
    if (_.isEmpty(filters.statusList)) {
        return blocksFilteredByPatient;
    }
    return blocksFilteredByPatient.filter(block => 
        block.surgicalAppointments.some(appointment => 
            filters.statusList.some(status => status.name === appointment.status)
        )
    );
};

const filterByPatientAndStatus = (blocksFilteredByProviders: SurgicalBlock[], filters: Filters): SurgicalBlock[] => {
    if (_.isEmpty(filters.statusList) || _.isEmpty(filters.patient)) {
        const blocksFilteredByPatient = filterByPatientUuid(blocksFilteredByProviders, filters);
        return filterByAppointmentStatus(blocksFilteredByPatient, filters);
    }
    return blocksFilteredByProviders.filter(block => 
        block.surgicalAppointments.some(appointment => 
            appointment.patient.uuid === filters.patient.uuid && 
            filters.statusList.some(status => status.name === appointment.status)
        )
    );
};

const surgicalBlock = (surgicalBlocks: SurgicalBlock[], filters: Filters): SurgicalBlock[] => {
    if (!filters) {
        return surgicalBlocks;
    }
    const blocksFilteredByLocation = filterByLocation(surgicalBlocks, filters);
    const blocksFilteredByProviders = filterByProvider(blocksFilteredByLocation, filters);
    return filterByPatientAndStatus(blocksFilteredByProviders, filters);
};

export default surgicalBlock;
