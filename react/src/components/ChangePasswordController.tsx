import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import sessionService from '../services/sessionService';
import authenticator from '../services/authenticator';
import userService from '../services/userService';
import messagingService from '../services/messagingService';

const ChangePasswordController: React.FC = () => {
    const [loginInfo, setLoginInfo] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [passwordDoesNotMatch, setPasswordDoesNotMatch] = useState(false);
    const [passwordPolicies, setPasswordPolicies] = useState<string[]>([]);
    const [passwordLength, setPasswordLength] = useState<number | null>(null);
    const [passwordRegex, setPasswordRegex] = useState<string | null>(null);
    const history = useHistory();

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
        setLoginInfo({
            oldPassword: '',
            newPassword: '',
            confirmPassword: ''
        });
    };

    const convertPasswordPolicies = (policies: any) => {
        const newPolicies: string[] = [];
        Object.keys(policies).forEach(key => {
            const value = policies[key];
            switch (key) {
                case "security.passwordCannotMatchUsername":
                    if (value === "true") newPolicies.push('PASSWORD_SHOULD_NOT_MATCH_USER_NAME');
                    break;
                case "security.passwordMinimumLength":
                    setPasswordLength(value);
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
            userService.getPasswordPolicies().then(response => {
                convertPasswordPolicies(response.data);
            });
            sessionService.loadCredentials().then(() => {

                // Assuming we need to handle any post-credential loading logic here
                // For now, we will just log the success of loading credentials
                console.log('Credentials loaded successfully');
            });
        }).catch(() => {
            window.location.href = "../home/index.html#/login";
        });
    }, []);

            <h2>Change Password</h2>
            <form onSubmit={(e) => { e.preventDefault(); changePassword(); }}>
        
                    <label htmlFor="oldPassword">Old Password:</label>
                    <input
                        type="password"
                        id="oldPassword"
                        value={loginInfo.oldPassword}
                        onChange={(e) => setLoginInfo({ ...loginInfo, oldPassword: e.target.value })}
                        required
                    />
                </div>
        
                    <label htmlFor="newPassword">New Password:</label>
                    <input
                        type="password"
                        id="newPassword"
                        value={loginInfo.newPassword}
                        onChange={(e) => setLoginInfo({ ...loginInfo, newPassword: e.target.value })}
                        required
                    />
                </div>
        
                    <label htmlFor="confirmPassword">Confirm Password:</label>
                    <input
                        type="password"
                        id="confirmPassword"
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
        
                    <label htmlFor="oldPassword">Old Password:</label>
                    <input
                        type="password"
                        id="oldPassword"
                        value={loginInfo.oldPassword}
                        onChange={(e) => setLoginInfo({ ...loginInfo, oldPassword: e.target.value })}
                        required
                    />
                </div>
        
                    <label htmlFor="newPassword">New Password:</label>
                    <input
                        type="password"
                        id="newPassword"
                        value={loginInfo.newPassword}
                        onChange={(e) => setLoginInfo({ ...loginInfo, newPassword: e.target.value })}
                        required
                    />
                </div>
        
                    <label htmlFor="confirmPassword">Confirm Password:</label>
                    <input
                        type="password"
                        id="confirmPassword"
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
