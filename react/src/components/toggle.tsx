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
        // This effect mimics the $watch functionality in AngularJS
        // It updates the class based on the isActive state
        const element = document.querySelector('.toggle-element');
        if (element) {
            if (isActive) {
                element.classList.add('active');
            } else {
                element.classList.remove('active');
            }
        }

        return () => {
            // Cleanup function to mimic $destroy event in AngularJS
            if (element) {
                element.removeEventListener('click', handleClick);
            }
        };
    }, [isActive]);

    return (
        <div className="toggle-element" onClick={handleClick}>
            {/* Render children or any other content here */}
        </div>
    );
};

export default Toggle;
