// Utility function to calculate the difference in days between two dates

/**
 * Calculate the difference in days between two dates.
 * @param {Date | string} startDate - The start date.
 * @param {Date | string} endDate - The end date.
 * @returns {number} - The difference in days.
 */
export function diffInDays(startDate: Date | string, endDate: Date | string): number {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
}
