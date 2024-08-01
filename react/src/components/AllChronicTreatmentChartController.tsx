import React from 'react';

interface AllChronicTreatmentChartControllerProps {
    patient: any;
    enrollment: any;
    section: any;
}

const AllChronicTreatmentChartController: React.FC<AllChronicTreatmentChartControllerProps> = ({ patient, enrollment, section }) => {
    const config = section ? section.expandedViewConfig : {};

    return (
        <div>

            <h2>Patient Information</h2>
            <p><strong>Name:</strong> {patient.name}</p>
            <p><strong>Age:</strong> {patient.age}</p>
            <p><strong>Gender:</strong> {patient.gender}</p>

            <h2>Enrollment Information</h2>
            <p><strong>Program:</strong> {enrollment.program}</p>
            <p><strong>Start Date:</strong> {enrollment.startDate}</p>
            <p><strong>Status:</strong> {enrollment.status}</p>

            <h2>Configuration</h2>
            <pre>{JSON.stringify(config, null, 2)}</pre>
        </div>
    );
};

export default AllChronicTreatmentChartController;
