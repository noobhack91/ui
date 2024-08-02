import axios from 'axios';

interface ConsultationNoteConceptConfig {
    results: any[];
}

export const getConsultationNoteConcept = async (): Promise<any> => {
    try {
        const response = await axios.get<ConsultationNoteConceptConfig>('/path/to/consultationNoteConfig');
        const config = response.data;
        return config.results && config.results[0] ? config.results[0] : [];
    } catch (error) {
        console.error('Error fetching consultation note concept config:', error);
        return [];
    }
};
