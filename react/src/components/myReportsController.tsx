import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface Report {
    id: number;
    name: string;
    description: string;
}

const MyReportsController: React.FC = () => {
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const response = await axios.get('/api/reports');
                setReports(response.data);
            } catch (err) {
                setError('Error fetching reports');
            } finally {
                setLoading(false);
            }
        };

        fetchReports();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div>
            <h1>My Reports</h1>
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

export default MyReportsController;
