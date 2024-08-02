import axios from 'axios';
import { BahmniConstants } from '../utils/constants/BahmniConstants';
import { DateUtil } from '../utils/DateUtil';
import { translate } from 'react-i18next';
import { configurationService } from './configurationService';

interface LogParams {
    patientUuid: string;
    eventType: string;
    message: string;
    module: string;
}

interface LogResponse {
    dateCreated: string;
    message: string;
    params?: any;
    displayMessage: string;
}

class AuditLogService {
    private convertToLocalDate(date: string): string {
        const localDate = DateUtil.parseLongDateToServerFormat(date);
        return DateUtil.getDateTimeInSpecifiedFormat(localDate, 'MMMM Do, YYYY [at] h:mm:ss A');
    }

    public async getLogs(params: Record<string, any> = {}): Promise<LogResponse[]> {
        try {
            const response = await axios.get(BahmniConstants.auditLogUrl, { params });
            return response.data.map((log: any) => {
                log.dateCreated = this.convertToLocalDate(log.dateCreated);
                const entity = log.message ? log.message.split("~")[1] : undefined;
                log.params = entity ? JSON.parse(entity) : entity;
                log.message = log.message.split("~")[0];
                log.displayMessage = translate(log.message, log);
                return log;
            });
        } catch (error) {
            console.error('Error fetching audit logs:', error);
            throw error;
        }
    }

    public async log(patientUuid: string, eventType: string, messageParams: any, module: string): Promise<void> {
        try {
            const result = await configurationService.getConfigurations(['enableAuditLog']);
            if (result.enableAuditLog) {
                const params: LogParams = {
                    patientUuid,
                    eventType: BahmniConstants.AuditLogEventDetails[eventType].eventType,
                    message: BahmniConstants.AuditLogEventDetails[eventType].message,
                    module
                };
                params.message = messageParams ? `${params.message}~${JSON.stringify(messageParams)}` : params.message;
                await axios.post(BahmniConstants.auditLogUrl, params, { withCredentials: true });
            }
        } catch (error) {
            console.error('Error logging audit event:', error);
            throw error;
        }
    }
}

export const auditLogService = new AuditLogService();
