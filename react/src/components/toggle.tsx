import React, { useState, useEffect } from 'react';

interface ToggleProps {
    toggle?: boolean;
}

const Toggle: React.FC<ToggleProps> = ({ toggle = false }) => {
    const [isActive, setIsActive] = useState(toggle);

    useEffect(() => {
        setIsActive(toggle);
    }, [toggle]);

    const handleClick = () => {
        setIsActive(!isActive);
    };

    useEffect(() => {
        // This effect is to mimic the $watch functionality in AngularJS
        // It will run whenever isActive changes
        // You can add any side effects here if needed
    }, [isActive]);

    useEffect(() => {
        return () => {
            // Cleanup function to mimic $on("$destroy") in AngularJS
            // This will run when the component is unmounted
        };
    }, []);

    return (
        <div
            className={`toggle ${isActive ? 'active' : ''}`}
            onClick={handleClick}
        >

            {/* Add any child elements or content here if needed */}
        </div>
    );
};

export default Toggle;
