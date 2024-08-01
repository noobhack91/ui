class UrlHelper {
    private patientUuid: string;

    constructor(patientUuid: string) {
        this.patientUuid = patientUuid;
    }

    getPatientUrl(): string {
        return `/patient/${this.patientUuid}/dashboard`;
    }

    getConsultationUrl(): string {
        return `${this.getPatientUrl()}/consultation`;
    }

    getVisitUrl(visitUuid: string): string {
        return `${this.getPatientUrl()}/visit/${visitUuid}`;
    }
}

export default UrlHelper;
