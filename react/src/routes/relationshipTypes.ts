// react/src/routes/relationshipTypes.ts

import axios from 'axios';

interface RelationshipTypeConfig {
    results: Array<{
        uuid: string;
        display: string;
    }>;
}

class Configurations {
    private configs: { [key: string]: any } = {};

    constructor() {
        this.loadConfigurations();
    }

    private async loadConfigurations() {
        try {
            const response = await axios.get('/path/to/configurations/endpoint');
            this.configs = response.data;
        } catch (error) {
            console.error('Error loading configurations:', error);
        }
    }

    public relationshipTypes(): Array<{ uuid: string; display: string }> {
        return this.configs.relationshipTypeConfig && this.configs.relationshipTypeConfig.results
            ? this.configs.relationshipTypeConfig.results
            : [];
    }
}

export default new Configurations();
