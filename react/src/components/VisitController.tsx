import React, { useEffect, useState } from 'react';
import axios from 'axios';

const VisitController: React.FC = () => {
    const [visitData, setVisitData] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchVisitData = async () => {
            try {
                const response = await axios.get('/api/visit');
                setVisitData(response.data);
            } catch (err) {
                setError(err);
            }
        };

        fetchVisitData();
    }, []);

    if (error) {
        return <div>Error: {error.message}</div>;
    }

    if (!visitData) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <h1>Visit Details</h1>
            {/* Render visit details here */}
            <div>{JSON.stringify(visitData)}</div>
        </div>
    );
};

export default VisitController;
