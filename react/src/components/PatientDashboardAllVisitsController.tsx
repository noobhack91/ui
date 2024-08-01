import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

interface PatientDashboardAllVisitsControllerProps {
    patient: any;
    noOfVisits: number;
    sectionConfig: any;
}

const PatientDashboardAllVisitsController: React.FC<PatientDashboardAllVisitsControllerProps> = ({ patient, noOfVisits, sectionConfig }) => {
    const { patientUuid } = useParams<{ patientUuid: string }>();
    const [params, setParams] = useState<any>({});
    const [showAllObservationsData, setShowAllObservationsData] = useState<boolean>(true);

    useEffect(() => {
        const defaultParams = {
            maximumNoOfVisits: noOfVisits ? noOfVisits : 0
        };

        setParams({
            ...defaultParams,
            ...sectionConfig,
            ...params
        });
    }, [noOfVisits, sectionConfig, params]);

    return (
        <div>

            <h2>Patient Visits</h2>
            <p>Patient UUID: {patientUuid}</p>
            <p>Number of Visits: {noOfVisits}</p>
    
                {/* Render patient visits and observations here */}
                {showAllObservationsData && (
            
                        {/* Example of rendering observations */}
                        {patient.visits && patient.visits.length > 0 ? (
                            patient.visits.map((visit: any, index: number) => (
                                <div key={index}>
                                    <h3>Visit {index + 1}</h3>
                                    <p>Date: {visit.date}</p>
                                    <p>Observations: {visit.observations}</p>
                                </div>
                            ))
                        ) : (
                            <p>No visits available.</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PatientDashboardAllVisitsController;
