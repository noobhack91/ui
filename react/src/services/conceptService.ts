import axios from 'axios';
import { uniqBy, partial, get, map } from 'lodash';

class ConceptMapper {
    map(concept: any) {
        // Implement the mapping logic here
        return concept;
    }
}

const conceptMapper = new ConceptMapper();

const mapConceptOrGetDrug = (conceptAnswer: any) => {
    return conceptAnswer.concept ? conceptMapper.map(conceptAnswer.concept) : conceptAnswer.drug;
};

const getAnswersForConceptName = async (request: any) => {
    const params = {
        q: request.term,
        question: request.answersConceptName,
        v: "custom:(concept:(uuid,name:(display,uuid,name,conceptNameType),names:(display,uuid,name,conceptNameType)),drug:(uuid,name,display))",
        s: "byQuestion"
    };
    try {
        const response = await axios.get('/bahmniConceptAnswerUrl', { params });
        const conceptAnswers = get(response, 'data.results');
        return uniqBy(map(conceptAnswers, mapConceptOrGetDrug), 'uuid');
    } catch (error) {
        console.error('Error fetching concept answers:', error);
        throw error;
    }
};

const getAnswers = async (defaultConcept: any) => {
    const response = uniqBy(map(defaultConcept.answers, conceptMapper.map), 'uuid');
    return Promise.resolve(response);
};

export const conceptService = {
    getAnswersForConceptName,
    getAnswers
};
