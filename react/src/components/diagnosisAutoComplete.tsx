import React, { useState } from 'react';
import axios from 'axios';
import Autocomplete from 'react-autocomplete';

interface DiagnosisAutoCompleteProps {
    source: (term: string) => Promise<any>;
    responseMap?: (data: any) => any;
    onSelect?: (index: number, lookup: any) => void;
    index: number;
}

const DiagnosisAutoComplete: React.FC<DiagnosisAutoCompleteProps> = ({ source, responseMap, onSelect, index }) => {
    const [value, setValue] = useState('');
    const [suggestions, setSuggestions] = useState<any[]>([]);

    const handleSource = async (term: string) => {
        try {
            const response = await source(term);
            const data = response.data;
            const results = responseMap ? responseMap(data) : data;
            setSuggestions(results);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const handleSelect = (value: string, item: any) => {
        setValue(value);
        if (onSelect) {
            onSelect(index, item.lookup);
        }
    };

    return (
        <Autocomplete
            getItemValue={(item) => item.value}
            items={suggestions}
            renderItem={(item, isHighlighted) =>
                <div key={item.value} style={{ background: isHighlighted ? 'lightgray' : 'white' }}>
                    {item.value}
                </div>
            }
            value={value}
            onChange={(e) => {
                const term = e.target.value;
                setValue(term);
                if (term.trim().length >= 2) {
                    handleSource(term);
                }
            }}
            onSelect={(val, item) => handleSelect(val, item)}
        />
    );
};

export default DiagnosisAutoComplete;
