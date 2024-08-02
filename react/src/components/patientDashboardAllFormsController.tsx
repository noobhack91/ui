import React from 'react';

interface PatientDashboardAllFormsControllerProps {
    patient: any;
    section: any;
}

const PatientDashboardAllFormsController: React.FC<PatientDashboardAllFormsControllerProps> = ({ patient, section }) => {
    return (
        <div>

            <h2>Patient Information</h2>
            <p><strong>Name:</strong> {patient.name}</p>
            <p><strong>Age:</strong> {patient.age}</p>
            <p><strong>Gender:</strong> {patient.gender}</p>
            <h3>Section Details</h3>
            <p><strong>Section Name:</strong> {section.name}</p>
            <p><strong>Description:</strong> {section.description}</p>
        </div>
    );
};

export default PatientDashboardAllFormsController;
