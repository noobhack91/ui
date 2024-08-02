import React, { FC } from 'react';

interface NgConfirmClickProps {
    confirmMessage?: string;
    onConfirm: () => void;
}

const NgConfirmClick: FC<NgConfirmClickProps> = ({ confirmMessage = "Are you sure?", onConfirm, children }) => {
    const handleClick = () => {
        if (window.confirm(confirmMessage)) {
            onConfirm();
        }
    };

    return (
        <div onClick={handleClick}>
            {children}
        </div>
    );
};

export default NgConfirmClick;
