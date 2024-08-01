import React, { useState } from 'react';
import axios from 'axios';
import { Button, Form, FormControl } from 'react-bootstrap';
import { BahmniConstants } from '../utils/constants/BahmniConstants';

const CSVExportController: React.FC = () => {
    const [conceptSet, setConceptSet] = useState<string | null>(null);
    const [conceptNameInvalid, setConceptNameInvalid] = useState<boolean>(false);
    const [appExtensions, setAppExtensions] = useState<any[]>([]);

    const getConcepts = async (request: { term: string }) => {
        try {
            const result = await axios.get(BahmniConstants.conceptUrl, { params: { q: request.term, v: "custom:(uuid,name)" } });
            return result.data.results;
        } catch (error) {
            console.error('Error fetching concepts:', error);
            return [];
        }
    };

    const getDataResults = (results: any[]) => {
        return results.map(concept => ({
            concept: { uuid: concept.uuid, name: concept.name.name },
            value: concept.name.name
        }));
    };

    const onConceptSelected = () => {
        if (conceptSet) {
            window.open(BahmniConstants.conceptSetExportUrl.replace(":conceptName", conceptSet));
        }
    };

    return (
        <div>
            <h2>CSV Export</h2>
            <Form inline>
                <FormControl
                    type="text"
                    placeholder="Enter Concept Set"
                    className="mr-sm-2"
                    onChange={(e) => setConceptSet(e.target.value)}
                />
                <Button variant="outline-success" onClick={onConceptSelected}>Export</Button>
            </Form>
            {conceptNameInvalid && <p className="text-danger">Invalid Concept Name</p>}
            <div>
                {appExtensions.map((extension, index) => (
                    <div key={index}>
                        <a href={extension.url}>{extension.label}</a>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CSVExportController;
