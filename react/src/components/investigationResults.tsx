import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Spinner } from 'react-bootstrap';

interface InvestigationResultsProps {
    params: {
        patientUuid: string;
        numberOfVisits: number;
        visitUuids?: string[];
        initialAccessionCount?: number;
        latestAccessionCount?: number;
        chartConfig: {
            sortResultColumnsLatestFirst?: boolean;
            groupByPanel?: boolean;
        };
    };
}

const InvestigationResults: React.FC<InvestigationResultsProps> = ({ params }) => {
    const [investigationResults, setInvestigationResults] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchInvestigationResults = async () => {
            try {
                const response = await axios.get('/path/to/labOrderResultService', {
                    params: {
                        patientUuid: params.patientUuid,
                        numberOfVisits: params.numberOfVisits,
                        visitUuids: params.visitUuids,
                        initialAccessionCount: params.initialAccessionCount,
                        latestAccessionCount: params.latestAccessionCount,
                        sortResultColumnsLatestFirst: params.chartConfig.sortResultColumnsLatestFirst,
                        groupOrdersByPanel: params.chartConfig.groupByPanel
                    }
                });
                setInvestigationResults(response.data);
            } catch (error) {
                console.error('Error fetching investigation results:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchInvestigationResults();
    }, [params]);

    if (loading) {
        return <Spinner animation="border" />;
    }

    return (
        <div>
            {/* SECOND AGENT: [MISSING CONTEXT] - Render the investigation results here */}
        </div>
    );
};

export default InvestigationResults;
