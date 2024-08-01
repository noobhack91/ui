/**
 * Converts a given value to a decimal and returns the floor value.
 * If the value is not a number or is an empty string, it returns the value as is.
 * 
 * @param value - The value to be converted and floored.
 * @returns The floored value if the input is a number, otherwise the input value.
 */
export function decimalFilter(value: any): any {
    if (!isNaN(value) && value !== '') {
        value = +(value);
        return Math.floor(value);
    }
    return value;
}
