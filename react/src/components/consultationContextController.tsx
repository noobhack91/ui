import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import appService from '../services/appService';
import visitHistory from '../services/visitHistory';
import _ from 'lodash';

interface PatientInfoSection {
    title: string;
    name: string;
    patientAttributes: any[];
    ageLimit?: number;
    addressFields: string[];
}

interface ConsultationContextProps {}

const ConsultationContextController: React.FC<ConsultationContextProps> = () => {
    const { configName } = useParams<{ configName: string }>();
    const [visitUuid, setVisitUuid] = useState<string | undefined>(undefined);
    const [patientInfoSection, setPatientInfoSection] = useState<PatientInfoSection>({
        title: "Patient Information",
        name: "patientInformation",
        patientAttributes: [],
        addressFields: ["address1", "address2", "cityVillage", "countyDistrict"]
    });

    useEffect(() => {
        const init = () => {
            const programConfig = appService.getAppDescriptor().getConfigValue('program');
            setVisitUuid(_.get(visitHistory, 'activeVisit.uuid'));
            setPatientInfoSection(prevState => ({
                ...prevState,
                ageLimit: programConfig ? programConfig.patientInformation ? programConfig.patientInformation.ageLimit : undefined : undefined
            }));
        };
        init();
    }, [configName]);

    return (
        <div>
            {/* Render patient information section */}
            <h2>{patientInfoSection.title}</h2>

            <div>
                <p><strong>Name:</strong> {patientInfoSection.name}</p>
                <p><strong>Age Limit:</strong> {patientInfoSection.ageLimit ? patientInfoSection.ageLimit : 'N/A'}</p>
                <div>
                    <strong>Address Fields:</strong>
                    <ul>
                        {patientInfoSection.addressFields.map((field, index) => (
                            <li key={index}>{field}</li>
                        ))}
                    </ul>
                </div>
                <div>
                    <strong>Patient Attributes:</strong>
                    <ul>
                        {patientInfoSection.patientAttributes.length > 0 ? (
                            patientInfoSection.patientAttributes.map((attribute, index) => (
                                <li key={index}>{attribute}</li>
                            ))
                        ) : (
                            <li>No attributes available</li>
                        )}
                    </ul>
                </div>
            </div>
    );
};

export default ConsultationContextController;
