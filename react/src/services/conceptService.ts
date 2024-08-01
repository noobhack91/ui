import axios from 'axios';
import { uniqBy, partial, get, map } from 'lodash';
import { Bahmni } from '../utils/constants/Bahmni';

class ConceptMapper {
    map(concept: any) {

        if (!concept) {
            throw new Error('Concept is required');
        }

        return {
            uuid: concept.uuid,
            display: concept.name?.display || '',
            names: concept.names?.map((name: any) => ({
                uuid: name.uuid,
                name: name.name,
                conceptNameType: name.conceptNameType
            })) || [],
            conceptNameType: concept.name?.conceptNameType || ''
        };
    }
        return concept;
    }
}

const conceptMapper = new ConceptMapper();

const mapConceptOrGetDrug = (conceptAnswer: any) => {
    return conceptAnswer.concept && conceptMapper.map(conceptAnswer.concept) || conceptAnswer.drug;
};

export const getAnswersForConceptName = async (request: any) => {
    const params = {
        q: request.term,
        question: request.answersConceptName,
        v: "custom:(concept:(uuid,name:(display,uuid,name,conceptNameType),names:(display,uuid,name,conceptNameType)),drug:(uuid,name,display))",
        s: "byQuestion"
    };
    try {
        const response = await axios.get(Bahmni.Common.Constants.bahmniConceptAnswerUrl, { params });
        const conceptAnswers = get(response, 'data.results');
        return uniqBy(map(conceptAnswers, mapConceptOrGetDrug), 'uuid');
    } catch (error) {
        console.error('Error fetching concept answers:', error);
        throw error;
    }
};

export const getAnswers = async (defaultConcept: any) => {
    const response = uniqBy(map(defaultConcept.answers, conceptMapper.map), 'uuid');
    return Promise.resolve(response);
};
