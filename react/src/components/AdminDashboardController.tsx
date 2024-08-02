import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import appService from '../services/appService';

interface Extension {
    id: string;
    label: string;
    url: string;
}

const AdminDashboardController: React.FC = () => {
    const [appExtensions, setAppExtensions] = useState<Extension[]>([]);
    const location = useLocation();

    useEffect(() => {
        const fetchExtensions = async () => {
            const extensionPointId = location.state?.extensionPointId;
            if (extensionPointId) {
                const extensions = appService.getAppDescriptor().getExtensions(extensionPointId, "link") || [];
                setAppExtensions(extensions);
            }
        };

        fetchExtensions();
    }, [location]);

    return (
        <div>
            {appExtensions.map(extension => (
                <a key={extension.id} href={extension.url}>
                    {extension.label}
                </a>
            ))}
        </div>
    );
};

export default AdminDashboardController;
