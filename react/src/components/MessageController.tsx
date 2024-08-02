import React, { useState, useEffect } from 'react';
import messagingService from '../services/messagingService';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';

const MessageController: React.FC = () => {
    const [messages, setMessages] = useState(messagingService.messages);
    const { t } = useTranslation();
    const history = useHistory();

    useEffect(() => {
        const subscription = messagingService.subscribe((newMessages) => {
            setMessages(newMessages);
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const getMessageText = (level: string): string => {
        let string = "";
        messages[level].forEach((message: { value: string }) => {
            string = string.concat(message.value);
        });
        const translatedMessage = t(string);

        navigator.clipboard.writeText(translatedMessage);

        return translatedMessage;
    };

    const hideMessage = (level: string) => {
        messagingService.hideMessages(level);
    };

    const isErrorMessagePresent = (): boolean => {
        return messages.error.length > 0;
    };

    const isInfoMessagePresent = (): boolean => {
        return messages.info.length > 0;
    };

    const isAlertMessagePresent = (): boolean => {
        return messages.alert.length > 0;
    };

    const discardChanges = (level: string) => {

        // Implement state management for discardChanges
        hideMessage(level);
        if (history.location.pathname.includes('/default/patient/search')) {
            history.push('/default/patient/search');
        } else {
            const newPatientUuid = messagingService.getNewPatientUuid(); // Assuming messagingService has a method to get newPatientUuid
            history.push(`/default/patient/${newPatientUuid}/dashboard`);
        }
        history.replace({ ...history.location, state: newState });

        hideMessage(level);

        // Implement navigation logic for patient search or dashboard
        if (history.location.pathname.includes('/default/patient/search')) {
            history.push('/default/patient/search');
        } else {
            const newPatientUuid = history.location.state?.newPatientUuid;
            if (newPatientUuid) {
                history.push(`/default/patient/${newPatientUuid}/dashboard`);
            } else {
                console.error('New patient UUID is missing');
            }
        }
    };
        hideMessage(level);

        if (history.location.pathname.includes('/default/patient/search')) {
            history.push('/default/patient/search');
        } else {
            const newPatientUuid = messagingService.getNewPatientUuid(); // Assuming messagingService has a method to get newPatientUuid
            if (newPatientUuid) {
                history.push(`/default/patient/${newPatientUuid}/dashboard`);
            } else {
                console.error('New patient UUID is missing');
            }
        }

    return (
        <div>
            {/* Render messages and other UI elements here */}
        </div>
    );
};

export default MessageController;
