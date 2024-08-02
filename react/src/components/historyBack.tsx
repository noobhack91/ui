import React from 'react';

interface HistoryBackProps {
    // Define any props if needed
}

const HistoryBack: React.FC<HistoryBackProps> = () => {
    const handleClick = () => {
        window.history.back();
    };

    return (
        <button onClick={handleClick}>
            Go Back
        </button>
    );
};

export default HistoryBack;
