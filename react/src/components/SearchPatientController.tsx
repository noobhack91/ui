import React, { useState, useEffect } from 'react';
import { useLocation, useHistory } from 'react-router-dom';
import axios from 'axios';
import _ from 'lodash';
import { Spinner } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { showMessage } from '../services/messagingService';
import { getAppDescriptor } from '../services/appService';
import { searchPatients } from '../services/patientService';

const SearchPatientController: React.FC = () => {
    const [results, setResults] = useState<any[]>([]);
    const [searching, setSearching] = useState(false);
    const [noMoreResultsPresent, setNoMoreResultsPresent] = useState(false);
    const [nextPageLoading, setNextPageLoading] = useState(false);
    const [searchParameters, setSearchParameters] = useState<any>({});
    const [noResultsMessage, setNoResultsMessage] = useState<string | null>(null);
    const [selectedPatient, setSelectedPatient] = useState<any>(null);
    const [extraIdentifierTypes, setExtraIdentifierTypes] = useState<any[]>([]);
    const [addressSearchConfig, setAddressSearchConfig] = useState<any>({});
    const [customAttributesSearchConfig, setCustomAttributesSearchConfig] = useState<any>({});
    const [programAttributesSearchConfig, setProgramAttributesSearchConfig] = useState<any>({});
    const [personSearchResultsConfig, setPersonSearchResultsConfig] = useState<any>({});
    const [addressSearchResultsConfig, setAddressSearchResultsConfig] = useState<any>({});
    const { t } = useTranslation();
    const location = useLocation();
    const history = useHistory();
    const currentUser = useSelector((state: RootState) => state.user);

    useEffect(() => {
        initialize();
    }, []);

    useEffect(() => {
        showSearchResults(searchBasedOnQueryParameters(0));
    }, [location.search]);

    const initialize = () => {
        setSearchParameters({});
        setSearchActions(getAppDescriptor().getExtensions("org.bahmni.registration.patient.search.result.action"));
        setPatientIdentifierSearchConfig();
        setAddressSearchConfig();
        setCustomAttributesSearchConfig();
        setProgramAttributesSearchConfig();
        setSearchResultsConfig();
    };

    const setPatientIdentifierSearchConfig = () => {
        const allSearchConfigs = getAppDescriptor().getConfigValue("patientSearch") || {};
        setPatientIdentifierSearchConfig({
            show: allSearchConfigs.searchByPatientIdentifier === undefined ? true : allSearchConfigs.searchByPatientIdentifier
        });
    };

    const setAddressSearchConfig = () => {
        const allSearchConfigs = getAppDescriptor().getConfigValue("patientSearch") || {};
        const addressConfig = allSearchConfigs.address || {};
        setAddressSearchConfig({
            ...addressConfig,
            show: !_.isEmpty(addressConfig) && !_.isEmpty(addressConfig.field)
        });
    };

    const setCustomAttributesSearchConfig = () => {
        const allSearchConfigs = getAppDescriptor().getConfigValue("patientSearch") || {};
        const customAttributesConfig = allSearchConfigs.customAttributes || {};
        setCustomAttributesSearchConfig({
            ...customAttributesConfig,
            show: !_.isEmpty(customAttributesConfig) && !_.isEmpty(customAttributesConfig.fields)
        });
    };

    const setProgramAttributesSearchConfig = () => {
        const allSearchConfigs = getAppDescriptor().getConfigValue("patientSearch") || {};
        const programAttributesConfig = allSearchConfigs.programAttributes || {};
        setProgramAttributesSearchConfig({
            ...programAttributesConfig,
            show: !_.isEmpty(programAttributesConfig.field)
        });
    };

    const setSearchResultsConfig = () => {
        const allSearchConfigs = getAppDescriptor().getConfigValue("patientSearch") || {};
        const patientSearchResultConfigs = getAppDescriptor().getConfigValue("patientSearchResults") || {};
        const resultsConfigNotFound = _.isEmpty(patientSearchResultConfigs);

        if (resultsConfigNotFound) {
            patientSearchResultConfigs.address = { "fields": allSearchConfigs.address ? [allSearchConfigs.address.field] : [] };
            patientSearchResultConfigs.personAttributes = { fields: allSearchConfigs.customAttributes ? allSearchConfigs.customAttributes.fields : {} };
        } else {
            if (!patientSearchResultConfigs.address) patientSearchResultConfigs.address = {};
            if (!patientSearchResultConfigs.personAttributes) patientSearchResultConfigs.personAttributes = {};
        }

        if (patientSearchResultConfigs.address.fields && !_.isEmpty(patientSearchResultConfigs.address.fields)) {
            patientSearchResultConfigs.address.fields = patientSearchResultConfigs.address.fields.filter((item: any) => !_.isEmpty(getAddressColumnName(item)));
        }

        if (!resultsConfigNotFound) sliceExtraColumns(patientSearchResultConfigs);

        setPersonSearchResultsConfig(patientSearchResultConfigs.personAttributes);
        setAddressSearchResultsConfig(patientSearchResultConfigs.address);
    };

    const sliceExtraColumns = (patientSearchResultConfigs: any) => {
        let maxAttributesFromConfig = 5;
        const allSearchConfigs = getAppDescriptor().getConfigValue("patientSearch") || {};
        maxAttributesFromConfig = !_.isEmpty(allSearchConfigs.programAttributes) ? maxAttributesFromConfig - 1 : maxAttributesFromConfig;

        const orderedColumns = Object.keys(patientSearchResultConfigs);
        orderedColumns.forEach((column: any) => {
            if (patientSearchResultConfigs[column].fields && !_.isEmpty(patientSearchResultConfigs[column].fields)) {
                patientSearchResultConfigs[column].fields = patientSearchResultConfigs[column].fields.slice(0, maxAttributesFromConfig);
                maxAttributesFromConfig -= patientSearchResultConfigs[column].fields.length;
            }
        });
    };

    const getAddressColumnName = (column: string) => {
        let columnName = "";
        const columnCamelCase = column.replace(/([-_][a-z])/g, (group) => group.toUpperCase().replace(/[-_]/, ''));
        // SECOND AGENT: [MISSING CONTEXT] - Address levels context is missing here
        return columnName;
    };

    const hasSearchParameters = () => {
        return searchParameters.name?.trim().length > 0 ||
            searchParameters.addressFieldValue?.trim().length > 0 ||
            searchParameters.customAttribute?.trim().length > 0 ||
            searchParameters.programAttributeFieldValue?.trim().length > 0;
    };

    const searchBasedOnQueryParameters = (offset: number) => {
        if (!isUserPrivilegedForSearch()) {
            showInsufficientPrivMessage();
            return;
        }

        const searchParams = new URLSearchParams(location.search);
        setSearchParameters({
            addressFieldValue: searchParams.get('addressFieldValue') || '',
            name: searchParams.get('name') || '',
            customAttribute: searchParams.get('customAttribute') || '',
            programAttributeFieldValue: searchParams.get('programAttributeFieldValue') || '',
            addressSearchResultsConfig: searchParams.get('addressSearchResultsConfig') || '',
            personSearchResultsConfig: searchParams.get('personSearchResultsConfig') || '',
            registrationNumber: searchParams.get('registrationNumber') || ''
        });

        if (hasSearchParameters()) {
            setSearching(true);
            const searchPromise = searchPatients(
                searchParameters.name,
                undefined,
                addressSearchConfig.field,
                searchParameters.addressFieldValue,
                searchParameters.customAttribute,
                offset,
                customAttributesSearchConfig.fields,
                programAttributesSearchConfig.field,
                searchParameters.programAttributeFieldValue,
                addressSearchResultsConfig.fields,
                personSearchResultsConfig.fields
            ).then((response) => {
                mapExtraIdentifiers(response);
                mapCustomAttributesSearchResults(response);
                mapAddressAttributesSearchResults(response);
                mapProgramAttributesSearchResults(response);
                return response;
            });

            searchPromise.finally(() => {
                setSearching(false);
            });

            return searchPromise;
        }
    };

    const mapExtraIdentifiers = (data: any) => {
        if (data !== "Searching") {
            data.pageOfResults.forEach((result: any) => {
                result.extraIdentifiers = result.extraIdentifiers && JSON.parse(result.extraIdentifiers);
            });
        }
    };

    const mapCustomAttributesSearchResults = (data: any) => {
        if (personSearchResultsConfig.fields && data !== "Searching") {
            data.pageOfResults.forEach((result: any) => {
                result.customAttribute = result.customAttribute && JSON.parse(result.customAttribute);
            });
        }
    };

    const mapAddressAttributesSearchResults = (data: any) => {
        if (addressSearchResultsConfig.fields && data !== "Searching") {
            data.pageOfResults.forEach((result: any) => {
                try {
                    result.addressFieldValue = JSON.parse(result.addressFieldValue);
                } catch (e) {
                    // Handle error
                }
            });
        }
    };

    const mapProgramAttributesSearchResults = (data: any) => {
        if (programAttributesSearchConfig.field && data !== "Searching") {
            data.pageOfResults.forEach((result: any) => {
                const programAttributesObj: any = {};
                const arrayOfStringOfKeysValue = result.patientProgramAttributeValue && result.patientProgramAttributeValue.substring(2, result.patientProgramAttributeValue.length - 2).split('","');
                arrayOfStringOfKeysValue.forEach((keyValueString: string) => {
                    const keyValueArray = keyValueString.split('":"');
                    const key = keyValueArray[0];
                    const value = keyValueArray[1];
                    if (!_.includes(Object.keys(programAttributesObj), key)) {
                        programAttributesObj[key] = [];
                        programAttributesObj[key].push(value);
                    } else {
                        programAttributesObj[key].push(value);
                    }
                });
                result.patientProgramAttributeValue = programAttributesObj;
            });
        }
    };

    const showSearchResults = (searchPromise: any) => {
        setNoMoreResultsPresent(false);
        if (searchPromise) {
            searchPromise.then((data: any) => {
                setResults(data.pageOfResults);
                setNoResultsMessage(data.pageOfResults.length === 0 ? 'REGISTRATION_NO_RESULTS_FOUND' : null);
            });
        }
    };

    const isUserPrivilegedForSearch = () => {
        const applicablePrivs = ['viewPatientsPrivilege', 'editPatientsPrivilege', 'addVisitsPrivilege', 'deleteVisitsPrivilege'];
        const userPrivs = currentUser.privileges.map((privilege: any) => privilege.name);
        return applicablePrivs.some((privName) => userPrivs.includes(privName));
    };

    const showInsufficientPrivMessage = () => {
        const message = t("REGISTRATION_INSUFFICIENT_PRIVILEGE");
        showMessage('error', message);
    };

    const disableSearchButton = () => {
        return !searchParameters.name && !searchParameters.addressFieldValue && !searchParameters.customAttribute && !searchParameters.programAttributeFieldValue;
    };

    const searchById = () => {
        if (!isUserPrivilegedForSearch()) {
            showInsufficientPrivMessage();
            return;
        }
        if (!searchParameters.registrationNumber) {
            return;
        }
        setResults([]);

        const patientIdentifier = searchParameters.registrationNumber;

        history.push({
            search: `?registrationNumber=${searchParameters.registrationNumber}&programAttributeFieldName=${programAttributesSearchConfig.field}&patientAttributes=${customAttributesSearchConfig.fields}&programAttributeFieldValue=${searchParameters.programAttributeFieldValue}&addressSearchResultsConfig=${addressSearchResultsConfig.fields}&personSearchResultsConfig=${personSearchResultsConfig.fields}`
        });

        const searchPromise = searchPatients(undefined, patientIdentifier, addressSearchConfig.field,
            undefined, undefined, undefined, customAttributesSearchConfig.fields,
            programAttributesSearchConfig.field, searchParameters.programAttributeFieldValue,
            addressSearchResultsConfig.fields, personSearchResultsConfig.fields,
            isExtraIdentifierConfigured())
            .then((data) => {
                mapExtraIdentifiers(data);
                mapCustomAttributesSearchResults(data);
                mapAddressAttributesSearchResults(data);
                mapProgramAttributesSearchResults(data);
                if (data.pageOfResults.length === 1) {
                    const patient = data.pageOfResults[0];
                    const forwardUrl = getAppDescriptor().getConfigValue("searchByIdForwardUrl") || "/patient/{{patientUuid}}";
                    history.push(getAppDescriptor().formatUrl(forwardUrl, { 'patientUuid': patient.uuid }));
                } else if (data.pageOfResults.length > 1) {
                    setResults(data.pageOfResults);
                    setNoResultsMessage(null);
                } else {
                    setNoResultsMessage('REGISTRATION_LABEL_COULD_NOT_FIND_PATIENT');
                }
            });

        // SECOND AGENT: [MISSING CONTEXT] - Spinner context is missing here
    };

    const loadingMoreResults = () => {
        return searching && !noMoreResultsPresent;
    };

    const searchPatientsHandler = () => {
        if (!isUserPrivilegedForSearch()) {
            showInsufficientPrivMessage();
            return;
        }
        const queryParams: any = {};
        setResults([]);
        if (searchParameters.name) {
            queryParams.name = searchParameters.name;
        }
        if (searchParameters.addressFieldValue) {
            queryParams.addressFieldValue = searchParameters.addressFieldValue;
        }
        if (searchParameters.customAttribute && customAttributesSearchConfig.show) {
            queryParams.customAttribute = searchParameters.customAttribute;
        }
        if (searchParameters.programAttributeFieldValue && programAttributesSearchConfig.show) {
            queryParams.programAttributeFieldName = programAttributesSearchConfig.field;
            queryParams.programAttributeFieldValue = searchParameters.programAttributeFieldValue;
        }
        history.push({ search: new URLSearchParams(queryParams).toString() });
    };

    const resultsPresent = () => {
        return results.length > 0;
    };

    const editPatientUrl = (url: string, options: any) => {
        let temp = url;
        for (const key in options) {
            temp = temp.replace(`{{${key}}}`, options[key]);
        }
        return temp;
    };

    const nextPage = () => {
        if (nextPageLoading) {
            return;
        }
        setNextPageLoading(true);
        const promise = searchBasedOnQueryParameters(results.length);
        if (promise) {
            promise.then((data: any) => {
                setResults([...results, ...data.pageOfResults]);
                setNoMoreResultsPresent(data.pageOfResults.length === 0);
                setNextPageLoading(false);
            }).catch(() => {
                setNextPageLoading(false);
            });
        }
    };

    const forPatient = (patient: any) => {
        setSelectedPatient(patient);
    };

    const doExtensionAction = (extension: any) => {
        const forwardTo = getAppDescriptor().formatUrl(extension.url, { 'patientUuid': selectedPatient.uuid });
        if (extension.label === 'Print') {
            const params = new URLSearchParams(forwardTo);
            if (params.get('launch') === 'dialog') {
                const hiddenFrame = document.getElementById("printPatientFrame") as HTMLIFrameElement;
                hiddenFrame.src = forwardTo;
                hiddenFrame.contentWindow?.print();
            } else {
                history.push(forwardTo);
            }
        } else {
            history.push(forwardTo);
        }
    };

    const extensionActionText = (extension: any) => {
        return t(extension.label);
    };

    const isExtraIdentifierConfigured = () => {
        return extraIdentifierTypes.length > 0;
    };

    return (
        <div>

            <form onSubmit={(e) => { e.preventDefault(); searchPatientsHandler(); }}>
        
                    <label>{t('Name')}</label>
                    <input
                        type="text"
                        value={searchParameters.name || ''}
                        onChange={(e) => setSearchParameters({ ...searchParameters, name: e.target.value })}
                    />
                </div>
        
                    <label>{t('Address')}</label>
                    <input
                        type="text"
                        value={searchParameters.addressFieldValue || ''}
                        onChange={(e) => setSearchParameters({ ...searchParameters, addressFieldValue: e.target.value })}
                    />
                </div>
        
                    <label>{t('Custom Attribute')}</label>
                    <input
                        type="text"
                        value={searchParameters.customAttribute || ''}
                        onChange={(e) => setSearchParameters({ ...searchParameters, customAttribute: e.target.value })}
                    />
                </div>
        
                    <label>{t('Program Attribute')}</label>
                    <input
                        type="text"
                        value={searchParameters.programAttributeFieldValue || ''}
                        onChange={(e) => setSearchParameters({ ...searchParameters, programAttributeFieldValue: e.target.value })}
                    />
                </div>
        
                    <label>{t('Registration Number')}</label>
                    <input
                        type="text"
                        value={searchParameters.registrationNumber || ''}
                        onChange={(e) => setSearchParameters({ ...searchParameters, registrationNumber: e.target.value })}
                    />
                </div>
                <button type="submit" disabled={disableSearchButton()}>{t('Search')}</button>
            </form>
            {searching && <Spinner animation="border" />}
            {noResultsMessage && <div>{t(noResultsMessage)}</div>}
            {resultsPresent() && (
                <table>
                    <thead>
                        <tr>
                            {personSearchResultsConfig.fields.map((field: string) => (
                                <th key={field}>{t(field)}</th>
                            ))}
                            {addressSearchResultsConfig.fields.map((field: string) => (
                                <th key={field}>{t(field)}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {results.map((result: any) => (
                            <tr key={result.uuid}>
                                {personSearchResultsConfig.fields.map((field: string) => (
                                    <td key={field}>{result[field]}</td>
                                ))}
                                {addressSearchResultsConfig.fields.map((field: string) => (
                                    <td key={field}>{result.addressFieldValue[field]}</td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
            {loadingMoreResults() && <Spinner animation="border" />}
            {!noMoreResultsPresent && (
                <button onClick={nextPage} disabled={nextPageLoading}>
                    {t('Load More')}
                </button>
            )}
        </div>
    );
};

export default SearchPatientController;
