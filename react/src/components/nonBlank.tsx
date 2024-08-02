import React, { useEffect } from 'react';

interface NonBlankProps {
    value: any;
    onChange: (value: any) => void;
}

const NonBlank: React.FC<NonBlankProps> = ({ value, onChange }) => {
    const elementRef = React.useRef<HTMLInputElement>(null);

    useEffect(() => {
        const element = elementRef.current;
        if (!element) return;

        const addNonBlankAttrs = () => {
            element.setAttribute('required', 'required');
        };

        const removeNonBlankAttrs = () => {
            element.removeAttribute('required');
        };

        if (!value) {
            addNonBlankAttrs();
        } else {
            removeNonBlankAttrs();
        }
    }, [value]);

    return (
        <input
            ref={elementRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
        />
    );
};

export default NonBlank;
