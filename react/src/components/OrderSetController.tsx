import React, { useState, useEffect } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import useMessagingService from '../services/messagingService';
import adminOrderSetService from '../services/adminOrderSetService';
import orderTypeService from '../services/orderTypeService';
import { Spinner } from 'react-bootstrap';
import _ from 'lodash';

const OrderSetController: React.FC = () => {
    const [orderSet, setOrderSet] = useState<any>({ orderSetMembers: [] });
    const [orderTypes, setOrderTypes] = useState<any[]>([]);
    const [treatmentConfig, setTreatmentConfig] = useState<any>(null);
    const [operators] = useState(['ALL', 'ANY', 'ONE']);
    const [conceptNameInvalid, setConceptNameInvalid] = useState(false);
    const { showMessage } = useMessagingService();
    const history = useHistory();
    const { orderSetUuid } = useParams<{ orderSetUuid: string }>();

    useEffect(() => {
        const init = async () => {
            try {
                const [loadedOrderTypes, loadedTreatmentConfig] = await Promise.all([
                    orderTypeService.loadAll(),
                    adminOrderSetService.getDrugConfig()
                ]);
                setOrderTypes(loadedOrderTypes);
                setTreatmentConfig(loadedTreatmentConfig);

                if (orderSetUuid !== "new") {
                    const response = await adminOrderSetService.getOrderSet(orderSetUuid);
                    setOrderSet(response.data);
                } else {
                    setOrderSet({
                        operator: operators[0],
                        orderSetMembers: [
                            buildOrderSetMember(),
                            buildOrderSetMember()
                        ]
                    });
                }
            } catch (error) {
                console.error("Error initializing OrderSetController", error);
            }
        };
        init();
    }, [orderSetUuid, operators]);

    const addOrderSetMembers = () => {
        setOrderSet((prevOrderSet: any) => ({
            ...prevOrderSet,
            orderSetMembers: [...prevOrderSet.orderSetMembers, buildOrderSetMember()]
        }));
    };

    const remove = (orderSetMember: any) => {
        setOrderSet((prevOrderSet: any) => {
            const updatedMembers = prevOrderSet.orderSetMembers.map((member: any) => {
                if (member === orderSetMember) {
                    return { ...member, retired: !member.retired };
                }
                return member;
            });
            return { ...prevOrderSet, orderSetMembers: updatedMembers };
        });
    };

    const moveUp = (orderSetMember: any) => {
        setOrderSet((prevOrderSet: any) => {
            const index = _.indexOf(prevOrderSet.orderSetMembers, orderSetMember);
            if (index > 0) {
                const updatedMembers = [...prevOrderSet.orderSetMembers];
                [updatedMembers[index - 1], updatedMembers[index]] = [updatedMembers[index], updatedMembers[index - 1]];
                return { ...prevOrderSet, orderSetMembers: updatedMembers };
            }
            return prevOrderSet;
        });
    };

    const moveDown = (orderSetMember: any) => {
        setOrderSet((prevOrderSet: any) => {
            const index = _.indexOf(prevOrderSet.orderSetMembers, orderSetMember);
            if (index < prevOrderSet.orderSetMembers.length - 1) {
                const updatedMembers = [...prevOrderSet.orderSetMembers];
                [updatedMembers[index + 1], updatedMembers[index]] = [updatedMembers[index], updatedMembers[index + 1]];
                return { ...prevOrderSet, orderSetMembers: updatedMembers };
            }
            return prevOrderSet;
        });
    };

    const getConcepts = async (request: any, isOrderTypeMatching: (concept: any) => boolean) => {
        try {
            const response = await fetch(`${Bahmni.Common.Constants.conceptUrl}?q=${request.term}&v=custom:(uuid,name:(uuid,name),conceptClass:(uuid,name,display))`);
            const data = await response.json();
            const results = _.get(data, 'results', []);
            const resultsMatched = _.filter(results, isOrderTypeMatching);
            return _.map(resultsMatched, mapResponse);
        } catch (error) {
            console.error("Error fetching concepts", error);
            return [];
        }
    };

    const getConceptsForOrderSetMember = (orderSetMember: any) => {
        const selectedOrderType = orderSetMember.orderType;
        const orderType = _.find(orderTypes, { uuid: selectedOrderType.uuid });
        const orderTypeNames = _.map(orderType.conceptClasses, 'name');
        const isOrderTypeMatching = (concept: any) => _.includes(orderTypeNames, concept.conceptClass.name);
        return (request: any) => getConcepts(request, isOrderTypeMatching);
    };

    const onSelect = (oldOrderSetMember: any) => {

        setOrderSet((prevOrderSet: any) => {
            const updatedMembers = prevOrderSet.orderSetMembers.map((member: any) => {
                if (member.concept && member.concept.display === oldOrderSetMember.value && !member.concept.uuid) {

        if (newOrderSetMember) {
            updateOrderSetMemberConcept(newOrderSetMember, oldOrderSetMember);
            newOrderSetMember = null;
            return;
        }
        setOrderSet((prevOrderSet: any) => {
            const updatedMembers = prevOrderSet.orderSetMembers.map((member: any) => {
                if (member === oldOrderSetMember) {
                    return { ...member, orderTemplate: {}, concept: { ...member.concept, uuid: undefined } };
                }
                return member;
            });
            return { ...prevOrderSet, orderSetMembers: updatedMembers };
        });
    };
                }
                return member;
            });
            return { ...prevOrderSet, orderSetMembers: updatedMembers };
        });
    };

    const onChange = (oldOrderSetMember: any) => {

        if (newOrderSetMember) {
            updateOrderSetMemberConcept(newOrderSetMember, oldOrderSetMember);
            newOrderSetMember = null;
            return;
        }
        setOrderSet((prevOrderSet: any) => {
            const updatedMembers = prevOrderSet.orderSetMembers.map((member: any) => {
                if (member === oldOrderSetMember) {
                    return { ...member, orderTemplate: {}, concept: { ...member.concept, uuid: undefined } };
                }
                return member;
            });
            return { ...prevOrderSet, orderSetMembers: updatedMembers };
        });
    };

    const clearConceptName = (orderSetMember: any) => {
        setOrderSet((prevOrderSet: any) => {
            const updatedMembers = prevOrderSet.orderSetMembers.map((member: any) => {
                if (member === orderSetMember) {
                    return { ...member, concept: {}, orderTemplate: {} };
                }
                return member;
            });
            return { ...prevOrderSet, orderSetMembers: updatedMembers };
        });
    };

    const save = async () => {
        if (validationSuccess()) {
            getValidOrderSetMembers();
            try {
                const response = await adminOrderSetService.createOrUpdateOrderSet(orderSet);
                history.push(`/orderSet/${response.data.uuid}`);
                showMessage('info', 'Saved');
            } catch (error) {
                console.error("Error saving order set", error);
            }
        }
    };

    const getValidOrderSetMembers = () => {
        setOrderSet((prevOrderSet: any) => ({
            ...prevOrderSet,
            orderSetMembers: _.filter(prevOrderSet.orderSetMembers, 'concept')
        }));
    };

    const validationSuccess = () => {
        if (!validateForm()) {
            return false;
        }

        if (!orderSet.orderSetMembers || !isOrderSetHavingMinimumOrders()) {
            showMessage('error', 'An orderSet should have a minimum of two orderSetMembers');
            return false;
        }

        return true;
    };

    const buildOrderSetMember = () => {
        return {
            orderType: { uuid: orderTypes[0].uuid }
        };
    };

    const validateForm = () => {

            <h1>Order Set Management</h1>
    
                <button onClick={addOrderSetMembers}>Add Order Set Member</button>
                <button onClick={save}>Save Order Set</button>
            </div>
    
                {orderSet.orderSetMembers.map((member: any, index: number) => (
                    <div key={index}>
                        <input
                            type="text"
                            value={member.concept?.name || ''}
                            onChange={(e) => onChange({ ...member, concept: { ...member.concept, name: e.target.value } })}
                            placeholder="Concept Name"
                            required
                        />
                        <button onClick={() => remove(member)}>Remove</button>
                        <button onClick={() => moveUp(member)}>Move Up</button>
                        <button onClick={() => moveDown(member)}>Move Down</button>
                        <button onClick={() => clearConceptName(member)}>Clear Concept Name</button>
                    </div>
                ))}
            </div>
        </div>
        for (let i = 0; i < requiredFields.length; i++) {
            const field = requiredFields[i] as HTMLInputElement;
            if (!field.disabled && !field.value) {
                showMessage('error', 'Please fill all mandatory fields');
                return false;
            }
        }
        return true;
    };

            <h1>Order Set Management</h1>
            <button onClick={addOrderSetMembers}>Add Order Set Member</button>
            <button onClick={save}>Save Order Set</button>
            {orderSet.orderSetMembers.map((member: any, index: number) => (
                <div key={index}>
                    <input
                        type="text"
                        value={member.concept?.name || ''}
                        onChange={(e) => onChange({ ...member, concept: { ...member.concept, name: e.target.value } })}
                        placeholder="Concept Name"
                        required
                    />
                    <button onClick={() => remove(member)}>Remove</button>
                    <button onClick={() => moveUp(member)}>Move Up</button>
                    <button onClick={() => moveDown(member)}>Move Down</button>
                    <button onClick={() => clearConceptName(member)}>Clear Concept Name</button>
                </div>
            ))}
        </div>
    const isOrderSetHavingMinimumOrders = () => {
        return _.filter(orderSet.orderSetMembers, (setMember: any) => !setMember.retired).length >= 2;
    };

    const mapResponse = (concept: any) => {
        return {
            concept: { uuid: concept.uuid, name: concept.name.name },
            value: concept.name.name
        };
    };

    return (
        <div>

            <h1>Order Set Management</h1>
            <button onClick={addOrderSetMembers}>Add Order Set Member</button>
            <button onClick={save}>Save Order Set</button>
            {orderSet.orderSetMembers.map((member: any, index: number) => (
                <div key={index}>
                    <input
                        type="text"
                        value={member.concept?.name || ''}
                        onChange={(e) => onChange({ ...member, concept: { ...member.concept, name: e.target.value } })}
                        placeholder="Concept Name"
                        required
                    />
                    <button onClick={() => remove(member)}>Remove</button>
                    <button onClick={() => moveUp(member)}>Move Up</button>
                    <button onClick={() => moveDown(member)}>Move Down</button>
                    <button onClick={() => clearConceptName(member)}>Clear Concept Name</button>
                </div>
            ))}
        </div>
    );
};

export default OrderSetController;
