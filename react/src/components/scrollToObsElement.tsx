import React, { useEffect, useRef } from 'react';

interface ScrollToObsElementProps {
    shouldScroll: boolean;
    onScrollComplete: () => void;
}

const ScrollToObsElement: React.FC<ScrollToObsElementProps> = ({ shouldScroll, onScrollComplete }) => {
    const elementRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (shouldScroll && elementRef.current) {
            elementRef.current.focus();
            const scrollPosition = elementRef.current.offsetTop - window.innerHeight / 2;
            const container = document.getElementById('scrollOnEdit');

            if (container) {
                const scrollTo = elementRef.current;
                const containerScrollPosition = scrollTo.offsetTop + container.scrollTop - (container.offsetTop + container.offsetTop / 2);
                container.scrollTo({ top: containerScrollPosition, behavior: 'smooth' });
            } else {
                window.scrollTo({ top: scrollPosition, behavior: 'smooth' });
            }

            onScrollComplete();
        }
    }, [shouldScroll, onScrollComplete]);

    return <div ref={elementRef} tabIndex={-1} />;
};

export default ScrollToObsElement;
