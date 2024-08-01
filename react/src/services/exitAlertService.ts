import useMessagingService from './messagingService';

interface ExitAlertService {
    showExitAlert: (isNavigating: boolean, dirtyConsultationForm: boolean, event: Event, spinnerToken: any) => void;
    setIsNavigating: (next: any, uuid: string, currentUuid: string) => boolean;
}

const useExitAlertService = (): ExitAlertService => {
    const { showMessage } = useMessagingService();

    const showExitAlert = (isNavigating: boolean, dirtyConsultationForm: boolean, event: Event, spinnerToken: any) => {
        if (isNavigating && dirtyConsultationForm) {
            showMessage('alert', "ALERT_MESSAGE_ON_EXIT");
            // SECOND AGENT: [MISSING CONTEXT] - $state.reviewButtonFocused equivalent in React
            event.preventDefault();
            // SECOND AGENT: [MISSING CONTEXT] - spinner.hide equivalent in React
        }
    };

    const setIsNavigating = (next: any, uuid: string, currentUuid: string): boolean => {
        // SECOND AGENT: [MISSING CONTEXT] - $state.newPatientUuid equivalent in React
        const isPatientSearch = next.url.includes("/patient/search");
        // SECOND AGENT: [MISSING CONTEXT] - $state.isPatientSearch equivalent in React
        return isPatientSearch || (uuid !== currentUuid);
    };

    return {
        showExitAlert,
        setIsNavigating
    };
};

export default useExitAlertService;
