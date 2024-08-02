import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface ConfirmBoxConfig {
    scope: any;
    actions: any;
    className?: string;
}

const useConfirmBox = () => {
    const [dialog, setDialog] = useState<HTMLElement | null>(null);
    const [config, setConfig] = useState<ConfirmBoxConfig | null>(null);

    useEffect(() => {
        if (dialog && config) {
            const confirmBoxScope = { ...config.scope, close };
            const actions = config.actions;

            const close = () => {
                if (dialog) {
                    document.body.removeChild(dialog);
                    setDialog(null);
                }
            };

            const dialogElement = document.createElement('div');
            dialogElement.className = config.className || 'ngdialog-theme-default';
            document.body.appendChild(dialogElement);
            setDialog(dialogElement);

            return () => {
                if (dialogElement) {
                    document.body.removeChild(dialogElement);
                }
            };
        }
    }, [dialog, config]);

    const confirmBox = (config: ConfirmBoxConfig) => {
        setConfig(config);
    };

    return { confirmBox };
};

export default useConfirmBox;
