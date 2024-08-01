import React, { useEffect, useRef } from 'react';

const OnScroll: React.FC = () => {
    const elementRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleScroll = () => {
            if (elementRef.current) {
                // Please dont remove or alter the below class name
                const calendarLocation = document.querySelector('.calendar-location') as HTMLElement;
                const calendarTimeContainer = document.querySelector('.calendar-time-container') as HTMLElement;

                if (calendarLocation) {
                    calendarLocation.style.top = `${elementRef.current.scrollTop}px`;
                }

                if (calendarTimeContainer) {
                    calendarTimeContainer.style.left = `${elementRef.current.scrollLeft}px`;
                }
            }
        };

        const element = elementRef.current;
        if (element) {
            element.addEventListener('scroll', handleScroll);
        }

        return () => {
            if (element) {
                element.removeEventListener('scroll', handleScroll);
            }
        };
    }, []);

    return <div ref={elementRef} style={{ overflow: 'auto' }}>{/* Content goes here */}</div>;
};

export default OnScroll;
