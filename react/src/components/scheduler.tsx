import React, { useEffect, useState } from 'react';

interface SchedulerProps {
    refreshTime: number;
    watchOn: boolean;
    triggerFunction: () => void;
}

const Scheduler: React.FC<SchedulerProps> = ({ refreshTime, watchOn, triggerFunction }) => {
    const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);

    const cancelSchedule = () => {
        if (intervalId) {
            clearInterval(intervalId);
            setIntervalId(null);
        }
    };

    const startSchedule = () => {
        if (!intervalId) {
            const id = setInterval(triggerFunction, refreshTime * 1000);
            setIntervalId(id);
        }
    };

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
    }, [watchOn, refreshTime]);

    useEffect(() => {
        triggerFunction();
    }, []);

    return null;
};

export default Scheduler;
