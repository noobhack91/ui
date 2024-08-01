// Import necessary utilities from Bahmni Common Util
import { DateUtil } from 'bahmni-common-util';

// Function to format date with time
export function bahmniDateTime(date: Date): string {
    return DateUtil.formatDateWithTime(date);
}
