import React, { useEffect, useState } from 'react';
import { drugService } from '../services/drugService';
import { useTranslation } from 'react-i18next';
import { Spinner } from 'react-bootstrap';

interface ChronicTreatmentChartProps {
    patient: any;
    section: any;
    isOnDashboard: boolean;
    enrollment: string;
}

const ChronicTreatmentChart: React.FC<ChronicTreatmentChartProps> = ({ patient, section, isOnDashboard, enrollment }) => {
    const [regimen, setRegimen] = useState<any>({});
    const { t } = useTranslation();

    useEffect(() => {
        const init = async () => {
            try {
                const data = await drugService.getRegimen(patient.uuid, enrollment, section.config.drugs);
                const sortedData = section.dateSort === "desc" ? { headers: data.headers, rows: data.rows.reverse() } : data;
                if (!sortedData.rows.length) {
                    // Emit no-data-present-event equivalent in React
                    const event = new CustomEvent("no-data-present-event");
                    window.dispatchEvent(event);
                }
                filterNullRow(sortedData);
                setRegimen(sortedData);
            } catch (error) {
                console.error('Error fetching regimen:', error);
            }
        };

        const filterNullRow = (data: any) => {
            data.rows = data.rows.filter((row: any) => {
                return row.drugs.some((drug: any) => drug);
            });
        };

        init();
    }, [patient.uuid, enrollment, section.config.drugs, section.dateSort]);

    const getAbbreviation = (concept: any) => {
        let result;

        if (concept && concept.mappings && concept.mappings.length > 0 && section.headingConceptSource) {
            result = concept.mappings.find((mapping: any) => mapping.source === section.headingConceptSource)?.code;
            result = t(result);
        }

        return result || concept.shortName || concept.name;
    };

    const isMonthNumberRequired = () => {
        return regimen && regimen.rows && regimen.rows[0] && regimen.rows[0].month;
    };

    const isClickable = () => {
        return isOnDashboard && section.expandedViewConfig;
    };

    return (
        <div>
            <Spinner animation="border" role="status">
                <span className="sr-only">Loading...</span>
            </Spinner>

            <div>
                {regimen.headers && (
                    <div className="regimen-headers">
                        {regimen.headers.map((header: any, index: number) => (
                            <div key={index} className="regimen-header">
                                {header}
                            </div>
                        ))}
                    </div>
                )}
                {regimen.rows && regimen.rows.length > 0 ? (
                    <div className="regimen-rows">
                        {regimen.rows.map((row: any, rowIndex: number) => (
                            <div key={rowIndex} className="regimen-row">
                                {row.drugs.map((drug: any, drugIndex: number) => (
                                    <div key={drugIndex} className="regimen-drug">
                                        {getAbbreviation(drug.concept)}
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="no-data">
                        {t('No data available')}
                    </div>
                )}
            <div>
                {regimen.rows && regimen.rows.length > 0 ? (
                    <div className="regimen-rows">
                        {regimen.rows.map((row: any, rowIndex: number) => (
                            <div key={rowIndex} className="regimen-row">
                                {row.drugs.map((drug: any, drugIndex: number) => (
                                    <div key={drugIndex} className="regimen-drug">
                                        {getAbbreviation(drug.concept)}
                        
                                ))}
                
                        ))}
        
                ) : (
                    <div className="no-data">
                        {t('No data available')}
        
                )}
    );
};

export default ChronicTreatmentChart;
