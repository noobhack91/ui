import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { uniqBy, partial, get, map, includes, toLower, find, trim } from 'lodash';
import { Bahmni } from '../utils/constants/Bahmni';
import { getAnswersForConceptName, getAnswers } from '../services/conceptService';

interface Concept {
    uuid: string;
    name: string;
    names: { uuid: string; name: string; conceptNameType: string }[];
}

interface AutocompleteProps {
    illegalValue?: boolean;
    defaultConcept?: any;
    answersConceptName?: string;
    minLength?: number;
    blurOnSelect?: boolean;
    strictSelect?: boolean;
    previousValue?: string;
    onChange: (value: any) => void;
}

const constructSearchResult = (concept: Concept, searchString: string) => {
    let matchingName: string | null = null;
    const conceptName = concept.name;
    if (!includes(toLower(conceptName), toLower(searchString))) {
        const synonyms = map(concept.names, 'name');
        matchingName = find(synonyms, (name) => {
            return name !== conceptName && name.search(new RegExp(searchString, 'i')) !== -1;
        });
    }
    return {
        label: matchingName ? `${matchingName} => ${conceptName}` : conceptName,
        value: conceptName,
        concept: concept,
        uuid: concept.uuid,
        name: conceptName,
    };
};

const searchWithDefaultConcept = async (searchMethod: () => Promise<any>, searchTerm: string) => {
    const searchString = searchTerm.split(' ');
    const isMatching = (answer: any) => {
        const nestedConceptNameFound = find(answer.names, (name: any) => {
            return includes(toLower(name.name), searchTerm);
        });
        let flag = true;
        let conceptNameFound;
        searchString.forEach((string) => {
            conceptNameFound = includes(toLower(answer.name), string);
            flag = flag && conceptNameFound;
        });
        return nestedConceptNameFound || (conceptNameFound && flag);
    };
    const responseMap = partial(constructSearchResult, _, searchTerm);

    const results = await searchMethod();
    return map(filter(results, isMatching), responseMap);
};

const searchWithGivenConcept = async (searchMethod: () => Promise<any>, searchTerm: string) => {
    const responseMap = partial(constructSearchResult, _, searchTerm);
    const results = await searchMethod();
    return map(results, responseMap);
};

const ConceptAutocomplete: React.FC<AutocompleteProps> = ({
    illegalValue,
    defaultConcept,
    answersConceptName,
    minLength = 2,
    blurOnSelect,
    strictSelect,
    previousValue,
    onChange,
}) => {
    const [value, setValue] = useState<string>('');
    const [suggestions, setSuggestions] = useState<any[]>([]);

    useEffect(() => {
        const searchTerm = trim(value);
        if (searchTerm.length < minLength) {
            return;
        }

        const searchMethod = !answersConceptName && defaultConcept
            ? partial(getAnswers, defaultConcept)
            : partial(getAnswersForConceptName, { term: searchTerm, answersConceptName });

        const searchFunction = !answersConceptName && defaultConcept
            ? searchWithDefaultConcept
            : searchWithGivenConcept;

        searchFunction(searchMethod, searchTerm).then(setSuggestions);
    }, [value, answersConceptName, defaultConcept, minLength]);

    const handleSelect = (item: any) => {
        setValue(item.value);
        onChange(item);
        if (blurOnSelect) {

            const inputElement = document.querySelector('input');
            if (inputElement) {
                inputElement.blur();
            }
        }
    };

            setValue('');
            onChange(null);
            // Optionally, you can add a class to indicate an illegal value
            // e.g., element.classList.add('illegalValue');
        }
    const handleBlur = () => {
        const searchTerm = trim(value);
        if (strictSelect && illegalValue && (isEmpty(searchTerm) || searchTerm === previousValue)) {

            setValue('');
            onChange(null);
            const inputElement = document.querySelector('input');
            if (inputElement) {
                inputElement.classList.add('illegalValue');
            }
        }
    };

    return (
        <div>
            <input
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onBlur={handleBlur}
            />
            <ul>
                {suggestions.map((item) => (
                    <li key={item.uuid} onClick={() => handleSelect(item)}>
                        {item.label}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ConceptAutocomplete;
