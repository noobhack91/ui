import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useMessagingService from '../services/messagingService';
import appService from '../services/appService';

interface EditObservationFormControllerProps {
    resetContextChangeHandler: () => void;
    shouldPromptBeforeClose: boolean;
    shouldPromptBrowserReload: boolean;
    hasVisitedConsultation: boolean;
}

const EditObservationFormController: React.FC<EditObservationFormControllerProps> = ({
    resetContextChangeHandler,
    shouldPromptBeforeClose,
    shouldPromptBrowserReload,
    hasVisitedConsultation
}) => {
    const { t } = useTranslation();
    const { showMessage } = useMessagingService();
    const [configForPrompting, setConfigForPrompting] = useState<boolean | null>(null);

    useEffect(() => {
        const configValue = appService.getAppDescriptor().getConfigValue('showSaveConfirmDialog');
        setConfigForPrompting(configValue);

        const handleBeforeUnload = (event: BeforeUnloadEvent) => {
            if (configForPrompting && shouldPromptBrowserReload) {
                const message = t("BROWSER_CLOSE_DIALOG_MESSAGE_KEY");
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
            if (window.confirm(t("POP_UP_CLOSE_DIALOG_MESSAGE_KEY"))) {
                if (!hasVisitedConsultation) {
                    shouldPromptBrowserReload = false;
                }
                return true;
            }
            return false;
        }
    };

    return (
        <div>

            <form>
                <div className="form-group">
                    <label htmlFor="observationInput">{t('OBSERVATION_LABEL')}</label>
                    <input
                        type="text"
                        className="form-control"
                        id="observationInput"
                        placeholder={t('OBSERVATION_PLACEHOLDER')}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="commentsInput">{t('COMMENTS_LABEL')}</label>
                    <textarea
                        className="form-control"
                        id="commentsInput"
                        rows={3}
                        placeholder={t('COMMENTS_PLACEHOLDER')}
                    ></textarea>
                </div>
                <button type="submit" className="btn btn-primary">
                    {t('SAVE_BUTTON')}
                </button>
            </form>
        </div>
    );
};

export default EditObservationFormController;
