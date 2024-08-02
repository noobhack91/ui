import React, { useEffect, useRef } from 'react';

interface BmPopOverTriggerProps {
    autoclose: boolean;
    onTriggerClick: () => void;
}

const BmPopOverTrigger: React.FC<BmPopOverTriggerProps> = ({ autoclose, onTriggerClick }) => {
    const triggerElementRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleDocumentClick = (event: MouseEvent) => {
            if (autoclose && triggerElementRef.current && !triggerElementRef.current.contains(event.target as Node)) {
                onTriggerClick();
                document.removeEventListener('click', handleDocumentClick);
            }
        };

        const handleClick = (event: MouseEvent) => {
            event.stopImmediatePropagation();
            onTriggerClick();
            document.addEventListener('click', handleDocumentClick);
        };

        const triggerElement = triggerElementRef.current;
        if (triggerElement) {
            triggerElement.addEventListener('click', handleClick);
        }

        return () => {
            if (triggerElement) {
                triggerElement.removeEventListener('click', handleClick);
            }
            document.removeEventListener('click', handleDocumentClick);
        };
    }, [autoclose, onTriggerClick]);

    return <div ref={triggerElementRef}>Trigger</div>;
};

export default BmPopOverTrigger;
