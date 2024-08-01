import axios from 'axios';

class LoadConfigService {
    loadConfig(url: string) {
        return axios.get(url, { withCredentials: true });
    }
}

export default new LoadConfigService();
