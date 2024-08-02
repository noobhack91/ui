import axios from 'axios';
import { format } from 'date-fns';
import { Constants } from '../utils/constants';

class FhirExportService {
    private convertToLocalDate(date: string): string {
        const localDate = new Date(date);
        return format(localDate, 'MMMM do, yyyy [at] h:mm:ss a');
    }

    public async getUuidForAnonymiseConcept(): Promise<any> {
        const params = {
            name: 'FHIR Export Anonymise Flag',
            s: 'default',
            v: 'default'
        };
        try {
            const response = await axios.get(Constants.conceptUrl, { params });
            return response.data;
        } catch (error) {
            throw new Error(`Error fetching UUID for anonymise concept: ${error.message}`);
        }
    }

    public async loadFhirTasks(): Promise<any> {
        const params = {
            "_sort:desc": "_lastUpdated",
            _count: 50
        };
        try {
            const response = await axios.get(Constants.fhirTasks, { params });
            return response.data;
        } catch (error) {
            throw new Error(`Error loading FHIR tasks: ${error.message}`);
        }
    }

    public async submitAudit(username: string, startDate: string, endDate: string, anonymise: boolean): Promise<any> {
        const eventType = "PATIENT_DATA_BULK_EXPORT";
        const exportMode = anonymise ? "Anonymized" : "Non-Anonymized";
        const message = `User ${username} performed a bulk patient data export for: Start Date ${this.convertToLocalDate(startDate)} and End Date ${this.convertToLocalDate(endDate)} in ${exportMode} mode`;
        const module = "Export";
        const auditData = {
            username,
            eventType,
            message,
            module
        };
        try {
            const response = await axios.post(Constants.auditLogUrl, auditData, {
                withCredentials: true
            });
            return response.data;
        } catch (error) {
            throw new Error(`Error submitting audit: ${error.message}`);
        }
    }

    public async export(username: string, startDate: string, endDate: string, anonymise: boolean): Promise<any> {
        let url = `${Constants.fhirExportUrl}?anonymise=${anonymise}`;
        if (startDate) {
            url += `&startDate=${startDate}`;
        }
        if (endDate) {
            url += `&endDate=${endDate}`;
        }
        try {
            const response = await axios.post(url, {}, {
                withCredentials: true,
                headers: { "Accept": "application/json", "Content-Type": "application/json" }
            });
            return response.data;
        } catch (error) {
            throw new Error(`Error exporting data: ${error.message}`);
        }
    }
}

export default new FhirExportService();
