import React, { useEffect } from 'react';

interface ValidateOnProps {
    validateOn: any;
    validationMessage?: string;
    value: any;
    setValidity: (isValid: boolean) => void;
}

const ValidateOn: React.FC<ValidateOnProps> = ({ validateOn, validationMessage = 'Please enter a valid detail', value, setValidity }) => {
    useEffect(() => {
        const valid = value ? true : false;
        setValidity(valid);
        if (!valid) {
            // Assuming there's a way to set custom validity message in React
            // SECOND AGENT: [MISSING CONTEXT] - Need to set custom validity message in React
        }
    }, [validateOn, value, setValidity, validationMessage]);

    return null;
};

export default ValidateOn;
