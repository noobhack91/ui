import React, { useState, useEffect } from 'react';
import ContextChangeHandler from '../services/contextChangeHandler';

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
    const [displayUnits, setDisplayUnits] = useState<Array<{ name: string, value: number }>>([]);

    useEffect(() => {
        const valueAndUnit = convertToUnits(hours);
        setUnits(valueAndUnit.allUnits);
        setMeasureValue(valueAndUnit.value);
        setUnitValue(valueAndUnit.unitValueInMinutes);
        const durations = Object.keys(valueAndUnit.allUnits).reverse();
        setDisplayUnits(durations.map(duration => ({ name: duration, value: valueAndUnit.allUnits[duration] })));
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
    }, [unitValue, measureValue, onChange]);

    useEffect(() => {
        if (disabled) {
            setUnitValue(undefined);
            setMeasureValue(undefined);
        }
    }, [disabled]);

    useEffect(() => {
        const contextChange = () => ({ allow: !illegalValue });
        ContextChangeHandler.add(contextChange);

        return () => {
            ContextChangeHandler.reset();
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
                onChange={(e) => setMeasureValue(Number(e.target.value))}
                disabled={disabled}
            />
            <select
                tabIndex={1}
                className={`duration-unit ${illegalValue ? 'illegalValue' : ''}`}
                value={unitValue || ''}
                onChange={(e) => setUnitValue(Number(e.target.value))}
                disabled={disabled}
            >
                <option value=""></option>
                {displayUnits.map((displayUnit) => (
                    <option key={displayUnit.value} value={displayUnit.value}>
                        {displayUnit.name}
                    </option>
                ))}
            </select>
        </span>
    );
};

// Placeholder for the convertToUnits function
const convertToUnits = (hours: number) => {

    const allUnits = {
        "minutes": 1,
        "hours": 60,
        "days": 1440,
        "weeks": 10080
    };

    let unitValueInMinutes = 0;
    let value = 0;

    if (hours >= 10080) {
        unitValueInMinutes = allUnits["weeks"];
        value = hours / (unitValueInMinutes / 60);
    } else if (hours >= 1440) {
        unitValueInMinutes = allUnits["days"];
        value = hours / (unitValueInMinutes / 60);
    } else if (hours >= 60) {
        unitValueInMinutes = allUnits["hours"];
        value = hours / (unitValueInMinutes / 60);
    } else {
        unitValueInMinutes = allUnits["minutes"];
        value = hours * 60;
    }

    return {
        allUnits,
        value,
        unitValueInMinutes
    };
};
    return {
        allUnits: {},
        value: 0,
        unitValueInMinutes: 0
    };
};

export default Duration;
