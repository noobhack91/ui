import { useEffect } from 'react';
import { useMessagingService } from './messagingService';

const useStateChangeSpinner = () => {
    const { showMessage } = useMessagingService();

    useEffect(() => {
        const handleStateChangeStart = (event: Event, toState: any) => {
            toState.spinnerToken = showSpinner();
        };

        const handleStateChangeSuccess = (event: Event, toState: any) => {
            hideSpinner(toState.spinnerToken);
        };

        const handleStateChangeError = (event: Event, toState: any) => {
            hideSpinner(toState.spinnerToken);
        };

        window.addEventListener('stateChangeStart', handleStateChangeStart);
        window.addEventListener('stateChangeSuccess', handleStateChangeSuccess);
        window.addEventListener('stateChangeError', handleStateChangeError);

        return () => {
            window.removeEventListener('stateChangeStart', handleStateChangeStart);
            window.removeEventListener('stateChangeSuccess', handleStateChangeSuccess);
            window.removeEventListener('stateChangeError', handleStateChangeError);
        };
    }, [showMessage]);

    const showSpinner = () => {

        // Assuming we have a spinner element with id 'spinner' in the DOM
        const spinnerElement = document.getElementById('spinner');
        if (spinnerElement) {

        if (token) {
            // Assuming spinner.hide is a globally available function or imported from a utility module
            spinner.hide(token);
        } else {
            console.error('No spinner token provided to hideSpinner');
        }
    };
            // Generate a unique token for the spinner instance
            const token = Math.random().toString(36).substr(2, 9);
            return token;
        } else {
            console.error('Spinner element not found');
            return null;
        }
    };

    const hideSpinner = (token: any) => {

        if (token) {
            // Assuming spinner.hide is a globally available function or imported from a utility module
            const spinnerElement = document.getElementById('spinner');
            if (spinnerElement) {
                spinnerElement.style.display = 'none';
            } else {
                console.error('Spinner element not found');
            }
        } else {
            console.error('No spinner token provided to hideSpinner');
        }
    };
};

export default useStateChangeSpinner;
