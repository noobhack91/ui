import React, { useContext, useEffect } from 'react';
import { UserContext } from '../context/UserContext';
import _ from 'lodash';

interface ShowIfPrivilegeProps {
    showIfPrivilege: string;
}

const ShowIfPrivilege: React.FC<ShowIfPrivilegeProps> = ({ showIfPrivilege, children }) => {
    const { currentUser } = useContext(UserContext);

    useEffect(() => {
        const privileges = showIfPrivilege.split(',');
        let requiredPrivilege = false;

        if (currentUser) {
            const allTypesPrivileges = _.map(currentUser.privileges, 'name');
            const intersect = _.intersectionWith(allTypesPrivileges, privileges, _.isEqual);
            requiredPrivilege = intersect.length > 0;
        }

        if (!requiredPrivilege) {
            // Hide the element if the user does not have the required privilege
            element.style.display = 'none';
        }
    }, [showIfPrivilege, currentUser]);

    return (
        <>

            {requiredPrivilege ? children : null}
        </>
    );
};

export default ShowIfPrivilege;
