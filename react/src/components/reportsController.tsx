import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface Report {
    id: number;
    name: string;
    description: string;
}

const ReportsController: React.FC = () => {
    const [reports, setReports] = useState<Report[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const response = await axios.get('/api/reports');
                setReports(response.data);
            } catch (err) {
                setError('Error fetching reports');
            }
        };

        fetchReports();
    }, []);

    return (
        <div>
            <h1>Reports</h1>
            {error && <p>{error}</p>}
            <ul>
                {reports.map(report => (
                    <li key={report.id}>
                        <h2>{report.name}</h2>
                        <p>{report.description}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ReportsController;
