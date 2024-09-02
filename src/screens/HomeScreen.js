import '../css/App.css';
import { Link, Route, Switch } from 'react-router-dom';
import React, { useState } from 'react';
import { algoList, algoMap } from '../AlgoList';
import AboutScreen from './AboutScreen';
import { DiCodeBadge } from 'react-icons/di';
import Footer from '../components/Footer';
import Header from '../components/Header';

const HomeScreen = ({ theme, toggleTheme }) => {
	const [dsaFilter, setDsaFilter] = useState('');

	const filteredAlgoList = algoList.filter(name => {
		if (dsaFilter) {
			return (
				algoMap[name] &&
				(name.toLowerCase().includes(dsaFilter.toLowerCase()) ||
					algoMap[name][0].toLowerCase().includes(dsaFilter.toLowerCase()))
			);
		}
		return true;
	});

	return (
		<div className="container">
			<Header theme={theme} toggleTheme={toggleTheme} />
			<div className="content">
				<Switch>
					<Route exact path="/">
						{/* <div className="banner-container">
							<div className="banner">
								<span role="img" aria-label="nerd">
									🤓
								</span>
								<span> Studying for the final? </span>
								<a
									href="https://forms.gle/j9iMhFi8drjf2PU86"
									target="_blank"
									rel="noreferrer"
								>
									Tell us how we can improve!
								</a>
							</div>
						</div> */}
						<input
							className="dsa-filter"
							placeholder="🔎 Search..."
							type="search"
							onChange={e => setDsaFilter(e.target.value)}
						/>
						<div className="outer-flex">
							<div className="inner-flex">
								{filteredAlgoList.length ? (
									filteredAlgoList.map((name, idx) =>
										algoMap[name] ? (
											<Link
												to={`/${name}`}
												key={idx}
												style={{ textDecoration: 'none' }}
											>
												<button
													className="button"
													style={
														algoMap[name][0] === 'Bogo Sort' ||
														algoMap[name][0] === 'LVA' ||
														algoMap[name][0] === 'Non-Linear Probing'
															? {
																	background:
																		'linear-gradient(90deg, rgba(255,0,0,1) 0%, rgba(255,154,0,1) 10%, rgba(208,222,33,1) 20%, rgba(79,220,74,1) 30%, rgba(63,218,216,1) 40%, rgba(47,201,226,1) 50%, rgba(28,127,238,1) 60%, rgba(95,21,242,1) 70%, rgba(186,12,248,1) 80%, rgba(251,7,217,1) 90%, rgba(255,0,0,1) 100%)',
																	color: 'white',
																	filter: 'none',
															  }
															: {}
													}
												>
													<div className="algo-name">
														{algoMap[name][0]}
													</div>
													{algoMap[name][2] && (
														<span className="pseudocode-icon">
															<DiCodeBadge size={36} />
														</span>
													)}
												</button>
											</Link>
										) : (
											<div key={idx} className="divider">
												<span>{name}</span>
											</div>
										),
									)
								) : (
									<span className="no-results">
										No results found. Please try a different search term.
									</span>
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
};

export default HomeScreen;
