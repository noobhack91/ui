// react/src/services/mergeService.ts

export class MergeService {
    merge(base: any, custom: any): any {
        const mergeResult = this.deepMerge({}, base, custom);
        return this.deleteNullValuedKeys(mergeResult);
    }

    private deepMerge(target: any, ...sources: any[]): any {
        if (!sources.length) return target;
        const source = sources.shift();

        if (this.isMergeableObject(target) && this.isMergeableObject(source)) {
            for (const key in source) {
                if (this.isMergeableObject(source[key])) {
                    if (!target[key]) Object.assign(target, { [key]: {} });
                    this.deepMerge(target[key], source[key]);
                } else {
                    Object.assign(target, { [key]: source[key] });
                }
            }
        }

        return this.deepMerge(target, ...sources);
    }

    private isMergeableObject(item: any): boolean {
        return item && typeof item === 'object' && !Array.isArray(item);
    }

    private deleteNullValuedKeys(currentObject: any): any {
        for (const key in currentObject) {
            if (currentObject.hasOwnProperty(key)) {
                const value = currentObject[key];
                if (value === null || value === undefined || Number.isNaN(value) ||
                    (typeof value === 'object' && this.deleteNullValuedKeys(value) === null)) {
                    delete currentObject[key];
                }
            }
        }
        return currentObject;
    }
}
