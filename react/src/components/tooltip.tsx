import React, { useState, useEffect, useRef } from 'react';
import './tooltip.css'; // Assuming you have a CSS file for styling the tooltip

interface TooltipProps {
    text: string;
    children: React.ReactNode;
}

const Tooltip: React.FC<TooltipProps> = ({ text, children }) => {
    const [visible, setVisible] = useState(false);
    const [isTextTruncated, setIsTextTruncated] = useState(false);
    const tooltipRef = useRef<HTMLDivElement>(null);
    const elementRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const element = elementRef.current;
        if (element) {
            setIsTextTruncated(element.scrollWidth > element.clientWidth);
        }
    }, [children]);

    const handleMouseOver = () => {
        if (isTextTruncated) {
            setTimeout(() => {
                setVisible(true);
            }, 1000);
        }
    };

    const handleMouseOut = () => {
        setVisible(false);
    };

    return (
        <div
            ref={elementRef}
            onMouseOver={handleMouseOver}
            onMouseOut={handleMouseOut}
            style={{ position: 'relative', display: 'inline-block' }}
        >
            {children}
            {visible && (
                <div
                    ref={tooltipRef}
                    className="tooltip"
                    style={{
                        position: 'absolute',
                        top: elementRef.current ? elementRef.current.offsetTop + elementRef.current.offsetHeight : 0,
                        left: elementRef.current ? elementRef.current.offsetLeft + elementRef.current.offsetWidth / 2 - 70 : 0,
                    }}
                >
                    {text}
                </div>
            )}
        </div>
    );
};

export default Tooltip;
