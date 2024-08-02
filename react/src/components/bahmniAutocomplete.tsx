import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Autocomplete } from '@material-ui/lab';
import TextField from '@material-ui/core/TextField';

interface BahmniAutocompleteProps {
    source: (params: { elementId: string, term: string, elementType: string }) => Promise<any>;
    responseMap?: (data: any) => any;
    onSelect: (item: any) => void;
    onEdit?: (item: any) => void;
    minLength?: number;
    blurOnSelect?: boolean;
    strictSelect?: boolean;
    validationMessage?: string;
    initialValue?: string;
}

const BahmniAutocomplete: React.FC<BahmniAutocompleteProps> = ({
    source,
    responseMap,
    onSelect,
    onEdit,
    minLength = 2,
    blurOnSelect = false,
    strictSelect = false,
    validationMessage,
    initialValue = ''
}) => {
    const { t } = useTranslation();
    const [inputValue, setInputValue] = useState(initialValue);
    const [selectedValue, setSelectedValue] = useState(initialValue);
    const [isInvalid, setIsInvalid] = useState(false);
    const [options, setOptions] = useState<any[]>([]);

    useEffect(() => {
        if (initialValue) {
            setSelectedValue(initialValue);
            setIsInvalid(false);
        }
    }, [initialValue]);

    const validateIfNeeded = (value: string) => {
        if (!strictSelect) {
            return;
        }
        setIsInvalid(value !== selectedValue);
        if (!value) {
            setIsInvalid(false);
        }
    };

    const handleInputChange = async (event: React.ChangeEvent<{}>, value: string) => {
        setInputValue(value);
        if (value.length >= minLength) {
            const data = await source({ elementId: '', term: value, elementType: '' });
            const results = responseMap ? responseMap(data) : data;
            setOptions(results);
        }
    };

    const handleSelect = (event: React.ChangeEvent<{}>, value: any) => {
        setSelectedValue(value);
        onSelect(value);
        validateIfNeeded(value);
        if (blurOnSelect) {

            (document.activeElement as HTMLElement)?.blur();
        }
    };

    const handleBlur = () => {
        validateIfNeeded(inputValue);
    };

    return (
        <Autocomplete
            value={selectedValue}
            inputValue={inputValue}
            onInputChange={handleInputChange}
            onChange={handleSelect}
            options={options}
            renderInput={(params) => (
                <TextField
                    {...params}
                    error={isInvalid}
                    helperText={isInvalid ? (validationMessage || t('SELECT_VALUE_FROM_AUTOCOMPLETE_DEFAULT_MESSAGE')) : ''}
                    onBlur={handleBlur}
                />
            )}
        />
    );
};

export default BahmniAutocomplete;
