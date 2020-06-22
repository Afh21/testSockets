import React from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'
import { Notifications } from 'react-push-notification'

import HomeView from './components/Home'
import UserView from './components/User'


function App() {

  return ( 
    <div className="App">
      <Notifications />
      <Router>
        <Switch>
          <Route exact path="/" component={HomeView} />
          <Route path="/user" component={UserView} />
        </Switch>
      </Router>
    </div>
  );
}

export default App;
