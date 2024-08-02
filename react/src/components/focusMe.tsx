import React, { useEffect, useRef } from 'react';

interface FocusMeProps {
    shouldFocus: boolean;
}

const FocusMe: React.FC<FocusMeProps> = ({ shouldFocus }) => {
    const elementRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (shouldFocus && elementRef.current) {
            elementRef.current.focus();
        }
    }, [shouldFocus]);

    return <input ref={elementRef} />;
};

export default FocusMe;
