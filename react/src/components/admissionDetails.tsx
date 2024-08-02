import React, { useEffect, useState } from 'react';
import bedService from '../services/bedService';

interface AdmissionDetailsProps {
    params: any;
    patientUuid: string;
    visitSummary: any;
}

const AdmissionDetails: React.FC<AdmissionDetailsProps> = ({ params, patientUuid, visitSummary }) => {
    const [bedDetails, setBedDetails] = useState(null);
    const [showDaysAdmitted, setShowDaysAdmitted] = useState(false);
    const [daysAdmitted, setDaysAdmitted] = useState(0);

    useEffect(() => {
        if (patientUuid && visitSummary) {
            bedService.getAssignedBedForPatient(patientUuid, visitSummary.uuid).then((bedDetails) => {
                setBedDetails(bedDetails);
            });
            calculateDaysAdmitted();
        }
    }, [patientUuid, visitSummary]);

    const showDetailsButton = (encounter: any) => {
        return params && params.showDetailsButton && !encounter.notes;
    };

    const toggle = (element: any) => {
        element.show = !element.show;
    };

    const calculateDaysAdmitted = () => {
        if (visitSummary) {
            if (visitSummary.admissionDetails && visitSummary.dischargeDetails) {
                const admissionDate = new Date(visitSummary.admissionDetails.date);
                const dischargeDate = new Date(visitSummary.dischargeDetails.date);
                const timeDifference = dischargeDate.getTime() - admissionDate.getTime();
                const daysAdmitted = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));
                setDaysAdmitted(daysAdmitted);
                setShowDaysAdmitted(true);
            } else {
                setShowDaysAdmitted(false);
            }
        }
    };

    const isDataPresent = () => {
        if (!visitSummary || (!visitSummary.admissionDetails && !visitSummary.dischargeDetails)) {
            // SECOND AGENT: [MISSING CONTEXT] - Emit "no-data-present-event" equivalent in React
            return false;
        }
        return true;
    };

    return (
        <div>
            {/* SECOND AGENT: [MISSING CONTEXT] - Add the template HTML content here */}
            {showDaysAdmitted && <div>Days Admitted: {daysAdmitted}</div>}
        </div>
    );
};

export default AdmissionDetails;
