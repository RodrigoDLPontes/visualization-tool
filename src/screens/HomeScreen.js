import '../css/App.css';
import { Link, Route, Switch } from 'react-router-dom';
import { algoList, algoMap } from '../AlgoList';
import AboutScreen from './AboutScreen';
import { DiCodeBadge } from 'react-icons/di';
import Footer from '../components/Footer';
import Header from '../components/Header';
import React from 'react';

const HomeScreen = ({ theme, toggleTheme }) => (
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
					<div className="outer-flex">
						<div className="inner-flex">
							{algoList.map((name, idx) =>
								algoMap[name] ? (
									<Link
										to={`/${name}`}
										key={idx}
										style={{ textDecoration: 'none' }}
									>
										<button className="button">
											<div className="algo-name">{algoMap[name][0]}</div>
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
