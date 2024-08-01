import axios from 'axios';
import { getAppDescriptor, getAppName } from '../utils/appService';
import { getCookie } from '../utils/cookieStore';
import { BahmniConstants } from '../utils/constants/BahmniConstants';

const paperSize = getAppDescriptor().getConfigValue("paperSize");
const appName = getAppName() ? getAppName() : "reports";
const currentDate = new Date();

const availableFormats = {
    "CSV": "text/csv",
    "HTML": "text/html",
    "EXCEL": "application/vnd.ms-excel",
    "PDF": "application/pdf",
    "CUSTOM EXCEL": "application/vnd.ms-excel-custom",
    "ODS": "application/vnd.oasis.opendocument.spreadsheet"
};

const availableDateRange = {
    "Today": currentDate,
    "This Month": new Date(currentDate.getFullYear(), currentDate.getMonth(), 1),
    "Previous Month": new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1),
    "This Quarter": new Date(currentDate.getFullYear(), Math.floor(currentDate.getMonth() / 3) * 3, 1),
    "This Year": new Date(currentDate.getFullYear(), 0, 1),
    "Last 7 days": new Date(new Date().setDate(currentDate.getDate() - 7)),
    "Last 30 days": new Date(new Date().setDate(currentDate.getDate() - 30))
};

const currentUser = () => {
    return getCookie(BahmniConstants.currentUser);
};

const scheduleReport = (report: any) => {
    let url = `${BahmniConstants.reportsUrl}/schedule`;
    url = `${url}?name=${report.name}&startDate=${report.startDate}&endDate=${report.stopDate}&responseType=${report.responseType}&paperSize=${paperSize}&appName=${appName}&userName=${currentUser()}`;
    if (report.reportTemplateLocation && report.responseType === 'application/vnd.ms-excel-custom') {
        url = `${url}&macroTemplateLocation=${report.reportTemplateLocation}`;
    }
    return axios.get(url);
};

const getScheduledReports = () => {
    let url = `${BahmniConstants.reportsUrl}/getReports?user=${currentUser()}`;
    return axios.get(url);
};

const getAvailableFormats = () => {
    return availableFormats;
};

const getMimeTypeForFormat = (format: string) => {
    return availableFormats[format];
};

const getFormatForMimeType = (mimeType: string) => {
    return Object.keys(availableFormats).find(key => availableFormats[key] === mimeType);
};

const getAvailableDateRange = () => {
    return availableDateRange;
};

const deleteReport = (id: string) => {
    let url = `${BahmniConstants.reportsUrl}/delete/${id}`;
    return axios.get(url);
};

const generateReport = (report: any) => {
    let url = `${BahmniConstants.reportsUrl}/report`;
    url = `${url}?name=${report.name}&startDate=${report.startDate}&endDate=${report.stopDate}&responseType=${report.responseType}&paperSize=${paperSize}&appName=${appName}`;
    if (report.reportTemplateLocation && report.responseType === 'application/vnd.ms-excel-custom') {
        url = `${url}&macroTemplateLocation=${report.reportTemplateLocation}`;
    }
    window.open(url);
};

export const reportService = {
    getFormatForMimeType,
    getMimeTypeForFormat,
    getAvailableFormats,
    getAvailableDateRange,
    scheduleReport,
    getScheduledReports,
    deleteReport,
    generateReport
};
