import React, { useState, useEffect } from 'react';

interface NewOrderGroupProps {
    treatments: any[];
    orderSetName: string;
}

const NewOrderGroup: React.FC<NewOrderGroupProps> = ({ treatments, orderSetName }) => {
    const [config, setConfig] = useState({
        columns: ['drugName', 'dosage', 'frequency', 'route', 'duration', 'startDate', 'instructions'],
        actions: ['edit'],
        columnHeaders: {
            frequency: 'MEDICATION_LABEL_FREQUENCY',
            drugName: 'MEDICATION_DRUG_NAME_TITLE'
        },
        title: ''
    });

    useEffect(() => {
        if (orderSetName) {
            setConfig(prevConfig => ({
                ...prevConfig,
                title: orderSetName
            }));
        }
    }, [orderSetName]);

    return (
        <div>

            <table>
                <thead>
                    <tr>
                        {config.columns.map((column, index) => (
                            <th key={index}>
                                {config.columnHeaders[column] || column}
                            </th>
                        ))}
                        {config.actions.includes('edit') && <th>Actions</th>}
                    </tr>
                </thead>
                <tbody>
                    {treatments.map((treatment, index) => (
                        <tr key={index}>
                            {config.columns.map((column, colIndex) => (
                                <td key={colIndex}>{treatment[column]}</td>
                            ))}
                            {config.actions.includes('edit') && (
                                <td>
                                    <button>Edit</button>
                                </td>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default NewOrderGroup;
