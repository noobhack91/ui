import React, { useState } from 'react';

interface DateConverterProps {
    value: string;
    onChange: (date: string) => void;
}

const DateUtil = {
    parse: (date: string) => {
        // Implement the date parsing logic here
        return new Date(date).toISOString();
    },
    getDateWithoutTime: (date: string) => {
        // Implement the logic to get date without time here
        const parsedDate = new Date(date);
        return new Date(parsedDate.getFullYear(), parsedDate.getMonth(), parsedDate.getDate()).toISOString();
    }
};

const DateConverter: React.FC<DateConverterProps> = ({ value, onChange }) => {
    const [date, setDate] = useState<string>(DateUtil.parse(DateUtil.getDateWithoutTime(value)));

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newDate = event.target.value;
        setDate(newDate);
        onChange(DateUtil.parse(newDate));
    };

    return (
        <input
            type="date"
            value={date}
            onChange={handleChange}
        />
    );
};

export default DateConverter;
