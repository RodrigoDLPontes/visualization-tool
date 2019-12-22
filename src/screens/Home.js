import '../css/App.css';
import { Link, Route, Switch } from 'react-router-dom';
import AboutScreen from './AboutScreen';
import React from 'react';
import algoList from '../AlgoList';

const Home = () => (
	<div className="container">
		<div className="header">
			<h1>CS1332 Data Structures Visualizations</h1>
		</div>
		<div className="menu">
			<ul>
				<li>
					<Link to="/">Home</Link>
				</li>
				<li>
					<Link to="/about">About</Link>
				</li>
			</ul>
		</div>

		<div className="content">
			<Switch>
				<Route exact path="/">
				{
					Object.entries(algoList).map(([name, disp], idx) => 
						<Link to={`/${name}`} key={idx}>
							<input className="button" type="button" value={disp[0]} />
						</Link>
					)
				}
				</Route>
				<Route path="/about">
					<AboutScreen />
				</Route>
			</Switch>
		</div>

		<div className="footer">
			Copyright 2011 <a href="http://www.cs.usfca.edu/galles">David Galles</a>
		</div>
	</div>
);

export default Home;
