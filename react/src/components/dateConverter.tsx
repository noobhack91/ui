import React, { useState } from 'react';
import { parse, getDateWithoutTime } from '../utils/dateUtil';

interface DateConverterProps {
    value: string;
    onChange: (date: string) => void;
}

const DateConverter: React.FC<DateConverterProps> = ({ value, onChange }) => {
    const [date, setDate] = useState<string>(parse(value));

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newDate = event.target.value;
        setDate(newDate);
        onChange(parse(newDate));
    };

    return (
        <input
            type="text"
            value={getDateWithoutTime(date)}
            onChange={handleChange}
        />
    );
};

export default DateConverter;
