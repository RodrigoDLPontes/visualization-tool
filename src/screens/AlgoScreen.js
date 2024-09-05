import '../css/AlgoScreen.css';
import '../css/App.css';
import {
	BsBookHalf,
	BsClock,
	BsFileEarmarkCodeFill,
	BsFileEarmarkFill,
	BsFileEarmarkFontFill,
	BsFillSunFill,
	BsMoonFill,
} from 'react-icons/bs';
import { Link, useLocation } from 'react-router-dom';
import React, { useEffect, useRef, useState } from 'react';
import AlgorithmNotFound404 from '../components/AlgorithmNotFound404';
import AnimationManager from '../anim/AnimationMain';
import PropTypes from 'prop-types';
import ReactGA from 'react-ga4';
import { algoMap } from '../AlgoList';
import bigOModals from '../modals/BigOModals';
import infoModals from '../modals/InfoModals';

const AlgoScreen = ({ theme, toggleTheme }) => {
	const location = useLocation();
	const algoName = location.pathname.slice(1);
	const algoDetails = algoMap[algoName];
	const canvasRef = useRef(null);
	const animBarRef = useRef(null);
	const animManagRef = useRef(null);

	const [moreInfoEnabled, setMoreInfoEnabled] = useState(false);
	const [bigOEnabled, setBigOEnabled] = useState(false);
	const [pseudocodeType, setPseudocodeType] = useState('english');

	useEffect(() => {
		ReactGA.send({ hitType: 'pageview', page: algoName });

		if (algoDetails) {
			// eslint-disable-next-line no-unused-vars
			const [menuDisplayName, AlgoClass, hasPseudoCode, verboseDisplayName] = algoDetails;

			animManagRef.current = new AnimationManager(canvasRef, animBarRef);

			new AlgoClass(animManagRef.current, canvasRef.current.width, canvasRef.current.height);

			const updateDimensions = () => {
				animManagRef.current.changeSize(document.body.clientWidth);
			};

			window.addEventListener('resize', updateDimensions);

			return () => {
				window.removeEventListener('resize', updateDimensions);
			};
		}
	}, [algoName, algoDetails]);

	useEffect(() => {
		if (animManagRef.current) {
			animManagRef.current.updateLayer(32, false); // Hide English
			animManagRef.current.updateLayer(33, false); // Hide Pseudocode

			if (pseudocodeType === 'english') {
				animManagRef.current.updateLayer(32, true);
			} else if (pseudocodeType === 'code') {
				animManagRef.current.updateLayer(33, true);
			}
		}
	}, [pseudocodeType]);

	const toggleMoreInfo = () => {
		setBigOEnabled(false);
		setMoreInfoEnabled(prev => !prev);
	};

	const toggleBigO = () => {
		setMoreInfoEnabled(false);
		setBigOEnabled(prev => !prev);
	};

	const togglePseudocode = () => {
		const pseudocodeMap = { none: 'english', english: 'code', code: 'none' };
		setPseudocodeType(prev => pseudocodeMap[prev]);
	};

	if (!algoDetails) {
		return <AlgorithmNotFound404 />;
	}

	// eslint-disable-next-line no-unused-vars
	const [menuDisplayName, AlgoClass, hasPseudoCode, verboseDisplayName] = algoDetails;
	const isQuickselect = menuDisplayName === 'Quickselect / kᵗʰ Select';
	const header = verboseDisplayName || menuDisplayName;

	return (
		<div className="VisualizationMainPage">
			<div id="container">
				<div id="header">
					<h1>
						<Link to="/">&#x3008;</Link>&nbsp;&nbsp;
						{isQuickselect ? (
							<>
								Quickselect / k<sup>th</sup> Select
							</>
						) : (
							<>{header}</>
						)}
						<div id="toggle">
							{theme === 'light' ? (
								<BsFillSunFill
									size={31}
									onClick={toggleTheme}
									color="#f9c333"
									className="rotate-effect"
								/>
							) : (
								<BsMoonFill
									size={29}
									onClick={toggleTheme}
									color="#d4f1f1"
									className="rotate-effect"
								/>
							)}
						</div>
					</h1>
				</div>

				<div id="mainContent">
					<div id="algoControlSection">
						<table id="AlgorithmSpecificControls"></table>
						<div id="toggles">
							{hasPseudoCode && pseudocodeType === 'none' && (
								<BsFileEarmarkFill
									className="pseudocode-toggle"
									size={32}
									onClick={togglePseudocode}
									opacity={'40%'}
									title="Code: Hidden"
								/>
							)}
							{hasPseudoCode && pseudocodeType === 'english' && (
								<BsFileEarmarkFontFill
									className="pseudocode-toggle"
									size={32}
									onClick={togglePseudocode}
									title="Code: English"
								/>
							)}
							{hasPseudoCode && pseudocodeType === 'code' && (
								<BsFileEarmarkCodeFill
									className="pseudocode-toggle"
									size={32}
									onClick={togglePseudocode}
									title="Code: Pseudo"
								/>
							)}
							{bigOModals(algoName) && (
								<BsClock
									className="menu-modal"
									size={30}
									onClick={toggleBigO}
									opacity={bigOEnabled ? '100%' : '40%'}
									title="Time Complexities"
								/>
							)}
							{infoModals[algoName] && (
								<BsBookHalf
									className="menu-modal"
									size={30}
									onClick={toggleMoreInfo}
									opacity={moreInfoEnabled ? '100%' : '40%'}
									title="More Information"
								/>
							)}
						</div>
					</div>

					<div className="viewport">
						<canvas id="canvas" width={0} height="505" ref={canvasRef}></canvas>
						{moreInfoEnabled && (
							<div className="modal">
								<div className="modal-content">{infoModals[algoName]}</div>
							</div>
						)}
						{bigOEnabled && (
							<div className="modal bigo">
								<div className="modal-content">{bigOModals(algoName)}</div>
							</div>
						)}
					</div>

					<div id="generalAnimationControlSection">
						<table id="GeneralAnimationControls" ref={animBarRef}></table>
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
};

AlgoScreen.propTypes = {
	theme: PropTypes.string.isRequired,
	toggleTheme: PropTypes.func.isRequired,
};

export default AlgoScreen;
