import {
	BsFillHouseFill,
	BsFillSunFill,
	BsGithub,
	BsInfoCircleFill,
	BsMoonFill,
} from 'react-icons/bs';
import { IconContext } from 'react-icons';
import { Link } from 'react-router-dom';
import React from 'react';
import { RxHamburgerMenu } from 'react-icons/rx';

class Header extends React.Component {
	state = {
		menuVisible: null,
		theme: 'light',
	};

	render() {
		const theme = this.props.theme;
		const toggleTheme = this.props.toggleTheme;
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
						{theme === 'light' ? (
							<BsFillSunFill size={31} onClick={toggleTheme} color="#f9c333" />
						) : (
							<BsMoonFill size={29} onClick={toggleTheme} color="#d4f1f1" />
						)}
					</div>
				</div>
				<div className={`menu ${menuClass[this.state.menuVisible]}`}>
					<ul>
						<li>
							<Link to="/" onClick={this.toggleMenu}>
								<BsFillHouseFill size={20} />
								&nbsp;&nbsp;Home
							</Link>
						</li>
						<li>
							<Link to="/about" onClick={this.toggleMenu}>
								<BsInfoCircleFill size={20} />
								&nbsp;&nbsp;About
							</Link>
						</li>
						<li>
							<a href="https://github.com/RodrigoDLPontes/visualization-tool">
								<BsGithub size={20} />
								&nbsp;&nbsp;Source Code
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
