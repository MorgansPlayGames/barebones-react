import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import { API } from './utils/API';
import { useAuth } from './utils/context';
import { Account, Home, LoginPassport, Logout } from './Pages/';
import PrivateRoute from './Components/PrivateRoute';
import Navbar from './Components/Navbar';



function App() {
  const [state, setState] = useState({
    ready: false,
  });
  const { auth, setAuth } = useAuth();
  const [userData, setUserData] = useState({
    firstName: "John",
    lastName: "Doe",
    username:'JoeyDoey',
    bio:'Hi, I am John, and I like to take pictures of things. Mostly of flip flops in sand, or maybe a microwave with a potato init. What I am trying to say, is I like to have money, and you can give it to me, so give me now.',
    email: 'JoDo@generic.gov',
  })

  const [logBool, setLogBool] = useState(false);

  useEffect(() => {
    const res = API.getAuth();
    if (res) {
      setAuth({ ...auth, ...res });
    }
    setState({ ...state, ready: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!state.ready) {
    return null;
  }

  return (
    <Router>
      <Navbar logBool={logBool} />
      <Switch>
        <Route exact path="/" render={(props) => (
          <Home {...props} />
        )}
        />
        <Route exact path="/login"> <LoginPassport /> </Route>
        <Route exact path="/logout" ><Logout logBool={logBool} setLogBool={setLogBool} /></Route>
        <PrivateRoute exact path='/account' ><Account userData={userData} setUserData={setUserData} /></PrivateRoute>
        <Route exact path="*" render={(props) => (
          <Home {...props} />
        )}
        />

      </Switch>
    </Router>
  );
}

export default App;
