import React, { useState, useEffect } from 'react';

interface InvestigationTableRowProps {
    test: any;
    params: any;
}

const InvestigationTableRow: React.FC<InvestigationTableRowProps> = ({ test, params }) => {
    const [showDetails, setShowDetails] = useState(false);
    const [labReportUrl, setLabReportUrl] = useState<string | null>(null);

    useEffect(() => {
        const defaultParams = {
            showDetailsButton: true
        };
        params = { ...defaultParams, ...params };

        test.showNotes = hasNotes();
        test.showDetailsButton = params.showDetailsButton;
        setLabReportUrl(test.uploadedFileName ? urlFrom(test.uploadedFileName) : null);
    }, [test, params]);

    const urlFrom = (fileName: string) => {
        return `${process.env.REACT_APP_LAB_RESULT_UPLOADED_FILE_NAME_URL}${fileName}`;
    };

    const hasNotes = () => {
        return test.notes || test.showNotes ? true : false;
    };

    const getFormattedRange = (test: any) => {
        if (test.minNormal && test.maxNormal) {
            return `(${test.minNormal} - ${test.maxNormal})`;
        } else if (test.minNormal && !test.maxNormal) {
            return `(>${test.minNormal})`;
        } else if (!test.minNormal && test.maxNormal) {
            return `(<${test.maxNormal})`;
        } else {
            return "";
        }
    };

    const getLocaleSpecificNameForPanel = (test: any) => {
        if (test.preferredPanelName != null) {
            return test.preferredPanelName;
        } else {
            if (!test.panelName) {
                return test.orderName;
            } else {
                return test.panelName;
            }
        }
    };

    const getLocaleSpecificNameForTest = (test: any) => {
        if (test.preferredTestName != null) {
            return test.preferredTestName;
        } else {
            return test.testName;
        }
    };

    const showTestNotes = () => {
        return hasNotes();
    };

    const toggle = () => {
        setShowDetails(!showDetails);
    };

    const isValidResultToShow = (result: any) => {
        if (result != undefined && result != null && result.toLowerCase() !== 'undefined' && result.toLowerCase() !== 'null') {
            return true;
        }
        return false;
    };

    return (
        <div>
            {/* Render the component UI here */}

            <div className="investigation-table-row">
                <div className="test-name">
                    {getLocaleSpecificNameForTest(test)}
                </div>
                <div className="test-range">
                    {getFormattedRange(test)}
                </div>
                <div className="test-result">
                    {isValidResultToShow(test.result) ? test.result : 'N/A'}
                </div>
                {params.showDetailsButton && (
                    <button onClick={toggle}>
                        {showDetails ? 'Hide Details' : 'Show Details'}
                    </button>
                )}
                {showDetails && (
                    <div className="test-details">
                        {showTestNotes() && <div className="test-notes">{test.notes}</div>}
                        {labReportUrl && (
                            <a href={labReportUrl} target="_blank" rel="noopener noreferrer">
                                View Lab Report
                            </a>
                        )}
                    </div>
                )}
            </div>
    );
};

export default InvestigationTableRow;
