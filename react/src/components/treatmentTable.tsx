import React from 'react';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import { RootState } from '../store'; // Adjust the import path as necessary

interface TreatmentTableProps {
    drugOrderSections: any[];
    params: any;
}

const TreatmentTable: React.FC<TreatmentTableProps> = ({ drugOrderSections, params }) => {
    const dispatch = useDispatch();
    const otherActiveDrugOrders = useSelector((state: RootState) => state.constants.otherActiveDrugOrders);

    const isOtherActiveSection = (dateString: string) => {
        return dateString === otherActiveDrugOrders;
    };

    const isDataPresent = () => {
        if (drugOrderSections && drugOrderSections.length === 0) {
            dispatch({ type: 'NO_DATA_PRESENT_EVENT' });
            return false;
        }
        return true;
    };

    const downloadPrescription = (visitStartDate: string, visitUuid: string) => {
        dispatch({ type: 'DOWNLOAD_PRESCRIPTION_FROM_DASHBOARD', payload: { visitStartDate, visitUuid } });
    };

    const sharePrescriptions = (visitStartDate: string, visitUuid: string) => {
        dispatch({ type: 'SHARE_PRESCRIPTIONS_VIA_EMAIL', payload: { visitStartDate, visitUuid } });
    };

    return (
        <div>

            {isDataPresent() ? (
                <table className="treatment-table">
                    <thead>
                        <tr>
                            <th>Drug Name</th>
                            <th>Dosage</th>
                            <th>Frequency</th>
                            <th>Start Date</th>
                            <th>End Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {drugOrderSections.map((section, index) => (
                            <tr key={index}>
                                <td>{section.drugName}</td>
                                <td>{section.dosage}</td>
                                <td>{section.frequency}</td>
                                <td>{section.startDate}</td>
                                <td>{section.endDate}</td>
                                <td>
                                    <button onClick={() => downloadPrescription(section.visitStartDate, section.visitUuid)}>Download</button>
                                    <button onClick={() => sharePrescriptions(section.visitStartDate, section.visitUuid)}>Share</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p>No data available</p>
            )}
        </div>
    );
};

export default TreatmentTable;
