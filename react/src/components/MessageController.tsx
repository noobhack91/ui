import React, { useState, useEffect } from 'react';
import useMessagingService from '../services/messagingService';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';

const MessageController: React.FC = () => {
    const { messages, hideMessages } = useMessagingService();
    const { t } = useTranslation();
    const history = useHistory();

    const getMessageText = (level: keyof typeof messages) => {
        let string = "";
        messages[level].forEach((message) => {
            string = string.concat(message.value);
        });
        const translatedMessage = t(string);

        navigator.clipboard.writeText(translatedMessage);

        return translatedMessage;
    };

    const isErrorMessagePresent = () => {
        return messages.error.length > 0;
    };

    const isInfoMessagePresent = () => {
        return messages.info.length > 0;
    };

    const isAlertMessagePresent = () => {
        return messages.alert.length > 0;
    };

    const discardChanges = (level: keyof typeof messages) => {

        // Set the state to discard changes
        $state.discardChanges = true;
        
        // Navigate based on the state
        if ($state.isPatientSearch) {
            history.push('/default/patient/search');
        } else {
            history.push(`/default/patient/${$state.newPatientUuid}/dashboard`);
        }
        hideMessages(level);

        // Handle navigation based on state
        if (state.isPatientSearch) {
            history.push('/default/patient/search');
        } else {
            const newPatientUuid = state.newPatientUuid || 'defaultUuid'; // Assuming a default UUID if not provided
            history.push(`/default/patient/${newPatientUuid}/dashboard`);
        }
    };
        hideMessages(level);

        // Handle navigation based on state
        if ($state.isPatientSearch) {
            history.push('/default/patient/search');
        } else {
            const newPatientUuid = $state.newPatientUuid || 'defaultUuid'; // Assuming a default UUID if not provided
            history.push(`/default/patient/${newPatientUuid}/dashboard`);
        }

    return (
        <div>
            {/* Render messages and other UI elements here */}
        </div>
    );
};

export default MessageController;
