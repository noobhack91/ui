import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

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
    initialValue
}) => {
    const { t } = useTranslation();
    const [selectedValue, setSelectedValue] = useState<string | null>(initialValue || null);
    const [isInvalid, setIsInvalid] = useState<boolean>(false);
    const [inputValue, setInputValue] = useState<string>(initialValue || '');

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

    const handleSelect = (item: any) => {
        setSelectedValue(item.value);
        onSelect(item);
        validateIfNeeded(item.value);
        if (blurOnSelect) {

            (document.activeElement as HTMLElement)?.blur();
        }
    };

    const handleSearch = async (term: string) => {
        const data = await source({ elementId: '', term, elementType: '' });
        return responseMap ? responseMap(data) : data;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setInputValue(value);
        validateIfNeeded(value);
    };

    const handleKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
        validateIfNeeded(inputValue);
    };

    return (
        <div>
            <input
                type="text"
                value={inputValue}
                onChange={handleChange}

                onBlur={() => {
                    if (blurOnSelect) {
                        (document.activeElement as HTMLElement).blur();
                    }
                }}
                onFocus={() => {
                    if (onEdit) {
                        onEdit({ value: inputValue });
                    }
                }}
                onInput={(e) => {
                    const value = (e.target as HTMLInputElement).value;
                    if (value.length >= minLength) {
                        handleSearch(value).then((results) => {
                            // Handle the autocomplete results here
                            const dropdown = document.createElement('ul');
                            dropdown.className = 'autocomplete-dropdown';
                            
                            results.forEach((result: any) => {

                onKeyUp={handleKeyUp}
                onChange={handleChange}
                                item.className = 'autocomplete-item';
                                item.textContent = result.label || result.value;
                                item.onclick = () => handleSelect(result);
                                dropdown.appendChild(item);
                            });
                            
                            const existingDropdown = document.querySelector('.autocomplete-dropdown');
                            if (existingDropdown) {
                                existingDropdown.remove();
                            }
                            
                            document.body.appendChild(dropdown);
                    }
                }}

                onKeyUp={handleKeyUp}
                onChange={handleChange}
                placeholder={t("SEARCH_PLACEHOLDER")}
                aria-invalid={isInvalid}
                aria-describedby="autocomplete-validation-message"
                autoComplete="off"
            />
            {isInvalid && <div>{validationMessage || t("SELECT_VALUE_FROM_AUTOCOMPLETE_DEFAULT_MESSAGE")}</div>}
        </div>
    );
};

export default BahmniAutocomplete;
