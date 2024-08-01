import React, { useState, useEffect, useContext } from 'react';
import { useHistory } from 'react-router-dom';
import { BahmniContext } from '../context/BahmniContext';
import { DateUtil } from '../utils/DateUtil';
import { Specimen, SpecimenMapper } from '../models/Specimen';
import { Constants } from '../utils/constants';
import _ from 'lodash';

const BacteriologyController: React.FC = () => {
    const { consultation, appService, retrospectiveEntryService, bacteriologyConceptSet } = useContext(BahmniContext);
    const history = useHistory();

    const [savedSpecimens, setSavedSpecimens] = useState(consultation.savedSpecimens || consultation.extensions.mdrtbSpecimen || []);
    const [newSpecimens, setNewSpecimens] = useState(consultation.newlyAddedSpecimens || []);
    const [deletedSpecimens, setDeletedSpecimens] = useState(consultation.deletedSpecimens || []);
    const [today, setToday] = useState(DateUtil.getDateWithoutTime(DateUtil.now()));
    const [additionalAttributesConceptName, setAdditionalAttributesConceptName] = useState<string | undefined>(undefined);
    const [resultsConceptName, setResultsConceptName] = useState<string | undefined>(undefined);
    const [allSamples, setAllSamples] = useState<any[]>([]);

    useEffect(() => {
        const initializeBacteriologyScope = () => {
            setSavedSpecimens(consultation.savedSpecimens || consultation.extensions.mdrtbSpecimen || []);
            setNewSpecimens(consultation.newlyAddedSpecimens || []);
            setDeletedSpecimens(consultation.deletedSpecimens || []);
        };

        const init = () => {
            if (appService.getAppDescriptor().getConfigValue("showSaveConfirmDialog")) {
                // SECOND AGENT: [MISSING CONTEXT] - Need to handle the event:pageUnload broadcast in React
            }

            const additionalAttributes = _.find(bacteriologyConceptSet.setMembers, (member) => member.conceptClass.name === "Bacteriology Attributes");
            setAdditionalAttributesConceptName(additionalAttributes && additionalAttributes.name.name);

            const results = _.find(bacteriologyConceptSet.setMembers, (member) => member.conceptClass.name === "Bacteriology Results");
            setResultsConceptName(results && results.name.name);

            const sampleSource = _.find(bacteriologyConceptSet.setMembers, (member) => member.name.name === "Specimen Sample Source");
            if (sampleSource) {
                setAllSamples(_.map(sampleSource.answers, (answer) => new Bahmni.Common.Domain.ConceptMapper().map(answer)));
            }

            if (savedSpecimens) {
                setSavedSpecimens(_.sortBy(savedSpecimens, 'dateCollected').reverse());
            }

            if (newSpecimens.length === 0) {
                createNewSpecimen();
            }

            handleSampleTypeOther();
        };

        const handleSampleTypeOther = () => {
            newSpecimens.forEach((specimen) => {
                if (specimen.type && specimen.type.name === Constants.bacteriologyConstants.otherSampleType) {
                    specimen.showTypeFreeText = true;
                    if (specimen.freeText) {
                        specimen.typeFreeText = specimen.freeText;
                    }
                } else {
                    specimen.showTypeFreeText = false;
                    if (specimen.type) {
                        specimen.freeText = specimen.typeFreeText;
                        specimen.typeFreeText = null;
                    }
                }
            });
        };

        const createNewSpecimen = () => {
            const newSpecimen = new Specimen(null, allSamples);
            setNewSpecimens([...newSpecimens, newSpecimen]);
        };

        const contextChange = () => {
            consultation.newlyAddedSpecimens = newSpecimens;
            consultation.deletedSpecimens = deletedSpecimens;
            consultation.savedSpecimens = savedSpecimens;

            const dirtySpecimens = newSpecimens.filter((specimen) => specimen.isDirty());
            dirtySpecimens.forEach((dirtySpecimen) => {
                dirtySpecimen.hasIllegalDateCollected = !dirtySpecimen.dateCollected;
                dirtySpecimen.hasIllegalType = !dirtySpecimen.type;
                dirtySpecimen.hasIllegalTypeFreeText = !dirtySpecimen.typeFreeText;
            });

            return { allow: dirtySpecimens[0] === undefined };
        };

        const saveSpecimens = () => {
            let savableSpecimens = newSpecimens.filter((specimen) => !specimen.isEmpty() || specimen.voidIfEmpty());
            savableSpecimens = savableSpecimens.concat(deletedSpecimens);

            const specimenMapper = new SpecimenMapper();
            const specimens = savableSpecimens.map((specimen) => specimenMapper.mapSpecimenToObservation(specimen));

            consultation.newlyAddedSpecimens = specimens;
            if (!consultation.extensions.mdrtbSpecimen) {
                consultation.extensions.mdrtbSpecimen = [];
            }
        };

        const editSpecimen = (specimen) => {
            setSavedSpecimens(savedSpecimens.filter((s) => s !== specimen));
            setNewSpecimens([...newSpecimens, new Specimen(specimen, allSamples)]);
            handleSampleTypeOther();
        };

        const handleUpdate = () => {
            handleSampleTypeOther();
        };

        const deleteSpecimen = (specimen) => {
            if (specimen.isExistingSpecimen()) {
                specimen.setMandatoryFieldsBeforeSavingVoidedSpecimen();
                setDeletedSpecimens([...deletedSpecimens, specimen]);
            }
            setSavedSpecimens(savedSpecimens.filter((s) => s !== specimen));
            setNewSpecimens(newSpecimens.filter((s) => s !== specimen));
            if (newSpecimens.length === 0) {
                createNewSpecimen();
            }
        };

        const getDisplayName = (specimen) => {
            const type = specimen.type;
            let displayName = type && (type.shortName ? type.shortName : type.name);
            if (displayName === Constants.bacteriologyConstants.otherSampleType) {
                displayName = specimen.typeFreeText;
            }
            return displayName;
        };

        consultation.preSaveHandler.register("bacteriologySaveHandlerKey", saveSpecimens);
        consultation.postSaveHandler.register("bacteriologyPostSaveHandlerKey", initializeBacteriologyScope);

        // Register context change handler
        // SECOND AGENT: [MISSING CONTEXT] - Need to handle contextChangeHandler.add(contextChange) in React

        init();
    }, []);

    useEffect(() => {
        return history.listen(() => {
            if (consultation.bacteriologyForm.$dirty) {
                history.dirtyConsultationForm = true;
            }
        });
    }, [history, consultation.bacteriologyForm]);

    useEffect(() => {
        const handleChangesSaved = () => {
            consultation.bacteriologyForm.$dirty = false;
        };

        // SECOND AGENT: [MISSING CONTEXT] - Need to handle event:changes-saved in React
    }, [consultation.bacteriologyForm]);

    return (
        <div>
            {/* SECOND AGENT: [MISSING CONTEXT] - Add JSX for rendering the component */}
        </div>
    );
};

export default BacteriologyController;
