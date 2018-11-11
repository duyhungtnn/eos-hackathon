import React from 'react';
import ReactDOM from 'react-dom';
import Index from './pages/index';
/*
import { BrowserRouter as Router, Route, Link } from 'react-router-dom';


const App = () => (
  <Router>
  <div>

  <Route exact path="/" component={Index} />
  <Route path="/about" component={Index} />
  </div>
  </Router>
)*/
ReactDOM.render(<Index/>, document.getElementById('root'));

// Ember Style Router:
