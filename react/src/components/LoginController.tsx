import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';

const LoginController: React.FC = () => {
    const location = useLocation();
    const [showLoginMessage, setShowLoginMessage] = useState<boolean>(false);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        if (params.get('showLoginMessage')) {
            setShowLoginMessage(true);
        }
    }, [location.search]);

    const handleLogin = async (username: string, password: string) => {
        try {
            const response = await axios.post('/api/login', { username, password });
            // Handle successful login
        } catch (error) {
            // Handle login error
        }
    };

    return (
        <div>
            {showLoginMessage && <p>Please log in to continue</p>}
            <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const username = formData.get('username') as string;
                const password = formData.get('password') as string;
                handleLogin(username, password);
            }}>
                <div>
                    <label htmlFor="username">Username:</label>
                    <input type="text" id="username" name="username" required />
                </div>
                <div>
                    <label htmlFor="password">Password:</label>
                    <input type="password" id="password" name="password" required />
                </div>
                <button type="submit">Login</button>
            </form>
        </div>
    );
};

export default LoginController;
