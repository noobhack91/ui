import React, { useState, useEffect } from 'react';
import { contextChangeHandler } from '../services/contextChangeHandler';

interface DurationProps {
    hours: number;
    illegalValue: boolean;
    disabled: boolean;
    onChange: (value: number | undefined) => void;
}

const Duration: React.FC<DurationProps> = ({ hours, illegalValue, disabled, onChange }) => {
    const [measureValue, setMeasureValue] = useState<number | undefined>(undefined);
    const [unitValue, setUnitValue] = useState<number | undefined>(undefined);
    const [units, setUnits] = useState<{ [key: string]: number }>({});
    const [displayUnits, setDisplayUnits] = useState<{ name: string, value: number }[]>([]);

    useEffect(() => {
        const valueAndUnit = Bahmni.Common.Util.DateUtil.convertToUnits(hours);
        setUnits(valueAndUnit["allUnits"]);
        setMeasureValue(valueAndUnit["value"]);
        setUnitValue(valueAndUnit["unitValueInMinutes"]);
        const durations = Object.keys(valueAndUnit["allUnits"]).reverse();
        setDisplayUnits(durations.map(duration => ({ name: duration, value: valueAndUnit["allUnits"][duration] })));
    }, [hours]);

    useEffect(() => {
        const setValue = () => {
            if (unitValue && measureValue) {
                const value = unitValue * measureValue;
                onChange(value);
            } else {
                onChange(undefined);
            }
        };
        setValue();
    }, [measureValue, unitValue, onChange]);

    useEffect(() => {
        if (disabled) {
            setUnitValue(undefined);
            setMeasureValue(undefined);
        }
    }, [disabled]);

    useEffect(() => {
        const contextChange = () => ({ allow: !illegalValue });
        contextChangeHandler.add(contextChange);
        return () => {
            contextChangeHandler.remove(contextChange);
        };
    }, [illegalValue]);

    return (
        <span>
            <input
                tabIndex={1}
                style={{ float: 'left' }}
                type="number"
                min="0"
                className={`duration-value ${illegalValue ? 'illegalValue' : ''}`}
                value={measureValue || ''}
                onChange={e => setMeasureValue(Number(e.target.value))}
                disabled={disabled}
            />
            <select
                tabIndex={1}
                className={`duration-unit ${illegalValue ? 'illegalValue' : ''}`}
                value={unitValue || ''}
                onChange={e => setUnitValue(Number(e.target.value))}
                disabled={disabled}
            >
                <option value=""></option>
                {displayUnits.map(displayUnit => (
                    <option key={displayUnit.value} value={displayUnit.value}>
                        {displayUnit.name}
                    </option>
                ))}
            </select>
        </span>
    );
};

export default Duration;
