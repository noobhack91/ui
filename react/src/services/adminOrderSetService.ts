import axios from 'axios';
import { BahmniConstants } from '../utils/constants/BahmniConstants';

class AdminOrderSetService {
    getAllOrderSets() {
        return axios.get(BahmniConstants.orderSetUrl, {
            params: { v: "full" }
        });
    }

    getOrderSet(uuid: string) {
        return axios.get(`${BahmniConstants.orderSetUrl}/${uuid}`, {
            params: { v: "full" }
        });
    }

    createOrUpdateOrderSet(orderSet: any) {
        let url: string;
        orderSet.orderSetMembers.forEach((orderSetMember: any) => {
            if (orderSetMember.orderTemplate) {
                orderSetMember.orderTemplate = JSON.stringify(orderSetMember.orderTemplate);
            }
        });
        if (orderSet.uuid) {
            url = `${BahmniConstants.orderSetUrl}/${orderSet.uuid}`;
        } else {
            url = BahmniConstants.orderSetUrl;
        }
        return axios.post(url, orderSet, {
            withCredentials: true,
            headers: { "Accept": "application/json", "Content-Type": "application/json" }
        });
    }

    removeOrderSet(orderSet: any) {
        const req = {
            url: `${BahmniConstants.orderSetUrl}/${orderSet.uuid}`,
            content: {
                "!purge": "",
                "reason": "User deleted the orderSet."
            },
            headers: { "Content-Type": "application/json" }
        };
        return axios.delete(req.url, { data: req.content, headers: req.headers });
    }

    getDrugConfig() {
        return axios.get(BahmniConstants.drugOrderConfigurationUrl, {
            withCredentials: true
        }).then(result => {
            const config = result.data;
            return config;
        });
    }
}

export default new AdminOrderSetService();
