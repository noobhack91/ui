import React, { useState, useEffect } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import _ from 'lodash';
import { getMaxRecentlyViewedPatients } from '../utils/constants/clinicalDashboardConfig';
import { findPatients } from '../services/patientService';
import { getLoginLocationUuid } from '../services/sessionService';
import { globalPropertyToFetchActivePatients } from '../utils/constants/BahmniClinicalConstants';

interface Patient {
    uuid: string;
    // Add other patient properties as needed
}

interface RecentPatientsProps {
    currentUser: {
        recentlyViewedPatients: Patient[];
    };
    patient: Patient;
}

const RecentPatients: React.FC<RecentPatientsProps> = ({ currentUser, patient }) => {
    const [search, setSearch] = useState<string>('');
    const [showPatientsList, setShowPatientsList] = useState<boolean>(false);
    const [showPatientsBySearch, setShowPatientsBySearch] = useState<boolean>(false);
    const [recentlyViewedPatients, setRecentlyViewedPatients] = useState<Patient[]>([]);
    const [patientIndex, setPatientIndex] = useState<number>(-1);

    const history = useHistory();
    const { configName } = useParams<{ configName: string }>();

    useEffect(() => {
        setRecentlyViewedPatients(_.take(currentUser.recentlyViewedPatients, getMaxRecentlyViewedPatients()));
        const index = _.findIndex(currentUser.recentlyViewedPatients, (patientHistoryEntry) => patientHistoryEntry.uuid === patient.uuid);
        setPatientIndex(index);
    }, [currentUser, patient]);

    const hasNext = () => {
        return patientIndex !== 0;
    };

    const hasPrevious = () => {
        return patientIndex >= 0 && recentlyViewedPatients.length - 1 !== patientIndex;
    };

    const goToDashboard = (patientUuid: string) => {
        history.push(`/patient/dashboard/${configName}/${patientUuid}`);
    };

    const next = () => {
        if (hasNext()) {
            goToDashboard(recentlyViewedPatients[patientIndex - 1].uuid);
        }
    };

    const previous = () => {
        if (hasPrevious()) {
            goToDashboard(recentlyViewedPatients[patientIndex + 1].uuid);
        }
    };

    const clearSearch = () => {
        setSearch('');
        // Assuming there's an input element with class 'search-input' in the component
        document.querySelector<HTMLInputElement>('.search-input')?.focus();
    };

    const getActivePatients = async () => {
        setShowPatientsBySearch(true);
        if (search.length > 0) {
            return;
        }
        const params = {
            q: globalPropertyToFetchActivePatients,
            location_uuid: getLoginLocationUuid()
        };
        const response = await findPatients(params);
        // Assuming updatePatientList is a function to update the patient list in the search state

        const updatePatientList = (patients: Patient[]) => {
            // Update the search state with the new list of patients
            setSearch((prevSearch) => ({
                ...prevSearch,
                patients: patients

            <div>
                <button onClick={() => setShowPatientsList(!showPatientsList)}>
                    {showPatientsList ? 'Hide Patients List' : 'Show Patients List'}
                </button>
                {showPatientsList && (
                    <ul>
                        {recentlyViewedPatients.map((patient, index) => (
                            <li key={patient.uuid}>
                                {patient.uuid} {/* Replace with actual patient details */}
                                <button onClick={() => goToDashboard(patient.uuid)}>Go to Dashboard</button>
                            </li>
                        ))}
                    </ul>
                )}
                <button onClick={clearSearch}>Clear Search</button>
                <input
                    type="text"
                    className="search-input"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <button onClick={getActivePatients}>Get Active Patients</button>
                {showPatientsBySearch && (
                    <div>
                        {/* Render the search results here */}

                        {search.patients && search.patients.length > 0 ? (
                            <ul>
                                {search.patients.map((patient) => (
                                    <li key={patient.uuid}>
                                        {patient.uuid} {/* Replace with actual patient details */}
                                        <button onClick={() => goToDashboard(patient.uuid)}>Go to Dashboard</button>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p>No active patients found.</p>
                        )}
                )}
                <button onClick={previous} disabled={!hasPrevious()}>
                    Previous
                </button>

            <button onClick={() => setShowPatientsList(!showPatientsList)}>
                {showPatientsList ? 'Hide Patients List' : 'Show Patients List'}
            </button>
            {showPatientsList && (
                <ul>
                    {recentlyViewedPatients.map((patient, index) => (
                        <li key={patient.uuid}>
                            {patient.uuid} {/* Replace with actual patient details */}
                            <button onClick={() => goToDashboard(patient.uuid)}>Go to Dashboard</button>
                        </li>
                    ))}
                </ul>
            )}
            <button onClick={clearSearch}>Clear Search</button>
            <input
                type="text"
                className="search-input"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />
            <button onClick={getActivePatients}>Get Active Patients</button>
            {showPatientsBySearch && (
                <div>
                    {/* Render the search results here */}

                    {search.patients && search.patients.length > 0 ? (
                        <ul>
                            {search.patients.map((patient) => (
                                <li key={patient.uuid}>
                                    {patient.uuid} {/* Replace with actual patient details */}
                                    <button onClick={() => goToDashboard(patient.uuid)}>Go to Dashboard</button>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>No active patients found.</p>
                    )}
            )}
            <button onClick={previous} disabled={!hasPrevious()}>
                Previous
            </button>
            <button onClick={next} disabled={!hasNext()}>

            <button onClick={() => setShowPatientsList(!showPatientsList)}>
                {showPatientsList ? 'Hide Patients List' : 'Show Patients List'}
            </button>
            {showPatientsList && (
                <ul>
                    {recentlyViewedPatients.map((patient, index) => (
                        <li key={patient.uuid}>
                            {patient.uuid} {/* Replace with actual patient details */}
                            <button onClick={() => goToDashboard(patient.uuid)}>Go to Dashboard</button>
                        </li>
                    ))}
                </ul>
            )}
            <button onClick={clearSearch}>Clear Search</button>
            <input
                type="text"
                className="search-input"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />
            <button onClick={getActivePatients}>Get Active Patients</button>
            {showPatientsBySearch && (
                <div>
                    {/* Render the search results here */}
                    {search.patients && search.patients.length > 0 ? (
                        <ul>
                            {search.patients.map((patient) => (
                                <li key={patient.uuid}>
                                    {patient.uuid} {/* Replace with actual patient details */}
                                    <button onClick={() => goToDashboard(patient.uuid)}>Go to Dashboard</button>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>No active patients found.</p>
                    )}
                </div>
            )}
            <button onClick={previous} disabled={!hasPrevious()}>
                Previous
            </button>
            <button onClick={next} disabled={!hasNext()}>
                Next
            </button>
                </button>
            </div>

        updatePatientList(response.data);
    };

    return (
        <div>
            {/* Render the component UI here */}

            <button onClick={() => setShowPatientsList(!showPatientsList)}>
                {showPatientsList ? 'Hide Patients List' : 'Show Patients List'}
            </button>
            {showPatientsList && (
                <ul>
                    {recentlyViewedPatients.map((patient, index) => (
                        <li key={patient.uuid}>
                            {patient.uuid} {/* Replace with actual patient details */}
                            <button onClick={() => goToDashboard(patient.uuid)}>Go to Dashboard</button>
                        </li>
                    ))}
                </ul>
            )}
            <button onClick={clearSearch}>Clear Search</button>
            <input
                type="text"
                className="search-input"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />
            <button onClick={getActivePatients}>Get Active Patients</button>
            {showPatientsBySearch && (
                <div>
                    {/* Render the search results here */}
                    {search.patients && search.patients.length > 0 ? (
                        <ul>
                            {search.patients.map((patient) => (
                                <li key={patient.uuid}>
                                    {patient.uuid} {/* Replace with actual patient details */}
                                    <button onClick={() => goToDashboard(patient.uuid)}>Go to Dashboard</button>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>No active patients found.</p>
                    )}
                </div>
            )}
            <button onClick={previous} disabled={!hasPrevious()}>
                Previous
            </button>
            <button onClick={next} disabled={!hasNext()}>
                Next
            </button>
    );
};

export default RecentPatients;
