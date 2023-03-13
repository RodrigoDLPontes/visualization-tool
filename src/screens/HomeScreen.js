import '../css/App.css';
import { Link, Route, Switch } from 'react-router-dom';
import { algoList, algoMap } from '../AlgoList';
import AboutScreen from './AboutScreen';
import Footer from '../components/Footer';
import Header from '../components/Header';
import React from 'react';

const HomeScreen = () => (
	<div className="container">
		<Header />
		<div className="content">
			<Switch>
				<Route exact path="/">
					<div className="outer-flex">
						<div className="inner-flex">
							{algoList.map((name, idx) =>
								algoMap[name] ? (
									<Link to={`/${name}`} key={idx}>
										<input
											className="button"
											type="button"
											value={algoMap[name][0]}
											style= {algoMap[name][0] === 'Bogo Sort' || algoMap[name][0] === 'LVA' || algoMap[name][0] === 'Non-Linear Probing' ? {color : "red"} : {}}
										/>
									</Link>
								) : (
									<div key={idx} className="divider">
										<span>{name}</span>
									</div>
								),
							)}
						</div>
					</div>
				</Route>
				<Route path="/about">
					<AboutScreen />
				</Route>
			</Switch>
		</div>
		<Footer />
	</div>
);

export default HomeScreen;
