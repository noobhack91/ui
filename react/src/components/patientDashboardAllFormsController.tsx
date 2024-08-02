import React from 'react';

interface PatientDashboardAllFormsControllerProps {
    patient: any;
    section: any;
}

const PatientDashboardAllFormsController: React.FC<PatientDashboardAllFormsControllerProps> = ({ patient, section }) => {
    return (
        <div>
            {/* Render patient and section information here */}
            <h1>Patient Information</h1>
            <pre>{JSON.stringify(patient, null, 2)}</pre>
            <h2>Section Information</h2>
            <pre>{JSON.stringify(section, null, 2)}</pre>
        </div>
    );
};

export default PatientDashboardAllFormsController;
