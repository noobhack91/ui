// react/src/utils/DateUtil.ts

/**
 * Formats a given date into a specified format.
 * 
 * @param date - The date to be formatted.
 * @param format - The format string to format the date.
 * @returns The formatted date string.
 */
export function getDateTimeInSpecifiedFormat(date: Date, format: string): string {

    const options: Intl.DateTimeFormatOptions = {};

    // Map format string to Intl.DateTimeFormatOptions
    if (format.includes('yyyy')) options.year = 'numeric';
    if (format.includes('MM')) options.month = '2-digit';
    if (format.includes('dd')) options.day = '2-digit';
    if (format.includes('HH')) options.hour = '2-digit';
    if (format.includes('mm')) options.minute = '2-digit';
    if (format.includes('ss')) options.second = '2-digit';

    // Use Intl.DateTimeFormat to format the date
    return new Intl.DateTimeFormat('en-US', options).format(date);
}
    return ''; // Placeholder return statement
}
