// Import necessary utilities from Bahmni.Common.Util.DateUtil
import { formatDateInStrictMode } from 'bahmni-common-util-dateutil';

/**
 * Utility function to format a date in strict mode.
 * 
 * @param {Date | string} date - The date to be formatted.
 * @returns {string} - The formatted date string.
 */
export function bahmniDateInStrictMode(date: Date | string): string {
    return formatDateInStrictMode(date);
}
