import React, { useEffect, useRef, useState } from 'react';

interface BmPopOverTriggerProps {
    autoclose: boolean;
}

const BmPopOverTrigger: React.FC<BmPopOverTriggerProps> = ({ autoclose }) => {
    const [isTargetOpen, setIsTargetOpen] = useState(false);
    const targetElements = useRef<HTMLElement[]>([]);
    const triggerElement = useRef<HTMLElement | null>(null);

    const hideTargetElements = () => {
        targetElements.current.forEach(el => el.style.display = 'none');
    };

    const showTargetElements = () => {
        targetElements.current.forEach(el => el.style.display = 'block');
    };

    const docClickHandler = (event: MouseEvent) => {
        if (!autoclose) {
            return;
        }
        hideTargetElements();
        setIsTargetOpen(false);
        document.removeEventListener('click', docClickHandler);
    };

    const handleTriggerClick = (event: React.MouseEvent) => {
        event.stopImmediatePropagation();
        if (isTargetOpen) {
            setIsTargetOpen(false);
            hideTargetElements();
            document.removeEventListener('click', docClickHandler);
        } else {
            document.querySelectorAll('.tooltip').forEach(el => el.style.display = 'none');
            setIsTargetOpen(true);
            showTargetElements();
            document.addEventListener('click', docClickHandler);
        }
    };

    useEffect(() => {
        const handleRegWrapperClick = () => {
            if (isTargetOpen) {
                setIsTargetOpen(false);
                hideTargetElements();
            }
        };

        document.addEventListener('click', handleRegWrapperClick);

        return () => {
            document.removeEventListener('click', handleRegWrapperClick);
            document.removeEventListener('click', docClickHandler);
        };
    }, [isTargetOpen]);

    return (
        <div ref={triggerElement} onClick={handleTriggerClick}>

            { /* Render the children or content of the trigger element here */ }
            {children}
        </div>
    );
};

export default BmPopOverTrigger;
