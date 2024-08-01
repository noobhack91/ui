import React, { useState, useEffect } from 'react';

interface LabOrderResult {
    isPanel: boolean;
    tests: Array<{ abnormal: boolean; accessionUuid: string; accessionDateTime: string; accessionNotes: string }>;
    abnormal: boolean;
}

interface Accession {
    isOpen: boolean;
    labOrderResults: LabOrderResult[];
}

interface InvestigationTableProps {
    accessions: Accession[];
    params: {
        noLabOrdersMessage: string;
        showNormalLabResults: boolean;
        showAccessionNotes: boolean;
        title: string;
        translationKey: string;
    };
}

const InvestigationTable: React.FC<InvestigationTableProps> = ({ accessions, params }) => {
    const [localAccessions, setLocalAccessions] = useState<Accession[]>([]);

    useEffect(() => {
        if (accessions && accessions[0]) {
            accessions[0].isOpen = true;
        }
        setLocalAccessions(accessions);
    }, [accessions]);

    const hasAbnormalTests = (labOrderResult: LabOrderResult): boolean => {
        if (labOrderResult.isPanel) {
            return labOrderResult.tests.some(test => test.abnormal);
        }
        return labOrderResult.abnormal;
    };

    const hasLabOrders = (): boolean => {
        if (localAccessions && localAccessions.length > 0) return true;
        // SECOND AGENT: [MISSING CONTEXT] - Emit "no-data-present-event" equivalent in React
        return false;
    };

    const shouldShowResults = (labOrderResult: LabOrderResult): boolean => {
        return params.showNormalLabResults || hasAbnormalTests(labOrderResult);
    };

    const toggle = (item: any, event: React.MouseEvent): void => {
        event.stopPropagation();
        item.show = !item.show;
        setLocalAccessions([...localAccessions]);
    };

    const getAccessionDetailsFrom = (labOrderResults: LabOrderResult[]) => {
        const labResultLine = labOrderResults[0].isPanel ? labOrderResults[0].tests[0] : labOrderResults[0];
        return {
            accessionUuid: labResultLine.accessionUuid,
            accessionDateTime: labResultLine.accessionDateTime,
            accessionNotes: labResultLine.accessionNotes
        };
    };

    const toggleAccession = (labOrderResults: LabOrderResult[]): void => {
        labOrderResults.isOpen = !labOrderResults.isOpen;
        setLocalAccessions([...localAccessions]);
    };

    const showAccessionNotes = (labOrderResults: LabOrderResult[]): boolean => {
        return getAccessionDetailsFrom(labOrderResults).accessionNotes && params.showAccessionNotes;
    };

    return (
        <div>
            <h2>{params.title}</h2>
            {hasLabOrders() ? (
                localAccessions.map((accession, index) => (
                    <div key={index}>
                        <div onClick={(e) => toggle(accession, e)}>
                            {/* Render accession details */}
                        </div>
                        {accession.isOpen && (
                            <div>
                                {accession.labOrderResults.map((result, idx) => (
                                    shouldShowResults(result) && (
                                        <div key={idx}>
                                            {/* Render lab order result details */}
                                            {showAccessionNotes(result) && (
                                                <div>
                                                    {/* Render accession notes */}
                                                </div>
                                            )}
                                        </div>
                                    )
                                ))}
                            </div>
                        )}
                    </div>
                ))
            ) : (
                <div>{params.noLabOrdersMessage}</div>
            )}
        </div>
    );
};

export default InvestigationTable;
