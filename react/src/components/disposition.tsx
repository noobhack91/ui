import React, { useState, useEffect } from 'react';
import useMessagingService from '../services/messagingService';

interface Disposition {
    additionalObs: { value: string }[];
    preferredName: string | null;
    conceptName: string;
    show?: boolean;
}

interface DispositionProps {
    params: { showDetailsButton: boolean; numberOfVisits?: number };
    patientUuid?: string;
    visitUuid?: string;
}

const Disposition: React.FC<DispositionProps> = ({ params, patientUuid, visitUuid }) => {
    const [dispositions, setDispositions] = useState<Disposition[]>([]);
    const [noDispositionsMessage, setNoDispositionsMessage] = useState<string | null>(null);
    const { showMessage } = useMessagingService();

    useEffect(() => {
        const fetchDispositionByPatient = async (patientUuid: string, numOfVisits: number) => {
            try {
                const response = await dispositionService.getDispositionByPatient(patientUuid, numOfVisits);
                handleDispositionResponse(response);
            } catch (error) {
                showMessage('error', 'Failed to fetch dispositions by patient');
            }
        };

        const fetchDispositionsByVisit = async (visitUuid: string) => {
            try {
                const response = await dispositionService.getDispositionByVisit(visitUuid);
                handleDispositionResponse(response);
            } catch (error) {
                showMessage('error', 'Failed to fetch dispositions by visit');
            }
        };

        const handleDispositionResponse = (response: any) => {
            setDispositions(response.data);
            if (response.data.length === 0) {
                setNoDispositionsMessage('No dispositions available');
                // Emit no-data-present-event equivalent in React
            }
        };

        if (visitUuid) {
            fetchDispositionsByVisit(visitUuid);
        } else if (params.numberOfVisits && patientUuid) {
            fetchDispositionByPatient(patientUuid, params.numberOfVisits);
        }
    }, [params, patientUuid, visitUuid, showMessage]);

    const getNotes = (disposition: Disposition) => {
        if (disposition.additionalObs[0] && disposition.additionalObs[0].value) {
            return disposition.additionalObs[0].value;
        }
        return "";
    };

    const getDisplayName = (disposition: Disposition) => {
        if (disposition.preferredName != null) {
            return disposition.preferredName;
        } else {
            return disposition.conceptName;
        }
    };

    const showDetailsButton = (disposition: Disposition) => {
        if (getNotes(disposition)) {
            return false;
        }
        return params.showDetailsButton;
    };

    const toggle = (element: Disposition) => {
        if (showDetailsButton(element)) {
            element.show = !element.show;
        } else {
            element.show = true;
        }
    };

    return (
        <div>
            {noDispositionsMessage && <p>{noDispositionsMessage}</p>}
            {dispositions.map((disposition, index) => (
                <div key={index}>
                    <h3>{getDisplayName(disposition)}</h3>
                    <p>{getNotes(disposition)}</p>
                    {showDetailsButton(disposition) && (
                        <button onClick={() => toggle(disposition)}>
                            {disposition.show ? 'Hide Details' : 'Show Details'}
                        </button>
                    )}
                </div>
            ))}
        </div>
    );
};

export default Disposition;
