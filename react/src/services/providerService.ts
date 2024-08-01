import axios from 'axios';
import { getAppDescriptor } from './appService';
import { Bahmni } from '../utils/constants';

const providerUrl = Bahmni.Common.Constants.providerUrl;
const providerAttributeUrl = Bahmni.Common.Constants.providerAttributeUrl;

const search = (fieldValue: string) => {
    return axios.get(providerUrl, {
        params: { q: fieldValue, v: "full" },
        withCredentials: true
    });
};

const searchByUuid = (uuid: string) => {
    return axios.get(providerUrl, {
        params: { user: uuid },
        cache: false
    });
};

const list = (params: Record<string, any>) => {
    return axios.get(providerUrl, {
        cache: false,
        params: params
    });
};

const getAttributesForProvider = (providerUuid: string) => {
    const formattedUrl = getAppDescriptor().formatUrl(providerAttributeUrl, { 'providerUuid': providerUuid });
    return axios.get(formattedUrl, {
        withCredentials: true,
        cache: false
    });
};

export const providerService = {
    search,
    searchByUuid,
    list,
    getAttributesForProvider
};
