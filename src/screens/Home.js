import '../css/App.css';
import { Link, Route, Switch } from 'react-router-dom';
import AboutContent from './AboutContent';
import { AlgorithmList } from '../AlgorithmList';
import React from 'react';

const Home = () => {
	const buttons = Object.entries(AlgorithmList).map(([name, disp], idx) => {
		return (
			<Link to={`/${name}`} key={idx}>
				<input className="button" type="button" value={disp[0]} />
			</Link>
		);
	});
	return (
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
						{buttons}
					</Route>
					<Route path="/about">
						<AboutContent />
					</Route>
				</Switch>
			</div>

			<div className="footer">
				Copyright 2011 <a href="http://www.cs.usfca.edu/galles">David Galles</a>
			</div>
		</div>
	);
};

export default Home;
