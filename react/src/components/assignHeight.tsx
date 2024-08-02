import React, { useEffect, useRef } from 'react';

interface AssignHeightProps {
    keyName: string;
    onHeightChange: (height: number) => void;
}

const AssignHeight: React.FC<AssignHeightProps> = ({ keyName, onHeightChange }) => {
    const elementRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const updateHeight = () => {
            if (elementRef.current) {
                const height = elementRef.current.offsetHeight;
                onHeightChange(height);
            }
        };

        updateHeight();

        window.addEventListener('resize', updateHeight);
        return () => {
            window.removeEventListener('resize', updateHeight);
        };
    }, [onHeightChange]);

    return <div ref={elementRef} data-key={keyName}></div>;
};

export default AssignHeight;
