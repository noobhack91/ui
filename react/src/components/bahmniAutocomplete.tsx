import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';
import $ from 'jquery';
import 'jquery-ui/ui/widgets/autocomplete';

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
    const validationMsg = validationMessage || t("SELECT_VALUE_FROM_AUTOCOMPLETE_DEFAULT_MESSAGE");

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
        if (_.isEmpty(value)) {
            setIsInvalid(false);
        }
    };

    useEffect(() => {
        const element = $('#autocomplete-element');

        element.autocomplete({
            autofocus: true,
            minLength: minLength,
            source: (request, response) => {
                source({ elementId: element.attr('id') || '', term: request.term, elementType: element.attr('type') || '' })
                    .then(data => {
                        const results = responseMap ? responseMap(data) : data;
                        response(results);
                    });
            },
            select: (event, ui) => {
                setSelectedValue(ui.item.value);
                onSelect(ui.item);
                validateIfNeeded(ui.item.value);
                if (blurOnSelect) {
                    element.blur();
                }
                return true;
            },
            search: (event, ui) => {
                if (onEdit) {
                    onEdit(ui.item);
                }
                const searchTerm = $.trim(element.val() as string);
                validateIfNeeded(searchTerm);
                if (searchTerm.length < minLength) {
                    event.preventDefault();
                }
            }
        });

        const changeHandler = () => {
            validateIfNeeded(element.val() as string);
        };

        const keyUpHandler = () => {
            validateIfNeeded(element.val() as string);
        };

        element.on('change', changeHandler);
        element.on('keyup', keyUpHandler);

        return () => {
            element.off('change', changeHandler);
            element.off('keyup', keyUpHandler);
        };
    }, [source, responseMap, onSelect, onEdit, minLength, blurOnSelect, strictSelect]);

    useEffect(() => {
        const element = document.getElementById('autocomplete-element') as HTMLInputElement;
        if (element) {
            element.setCustomValidity(isInvalid ? validationMsg : '');
        }
    }, [isInvalid, validationMsg]);

    return (
        <input
            id="autocomplete-element"
            type="text"
            className={isInvalid ? 'invalid' : ''}
            defaultValue={initialValue || ''}
        />
    );
};

export default BahmniAutocomplete;
