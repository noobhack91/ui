// Import necessary utilities from the DateUtil module
import { formatDateWithTime } from './DateUtil';

/**
 * Converts a given date to a formatted string with time.
 * 
 * @param date - The date to be formatted.
 * @returns The formatted date string with time.
 */
export function bahmniDateTime(date: Date): string {
    return formatDateWithTime(date);
}
