import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const EditPatientController: React.FC = () => {
    const { patientUuid } = useParams<{ patientUuid: string }>();
    const [patientData, setPatientData] = useState<any>(null);
    const [serverError, setServerError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPatientData = async () => {
            try {
                const response = await axios.get(`/api/patient/${patientUuid}`);
                setPatientData(response.data);
            } catch (error) {
                setServerError('Error fetching patient data');
            }
        };

        fetchPatientData();
    }, [patientUuid]);

    if (serverError) {
        return <div>{serverError}</div>;
    }

    if (!patientData) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <h1>Edit Patient</h1>

            <form>
                <div>
                    <label htmlFor="name">Name:</label>
                    <input
                        type="text"
                        id="name"
                        value={patientData.name || ''}
                        onChange={(e) => setPatientData({ ...patientData, name: e.target.value })}
                    />
                </div>
                <div>
                    <label htmlFor="age">Age:</label>
                    <input
                        type="number"
                        id="age"
                        value={patientData.age || ''}
                        onChange={(e) => setPatientData({ ...patientData, age: e.target.value })}
                    />
                </div>
                <div>
                    <label htmlFor="address">Address:</label>
                    <input
                        type="text"
                        id="address"
                        value={patientData.address || ''}
                        onChange={(e) => setPatientData({ ...patientData, address: e.target.value })}
                    />
                </div>
                <button type="button" onClick={async () => {
                    try {
                        await axios.put(`/api/patient/${patientUuid}`, patientData);
                        alert('Patient data updated successfully');
                    } catch (error) {
                        setServerError('Error updating patient data');
                    }
                }}>
                    Save
                </button>
            </form>
    );
};

export default EditPatientController;
