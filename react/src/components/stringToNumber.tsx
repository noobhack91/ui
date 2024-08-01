import React, { useEffect } from 'react';

interface StringToNumberProps {
    value: string;
    onChange: (value: number) => void;
}

const StringToNumber: React.FC<StringToNumberProps> = ({ value, onChange }) => {
    useEffect(() => {
        const numberValue = parseFloat(value);
        if (!isNaN(numberValue)) {
            onChange(numberValue);
        }
    }, [value, onChange]);

    return null;
};

export default StringToNumber;
