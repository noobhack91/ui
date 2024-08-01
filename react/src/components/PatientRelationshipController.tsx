import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { patientService, providerService, appService } from '../services';
import { Spinner } from 'react-bootstrap';
import _ from 'lodash';

interface Relationship {
  uuid?: string;
  voided?: boolean;
  relationshipType?: { uuid: string };
  personA?: { uuid: string };
  personB?: { uuid: string; display: string };
  patientIdentifier?: string;
  providerName?: string;
  content?: string;
}

interface Patient {
  uuid: string;
  newlyAddedRelationships: Relationship[];
  deletedRelationships: Relationship[];
  relationships: Relationship[];
}

interface Props {
  patient: Patient;
}

const PatientRelationshipController: React.FC<Props> = ({ patient }) => {
  const [relationshipTypes, setRelationshipTypes] = useState([]);
  const [spinner, setSpinner] = useState(false);
  const genderMap = useSelector((state: any) => state.genderMap);

  useEffect(() => {
    setRelationshipTypes(useSelector((state: any) => state.relationshipTypes));
    patient.relationships = patient.relationships || [];
  }, [patient]);

  const addPlaceholderRelationship = () => {
    patient.newlyAddedRelationships.push({});
  };

  const removeRelationship = (relationship: Relationship, index: number) => {
    if (relationship.uuid) {
      relationship.voided = true;
      patient.deletedRelationships.push(relationship);
    } else {
      patient.newlyAddedRelationships.splice(index, 1);
    }
  };

  const isPatientRelationship = (relationship: Relationship) => {
    const relationshipType = getRelationshipType(relationship);
    return relationshipType && (_.isUndefined(relationshipType.searchType) || relationshipType.searchType === 'patient');
  };

  const getRelationshipType = (uuid: string) => {
    return _.find(relationshipTypes, { uuid });
  };

  const getChosenRelationshipType = (relation: Relationship) => {
    if (isPatientRelationship(relation)) {
      return 'patient';
    } else if (isProviderRelationship(relation)) {
      return 'provider';
    }
  };

  const isProviderRelationship = (relationship: Relationship) => {
    const relationshipType = getRelationshipType(relationship);
    return relationshipType && relationshipType.searchType === 'provider';
  };

  const getRelationshipTypeForDisplay = (relationship: Relationship) => {
    const personUuid = patient.uuid;
    const relationshipType = getRelationshipType(relationship.relationshipType.uuid);
    if (!relationship.personA) {
      return '';
    }
    if (relationship.personA.uuid === personUuid) {
      return relationshipType.aIsToB;
    } else {
      return relationshipType.bIsToA;
    }
  };

  const getRelatedToPersonForDisplay = (relationship: Relationship) => {
    const personRelatedTo = getPersonRelatedTo(relationship);
    return personRelatedTo ? personRelatedTo.display : '';
  };

  const getName = (patient: any) => {
    return patient.givenName + (patient.middleName ? ' ' + patient.middleName : '') + (patient.familyName ? ' ' + patient.familyName : '');
  };

  const getPersonB = (personName: string, personUuid: string) => {
    return { display: personName, uuid: personUuid };
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
    if (response) {
      const patients = response.data.pageOfResults;
      if (patients.length === 0) {
        return;
      }
      relationship.content = getPatientGenderAndAge(patients[0]);
      const personUuid = patients[0].uuid;
      const personName = getName(patients[0]);
      relationship.personB = getPersonB(personName, personUuid);
    }
  };

  const showPersonNotFound = (relationship: Relationship) => {
    return relationship.patientIdentifier && !relationship.personB && getChosenRelationshipType(relationship) !== 'patient';
  };

  const isInvalidRelation = (relation: Relationship) => {
    return _.isEmpty(_.get(relation, 'personB.uuid')) || duplicateRelationship(relation);
  };

  const duplicateRelationship = (relationship: Relationship) => {
    if (_.isEmpty(relationship.relationshipType) || _.isEmpty(relationship.personB)) {
      return false;
    }
    const existingRelatives = getAlreadyAddedRelationshipPersonUuid(patient, relationship.relationshipType.uuid);
    return _.get(_.countBy(existingRelatives, _.identity), relationship.personB.uuid, 0) > 1;
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
    _.each(relationships, (relationship) => {
      if (relationship.personB && relationship.relationshipType.uuid === relationshipTypeUuid) {
        uuids.push(relationship.personB.uuid);
      }
    });
    return uuids;
  };

  const getAlreadyAddedRelationshipPersonUuid = (patient: Patient, relationTypeUuid: string) => {
    const personUuids = _.concat(
      getPersonUuidsForRelationship(patient.relationships, relationTypeUuid),
      getNewlyAddedRelationshipPersonUuid(patient, relationTypeUuid)
    );
    return _.difference(personUuids, getDeletedRelationshipUuids(patient, relationTypeUuid));
  };

  const clearProvider = (relationship: Relationship) => {
    clearPersonB(relationship, 'providerName');
  };

  const getLimit = (configName: string, defaultValue: number) => {
    return appService.getAppDescriptor().getConfigValue(configName) || defaultValue;
  };

  const searchByPatientIdentifierOrName = (searchAttrs: any) => {
    const term = searchAttrs.term;
    if (term && term.length >= getLimit('minCharRequireToSearch', 1)) {
      return patientService.searchByNameOrIdentifier(term, getLimit('possibleRelativeSearchLimit', 10));
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
    if (response) {
      return response.data.pageOfResults.map((patient: any) => ({
        value: getName(patient) + ' - ' + patient.identifier,
        uuid: patient.uuid,
        identifier: patient.identifier,
      }));
    }
    return [];
  };

  const getProviderDataResults = (data: any) => {
    return data.data.results
      .filter((provider: any) => provider.person)
      .map((providerDetails: any) => ({
        value: providerDetails.display || providerDetails.person.display,
        uuid: providerDetails.person.uuid,
        identifier: providerDetails.identifier || providerDetails.person.display,
      }));
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
    for (let iter = 0; iter < patient.newlyAddedRelationships.length; iter++) {
      if (isEmpty(patient.newlyAddedRelationships[iter]) && iter !== index) {
        patient.newlyAddedRelationships.splice(iter, 1);
      }
    }
    const emptyRows = _.filter(patient.newlyAddedRelationships, isEmpty);
    if (emptyRows.length === 0) {
      addPlaceholderRelationship();
    }
  };

  const isEmpty = (relationship: Relationship) => {
    return !relationship.relationshipType || !relationship.relationshipType.uuid;
  };

  const getPatientGenderAndAge = (patient: any) => {
    const patientGenderAndAge = [patient.givenName, patient.age, genderMap[patient.gender.toUpperCase()]];
    return patientGenderAndAge.join(', ');
  };

  return (
    <div>

      {patient.newlyAddedRelationships.map((relationship, index) => (
        <div key={index} className="relationship-row">
          <div className="relationship-type">
            <select
              value={relationship.relationshipType?.uuid || ''}
              onChange={(e) =>
                (relationship.relationshipType = getRelationshipType(e.target.value))
              }
            >
              <option value="" disabled>
                Select Relationship Type
              </option>
              {relationshipTypes.map((type) => (
                <option key={type.uuid} value={type.uuid}>
                  {type.display}
                </option>
              ))}
            </select>
          </div>
          <div className="relationship-person">
            {getChosenRelationshipType(relationship) === 'patient' ? (
              <input
                type="text"
                value={relationship.patientIdentifier || ''}
                onChange={(e) => {
                  relationship.patientIdentifier = e.target.value;
                  searchByPatientIdentifier(relationship);
                }}
                placeholder="Enter Patient Identifier"
              />
            ) : (
              <input
                type="text"
                value={relationship.providerName || ''}
                onChange={(e) => {
                  relationship.providerName = e.target.value;
                  providerSelected(relationship);
                }}
                placeholder="Enter Provider Name"
              />
            )}
            {showPersonNotFound(relationship) && (
              <span className="error">Person not found</span>
            )}
          </div>
          <div className="relationship-actions">
            <button onClick={() => removeRelationship(relationship, index)}>
              Remove
            </button>
          </div>
        </div>
      ))}
      <button onClick={addPlaceholderRelationship}>Add Relationship</button>
    </div>
  );
};

export default PatientRelationshipController;
