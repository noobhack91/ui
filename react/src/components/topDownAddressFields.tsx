import React, { useState, useEffect } from 'react';
import { addressHierarchyService } from '../services/addressHierarchyService';
import { Bahmni } from '../utils/constants/Bahmni';

interface AddressField {
    name: string;
    parent?: AddressField;
}

interface AddressLevel {
    addressField: string;
    isStrictEntry?: boolean;
}

interface TopDownAddressFieldsProps {
    address: Record<string, string>;
    addressLevels: AddressLevel[];
    fieldValidation: any;
    strictAutocompleteFromLevel: string;
}

const TopDownAddressFields: React.FC<TopDownAddressFieldsProps> = ({ address, addressLevels, fieldValidation, strictAutocompleteFromLevel }) => {
    const [selectedAddressUuids, setSelectedAddressUuids] = useState<Record<string, string>>({});
    const [selectedUserGeneratedIds, setSelectedUserGeneratedIds] = useState<Record<string, string>>({});
    const [selectedValue, setSelectedValue] = useState<Record<string, string>>({});
    const [addressLevelsChunks, setAddressLevelsChunks] = useState<AddressLevel[][]>([]);
    const [addressLevelsNamesInDescendingOrder, setAddressLevelsNamesInDescendingOrder] = useState<string[]>([]);

    useEffect(() => {
        const addressLevelsCloneInDescendingOrder = [...addressLevels].reverse();
        setAddressLevelsNamesInDescendingOrder(addressLevelsCloneInDescendingOrder.map(level => level.addressField));
        setAddressLevelsChunks(chunkArray(addressLevels, 2));
    }, [addressLevels]);

    useEffect(() => {
        const init = () => {
            const reversedAddressLevels = [...addressLevels].reverse();
            let isStrictEntry = false;
            reversedAddressLevels.forEach(level => {
                level.isStrictEntry = strictAutocompleteFromLevel === level.addressField || isStrictEntry;
                isStrictEntry = level.isStrictEntry;
            });
            addressLevels.reverse();

            const deregisterAddressWatch = () => {
                if (address) {
                    populateSelectedAddressUuids(0);
                    setSelectedValue(Object.fromEntries(Object.entries(address).map(([key, value]) => {
                        const addressLevel = addressLevels.find(level => level.addressField === key);
                        return [key, addressLevel && addressLevel.isStrictEntry ? value : null];
                    })));
                }
            };
            deregisterAddressWatch();
        };
        init();
    }, [address, addressLevels, strictAutocompleteFromLevel]);

    const chunkArray = (array: any[], size: number) => {
        const chunkedArr = [];
        for (let i = 0; i < array.length; i += size) {
            chunkedArr.push(array.slice(i, i + size));
        }
        return chunkedArr;
    };

    const populateSelectedAddressUuids = async (levelIndex: number, parentUuid?: string) => {
        if (addressLevels.length === 0 || !addressLevels[levelIndex]) {
            return;
        }

        const fieldName = addressLevels[levelIndex].addressField;
        const addressValue = address[fieldName];
        if (addressValue) {
            try {
                const response = await addressHierarchyService.search(fieldName, addressValue, parentUuid);
                const address = response && response.data && response.data[0];
                if (address) {
                    setSelectedAddressUuids(prev => ({ ...prev, [fieldName]: address.uuid }));
                    setSelectedUserGeneratedIds(prev => ({ ...prev, [fieldName]: address.userGeneratedId }));
                    populateSelectedAddressUuids(levelIndex + 1, address.uuid);
                }
            } catch (error) {
                console.error('Error fetching address hierarchy entries:', error);
            }
        }
    };

    const getTranslatedTopAddress = (address: any) => {
        // SECOND AGENT: [MISSING CONTEXT] - Translation logic needs to be implemented here
    };

    const addressFieldSelected = (fieldName: string) => (addressFieldItem: any) => {
        setSelectedAddressUuids(prev => ({ ...prev, [fieldName]: addressFieldItem.addressField.uuid }));
        setSelectedUserGeneratedIds(prev => ({ ...prev, [fieldName]: addressFieldItem.addressField.userGeneratedId }));
        setSelectedValue(prev => ({ ...prev, [fieldName]: addressFieldItem.addressField.name }));

        const parentFields = addressLevelsNamesInDescendingOrder.slice(addressLevelsNamesInDescendingOrder.indexOf(fieldName) + 1);
        let parent = addressFieldItem.addressField.parent;
        parentFields.forEach(parentField => {
            if (!parent) {
                return;
            }
            address[parentField] = parent.name;
            setSelectedValue(prev => ({ ...prev, [parentField]: parent.name }));
            parent = parent.parent;
        });
    };

    const findParentField = (fieldName: string) => {
        const found = addressLevels.find(level => level.addressField === fieldName);
        const index = addressLevels.indexOf(found!);
        let parentFieldName;
        const topLevel = 0;
        if (index !== topLevel) {
            const parent = addressLevels[index - 1];
            parentFieldName = parent.addressField;
        }
        return parentFieldName;
    };

    const isReadOnly = (addressLevel: AddressLevel) => {
        if (!address) {
            return false;
        }
        if (!addressLevel.isStrictEntry) {
            return false;
        }
        const fieldName = addressLevel.addressField;
        const parentFieldName = findParentField(fieldName);
        const parentValue = address[parentFieldName];
        const parentValueInvalid = isParentValueInvalid(parentFieldName);
        if (!parentFieldName) {
            return false;
        }
        if (parentFieldName && !parentValue) {
            return true;
        }
        return parentFieldName && parentValue && parentValueInvalid;
    };

    const isParentValueInvalid = (parentId: string) => {
        // SECOND AGENT: [MISSING CONTEXT] - Validation logic needs to be implemented here
    };

    const parentUuid = (field: string) => {
        return selectedAddressUuids[findParentField(field)];
    };

    const getAddressEntryList = (field: string) => async (searchAttrs: any) => {
        return await addressHierarchyService.search(field, searchAttrs.term, parentUuid(field));
    };

    const clearFields = (fieldName: string) => {
        const childFields = addressLevelsNamesInDescendingOrder.slice(0, addressLevelsNamesInDescendingOrder.indexOf(fieldName));
        childFields.forEach(childField => {
            if (selectedValue[childField] !== null) {
                address[childField] = null;
                setSelectedValue(prev => ({ ...prev, [childField]: null }));
                setSelectedAddressUuids(prev => ({ ...prev, [childField]: null }));
                setSelectedUserGeneratedIds(prev => ({ ...prev, [childField]: null }));
            }
        });

        if (!address[fieldName]) {
            address[fieldName] = null;
            setSelectedUserGeneratedIds(prev => ({ ...prev, [fieldName]: null }));
        }
    };

    const removeAutoCompleteEntry = (fieldName: string) => () => {
        setSelectedValue(prev => ({ ...prev, [fieldName]: null }));
    };

    return (
        <div>

            {addressLevels.map((addressLevel, index) => (
                <div key={index} className="address-field">
                    <label htmlFor={addressLevel.addressField}>{addressLevel.addressField}</label>
                    <input
                        type="text"
                        id={addressLevel.addressField}
                        value={selectedValue[addressLevel.addressField] || ''}
                        onChange={(e) => {
                            const newValue = e.target.value;
                            setSelectedValue(prev => ({ ...prev, [addressLevel.addressField]: newValue }));
                            if (newValue) {
                                addressFieldSelected(addressLevel.addressField)({ addressField: { name: newValue, uuid: '', parent: null } });
                            } else {
                                clearFields(addressLevel.addressField);
                            }
                        }}
                        readOnly={isReadOnly(addressLevel)}
                        className={isReadOnly(addressLevel) ? 'readonly' : ''}
                    />
                </div>
            ))}
        </div>
    );
};

export default TopDownAddressFields;
