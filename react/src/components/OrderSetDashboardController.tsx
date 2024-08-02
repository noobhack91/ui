import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Spinner } from 'react-bootstrap';
import adminOrderSetService from '../services/adminOrderSetService';

const OrderSetDashboardController: React.FC = () => {
    const [orderSets, setOrderSets] = useState([]);
    const history = useHistory();

    const createOrEditOrderSet = (uuid?: string) => {
        if (!uuid) {
            uuid = "new";
        }
        const url = `/orderset/${uuid}`;
        history.push(url);
    };

    const removeOrderSet = async (orderSet: any) => {
        const orderSetObj = { ...orderSet, retired: true };
        try {
            await adminOrderSetService.removeOrderSet(orderSetObj);
            init();
        } catch (error) {
            console.error('Error removing order set:', error);
        }
    };

    const init = async () => {
        try {
            const response = await adminOrderSetService.getAllOrderSets();
            setOrderSets(response.data.results);
        } catch (error) {
            console.error('Error fetching order sets:', error);
        }
    };

    useEffect(() => {
        init();
    }, []);

    return (
        <div>
            <h1>Order Set Dashboard</h1>
            <button onClick={() => createOrEditOrderSet()}>Create New Order Set</button>
            <ul>
                {orderSets.map((orderSet: any) => (
                    <li key={orderSet.uuid}>
                        {orderSet.name}
                        <button onClick={() => createOrEditOrderSet(orderSet.uuid)}>Edit</button>
                        <button onClick={() => removeOrderSet(orderSet)}>Remove</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default OrderSetDashboardController;
