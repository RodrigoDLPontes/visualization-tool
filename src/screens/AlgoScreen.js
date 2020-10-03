import '../css/AlgoScreen.css';
import '../css/App.css';
import AnimationManager from '../anim/AnimationMain';
import Footer from '../components/Footer';
import Header from '../components/Header';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import React from 'react';
import ReactGA from 'react-ga';
import { algoMap } from '../AlgoList';
import modals from '../examples/ExampleModals';

class AlgoScreen extends React.Component {
	constructor(props) {
		super(props);

		const algoName = props.location.pathname.slice(1);
		this.canvasRef = React.createRef();
		this.animBarRef = React.createRef();

		this.state = {
			algoName: algoName,
			examplesEnabled: false,
			width: 0,
		};
		ReactGA.pageview(algoName);
	}

	componentDidMount() {
		if (algoMap[this.state.algoName]) {
			this.animManag = new AnimationManager(this.canvasRef, this.animBarRef);

			this.currentAlg = new algoMap[this.state.algoName][1](
				this.animManag,
				this.canvasRef.current.width,
				this.canvasRef.current.height,
			);
			window.addEventListener('resize', this.updateDimensions);
		}
	}

	componentWillUnmount() {
		window.removeEventListener('resize', this.updateDimensions);
	}

	updateDimensions = () => {
		this.animManag.changeSize(document.body.clientWidth);
	};

	render() {
		const algoName = this.state.algoName;
		if (!algoMap[algoName]) {
			return (
				<div className="container">
					<Header />
					<div className="content">
						<div className="four-o-four">
							<h1>404!</h1>
							<h3>
								Algorithm not found! Click <Link to="/">here</Link> to return to the
								home screen and choose another algorithm.
							</h3>
						</div>
					</div>
					<Footer />
				</div>
			);
		}

		const header = algoMap[algoName][2] ? algoMap[algoName][2] : algoMap[algoName][0];
		return (
			<div className="VisualizationMainPage">
				<div id="container">
					<div id="header">
						<h1>
							<Link to="/">&#x3008;</Link>&nbsp;&nbsp;{header}
						</h1>
					</div>

					<div id="mainContent">
						<div id="algoControlSection">
							<table id="AlgorithmSpecificControls"></table>
							{modals[algoName] && (
								<button
									className={this.state.examplesEnabled ? 'selected' : ''}
									id="examplesButton"
									onClick={this.toggleExamples}
								></button>
							)}
						</div>

						<div className="viewport">
							<canvas
								id="canvas"
								width={this.state.width}
								height="505"
								ref={this.canvasRef}
							></canvas>
							{this.state.examplesEnabled && (
								<div className="modal">
									<div className="modal-content">{modals[algoName]}</div>
								</div>
							)}
						</div>

						<div id="generalAnimationControlSection">
							<table id="GeneralAnimationControls" ref={this.animBarRef}></table>
						</div>
					</div>

					<div id="footer">
						<p>
							<Link to="/">Return to Home Page</Link>
						</p>
					</div>
				</div>
			</div>
		);
	}

	toggleExamples = () => this.setState(state => ({ examplesEnabled: !state.examplesEnabled }));
}

AlgoScreen.propTypes = {
	location: PropTypes.object,
};

export default AlgoScreen;
