// react/src/utils/bahmniDateTimeWithFormat.ts

// Importing necessary utility functions
import { format } from 'date-fns';

/**
 * Formats the given date into the specified format.
 * 
 * @param date - The date to be formatted.
 * @param formatString - The format string to use for formatting the date.
 * @returns The formatted date string.
 */
export function bahmniDateTimeWithFormat(date: Date, formatString: string): string {
    if (!date) {
        return '';
    }
    return format(date, formatString);
}
