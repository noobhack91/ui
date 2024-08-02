import React, { useState, useEffect } from 'react';
import { translateAttribute } from '../utils/translationUtil';
import { patientAttribute } from '../utils/constants';

interface AttributeTypesProps {
    targetModel: any;
    attribute: any;
    fieldValidation: any;
    isAutoComplete: () => boolean;
    getAutoCompleteList: () => any[];
    getDataResults: () => any[];
    handleUpdate: () => void;
    isReadOnly: () => boolean;
    isForm?: boolean;
}

const AttributeTypes: React.FC<AttributeTypesProps> = ({
    targetModel,
    attribute,
    fieldValidation,
    isAutoComplete,
    getAutoCompleteList,
    getDataResults,
    handleUpdate,
    isReadOnly,
    isForm
}) => {
    const [autoCompleteList, setAutoCompleteList] = useState<any[]>([]);
    const [dataResults, setDataResults] = useState<any[]>([]);
    const [readOnly, setReadOnly] = useState<boolean>(false);
    const [autoComplete, setAutoComplete] = useState<boolean>(false);

    useEffect(() => {
        setAutoCompleteList(getAutoCompleteList());
        setDataResults(getDataResults());
        setAutoComplete(isAutoComplete() || false);
        setReadOnly(isReadOnly() || false);
    }, [getAutoCompleteList, getDataResults, isAutoComplete, isReadOnly]);

    const appendConceptNameToModel = (attribute: any) => {
        const attributeValueConceptType = targetModel[attribute.name];
        const concept = attribute.answers.find((answer: any) => answer.conceptId === attributeValueConceptType.conceptUuid);
        attributeValueConceptType.value = concept && concept.fullySpecifiedName;
    };

    const getTranslatedAttributeTypes = (attribute: any) => {
        return translateAttribute(attribute, patientAttribute);
    };

    return (
        <div>

            {attribute && (
        
                    <label>{getTranslatedAttributeTypes(attribute)}</label>
                    {autoComplete ? (
                        <input
                            type="text"
                            value={targetModel[attribute.name]?.value || ''}
                            onChange={(e) => {
                                const updatedModel = { ...targetModel };
                                updatedModel[attribute.name].value = e.target.value;
                                handleUpdate(updatedModel);
                            }}
                            list="autoCompleteOptions"
                            readOnly={readOnly}
                        />
                    ) : (
                        <input
                            type="text"
                            value={targetModel[attribute.name]?.value || ''}
                            onChange={(e) => {
                                const updatedModel = { ...targetModel };
                                updatedModel[attribute.name].value = e.target.value;
                                handleUpdate(updatedModel);
                            }}
                            readOnly={readOnly}
                        />
                    )}
                    {autoComplete && (
                        <datalist id="autoCompleteOptions">
                            {autoCompleteList.map((item, index) => (
                                <option key={index} value={item} />
                            ))}
                        </datalist>
                    )}
                </div>
            )}
        </div>
    );
};

export default AttributeTypes;
