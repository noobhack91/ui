import React, { useState, useEffect } from 'react';
import { addressHierarchyService } from '../services/addressHierarchyService';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';

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
    const { t } = useTranslation();

    useEffect(() => {
        const addressLevelsCloneInDescendingOrder = [...addressLevels].reverse();
        setAddressLevelsChunks(chunkArray(addressLevelsCloneInDescendingOrder, 2));
        const addressLevelsNamesInDescendingOrder = addressLevelsCloneInDescendingOrder.map(level => level.addressField);

        const init = () => {
            addressLevels.reverse();
            let isStrictEntry = false;
            addressLevels.forEach(level => {
                level.isStrictEntry = strictAutocompleteFromLevel === level.addressField || isStrictEntry;
                isStrictEntry = level.isStrictEntry;
            });
            addressLevels.reverse();

            // wait for address to be resolved in edit patient scenario
            if (address !== undefined) {
                const initialSelectedValue = _.mapValues(address, (value, key) => {
                    const addressLevel = _.find(addressLevels, { addressField: key });
                    return addressLevel && addressLevel.isStrictEntry ? value : null;
                });
                setSelectedValue(initialSelectedValue);
            }
        };

        init();
    }, [address, addressLevels, strictAutocompleteFromLevel]);

    const addressFieldSelected = (fieldName: string) => (addressFieldItem: any) => {
        const addressLevelsNamesInDescendingOrder = [...addressLevels].reverse().map(level => level.addressField);
        const parentFields = addressLevelsNamesInDescendingOrder.slice(addressLevelsNamesInDescendingOrder.indexOf(fieldName) + 1);
        setSelectedValue((prevSelectedValue: any) => ({
            ...prevSelectedValue,
            [fieldName]: addressFieldItem.addressField.name
        }));
        let parent = addressFieldItem.addressField.parent;
        parentFields.forEach(parentField => {
            if (!parent) return;
            address[parentField] = parent.name;
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
        const addressLevelsNamesInDescendingOrder = [...addressLevels].reverse().map(level => level.addressField);
        const childFields = addressLevelsNamesInDescendingOrder.slice(0, addressLevelsNamesInDescendingOrder.indexOf(fieldName));
        childFields.forEach(childField => {
            if (!_.isEmpty(selectedValue[childField])) {
                address[childField] = null;
                setSelectedValue((prevSelectedValue: any) => ({
                    ...prevSelectedValue,
                    [childField]: null
                }));
            }
        });
    };

    return (
        <div>

            {addressLevelsChunks.map((chunk, chunkIndex) => (
                <div key={chunkIndex} className="address-level-chunk">
                    {chunk.map((level, levelIndex) => (
                        <div key={levelIndex} className="address-level">
                            <label>{t(level.addressField)}</label>
                            <input
                                type="text"
                                value={selectedValue[level.addressField] || ''}
                                onChange={(e) => addressFieldSelected(level.addressField)({ addressField: { name: e.target.value, parent: null } })}
                                onBlur={() => clearFields(level.addressField)}
                                list={`autocomplete-${level.addressField}`}
                            />
                            <datalist id={`autocomplete-${level.addressField}`}>
                                {getAddressEntryList(level.addressField)({ term: selectedValue[level.addressField] || '' }).map((item: any, itemIndex: number) => (
                                    <option key={itemIndex} value={item.addressField.name} />
                                ))}
                            </datalist>
                            <button type="button" onClick={removeAutoCompleteEntry(level.addressField)}>
                                {t('Remove')}
                            </button>
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
};

const chunkArray = (array: any[], size: number) => {
    const chunkedArray = [];
    for (let i = 0; i < array.length; i += size) {
        chunkedArray.push(array.slice(i, i + size));
    }
    return chunkedArray;
};

export default AddressFieldsDirectiveController;
