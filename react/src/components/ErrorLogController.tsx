import React from 'react';
import { useHistory } from 'react-router-dom';
import { Button } from 'react-bootstrap';

const ErrorLogController: React.FC = () => {
    const history = useHistory();

    const handleBackToDashboard = () => {
        history.push('/dashboard');
    };

    return (
        <div>
            <h1>Error Log</h1>
            <Button onClick={handleBackToDashboard}>
                Home
            </Button>
        </div>
    );
};

export default ErrorLogController;
