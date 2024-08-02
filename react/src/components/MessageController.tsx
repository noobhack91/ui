import React, { useState, useEffect } from 'react';
import messagingService from '../services/messagingService';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';

interface Message {
    value: string;
}

interface Messages {
    error: Message[];
    info: Message[];
    alert: Message[];
}

const MessageController: React.FC = () => {
    const [messages, setMessages] = useState<Messages>({ error: [], info: [], alert: [] });
    const { t } = useTranslation();
    const history = useHistory();

    useEffect(() => {
        setMessages(messagingService.messages);
    }, []);

    const getMessageText = (level: keyof Messages): string => {
        let string = "";
        messages[level].forEach((message) => {
            string = string.concat(message.value);
        });
        const translatedMessage = t(string);

        navigator.clipboard.writeText(translatedMessage);

        return translatedMessage;
    };

    const hideMessage = (level: keyof Messages) => {
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

    const discardChanges = (level: keyof Messages) => {

        // Set discardChanges to true in the state
        $state.discardChanges = true;
        
        // Navigate to the appropriate path based on the state
        if ($state.isPatientSearch) {
            history.push('/default/patient/search');
        } else {
            history.push(`/default/patient/${$state.newPatientUuid}/dashboard`);
        }
        newState[level] = [];
        setMessages(newState);

        hideMessage(level);

        // Implement navigation logic for patient search or dashboard
        if ($state.isPatientSearch) {
            history.push('/default/patient/search');
        } else {
            history.push(`/default/patient/${$state.newPatientUuid}/dashboard`);
        }
    };
        hideMessage(level);

        // Implement navigation logic for patient search or dashboard
        if ($state.isPatientSearch) {
            history.push('/default/patient/search');
        } else {
            history.push(`/default/patient/${$state.newPatientUuid}/dashboard`);
        }

    return (
        <div>
            {/* Render messages and other UI elements here */}
        </div>
    );
};

export default MessageController;
