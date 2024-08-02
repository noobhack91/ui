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
                const drugOrderResponse = await getPrescribedAndActiveDrugOrders(patient.uuid, 1, false, [visitUuid], "", "", "");

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

    return (
        <div>
            {/* Render the prescription data here */}

            <div>
                {drugOrders.length > 0 ? (
                    <ul>
                        {drugOrders.map((drugOrder) => (
                            <li key={drugOrder.uuid}>
                                <div>
                                    <strong>Drug Name:</strong> {drugOrder.drug.name}
                                </div>
                                <div>
                                    <strong>Dosage:</strong> {drugOrder.dosageInstruction}
                                </div>
                                <div>
                                    <strong>Start Date:</strong> {drugOrder.startDate}
                                </div>
                                <div>
                                    <strong>End Date:</strong> {drugOrder.endDate}
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No drug orders available.</p>
                )}
            </div>
            {printParams && encounterDrugOrderMap.length > 0 && (
                <div>
                    <h3>Encounter Drug Orders</h3>
                    {encounterDrugOrderMap.map((encounter) => (
                        <div key={encounter.encounterUuid}>
                            <h4>Encounter UUID: {encounter.encounterUuid}</h4>
                            <ul>
                                {encounter.drugOrders.map((drugOrder) => (
                                    <li key={drugOrder.uuid}>
                                        <div>
                                            <strong>Drug Name:</strong> {drugOrder.drug.name}
                                        </div>
                                        <div>
                                            <strong>Dosage:</strong> {drugOrder.dosageInstruction}
                                        </div>
                                        <div>
                                            <strong>Start Date:</strong> {drugOrder.startDate}
                                        </div>
                                        <div>
                                            <strong>End Date:</strong> {drugOrder.endDate}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            )}
    );
};

const getTreatmentConfig = async () => {
    // SECOND AGENT: [MISSING CONTEXT] - <fetch treatment configuration logic>
};

const getPrescribedAndActiveDrugOrders = async (patientUuid: string, someParam1: number, someParam2: boolean, visitUuids: string[], param4: string, param5: string, param6: string) => {
    // SECOND AGENT: [MISSING CONTEXT] - <fetch prescribed and active drug orders logic>
};

export default Prescription;
