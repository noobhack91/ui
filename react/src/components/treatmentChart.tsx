import React from 'react';

interface TreatmentChartProps {
    ipdDrugOrders: any; // Replace 'any' with the appropriate type
    visitSummary: any; // Replace 'any' with the appropriate type
    params: any; // Replace 'any' with the appropriate type
}

const TreatmentChart: React.FC<TreatmentChartProps> = ({ ipdDrugOrders, visitSummary, params }) => {
    const atLeastOneDrugForDay = (day: any): boolean => { // Replace 'any' with the appropriate type
        let atLeastOneDrugForDay = false;
        ipdDrugOrders.getIPDDrugs().forEach((drug: any) => { // Replace 'any' with the appropriate type
            if (drug.isActiveOnDate(day.date)) {
                atLeastOneDrugForDay = true;
            }
        });
        return atLeastOneDrugForDay;
    };

    const getVisitStopDateTime = (): Date => {
        return visitSummary.stopDateTime || new Date();
    };

    return (
        <div>

            <h3>Treatment Chart</h3>
            <table>
                <thead>
                    <tr>
                        <th>Day</th>
                        <th>Drugs</th>
                    </tr>
                </thead>
                <tbody>
                    {params.days.map((day: any) => ( // Replace 'any' with the appropriate type
                        <tr key={day.date}>
                            <td>{day.date}</td>
                            <td>
                                {atLeastOneDrugForDay(day) ? (
                                    <span>Active Drugs</span>
                                ) : (
                                    <span>No Active Drugs</span>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default TreatmentChart;
