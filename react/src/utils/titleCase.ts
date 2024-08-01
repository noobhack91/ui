/**
 * Converts a string to title case.
 * @param input - The string to be converted.
 * @returns The converted string in title case.
 */
export function titleCase(input: string): string {
    input = input || '';
    return input.replace(/\w\S*/g, function (txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
}
