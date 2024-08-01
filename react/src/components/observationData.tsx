import React from 'react';

interface Observation {
    value?: { display?: string } | string;
    groupMembers?: any[];
}

interface ObservationDataProps {
    observation: Observation;
}

const ObservationData: React.FC<ObservationDataProps> = ({ observation }) => {
    const hasGroupMembers = (): boolean => {
        return observation.groupMembers && observation.groupMembers.length > 0;
    };

    const getDisplayValue = (): string | null => {
        return observation.value ? (typeof observation.value === 'string' ? observation.value : observation.value.display || observation.value) : null;
    };

    return (
        <div>
            {/* Render the observation data here */}
            <div>{getDisplayValue()}</div>
            {hasGroupMembers() && <div>Group Members Present</div>}
        </div>
    );
};

export default ObservationData;
