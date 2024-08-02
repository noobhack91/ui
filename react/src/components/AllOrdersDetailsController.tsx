import React from 'react';

interface AllOrdersDetailsControllerProps {
    patient: any;
    section: any;
}

const AllOrdersDetailsController: React.FC<AllOrdersDetailsControllerProps> = ({ patient, section }) => {
    const title = section.title;
    const config = section ? section.expandedViewConfig : {};

    return (
        <div>
            <h1>{title}</h1>

            <div>
                <h2>Patient Details</h2>
                <p><strong>Name:</strong> {patient.name}</p>
                <p><strong>Age:</strong> {patient.age}</p>
                <p><strong>Gender:</strong> {patient.gender}</p>
            </div>
            <div>
                <h2>Section Details</h2>
                <p><strong>Description:</strong> {section.description}</p>
                <p><strong>Config:</strong> {JSON.stringify(config)}</p>
            </div>
    );
};

export default AllOrdersDetailsController;
