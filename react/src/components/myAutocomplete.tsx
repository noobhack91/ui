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
        if (inputValue.length >= 2) {
            source(id, inputValue, itemType).then((data) => {
                const results = responseMap ? responseMap(data.data) : data.data;
                setOptions(results);
            });
        }
    }, [inputValue, id, itemType, source, responseMap]);

    const handleInputChange = (event: React.ChangeEvent<{}>, value: string) => {
        setInputValue(value);
        if (onChange) {
            onChange(value);
        }
    };

    const handleSelect = (event: React.ChangeEvent<{}>, value: any) => {
        if (onSelect) {
            onSelect(value);
        }
    };

    return (
        <Autocomplete
            inputValue={inputValue}
            onInputChange={handleInputChange}
            onChange={handleSelect}
            options={options}
            getOptionLabel={(option) => option.label || option.value || ''}
            renderInput={(params) => <TextField {...params} label="Search" variant="outlined" />}
        />
    );
};

export default MyAutocomplete;
