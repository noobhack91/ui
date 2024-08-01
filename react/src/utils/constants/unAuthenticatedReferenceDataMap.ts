// Type definition for the unAuthenticatedReferenceDataMap
interface UnAuthenticatedReferenceDataMap {
    [key: string]: string;
}

// The unAuthenticatedReferenceDataMap constant
const unAuthenticatedReferenceDataMap: UnAuthenticatedReferenceDataMap = {
    "/openmrs/ws/rest/v1/location?tags=Login+Location&s=byTags&v=default": "LoginLocations",
    "/openmrs/ws/rest/v1/bahmnicore/sql/globalproperty?property=locale.allowed.list": "LocaleList"
};

export default unAuthenticatedReferenceDataMap;
