// Import necessary utilities from Bahmni.Common.Util.DateUtil
import { formatTime } from 'bahmni-common-util-dateutil';

/**
 * Utility function to format time.
 * 
 * @param date - The date object to format.
 * @returns The formatted time string.
 */
export function bahmniTime(date: Date): string {
    return formatTime(date);
}
