import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Spinner } from 'react-bootstrap';
import { patientService, providerService, appService } from '../services';
import { Patient, Relationship, RelationshipType } from '../types';

interface PatientRelationshipControllerProps {
    patient: Patient;
}

const PatientRelationshipController: React.FC<PatientRelationshipControllerProps> = ({ patient }) => {
    const [relationshipTypes, setRelationshipTypes] = useState<RelationshipType[]>([]);
    const [newlyAddedRelationships, setNewlyAddedRelationships] = useState<Relationship[]>([]);
    const [deletedRelationships, setDeletedRelationships] = useState<Relationship[]>([]);
    const [relationships, setRelationships] = useState<Relationship[]>(patient.relationships || []);

    const genderMap = useSelector((state: any) => state.genderMap);

    useEffect(() => {
        setRelationshipTypes(useSelector((state: any) => state.relationshipTypes));
    }, []);

    const addPlaceholderRelationship = () => {
        setNewlyAddedRelationships([...newlyAddedRelationships, {} as Relationship]);
    };

    const removeRelationship = (relationship: Relationship, index: number) => {
        if (relationship.uuid) {
            relationship.voided = true;
            setDeletedRelationships([...deletedRelationships, relationship]);
        } else {
            const updatedRelationships = [...newlyAddedRelationships];
            updatedRelationships.splice(index, 1);
            setNewlyAddedRelationships(updatedRelationships);
        }
    };

    const isPatientRelationship = (relationship: Relationship) => {
        const relationshipType = getRelationshipType(relationship);
        return relationshipType && (!relationshipType.searchType || relationshipType.searchType === "patient");
    };

    const getRelationshipType = (uuid: string) => {
        return relationshipTypes.find(type => type.uuid === uuid);
    };

    const getChosenRelationshipType = (relation: Relationship) => {
        if (isPatientRelationship(relation)) {
            return "patient";
        } else if (isProviderRelationship(relation)) {
            return "provider";
        }
    };

    const isProviderRelationship = (relationship: Relationship) => {
        const relationshipType = getRelationshipType(relationship.relationshipType.uuid);
        return relationshipType && relationshipType.searchType === "provider";
    };

    const getRelationshipTypeForDisplay = (relationship: Relationship) => {
        const personUuid = patient.uuid;
        const relationshipType = getRelationshipType(relationship.relationshipType.uuid);
        if (!relationship.personA) {
            return "";
        }
        if (relationship.personA.uuid === personUuid) {
            return relationshipType.aIsToB;
        } else {
            return relationshipType.bIsToA;
        }
    };

    const getRelatedToPersonForDisplay = (relationship: Relationship) => {
        const personRelatedTo = getPersonRelatedTo(relationship);
        return personRelatedTo ? personRelatedTo.display : "";
    };

    const getName = (patient: Patient) => {
        return patient.givenName + (patient.middleName ? " " + patient.middleName : "") +
            (patient.familyName ? " " + patient.familyName : "");
    };

    const getPersonB = (personName: string, personUuid: string) => {
        return { 'display': personName, 'uuid': personUuid };
    };

    const searchByPatientIdentifier = async (relationship: Relationship) => {
        if (!relationship.patientIdentifier) {
            relationship.personB = null;
            relationship.content = null;
            return;
        }
        if (relationship.hasOwnProperty('personB')) {
            relationship.personB = null;
        }
        const response = await patientService.searchByIdentifier(relationship.patientIdentifier);
        if (!response) {
            return;
        }

        const patients = response.data.pageOfResults;
        if (patients.length === 0) {
            return;
        }
        relationship.content = getPatientGenderAndAge(patients[0]);
        const personUuid = patients[0]['uuid'];
        const personName = getName(patients[0]);

        relationship.personB = getPersonB(personName, personUuid);
    };

    const showPersonNotFound = (relationship: Relationship) => {
        return (relationship.patientIdentifier && !relationship.personB) &&
            getChosenRelationshipType(relationship) !== 'patient';
    };

    const isInvalidRelation = (relation: Relationship) => {
        return !relation.personB?.uuid || duplicateRelationship(relation);
    };

    const duplicateRelationship = (relationship: Relationship) => {
        if (!relationship.relationshipType || !relationship.personB) {
            return false;
        }
        const existingRelatives = getAlreadyAddedRelationshipPersonUuid(patient, relationship.relationshipType.uuid);
        return existingRelatives.filter(uuid => uuid === relationship.personB.uuid).length > 1;
    };

    const getPersonRelatedTo = (relationship: Relationship) => {
        return relationship.personA && relationship.personA.uuid === patient.uuid ? relationship.personB : relationship.personA;
    };

    const openPatientDashboardInNewTab = (relationship: Relationship) => {
        const personRelatedTo = getPersonRelatedTo(relationship);
        window.open(getPatientRegistrationUrl(personRelatedTo.uuid), '_blank');
    };

    const getPatientRegistrationUrl = (patientUuid: string) => {
        return `#/patient/${patientUuid}`;
    };

    const getProviderList = (searchAttrs: any) => {
        return providerService.search(searchAttrs.term);
    };

    const providerSelected = (relationship: Relationship) => (providerData: any) => {
        relationship.providerName = providerData.identifier;
        relationship.personB = getPersonB(providerData.identifier, providerData.uuid);
    };

    const clearPersonB = (relationship: Relationship, fieldName: string) => {
        if (!relationship[fieldName]) {
            delete relationship.personB;
        }
    };

    const getDeletedRelationshipUuids = (patient: Patient, relationTypeUuid: string) => {
        return getPersonUuidsForRelationship(patient.deletedRelationships, relationTypeUuid);
    };

    const getNewlyAddedRelationshipPersonUuid = (patient: Patient, relationTypeUuid: string) => {
        return getPersonUuidsForRelationship(patient.newlyAddedRelationships, relationTypeUuid);
    };

    const getPersonUuidsForRelationship = (relationships: Relationship[], relationshipTypeUuid: string) => {
        const uuids: string[] = [];
        relationships.forEach(relationship => {
            if (relationship.personB && relationship.relationshipType.uuid === relationshipTypeUuid) {
                uuids.push(relationship.personB.uuid);
            }
        });

        return uuids;
    };

    const getAlreadyAddedRelationshipPersonUuid = (patient: Patient, relationTypeUuid: string) => {
        const personUuids = [...getPersonUuidsForRelationship(patient.relationships, relationTypeUuid),
        ...getNewlyAddedRelationshipPersonUuid(patient, relationTypeUuid)];

        return personUuids.filter(uuid => !getDeletedRelationshipUuids(patient, relationTypeUuid).includes(uuid));
    };

    const clearProvider = (relationship: Relationship) => {
        clearPersonB(relationship, 'providerName');
    };

    const getLimit = (configName: string, defaultValue: number) => {
        return appService.getAppDescriptor().getConfigValue(configName) || defaultValue;
    };

    const searchByPatientIdentifierOrName = (searchAttrs: any) => {
        const term = searchAttrs.term;
        if (term && term.length >= getLimit("minCharRequireToSearch", 1)) {
            return patientService.searchByNameOrIdentifier(term, getLimit("possibleRelativeSearchLimit", 10));
        }
        return Promise.resolve([]);
    };

    const clearPatient = (relationship: Relationship) => {
        clearPersonB(relationship, 'patientIdentifier');
    };

    const patientSelected = (relationship: Relationship) => (patientData: any) => {
        relationship.patientIdentifier = patientData.identifier;
        relationship.personB = getPersonB(patientData.value, patientData.uuid);
    };

    const getPatientList = (response: any) => {
        if (!response) {
            return [];
        }
        return response.data.pageOfResults.map((patient: any) => {
            return {
                value: getName(patient) + " - " + patient.identifier,
                uuid: patient.uuid,
                identifier: patient.identifier
            };
        });
    };

    const getProviderDataResults = (data: any) => {
        return data.data.results.filter((provider: any) => provider.person)
            .map((providerDetails: any) => {
                return {
                    'value': providerDetails.display || providerDetails.person.display,
                    'uuid': providerDetails.person.uuid,
                    'identifier': providerDetails.identifier || providerDetails.person.display
                };
            });
    };

    const onEdit = (relationship: Relationship) => () => {
        delete relationship.personB;
    };

    const clearRelationshipRow = (relationship: Relationship, index: number) => {
        delete relationship.personB;
        delete relationship.patientIdentifier;
        delete relationship.providerName;
        delete relationship.endDate;
        delete relationship.content;
        managePlaceholderRelationshipRows(index);
    };

    const managePlaceholderRelationshipRows = (index: number) => {
        const updatedRelationships = newlyAddedRelationships.filter((rel, i) => !isEmpty(rel) && i !== index);
        setNewlyAddedRelationships(updatedRelationships);

        const emptyRows = newlyAddedRelationships.filter(isEmpty);
        if (emptyRows.length === 0) {
            addPlaceholderRelationship();
        }
    };

    const isEmpty = (relationship: Relationship) => {
        return !relationship.relationshipType || !relationship.relationshipType.uuid;
    };

    const getPatientGenderAndAge = (patient: Patient) => {
        const patientGenderAndAge = [patient.givenName, patient.age, genderMap[patient.gender.toUpperCase()]];
        return patientGenderAndAge.join(", ");
    };

    return (
        <div>

            <h3>Patient Relationships</h3>
            <button onClick={addPlaceholderRelationship}>Add Relationship</button>
            {newlyAddedRelationships.map((relationship, index) => (
                <div key={index} className="relationship-row">
                    <select
                        value={relationship.relationshipType?.uuid || ''}
                        onChange={(e) => {
                            const updatedRelationships = [...newlyAddedRelationships];
                            updatedRelationships[index].relationshipType = getRelationshipType(e.target.value);
                            setNewlyAddedRelationships(updatedRelationships);
                        }}
                    >
                        <option value="">Select Relationship Type</option>
                        {relationshipTypes.map((type) => (
                            <option key={type.uuid} value={type.uuid}>
                                {type.aIsToB}
                            </option>
                        ))}
                    </select>
                    {isPatientRelationship(relationship) && (
                        <input
                            type="text"
                            placeholder="Patient Identifier"
                            value={relationship.patientIdentifier || ''}
                            onChange={(e) => {
                                const updatedRelationships = [...newlyAddedRelationships];
                                updatedRelationships[index].patientIdentifier = e.target.value;
                                setNewlyAddedRelationships(updatedRelationships);
                            }}
                            onBlur={() => searchByPatientIdentifier(relationship)}
                        />
                    )}
                    {isProviderRelationship(relationship) && (
                        <input
                            type="text"
                            placeholder="Provider Name"
                            value={relationship.providerName || ''}
                            onChange={(e) => {
                                const updatedRelationships = [...newlyAddedRelationships];
                                updatedRelationships[index].providerName = e.target.value;
                                setNewlyAddedRelationships(updatedRelationships);
                            }}
                        />
                    )}
                    <button onClick={() => removeRelationship(relationship, index)}>Remove</button>
                    {showPersonNotFound(relationship) && <span>Person not found</span>}
                </div>
            ))}
            <h4>Existing Relationships</h4>
            {relationships.map((relationship, index) => (
                <div key={index} className="relationship-row">
                    <span>{getRelationshipTypeForDisplay(relationship)}</span>
                    <span>{getRelatedToPersonForDisplay(relationship)}</span>
                    <button onClick={() => openPatientDashboardInNewTab(relationship)}>Open Dashboard</button>
                </div>
            ))}
        </div>
    );
};

export default PatientRelationshipController;
