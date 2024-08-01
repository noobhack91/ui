import React, { useEffect, useState } from 'react';
import PacsService from '../services/pacsService';
import OrderTypeService from '../services/orderTypeService';
import useMessagingService from '../services/messagingService';

interface PacsOrdersProps {
    patient: { uuid: string, identifier: string };
    section: { pacsStudyUrl?: string };
    orderType: string;
    orderUuid?: string;
    config: {
        conceptNames: string[];
        numberOfVisits: number;
        obsIgnoreList: string[];
        pacsImageUrl?: string;
    };
    visitUuid?: string;
}

const PacsOrders: React.FC<PacsOrdersProps> = ({ patient, section, orderType, orderUuid, config, visitUuid }) => {
    const [bahmniOrders, setBahmniOrders] = useState<any[]>([]);
    const [noOrdersMessage, setNoOrdersMessage] = useState<string | null>(null);
    const messagingService = useMessagingService();
    const orderTypeUuid = OrderTypeService.getOrderTypeUuid(orderType);
    const radiologyImageUrl = section.pacsStudyUrl || "/oviyam2/viewer.html?patientID={{patientID}}&studyUID={{studyUID}}";

    const getOrders = async () => {
        const params = {
            patientUuid: patient.uuid,
            orderTypeUuid: orderTypeUuid,
            conceptNames: config.conceptNames,
            includeObs: true,
            numberOfVisits: config.numberOfVisits,
            obsIgnoreList: config.obsIgnoreList,
            visitUuid: visitUuid,
            orderUuid: orderUuid
        };

        const response = await orderService.getOrders(params);
        return response;
    };

    const queryPacsStudies = async () => {
        return PacsService.search(patient.identifier);
    };

    const correlateWithStudies = (radiologyOrders: any[], radiologyStudies: any[]) => {
        if (radiologyOrders) {
            radiologyOrders.forEach(ro => {
                ro.pacsImageUrl = (config.pacsImageUrl || "").replace('{{patientID}}', patient.identifier).replace('{{orderNumber}}', ro.orderNumber);
                if (radiologyStudies) {
                    const matchingStudy = radiologyStudies.find(rs => {
                        if (!rs.identifier) {
                            return false;
                        }
                        const matches = rs.identifier.filter(rsi => PacsService.getAccessionNumber(rsi) === ro.orderNumber);
                        return (matches && matches.length > 0);
                    });

                    if (matchingStudy) {
                        ro.studyInstanceUID = matchingStudy.id;
                        ro.pacsStudyUrl = radiologyImageUrl
                            .replace('{{patientID}}', patient.identifier)
                            .replace('{{studyUID}}', matchingStudy.id)
                            .replace('{{accessionNumber}}', ro.orderNumber);
                    }
                }
            });
            setBahmniOrders(radiologyOrders || []);
        } else {

                const event = new CustomEvent("no-data-present-event");
                window.dispatchEvent(event);

                setNoOrdersMessage(orderType);
            }
        }
    };

    const init = async () => {
        try {
            const radiologyOrders = await getOrders();
            try {
                const response = await queryPacsStudies();
                correlateWithStudies(radiologyOrders.data, response.data);
            } catch (errorResponse) {
                console.error("Error occurred while trying to fetch radiology studies", errorResponse);
                if (errorResponse.status !== 501) {
                    messagingService.showMessage('error', "RADIOLOGY_STUDY_FETCH_ERROR");
                }
                correlateWithStudies(radiologyOrders.data, []);
            }
        } catch (error) {
            console.error("Error occurred while trying to fetch orders", error);
        }
    };

    useEffect(() => {
        init();
    }, []);

    const getUrl = (orderNumber: string) => {
        const pacsImageTemplate = config.pacsImageUrl || "";
        return pacsImageTemplate
            .replace('{{patientID}}', patient.identifier)
            .replace('{{orderNumber}}', orderNumber);
    };

    const getLabel = (bahmniOrder: any) => {
        return bahmniOrder.concept.shortName || bahmniOrder.concept.name;
    };

    const openImage = (bahmniOrder: any) => {
        if (!bahmniOrder.pacsStudyUrl) {
            messagingService.showMessage('info', "NO_PACS_STUDY_FOR_ORDER");
        }
        const url = bahmniOrder.pacsStudyUrl || bahmniOrder.pacsImageUrl;
        window.open(url, "_blank");
    };

            {bahmniOrders.length > 0 ? (
                <ul>
                    {bahmniOrders.map((order, index) => (
                        <li key={index}>
                    
                                <span>{getLabel(order)}</span>
                                <button onClick={() => openImage(order)}>View Image</button>
                            </div>
                        </li>
                    ))}
                </ul>
            ) : (
        
                    {noOrdersMessage ? (
                        <p>{noOrdersMessage}</p>
                    ) : (
                        <p>No orders available</p>
                    )}
                </div>
            )}
        </div>
    return (

            {bahmniOrders.length > 0 ? (
                <ul>
                    {bahmniOrders.map((order, index) => (
                        <li key={index}>
                            <span>{getLabel(order)}</span>
                            <button onClick={() => openImage(order)}>View Image</button>
                        </li>
                    ))}
                </ul>
            ) : (
        
                    {noOrdersMessage ? (
                        <p>{noOrdersMessage}</p>
                    ) : (
                        <p>No orders available</p>
                    )}
                </div>
            )}
        </div>

    );
};

export default PacsOrders;
        </div>
    );
};

export default PacsOrders;
