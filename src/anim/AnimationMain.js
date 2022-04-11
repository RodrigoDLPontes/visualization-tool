// Copyright 2011 David Galles, University of San Francisco. All rights reserved.
//
// Redistribution and use in source and binary forms, with or without modification, are
// permitted provided that the following conditions are met:
//
// 1. Redistributions of source code must retain the above copyright notice, this list of
// conditions and the following disclaimer.
//
// 2. Redistributions in binary form must reproduce the above copyright notice, this list
// of conditions and the following disclaimer in the documentation and/or other materials
// provided with the distribution.
//
// THIS SOFTWARE IS PROVIDED BY <COPYRIGHT HOLDER> ``AS IS'' AND ANY EXPRESS OR IMPLIED
// WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
// FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> OR
// CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
// CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
// SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
// ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
// NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF
// ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//
// The views and conclusions contained in the software and documentation are those of the
// authors and should not be interpreted as representing official policies, either expressed
// or implied, of the University of San Francisco

// Global timer used for doing animation callbacks.
//  TODO:  Make this an instance variable of Animation Manager.

/* global canvas */

import {
	UndoCreate,
	UndoHighlight,
	UndoHighlightEdge,
	UndoMove,
	UndoSetAlpha,
	UndoSetAlwaysOnTop,
	UndoSetBackgroundColor,
	UndoSetEdgeAlpha,
	UndoSetEdgeColor,
	UndoSetEdgeThickness,
	UndoSetForegroundColor,
	UndoSetHeight,
	UndoSetHighlightIndex,
	UndoSetNextNull,
	UndoSetNull,
	UndoSetNumElements,
	UndoSetPosition,
	UndoSetPrevNull,
	UndoSetRectangleEdgeThickness,
	UndoSetText,
	UndoSetTextColor,
	UndoSetWidth,
} from './UndoFunctions.js';
import EventListener from './CustomEvents.js';
import ObjectManager from './ObjectManager.js';
import React from 'react';
import ReactDOM from 'react-dom';
import SingleAnimation from './SingleAnimation.js';
import { Slider } from '@material-ui/core';
import { UndoConnect } from './AnimatedLine.js';

// Utility function to read a cookie
function getCookie(cookieName) {
	let i, x, y;
	const cookies = document.cookie.split(';');
	for (i = 0; i < cookies.length; i++) {
		x = cookies[i].substr(0, cookies[i].indexOf('='));
		y = cookies[i].substr(cookies[i].indexOf('=') + 1);
		x = x.replace(/^\s+|\s+$/g, '');
		if (x === cookieName) {
			return unescape(y);
		}
	}
}

// Utility function to write a cookie
function setCookie(cookieName, value, expireDays) {
	const exDate = new Date();
	exDate.setDate(exDate.getDate() + expireDays);
	document.cookie = cookieName + '=' + value;
}

const ANIMATION_SPEED_DEFAULT = 75;

// TODO:  Move these out of global space into animation manager?

function controlKey(keyASCII) {
	return (
		keyASCII === 8 ||
		keyASCII === 9 ||
		keyASCII === 37 ||
		keyASCII === 38 ||
		keyASCII === 39 ||
		keyASCII === 40 ||
		keyASCII === 46
	);
}

function returnSubmit(field, func, maxSize, intOnly) {
	if (maxSize !== undefined) {
		field.size = maxSize;
	}
	return function (event) {
		let keyASCII = 0;
		if (window.event) {
			// IE
			keyASCII = event.keyCode;
		} else if (event.which) {
			// Netscape/Firefox/Opera
			keyASCII = event.which;
		}

		if (keyASCII === 13) {
			func();
			return false;
		} else if (
			keyASCII === 59 ||
			keyASCII === 45 ||
			keyASCII === 46 ||
			keyASCII === 190 ||
			keyASCII === 173
		) {
			return false;
		} else if (
			(maxSize !== undefined && field.value.length >= maxSize) ||
			(intOnly && (keyASCII < 48 || keyASCII > 57))
		) {
			if (!controlKey(keyASCII)) return false;
		}
		return true;
	};
}

function addControlToAnimationBar(animBarRef, type, name, callback) {
	const element = document.createElement('input');

	element.setAttribute('type', type);
	element.setAttribute('value', name);
	if (type === 'Button') {
		element.onclick = callback;
	} else if (type === 'Text') {
		element.onkeydown = callback;
	}

	const tableEntry = document.createElement('td');

	tableEntry.appendChild(element);

	animBarRef.current.appendChild(tableEntry);
	return element;
}

function addDivisorToAnimationBar(animBarRef) {
	const divisorLeft = document.createElement('td');
	divisorLeft.setAttribute('class', 'divisorLeft');

	const divisorRight = document.createElement('td');
	divisorRight.setAttribute('class', 'divisorRight');

	animBarRef.current.appendChild(divisorLeft);
	animBarRef.current.appendChild(divisorRight);
}

export default class AnimationManager extends EventListener {
	constructor(canvasRef, animBarRef) {
		super();

		this.objectManager = new ObjectManager(canvasRef);
		// Holder for all animated objects.
		// All animation is done by manipulating objects in
		// this container
		this.animatedObjects = this.objectManager;

		// Control variables for stopping / starting animation
		this.animationPaused = false;
		this.awaitingStep = false;
		this.currentlyAnimating = false;

		// Array holding the code for the animation.  This is
		// an array of strings, each of which is an animation command
		// currentAnimation is an index into this array
		this.animationSteps = [];
		this.currentAnimation = 0;

		this.previousAnimationSteps = [];

		// Control variables for where we are in the current animation block.
		// currFrame holds the frame number of the current animation block,
		// while animationBlockLength holds the length of the current animation
		// block (in frame numbers).
		this.currFrame = 0;
		this.animationBlockLength = 0;

		//  The animation block that is currently running.  Array of singleAnimations
		this.currentBlock = null;

		////////////////////////////////////
		// Variables for handling undo.
		////////////////////////////////////
		//  A stack of UndoBlock objects (subclassed, UndoBlock is an abstract base class)
		//  each of which can undo a single animation element
		this.undoStack = [];
		this.doingUndo = false;

		// A stack containing the beginning of each animation block, as an index
		// into the animationSteps array
		this.undoAnimationStepIndices = [];
		this.undoAnimationStepIndicesStack = [];

		this.animationBlockLength = 10;

		this.paused = false;

		this.canvas = canvasRef;

		this.skipBackButton = addControlToAnimationBar(animBarRef, 'Button', 'Skip Back', () =>
			this.skipBack(),
		);
		this.stepBackButton = addControlToAnimationBar(animBarRef, 'Button', 'Step Back', () =>
			this.stepBack(),
		);
		this.playPauseBackButton = addControlToAnimationBar(animBarRef, 'Button', 'Pause', () =>
			this.doPlayPause(),
		);
		this.playPauseBackButton.setAttribute('style', 'width: 80px');
		this.stepForwardButton = addControlToAnimationBar(
			animBarRef,
			'Button',
			'Step Forward',
			() => this.step(),
		);
		this.skipForwardButton = addControlToAnimationBar(
			animBarRef,
			'Button',
			'Skip Forward',
			() => this.skipForward(),
		);

		addDivisorToAnimationBar(animBarRef);

		const element = document.createElement('div');
		element.setAttribute('display', 'inline-block');
		element.setAttribute('float', 'left');

		let speed = getCookie('VisualizationSpeed');
		if (speed == null || speed === '') {
			speed = ANIMATION_SPEED_DEFAULT;
		} else {
			speed = parseInt(speed);
		}

		const slider = (
			<Slider
				defaultValue={speed}
				onChange={(e, val) => {
					this.setSpeed(val);
					setCookie('VisualizationSpeed', String(val), 30);
				}}
			/>
		);

		let tableEntry = document.createElement('td');

		const controlBar = document.getElementById('GeneralAnimationControls');

		const newTable = document.createElement('table');

		let midLevel = document.createElement('tr');
		let bottomLevel = document.createElement('td');
		midLevel.appendChild(bottomLevel);
		ReactDOM.render(slider, bottomLevel);
		newTable.appendChild(midLevel);

		midLevel = document.createElement('tr');
		bottomLevel = document.createElement('td');
		bottomLevel.align = 'center';
		let txtNode = document.createTextNode('Animation Speed');
		midLevel.appendChild(bottomLevel);
		bottomLevel.appendChild(txtNode);
		newTable.appendChild(midLevel);

		tableEntry.appendChild(newTable);

		// Append the element in page (in span)
		controlBar.appendChild(tableEntry);

		this.setSpeed(speed);

		element.setAttribute('style', 'width:200px');

		addDivisorToAnimationBar(animBarRef);

		let width = getCookie('VisualizationWidth');
		width = width == null || width === '' ? 1500 : parseInt(width);

		let height = getCookie('VisualizationHeight');
		height = height == null || height === '' ? 505 : parseInt(height);

		canvas.width = width;
		canvas.height = height;

		tableEntry = document.createElement('td');
		txtNode = document.createTextNode('h:');
		tableEntry.appendChild(txtNode);
		controlBar.appendChild(tableEntry);

		this.heightEntry = addControlToAnimationBar(animBarRef, 'Text', canvas.height, () =>
			returnSubmit(
				this.heightEntry,
				() =>
					this.changeSize(
						document.documentElement.clientWidth,
						parseInt(this.heightEntry.value),
					),
				4,
				true,
			),
		);

		this.heightEntry.size = 4;
		this.sizeButton = addControlToAnimationBar(animBarRef, 'Button', 'Change Canvas Size', () =>
			this.changeSize(),
		);

		this.addListener('AnimationStarted', this, this.animStarted);
		this.addListener('AnimationEnded', this, this.animEnded);
		this.addListener('AnimationWaiting', this, this.animWaiting);
		this.addListener('AnimationUndoUnavailable', this, this.animUndoUnavailable);
		this.objectManager.width = canvas.width;
		this.objectManager.height = canvas.height;
	}

	lerp(from, to, percent) {
		return (to - from) * percent + from;
	}

	// Pause / unpause animation
	setPaused(pausedValue) {
		this.animationPaused = pausedValue;
		if (!this.animationPaused) {
			this.step();
		}
	}

	parseBool(str) {
		const uppercase = str.toUpperCase();
		const returnVal = !(
			uppercase === 'False' ||
			uppercase === 'f' ||
			uppercase === ' 0' ||
			uppercase === '0' ||
			uppercase === ''
		);
		return returnVal;
	}

	parseColor(clr) {
		if (clr.charAt(0) === '#') {
			return clr;
		} else if (clr.substring(0, 2) === '0x') {
			return '#' + clr.substring(2);
		}
	}

	// Set the speed of the animation, from 0 (slow) to 100 (fast)
	setSpeed(newSpeed) {
		this.animationBlockLength = Math.floor((100 - newSpeed) / 2);
	}

	changeSize(
		width = document.documentElement.clientWidth,
		height = parseInt(this.heightEntry.value),
	) {
		if (width > 100) {
			canvas.width = width;
			this.animatedObjects.width = width;
			setCookie('VisualizationWidth', String(width), 30);
		}
		if (height > 100) {
			canvas.height = height;
			this.animatedObjects.height = height;
			setCookie('VisualizationHeight', String(height), 30);
		}
		this.heightEntry.value = canvas.height;

		this.animatedObjects.draw();
		this.fireEvent('CanvasSizeChanged', { width: canvas.width, height: canvas.height });
	}

	startNextBlock() {
		this.awaitingStep = false;
		this.currentBlock = [];
		this.undoBlock = [];
		if (this.currentAnimation === this.animationSteps.length) {
			this.currentlyAnimating = false;
			this.awaitingStep = false;
			this.fireEvent('AnimationEnded', 'NoData');
			this.stopTimer();
			this.animatedObjects.update();
			this.animatedObjects.draw();
			return;
		}
		this.undoAnimationStepIndices.push(this.currentAnimation);

		this.foundBreak = false;
		this.anyAnimations = false;

		while (this.currentAnimation < this.animationSteps.length && !this.foundBreak) {
			const [act, params] = this.animationSteps[this.currentAnimation];
			act.call(this, params);
			this.currentAnimation++;
		}
		this.currFrame = 0;

		// Hack:  If there are not any animations, and we are currently paused,
		// then set the current frame to the end of the animation, so that we will
		// advance immediately upon the next step button.  If we are not paused, then
		// animate as normal.
		if (
			(!this.anyAnimations && this.animationPaused) ||
			(!this.anyAnimations && this.currentAnimation === this.animationSteps.length)
		) {
			this.currFrame = this.animationBlockLength;
		}

		this.undoStack.push(this.undoBlock);
	}

	//  Start a new animation.  The input parameter commands is an array of strings,
	//  which represents the animation to start
	startNewAnimation(commands) {
		this.stopTimer();
		if (this.animationSteps !== null) {
			this.previousAnimationSteps.push(this.animationSteps);
			this.undoAnimationStepIndicesStack.push(this.undoAnimationStepIndices);
		}
		if (commands === undefined || commands.length === 0) {
			this.animationSteps = [[act.step, []]];
		} else {
			this.animationSteps = commands;
		}
		this.undoAnimationStepIndices = [];
		this.currentAnimation = 0;
		this.startNextBlock();
		this.currentlyAnimating = true;
		this.fireEvent('AnimationStarted', 'NoData');
		this.startTimer();
	}

	// Step backwards one step.  A no-op if the animation is not currently paused
	stepBack() {
		if (this.awaitingStep && this.undoStack !== null && this.undoStack.length !== 0) {
			//  TODO:  Get events working correctly!
			this.fireEvent('AnimationStarted', 'NoData');
			this.stopTimer();

			this.awaitingStep = false;
			this.undoLastBlock();
			// Re-kick the timer.  The timer may or may not be running at this point,
			// so to be safe we'll kill it and start it again.
			this.stopTimer();
			this.startTimer();
		} else if (
			!this.currentlyAnimating &&
			this.animationPaused &&
			this.undoAnimationStepIndices !== null
		) {
			this.fireEvent('AnimationStarted', 'NoData');
			this.currentlyAnimating = true;
			this.undoLastBlock();
			// Re-kick the timer.  The timer may or may not be running at this point,
			// so to be safe we'll kill it and start it again.
			this.stopTimer();
			this.startTimer();
		}
	}

	// Step forwards one step.  A no-op if the animation is not currently paused
	step() {
		if (this.awaitingStep) {
			this.startNextBlock();
			this.fireEvent('AnimationStarted', 'NoData');
			this.currentlyAnimating = true;
			// Re-kick the timer.  The timer should be going now, but we've had some difficulty with
			// it timing itself out, so we'll be safe and kick it now.
			this.stopTimer();
			this.startTimer();
		}
	}

	/// WARNING:  Could be dangerous to call while an animation is running ...
	clearHistory() {
		this.undoStack = [];
		this.undoAnimationStepIndices = null;
		this.previousAnimationSteps = [];
		this.undoAnimationStepIndicesStack = [];
		this.animationSteps = null;
		this.fireEvent('AnimationUndoUnavailable', 'NoData');
		this.stopTimer();
		this.animatedObjects.update();
		this.animatedObjects.draw();
	}

	skipBack() {
		let keepUndoing =
			this.undoAnimationStepIndices !== null && this.undoAnimationStepIndices.length !== 0;
		if (keepUndoing) {
			let i;
			for (i = 0; this.currentBlock !== null && i < this.currentBlock.length; i++) {
				const objectID = this.currentBlock[i].objectID;
				this.animatedObjects.setNodePosition(
					objectID,
					this.currentBlock[i].toX,
					this.currentBlock[i].toY,
				);
			}
			if (this.doingUndo) {
				this.finishUndoBlock(this.undoStack.pop());
			}
			while (keepUndoing) {
				this.undoLastBlock();
				for (i = 0; i < this.currentBlock.length; i++) {
					const objectID = this.currentBlock[i].objectID;
					this.animatedObjects.setNodePosition(
						objectID,
						this.currentBlock[i].toX,
						this.currentBlock[i].toY,
					);
				}
				keepUndoing = this.finishUndoBlock(this.undoStack.pop());
			}
			this.stopTimer();
			this.animatedObjects.update();
			this.animatedObjects.draw();
			if (this.undoStack == null || this.undoStack.length === 0) {
				this.fireEvent('AnimationUndoUnavailable', 'NoData');
			}
		}
	}

	resetAll() {
		this.clearHistory();
		this.animatedObjects.clearAllObjects();
		this.animatedObjects.draw();
		this.stopTimer();
	}

	skipForward() {
		if (this.currentlyAnimating) {
			this.animatedObjects.runFast = true;
			while (
				this.animationSteps !== null &&
				this.currentAnimation < this.animationSteps.length
			) {
				for (let i = 0; this.currentBlock !== null && i < this.currentBlock.length; i++) {
					const objectID = this.currentBlock[i].objectID;
					this.animatedObjects.setNodePosition(
						objectID,
						this.currentBlock[i].toX,
						this.currentBlock[i].toY,
					);
				}
				if (this.doingUndo) {
					this.finishUndoBlock(this.undoStack.pop());
				}
				this.startNextBlock();
				for (let i = 0; i < this.currentBlock.length; i++) {
					const objectID = this.currentBlock[i].objectID;
					this.animatedObjects.setNodePosition(
						objectID,
						this.currentBlock[i].toX,
						this.currentBlock[i].toY,
					);
				}
			}
			this.animatedObjects.update();
			this.currentlyAnimating = false;
			this.awaitingStep = false;
			this.doingUndo = false;

			this.animatedObjects.runFast = false;
			this.fireEvent('AnimationEnded', 'NoData');
			this.stopTimer();
			this.animatedObjects.update();
			this.animatedObjects.draw();
		}
	}

	finishUndoBlock(undoBlock) {
		for (let i = undoBlock.length - 1; i >= 0; i--) {
			undoBlock[i].undoInitialStep(this.animatedObjects);
		}
		this.doingUndo = false;

		// If we are at the final end of the animation ...
		if (this.undoAnimationStepIndices.length === 0) {
			this.awaitingStep = false;
			this.currentlyAnimating = false;
			this.undoAnimationStepIndices = this.undoAnimationStepIndicesStack.pop();
			this.animationSteps = this.previousAnimationSteps.pop();
			this.fireEvent('AnimationEnded', 'NoData');
			this.fireEvent('AnimationUndo', 'NoData');
			this.currentBlock = [];
			if (this.undoStack == null || this.undoStack.length === 0) {
				this.currentlyAnimating = false;
				this.awaitingStep = false;
				this.fireEvent('AnimationUndoUnavailable', 'NoData');
			}

			this.stopTimer();
			this.animatedObjects.update();
			this.animatedObjects.draw();

			return false;
		}
		return true;
	}

	undoLastBlock() {
		if (this.undoAnimationStepIndices.length === 0) {
			// Nothing on the undo stack.  Return
			return;
		}
		if (this.undoAnimationStepIndices.length > 0) {
			this.doingUndo = true;
			let anyAnimations = false;
			this.currentAnimation = this.undoAnimationStepIndices.pop();
			this.currentBlock = [];
			const undo = this.undoStack[this.undoStack.length - 1];
			let i;
			for (i = undo.length - 1; i >= 0; i--) {
				const animateNext = undo[i].addUndoAnimation(this.currentBlock);
				anyAnimations = anyAnimations || animateNext;
			}
			this.currFrame = 0;

			// Hack:  If there are not any animations, and we are currently paused,
			// then set the current frame to the end of the animation, so that we will
			// advance immediately upon the next step button.  If we are not paused, then
			// animate as normal.
			if (!anyAnimations && this.animationPaused) {
				this.currFrame = this.animationBlockLength;
			}
			this.currentlyAnimating = true;
		}
	}

	setLayer(shown, layers) {
		this.animatedObjects.setLayer(shown, layers);
		// Drop in an extra draw call here, just in case we are not
		// in the middle of an update loop when this changes
		this.animatedObjects.draw();
	}

	setAllLayers(layers) {
		this.animatedObjects.setAllLayers(layers);
		// Drop in an extra draw call here, just in case we are not
		// in the middle of an update loop when this changes
		this.animatedObjects.draw();
	}

	update() {
		if (this.currentlyAnimating) {
			this.currFrame = this.currFrame + 1;
			let i;
			for (i = 0; i < this.currentBlock.length; i++) {
				if (
					this.currFrame === this.animationBlockLength ||
					(this.currFrame === 1 && this.animationBlockLength === 0)
				) {
					this.animatedObjects.setNodePosition(
						this.currentBlock[i].objectID,
						this.currentBlock[i].toX,
						this.currentBlock[i].toY,
					);
				} else if (this.currFrame < this.animationBlockLength) {
					const objectID = this.currentBlock[i].objectID;
					const percent = 1 / (this.animationBlockLength - this.currFrame);
					const newX = this.lerp(
						this.animatedObjects.getNodeX(objectID),
						this.currentBlock[i].toX,
						percent,
					);
					const newY = this.lerp(
						this.animatedObjects.getNodeY(objectID),
						this.currentBlock[i].toY,
						percent,
					);
					this.animatedObjects.setNodePosition(objectID, newX, newY);
				}
			}
			if (this.currFrame >= this.animationBlockLength) {
				if (this.doingUndo) {
					if (this.finishUndoBlock(this.undoStack.pop())) {
						this.awaitingStep = true;
						this.fireEvent('AnimationWaiting', 'NoData');
					}
				} else {
					if (
						this.animationPaused &&
						this.currentAnimation < this.animationSteps.length
					) {
						this.awaitingStep = true;
						this.fireEvent('AnimationWaiting', 'NoData');
						this.currentBlock = [];
					} else {
						this.startNextBlock();
					}
				}
			}
			this.animatedObjects.update();
		}
	}

	animWaiting() {
		this.stepForwardButton.disabled = false;
		if (this.skipBackButton.disabled === false) {
			this.stepBackButton.disabled = false;
		}
		this.objectManager.statusReport.setText('Animation Paused');
		this.objectManager.statusReport.setForegroundColor('#FF0000');
	}

	animStarted() {
		this.skipForwardButton.disabled = false;
		this.skipBackButton.disabled = false;
		this.stepForwardButton.disabled = true;
		this.stepBackButton.disabled = true;
		this.objectManager.statusReport.setText('Animation Running');
		this.objectManager.statusReport.setForegroundColor('#009900');
	}

	animEnded() {
		this.skipForwardButton.disabled = true;
		this.stepForwardButton.disabled = true;
		if (this.skipBackButton.disabled === false && this.paused) {
			this.stepBackButton.disabled = false;
		}
		this.objectManager.statusReport.setText('Animation Completed');
		this.objectManager.statusReport.setForegroundColor('#000000');
	}

	animUndoUnavailable() {
		this.skipBackButton.disabled = true;
		this.stepBackButton.disabled = true;
	}

	timeout() {
		// We need to set the timeout *first*, otherwise if we
		// try to clear it later, we get behavior we don't want ...
		this.timer = setTimeout(() => this.timeout(), 30);
		this.update();
		this.objectManager.draw();
	}

	doPlayPause() {
		this.paused = !this.paused;
		if (this.paused) {
			this.playPauseBackButton.setAttribute('value', 'Play');
			if (this.skipBackButton.disabled === false) {
				this.stepBackButton.disabled = false;
			}
		} else {
			this.playPauseBackButton.setAttribute('value', 'Pause');
		}
		this.setPaused(this.paused);
	}

	startTimer() {
		this.timer = setTimeout(() => this.timeout(), 30);
	}

	stopTimer() {
		clearInterval(this.timer);
	}
}

export const act = {
	step() {
		this.foundBreak = true;
	},
	move(params) {
		// id, x, y
		const nextAnim = new SingleAnimation(
			params[0],
			this.animatedObjects.getNodeX(params[0]),
			this.animatedObjects.getNodeY(params[0]),
			params[1],
			params[2],
		);
		this.currentBlock.push(nextAnim);
		this.undoBlock.push(
			new UndoMove(
				nextAnim.objectID,
				nextAnim.toX,
				nextAnim.toY,
				nextAnim.fromX,
				nextAnim.fromY,
			),
		);
		this.anyAnimations = true;
	},
	delete(params) {
		// id
		const removedEdges = this.animatedObjects.deleteIncident(params[0]);
		if (removedEdges.length > 0) {
			this.undoBlock = this.undoBlock.concat(removedEdges);
		}
		const obj = this.animatedObjects.getObject(params[0]);
		if (obj !== null) {
			this.undoBlock.push(obj.createUndoDelete());
			this.animatedObjects.removeObject(params[0]);
		}
	},
	connect(params) {
		// fromID, toID | color, curve, directed, label, anchorPos, thickness
		params[2] = params[2] || '#000000';
		params[3] = params[3] || 0.0;
		params[4] = params[4] !== false && params[4] !== 0;
		params[5] = params[5] === undefined ? '' : params[5];
		params[6] = params[6] || 0;
		params[7] = params[7] === undefined ? 1 : params[7];
		this.animatedObjects.connectEdge(
			params[0],
			params[1],
			params[2],
			params[3],
			params[4],
			String(params[5]),
			params[6],
			params[7],
		);
		this.undoBlock.push(new UndoConnect(params[0], params[1], false));
	},
	connectNext(params) {
		// fromID, toID
		this.animatedObjects.connectEdge(params[0], params[1], '#000000', 0.0, true, '', 0);
		this.undoBlock.push(new UndoConnect(params[0], params[1], false));
	},
	connectPrev(params) {
		// fromID, toID
		this.animatedObjects.connectEdge(params[0], params[1], '#000000', 0.0, true, '', 1);
		this.undoBlock.push(new UndoConnect(params[0], params[1], false));
	},
	connectCurve(params) {
		// fromID, toID, curve
		this.animatedObjects.connectEdge(params[0], params[1], '#000000', params[2], true, '', 1);
		this.undoBlock.push(new UndoConnect(params[0], params[1], false));
	},
	connectSkipList(params) {
		// fromID, toID, anchorPos
		this.animatedObjects.connectEdge(
			params[0],
			params[1],
			'#000000',
			0.0,
			false,
			'',
			params[2],
		);
		this.undoBlock.push(new UndoConnect(params[0], params[1], false));
	},
	disconnect(params) {
		// fromID, toID
		const undoConnect = this.animatedObjects.disconnect(params[0], params[1]);
		if (undoConnect !== null) this.undoBlock.push(undoConnect);
	},
	createCircle(params) {
		// id, label | x, y
		params[2] = params[2] || 0;
		params[3] = params[3] || 0;
		this.animatedObjects.addCircleObject(params[0], String(params[1]));
		this.animatedObjects.setNodePosition(
			parseInt(params[0]),
			parseInt(params[2]),
			parseInt(params[3]),
		);
		this.undoBlock.push(new UndoCreate(params[0]));
	},
	createHighlightCircle(params) {
		// id, color | x, y, radius
		params[2] = params[2] || 0;
		params[3] = params[3] || 0;
		params[4] = params[4] === undefined ? 20 : params[4];
		this.animatedObjects.addHighlightCircleObject(params[0], params[1], params[4]);
		this.animatedObjects.setNodePosition(
			parseInt(params[0]),
			parseInt(params[2]),
			parseInt(params[3]),
		);
		this.undoBlock.push(new UndoCreate(params[0]));
	},
	createRectangle(params) {
		// id, label, w, h | x, y, xJustify, yJustify, bgColor, fgColor
		params[4] = params[4] || 0;
		params[5] = params[5] || 0;
		params[6] = params[6] || 'center';
		params[7] = params[7] || 'center';
		params[8] = params[8] || '#FFFFFF';
		params[9] = params[9] || '#000000';
		this.animatedObjects.addRectangleObject(
			params[0],
			String(params[1]),
			params[2],
			params[3],
			params[6],
			params[7],
			params[8],
			params[9],
		);
		this.animatedObjects.setNodePosition(params[0], params[4], params[5]);
		this.undoBlock.push(new UndoCreate(params[0]));
	},
	createLabel(params) {
		// id, label | x, y, centered
		params[2] = params[2] || 0;
		params[3] = params[3] || 0;
		params[4] = params[4] !== false && params[4] !== 0;
		this.animatedObjects.addLabelObject(params[0], String(params[1]), params[4]);
		this.animatedObjects.setNodePosition(params[0], params[2], params[3]);
		this.undoBlock.push(new UndoCreate(params[0]));
	},
	createLinkedListNode(params) {
		// id, label, w, h | x, y, linkPercent, vertical, linkPosEnd, bgColor, fgColor
		params[1] = Array.isArray(params[1]) ? params[1].map(x => String(x)) : [String(params[1])];
		params[4] = params[4] || 0;
		params[5] = params[5] || 0;
		params[6] = params[6] === undefined ? 0.25 : params[6];
		params[7] = params[7] !== false && params[7] !== 0;
		params[8] = params[8] || false;
		params[9] = params[9] || '#FFFFFF';
		params[10] = params[10] || '#000000';
		this.animatedObjects.addLinkedListObject(
			params[0],
			params[1],
			params[2],
			params[3],
			params[6],
			params[7],
			params[8],
			params[9],
			params[10],
		);
		this.animatedObjects.setNodePosition(params[0], params[4], params[5]);
		this.undoBlock.push(new UndoCreate(params[0]));
	},
	createDoublyLinkedListNode(params) {
		// id, label, w, h | x, y, linkPercent, bgColor, fgColor
		params[4] = params[4] || 0;
		params[5] = params[5] || 0;
		params[6] = params[6] === undefined ? 0.25 : params[6];
		params[7] = params[7] || '#FFFFFF';
		params[8] = params[8] || '#000000';
		this.animatedObjects.addDoublyLinkedListObject(
			params[0],
			String(params[1]),
			params[2],
			params[3],
			params[6],
			params[7],
			params[8],
		);
		this.animatedObjects.setNodePosition(params[0], params[4], params[5]);
		this.undoBlock.push(new UndoCreate(params[0]));
	},
	createCircularlyLinkedListNode(params) {
		// id, label, w, h | x, y, linkPercent, bgColor, fgColor
		params[4] = params[4] || 0;
		params[5] = params[5] || 0;
		params[6] = params[6] === undefined ? 0.25 : params[6];
		params[7] = params[7] || '#FFFFFF';
		params[8] = params[8] || '#000000';
		this.animatedObjects.addCircularlyLinkedListObject(
			params[0],
			String(params[1]),
			params[2],
			params[3],
			params[6],
			params[7],
			params[8],
		);
		this.animatedObjects.setNodePosition(params[0], params[4], params[5]);
		this.undoBlock.push(new UndoCreate(params[0]));
	},
	createSkipListNode(params) {
		// id, label, w, h | x, y, bgColor, fgColor
		params[4] = params[4] || 0;
		params[5] = params[5] || 0;
		params[6] = params[6] || '#FFFFFF';
		params[7] = params[7] || '#000000';
		this.animatedObjects.addSkipListObject(
			params[0],
			String(params[1]),
			params[2],
			params[3],
			params[6],
			params[7],
		);
		this.animatedObjects.setNodePosition(params[0], params[4], params[5]);
		this.undoBlock.push(new UndoCreate(params[0]));
	},
	createBTreeNode(params) {
		// id, widthPerElement, height, numLabels, x, y, bgColor, fgColor
		params[4] = params[4] || 0;
		params[5] = params[5] || 0;
		params[6] = params[6] || '#FFFFFF';
		params[7] = params[7] || '#000000';
		this.animatedObjects.addBTreeNode(
			params[0],
			params[1],
			params[2],
			params[3],
			params[6],
			params[7],
		);
		this.animatedObjects.setNodePosition(params[0], params[4], params[5]);
		this.undoBlock.push(new UndoCreate(params[0]));
	},
	setText(params) {
		// id, text | textIndex
		params[2] = params[2] || 0;
		const oldText = this.animatedObjects.getText(params[0], params[2]);
		this.animatedObjects.setText(params[0], String(params[1]), params[2]);
		if (oldText !== undefined) {
			this.undoBlock.push(new UndoSetText(params[0], oldText, params[2]));
		}
	},
	setTextColor(params) {
		// id, color, textIndex
		params[2] = params[2] || 0;
		const oldColor = this.animatedObjects.getTextColor(params[0], params[2]);
		this.animatedObjects.setTextColor(params[0], params[1], params[2]);
		this.undoBlock.push(new UndoSetTextColor(params[0], oldColor, params[2]));
	},
	setForegroundColor(params) {
		// id, color
		const oldColor = this.animatedObjects.foregroundColor(params[0]);
		this.animatedObjects.setForegroundColor(params[0], params[1]);
		this.undoBlock.push(new UndoSetForegroundColor(params[0], oldColor));
	},
	setBackgroundColor(params) {
		// id, color
		const oldColor = this.animatedObjects.backgroundColor(params[0]);
		this.animatedObjects.setBackgroundColor(params[0], params[1]);
		this.undoBlock.push(new UndoSetBackgroundColor(params[0], oldColor));
	},
	setHighlight(params) {
		// id, highlight, color
		this.animatedObjects.setHighlight(params[0], params[1], params[2]);
		this.undoBlock.push(new UndoHighlight(params[0], !params[1], params[2]));
	},
	setAlpha(params) {
		// id, alpha
		const oldAlpha = this.animatedObjects.getAlpha(params[0]);
		this.animatedObjects.setAlpha(params[0], params[1]);
		this.undoBlock.push(new UndoSetAlpha(params[0], oldAlpha));
	},
	setEdgeColor(params) {
		// fromID, toID, newColor
		const oldColor = this.animatedObjects.setEdgeColor(params[0], params[1], params[2]);
		this.undoBlock.push(new UndoSetEdgeColor(params[0], params[1], oldColor));
	},
	setEdgeAlpha(params) {
		// fromID, toID, alpha
		const oldAlpha = this.animatedObjects.setEdgeAlpha(params[0], params[1], params[2]);
		this.undoBlock.push(new UndoSetEdgeAlpha(params[0], params[1], oldAlpha));
	},
	setEdgeHighlight(params) {
		// fromID, toID, highlight
		const oldHighlight = this.animatedObjects.setEdgeHighlight(
			params[0],
			params[1],
			params[2],
			params[3],
		);
		this.undoBlock.push(new UndoHighlightEdge(params[0], params[1], oldHighlight));
	},
	setEdgeThickness(params) {
		// fromID, toID, thickness
		const oldThickness = this.animatedObjects.setEdgeThickness(params[0], params[1], params[2]);
		this.undoBlock.push(new UndoSetEdgeThickness(params[0], params[1], oldThickness));
	},
	setRectangleEdgeThickness(params) {
		//id, thicknessArray
		const oldThicknessArray = this.animatedObjects.setRectangleEdgeThickness(
			params[0],
			params[1],
		);
		this.undoBlock.push(new UndoSetRectangleEdgeThickness(params[0], oldThicknessArray));
	},
	setHeight(params) {
		// id, height
		const oldHeight = this.animatedObjects.getHeight(params[0]);
		this.animatedObjects.setHeight(params[0], params[1]);
		this.undoBlock.push(new UndoSetHeight(params[0], oldHeight));
	},
	setWidth(params) {
		// id, width
		const oldWidth = this.animatedObjects.getWidth(params[0]);
		this.animatedObjects.setWidth(params[0], params[1]);
		this.undoBlock.push(new UndoSetWidth(params[0], oldWidth));
	},
	setLayer(params) {
		// id, height
		this.animatedObjects.setLayer(params[0], params[1]);
		//TODO: Add undo information here
	},
	setNull(params) {
		// id, null
		const oldNull = this.animatedObjects.getNull(params[0]);
		this.animatedObjects.setNull(params[0], params[1]);
		this.undoBlock.push(new UndoSetNull(params[0], oldNull));
	},
	setPrevNull(params) {
		// id, null
		const oldNull = this.animatedObjects.getLeftNull(params[0]);
		this.animatedObjects.setPrevNull(params[0], params[1]);
		this.undoBlock.push(new UndoSetPrevNull(params[0], oldNull));
	},
	setNextNull(params) {
		// id, null
		const oldNull = this.animatedObjects.getRightNull(params[0]);
		this.animatedObjects.setNextNull(params[0], params[1]);
		this.undoBlock.push(new UndoSetNextNull(params[0], oldNull));
	},
	setNumElements(params) {
		// id, numElements
		const oldElem = this.animatedObjects.getObject(params[0]);
		this.undoBlock.push(new UndoSetNumElements(oldElem, params[1]));
		this.animatedObjects.setNumElements(params[0], params[1]);
	},
	setPosition(params) {
		// id, x, y
		const oldX = this.animatedObjects.getNodeX(params[0]);
		const oldY = this.animatedObjects.getNodeY(params[0]);
		this.animatedObjects.setNodePosition(params[0], params[1], params[2]);
		this.undoBlock.push(new UndoSetPosition(params[0], oldX, oldY));
	},
	setHighlightIndex(params) {
		const oldIndex = this.animatedObjects.getHighlightIndex(params[0]);
		this.undoBlock.push(new UndoSetHighlightIndex(params[0], oldIndex));
		this.animatedObjects.setHighlightIndex(params[0], params[1]);
	},
	alignRight(params) {
		// id, otherID
		const oldX = this.animatedObjects.getNodeX(params[0]);
		const oldY = this.animatedObjects.getNodeY(params[0]);
		this.animatedObjects.alignRight(params[0], params[1]);
		this.undoBlock.push(new UndoSetPosition(params[0], oldX, oldY));
	},
	alignLeft(params) {
		// id, otherID
		const oldX = this.animatedObjects.getNodeX(params[0]);
		const oldY = this.animatedObjects.getNodeY(params[0]);
		this.animatedObjects.alignLeft(params[0], params[1]);
		this.undoBlock.push(new UndoSetPosition(params[0], oldX, oldY));
	},
	alignTop(params) {
		// id, otherID
		const oldX = this.animatedObjects.getNodeX(params[0]);
		const oldY = this.animatedObjects.getNodeY(params[0]);
		this.animatedObjects.alignTop(params[0], params[1]);
		this.undoBlock.push(new UndoSetPosition(params[0], oldX, oldY));
	},
	alignBottom(params) {
		// id, otherID
		const oldX = this.animatedObjects.getNodeX(params[0]);
		const oldY = this.animatedObjects.getNodeY(params[0]);
		this.animatedObjects.alignBottom(params[0], params[1]);
		this.undoBlock.push(new UndoSetPosition(params[0], oldX, oldY));
	},
	bringToTop(params) {
		const oldTop = this.animatedObjects.setAlwaysOnTop(params[0], params[1]);
		this.undoBlock.push(new UndoSetAlwaysOnTop(params[0], oldTop));
	},
	moveToAlignRight(params) {
		// id, otherID
		const newXY = this.animatedObjects.getAlignRightPos(params[0], params[1]);
		const nextAnim = new SingleAnimation(
			params[0],
			this.animatedObjects.getNodeX(params[0]),
			this.animatedObjects.getNodeY(params[0]),
			newXY[0],
			newXY[1],
		);
		this.currentBlock.push(nextAnim);
		this.undoBlock.push(
			new UndoMove(
				nextAnim.objectID,
				nextAnim.toX,
				nextAnim.toY,
				nextAnim.fromX,
				nextAnim.fromY,
			),
		);
		this.anyAnimations = true;
	},
};
