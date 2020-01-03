import '../css/App.css';
import { Link, Route, Switch } from 'react-router-dom';
import { algoList, algoMap } from '../AlgoList';
import AboutScreen from './AboutScreen';
import React from 'react';

class Home extends React.Component {

	state = { menuVisible: null };

	render() {
		const menuClass = {null: '', true: 'show', false: 'hide'};
		return (
			<div className="container">
				<div className="header">
					<button
						className={this.state.menuVisible ? 'selected' : ''}
						onClick={this.toggleMenu}
					></button>
					<h1>CS1332 Data Structures and Algorithms Visualizations</h1>
				</div>
				<div className={`menu ${menuClass[this.state.menuVisible]}`}>
					<ul>
						<li>
							<Link to="/" onClick={this.toggleMenu}>Home</Link>
						</li>
						<li>
							<Link to="/about" onClick={this.toggleMenu}>About</Link>
						</li>
					</ul>
				</div>

				<div className="content">
					<Switch>
						<Route exact path="/">
							<div className="outerFlex">
								<div className="innerFlex">
								{
									algoList.map((name, idx) => algoMap[name] ?
										<Link to={`/${name}`} key={idx}>
											<input className="button" type="button" value={algoMap[name][0]} />
										</Link>
										:
										<div key={idx} className="divider">
											<span>{name}</span>
										</div>
									)
								}
								</div>
							</div>
						</Route>
						<Route path="/about">
							<AboutScreen />
						</Route>
					</Switch>
				</div>

				<div className="footer">
					Copyright 2019 <a href="https://rodrigodlpontes.github.io/website/">Rodrigo Pontes</a>, Copyright 2011 <a href="http://www.cs.usfca.edu/galles">David Galles</a>
				</div>
			</div>
		);
	}

	toggleMenu = () => this.setState(state => ({ menuVisible: !state.menuVisible }));
}

export default Home;
