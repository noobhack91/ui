import axios from 'axios';
import { getCurrentUser } from './sessionService'; // Assuming sessionService has a method to get the current user
import { BahmniConstants } from '../utils/constants/BahmniConstants'; // Assuming constants are defined here

interface Report {
    name: string;
    startDate: string;
    stopDate: string;
    responseType: string;
    reportTemplateLocation?: string;
}

const paperSize = "A4"; // Assuming a default value for paperSize
const appName = "reports"; // Assuming a default value for appName
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

const scheduleReport = async (report: Report) => {
    const url = `${BahmniConstants.reportsUrl}/schedule?name=${report.name}&startDate=${report.startDate}&endDate=${report.stopDate}&responseType=${report.responseType}&paperSize=${paperSize}&appName=${appName}&userName=${getCurrentUser()}`;
    if (report.reportTemplateLocation && report.responseType === 'application/vnd.ms-excel-custom') {
        url += `&macroTemplateLocation=${report.reportTemplateLocation}`;
    }
    return axios.get(url);
};

const getScheduledReports = async () => {
    const url = `${BahmniConstants.reportsUrl}/getReports?user=${getCurrentUser()}`;
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

const deleteReport = async (id: string) => {
    const url = `${BahmniConstants.reportsUrl}/delete/${id}`;
    return axios.get(url);
};

const generateReport = (report: Report) => {
    let url = `${BahmniConstants.reportsUrl}/report?name=${report.name}&startDate=${report.startDate}&endDate=${report.stopDate}&responseType=${report.responseType}&paperSize=${paperSize}&appName=${appName}`;
    if (report.reportTemplateLocation && report.responseType === 'application/vnd.ms-excel-custom') {
        url += `&macroTemplateLocation=${report.reportTemplateLocation}`;
    }
    window.open(url);
};

export {
    getFormatForMimeType,
    getMimeTypeForFormat,
    getAvailableFormats,
    getAvailableDateRange,
    scheduleReport,
    getScheduledReports,
    deleteReport,
    generateReport
};
