import { DateUtil } from 'path/to/DateUtil'; // Adjust the import path as necessary

/**
 * Converts a birth date to the number of years.
 * @param {string} birthDate - The birth date in a string format.
 * @returns {number} - The age in years or 0 if birthDate is not provided.
 */
export function birthDateToYears(birthDate: string): number {
    if (birthDate) {
        const age = DateUtil.diffInYearsMonthsDays(birthDate, DateUtil.now());
        return age.years || 0;
    } else {
        return 0;
    }
}
