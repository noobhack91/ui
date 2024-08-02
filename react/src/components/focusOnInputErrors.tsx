import React, { useEffect } from 'react';

const FocusOnInputErrors: React.FC = () => {
    useEffect(() => {
        const handleErrorsOnForm = () => {
            setTimeout(() => {
                const illegalValueButton = document.querySelector('.illegalValue:first-of-type button') as HTMLElement;
                const illegalValue = document.querySelector('.illegalValue:first-of-type') as HTMLElement;
                if (illegalValueButton) {
                    illegalValueButton.focus();
                } else if (illegalValue) {
                    illegalValue.focus();
                }
            }, 10);
        };

        document.addEventListener('event:errorsOnForm', handleErrorsOnForm);

        return () => {
            document.removeEventListener('event:errorsOnForm', handleErrorsOnForm);
        };
    }, []);

    return null;
};

export default FocusOnInputErrors;
