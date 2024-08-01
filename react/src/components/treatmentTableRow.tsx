import React, { useState } from 'react';

interface TreatmentTableRowProps {
    drugOrder: any; // Replace 'any' with the actual type if known
    params: {
        showProvider?: boolean;
    };
}

const TreatmentTableRow: React.FC<TreatmentTableRowProps> = ({ drugOrder, params }) => {
    const [showDetails, setShowDetails] = useState(false);

    if (params.showProvider === undefined) {
        params.showProvider = true;
    }

    const toggle = () => {
        setShowDetails(!showDetails);
    };

    return (
        <div>
            {/* Assuming the templateUrl content is converted to JSX here */}
            <div onClick={toggle}>
                {/* Render drugOrder and other details here */}
                {showDetails && (
                    <div>
                        {/* Render detailed view here */}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TreatmentTableRow;
