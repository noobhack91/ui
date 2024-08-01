// TypeScript constant for React components

export const ipdDashboardUrl = (patientUuid: string, visitUuid: string): string => {
    return `#/patient/${patientUuid}/visit/${visitUuid}/`;
};
