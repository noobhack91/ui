import React, { useState } from 'react';
import { labResultUploadedFileNameUrl } from '../utils/constants/labResultUploadedFileNameUrl';

interface InvestigationChartProps {
    accessions: any;
    params?: {
        noLabOrdersMessage?: string;
    };
}

const InvestigationChart: React.FC<InvestigationChartProps> = ({ accessions, params }) => {
    const defaultParams = {
        noLabOrdersMessage: "No Lab Orders for this patient."
    };

    const mergedParams = { ...defaultParams, ...params };
    const [showChart, setShowChart] = useState(false);

    const toggleChart = () => {
        setShowChart(!showChart);
    };

    const getUploadedFileUrl = (uploadedFileName: string) => {
        return labResultUploadedFileNameUrl + uploadedFileName;
    };

    return (
        <div>
            <button onClick={toggleChart}>
                {showChart ? 'Hide Chart' : 'Show Chart'}
            </button>
            {showChart && (
                <div>

                    {/* Render the chart here */}
                    {accessions && accessions.length > 0 ? (
        
                            {/* Assuming a Chart component exists to render the chart */}
                            <Chart data={accessions} />
                        </div>
                    ) : (
        
                            {mergedParams.noLabOrdersMessage}
                        </div>
                    )}
                </div>
            )}
            {!showChart && (
                <div>
                    {mergedParams.noLabOrdersMessage}
                </div>
            )}
        </div>
    );
};

export default InvestigationChart;
