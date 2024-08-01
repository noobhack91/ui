import React, { useEffect, useState } from 'react';
import appService from '../services/appService';

interface Extension {
    id: string;
    description: string;
    // Add other properties as needed
}

const AdminDashboardController: React.FC = () => {
    const [appExtensions, setAppExtensions] = useState<Extension[]>([]);

    useEffect(() => {
        const fetchExtensions = async () => {
            try {
                const appDescriptor = appService.getAppDescriptor();
                const extensions = appDescriptor.getExtensions('adminDashboard', 'link') || [];
                setAppExtensions(extensions);
            } catch (error) {
                console.error('Error fetching app extensions:', error);
            }
        };

        fetchExtensions();
    }, []);

    return (
        <div>
            {appExtensions.map((extension) => (
                <div key={extension.id}>
                    {extension.description}
                </div>
            ))}
        </div>
    );
};

export default AdminDashboardController;
