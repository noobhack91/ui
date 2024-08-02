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
        if (isTargetOpen) {
            setIsTargetOpen(false);
            hideTargetElements();
            document.removeEventListener('click', docClickHandler);
        } else {
            document.querySelectorAll('.tooltip').forEach(el => el.setAttribute('style', 'display: none'));
            setIsTargetOpen(true);
            showTargetElements();
            document.addEventListener('click', docClickHandler);
            event.stopPropagation();
        }
    };

    useEffect(() => {
        return () => {
            document.removeEventListener('click', docClickHandler);
        };
    }, []);

    return (
        <div ref={triggerElement} onClick={handleTriggerClick}>

            { /* Render children or content passed to the trigger element */ }
            {children}
        </div>
    );
};

export default BmPopOverTrigger;
