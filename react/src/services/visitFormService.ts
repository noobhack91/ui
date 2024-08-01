import axios from 'axios';

const formData = async (patientUuid: string, numberOfVisits: number, formGroup?: string, patientProgramUuid?: string) => {
    const params = {
        s: "byPatientUuid",
        patient: patientUuid,
        numberOfVisits: numberOfVisits,
        v: "visitFormDetails",
        conceptNames: formGroup || null,
        patientProgramUuid: patientProgramUuid
    };

    try {
        const response = await axios.get('/openmrs/ws/rest/v1/formData', { params });
        return response.data;
    } catch (error) {
        console.error('Error fetching form data', error);
        throw error;
    }
};

export default {
    formData
};
