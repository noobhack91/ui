import React, { useState, useEffect } from 'react';

interface SingleClickProps {
    onSingleClick: () => Promise<void>;
}

const SingleClick: React.FC<SingleClickProps> = ({ onSingleClick, children }) => {
    const [ignoreClick, setIgnoreClick] = useState(false);

    const handleClick = async () => {
        if (ignoreClick) {
            return;
        }
        setIgnoreClick(true);
        try {
            await onSingleClick();
        } finally {
            setIgnoreClick(false);
        }
    };

    useEffect(() => {
        return () => {
            // Cleanup if necessary
        };
    }, []);

    return (
        <div onClick={handleClick}>
            {children}
        </div>
    );
};

export default SingleClick;
