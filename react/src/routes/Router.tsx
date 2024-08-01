import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import SearchPatient from '../components/SearchPatient';
import CreatePatient from '../components/CreatePatient';
import EditPatient from '../components/EditPatient';
import Visit from '../components/Visit';
import NotImplemented from '../components/NotImplemented';

const AppRouter: React.FC = () => {
    return (
        <Router>
            <Switch>
                <Route path="/search" exact component={SearchPatient} />
                <Route path="/patient/new" exact component={CreatePatient} />
                <Route path="/patient/:patientUuid/edit" exact component={EditPatient} />
                <Route path="/patient/:patientUuid/visit" exact component={Visit} />
                <Route path="/patient/:patientUuid/printSticker" exact component={NotImplemented} />
                <Route path="/" render={() => <div>404 Not Found</div>} />
            </Switch>
        </Router>
    );
};

export default AppRouter;
