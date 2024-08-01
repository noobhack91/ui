/**
 * Converts a boolean value to a string representation.
 * @param value - The boolean value to convert.
 * @returns "Yes" if the value is true, "No" if the value is false, otherwise returns the value itself.
 */
export function booleanFilter(value: boolean | any): string | any {
    if (value === true) {
        return "Yes";
    } else if (value === false) {
        return "No";
    }
    return value;
}
