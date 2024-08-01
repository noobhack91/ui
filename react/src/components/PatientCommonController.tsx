import React, { useState, useEffect } from 'react';
import AttributeTypes from './attributeTypes';
import ExtraPatientIdentifiers from './extraPatientIdentifiers';

interface PatientCommonControllerProps {
    patientConfiguration: any;
    patient: any;
    fieldValidation: any;
    isAutoComplete: (field: string) => boolean;
    getAutoCompleteList: (field: string) => any[];
    getDataResults: (field: string) => any[];
    isDisabledAttribute: (field: string) => boolean;
    handleUpdate: (field: string) => void;
    localLanguageNameIsRequired: (field?: string) => boolean;
    showMiddleName: boolean;
    showLastName: boolean;
    showCasteSameAsLastName: () => boolean;
    setCasteAsLastName: () => void;
    dobMandatory: boolean;
    addressLevels: any[];
    addressHierarchyConfigs: any;
    relationshipTypes: any[];
    deathConceptExists: boolean;
}

const PatientCommonController: React.FC<PatientCommonControllerProps> = ({
    patientConfiguration,
    patient,
    fieldValidation,
    isAutoComplete,
    getAutoCompleteList,
    getDataResults,
    isDisabledAttribute,
    handleUpdate,
    localLanguageNameIsRequired,
    showMiddleName,
    showLastName,
    showCasteSameAsLastName,
    setCasteAsLastName,
    dobMandatory,
    addressLevels,
    addressHierarchyConfigs,
    relationshipTypes,
    deathConceptExists
}) => {
    return (
        <div className="box-container box-container-patient-info patient-common-info-container">
            <section>
                <article className="form-field patient-name-wrapper" style={{ display: patientConfiguration.local()['showNameField'] ? 'block' : 'none' }}>
                    <div className="field-attribute">
                        <label htmlFor="patientName">
                            {patientConfiguration.local()['labelForNameField']}
                            <span className="asterick" style={{ display: localLanguageNameIsRequired() ? 'inline' : 'none' }}>*</span>
                        </label>
                    </div>
                    <div className="field-value" id="patientNameLocal">
                        {patientConfiguration.local()['showNameField'] && patientNameDisplayOrder.map((nameField: string) => (
                            <input
                                key={nameField}
                                type="text"
                                id={`${nameField}Local`}
                                value={patient[`${nameField}Local`]}
                                onChange={(e) => handleUpdate(`${nameField}Local`)}
                                placeholder={`PATIENT_ATTRIBUTE_${nameField.toUpperCase()}_LOCAL`}
                                required={localLanguageNameIsRequired(`${nameField}Local`)}
                            />
                        ))}
                    </div>
                </article>
                <article className="form-field patient-name-wrapper">
                    <div className="field-attribute">
                        <label htmlFor="patientName">
                            REGISTRATION_LABEL_PATIENT_NAME
                            <span className="asterick">*</span>
                        </label>
                    </div>
                    <div className="field-value patient-name" id="patientName">
                        {patientNameDisplayOrder.map((nameField: string) => (
                            <span key={nameField} data-ng-switch={isAutoComplete(nameField)}>
                                <input
                                    type="text"
                                    id={nameField}
                                    disabled={isDisabledAttribute(nameField)}
                                    value={patient[nameField]}
                                    onChange={(e) => handleUpdate(nameField)}
                                    placeholder={`REGISTRATION_LABEL_PATIENT_${nameField.toUpperCase()}`}
                                    title={`REGISTRATION_LABEL_PATIENT_ENTER_${nameField.toUpperCase()}`}
                                    required={nameField === 'familyName' && isLastNameMandatory}
                                />
                            </span>
                        ))}
                    </div>
                    {showCasteSameAsLastName() && (
                        <div className="field-value showOn-desktop">
                            <input
                                type="checkbox"
                                id="casteSameAsLastNameCheck"
                                checked={patient.sameAsLastName}
                                onChange={setCasteAsLastName}
                            />
                        </div>
                    )}
                    {showCasteSameAsLastName() && (
                        <div className="field-attribute">
                            <label htmlFor="casteSameAsLastNameCheck">
                                REGISTRATION_LABEL_CASTE_SAME_LAST_NAME
                            </label>
                        </div>
                    )}
                    {showCasteSameAsLastName() && (
                        <div className="field-value showOn-small-screen">
                            <input
                                type="checkbox"
                                id="casteSameAsLastNameCheck"
                                checked={patient.sameAsLastName}
                                onChange={setCasteAsLastName}
                            />
                        </div>
                    )}
                </article>
            </section>
            <section className="form-field form-field-gender">
                <article className="form-field">
                    <div className="field-attribute">
                        <label htmlFor="gender">
                            REGISTRATION_LABEL_GENDER
                            <span className="asterick">*</span>
                        </label>
                    </div>
                    <div className="field-value">
                        <select
                            id="gender"
                            value={patient.gender}
                            onChange={(e) => handleUpdate('gender')}
                            required
                            disabled={isDisabledAttribute('gender')}
                            title="REGISTRATION_LABEL_SELECT_GENDER"
                        >
                            <option value="">{`REGISTRATION_LABEL_SELECT_GENDER`}</option>
                            {genderCodes.map((genderCode: string) => (
                                <option key={genderCode} value={genderCode}>
                                    {genderMap[genderCode]}
                                </option>
                            ))}
                        </select>
                    </div>
                </article>
            </section>
            <section className="age-wrapper">
                {!dobMandatory ? (
                    <>
                        <ng-include src="'views/age.html'"></ng-include>
                        <ng-include src="'views/dob.html'"></ng-include>
                    </>
                ) : (
                    <>
                        <ng-include src="'views/dob.html'"></ng-include>
                        <ng-include src="'views/age.html'"></ng-include>
                    </>
                )}
            </section>
            {addressLevels.length > 0 && (
                <legend className="registraion_legend">
                    <span className="mylegend">REGISTRATION_LABEL_ADDRESS_INFO</span>
                </legend>
            )}
            {!addressHierarchyConfigs.showAddressFieldsTopDown ? (
                <section
                    address-fields
                    data-address-levels={addressLevels}
                    data-address={patient.address}
                    field-validation={fieldValidation}
                    strict-autocomplete-from-level={addressHierarchyConfigs.strictAutocompleteFromLevel}
                ></section>
            ) : (
                <section
                    top-down-address-fields
                    data-address-levels={addressLevels}
                    data-address={patient.address}
                    field-validation={fieldValidation}
                    strict-autocomplete-from-level={addressHierarchyConfigs.strictAutocompleteFromLevel}
                ></section>
            )}
            {patient.extraIdentifiers.length > 0 && (
                <legend className="registraion_legend">
                    <span className="mylegend">REGISTRATION_ADDTIONAL_IDENTIFIERS</span>
                </legend>
            )}
            <section>
                <ExtraPatientIdentifiers fieldValidation={fieldValidation} />
            </section>
            {patientConfiguration.customAttributeRows().length > 0 && (
                <legend className="registraion_legend">
                    <span className="mylegend">REGISTRATION_LABEL_OTHER_INFO</span>
                </legend>
            )}
            {patientConfiguration.customAttributeRows().map((attributeRow: any, rowIndex: number) => (
                <section key={rowIndex} className="form-field-inline clearfix">
                    {attributeRow.map((attribute: any, index: number) => (
                        <article key={index} className={`form-field ${index % 2 !== 0 ? 'right-form-field' : ''}`}>
                            <AttributeTypes
                                targetModel={patient}
                                attribute={attribute}
                                fieldValidation={fieldValidation}
                                isAutoComplete={isAutoComplete}
                                getAutoCompleteList={getAutoCompleteList}
                                getDataResults={getDataResults}
                                isReadOnly={isDisabledAttribute}
                                handleUpdate={handleUpdate}
                            />
                        </article>
                    ))}
                </section>
            ))}
            {patientConfiguration.getOrderedPatientAttributesSections().map((section: any, sectionIndex: number) => (
                <div key={sectionIndex} className="additional-info-wrapper">
                    {section.canShow && (
                        <div className="box-container form">
                            {section.attributes.length > 0 && section.title && (
                                <legend className="additional-attribute" toggle={section.expand}>
                                    <span>
                                        <i className="fa fa-caret-right"></i>
                                        <i className="fa fa-caret-down"></i>
                                        <strong>
                                            {section.translationKey ? (
                                                <a href accessKey={section.shortcutKey}>
                                                    {section.translationKey}
                                                </a>
                                            ) : (
                                                <a href>REGISTRATION_TITLE_ADDITIONAL_PATIENT</a>
                                            )}
                                        </strong>
                                    </span>
                                </legend>
                            )}
                            <section className="form-field-inline clearfix" style={{ display: section.expand ? 'block' : 'none' }}>
                                {section.attributes.map((attribute: any, index: number) => (
                                    <article key={index} className={`form-field ${index % 2 !== 0 ? 'right-form-field' : ''}`}>
                                        <AttributeTypes
                                            targetModel={patient}
                                            attribute={attribute}
                                            fieldValidation={fieldValidation}
                                            isAutoComplete={isAutoComplete}
                                            getAutoCompleteList={getAutoCompleteList}
                                            getDataResults={getDataResults}
                                            isReadOnly={isDisabledAttribute}
                                            handleUpdate={handleUpdate}
                                        />
                                    </article>
                                ))}
                            </section>
                        </div>
                    )}
                </div>
            ))}
            {relationshipTypes.length > 0 && (
                <div className="box-container">
                    <legend className="additional-attribute" toggle={patient.hasRelationships}>
                        <span>
                            <i className="fa fa-caret-right"></i>
                            <i className="fa fa-caret-down"></i>
                            <strong>REGISTRATION_TITLE_RELATIONSHIPS</strong>
                        </span>
                    </legend>
                    <div patient-relationship patient={patient} style={{ display: patient.hasRelationships ? 'block' : 'none' }}></div>
                </div>
            )}
            {deathConceptExists && (
                <div className="box-container">
                    <legend className="additional-attribute" toggle={patient.isDead}>
                        <span>
                            <i className="fa fa-caret-right"></i>
                            <i className="fa fa-caret-down"></i>
                            <strong>REGISTRATION_LABEL_DEATH_INFO</strong>
                        </span>
                    </legend>
                    <section className="form-field-inline form-field-inline-one-col clearfix" style={{ display: patient.isDead ? 'block' : 'none' }}>
                        <ng-include src="'views/patientDeathInformation.html'"></ng-include>
                    </section>
                </div>
            )}
        </div>
    );
};

export default PatientCommonController;
