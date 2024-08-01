import { AxiosResponse } from 'axios';
import conceptSetService from './conceptSetService';
import clinicalAppConfigService from './clinicalAppConfigService';
import { Bahmni } from '../utils/constants';

class OtherTestsProvider {
    private orderTypesMap: any;
    private mapper: any;

    constructor() {
        const orderTypesMapConfig = clinicalAppConfigService.getOtherInvestigationsMap();
        this.orderTypesMap = orderTypesMapConfig ? orderTypesMapConfig.value : {};
        this.mapper = new Bahmni.OtherInvestigationsConceptsMapper(this.orderTypesMap);
    }

    async getTests(): Promise<any> {
        try {
            const otherInvestigationsConceptPromise = conceptSetService.getConcept({
                name: Bahmni.Clinical.Constants.otherInvestigationsConceptSetName,
                v: "fullchildren"
            }, true);

            const categoriesConceptPromise = conceptSetService.getConcept({
                name: Bahmni.Clinical.Constants.otherInvestigationCategoriesConceptSetName,
                v: "custom:(uuid,setMembers:(uuid,name,setMembers:(uuid,name)))"
            }, true);

            const results: [AxiosResponse<any>, AxiosResponse<any>] = await Promise.all([otherInvestigationsConceptPromise, categoriesConceptPromise]);

            const otherInvestigationConcept = results[0].data.results[0];
            const labDepartmentsSet = results[1].data.results[0];
            const tests = this.mapper.map(otherInvestigationConcept, labDepartmentsSet);

            return tests;
        } catch (error) {
            throw new Error(`Error fetching tests: ${error.message}`);
        }
    }
}

export default new OtherTestsProvider();
