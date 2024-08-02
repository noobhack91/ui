// react/src/utils/constants/unAuthenticatedReferenceDataMap.ts

// Define the type for the unAuthenticatedReferenceDataMap
type UnAuthenticatedReferenceDataMap = {
    [key: string]: string;
};

// Create the unAuthenticatedReferenceDataMap constant
const unAuthenticatedReferenceDataMap: UnAuthenticatedReferenceDataMap = {
    "/openmrs/ws/rest/v1/location?tags=Login+Location&s=byTags&v=default": "LoginLocations",
    "/openmrs/ws/rest/v1/bahmnicore/sql/globalproperty?property=locale.allowed.list": "LocaleList"
};

export default unAuthenticatedReferenceDataMap;
