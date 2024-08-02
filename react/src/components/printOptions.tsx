import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { registrationCardPrinter } from '../services/registrationCardPrinter';
import { appService } from '../services/appService';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';

interface PrintOptionsProps {
    patient: any;
    encounterDateTime: Date;
    observations: any[];
}

const PrintOptions: React.FC<PrintOptionsProps> = ({ patient, encounterDateTime, observations }) => {
    const { t } = useTranslation();
    const [printOptions, setPrintOptions] = useState<any[]>([]);
    const [defaultPrint, setDefaultPrint] = useState<any>(null);
    const facilityVisitLocation = useSelector((state: any) => state.facilityVisitLocation);
    const loggedInLocation = useSelector((state: any) => state.loggedInLocation);

    useEffect(() => {
        const options = appService.getAppDescriptor().getConfigValue("printOptions");
        setPrintOptions(options);
        setDefaultPrint(options && options[0]);
    }, []);

    const mapRegistrationObservations = () => {
        const obs: any = {};
        const getValue = (observation: any) => {
            obs[observation.concept.name] = obs[observation.concept.name] || [];
            if (observation.value) {
                obs[observation.concept.name].push(observation.value);
            }
            observation.groupMembers.forEach(getValue);
        };

        observations.forEach(getValue);
        return obs;
    };

    const print = (option: any) => {
        const location = facilityVisitLocation || loggedInLocation;
        let locationAddress = "";
        const attributeDisplay = location.attributes[0] ? location.attributes[0].display.split(": ") : null;
        if (attributeDisplay && attributeDisplay[0] === 'Certificate Header') {
            locationAddress = attributeDisplay[1];
        }
        return registrationCardPrinter.print(option.templateUrl, patient, mapRegistrationObservations(), encounterDateTime, { "name": location.name, "address": locationAddress });
    };

    const buttonText = (option: any, type: boolean) => {
        const optionValue = option && t(option);
        const printHtml = type ? '<i className="fa fa-print"></i>' : '';
        return `<span>${optionValue}</span>${printHtml}`;
    };

    return (
        <div>
            {printOptions.map((option, index) => (
                <button key={index} onClick={() => print(option)}>
                    <span dangerouslySetInnerHTML={{ __html: buttonText(option, true) }} />
                </button>
            ))}
        </div>
    );
};

export default PrintOptions;
