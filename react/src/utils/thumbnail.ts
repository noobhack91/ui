// Constants file path: react/src/utils/constants/documentsPath.ts
export const documentsPath = '/path/to/documents';

// Utility function file: react/src/utils/thumbnail.ts
import { documentsPath } from './constants/documentsPath';

/**
 * Generates a thumbnail URL from the given URL and extension.
 * 
 * @param url - The original URL of the document.
 * @param extension - The extension to be used for the thumbnail.
 * @returns The URL of the thumbnail.
 */
export function thumbnail(url: string, extension?: string): string | null {
    if (url) {
        if (extension) {
            return `${documentsPath}/${url.replace(/(.*)\.(.*)$/, `$1_thumbnail.${extension}`)}` || null;
        }
        return `${documentsPath}/${url.replace(/(.*)\.(.*)$/, `$1_thumbnail.$2`)}` || null;
    }
    return null;
}
