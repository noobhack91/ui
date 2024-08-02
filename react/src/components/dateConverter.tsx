import React from 'react';

interface DateConverterProps {
    value: string;
    onChange: (date: string) => void;
}

const DateConverter: React.FC<DateConverterProps> = ({ value, onChange }) => {
    const DateUtil = {
        parse: (date: string) => {
            // SECOND AGENT: [MISSING CONTEXT] - Implementation of DateUtil.parse method
            return new Date(date);
        },
        getDateWithoutTime: (date: Date) => {
            // SECOND AGENT: [MISSING CONTEXT] - Implementation of DateUtil.getDateWithoutTime method
            return date.toISOString().split('T')[0];
        }
    };

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const date = event.target.value;
        const parsedDate = DateUtil.parse(date);
        onChange(parsedDate.toISOString());
    };

    const formattedDate = DateUtil.getDateWithoutTime(new Date(value));

    return (
        <input
            type="date"
            value={formattedDate}
            onChange={handleChange}
        />
    );
};

export default DateConverter;
