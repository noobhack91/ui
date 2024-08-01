import React, { useEffect, useRef } from 'react';

interface OnHorizontalScrollProps {
    className: string;
}

const OnHorizontalScroll: React.FC<OnHorizontalScrollProps> = ({ className, children }) => {
    const elementRef = useRef<HTMLDivElement>(null);
    const divTagRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (elementRef.current) {
            divTagRef.current = document.getElementsByClassName(className)[0] as HTMLDivElement;
            const handleScroll = () => {
                if (divTagRef.current) {
                    divTagRef.current.scrollLeft = elementRef.current!.scrollLeft;
                }
            };
            elementRef.current.addEventListener('scroll', handleScroll);
            return () => {
                elementRef.current?.removeEventListener('scroll', handleScroll);
            };
        }
    }, [className]);

    return (
        <div ref={elementRef}>
            {children}
        </div>
    );
};

export default OnHorizontalScroll;
