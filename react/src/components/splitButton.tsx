import React, { useState, useEffect } from 'react';
import { Button, Dropdown, DropdownButton } from 'react-bootstrap';

interface Option {
    shortcutKey: string;
    // Add other properties as needed
}

interface SplitButtonProps {
    options: Option[];
    primaryOption?: Option;
    optionText: (option: Option, type: string) => string;
    optionClick: (option: Option) => void;
    optionDisabled: boolean;
}

const SplitButton: React.FC<SplitButtonProps> = ({
    options,
    primaryOption,
    optionText,
    optionClick,
    optionDisabled
}) => {
    const [primary, setPrimary] = useState<Option>(primaryOption || options[0]);
    const [secondaryOptions, setSecondaryOptions] = useState<Option[]>([]);

    useEffect(() => {
        setSecondaryOptions(options.filter(option => option !== primary));
    }, [options, primary]);

    const hasMultipleOptions = () => secondaryOptions.length > 0;

    const scrollToBottom = () => {

        setTimeout(() => {
            const element = document.querySelector('.split-button');
            if (element) {
                const scrollHeight = element.scrollHeight;
                const elementPosition = element.getBoundingClientRect().top + window.scrollY;
                const windowHeight = window.innerHeight + window.scrollY;
                if (windowHeight < (elementPosition + scrollHeight)) {
                    window.scrollBy(0, scrollHeight);
                }
            }
        }, 0);
    };

    return (
        <div className="split-button">
            {hasMultipleOptions() && (
                <Button
                    className="toggle-button fa fa-caret-down"
                    onClick={scrollToBottom}
                    disabled={optionDisabled}
                />
            )}
            <ul className="options">
                <li className="primaryOption">
                    <Button
                        className="buttonClass"
                        onClick={() => optionClick(primary)}
                        accessKey={primary.shortcutKey}
                        disabled={optionDisabled}
                    >
                        {optionText(primary, 'primary')}
                    </Button>
                </li>
                <ul className="hidden-options">
                    {secondaryOptions.map(option => (
                        <li key={option.shortcutKey} className="secondaryOption">
                            <Button
                                className="buttonClass"
                                onClick={() => optionClick(option)}
                                accessKey={option.shortcutKey}
                                disabled={optionDisabled}
                            >
                                {optionText(option, 'secondary')}
                            </Button>
                        </li>
                    ))}
                </ul>
            </ul>
        </div>
    );
};

export default SplitButton;
