import React, { useState } from 'react';

interface ButtonsRadioProps {
    model: string | undefined;
    options: string | string[];
    dirtyCheckFlag?: boolean;
    onModelChange: (model: string | undefined) => void;
    onDirtyCheckFlagChange?: (flag: boolean) => void;
}

const ButtonsRadio: React.FC<ButtonsRadioProps> = ({ model, options, dirtyCheckFlag, onModelChange, onDirtyCheckFlagChange }) => {
    const [hasDirtyFlag, setHasDirtyFlag] = useState<boolean>(!!dirtyCheckFlag);

    const parsedOptions = typeof options === 'string' 
        ? options.split(',').reduce((acc: Record<string, string>, item: string) => {
            acc[item] = item;
            return acc;
        }, {})
        : options;

    const activate = (option: string) => {
        const newModel = model === option ? undefined : option;
        onModelChange(newModel);
        if (hasDirtyFlag && onDirtyCheckFlagChange) {
            onDirtyCheckFlagChange(true);
        }
    };

    return (
        <>
            {Object.entries(parsedOptions).map(([displayOption, value]) => (
                <button
                    key={value}
                    type="button"
                    className={`btn ${value === model ? 'active' : ''}`}
                    onClick={() => activate(value)}
                >
                    <span></span>{displayOption}
                </button>
            ))}
        </>
    );
};

export default ButtonsRadio;
