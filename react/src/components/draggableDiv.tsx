import React, { useRef, useEffect } from 'react';
import $ from 'jquery';
import 'jquery-ui/ui/widgets/draggable';
import 'jquery-ui/ui/widgets/resizable';

const DraggableDiv: React.FC = () => {
    const elementRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (elementRef.current) {
            $(elementRef.current).resizable({ handles: "n, e, s, w, ne, se, sw, nw" });
            $(elementRef.current).on('resizestop', function () {
                $(this).css({
                    position: 'fixed'
                });
            });
            $(elementRef.current).draggable();
        }
    }, []);

    return (
        <div ref={elementRef} style={{ width: '200px', height: '200px', border: '1px solid black' }}>
            Draggable and Resizable Div
        </div>
    );
};

export default DraggableDiv;
