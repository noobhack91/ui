import React, { useState, useEffect } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { Spinner } from 'react-bootstrap';
import axios from 'axios';
import _ from 'lodash';
import adminOrderSetService from '../services/adminOrderSetService';
import messagingService from '../services/messagingService';
import orderTypeService from '../services/orderTypeService';

const OrderSetController: React.FC = () => {
    const [orderSet, setOrderSet] = useState<any>({ orderSetMembers: [] });
    const [orderTypes, setOrderTypes] = useState<any[]>([]);
    const [operators] = useState(['ALL', 'ANY', 'ONE']);
    const [conceptNameInvalid, setConceptNameInvalid] = useState(false);
    const [treatmentConfig, setTreatmentConfig] = useState<any>({});
    const history = useHistory();
    const { orderSetUuid } = useParams<{ orderSetUuid: string }>();

    useEffect(() => {
        const init = async () => {
            try {
                const [orderTypesResponse, drugConfigResponse] = await Promise.all([
                    orderTypeService.loadAll(),
                    adminOrderSetService.getDrugConfig()
                ]);
                setOrderTypes(orderTypesResponse);
                setTreatmentConfig(drugConfigResponse);

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
                console.error(error);
            }
        };
        init();
    }, [orderSetUuid, operators]);

    const buildOrderSetMember = () => {
        return {
            orderType: { uuid: orderTypes[0]?.uuid }
        };
    };

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
            if (index === 0) return prevOrderSet;
            const updatedMembers = [...prevOrderSet.orderSetMembers];
            updatedMembers.splice(index, 1);
            updatedMembers.splice(index - 1, 0, orderSetMember);
            return { ...prevOrderSet, orderSetMembers: updatedMembers };
        });
    };

    const moveDown = (orderSetMember: any) => {
        setOrderSet((prevOrderSet: any) => {
            const index = _.indexOf(prevOrderSet.orderSetMembers, orderSetMember);
            if (index === prevOrderSet.orderSetMembers.length - 1) return prevOrderSet;
            const updatedMembers = [...prevOrderSet.orderSetMembers];
            updatedMembers.splice(index, 1);
            updatedMembers.splice(index + 1, 0, orderSetMember);
            return { ...prevOrderSet, orderSetMembers: updatedMembers };
        });
    };

    const getConcepts = async (request: any, isOrderTypeMatching: any) => {
        try {
            const response = await axios.get('/openmrs/ws/rest/v1/concept', {
                params: {
                    q: request.term,
                    v: "custom:(uuid,name:(uuid,name),conceptClass:(uuid,name,display))"
                }
            });
            const results = _.get(response, 'data.results');
            const resultsMatched = _.filter(results, isOrderTypeMatching);
            return _.map(resultsMatched, mapResponse);
        } catch (error) {
            console.error(error);
            return [];
        }
    };

    const mapResponse = (concept: any) => {
        return {
            concept: { uuid: concept.uuid, name: concept.name.name },
            value: concept.name.name
        };
    };

    const updateOrderSetMemberConcept = (newOrderSetMember: any, oldOrderSetMember: any) => {
        oldOrderSetMember.concept.display = newOrderSetMember.concept.display;
        oldOrderSetMember.concept.uuid = newOrderSetMember.concept.uuid;
    };

    const onSelect = (oldOrderSetMember: any) => {
        let newOrderSetMember = oldOrderSetMember;
        const currentOrderSetMember = _.find(orderSet.orderSetMembers, (orderSetMember: any) => {
            return orderSetMember.concept && (orderSetMember.concept.display === oldOrderSetMember.value && !orderSetMember.concept.uuid);
        });
        if (!_.isUndefined(currentOrderSetMember)) {
            currentOrderSetMember.concept.uuid = oldOrderSetMember.concept.uuid;
            newOrderSetMember = null;
        }
    };

    const onChange = (oldOrderSetMember: any) => {
        if (newOrderSetMember) {
            updateOrderSetMemberConcept(newOrderSetMember, oldOrderSetMember);
            newOrderSetMember = null;
            return;
        }
        oldOrderSetMember.orderTemplate = {};
        delete oldOrderSetMember.concept.uuid;
    };

    const clearConceptName = (orderSetMember: any) => {
        orderSetMember.concept = {};
        orderSetMember.orderTemplate = {};
    };

    const save = async () => {
        if (validationSuccess()) {
            getValidOrderSetMembers();
            try {
                const response = await adminOrderSetService.createOrUpdateOrderSet(orderSet);
                history.push(`/orderSet/${response.data.uuid}`);
                messagingService.showMessage('info', 'Saved');
            } catch (error) {
                console.error(error);
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
            messagingService.showMessage('error', 'An orderSet should have a minimum of two orderSetMembers');
            return false;
        }

        return true;
    };

    const validateForm = () => {
        const requiredFields = document.querySelectorAll("[required]");
        for (let i = 0; i < requiredFields.length; i++) {
            const field = requiredFields[i] as HTMLInputElement;
            if (!field.disabled && !field.value) {
                messagingService.showMessage('error', 'Please fill all mandatory fields');
                return false;
            }
        }
        return true;
    };

    const isOrderSetHavingMinimumOrders = () => {
        return _.filter(orderSet.orderSetMembers, (setMember: any) => !setMember.retired).length >= 2;
    };

    return (
        <div>

            <h1>Order Set Management</h1>
    
                <button onClick={addOrderSetMembers}>Add Order Set Member</button>
                <button onClick={save}>Save</button>
            </div>
    
                {orderSet.orderSetMembers.map((member: any, index: number) => (
                    <div key={index} className="order-set-member">
                
                            <label>Order Type:</label>
                            <select
                                value={member.orderType.uuid}
                                onChange={(e) => {
                                    const updatedOrderType = orderTypes.find(type => type.uuid === e.target.value);
                                    setOrderSet((prevOrderSet: any) => {
                                        const updatedMembers = [...prevOrderSet.orderSetMembers];
                                        updatedMembers[index].orderType = updatedOrderType;
                                        return { ...prevOrderSet, orderSetMembers: updatedMembers };
                                    });
                                }}
                            >
                                {orderTypes.map((type: any) => (
                                    <option key={type.uuid} value={type.uuid}>{type.name}</option>
                                ))}
                            </select>
                        </div>
                
                            <label>Concept:</label>
                            <input
                                type="text"
                                value={member.concept?.display || ''}
                                onChange={(e) => {
                                    const updatedConcept = { ...member.concept, display: e.target.value };
                                    setOrderSet((prevOrderSet: any) => {
                                        const updatedMembers = [...prevOrderSet.orderSetMembers];
                                        updatedMembers[index].concept = updatedConcept;
                                        return { ...prevOrderSet, orderSetMembers: updatedMembers };
                                    });
                                }}
                                onBlur={() => onChange(member)}
                            />
                        </div>
                
                            <button onClick={() => moveUp(member)}>Move Up</button>
                            <button onClick={() => moveDown(member)}>Move Down</button>
                            <button onClick={() => remove(member)}>{member.retired ? 'Unretire' : 'Retire'}</button>
                            <button onClick={() => clearConceptName(member)}>Clear Concept</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default OrderSetController;
