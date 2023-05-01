import 'react-hook-theme/dist/styles/style.css';
import { IconContext } from 'react-icons';
import { Link } from 'react-router-dom';
import React from 'react';
import ReactGA  from 'react-ga4';
import { RxHamburgerMenu } from 'react-icons/rx';
import { Toggle } from 'react-hook-theme';

class Header extends React.Component {
	state = { menuVisible: null };

	render() {
		const menuClass = { null: '', true: 'show', false: 'hide' };

		return (
			<React.Fragment>
				<div className="header">
					<div id="left">
						<IconContext.Provider value={{ className: 'menu-bar' }}>
							<RxHamburgerMenu onClick={this.toggleMenu} />
						</IconContext.Provider>
					</div>
					<div id="center">
						<h1>CS 1332 Data Structures and Algorithms Visualizations</h1>
					</div>
					<div id="right">
						<Toggle />
					</div>
				</div>
				<div className={`menu ${menuClass[this.state.menuVisible]}`}>
					<ul>
						<li>
							<Link to="/" onClick={this.toggleMenu}>
								Home
							</Link>
						</li>
						<li>
							<Link to="/about" onClick={this.toggleMenu}>
								About
							</Link>
						</li>
						<li>
							<a href="https://github.com/RodrigoDLPontes/visualization-tool">
								Source Code
							</a>
						</li>
					</ul>
				</div>
			</React.Fragment>
		);
	}

	toggleMenu = () => this.setState(state => ({ menuVisible: !state.menuVisible }));
}

export default Header;
