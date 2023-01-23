import './css/App.css';
import { Route, BrowserRouter as Router, Switch } from 'react-router-dom';
import AlgoScreen from './screens/AlgoScreen';
import HomeScreen from './screens/HomeScreen';
import React from 'react';
import ReactGA from 'react-ga';
import { ThemeProvider } from 'react-hook-theme';

const App = () => {
	ReactGA.initialize('UA-164374852-1');
	ReactGA.pageview('home');

	return (
		<ThemeProvider
    		options={{
        		theme: 'dark',
        		save: true,
    		}}
		>
			<Router basename={process.env.PUBLIC_URL + '/'}>
				<Switch>
					<Route exact path={['/', '/about']} component={HomeScreen} />
					<Route component={AlgoScreen} />
				</Switch>
			</Router>
		</ThemeProvider>
	);
};

export default App;
