import React, { useState } from 'react';
import axios from 'axios';
import { BahmniCommonConstants } from '../utils/constants/BahmniCommonConstants';

const CSVExportController: React.FC = () => {
    const [appExtensions, setAppExtensions] = useState<any[]>([]);
    const [conceptNameInvalid, setConceptNameInvalid] = useState<boolean>(false);
    const [conceptSet, setConceptSet] = useState<string | null>(null);

    const getConcepts = async (request: { term: string }) => {
        try {
            const result = await axios.get(BahmniCommonConstants.conceptUrl, {
                params: { q: request.term, v: "custom:(uuid,name)" }
            });
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
            window.open(BahmniCommonConstants.conceptSetExportUrl.replace(":conceptName", conceptSet));
        }
    };

    return (
        <div>

            <input
                type="text"
                placeholder="Enter concept name"
                onChange={(e) => setConceptSet(e.target.value)}
            />
            <button onClick={onConceptSelected}>Export</button>
        </div>
    );
};

export default CSVExportController;
