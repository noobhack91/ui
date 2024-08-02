import React, { useEffect, useRef } from 'react';

interface ScrollToObsElementProps {
    scrollToElement: boolean;
}

const ScrollToObsElement: React.FC<ScrollToObsElementProps> = ({ scrollToElement, children }) => {
    const elementRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollToElement && elementRef.current) {
            elementRef.current.focus();
            let scrollPosition = elementRef.current.offsetTop - window.innerHeight / 2;
            const scrollOnEdit = document.getElementById('scrollOnEdit');

            if (scrollOnEdit) {
                const container = scrollOnEdit;
                const scrollTo = elementRef.current;
                scrollPosition = scrollTo.offsetTop + container.scrollTop - (container.offsetTop + container.offsetTop / 2);
                container.scrollTo({ top: scrollPosition, behavior: 'smooth' });
            } else {
                window.scrollTo({ top: scrollPosition, behavior: 'smooth' });
            }
        }
    }, [scrollToElement]);

    return <div ref={elementRef}>{children}</div>;
};

export default ScrollToObsElement;
