// react/src/utils/bahmniTime.ts

export const bahmniTime = (date: Date): string => {
    if (!date) {
        return '';
    }
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
};
