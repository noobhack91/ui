import React, { useEffect } from 'react';

interface VisitDate {
    startDatetime?: string;
    stopDatetime?: string;
}

interface DateValidatorProps {
    newVisit: VisitDate;
    isNewVisitDateValid: () => boolean;
    dependentModel: any;
    onValidityChange: (validity: { overlap: boolean; future: boolean; dateSequence: boolean }) => void;
}

const DateUtil = {
    getDate: (dateString: string) => new Date(dateString)
};

const isVisitDateFromFuture = (visitDate: VisitDate) => {
    if (!visitDate.startDatetime && !visitDate.stopDatetime) {
        return false;
    }
    return (DateUtil.getDate(visitDate.startDatetime) > new Date() || (DateUtil.getDate(visitDate.stopDatetime) > new Date()));
};

const isStartDateBeforeEndDate = (visitDate: VisitDate) => {
    if (!visitDate.startDatetime || !visitDate.stopDatetime) {
        return true;
    }
    return (DateUtil.getDate(visitDate.startDatetime) <= DateUtil.getDate(visitDate.stopDatetime));
};

const DateValidator: React.FC<DateValidatorProps> = ({ newVisit, isNewVisitDateValid, dependentModel, onValidityChange }) => {
    useEffect(() => {
        const validate = () => {
            const overlap = isNewVisitDateValid();
            const future = !isVisitDateFromFuture(newVisit);
            const dateSequence = isStartDateBeforeEndDate(newVisit);

            onValidityChange({ overlap, future, dateSequence });
        };

        validate();
    }, [newVisit, dependentModel, isNewVisitDateValid, onValidityChange]);

    return null;
};

export default DateValidator;
