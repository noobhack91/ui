import React from 'react';
import { useHistory } from 'react-router-dom';
import { useAppService } from '../services/appService';
import { BahmniCommonConstants } from '../utils/constants/BahmniCommonConstants';

interface NavigationLink {
    name: string;
    translationKey: string;
    url: string;
    title: string;
}

interface NavigationLinksProps {
    params: {
        showLinks?: string[];
        customLinks?: NavigationLink[];
    };
    linkParams: Record<string, string>;
}

const NavigationLinks: React.FC<NavigationLinksProps> = ({ params, linkParams }) => {
    const history = useHistory();
    const appService = useAppService();

    const standardLinks: NavigationLink[] = [
        {
            name: "home",
            translationKey: "HOME_DASHBOARD_KEY",
            url: "../home/#/dashboard",
            title: "Home"
        },
        {
            name: "visit",
            translationKey: "PATIENT_VISIT_PAGE_KEY",
            url: "../clinical/#/default/patient/{{patientUuid}}/dashboard/visit/{{visitUuid}}/?encounterUuid=active",
            title: "Visit"
        },
        {
            name: "inpatient",
            translationKey: "PATIENT_ADT_PAGE_KEY",
            url: "../adt/#/patient/{{patientUuid}}/visit/{{visitUuid}}/",
            title: "In Patient"
        },
        {
            name: "enrolment",
            translationKey: "PROGRAM_MANAGEMENT_PAGE_KEY",
            url: "../clinical/#/programs/patient/{{patientUuid}}/consultationContext",
            title: "Enrolment"
        },
        {
            name: "visitAttribute",
            translationKey: "PATIENT_VISIT_ATTRIBUTES_PAGE_KEY",
            url: "../registration/#/patient/{{patientUuid}}/visit",
            title: "Patient Visit Attributes"
        },
        {
            name: "registration",
            translationKey: "PATIENT_REGISTRATION_PAGE_KEY",
            url: "../registration/#/patient/{{patientUuid}}",
            title: "Registration"
        },
        {
            name: "labEntry",
            translationKey: "LAB_ENTRY_KEY",
            url: "/lab/patient/{{patientUuid}}",
            title: "Lab Entry"
        }
    ];

    const filterLinks = (links: NavigationLink[], showLinks?: string[]) => {
        if (!showLinks) return [];
        return links.filter(link => showLinks.includes(link.name));
    };

    const getLinks = () => {
        return [
            ...filterLinks(standardLinks, params.showLinks),
            ...(params.customLinks || [])
        ];
    };

    const getFormattedURL = (link: NavigationLink) => {
        return appService.getAppDescriptor().formatUrl(link.url, linkParams);
    };

    const getParamsToBeReplaced = (link: string) => {
        const pattern = /{{([^}]*)}}/g;
        const matches = link.match(pattern);
        if (!matches) return [];
        return matches.map(el => el.replace("{{", '').replace("}}", ''));
    };

    const showUrl = (link: NavigationLink) => {
        const params = getParamsToBeReplaced(link.url);
        return params.every(property => linkParams[property]);
    };

    const handleLinkClick = (link: NavigationLink) => {
        const url = getFormattedURL(link);
        window.open(url, link.title);
    };

    if ((!params.showLinks && !params.customLinks) ||
        (params.showLinks && params.customLinks &&
            params.showLinks.length === 0 && params.customLinks.length === 0)) {
        return <div>{BahmniCommonConstants.noNavigationLinksMessage}</div>;
    }

    return (
        <div>
            {getLinks().map((link, index) => (
                showUrl(link) && (
                    <button key={index} onClick={() => handleLinkClick(link)}>
                        {link.title}
                    </button>
                )
            ))}
        </div>
    );
};

export default NavigationLinks;
