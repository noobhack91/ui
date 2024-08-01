import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import appService from '../../services/appService';

interface EditObservationFormControllerProps {
    shouldPromptBeforeClose: boolean;
    shouldPromptBrowserReload: boolean;
    resetContextChangeHandler: () => void;
}

const EditObservationFormController: React.FC<EditObservationFormControllerProps> = ({
    shouldPromptBeforeClose,
    shouldPromptBrowserReload,
    resetContextChangeHandler,
}) => {
    const { t } = useTranslation();
    const history = useHistory();
    const [configForPrompting, setConfigForPrompting] = useState<boolean>(false);

    useEffect(() => {
        const configValue = appService.getAppDescriptor().getConfigValue('showSaveConfirmDialog');
        setConfigForPrompting(configValue);

        const handleBeforeUnload = (event: BeforeUnloadEvent) => {
            if (configForPrompting && shouldPromptBrowserReload) {
                const message = t('BROWSER_CLOSE_DIALOG_MESSAGE_KEY');
                event.returnValue = message;
                return message;
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [configForPrompting, shouldPromptBrowserReload, t]);

    const directivePreCloseCallback = () => {
        resetContextChangeHandler();
        if (configForPrompting && shouldPromptBeforeClose) {
            if (window.confirm(t('POP_UP_CLOSE_DIALOG_MESSAGE_KEY'))) {
                // SECOND AGENT: [MISSING CONTEXT] - Handle the case where $rootScope.hasVisitedConsultation is true
                return true;
            }
            return false;
        }
    };

    return (
        <div>

            <form>
                <div className="form-group">
                    <label htmlFor="observation">{t('OBSERVATION_LABEL')}</label>
                    <input type="text" className="form-control" id="observation" name="observation" />
                </div>
                <div className="form-group">
                    <label htmlFor="notes">{t('NOTES_LABEL')}</label>
                    <textarea className="form-control" id="notes" name="notes"></textarea>
                </div>
                <button type="submit" className="btn btn-primary">{t('SAVE_BUTTON')}</button>
                <button type="button" className="btn btn-secondary" onClick={directivePreCloseCallback}>{t('CANCEL_BUTTON')}</button>
            </form>
        </div>
    );
};

export default EditObservationFormController;
