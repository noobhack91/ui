import React, { useEffect, useRef } from 'react';
import $ from 'jquery';

interface BedAssignmentDialogProps {
    cell: any;
    setBedDetails: (cell: any) => void;
}

const BedAssignmentDialog: React.FC<BedAssignmentDialogProps> = ({ cell, setBedDetails }) => {
    const elemRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (elemRef.current) {
                setBedDetails(cell);
                const leftPos = $(elemRef.current).offset()?.left! - 132;
                const topPos = $(elemRef.current).offset()?.top!;
                const bedInfoElem = $(elemRef.current).closest('.ward').find(".bed-info");
                bedInfoElem.css('left', leftPos);
                bedInfoElem.css('top', topPos);
                e.stopPropagation();
            }
        };

        const elem = elemRef.current;
        if (elem) {
            elem.addEventListener('click', handleClick);
        }

        return () => {
            if (elem) {
                elem.removeEventListener('click', handleClick);
            }
        };
    }, [cell, setBedDetails]);

    return <div ref={elemRef} className="bed-assignment-dialog"></div>;
};

export default BedAssignmentDialog;
