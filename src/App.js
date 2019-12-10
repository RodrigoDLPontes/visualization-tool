/* global process */

import './css/App.css';
import { Route, BrowserRouter as Router, Switch } from 'react-router-dom';
import AlgoScreen from './screens/AlgoScreen';
import Home from './screens/Home';
import React from 'react';

const App = () => {
	return (
		<Router basename={process.env.PUBLIC_URL + '/'}>
			<Switch>
				<Route exact path="/" component={Home} />
				<Route path="/about" component={Home} />
				<Route component={AlgoScreen} />
			</Switch>
		</Router>
	);
};

export default App;
