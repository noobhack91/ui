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

const SplitButton: React.FC<SplitButtonProps> = ({ options, primaryOption, optionText, optionClick, optionDisabled }) => {
    const [primary, setPrimary] = useState<Option>(primaryOption || options[0]);
    const [secondaryOptions, setSecondaryOptions] = useState<Option[]>(options.filter(option => option !== primary));

    useEffect(() => {
        setPrimary(primaryOption || options[0]);
        setSecondaryOptions(options.filter(option => option !== primary));
    }, [options, primaryOption]);

    const hasMultipleOptions = () => secondaryOptions.length > 0;

    const scrollToBottom = () => {

        setTimeout(() => {
            const element = document.querySelector('.split-button');
            if (element) {
                const elementPosition = element.getBoundingClientRect().top + window.scrollY;
                const elementHeight = element.scrollHeight;
                const windowHeight = window.innerHeight + window.scrollY;
                if (windowHeight < (elementHeight + elementPosition)) {
                    window.scrollBy(0, elementHeight);
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
            <DropdownButton
                title={optionText(primary, 'primary')}
                disabled={optionDisabled}
                onSelect={() => optionClick(primary)}
            >
                {secondaryOptions.map((option, index) => (
                    <Dropdown.Item
                        key={index}
                        onClick={() => optionClick(option)}
                        disabled={optionDisabled}
                    >
                        {optionText(option, 'secondary')}
                    </Dropdown.Item>
                ))}
            </DropdownButton>
        </div>
    );
};

export default SplitButton;
