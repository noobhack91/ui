import { diffInYearsMonthsDays, now } from './dateUtil';
import { translate } from './translateUtil';

export function birthDateToAgeText(birthDate: string): string {
    if (birthDate) {
        const age = diffInYearsMonthsDays(birthDate, now());
        let ageInString = "";
        if (age.years) {
            ageInString += age.years + " " + translate("CLINICAL_YEARS_TRANSLATION_KEY") + " ";
        }
        if (age.months) {
            ageInString += age.months + " " + translate("CLINICAL_MONTHS_TRANSLATION_KEY") + " ";
        }
        if (age.days) {
            ageInString += age.days + " " + translate("CLINICAL_DAYS_TRANSLATION_KEY") + " ";
        }
        return ageInString;
    } else {
        return "";
    }
}
