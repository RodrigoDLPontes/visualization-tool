import Footer from './Footer';
import Header from './Header';
import { Link } from 'react-router-dom';
import React from 'react';

const AlgorithmNotFound404 = () => {
	return (
		<div className="container">
			<Header />
			<div className="content">
				<div className="four-o-four">
					<h1>404!</h1>
					<h3>
						Algorithm not found! Click <Link to="/">here</Link> to return to the home
						screen and choose another algorithm.
					</h3>
				</div>
			</div>
			<Footer />
		</div>
	);
};

export default AlgorithmNotFound404;
