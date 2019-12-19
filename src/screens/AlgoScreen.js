import '../css/AlgoScreen.css';
import { AlgorithmList, isAlgorithm } from '../AlgorithmList';
import { hasModal, modals } from '../examples/ExampleModals';
import AnimationManager from '../anim/AnimationMain';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import React from 'react';

class AlgoScreen extends React.Component {
	constructor(props) {
		super(props);
		const location = props.location;
		this.canvasRef = React.createRef();
		this.animBarRef = React.createRef();
		const algoName = location.pathname.slice(1);

		this.state = {
			algoName: algoName,
			examplesEnabled: false,
		};
	}

	toggleExamples() {
		this.setState({ examplesEnabled: !this.state.examplesEnabled });
	}

	componentDidMount() {
		if (isAlgorithm(this.state.algoName)) {
			this.animManag = new AnimationManager(this.canvasRef, this.animBarRef);

			this.currentAlg = new AlgorithmList[this.state.algoName][1](
				this.animManag,
				this.canvasRef.current.width,
				this.canvasRef.current.height
			);
		}
	}

	render() {
		const algoName = this.state.algoName;
		if (!isAlgorithm(algoName)) {
			return <h1>404!</h1>;
		}
		const header = AlgorithmList[algoName][2]
			? AlgorithmList[algoName][2]
			: AlgorithmList[algoName][0];

		return (
			<div className="VisualizationMainPage">
				<div id="container">
					<div id="header">
						<h1>{header}</h1>
					</div>

					<div id="mainContent">
						<div id="algoControlSection">
							<table id="AlgorithmSpecificControls"></table>
							{hasModal(algoName) ? (
								<button
									className={this.state.examplesEnabled ? 'selected' : ''}
									id="examplesButton"
									onClick={() => this.toggleExamples()}
								></button>
							) : null}
						</div>

						<canvas id="canvas" width="1000" height="503" ref={this.canvasRef}></canvas>

						<div id="generalAnimationControlSection">
							<table id="GeneralAnimationControls" ref={this.animBarRef}></table>
						</div>
					</div>

					<div
						id="examplesModal"
						className={`modal${this.state.examplesEnabled ? ' show' : ''}`}
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
