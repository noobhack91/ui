import axios from 'axios';
import { Bahmni } from '../utils/constants/bahmni';
import { ClinicalDashboardConfig } from '../utils/constants/clinicalDashboardConfig';

class ClinicalDashboardConfigService {
    private config: ClinicalDashboardConfig | null = null;

    public async load(): Promise<void> {
        try {
            const response = await axios.get('dashboard.json', { withCredentials: true });
            this.config = new ClinicalDashboardConfig(Object.values(response.data));
        } catch (error) {
            console.error('Error loading clinical dashboard config:', error);
            throw error;
        }
    }

    public getConfig(): ClinicalDashboardConfig | null {
        return this.config;
    }
}

export const clinicalDashboardConfigService = new ClinicalDashboardConfigService();
