import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { patientService } from '../services/patientService';
import { spinner } from '../services/spinnerService';
import { appService } from '../services/appService';
import { messagingService } from '../services/messagingService';
import { ngDialog } from '../services/ngDialogService';
import { $q } from '../services/qService';
import { $translate } from '../services/translateService';
import { Bahmni } from '../utils/constants/Bahmni';
import { _ } from 'lodash';

const CreatePatientController: React.FC = () => {
    const [patient, setPatient] = useState<any>({});
    const [patientLoaded, setPatientLoaded] = useState(false);
    const [createPatient, setCreatePatient] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);
    const [addressHierarchyConfigs, setAddressHierarchyConfigs] = useState<any>(null);
    const [disablePhotoCapture, setDisablePhotoCapture] = useState<boolean>(false);
    const [showEnterID, setShowEnterID] = useState<boolean>(true);
    const [relatedIdentifierAttribute, setRelatedIdentifierAttribute] = useState<any>(null);
    const [today, setToday] = useState<string>(Bahmni.Common.Util.DateTimeFormatter.getDateWithoutTime(Bahmni.Common.Util.DateUtil.now()));
    const [moduleName, setModuleName] = useState<string>('');
    const history = useHistory();

    useEffect(() => {
        const init = async () => {
            setPatient(patientService.create());
            prepopulateDefaultsInFields();
            expandSectionsWithDefaultValue();
            setPatientLoaded(true);
            setCreatePatient(true);
        };

        init();
        prepopulateFields();
    }, []);

    const getPersonAttributeTypes = () => {
        return appService.getAppDescriptor().getConfigValue('patientConfiguration').attributeTypes;
    };

    const getTranslatedPatientIdentifier = (patientIdentifier: any) => {
        return Bahmni.Common.Util.TranslationUtil.translateAttribute(patientIdentifier, Bahmni.Common.Constants.registration, $translate);
    };

    const prepopulateDefaultsInFields = () => {
        const personAttributeTypes = getPersonAttributeTypes();
        const patientInformation = appService.getAppDescriptor().getConfigValue("patientInformation");
        if (!patientInformation || !patientInformation.defaults) {
            return;
        }
        const defaults = patientInformation.defaults;
        const defaultVariableNames = _.keys(defaults);

        const hasDefaultAnswer = (personAttributeType: any) => {
            return _.includes(defaultVariableNames, personAttributeType.name);
        };

        const isConcept = (personAttributeType: any) => {
            return personAttributeType.format === "org.openmrs.Concept";
        };

        const setDefaultAnswer = (personAttributeType: any) => {
            setPatient((prevPatient: any) => ({
                ...prevPatient,
                [personAttributeType.name]: defaults[personAttributeType.name]
            }));
        };

        const setDefaultConcept = (personAttributeType: any) => {
            const defaultAnswer = defaults[personAttributeType.name];
            const isDefaultAnswer = (answer: any) => {
                return answer.fullySpecifiedName === defaultAnswer;
            };

            _.chain(personAttributeType.answers).filter(isDefaultAnswer).each((answer: any) => {
                setPatient((prevPatient: any) => ({
                    ...prevPatient,
                    [personAttributeType.name]: {
                        conceptUuid: answer.conceptId,
                        value: answer.fullySpecifiedName
                    }
                }));
            }).value();
        };

        const isDateType = (personAttributeType: any) => {
            return personAttributeType.format === "org.openmrs.util.AttributableDate";
        };

        const isDefaultValueToday = (personAttributeType: any) => {
            return defaults[personAttributeType.name].toLowerCase() === "today";
        };

        const setDefaultValue = (personAttributeType: any) => {
            if (isDefaultValueToday(personAttributeType)) {
                setPatient((prevPatient: any) => ({
                    ...prevPatient,
                    [personAttributeType.name]: new Date()
                }));
            } else {
                setPatient((prevPatient: any) => ({
                    ...prevPatient,
                    [personAttributeType.name]: ''
                }));
            }
        };

        const defaultsWithAnswers = _.chain(personAttributeTypes)
            .filter(hasDefaultAnswer)
            .each(setDefaultAnswer).value();

        _.chain(defaultsWithAnswers).filter(isConcept).each(setDefaultConcept).value();
        _.chain(defaultsWithAnswers).filter(isDateType).each(setDefaultValue).value();
        if (relatedIdentifierAttribute && relatedIdentifierAttribute.name) {
            setPatient((prevPatient: any) => ({
                ...prevPatient,
                [relatedIdentifierAttribute.name]: false
            }));
        }
    };

    const expandSectionsWithDefaultValue = () => {
        const patientConfiguration = appService.getAppDescriptor().getConfigValue('patientConfiguration');
        if (patientConfiguration) {
            patientConfiguration.getPatientAttributesSections().forEach((section: any) => {
                const notNullAttribute = _.find(section.attributes, (attribute: any) => {
                    return patient[attribute.name] !== undefined;
                });
                section.expand = section.expanded || (notNullAttribute ? true : false);
            });
        }
    };

    const prepopulateFields = () => {
        const fieldsToPopulate = appService.getAppDescriptor().getConfigValue("prepopulateFields");
        if (fieldsToPopulate) {
            fieldsToPopulate.forEach((field: any) => {
                const addressLevel = _.find(addressHierarchyConfigs, (level: any) => {
                    return level.name === field;
                });
                if (addressLevel) {
                    setPatient((prevPatient: any) => ({
                        ...prevPatient,
                        address: {
                            ...prevPatient.address,
                            [addressLevel.addressField]: appService.getAppDescriptor().getConfigValue('loggedInLocation')[addressLevel.addressField]
                        }
                    }));
                }
            });
        }
    };

    const addNewRelationships = () => {
        const newRelationships = _.filter(patient.newlyAddedRelationships, (relationship: any) => {
            return relationship.relationshipType && relationship.relationshipType.uuid;
        });
        newRelationships.forEach((relationship: any) => {
            delete relationship.patientIdentifier;
            delete relationship.content;
            delete relationship.providerName;
        });
        setPatient((prevPatient: any) => ({
            ...prevPatient,
            relationships: newRelationships
        }));
    };

    const getConfirmationViaNgDialog = (config: any) => {
        const ngDialogLocalScope = { ...config.scope };
        ngDialogLocalScope.yes = () => {
            ngDialog.close();
            config.yesCallback();
        };
        ngDialogLocalScope.no = () => {
            ngDialog.close();
        };
        ngDialog.open({
            template: config.template,
            data: config.data,
            scope: ngDialogLocalScope
        });
    };

    const copyPatientProfileDataToScope = (response: any) => {
        const patientProfileData = response.data;
        setPatient((prevPatient: any) => ({
            ...prevPatient,
            uuid: patientProfileData.patient.uuid,
            name: patientProfileData.patient.person.names[0].display,
            isNew: true,
            registrationDate: Bahmni.Common.Util.DateUtil.now(),
            newlyAddedRelationships: [{}]
        }));
        setPatientId(patientProfileData.patient.identifiers[0].identifier);
    };

    const createPatient = async (jumpAccepted: boolean = false) => {
        try {
            const response = await patientService.create(patient, jumpAccepted);
            copyPatientProfileDataToScope(response);
        } catch (response) {
            if (response.status === 412) {
                const data = response.data.map((data: any) => ({
                    sizeOfTheJump: data.sizeOfJump,
                    identifierName: _.find(appService.getAppDescriptor().getConfigValue('patientConfiguration').identifierTypes, { uuid: data.identifierType }).name
                }));
                getConfirmationViaNgDialog({
                    template: 'views/customIdentifierConfirmation.html',
                    data: data,
                    scope: { ...patient },
                    yesCallback: () => createPatient(true)
                });
            }
            if (response.isIdentifierDuplicate) {
                setErrorMessage(response.message);
            }
        }
    };

    const createPromise = () => {
        return new Promise((resolve) => {
            createPatient().finally(() => resolve({}));
        });
    };

    const handleCreate = async () => {
        addNewRelationships();
        const errorMessages = Bahmni.Common.Util.ValidationUtil.validate(patient, appService.getAppDescriptor().getConfigValue('patientConfiguration').attributeTypes);
        if (errorMessages.length > 0) {
            errorMessages.forEach((errorMessage: string) => {
                messagingService.showMessage('error', errorMessage);
            });
            return;
        }
        await spinner.forPromise(createPromise());
        if (errorMessage) {
            messagingService.showMessage("error", errorMessage);
            setErrorMessage(undefined);
        }
    };

    const afterSave = () => {
        messagingService.showMessage("info", "REGISTRATION_LABEL_SAVED");
        history.push(`/patient/edit/${patient.uuid}`);
    };

    return (
        <div>

            <form onSubmit={(e) => { e.preventDefault(); handleCreate(); }}>
        
                    <label htmlFor="patientName">Name:</label>
                    <input
                        type="text"
                        id="patientName"
                        value={patient.name || ''}
                        onChange={(e) => setPatient({ ...patient, name: e.target.value })}
                        required
                    />
                </div>
        
                    <label htmlFor="patientIdentifier">Identifier:</label>
                    <input
                        type="text"
                        id="patientIdentifier"
                        value={patient.identifier || ''}
                        onChange={(e) => setPatient({ ...patient, identifier: e.target.value })}
                        required
                    />
                </div>
        
                    <label htmlFor="patientDob">Date of Birth:</label>
                    <input
                        type="date"
                        id="patientDob"
                        value={patient.dob || ''}
                        onChange={(e) => setPatient({ ...patient, dob: e.target.value })}
                        required
                    />
                </div>
        
                    <label htmlFor="patientGender">Gender:</label>
                    <select
                        id="patientGender"
                        value={patient.gender || ''}
                        onChange={(e) => setPatient({ ...patient, gender: e.target.value })}
                        required
                    >
                        <option value="">Select Gender</option>
                        <option value="M">Male</option>
                        <option value="F">Female</option>
                        <option value="O">Other</option>
                    </select>
                </div>
        
                    <label htmlFor="patientAddress">Address:</label>
                    <input
                        type="text"
                        id="patientAddress"
                        value={patient.address || ''}
                        onChange={(e) => setPatient({ ...patient, address: e.target.value })}
                    />
                </div>
        
                    <label htmlFor="patientPhone">Phone:</label>
                    <input
                        type="tel"
                        id="patientPhone"
                        value={patient.phone || ''}
                        onChange={(e) => setPatient({ ...patient, phone: e.target.value })}
                    />
                </div>
                <button type="submit">Create Patient</button>
            </form>
        </div>
    );
};

export default CreatePatientController;
