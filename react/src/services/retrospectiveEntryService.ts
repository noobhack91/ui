import { useState, useEffect } from 'react';
import { getCookie, setCookie, removeCookie } from '../utils/cookieUtils';
import { DateUtil } from '../utils/dateUtil';
import { Constants } from '../utils/constants';
import { RetrospectiveEntry } from '../domain/retrospectiveEntry';

export const useRetrospectiveEntryService = () => {
    const [retrospectiveEntry, setRetrospectiveEntry] = useState<RetrospectiveEntry | undefined>(undefined);

    useEffect(() => {
        initializeRetrospectiveEntry();
    }, []);

    const getRetrospectiveEntry = () => {
        return retrospectiveEntry;
    };

    const isRetrospectiveMode = () => {
        return retrospectiveEntry !== undefined;
    };

    const getRetrospectiveDate = () => {
        return retrospectiveEntry?.encounterDate;
    };

    const initializeRetrospectiveEntry = () => {
        const retrospectiveEncounterDateCookie = getCookie(Constants.retrospectiveEntryEncounterDateCookieName);
        if (retrospectiveEncounterDateCookie) {
            setRetrospectiveEntry(RetrospectiveEntry.createFrom(DateUtil.getDate(retrospectiveEncounterDateCookie)));
        }
    };

    const resetRetrospectiveEntry = (date?: string) => {
        removeCookie(Constants.retrospectiveEntryEncounterDateCookieName, { path: '/', expires: 1 });
        setRetrospectiveEntry(undefined);

        if (date && !DateUtil.isSameDate(date, DateUtil.today())) {
            const newEntry = RetrospectiveEntry.createFrom(DateUtil.getDate(date));
            setRetrospectiveEntry(newEntry);
            setCookie(Constants.retrospectiveEntryEncounterDateCookieName, date, { path: '/', expires: 1 });
        }
    };

    return {
        getRetrospectiveEntry,
        isRetrospectiveMode,
        getRetrospectiveDate,
        resetRetrospectiveEntry
    };
};
