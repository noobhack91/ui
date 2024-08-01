import axios from 'axios';
import { BahmniCommonConstants } from '../utils/constants/BahmniCommonConstants';

class QueryService {
    getResponseFromQuery(params: any) {
        return axios.get(BahmniCommonConstants.sqlUrl, {
            params: params,
            withCredentials: true
        });
    }
}

export default new QueryService();
