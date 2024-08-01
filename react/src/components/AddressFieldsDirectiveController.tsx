import React, { useState, useEffect } from 'react';
import { addressHierarchyService } from '../services/addressHierarchyService';
import { Bahmni } from '../utils/constants/Bahmni';

interface AddressField {
    name: string;
    parent?: AddressField;
}

interface AddressFieldsDirectiveControllerProps {
    address: any;
    addressLevels: any[];
    fieldValidation: any;
    strictAutocompleteFromLevel: string;
}

const AddressFieldsDirectiveController: React.FC<AddressFieldsDirectiveControllerProps> = ({
    address,
    addressLevels,
    fieldValidation,
    strictAutocompleteFromLevel
}) => {
    const [addressLevelsChunks, setAddressLevelsChunks] = useState<any[][]>([]);
    const [selectedValue, setSelectedValue] = useState<any>({});
    const [addressState, setAddressState] = useState<any>(address);

    useEffect(() => {
        const addressLevelsCloneInDescendingOrder = [...addressLevels].reverse();
        setAddressLevelsChunks(chunkArray(addressLevelsCloneInDescendingOrder, 2));
        const addressLevelsNamesInDescendingOrder = addressLevelsCloneInDescendingOrder.map((addressLevel) => addressLevel.addressField);

        const init = () => {
            addressLevels.reverse();
            let isStrictEntry = false;
            addressLevels.forEach((addressLevel) => {
                addressLevel.isStrictEntry = strictAutocompleteFromLevel === addressLevel.addressField || isStrictEntry;
                isStrictEntry = addressLevel.isStrictEntry;
            });
            addressLevels.reverse();

            // wait for address to be resolved in edit patient scenario
            if (address) {
                const initialSelectedValue = Object.keys(address).reduce((acc, key) => {
                    const addressLevel = addressLevels.find((level) => level.addressField === key);
                    acc[key] = addressLevel && addressLevel.isStrictEntry ? address[key] : null;
                    return acc;
                }, {});
                setSelectedValue(initialSelectedValue);
            }
        };

        init();
    }, [address, addressLevels, strictAutocompleteFromLevel]);

    const chunkArray = (array: any[], chunkSize: number): any[][] => {
        const results = [];
        while (array.length) {
            results.push(array.splice(0, chunkSize));
        }
        return results;
    };

    const addressFieldSelected = (fieldName: string) => (addressFieldItem: any) => {
        const addressLevelsNamesInDescendingOrder = addressLevels.map((addressLevel) => addressLevel.addressField).reverse();
        const parentFields = addressLevelsNamesInDescendingOrder.slice(addressLevelsNamesInDescendingOrder.indexOf(fieldName) + 1);
        setSelectedValue((prevSelectedValue: any) => ({
            ...prevSelectedValue,
            [fieldName]: addressFieldItem.addressField.name
        }));
        let parent = addressFieldItem.addressField.parent;
        parentFields.forEach((parentField) => {
            if (!parent) {
                return;
            }
            setAddressState((prevAddress: any) => ({
                ...prevAddress,
                [parentField]: parent.name
            }));
            setSelectedValue((prevSelectedValue: any) => ({
                ...prevSelectedValue,
                [parentField]: parent.name
            }));
            parent = parent.parent;
        });
    };

    const getTranslatedAddressFields = (address: any) => {
        // SECOND AGENT: [MISSING CONTEXT] - Translation logic needs to be implemented here
    };

    const removeAutoCompleteEntry = (fieldName: string) => () => {
        setSelectedValue((prevSelectedValue: any) => ({
            ...prevSelectedValue,
            [fieldName]: null
        }));
    };

    const getAddressEntryList = (field: string) => (searchAttrs: any) => {
        return addressHierarchyService.search(field, searchAttrs.term);
    };

    const clearFields = (fieldName: string) => {
        const addressLevelsNamesInDescendingOrder = addressLevels.map((addressLevel) => addressLevel.addressField).reverse();
        const childFields = addressLevelsNamesInDescendingOrder.slice(0, addressLevelsNamesInDescendingOrder.indexOf(fieldName));
        childFields.forEach((childField) => {
            if (selectedValue[childField]) {
                setAddressState((prevAddress: any) => ({
                    ...prevAddress,
                    [childField]: null
                }));
                setSelectedValue((prevSelectedValue: any) => ({
                    ...prevSelectedValue,
                    [childField]: null
                }));
            }
        });
    };

    return (
        <div>
            {/* SECOND AGENT: [MISSING CONTEXT] - Render logic for address fields needs to be implemented here */}
        </div>
    );
};

export default AddressFieldsDirectiveController;
