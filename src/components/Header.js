import { Link } from 'react-router-dom';
import React from 'react';

class Header extends React.Component {
    
	state = { menuVisible: null };

    render() {
        const menuClass = {null: '', true: 'show', false: 'hide'};

        return (
            <React.Fragment>
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
                        <li>
                            <a href="https://github.com/RodrigoDLPontes/visualization-tool">Source Code</a>
                        </li>
                    </ul>
                </div>
            </React.Fragment>
        );
    }

	toggleMenu = () => this.setState(state => ({ menuVisible: !state.menuVisible }));
}

export default Header;