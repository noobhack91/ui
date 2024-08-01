import axios from 'axios';
import { getCookie } from '../utils/cookieStore';
import { BahmniConstants } from '../utils/constants/BahmniConstants';
import { BahmniCommonConstants } from '../utils/constants/BahmniCommonConstants';
import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import messagingService from './messagingService';
import locationService from './locationService';

class TransmissionService {
    async sendEmail(attachments: any[], subject: string, body: string, emailUrl: string, cc?: string[], bcc?: string[]) {
        const params = {
            "mailAttachments": attachments,
            "subject": subject,
            "body": body,
            "cc": cc,
            "bcc": bcc
        };

        try {
            const response = await axios.post(emailUrl, params, {
                withCredentials: true,
                headers: { "Accept": "application/json", "Content-Type": "application/json" }
            });

            if (response.data.statusLine.statusCode !== 200) {
                messagingService.showMessage("error", response.data.statusLine.reasonPhrase);
            } else {
                messagingService.showMessage("info", response.data.statusLine.reasonPhrase);
            }

            return response;
        } catch (error) {
            messagingService.showMessage("error", error.message);
            throw error;
        }
    }

    getSharePrescriptionMailContent(prescriptionDetails: any) {
        const { t } = useTranslation();
        let message = t(BahmniCommonConstants.sharePrescriptionMailContent);
        message = message.replace("#recipientName", prescriptionDetails.patient.name);
        message = message.replaceAll("#locationName", $rootScope.facilityLocation.name);
        message = message.replace("#locationAddress", $rootScope.facilityLocation.attributes[0] ? $rootScope.facilityLocation.attributes[0].display.split(":")[1].trim() : "");
        message = message.replace("#visitDate", $filter("bahmniDate")(prescriptionDetails.visitDate));
        return message;
    }
}

export default new TransmissionService();
