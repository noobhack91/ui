import { format } from 'date-fns';

class DateUtil {
    static now(): Date {
        return new Date();
    }

    static diffInYearsMonthsDays(birthDate: Date, referenceDate: Date): { years: number, months: number, days: number } {
        const birth = new Date(birthDate);
        const reference = new Date(referenceDate);

        let years = reference.getFullYear() - birth.getFullYear();
        let months = reference.getMonth() - birth.getMonth();
        let days = reference.getDate() - birth.getDate();

        if (days < 0) {
            months -= 1;
            days += new Date(reference.getFullYear(), reference.getMonth(), 0).getDate();
        }

        if (months < 0) {
            years -= 1;
            months += 12;
        }

        return { years, months, days };
    }
}

export function dateToAge(birthDate: Date, referenceDate?: Date): string {
    referenceDate = referenceDate || DateUtil.now();
    const age = DateUtil.diffInYearsMonthsDays(birthDate, referenceDate);
    return formatAge(age);
}

function formatAge(age: { years: number, months: number, days: number }): string {
    const parts = [];
    if (age.years > 0) parts.push(`${age.years} year${age.years > 1 ? 's' : ''}`);
    if (age.months > 0) parts.push(`${age.months} month${age.months > 1 ? 's' : ''}`);
    if (age.days > 0) parts.push(`${age.days} day${age.days > 1 ? 's' : ''}`);
    return parts.join(', ');
}
