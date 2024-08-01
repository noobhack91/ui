import React from 'react';

const HistoryBack: React.FC = () => {
    const handleClick = () => {
        history.back();
    };

    return (
        <button onClick={handleClick}>
            Go Back
        </button>
    );
};

export default HistoryBack;
