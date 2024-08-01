import React, { useState, useEffect } from 'react';
import { FileUploader } from 'react-drag-drop-files';
import AdminImportService from '../services/adminImportService';
import useMessagingService from '../services/messagingService';
import { Spinner } from 'react-bootstrap';
import { Bahmni } from '../utils/constants/bahmni';

interface ImportedItem {
    // Define the structure of ImportedItem based on the AngularJS code
}

const CSVUploadController: React.FC = () => {
    const [importedItems, setImportedItems] = useState<ImportedItem[]>([]);
    const [selectedOption, setSelectedOption] = useState<string>('encounter');
    const [loading, setLoading] = useState<boolean>(false);
    const { showMessage } = useMessagingService();

    const urlMap = {
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

    const loadImportedItems = async () => {
        setLoading(true);
        try {
            const response = await AdminImportService.getAllStatus();
            setImportedItems(response.data.map((item: any) => new Bahmni.Admin.ImportedItem(item)));
        } catch (error) {
            showMessage('error', 'Failed to load imported items');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadImportedItems();
    }, []);

    const handleFileUpload = async (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('patientMatchingAlgorithm', ''); // Add the patientMatchingAlgorithm if needed

        setLoading(true);
        try {
            await fetch(urlMap[selectedOption].url, {
                method: 'POST',
                body: formData
            });
            loadImportedItems();
        } catch (error) {
            showMessage('error', 'File upload failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h1>CSV Upload</h1>
            <div>
                <label htmlFor="uploadOption">Select Upload Option:</label>
                <select
                    id="uploadOption"
                    value={selectedOption}
                    onChange={(e) => setSelectedOption(e.target.value)}
                >
                    {Object.keys(urlMap).map((key) => (
                        <option key={key} value={key}>
                            {urlMap[key].name}
                        </option>
                    ))}
                </select>
            </div>
            <FileUploader handleChange={handleFileUpload} name="file" />
            {loading && <Spinner animation="border" />}
            <div>
                <h2>Imported Items</h2>
                <ul>
                    {importedItems.map((item, index) => (
                        <li key={index}>{item.name}</li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default CSVUploadController;
