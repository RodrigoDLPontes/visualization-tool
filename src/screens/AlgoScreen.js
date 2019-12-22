import '../css/AlgoScreen.css';
import AnimationManager from '../anim/AnimationMain';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import React from 'react';
import algoList from '../AlgoList';
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
		};
	}

	toggleExamples() {
		this.setState(state => ({ examplesEnabled: !state.examplesEnabled }));
	}

	componentDidMount() {
		if (algoList[this.state.algoName]) {
			this.animManag = new AnimationManager(this.canvasRef, this.animBarRef);

			this.currentAlg = new algoList[this.state.algoName][1](
				this.animManag,
				this.canvasRef.current.width,
				this.canvasRef.current.height
			);
		}
	}

	render() {
		const algoName = this.state.algoName;
		if (!algoList[algoName]) {
			return <h1>404!</h1>;
		}

		const header = algoList[algoName][2]
			? algoList[algoName][2]
			: algoList[algoName][0];
		return (
			<div className="VisualizationMainPage">
				<div id="container">
					<div id="header">
						<h1>{header}</h1>
					</div>

					<div id="mainContent">
						<div id="algoControlSection">
							<table id="AlgorithmSpecificControls"></table>
							{modals[algoName] && (
								<button
									className={this.state.examplesEnabled ? 'selected' : ''}
									id="examplesButton"
									onClick={() => this.toggleExamples()}
								></button>
							)}
						</div>

						<canvas id="canvas" width="1000" height="503" ref={this.canvasRef}></canvas>

						<div id="generalAnimationControlSection">
							<table id="GeneralAnimationControls" ref={this.animBarRef}></table>
						</div>
					</div>

					<div
						id="examplesModal"
						className={`modal ${this.state.examplesEnabled ? 'show' : ''}`}
					>
						<div className="modal-content">{modals[algoName]}</div>
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
}

AlgoScreen.propTypes = {
	location: PropTypes.object,
};

export default AlgoScreen;
