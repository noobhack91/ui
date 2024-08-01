import React, { useEffect, useState } from 'react';
import { reportService } from '../services/reportService';
import { messagingService } from '../services/messagingService';
import { spinner } from '../services/spinner';
import { ngDialog } from '../services/ngDialog';
import moment from 'moment';
import _ from 'lodash';

const MyReportsController: React.FC = () => {
    const [reports, setReports] = useState<any>(null);
    const [days, setDays] = useState<any>(null);
    const [searchString, setSearchString] = useState<string>("");

    useEffect(() => {
        const init = async () => {
            try {
                const response = await spinner.forPromise(reportService.getScheduledReports());
                const groupedReports = getReportsGroupedByDay(response.data);
                setReports(sortAllGroupedReports(groupedReports));
                setDays(getDaysInSortedOrder(groupedReports));
            } catch (error) {
                // Handle error
            }
        };

        init();
    }, []);

    const sortAllGroupedReports = (reports: any) => {
        _.forOwn(reports, (value, key) => {
            reports[key] = _.sortBy(value, ['requestDatetime']).reverse();
        });
        return reports;
    };

    const getReportsGroupedByDay = (reports: any) => {
        return _.groupBy(reports, (report) => {
            report.hidden = false;
            const dateFormat = "MMM D YYYY";
            const date = moment(report.requestDatetime).format(dateFormat);
            return moment(date, dateFormat).unix() * 1000;
        });
    };

    const getDaysInSortedOrder = (reports: any) => {
        const days = Object.keys(reports).sort().reverse();
        return _.map(days, (day) => {
            return {
                unixTimeStamp: parseInt(day, 10),
                hidden: false
            };
        });
    };

    const getDownloadLink = (report: any) => {
        return `${Bahmni.Common.Constants.reportsUrl}/download/${report.id}`;
    };

    const convertToDate = (unixTimeStamp: number, format: string) => {
        return moment(unixTimeStamp).format(format);
    };

    const getFormat = (mimeType: string) => {
        return reportService.getFormatForMimeType(mimeType);
    };

    const search = () => {
        _.forEach(days, (day) => {
            let hiddenReports = 0;
            _.forEach(reports[day.unixTimeStamp], (report) => {
                if (report.name.match(new RegExp(searchString, "i")) === null) {
                    report.hidden = true;
                    hiddenReports++;
                } else {
                    report.hidden = false;
                }
            });
            day.hidden = hiddenReports === reports[day.unixTimeStamp].length;
        });
    };

    const deleteReport = async (reportToDelete: any, day: any) => {
        try {
            await spinner.forPromise(reportService.deleteReport(reportToDelete.id));
            _.remove(reports[day.unixTimeStamp], (report) => reportToDelete.id === report.id);
            messagingService.showMessage("info", "REPORT_DELETE_SUCCESSFUL");
        } catch (error) {
            messagingService.showMessage("error", "REPORT_DELETE_ERROR");
        }
    };

    const displayErrorPopup = (report: any) => {
        ngDialog.open({
            template: 'views/errorMessagePopup.html',
            className: "ngdialog-theme-default report",
            data: report.errorMessage
        });
    };

    return (
        <div>

            <input 
                type="text" 
                value={searchString} 
                onChange={(e) => setSearchString(e.target.value)} 
                placeholder="Search reports..." 
            />
            <button onClick={search}>Search</button>
            {days && days.map((day: any) => (
                <div key={day.unixTimeStamp} style={{ display: day.hidden ? 'none' : 'block' }}>
                    <h3>{convertToDate(day.unixTimeStamp, "MMM D YYYY")}</h3>
                    {reports[day.unixTimeStamp].map((report: any) => (
                        <div key={report.id} style={{ display: report.hidden ? 'none' : 'block' }}>
                            <p>{report.name}</p>
                            <a href={getDownloadLink(report)}>Download</a>
                            <button onClick={() => deleteReport(report, day)}>Delete</button>
                            {report.errorMessage && (
                                <button onClick={() => displayErrorPopup(report)}>View Error</button>
                            )}
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
};

export default MyReportsController;
