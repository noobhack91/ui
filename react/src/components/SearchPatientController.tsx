import React, { useState, useEffect } from 'react';
import { useLocation, useHistory } from 'react-router-dom';
import { Spinner } from 'react-bootstrap';
import { patientService } from '../services/patientService';
import { appService } from '../services/appService';
import { messagingService } from '../services/messagingService';
import { translate } from '../utils/translate';
import { filter } from 'lodash';

const SearchPatientController: React.FC = () => {
    const [results, setResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const [searchParameters, setSearchParameters] = useState({
        name: '',
        addressFieldValue: '',
        customAttribute: '',
        programAttributeFieldValue: '',
        registrationNumber: ''
    });
    const [noMoreResultsPresent, setNoMoreResultsPresent] = useState(false);
    const [noResultsMessage, setNoResultsMessage] = useState<string | null>(null);
    const [extraIdentifierTypes, setExtraIdentifierTypes] = useState([]);
    const [addressSearchConfig, setAddressSearchConfig] = useState({});
    const [customAttributesSearchConfig, setCustomAttributesSearchConfig] = useState({});
    const [programAttributesSearchConfig, setProgramAttributesSearchConfig] = useState({});
    const [personSearchResultsConfig, setPersonSearchResultsConfig] = useState({});
    const [addressSearchResultsConfig, setAddressSearchResultsConfig] = useState({});
    const [nextPageLoading, setNextPageLoading] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState(null);

    const location = useLocation();
    const history = useHistory();

    useEffect(() => {
        initialize();
    }, []);

    useEffect(() => {
        showSearchResults(searchBasedOnQueryParameters(0));
    }, [location.search]);

    const initialize = () => {
        setSearchParameters({});
        setSearchActions(appService.getAppDescriptor().getExtensions("org.bahmni.registration.patient.search.result.action"));
        setPatientIdentifierSearchConfig();
        setAddressSearchConfig();
        setCustomAttributesSearchConfig();
        setProgramAttributesSearchConfig();
        setSearchResultsConfig();
    };

    const setPatientIdentifierSearchConfig = () => {
        const allSearchConfigs = appService.getAppDescriptor().getConfigValue("patientSearch") || {};
        const patientIdentifierSearchConfig = {};
        patientIdentifierSearchConfig.show = allSearchConfigs.searchByPatientIdentifier === undefined ? true : allSearchConfigs.searchByPatientIdentifier;
        setPatientIdentifierSearchConfig(patientIdentifierSearchConfig);
    };

    const setAddressSearchConfig = () => {
        const allSearchConfigs = appService.getAppDescriptor().getConfigValue("patientSearch") || {};
        const addressSearchConfig = allSearchConfigs.address || {};
        addressSearchConfig.show = !_.isEmpty(addressSearchConfig) && !_.isEmpty(addressSearchConfig.field);
        if (addressSearchConfig.label && !addressSearchConfig.label) {
            throw new Error("Search Config label is not present!");
        }
        if (addressSearchConfig.field && !addressSearchConfig.field) {
            throw new Error("Search Config field is not present!");
        }
        setAddressSearchConfig(addressSearchConfig);
    };

    const setCustomAttributesSearchConfig = () => {
        const allSearchConfigs = appService.getAppDescriptor().getConfigValue("patientSearch") || {};
        const customAttributesSearchConfig = allSearchConfigs.customAttributes;
        setCustomAttributesSearchConfig(customAttributesSearchConfig || {});
        customAttributesSearchConfig.show = !_.isEmpty(customAttributesSearchConfig) && !_.isEmpty(customAttributesSearchConfig.fields);
    };

    const setProgramAttributesSearchConfig = () => {
        const allSearchConfigs = appService.getAppDescriptor().getConfigValue("patientSearch") || {};
        const programAttributesSearchConfig = allSearchConfigs.programAttributes || {};
        setProgramAttributesSearchConfig(programAttributesSearchConfig);
        programAttributesSearchConfig.show = !_.isEmpty(programAttributesSearchConfig.field);
    };

    const setSearchResultsConfig = () => {
        const allSearchConfigs = appService.getAppDescriptor().getConfigValue("patientSearch") || {};
        const patientSearchResultConfigs = appService.getAppDescriptor().getConfigValue("patientSearchResults") || {};
        const resultsConfigNotFound = _.isEmpty(patientSearchResultConfigs);

        if (resultsConfigNotFound) {
            patientSearchResultConfigs.address = { "fields": allSearchConfigs.address ? [allSearchConfigs.address.field] : [] };
            patientSearchResultConfigs.personAttributes = { fields: allSearchConfigs.customAttributes ? allSearchConfigs.customAttributes.fields : {} };
        } else {
            if (!patientSearchResultConfigs.address) patientSearchResultConfigs.address = {};
            if (!patientSearchResultConfigs.personAttributes) patientSearchResultConfigs.personAttributes = {};
        }

        if (patientSearchResultConfigs.address.fields && !_.isEmpty(patientSearchResultConfigs.address.fields)) {
            patientSearchResultConfigs.address.fields = patientSearchResultConfigs.address.fields.filter(item => !_.isEmpty(getAddressColumnName(item)));
        }

        if (!resultsConfigNotFound) sliceExtraColumns(patientSearchResultConfigs);

        setPersonSearchResultsConfig(patientSearchResultConfigs.personAttributes);
        setAddressSearchResultsConfig(patientSearchResultConfigs.address);
    };

    const sliceExtraColumns = (patientSearchResultConfigs) => {
        let maxAttributesFromConfig = 5;
        const allSearchConfigs = appService.getAppDescriptor().getConfigValue("patientSearch") || {};
        maxAttributesFromConfig = !_.isEmpty(allSearchConfigs.programAttributes) ? maxAttributesFromConfig - 1 : maxAttributesFromConfig;

        const orderedColumns = Object.keys(patientSearchResultConfigs);
        orderedColumns.forEach(column => {
            if (patientSearchResultConfigs[column].fields && !_.isEmpty(patientSearchResultConfigs[column].fields)) {
                patientSearchResultConfigs[column].fields = patientSearchResultConfigs[column].fields.slice(0, maxAttributesFromConfig);
                maxAttributesFromConfig -= patientSearchResultConfigs[column].fields.length;
            }
        });
    };

    const getAddressColumnName = (column) => {
        let columnName = "";
        const columnCamelCase = column.replace(/([-_][a-z])/g, $1 => $1.toUpperCase().replace(/[-_]/, ''));
        $scope.addressLevels.forEach(addressLevel => {
            if (addressLevel.addressField === columnCamelCase) {
                columnName = addressLevel.name;
            }
        });
        return columnName;
    };

    const hasSearchParameters = () => {
        return searchParameters.name.trim().length > 0 ||
            searchParameters.addressFieldValue.trim().length > 0 ||
            searchParameters.customAttribute.trim().length > 0 ||
            searchParameters.programAttributeFieldValue.trim().length > 0;
    };

    const searchBasedOnQueryParameters = (offset) => {
        if (!isUserPrivilegedForSearch()) {
            showInsufficientPrivMessage();
            return;
        }
        const searchParams = new URLSearchParams(location.search);
        setSearchParameters({
            ...searchParameters,
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
            const searchPromise = patientService.search(
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
            ).then(response => {
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

    const mapExtraIdentifiers = (data) => {
        if (data !== "Searching") {
            data.pageOfResults.forEach(result => {
                result.extraIdentifiers = result.extraIdentifiers && JSON.parse(result.extraIdentifiers);
            });
        }
    };

    const mapCustomAttributesSearchResults = (data) => {
        if (personSearchResultsConfig.fields && data !== "Searching") {
            data.pageOfResults.forEach(result => {
                result.customAttribute = result.customAttribute && JSON.parse(result.customAttribute);
            });
        }
    };

    const mapAddressAttributesSearchResults = (data) => {
        if (addressSearchResultsConfig.fields && data !== "Searching") {
            data.pageOfResults.forEach(result => {
                try {
                    result.addressFieldValue = JSON.parse(result.addressFieldValue);
                } catch (e) {
                    // Handle error
                }
            });
        }
    };

    const mapProgramAttributesSearchResults = (data) => {
        if (programAttributesSearchConfig.field && data !== "Searching") {
            data.pageOfResults.forEach(result => {
                const programAttributesObj = {};
                const arrayOfStringOfKeysValue = result.patientProgramAttributeValue && result.patientProgramAttributeValue.substring(2, result.patientProgramAttributeValue.length - 2).split('","');
                arrayOfStringOfKeysValue.forEach(keyValueString => {
                    const keyValueArray = keyValueString.split('":"');
                    const key = keyValueArray[0];
                    const value = keyValueArray[1];
                    if (!programAttributesObj[key]) {
                        programAttributesObj[key] = [];
                    }
                    programAttributesObj[key].push(value);
                });
                result.patientProgramAttributeValue = programAttributesObj;
            });
        }
    };

    const showSearchResults = (searchPromise) => {
        setNoMoreResultsPresent(false);
        if (searchPromise) {
            searchPromise.then(data => {
                setResults(data.pageOfResults);
                setNoResultsMessage(data.pageOfResults.length === 0 ? 'REGISTRATION_NO_RESULTS_FOUND' : null);
            });
        }
    };

    const isUserPrivilegedForSearch = () => {
        const applicablePrivs = [
            'viewPatientsPrivilege',
            'editPatientsPrivilege',
            'addVisitsPrivilege',
            'deleteVisitsPrivilege'
        ];
        const userPrivs = $rootScope.currentUser.privileges.map(privilege => privilege.name);
        return userPrivs.some(privName => applicablePrivs.includes(privName));
    };

    const showInsufficientPrivMessage = () => {
        const message = translate("REGISTRATION_INSUFFICIENT_PRIVILEGE");
        messagingService.showMessage('error', message);
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

        const searchPromise = patientService.search(
            undefined,
            patientIdentifier,
            addressSearchConfig.field,
            undefined,
            undefined,
            undefined,
            customAttributesSearchConfig.fields,
            programAttributesSearchConfig.field,
            searchParameters.programAttributeFieldValue,
            addressSearchResultsConfig.fields,
            personSearchResultsConfig.fields,
            isExtraIdentifierConfigured()
        ).then(data => {
            mapExtraIdentifiers(data);
            mapCustomAttributesSearchResults(data);
            mapAddressAttributesSearchResults(data);
            mapProgramAttributesSearchResults(data);
            if (data.pageOfResults.length === 1) {
                const patient = data.pageOfResults[0];
                const forwardUrl = appService.getAppDescriptor().getConfigValue("searchByIdForwardUrl") || "/patient/{{patientUuid}}";
                history.push(appService.getAppDescriptor().formatUrl(forwardUrl, { 'patientUuid': patient.uuid }));
            } else if (data.pageOfResults.length > 1) {
                setResults(data.pageOfResults);
                setNoResultsMessage(null);
            } else {
                setNoResultsMessage('REGISTRATION_LABEL_COULD_NOT_FIND_PATIENT');
            }
        });
        Spinner.forPromise(searchPromise);
    };

    const loadingMoreResults = () => {
        return searching && !noMoreResultsPresent;
    };

    const searchPatients = () => {
        if (!isUserPrivilegedForSearch()) {
            showInsufficientPrivMessage();
            return;
        }
        const queryParams = {};
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

    const editPatientUrl = (url, options) => {
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
            promise.then(data => {
                setResults([...results, ...data.pageOfResults]);
                setNoMoreResultsPresent(data.pageOfResults.length === 0);
                setNextPageLoading(false);
            }).catch(() => {
                setNextPageLoading(false);
            });
        }
    };

    const forPatient = (patient) => {
        setSelectedPatient(patient);
    };

    const doExtensionAction = (extension) => {
        const forwardTo = appService.getAppDescriptor().formatUrl(extension.url, { 'patientUuid': selectedPatient.uuid });
        if (extension.label === 'Print') {
            const params = identifyParams(forwardTo);
            if (params.launch === 'dialog') {
                const firstChar = forwardTo.charAt(0);
                const prefix = firstChar === "/" ? "#" : "#/";
                const hiddenFrame = document.getElementById("printPatientFrame");
                hiddenFrame.src = prefix + forwardTo;
                hiddenFrame.contentWindow.print();
            } else {
                history.push(forwardTo);
            }
        } else {
            history.push(forwardTo);
        }
    };

    const extensionActionText = (extension) => {
        return filter('titleTranslate')(extension);
    };

    const isExtraIdentifierConfigured = () => {
        return extraIdentifierTypes.length > 0;
    };

    const identifyParams = (querystring) => {
        querystring = querystring.substring(querystring.indexOf('?') + 1).split('&');
        const params = {};
        querystring.forEach(pair => {
            const [key, value] = pair.split('=');
            params[decodeURIComponent(key)] = decodeURIComponent(value);
        });
        return params;
    };

    return (
        <div>

            <form onSubmit={(e) => { e.preventDefault(); searchPatients(); }}>
        
                    <label htmlFor="name">Name:</label>
                    <input
                        type="text"
                        id="name"
                        value={searchParameters.name}
                        onChange={(e) => setSearchParameters({ ...searchParameters, name: e.target.value })}
                    />
                </div>
        
                    <label htmlFor="addressFieldValue">Address:</label>
                    <input
                        type="text"
                        id="addressFieldValue"
                        value={searchParameters.addressFieldValue}
                        onChange={(e) => setSearchParameters({ ...searchParameters, addressFieldValue: e.target.value })}
                    />
                </div>
        
                    <label htmlFor="customAttribute">Custom Attribute:</label>
                    <input
                        type="text"
                        id="customAttribute"
                        value={searchParameters.customAttribute}
                        onChange={(e) => setSearchParameters({ ...searchParameters, customAttribute: e.target.value })}
                    />
                </div>
        
                    <label htmlFor="programAttributeFieldValue">Program Attribute:</label>
                    <input
                        type="text"
                        id="programAttributeFieldValue"
                        value={searchParameters.programAttributeFieldValue}
                        onChange={(e) => setSearchParameters({ ...searchParameters, programAttributeFieldValue: e.target.value })}
                    />
                </div>
        
                    <label htmlFor="registrationNumber">Registration Number:</label>
                    <input
                        type="text"
                        id="registrationNumber"
                        value={searchParameters.registrationNumber}
                        onChange={(e) => setSearchParameters({ ...searchParameters, registrationNumber: e.target.value })}
                    />
                </div>
                <button type="submit" disabled={disableSearchButton()}>Search</button>
            </form>
            {searching && <Spinner animation="border" />}
            {noResultsMessage && <div>{translate(noResultsMessage)}</div>}
            {resultsPresent() && (
        
                    <table>
                        <thead>
                            <tr>
                                {/* Assuming columns are dynamically generated based on search results */}
                                {Object.keys(results[0]).map((key) => (
                                    <th key={key}>{translate(key)}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {results.map((result, index) => (
                                <tr key={index}>
                                    {Object.values(result).map((value, idx) => (
                                        <td key={idx}>{value}</td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {loadingMoreResults() && <Spinner animation="border" />}
                    {!noMoreResultsPresent && (
                        <button onClick={nextPage} disabled={nextPageLoading}>
                            Load More
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default SearchPatientController;
