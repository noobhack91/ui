import React, { useState, useEffect } from 'react';
import { DrugService } from '../services/drugService';
import _ from 'lodash';

interface Drug {
    name: string;
    uuid: string;
    dosageForm: { display: string };
    drugReferenceMaps?: any[];
}

interface OrderTemplate {
    drug: Drug;
    dosingInstructions?: { dosingRule: any };
}

interface OrderSetMember {
    concept: { uuid: string };
    orderTemplate: OrderTemplate;
}

interface OrderTemplateControllerProps {
    orderSetMember: OrderSetMember;
}

const mapResult = (drug: Drug) => ({
    drug: {
        name: drug.name,
        uuid: drug.uuid,
        form: drug.dosageForm.display,
        drugReferenceMaps: drug.drugReferenceMaps || []
    },
    value: drug.name
});

const selectDrug = (selectedTemplate: any, orderSetMember: OrderSetMember) => {
    orderSetMember.orderTemplate.drug = selectedTemplate.drug;
};

const deleteDrugIfDrugNameIsEmpty = (orderSetMember: OrderSetMember) => {
    if (!orderSetMember.orderTemplate.drug.name) {
        orderSetMember.orderTemplate.drug = {} as Drug;
    }
};

const OrderTemplateController: React.FC<OrderTemplateControllerProps> = ({ orderSetMember }) => {
    const [drugs, setDrugs] = useState<any[]>([]);

    const search = async (request: { term: string }, orderSetMember: OrderSetMember) => {
        const results = await DrugService.search(request.term, orderSetMember.concept.uuid);
        return _.map(results, mapResult);
    };

    const getDrugsOf = (orderSetMember: OrderSetMember) => {
        return (request: { term: string }) => search(request, orderSetMember);
    };

    const onSelectOfDrug = (orderSetMember: OrderSetMember) => {
        return (selectedTemplate: any) => selectDrug(selectedTemplate, orderSetMember);
    };

    const isRuleMode = (orderSetMember: OrderSetMember) => {
        return typeof orderSetMember.orderTemplate.dosingInstructions !== 'undefined' &&
            orderSetMember.orderTemplate.dosingInstructions.dosingRule != null;
    };

    useEffect(() => {

        const fetchDrugs = async () => {
            try {
                const results = await search({ term: '' }, orderSetMember);
                setDrugs(results);

            <input
                type="text"
                placeholder="Search for a drug"
                onChange={(e) => {
                    const request = { term: e.target.value };
                    getDrugsOf(orderSetMember)(request).then(setDrugs);
                }}
            />
            <ul>
                {drugs.map((drug, index) => (
                    <li key={index} onClick={() => onSelectOfDrug(orderSetMember)(drug)}>
                        {drug.value}
                    </li>
                ))}
            </ul>
            {isRuleMode(orderSetMember) && (
        
                    {/* Render additional UI elements for rule mode if necessary */}
                </div>
            )}
        </div>
                console.error('Error fetching drugs:', error);
            }
        };

        fetchDrugs();
    }, [orderSetMember]);

    return (
        <div>

            <input
                type="text"
                placeholder="Search for a drug"
                onChange={(e) => {
                    const request = { term: e.target.value };
                    getDrugsOf(orderSetMember)(request).then(setDrugs);
                }}
            />
            <ul>
                {drugs.map((drug, index) => (
                    <li key={index} onClick={() => onSelectOfDrug(orderSetMember)(drug)}>
                        {drug.value}
                    </li>
                ))}
            </ul>
            {isRuleMode(orderSetMember) && (
        
                    {/* Render additional UI elements for rule mode if necessary */}
                </div>
            )}
        </div>
    );
};

export default OrderTemplateController;
