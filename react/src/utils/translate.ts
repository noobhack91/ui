// react/src/utils/translate.ts

/**
 * Utility function to handle translations in React components.
 * This function mimics the AngularJS translate filter.
 * 
 * @param key - The translation key to be translated.
 * @param translations - An object containing key-value pairs for translations.
 * @returns The translated string.
 */
export function translate(key: string, translations: { [key: string]: string }): string {
    return translations[key] || key;
}
