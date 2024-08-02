import React, { useEffect, useState, useCallback } from 'react';

interface SchedulerProps {
    refreshTime: number;
    watchOn: boolean;
    triggerFunction: () => void;
}

const Scheduler: React.FC<SchedulerProps> = ({ refreshTime, watchOn, triggerFunction }) => {
    const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);

    const cancelSchedule = useCallback(() => {
        if (intervalId) {
            clearInterval(intervalId);
            setIntervalId(null);
        }
    }, [intervalId]);

    const startSchedule = useCallback(() => {
        if (!intervalId) {
            const id = setInterval(triggerFunction, refreshTime * 1000);
            setIntervalId(id);
        }
    }, [intervalId, refreshTime, triggerFunction]);

    useEffect(() => {
        if (refreshTime > 0) {
            if (watchOn) {
                cancelSchedule();
            } else {
                startSchedule();
            }
        }

        return () => {
            cancelSchedule();
        };
    }, [watchOn, refreshTime, cancelSchedule, startSchedule]);

    useEffect(() => {
        triggerFunction();
    }, [triggerFunction]);

    return null;
};

export default Scheduler;
