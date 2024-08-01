import React, { useState, useEffect } from 'react';

interface VisitPaginatorProps {
    currentVisitUuid: string | null;
    visits: Array<{ uuid: string }>;
    nextFn: (uuid: string) => void;
    previousFn: (uuid: string) => void;
    visitSummary: any; // Adjust the type as needed
}

const VisitPaginator: React.FC<VisitPaginatorProps> = ({ currentVisitUuid, visits, nextFn, previousFn, visitSummary }) => {
    const [visitIndex, setVisitIndex] = useState<number | null>(null);
    const [visitHistoryEntry, setVisitHistoryEntry] = useState<{ uuid: string } | null>(null);

    useEffect(() => {
        const reversedVisits = [...visits].reverse();
        const index = reversedVisits.findIndex(visit => currentVisitUuid !== null && visit.uuid === currentVisitUuid);
        setVisitIndex(index);
        setVisitHistoryEntry(reversedVisits[index] || null);
    }, [currentVisitUuid, visits]);

    const shouldBeShown = (): boolean => {
        // SECOND AGENT: [MISSING CONTEXT] - Logic to determine if the component should be shown
        return true; // Placeholder logic
    };

    const hasNext = (): boolean => {
        return visitIndex !== null && visitIndex < (visits.length - 1);
    };

    const hasPrevious = (): boolean => {
        return visitIndex !== null && visitIndex > 0;
    };

    const handleNext = (): void => {
        if (hasNext() && nextFn && visitIndex !== null) {
            nextFn(visits[visitIndex + 1].uuid);
        }
    };

    const handlePrevious = (): void => {
        if (hasPrevious() && previousFn && visitIndex !== null) {
            previousFn(visits[visitIndex - 1].uuid);
        }
    };

    if (!shouldBeShown()) {
        return null;
    }

    return (
        <div>
            <button onClick={handlePrevious} disabled={!hasPrevious()}>Previous</button>
            <span>{visitHistoryEntry?.uuid}</span>
            <button onClick={handleNext} disabled={!hasNext()}>Next</button>
        </div>
    );
};

export default VisitPaginator;
