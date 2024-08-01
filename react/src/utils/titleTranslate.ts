// react/src/utils/titleTranslate.ts

/**
 * Utility function to translate a title based on provided parameters.
 * This function is a conversion from AngularJS's titleTranslate filter.
 * 
 * @param params - The parameters containing the translation key.
 * @param translations - An object containing translation mappings.
 * @returns The translated title.
 */
export function titleTranslate(params: { translationKey: string }, translations: { [key: string]: string }): string {
    if (!params || !params.translationKey) {
        return '';
    }

    const translationKey = params.translationKey;
    return translations[translationKey] || translationKey;
}
