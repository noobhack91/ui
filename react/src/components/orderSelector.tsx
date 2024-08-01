import React, { useState } from 'react';
import _ from 'lodash';

interface OrderSelectorProps {
    tab: {
        leftCategory: {
            setMembers: any[];
        };
    };
    group: {
        name: string;
    };
    search: {
        string: string;
    };
}

const OrderSelector: React.FC<OrderSelectorProps> = ({ tab, group, search }) => {
    const [searchString, setSearchString] = useState(search.string);

    const hasTests = () => {
        const rootConcept = tab.leftCategory;
        return rootConcept && !_.isEmpty(rootConcept.setMembers);
    };

    const filterByConceptClass = (test: any) => {
        return test.conceptClass.name === group.name;
    };

    const filterBySearchString = (test: any) => {
        const filterBySearchStringInner = (testName: any) => {
            return _.includes(_.toLower(testName.name), _.toLower(searchString));
        };
        return _.some(test.names, filterBySearchStringInner);
    };

    return (
        <div>

            {hasTests() ? (
                <ul>
                    {tab.leftCategory.setMembers
                        .filter(filterByConceptClass)
                        .filter(filterBySearchString)
                        .map((test, index) => (
                            <li key={index}>{test.name}</li>
                        ))}
                </ul>
            ) : (
                <p>No tests available</p>
            )}
        </div>
    );
};

export default OrderSelector;
