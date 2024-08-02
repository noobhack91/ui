/**
 * Adds a specified number of days to a given date.
 * 
 * @param date - The initial date to which days will be added.
 * @param numberOfDays - The number of days to add to the date.
 * @returns A new date object with the added days.
 */
export function addDays(date: Date, numberOfDays: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + numberOfDays);
    return result;
}
