import axios from 'axios';
import { Bahmni } from '../utils/constants/Bahmni';

interface AddressField {
    name: string;
    parent?: AddressField;
}

interface AddressDataResult {
    value: string;
    label: string;
    addressField: AddressField;
}

const parseSearchString = (searchString: string): string => {
    searchString = searchString.replace(new RegExp("\\(", "g"), "\\(");
    searchString = searchString.replace(new RegExp("\\)", "g"), "\\)");
    return searchString;
};

const search = async (fieldName: string, query: string, parentUuid?: string): Promise<any> => {
    const params = { searchString: query, addressField: fieldName, parentUuid: parentUuid, limit: Bahmni.Registration.Constants.maxAutocompleteResults };
    const url = `${Bahmni.Registration.Constants.openmrsUrl}/module/addresshierarchy/ajax/getPossibleAddressHierarchyEntriesWithParents.form`;

    try {
        const response = await axios.get(url, {
            params: params,
            withCredentials: true
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching address hierarchy entries:', error);
        throw error;
    }
};

const getNextAvailableParentName = (addressField: AddressField): string => {
    let parent = addressField.parent;
    while (parent) {
        if (parent.name) {
            return parent.name;
        } else {
            parent = parent.parent;
        }
    }
    return "";
};

const getAddressDataResults = (data: any): AddressDataResult[] => {
    return data ? data.map((addressField: AddressField) => {
        const parentName = getNextAvailableParentName(addressField);
        return {
            value: addressField.name,
            label: addressField.name + (parentName ? ", " + parentName : ""),
            addressField: addressField
        };
    }) : [];
};

export const addressHierarchyService = {
    search,
    getNextAvailableParentName,
    getAddressDataResults
};
