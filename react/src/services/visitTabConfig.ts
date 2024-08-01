import axios from 'axios';
import { useState, useEffect } from 'react';
import { Bahmni } from '../utils/constants/bahmni';
import { _ } from 'lodash';

interface Section {
    title: string;
    displayOrder: number;
    type: string;
}

interface Tab {
    sections: Section[];
    defaultSections?: boolean;
    defaultSectionsExcludes?: string[];
}

interface VisitTabConfig {
    tabs: Tab[];
}

const useVisitTabConfig = () => {
    const [visitTabConfig, setVisitTabConfig] = useState<VisitTabConfig | null>(null);

    const loadMandatoryConfig = async () => {
        const response = await axios.get(Bahmni.Clinical.Constants.mandatoryVisitConfigUrl);
        return response.data;
    };

    const loadConfig = async (name: string) => {
        const response = await axios.get(`${Bahmni.Common.Constants.baseUrl}/${name}`);
        return response.data;
    };

    const load = async () => {
        try {
            const [mandatoryConfig, config] = await Promise.all([loadMandatoryConfig(), loadConfig('visit.json')]);

            mandatoryConfig.sections = _.sortBy(mandatoryConfig.sections, (section: Section) => section.displayOrder);

            for (const tab in config) {
                const sortedSections = _.sortBy(config[tab].sections, (section: Section) => section.displayOrder);
                if (sortedSections.length > 0) {
                    config[tab].sections = sortedSections;
                }
            }

            const mandatorySections = _.map(_.values(mandatoryConfig.sections), (item: Section) => {
                return _.assign(item, _.find(_.values(config[0].sections), ['type', item.type]));
            });

            config[0].sections = _.unionWith(_.values(mandatorySections), _.values(config[0].sections), _.isEqual);

            const tabWithDefaultSectionsExcludes = _.find(config, (tab: Tab) => tab.defaultSectionsExcludes);
            const excludedDefaultSections = tabWithDefaultSectionsExcludes ? tabWithDefaultSectionsExcludes.defaultSectionsExcludes : [];
            config[0].sections = _.filter(config[0].sections, (section: Section) => !excludedDefaultSections.includes(section.type));

            config[0].sections = _.sortBy(config[0].sections, (section: Section) => section.displayOrder);

            setVisitTabConfig({ tabs: config });
        } catch (error) {
            console.error('Error loading visit tab config:', error);
        }
    };

    useEffect(() => {
        load();
    }, []);

    return visitTabConfig;
};

export default useVisitTabConfig;
