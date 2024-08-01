import React, { useState, useEffect, useCallback } from 'react';

interface SingleSubmitProps {
    singleSubmit: () => Promise<any>;
}

const SingleSubmit: React.FC<SingleSubmitProps> = ({ singleSubmit, children }) => {
    const [ignoreSubmit, setIgnoreSubmit] = useState(false);

    const submitHandler = useCallback(async (event: React.FormEvent) => {
        event.preventDefault();
        if (ignoreSubmit) {
            return;
        }
        setIgnoreSubmit(true);
        try {
            await singleSubmit();
        } finally {
            setIgnoreSubmit(false);
        }
    }, [ignoreSubmit, singleSubmit]);

    useEffect(() => {
        return () => {
            // Cleanup if needed when component is unmounted
        };
    }, []);

    return (
        <form onSubmit={submitHandler}>
            {children}
        </form>
    );
};

export default SingleSubmit;
