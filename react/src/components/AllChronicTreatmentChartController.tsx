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

            <h2>Chronic Treatment Chart</h2>
    
                <strong>Patient:</strong> {patient.name}
            </div>
    
                <strong>Enrollment Date:</strong> {new Date(enrollment.date).toLocaleDateString()}
            </div>
    
                <strong>Section:</strong> {section.name}
            </div>
    
                <strong>Config:</strong> {JSON.stringify(config)}
            </div>
            {/* Render additional details or charts based on the patient, enrollment, and config data */}
        </div>
    );
};

export default AllChronicTreatmentChartController;
