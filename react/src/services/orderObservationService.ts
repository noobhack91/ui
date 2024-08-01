import { encounterService } from './encounterService';

interface Observation {
    orderUuid?: string;
    groupMembers?: Observation[];
}

interface Order {
    bahmniObservations?: Observation[];
    orderUuid?: string;
}

interface Patient {
    uuid: string;
}

class OrderObservationService {
    private addOrderUuidToObservation(observation: Observation, orderUuid: string) {
        observation.orderUuid = orderUuid;
        if (observation.groupMembers && observation.groupMembers.length > 0) {
            observation.groupMembers.forEach((member) => {
                this.addOrderUuidToObservation(member, orderUuid);
            });
        }
    }

    public async save(orders: Order[], patient: Patient, locationUuid: string) {
        const observations: Observation[] = [];

        orders.forEach((order) => {
            if (order.bahmniObservations) {
                order.bahmniObservations.forEach((obs) => {
                    this.addOrderUuidToObservation(obs, order.orderUuid!);
                });

                const orderObs = JSON.parse(JSON.stringify(order.bahmniObservations));
                observations.push(...orderObs);
            }
        });

        const encounterData = {
            locationUuid: locationUuid,
            patientUuid: patient.uuid,
            observations: observations,
            orders: [],
            drugOrders: []
        };

        return encounterService.create(encounterData);
    }
}

export const orderObservationService = new OrderObservationService();
