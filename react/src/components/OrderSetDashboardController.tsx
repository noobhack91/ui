import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import Spinner from 'react-bootstrap/Spinner';
import AdminOrderSetService from '../services/adminOrderSetService';
import AppService from '../services/appService';

const OrderSetDashboardController: React.FC = () => {
    const [orderSets, setOrderSets] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const history = useHistory();
    const appExtensions = AppService.getAppDescriptor().getExtensions("bahmni.admin.orderSet", "link") || [];

    const createOrEditOrderSet = (uuid?: string) => {
        if (!uuid) {
            uuid = "new";
        }
        const url = `/orderset/${uuid}`;
        history.push(url);
    };

    const removeOrderSet = async (orderSet: any) => {
        const orderSetObj = { ...orderSet, retired: true };
        setLoading(true);
        try {
            await AdminOrderSetService.removeOrderSet(orderSetObj);
            init();
        } catch (error) {
            console.error("Error removing order set:", error);
        } finally {
            setLoading(false);
        }
    };

    const init = async () => {
        setLoading(true);
        try {
            const response = await AdminOrderSetService.getAllOrderSets();
            setOrderSets(response.data.results);
        } catch (error) {
            console.error("Error fetching order sets:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        init();
    }, []);

    return (
        <div>
            {loading ? (
                <Spinner animation="border" />
            ) : (
                <div>
                    <h1>Order Sets</h1>
                    <button onClick={() => createOrEditOrderSet()}>Create New Order Set</button>
                    <ul>
                        {orderSets.map(orderSet => (
                            <li key={orderSet.uuid}>
                                {orderSet.name}
                                <button onClick={() => createOrEditOrderSet(orderSet.uuid)}>Edit</button>
                                <button onClick={() => removeOrderSet(orderSet)}>Remove</button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default OrderSetDashboardController;
