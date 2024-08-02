import { useState } from 'react';
import { createPortal } from 'react-dom';

interface ConfirmBoxConfig {
    scope: any;
    actions: any;
    className?: string;
}

const ConfirmBox = ({ config }: { config: ConfirmBoxConfig }) => {
    const [isOpen, setIsOpen] = useState(true);

    const close = () => {
        setIsOpen(false);

        // Perform any additional cleanup logic if necessary
        if (config.scope && typeof config.scope.$destroy === 'function') {
            config.scope.$destroy();
        }

    if (!isOpen) return null;

    return createPortal(
        <div className={`ngdialog ${config.className || 'ngdialog-theme-default'}`}>
            <div className="ngdialog-content">
                {/* SECOND AGENT: [MISSING CONTEXT] - Render the content based on the scope and actions */}
            </div>
            <button onClick={close}>Close</button>
        </div>,
        document.body
    );
};

export default ConfirmBox;
