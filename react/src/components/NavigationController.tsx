import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { sessionService } from '../services/sessionService';
import { appService } from '../services/appService';
import { $sce } from '../services/sceService'; // Assuming $sce is a custom service for handling HTML trust
import { Window } from '../utils/window'; // Assuming Window is a custom utility for window operations

const NavigationController: React.FC = () => {
    const [extensions, setExtensions] = useState<any[]>([]);
    const [hasPrint, setHasPrint] = useState<boolean>(true);
    const history = useHistory();

    useEffect(() => {
        const appDescriptor = appService.getAppDescriptor();
        setExtensions(appDescriptor.getExtensions("org.bahmni.registration.navigation", "link"));

        const path = window.location.pathname;
        setHasPrint(!(path === "/search" || path === "/patient/new"));
    }, []);

    const goTo = (url: string) => {
        history.push(url);
    };

    const htmlLabel = (label: string) => {
        return $sce.trustAsHtml(label);
    };

    const logout = async () => {
        try {
            await sessionService.destroy();
            Window.location = "../home/";
        } catch (error) {
            console.error("Logout failed", error);
        }
    };

    const sync = async () => {
        try {
            // Assuming there's a syncService that handles the synchronization logic
            const response = await syncService.syncData();
            if (response.success) {
                console.log("Data synchronized successfully");
            } else {
                console.error("Data synchronization failed", response.error);
            }
        } catch (error) {
            console.error("An error occurred during synchronization", error);
        }
    };

    return (
        <div>
            {/* Render navigation links */}
            {extensions.map((extension, index) => (
                <div key={index}>
                    <a href="#" onClick={() => goTo(extension.url)}>
                        {htmlLabel(extension.label)}
                    </a>
                </div>
            ))}
            {/* Render logout button */}
            <button onClick={logout}>Logout</button>
            {/* Render sync button */}
            <button onClick={sync}>Sync</button>
        </div>
    );
};

export default NavigationController;
