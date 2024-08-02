// react/src/utils/bahmniDate.ts

export class DateUtil {
    static formatDateWithoutTime(date: Date): string {
        // Assuming the format is 'YYYY-MM-DD'
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
}

export function bahmniDate(date: Date): string {
    return DateUtil.formatDateWithoutTime(date);
}
