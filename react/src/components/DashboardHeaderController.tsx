import React, { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import appService from '../services/appService';

const DashboardHeaderController: React.FC = () => {
    const history = useHistory();

    const setBackLinks = () => {
        const backLinks = [{ label: "Home", url: "../home/", accessKey: "h", icon: "fa-home" }];
        if (appService.getAppDescriptor().getConfigValue("enableReportQueue")) {
            backLinks.push({ text: "REPORTS_HEADER_REPORTS", state: "dashboard.reports", accessKey: "d" });
            backLinks.push({ text: "REPORTS_HEADER_MY_REPORTS", state: "dashboard.myReports", accessKey: "m" });
        }
        // Assuming we have a way to set these backLinks in the state or context
        // SECOND AGENT: [MISSING CONTEXT] - Implement the logic to set backLinks in the state or context
    };

    useEffect(() => {
        setBackLinks();
    }, []);

    return null; // This component does not render anything
};

export default DashboardHeaderController;
