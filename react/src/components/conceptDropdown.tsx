import React, { useEffect, useState } from 'react';
import { getAnswers, getAnswersForConceptName } from '../services/conceptService';

interface ConceptDropdownProps {
    selectedAnswer: any;
    answersConceptName?: string;
    defaultConcept: any;
    onChange: () => void;
    onInvalidClass?: string;
    isValid: boolean;
    ngDisabled: boolean;
}

const constructSearchResult = (concept: any) => {
    const conceptName = concept.shortName || concept.name.name || concept.name;
    return {
        label: conceptName,
        value: conceptName,
        concept: concept,
        uuid: concept.uuid,
        name: conceptName
    };
};

const find = (allAnswers: any[], savedAnswer: any) => {
    return allAnswers.find(answer => savedAnswer && (savedAnswer.uuid === answer.concept.uuid));
};

const ConceptDropdown: React.FC<ConceptDropdownProps> = ({
    selectedAnswer,
    answersConceptName,
    defaultConcept,
    onChange,
    onInvalidClass,
    isValid,
    ngDisabled
}) => {
    const [answers, setAnswers] = useState<any[]>([]);
    const [selected, setSelected] = useState<any>(selectedAnswer);

    useEffect(() => {
        const fetchAnswers = async () => {
            if (!answersConceptName && defaultConcept) {
                const results = await getAnswers(defaultConcept);
                setAnswers(results.map(constructSearchResult));
            } else {
                const results = await getAnswersForConceptName({ answersConceptName });
                setAnswers(results.map(constructSearchResult));
            }
        };

        fetchAnswers();
    }, [answersConceptName, defaultConcept]);

    useEffect(() => {
        setSelected(find(answers, selectedAnswer));
    }, [answers, selectedAnswer]);

    const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedValue = event.target.value;
        const selectedOption = answers.find(answer => answer.value === selectedValue);
        setSelected(selectedOption);
        onChange();
    };

    return (
        <div className={`concept-dropdown ${onInvalidClass} ${isValid ? '' : 'invalid'}`}>
            <select
                value={selected?.value || ''}
                onChange={handleChange}
                disabled={ngDisabled}
            >
                {answers.map(answer => (
                    <option key={answer.uuid} value={answer.value}>
                        {answer.label}
                    </option>
                ))}
            </select>
        </div>
    );
};

export default ConceptDropdown;
