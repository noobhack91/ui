import { formatDistanceToNowStrict } from 'date-fns';
import { enUS } from 'date-fns/locale';

interface Age {
    years: number;
    months: number;
    days: number;
}

const diffInYearsMonthsDays = (birthDate: Date, currentDate: Date): Age => {
    const years = currentDate.getFullYear() - birthDate.getFullYear();
    const months = currentDate.getMonth() - birthDate.getMonth();
    const days = currentDate.getDate() - birthDate.getDate();

    let adjustedYears = years;
    let adjustedMonths = months;
    let adjustedDays = days;

    if (days < 0) {
        adjustedMonths -= 1;
        adjustedDays += new Date(currentDate.getFullYear(), currentDate.getMonth(), 0).getDate();
    }

    if (months < 0) {
        adjustedYears -= 1;
        adjustedMonths += 12;
    }

    return {
        years: adjustedYears,
        months: adjustedMonths,
        days: adjustedDays,
    };
};

const birthDateToAgeText = (birthDate: Date | null): string => {
    if (!birthDate) {
        return "";
    }

    const age = diffInYearsMonthsDays(birthDate, new Date());
    let ageInString = "";

    if (age.years) {
        ageInString += `${age.years} years `;
    }
    if (age.months) {
        ageInString += `${age.months} months `;
    }
    if (age.days) {
        ageInString += `${age.days} days `;
    }

    return ageInString.trim();
};

export default birthDateToAgeText;
