import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import axios from 'axios';
import { useSessionService } from '../services/sessionService';
import { useUserService } from '../services/userService';
import { useMessagingService } from '../services/messagingService';
import { useAuthenticator } from '../services/authenticator';

const ChangePasswordController: React.FC = () => {
    const [loginInfo, setLoginInfo] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
    const [passwordDoesNotMatch, setPasswordDoesNotMatch] = useState(false);
    const [passwordPolicies, setPasswordPolicies] = useState<string[]>([]);
    const [passwordLength, setPasswordLength] = useState<number | undefined>(undefined);
    const [passwordRegex, setPasswordRegex] = useState<string | undefined>(undefined);

    const history = useHistory();
    const sessionService = useSessionService();
    const userService = useUserService();
    const messagingService = useMessagingService();
    const authenticator = useAuthenticator();

    const redirectToHomePage = () => {
        history.push('/dashboard');
    };

    const checkPasswordMatches = () => {
        return loginInfo.newPassword === loginInfo.confirmPassword;
    };

    const changePassword = () => {
        if (!loginInfo.oldPassword || !loginInfo.newPassword || !loginInfo.confirmPassword) {
            return;
        }
        if (checkPasswordMatches()) {
            setPasswordDoesNotMatch(false);
            sessionService.changePassword(loginInfo.oldPassword, loginInfo.newPassword)
                .then(() => {
                    messagingService.showMessage("info", 'CHANGE_PASSWORD_SUCCESSFUL_MESSAGE');
                    clearPasswordFields();
                });
        } else {
            setPasswordDoesNotMatch(true);
        }
    };

    const clearPasswordFields = () => {
        setLoginInfo({ oldPassword: '', newPassword: '', confirmPassword: '' });
    };

    const convertPasswordPolicies = (policies: any) => {
        const newPolicies: string[] = [];
        Object.entries(policies).forEach(([key, value]) => {
            switch (key) {
                case "security.passwordCannotMatchUsername":
                    if (value === "true") newPolicies.push('PASSWORD_SHOULD_NOT_MATCH_USER_NAME');
                    break;
                case "security.passwordMinimumLength":
                    setPasswordLength(Number(value));
                    newPolicies.push('PASSWORD_SHOULD_BE_MINIMUM_CHARACTERS');
                    break;
                case "security.passwordRequiresUpperAndLowerCase":
                    if (value === "true") newPolicies.push('PASSWORD_SHOULD_BE_A_MIX_OF_BOTH_UPPER_CASE_AND_LOWER_CASE');
                    break;
                case "security.passwordRequiresDigit":
                    if (value === "true") newPolicies.push('PASSWORD_SHOULD_CONTAIN_DIGITS');
                    break;
                case "security.passwordRequiresNonDigit":
                    if (value === "true") newPolicies.push('PASSWORD_SHOULD_HAVE_ATLEAST_ONE_NON_DIGIT');
                    break;
                case "security.passwordCustomRegex":
                    if (value) {
                        newPolicies.push('PASSWORD_SHOULD_MATCH_THE_REGEX');
                        setPasswordRegex(value);
                    }
                    break;
                default:
                    break;
            }
        });
        setPasswordPolicies(newPolicies);
    };

    useEffect(() => {
        authenticator.authenticateUser().then(() => {
            userService.getPasswordPolicies().then((response) => {
                convertPasswordPolicies(response.data);
            });
            sessionService.loadCredentials().then(() => {

                // Assuming we need to handle any post-credential loading logic here
                // For now, we don't have any specific actions to take after loading credentials
                // This can be expanded in the future if needed
            });
        }).catch(() => {
            window.location.href = "../home/index.html#/login";
        });
    }, [authenticator, sessionService, userService]);

            <h2>Change Password</h2>
            <form onSubmit={(e) => { e.preventDefault(); changePassword(); }}>
        
                    <label>Old Password:</label>
                    <input
                        type="password"
                        value={loginInfo.oldPassword}
                        onChange={(e) => setLoginInfo({ ...loginInfo, oldPassword: e.target.value })}
                        required
                    />
                </div>
        
                    <label>New Password:</label>
                    <input
                        type="password"
                        value={loginInfo.newPassword}
                        onChange={(e) => setLoginInfo({ ...loginInfo, newPassword: e.target.value })}
                        required
                    />
                </div>
        
                    <label>Confirm New Password:</label>
                    <input
                        type="password"
                        value={loginInfo.confirmPassword}
                        onChange={(e) => setLoginInfo({ ...loginInfo, confirmPassword: e.target.value })}
                        required
                    />
                </div>
                {passwordDoesNotMatch && <p style={{ color: 'red' }}>Passwords do not match!</p>}
                <button type="submit">Change Password</button>
            </form>
    
                <h3>Password Policies</h3>
                <ul>
                    {passwordPolicies.map((policy, index) => (
                        <li key={index}>{policy}</li>
                    ))}
                </ul>
            </div>
        </div>
    return (
        <div>

            <h2>Change Password</h2>
            <form onSubmit={(e) => { e.preventDefault(); changePassword(); }}>
        
                    <label>Old Password:</label>
                    <input
                        type="password"
                        value={loginInfo.oldPassword}
                        onChange={(e) => setLoginInfo({ ...loginInfo, oldPassword: e.target.value })}
                        required
                    />
                </div>
        
                    <label>New Password:</label>
                    <input
                        type="password"
                        value={loginInfo.newPassword}
                        onChange={(e) => setLoginInfo({ ...loginInfo, newPassword: e.target.value })}
                        required
                    />
                </div>
        
                    <label>Confirm New Password:</label>
                    <input
                        type="password"
                        value={loginInfo.confirmPassword}
                        onChange={(e) => setLoginInfo({ ...loginInfo, confirmPassword: e.target.value })}
                        required
                    />
                </div>
                {passwordDoesNotMatch && <p style={{ color: 'red' }}>Passwords do not match!</p>}
                <button type="submit">Change Password</button>
            </form>
            <h3>Password Policies</h3>
            <ul>
                {passwordPolicies.map((policy, index) => (
                    <li key={index}>{policy}</li>
                ))}
            </ul>
        </div>
    );
};

export default ChangePasswordController;
