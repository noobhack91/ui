import React, { useState } from 'react';

interface PatientSummaryProps {
    patient: any; // Replace 'any' with the actual type of patient
    bedDetails: any; // Replace 'any' with the actual type of bedDetails
    onImageClickHandler?: () => void;
}

const PatientSummary: React.FC<PatientSummaryProps> = ({ patient, bedDetails, onImageClickHandler }) => {
    const [showPatientDetails, setShowPatientDetails] = useState(false);

    const togglePatientDetails = () => {
        setShowPatientDetails(!showPatientDetails);
    };

    const handleImageClick = () => {
        if (onImageClickHandler) {
            onImageClickHandler();
        }
    };

    return (
        <div>
            <div onClick={togglePatientDetails}>
                {/* Render patient summary header here */}
                <h2>{patient.name}</h2>
                <p>{bedDetails}</p>
            </div>
            {showPatientDetails && (
                <div>
                    {/* Render patient details here */}
                    <p>Details about the patient...</p>
                </div>
            )}
            <div onClick={handleImageClick}>
                {/* Render patient image here */}
                <img src={patient.imageUrl} alt="Patient" />
            </div>
        </div>
    );
};

export default PatientSummary;
