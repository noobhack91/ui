import React from 'react';
import { useHistory } from 'react-router-dom';

const HeaderController: React.FC = () => {
    const history = useHistory();

    const goToAdmitState = () => {
        const options = { dashboardCachebuster: Math.random() };
        history.push({ pathname: "/home", state: options });
    };

    const goToBedManagementState = () => {
        const options = { dashboardCachebuster: Math.random() };
        history.push({ pathname: "/bedManagement", state: options });
    };

    return (
        <div>
            <button onClick={goToAdmitState}>Go to Admit State</button>
            <button onClick={goToBedManagementState}>Go to Bed Management State</button>
        </div>
    );
};

export default HeaderController;
