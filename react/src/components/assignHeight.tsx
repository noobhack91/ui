import React, { useEffect, useRef } from 'react';

interface AssignHeightProps {
    keyName?: string;
    onHeightChange?: (height: number) => void;
}

const AssignHeight: React.FC<AssignHeightProps> = ({ keyName, onHeightChange }) => {
    const elementRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const updateHeight = () => {
            if (elementRef.current) {
                const height = elementRef.current.offsetHeight;
                if (keyName && onHeightChange) {
                    onHeightChange(height);
                }
            }
        };

        updateHeight();
        window.addEventListener('resize', updateHeight);

        return () => {
            window.removeEventListener('resize', updateHeight);
        };
    }, [keyName, onHeightChange]);

    return <div ref={elementRef}></div>;
};

export default AssignHeight;
