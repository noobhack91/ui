import React, { useState, useEffect } from 'react';
import { Modal } from 'react-bootstrap';
import conditionsService from '../services/conditionsService';
import providerInfoService from '../services/providerInfoService';

interface ConditionsListProps {
    params: any;
    patient: { uuid: string };
}

const ConditionsList: React.FC<ConditionsListProps> = ({ params, patient }) => {
    const [conditions, setConditions] = useState<any[]>([]);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        conditionsService.getConditions(patient.uuid).then((conditions) => {
            setConditions(conditions);
            providerInfoService.setProvider(conditions);
        });
    }, [patient.uuid]);

    const openSummaryDialog = () => {
        setShowModal(true);
    };

    const closeSummaryDialog = () => {
        setShowModal(false);
    };

    return (
        <div>
            <button onClick={openSummaryDialog}>Open Summary</button>
            <Modal show={showModal} onHide={closeSummaryDialog} className="ngdialog-theme-default ng-dialog-all-details-page">
                <Modal.Header closeButton>
                    <Modal.Title>Conditions Summary</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div>
                        {/* SECOND AGENT: [MISSING CONTEXT] - Render conditions list here */}
                    </div>
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default ConditionsList;
