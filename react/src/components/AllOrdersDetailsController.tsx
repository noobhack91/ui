import React from 'react';

interface AllOrdersDetailsControllerProps {
    patient: any;
    section: any;
}

const AllOrdersDetailsController: React.FC<AllOrdersDetailsControllerProps> = ({ patient, section }) => {
    const title = section.title;
    const config = section ? section.expandedViewConfig : {};

    return (
        <div>
            <h1>{title}</h1>

            <div>
                {patient.orders && patient.orders.length > 0 ? (
                    <ul>
                        {patient.orders.map((order: any, index: number) => (
                            <li key={index}>
                                <div>
                                    <strong>Order ID:</strong> {order.id}
                                </div>
                                <div>
                                    <strong>Order Date:</strong> {order.date}
                                </div>
                                <div>
                                    <strong>Order Details:</strong> {order.details}
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No orders available for this patient.</p>
                )}
            </div>
    );
};

export default AllOrdersDetailsController;
