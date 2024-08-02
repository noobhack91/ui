import React, { useState, useEffect } from 'react';
import { addressHierarchyService } from '../services/addressHierarchyService';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';

interface AddressLevel {
    addressField: string;
    isStrictEntry?: boolean;
}

interface TopDownAddressFieldsDirectiveControllerProps {
    address: Record<string, any>;
    addressLevels: AddressLevel[];
    fieldValidation: any;
    strictAutocompleteFromLevel: string;
}

const TopDownAddressFieldsDirectiveController: React.FC<TopDownAddressFieldsDirectiveControllerProps> = ({
    address,
    addressLevels,
    fieldValidation,
    strictAutocompleteFromLevel
}) => {
    const [addressFieldInvalid, setAddressFieldInvalid] = useState(false);
    const [selectedAddressUuids, setSelectedAddressUuids] = useState<Record<string, string>>({});
    const [selectedUserGeneratedIds, setSelectedUserGeneratedIds] = useState<Record<string, string>>({});
    const [selectedValue, setSelectedValue] = useState<Record<string, string | null>>({});
    const { t } = useTranslation();

    const addressLevelsCloneInDescendingOrder = [...addressLevels].reverse();
    const addressLevelUIOrderBasedOnConfig = addressLevels;
    const addressLevelsChunks = _.chunk(addressLevelUIOrderBasedOnConfig, 2);
    const addressLevelsNamesInDescendingOrder = addressLevelsCloneInDescendingOrder.map(level => level.addressField);

    const populateSelectedAddressUuids = (levelIndex: number, parentUuid?: string) => {
        if (addressLevels.length === 0 || !addressLevels[levelIndex]) {
            return;
        }

        const fieldName = addressLevels[levelIndex].addressField;
        const addressValue = address[fieldName];
        if (addressValue) {
            addressHierarchyService.search(fieldName, addressValue, parentUuid).then(response => {
                const address = response?.data?.[0];
                if (address) {
                    setSelectedAddressUuids(prev => ({ ...prev, [fieldName]: address.uuid }));
                    setSelectedUserGeneratedIds(prev => ({ ...prev, [fieldName]: address.userGeneratedId }));
                    populateSelectedAddressUuids(levelIndex + 1, address.uuid);
                }
            });
        }
    };

    const getTranslatedTopAddress = (address: any) => {
        // SECOND AGENT: [MISSING CONTEXT] - Translation utility function needs to be implemented
        return address;
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
        const found = _.find(addressLevels, { addressField: fieldName });
        const index = _.findIndex(addressLevels, found);
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
        // SECOND AGENT: [MISSING CONTEXT] - Implement logic to check if parent value is invalid
        return false;
    };

    const parentUuid = (field: string) => {
        return selectedAddressUuids[findParentField(field)];
    };

    const getAddressEntryList = (field: string) => (searchAttrs: any) => {
        return addressHierarchyService.search(field, searchAttrs.term, parentUuid(field));
    };

    const getAddressDataResults = addressHierarchyService.getAddressDataResults;

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

        if (_.isEmpty(address[fieldName])) {
            address[fieldName] = null;
            setSelectedUserGeneratedIds(prev => ({ ...prev, [fieldName]: null }));
        }
    };

    const removeAutoCompleteEntry = (fieldName: string) => () => {
        setSelectedValue(prev => ({ ...prev, [fieldName]: null }));
    };

    useEffect(() => {
        const init = () => {
            addressLevels.reverse();
            let isStrictEntry = false;
            addressLevels.forEach(addressLevel => {
                addressLevel.isStrictEntry = strictAutocompleteFromLevel === addressLevel.addressField || isStrictEntry;
                isStrictEntry = addressLevel.isStrictEntry;
            });
            addressLevels.reverse();

            // wait for address to be resolved in edit patient scenario
            const deregisterAddressWatch = () => {
                if (address !== undefined) {
                    populateSelectedAddressUuids(0);
                    setSelectedValue(_.mapValues(address, (value, key) => {
                        const addressLevel = _.find(addressLevels, { addressField: key });
                        return addressLevel && addressLevel.isStrictEntry ? value : null;
                    }));
                }
            };
            deregisterAddressWatch();
        };
        init();
    }, [address, addressLevels, strictAutocompleteFromLevel]);

    return (
        <div>

            {addressLevelsChunks.map((chunk, chunkIndex) => (
                <div key={chunkIndex} className="address-level-chunk">
                    {chunk.map((addressLevel, index) => (
                        <div key={index} className="address-level">
                            <label htmlFor={addressLevel.addressField}>
                                {getTranslatedTopAddress(addressLevel.addressField)}
                            </label>
                            <input
                                type="text"
                                id={addressLevel.addressField}
                                value={selectedValue[addressLevel.addressField] || ''}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    address[addressLevel.addressField] = value;
                                    setSelectedValue(prev => ({ ...prev, [addressLevel.addressField]: value }));
                                    if (value) {
                                        populateSelectedAddressUuids(index, parentUuid(addressLevel.addressField));
                                    } else {
                                        clearFields(addressLevel.addressField);
                                    }
                                }}
                                readOnly={isReadOnly(addressLevel)}
                                className={isParentValueInvalid(addressLevel.addressField) ? 'illegalValue' : ''}
                            />
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
};

export default TopDownAddressFieldsDirectiveController;
