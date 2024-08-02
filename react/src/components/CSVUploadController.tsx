import React, { useState, useEffect } from 'react';
import { FileUploader } from 'react-file-uploader';
import { appService, adminImportService, spinner } from '../services/adminImportService';

const CSVUploadController: React.FC = () => {
    const [importedItems, setImportedItems] = useState([]);
    const [selectedOption, setSelectedOption] = useState("encounter");
    const [urlMaps, setUrlMaps] = useState({});

    const adminCSVExtension = appService.getAppDescriptor().getExtensionById("bahmni.admin.csv");
    const patientMatchingAlgorithm = adminCSVExtension.extensionParams.patientMatchingAlgorithm || "";
    const defaultUrlMap = {
        "concept": { name: "Concept", url: Bahmni.Common.Constants.conceptImportUrl },
        "conceptset": { name: "Concept Set", url: Bahmni.Common.Constants.conceptSetImportUrl },
        "program": { name: "Program", url: Bahmni.Common.Constants.programImportUrl },
        "patient": { name: "Patient", url: Bahmni.Common.Constants.patientImportUrl },
        "encounter": { name: "Encounter", url: Bahmni.Common.Constants.encounterImportUrl },
        "form2encounter": { name: "Form2 Encounter (With Validations)", url: Bahmni.Common.Constants.form2encounterImportUrl },
        "drug": { name: "Drug", url: Bahmni.Common.Constants.drugImportUrl },
        "labResults": { name: "Lab Results", url: Bahmni.Common.Constants.labResultsImportUrl },
        "referenceterms": { name: "Reference Terms", url: Bahmni.Common.Constants.referenceTermsImportUrl },
        "updateReferenceTerms": {
            name: "Add new Reference Terms to Existing Concepts",
            url: Bahmni.Common.Constants.updateReferenceTermsImportUrl
        },
        "relationship": { name: "Relationship Information", url: Bahmni.Common.Constants.relationshipImportUrl }
    };

    const fileUploaderOptions = {
        removeAfterUpload: true,
        formData: [
            { patientMatchingAlgorithm: patientMatchingAlgorithm }
        ]
    };

    const loadImportedItems = () => {
        spinner.forPromise(adminImportService.getAllStatus().then((response) => {
            setImportedItems(response.data.map((item) => new Bahmni.Admin.ImportedItem(item)));
        }));
    };

    useEffect(() => {
        const configUrlMap = adminCSVExtension.urlMap;
        if (configUrlMap && Object.keys(configUrlMap).length > 0) {
            setUrlMaps(configUrlMap);
        } else {
            setUrlMaps(defaultUrlMap);
        }
        loadImportedItems();
    }, []);

    const handleBeforeUpload = (item) => {
        item.url = urlMaps[selectedOption].url;
    };

    return (
        <div>
            <select value={selectedOption} onChange={(e) => setSelectedOption(e.target.value)}>
                {Object.keys(urlMaps).map((key) => (
                    <option key={key} value={key}>{urlMaps[key].name}</option>
                ))}
            </select>
            <FileUploader
                options={fileUploaderOptions}
                onBeforeUploadItem={handleBeforeUpload}
                onCompleteAll={loadImportedItems}
            />
            <div>
                {importedItems.map((item, index) => (
                    <div key={index}>{item.name}</div>
                ))}
            </div>
        </div>
    );
};

export default CSVUploadController;
