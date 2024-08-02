// react/src/utils/gender.ts

/**
 * Converts a gender character to its full form based on a provided gender map.
 * @param genderChar - The character representing the gender (e.g., 'M', 'F').
 * @param genderMap - An object mapping gender characters to their full forms.
 * @returns The full form of the gender or "Unknown" if the character is not recognized.
 */
export function gender(genderChar: string | null, genderMap: { [key: string]: string }): string {
    if (genderChar == null) {
        return "Unknown";
    }
    return genderMap[genderChar.toUpperCase()] || "Unknown";
}
