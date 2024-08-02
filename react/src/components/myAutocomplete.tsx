import React, { useState, useEffect } from 'react';
import { Autocomplete } from '@material-ui/lab';
import TextField from '@material-ui/core/TextField';

interface MyAutocompleteProps {
    id: string;
    itemType: string;
    source: (id: string, term: string, itemType: string) => Promise<any>;
    responseMap?: (data: any) => any;
    onSelect?: (item: any) => void;
    onChange?: (value: string) => void;
}

const MyAutocomplete: React.FC<MyAutocompleteProps> = ({ id, itemType, source, responseMap, onSelect, onChange }) => {
    const [inputValue, setInputValue] = useState('');
    const [options, setOptions] = useState<any[]>([]);

    useEffect(() => {
        if (inputValue.length < 2) {
            setOptions([]);
            return;
        }

        const fetchOptions = async () => {
            try {
                const data = await source(id, inputValue, itemType);
                const results = responseMap ? responseMap(data) : data;
                setOptions(results);
            } catch (error) {
                console.error('Error fetching autocomplete options:', error);
            }
        };

        fetchOptions();
    }, [inputValue, id, itemType, source, responseMap]);

    return (
        <Autocomplete
            freeSolo
            options={options}
            getOptionLabel={(option) => option.label || option.value || ''}
            onInputChange={(event, newInputValue) => {
                setInputValue(newInputValue);
                if (onChange) {
                    onChange(newInputValue);
                }
            }}
            onChange={(event, value) => {
                if (onSelect && value) {
                    onSelect(value);
                }
            }}
            renderInput={(params) => (
                <TextField
                    {...params}
                    label="Search"
                    variant="outlined"
                    fullWidth
                />
            )}
        />
    );
};

export default MyAutocomplete;
