import axios from 'axios';
import { adminImportStatusUrl } from '../utils/constants/adminImportConstants';

class AdminImportService {
    getAllStatus(numberOfDays: number): Promise<any> {
        return axios.get(adminImportStatusUrl, {
            params: { numberOfDays: numberOfDays }
        });
    }
}

export default new AdminImportService();
