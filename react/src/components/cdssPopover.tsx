import React from 'react';

interface CdssPopoverProps {
    alerts: any[];
}

const CdssPopover: React.FC<CdssPopoverProps> = ({ alerts }) => {
    return (
        <div className="cdss-popover">
            {/* Render alerts here */}
            {alerts.map((alert, index) => (
                <div key={index} className="alert">
                    {alert}
                </div>
            ))}
        </div>
    );
};

export default CdssPopover;
