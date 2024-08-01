import React, { useEffect, useRef, useState } from 'react';

interface AssignHeightProps {
    keyName?: string;
    onHeightChange?: (height: number) => void;
}

const AssignHeight: React.FC<AssignHeightProps> = ({ keyName, onHeightChange, children }) => {
    const elementRef = useRef<HTMLDivElement>(null);
    const [height, setHeight] = useState<number>(0);

    useEffect(() => {
        const updateHeight = () => {
            if (elementRef.current) {
                const newHeight = elementRef.current.offsetHeight;
                setHeight(newHeight);
                if (onHeightChange) {
                    onHeightChange(newHeight);
                }
            }
        };

        updateHeight();
        window.addEventListener('resize', updateHeight);

        return () => {
            window.removeEventListener('resize', updateHeight);
        };
    }, [onHeightChange]);

    useEffect(() => {
        if (keyName && typeof window !== 'undefined') {
            (window as any)[keyName] = { height };
        }
    }, [height, keyName]);

    return <div ref={elementRef}>{children}</div>;
};

export default AssignHeight;
