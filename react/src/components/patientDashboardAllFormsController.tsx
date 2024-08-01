import React from 'react';

interface PatientDashboardAllFormsControllerProps {
    patient: any;
    section: any;
}

const PatientDashboardAllFormsController: React.FC<PatientDashboardAllFormsControllerProps> = ({ patient, section }) => {
    return (
        <div>
            {/* Render patient and section information here */}
            <h1>Patient Dashboard</h1>
            <p>Patient: {JSON.stringify(patient)}</p>
            <p>Section: {JSON.stringify(section)}</p>
        </div>
    );
};

export default PatientDashboardAllFormsController;
