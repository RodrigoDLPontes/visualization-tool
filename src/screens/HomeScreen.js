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
											style= {algoMap[name][0] === 'Bogo Sort' || algoMap[name][0] === 'LVA' || algoMap[name][0] === 'Non-Linear Probing' ? 
												{ 
													background : "linear-gradient(90deg, rgba(255,0,0,1) 0%, rgba(255,154,0,1) 10%, rgba(208,222,33,1) 20%, rgba(79,220,74,1) 30%, rgba(63,218,216,1) 40%, rgba(47,201,226,1) 50%, rgba(28,127,238,1) 60%, rgba(95,21,242,1) 70%, rgba(186,12,248,1) 80%, rgba(251,7,217,1) 90%, rgba(255,0,0,1) 100%)",
													color: 'white',
													filter: 'none',
												} : {}
											}
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
