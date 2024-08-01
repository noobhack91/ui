export const ipdDashboard = (patientUuid: string, visitUuid: string): string => {
    return `#/patient/${patientUuid}/visit/${visitUuid}/`;
};
