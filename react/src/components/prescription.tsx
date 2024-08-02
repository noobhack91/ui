import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface PrescriptionProps {
    patient: { uuid: string };
    visitDate: string;
    visitUuid: string;
    printParams: any;
}

const Prescription: React.FC<PrescriptionProps> = ({ patient, visitDate, visitUuid, printParams }) => {
    const [drugOrders, setDrugOrders] = useState<any[]>([]);
    const [encounterDrugOrderMap, setEncounterDrugOrderMap] = useState<any[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const treatmentConfig = await getTreatmentConfig();
                const drugOrderResponse = await getPrescribedAndActiveDrugOrders(patient.uuid, visitUuid);

                const createDrugOrderViewModel = (drugOrder: any) => {
                    return Bahmni.Clinical.DrugOrderViewModel.createFromContract(drugOrder, treatmentConfig);
                };

                for (const key in drugOrderResponse) {
                    drugOrderResponse[key] = drugOrderResponse[key].map(createDrugOrderViewModel);
                }

                const drugUtil = Bahmni.Clinical.DrugOrder.Util;
                const orderGroupOrders = _.groupBy(drugOrderResponse.visitDrugOrders, (drugOrder: any) => {
                    if (drugOrder.orderGroupUuid) {
                        return 'orderGroupOrders';
                    }
                    return 'drugOrders';
                });

                const drugOrdersSorted = drugUtil.sortDrugOrders(orderGroupOrders.drugOrders);
                const combinedDrugOrders = _.uniqBy([...orderGroupOrders.orderGroupOrders, ...drugOrdersSorted], 'uuid');
                setDrugOrders(combinedDrugOrders);

                if (printParams) {
                    const groupedDrugOrders = _(combinedDrugOrders)
                        .groupBy('encounterUuid')
                        .map((items, encounterUuid) => ({
                            encounterUuid,
                            drugOrders: _.map(items)
                        }))
                        .value();
                    setEncounterDrugOrderMap(groupedDrugOrders);
                }
            } catch (error) {
                console.error('Error fetching prescription data', error);
            }
        };

        fetchData();
    }, [patient.uuid, visitUuid, printParams]);

    const getTreatmentConfig = async () => {
        // SECOND AGENT: [MISSING CONTEXT] - Function to fetch treatment configuration
    };

    const getPrescribedAndActiveDrugOrders = async (patientUuid: string, visitUuid: string) => {
        // SECOND AGENT: [MISSING CONTEXT] - Function to fetch prescribed and active drug orders
    };

    return (
        <div>
            {/* Render the drug orders here */}

            <div>
                {drugOrders.length > 0 ? (
                    <ul>
                        {drugOrders.map((order) => (
                            <li key={order.uuid}>
                                <div>
                                    <strong>Drug Name:</strong> {order.drugName}
                                </div>
                                <div>
                                    <strong>Dosage:</strong> {order.dosage}
                                </div>
                                <div>
                                    <strong>Frequency:</strong> {order.frequency}
                                </div>
                                <div>
                                    <strong>Duration:</strong> {order.duration}
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No drug orders available.</p>
                )}
            </div>
    );
};

export default Prescription;
