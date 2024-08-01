import { diffInYearsMonthsDays, now } from './dateUtil';

export function birthDateToYears(birthDate: string): number | string {
    if (birthDate) {
        const age = diffInYearsMonthsDays(birthDate, now());
        return age.years || 0;
    } else {
        return "";
    }
}
