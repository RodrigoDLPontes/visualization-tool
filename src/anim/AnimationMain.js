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
	UndoSetBackgroundColor,
	UndoSetEdgeAlpha,
	UndoSetEdgeColor,
	UndoSetForegroundColor,
	UndoSetHeight,
	UndoSetHighlightIndex,
	UndoSetNextNull,
	UndoSetNull,
	UndoSetNumElements,
	UndoSetPosition,
	UndoSetPrevNull,
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

let swapped = false;

function reorderSibling(node1, node2) {
	node1.parentNode.replaceChild(node1, node2);
	node1.parentNode.insertBefore(node2, node1);
}

function swapControlDiv() {
	swapped = !swapped;
	if (swapped) {
		reorderSibling(
			document.getElementById('canvas'),
			document.getElementById('generalAnimationControlSection')
		);
		setCookie('VisualizationControlSwapped', 'true', 30);
	} else {
		reorderSibling(
			document.getElementById('generalAnimationControlSection'),
			document.getElementById('canvas')
		);
		setCookie('VisualizationControlSwapped', 'false', 30);
	}
}

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
	return function(event) {
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
			this.skipBack()
		);
		this.stepBackButton = addControlToAnimationBar(animBarRef, 'Button', 'Step Back', () =>
			this.stepBack()
		);
		this.playPauseBackButton = addControlToAnimationBar(animBarRef, 'Button', 'Pause', () =>
			this.doPlayPause()
		);
		this.stepForwardButton = addControlToAnimationBar(
			animBarRef,
			'Button',
			'Step Forward',
			() => this.step()
		);
		this.skipForwardButton = addControlToAnimationBar(
			animBarRef,
			'Button',
			'Skip Forward',
			() => this.skipForward()
		);

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

		let width = getCookie('VisualizationWidth');
		width = width == null || width === '' ? 1000 : parseInt(width);

		let height = getCookie('VisualizationHeight');
		height = height == null || height === '' ? 500 : parseInt(height);

		const swappedControls = getCookie('VisualizationControlSwapped');
		swapped = swappedControls === 'true';
		if (swapped) {
			reorderSibling(
				document.getElementById('canvas'),
				document.getElementById('generalAnimationControlSection')
			);
		}

		canvas.width = width;
		canvas.height = height;

		tableEntry = document.createElement('td');
		txtNode = document.createTextNode(' w:');
		tableEntry.appendChild(txtNode);
		controlBar.appendChild(tableEntry);

		this.widthEntry = addControlToAnimationBar(animBarRef, 'Text', canvas.width, () =>
			returnSubmit(this.widthEntry, this.changeSize.bind(this), 4, true)
		);
		this.widthEntry.size = 4;

		tableEntry = document.createElement('td');
		txtNode = document.createTextNode('       h:');
		tableEntry.appendChild(txtNode);
		controlBar.appendChild(tableEntry);

		this.heightEntry = addControlToAnimationBar(animBarRef, 'Text', canvas.height, () =>
			returnSubmit(this.heightEntry, this.changeSize.bind(this), 4, true)
		);

		this.heightEntry.size = 4;
		this.sizeButton = addControlToAnimationBar(animBarRef, 'Button', 'Change Canvas Size', () =>
			this.changeSize()
		);

		this.swapButton = addControlToAnimationBar(
			animBarRef,
			'Button',
			'Move Controls',
			swapControlDiv
		);

		this.addListener('AnimationStarted', this, this.animStarted);
		this.addListener('AnimationEnded', this, this.animEnded);
		this.addListener('AnimationWaiting', this, this.animWaiting);
		this.addListener('AnimationUndoUnavailable', this, this.anumUndoUnavailable);
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

	// Set the speed of the animation, from 0 (slow) to 100 (fast)
	setSpeed(newSpeed) {
		this.animationBlockLength = Math.floor((100 - newSpeed) / 2);
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

	changeSize() {
		const width = parseInt(this.widthEntry.value);
		const height = parseInt(this.heightEntry.value);

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
		this.widthEntry.value = canvas.width;
		this.heightEntry.value = canvas.height;

		this.animatedObjects.draw();
		this.fireEvent('CanvasSizeChanged', { width: canvas.width, height: canvas.height });
	}

	startNextBlock() {
		this.awaitingStep = false;
		this.currentBlock = [];
		let undoBlock = [];
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

		let foundBreak = false;
		let anyAnimations = false;

		while (this.currentAnimation < this.animationSteps.length && !foundBreak) {
			const nextCommand = this.animationSteps[this.currentAnimation].split('<;>');
			if (nextCommand[0].toUpperCase() === 'CREATECIRCLE') {
				this.animatedObjects.addCircleObject(parseInt(nextCommand[1]), nextCommand[2]);
				if (nextCommand.length > 4) {
					this.animatedObjects.setNodePosition(
						parseInt(nextCommand[1]),
						parseInt(nextCommand[3]),
						parseInt(nextCommand[4])
					);
				}
				undoBlock.push(new UndoCreate(parseInt(nextCommand[1])));
			} else if (nextCommand[0].toUpperCase() === 'CONNECT') {
				if (nextCommand.length > 7) {
					this.animatedObjects.connectEdge(
						parseInt(nextCommand[1]),
						parseInt(nextCommand[2]),
						this.parseColor(nextCommand[3]),
						parseFloat(nextCommand[4]),
						this.parseBool(nextCommand[5]),
						nextCommand[6],
						parseInt(nextCommand[7])
					);
				} else if (nextCommand.length > 6) {
					this.animatedObjects.connectEdge(
						parseInt(nextCommand[1]),
						parseInt(nextCommand[2]),
						this.parseColor(nextCommand[3]),
						parseFloat(nextCommand[4]),
						this.parseBool(nextCommand[5]),
						nextCommand[6],
						0
					);
				} else if (nextCommand.length > 5) {
					this.animatedObjects.connectEdge(
						parseInt(nextCommand[1]),
						parseInt(nextCommand[2]),
						this.parseColor(nextCommand[3]),
						parseFloat(nextCommand[4]),
						this.parseBool(nextCommand[5]),
						'',
						0
					);
				} else if (nextCommand.length > 4) {
					this.animatedObjects.connectEdge(
						parseInt(nextCommand[1]),
						parseInt(nextCommand[2]),
						this.parseColor(nextCommand[3]),
						parseFloat(nextCommand[4]),
						true,
						'',
						0
					);
				} else if (nextCommand.length > 3) {
					this.animatedObjects.connectEdge(
						parseInt(nextCommand[1]),
						parseInt(nextCommand[2]),
						this.parseColor(nextCommand[3]),
						0.0,
						true,
						'',
						0
					);
				} else {
					this.animatedObjects.connectEdge(
						parseInt(nextCommand[1]),
						parseInt(nextCommand[2]),
						'#000000',
						0.0,
						true,
						'',
						0
					);
				}
				undoBlock.push(
					new UndoConnect(parseInt(nextCommand[1]), parseInt(nextCommand[2]), false)
				);
			} else if (nextCommand[0].toUpperCase() === 'CONNECTNEXT') {
				this.animatedObjects.connectEdge(
					parseInt(nextCommand[1]),
					parseInt(nextCommand[2]),
					'#000000',
					0.0,
					true,
					'',
					0
				);
				undoBlock.push(
					new UndoConnect(parseInt(nextCommand[1]), parseInt(nextCommand[2]), false)
				);
			} else if (nextCommand[0].toUpperCase() === 'CONNECTPREV') {
				this.animatedObjects.connectEdge(
					parseInt(nextCommand[1]),
					parseInt(nextCommand[2]),
					'#000000',
					0.0,
					true,
					'',
					1
				);
				undoBlock.push(
					new UndoConnect(parseInt(nextCommand[1]), parseInt(nextCommand[2]), false)
				);
			} else if (nextCommand[0].toUpperCase() === 'CONNECTCURVE') {
				this.animatedObjects.connectEdge(
					parseInt(nextCommand[1]),
					parseInt(nextCommand[2]),
					'#000000',
					parseFloat(nextCommand[3]),
					true,
					'',
					1
				);
				undoBlock.push(
					new UndoConnect(parseInt(nextCommand[1]), parseInt(nextCommand[2]), false)
				);
			} else if (nextCommand[0].toUpperCase() === 'CONNECTSKIPLIST') {
				this.animatedObjects.connectEdge(
					parseInt(nextCommand[1]),
					parseInt(nextCommand[2]),
					'#000000',
					0,
					false,
					'',
					parseInt(nextCommand[3])
				);
				undoBlock.push(
					new UndoConnect(parseInt(nextCommand[1]), parseInt(nextCommand[2]), false)
				);
			} else if (nextCommand[0].toUpperCase() === 'CREATERECTANGLE') {
				if (nextCommand.length === 9) {
					this.animatedObjects.addRectangleObject(
						parseInt(nextCommand[1]), // ID
						nextCommand[2], // Label
						parseInt(nextCommand[3]), // w
						parseInt(nextCommand[4]), // h
						nextCommand[7], // xJustify
						nextCommand[8], // yJustify
						'#ffffff', // background color
						'#000000'
					); // foreground color
				} else {
					this.animatedObjects.addRectangleObject(
						parseInt(nextCommand[1]), // ID
						nextCommand[2], // Label
						parseInt(nextCommand[3]), // w
						parseInt(nextCommand[4]), // h
						'center', // xJustify
						'center', // yJustify
						'#ffffff', // background color
						'#000000'
					); // foreground color
				}
				if (nextCommand.length > 6) {
					this.animatedObjects.setNodePosition(
						parseInt(nextCommand[1]),
						parseInt(nextCommand[5]),
						parseInt(nextCommand[6])
					);
				}
				undoBlock.push(new UndoCreate(parseInt(nextCommand[1])));
			} else if (nextCommand[0].toUpperCase() === 'MOVE') {
				const objectID = parseInt(nextCommand[1]);
				const nextAnim = new SingleAnimation(
					objectID,
					this.animatedObjects.getNodeX(objectID),
					this.animatedObjects.getNodeY(objectID),
					parseInt(nextCommand[2]),
					parseInt(nextCommand[3])
				);
				this.currentBlock.push(nextAnim);

				undoBlock.push(
					new UndoMove(
						nextAnim.objectID,
						nextAnim.toX,
						nextAnim.toY,
						nextAnim.fromX,
						nextAnim.fromY
					)
				);

				anyAnimations = true;
			} else if (nextCommand[0].toUpperCase() === 'MOVETOALIGNRIGHT') {
				const id = parseInt(nextCommand[1]);
				const otherId = parseInt(nextCommand[2]);
				const newXY = this.animatedObjects.getAlignRightPos(id, otherId);

				const nextAnim = new SingleAnimation(
					id,
					this.animatedObjects.getNodeX(id),
					this.animatedObjects.getNodeY(id),
					newXY[0],
					newXY[1]
				);
				this.currentBlock.push(nextAnim);
				undoBlock.push(
					new UndoMove(
						nextAnim.objectID,
						nextAnim.toX,
						nextAnim.toY,
						nextAnim.fromX,
						nextAnim.fromY
					)
				);
				anyAnimations = true;
			} else if (nextCommand[0].toUpperCase() === 'STEP') {
				foundBreak = true;
			} else if (nextCommand[0].toUpperCase() === 'SETFOREGROUNDCOLOR') {
				const id = parseInt(nextCommand[1]);
				const oldColor = this.animatedObjects.foregroundColor(id);
				this.animatedObjects.setForegroundColor(id, this.parseColor(nextCommand[2]));
				undoBlock.push(new UndoSetForegroundColor(id, oldColor));
			} else if (nextCommand[0].toUpperCase() === 'SETBACKGROUNDCOLOR') {
				const id = parseInt(nextCommand[1]);
				const oldColor = this.animatedObjects.backgroundColor(id);
				this.animatedObjects.setBackgroundColor(id, this.parseColor(nextCommand[2]));
				undoBlock.push(new UndoSetBackgroundColor(id, oldColor));
			} else if (nextCommand[0].toUpperCase() === 'SETHIGHLIGHT') {
				const newHighlight = this.parseBool(nextCommand[2]);
				this.animatedObjects.setHighlight(parseInt(nextCommand[1]), newHighlight, nextCommand[3]);
				undoBlock.push(new UndoHighlight(parseInt(nextCommand[1]), !newHighlight));
			} else if (nextCommand[0].toUpperCase() === 'DISCONNECT') {
				const undoConnect = this.animatedObjects.disconnect(
					parseInt(nextCommand[1]),
					parseInt(nextCommand[2])
				);
				if (undoConnect !== null) {
					undoBlock.push(undoConnect);
				}
			} else if (nextCommand[0].toUpperCase() === 'SETALPHA') {
				const oldAlpha = this.animatedObjects.getAlpha(parseInt(nextCommand[1]));
				this.animatedObjects.setAlpha(parseInt(nextCommand[1]), parseFloat(nextCommand[2]));
				undoBlock.push(new UndoSetAlpha(parseInt(nextCommand[1]), oldAlpha));
			} else if (nextCommand[0].toUpperCase() === 'SETTEXT') {
				if (nextCommand.length > 3) {
					const oldText = this.animatedObjects.getText(
						parseInt(nextCommand[1]),
						parseInt(nextCommand[3])
					);
					this.animatedObjects.setText(
						parseInt(nextCommand[1]),
						nextCommand[2],
						parseInt(nextCommand[3])
					);
					if (oldText !== undefined) {
						undoBlock.push(
							new UndoSetText(
								parseInt(nextCommand[1]),
								oldText,
								parseInt(nextCommand[3])
							)
						);
					}
				} else {
					const oldText = this.animatedObjects.getText(parseInt(nextCommand[1]), 0);
					this.animatedObjects.setText(parseInt(nextCommand[1]), nextCommand[2], 0);
					if (oldText !== undefined) {
						undoBlock.push(new UndoSetText(parseInt(nextCommand[1]), oldText, 0));
					}
				}
			} else if (nextCommand[0].toUpperCase() === 'DELETE') {
				const objectID = parseInt(nextCommand[1]);

				const removedEdges = this.animatedObjects.deleteIncident(objectID);
				if (removedEdges.length > 0) {
					undoBlock = undoBlock.concat(removedEdges);
				}
				const obj = this.animatedObjects.getObject(objectID);
				if (obj !== null) {
					undoBlock.push(obj.createUndoDelete());
					this.animatedObjects.removeObject(objectID);
				}
			} else if (nextCommand[0].toUpperCase() === 'CREATEHIGHLIGHTCIRCLE') {
				if (nextCommand.length > 5) {
					this.animatedObjects.addHighlightCircleObject(
						parseInt(nextCommand[1]),
						this.parseColor(nextCommand[2]),
						parseFloat(nextCommand[5])
					);
				} else {
					this.animatedObjects.addHighlightCircleObject(
						parseInt(nextCommand[1]),
						this.parseColor(nextCommand[2]),
						20
					);
				}
				if (nextCommand.length > 4) {
					this.animatedObjects.setNodePosition(
						parseInt(nextCommand[1]),
						parseInt(nextCommand[3]),
						parseInt(nextCommand[4])
					);
				}
				undoBlock.push(new UndoCreate(parseInt(nextCommand[1])));
			} else if (nextCommand[0].toUpperCase() === 'CREATELABEL') {
				if (nextCommand.length === 6) {
					this.animatedObjects.addLabelObject(
						parseInt(nextCommand[1]),
						nextCommand[2],
						this.parseBool(nextCommand[5])
					);
				} else {
					this.animatedObjects.addLabelObject(
						parseInt(nextCommand[1]),
						nextCommand[2],
						true
					);
				}
				if (nextCommand.length >= 5) {
					this.animatedObjects.setNodePosition(
						parseInt(nextCommand[1]),
						parseFloat(nextCommand[3]),
						parseFloat(nextCommand[4])
					);
				}
				undoBlock.push(new UndoCreate(parseInt(nextCommand[1])));
			} else if (nextCommand[0].toUpperCase() === 'SETEDGECOLOR') {
				const from = parseInt(nextCommand[1]);
				const to = parseInt(nextCommand[2]);
				const newColor = this.parseColor(nextCommand[3]);
				const oldColor = this.animatedObjects.setEdgeColor(from, to, newColor);
				undoBlock.push(new UndoSetEdgeColor(from, to, oldColor));
			} else if (nextCommand[0].toUpperCase() === 'SETEDGEALPHA') {
				const from = parseInt(nextCommand[1]);
				const to = parseInt(nextCommand[2]);
				const newAlpha = parseFloat(nextCommand[3]);
				const oldAplpha = this.animatedObjects.setEdgeAlpha(from, to, newAlpha);
				undoBlock.push(new UndoSetEdgeAlpha(from, to, oldAplpha));
			} else if (nextCommand[0].toUpperCase() === 'SETEDGEHIGHLIGHT') {
				const newHighlight = this.parseBool(nextCommand[3]);
				const from = parseInt(nextCommand[1]);
				const to = parseInt(nextCommand[2]);
				const oldHighlight = this.animatedObjects.setEdgeHighlight(from, to, newHighlight);
				undoBlock.push(new UndoHighlightEdge(from, to, oldHighlight));
			} else if (nextCommand[0].toUpperCase() === 'SETHEIGHT') {
				const id = parseInt(nextCommand[1]);
				const oldHeight = this.animatedObjects.getHeight(id);
				this.animatedObjects.setHeight(id, parseInt(nextCommand[2]));
				undoBlock.push(new UndoSetHeight(id, oldHeight));
			} else if (nextCommand[0].toUpperCase() === 'SETLAYER') {
				this.animatedObjects.setLayer(parseInt(nextCommand[1]), parseInt(nextCommand[2]));
				//TODO: Add undo information here
			} else if (nextCommand[0].toUpperCase() === 'CREATELINKEDLIST') {
				if (nextCommand.length === 11) {
					this.animatedObjects.addLinkedListObject(
						parseInt(nextCommand[1]),
						nextCommand[2],
						parseInt(nextCommand[3]),
						parseInt(nextCommand[4]),
						parseFloat(nextCommand[7]),
						this.parseBool(nextCommand[8]),
						this.parseBool(nextCommand[9]),
						'#FFFFFF',
						'#000000'
					);
				} else {
					this.animatedObjects.addLinkedListObject(
						parseInt(nextCommand[1]),
						nextCommand[2],
						parseInt(nextCommand[3]),
						parseInt(nextCommand[4]),
						0.25,
						true,
						false,
						'#FFFFFF',
						'#000000'
					);
				}
				if (nextCommand.length > 6) {
					this.animatedObjects.setNodePosition(
						parseInt(nextCommand[1]),
						parseInt(nextCommand[5]),
						parseInt(nextCommand[6])
					);
					undoBlock.push(new UndoCreate(parseInt(nextCommand[1])));
				}
			} else if (nextCommand[0].toUpperCase() === 'CREATEDOUBLYLINKEDLIST') {
				if (nextCommand.length === 9) {
					this.animatedObjects.addDoublyLinkedListObject(
						parseInt(nextCommand[1]), // ID
						nextCommand[2], // Label
						parseInt(nextCommand[3]), // Width
						parseInt(nextCommand[4]), // Height
						parseFloat(nextCommand[7]), // Link Percent
						'#FFFFFF',
						'#000000'
					);
				} else {
					this.animatedObjects.addDoublyLinkedListObject(
						parseInt(nextCommand[1]),
						nextCommand[2],
						parseInt(nextCommand[3]),
						parseInt(nextCommand[4]),
						0.25,
						'#FFFFFF',
						'#000000'
					);
				}
				if (nextCommand.length > 6) {
					this.animatedObjects.setNodePosition(
						parseInt(nextCommand[1]),
						parseInt(nextCommand[5]),
						parseInt(nextCommand[6])
					);
					undoBlock.push(new UndoCreate(parseInt(nextCommand[1])));
				}
			} else if (nextCommand[0].toUpperCase() === 'CREATECIRCULARLYLINKEDLIST') {
				if (nextCommand.length === 9) {
					this.animatedObjects.addCircularlyLinkedListObject(
						parseInt(nextCommand[1]), // ID
						nextCommand[2], // Label
						parseInt(nextCommand[3]), // Width
						parseInt(nextCommand[4]), // Height
						parseFloat(nextCommand[7]), // Link Percent
						'#FFFFFF',
						'#000000'
					);
				} else {
					this.animatedObjects.addCircularlyLinkedListObject(
						parseInt(nextCommand[1]),
						nextCommand[2],
						parseInt(nextCommand[3]),
						parseInt(nextCommand[4]),
						0.25,
						'#FFFFFF',
						'#000000'
					);
				}
				if (nextCommand.length > 6) {
					this.animatedObjects.setNodePosition(
						parseInt(nextCommand[1]),
						parseInt(nextCommand[5]),
						parseInt(nextCommand[6])
					);
					undoBlock.push(new UndoCreate(parseInt(nextCommand[1])));
				}
			} else if (nextCommand[0].toUpperCase() === 'CREATESKIPLIST') {
				if (nextCommand.length === 7) {
					this.animatedObjects.addSkipListObject(
						parseInt(nextCommand[1]), // ID
						nextCommand[2], // Label
						parseInt(nextCommand[3]), // Width
						parseInt(nextCommand[4]), // Height
						'#000000', // Label color
						'#FFFFFF', // Fill color
						'#000000'
					); // Edge color

					this.animatedObjects.setNodePosition(
						parseInt(nextCommand[1]), // ID
						parseInt(nextCommand[5]), // X
						parseInt(nextCommand[6])
					); // Y
					undoBlock.push(new UndoCreate(parseInt(nextCommand[1])));
				}
			} else if (nextCommand[0].toUpperCase() === 'SETNULL') {
				const oldNull = this.animatedObjects.getNull(parseInt(nextCommand[1]));
				this.animatedObjects.setNull(
					parseInt(nextCommand[1]),
					this.parseBool(nextCommand[2])
				);
				undoBlock.push(new UndoSetNull(parseInt(nextCommand[1]), oldNull));
			} else if (nextCommand[0].toUpperCase() === 'SETPREVNULL') {
				const oldNull = this.animatedObjects.getLeftNull(parseInt(nextCommand[1]));
				this.animatedObjects.setPrevNull(
					parseInt(nextCommand[1]),
					this.parseBool(nextCommand[2])
				);
				undoBlock.push(new UndoSetPrevNull(parseInt(nextCommand[1]), oldNull));
			} else if (nextCommand[0].toUpperCase() === 'SETNEXTNULL') {
				const oldNull = this.animatedObjects.getRightNull(parseInt(nextCommand[1]));
				this.animatedObjects.setNextNull(
					parseInt(nextCommand[1]),
					this.parseBool(nextCommand[2])
				);
				undoBlock.push(new UndoSetNextNull(parseInt(nextCommand[1]), oldNull));
			} else if (nextCommand[0].toUpperCase() === 'SETTEXTCOLOR') {
				if (nextCommand.length > 3) {
					const oldColor = this.animatedObjects.getTextColor(
						parseInt(nextCommand[1]),
						parseInt(nextCommand[3])
					);
					this.animatedObjects.setTextColor(
						parseInt(nextCommand[1]),
						this.parseColor(nextCommand[2]),
						parseInt(nextCommand[3])
					);
					undoBlock.push(
						new UndoSetTextColor(
							parseInt(nextCommand[1]),
							oldColor,
							parseInt(nextCommand[3])
						)
					);
				} else {
					const oldColor = this.animatedObjects.getTextColor(parseInt(nextCommand[1]), 0);
					this.animatedObjects.setTextColor(
						parseInt(nextCommand[1]),
						this.parseColor(nextCommand[2]),
						0
					);
					undoBlock.push(new UndoSetTextColor(parseInt(nextCommand[1]), oldColor, 0));
				}
			} else if (nextCommand[0].toUpperCase() === 'CREATEBTREENODE') {
				this.animatedObjects.addBTreeNode(
					parseInt(nextCommand[1]),
					parseFloat(nextCommand[2]),
					parseFloat(nextCommand[3]),
					parseInt(nextCommand[4]),
					this.parseColor(nextCommand[7]),
					this.parseColor(nextCommand[8])
				);
				this.animatedObjects.setNodePosition(
					parseInt(nextCommand[1]),
					parseInt(nextCommand[5]),
					parseInt(nextCommand[6])
				);
				undoBlock.push(new UndoCreate(parseInt(nextCommand[1])));
			} else if (nextCommand[0].toUpperCase() === 'SETWIDTH') {
				const id = parseInt(nextCommand[1]);
				this.animatedObjects.setWidth(id, parseInt(nextCommand[2]));
				const oldWidth = this.animatedObjects.getWidth(id);
				undoBlock.push(new UndoSetWidth(id, oldWidth));
			} else if (nextCommand[0].toUpperCase() === 'SETNUMELEMENTS') {
				const oldElem = this.animatedObjects.getObject(parseInt(nextCommand[1]));
				undoBlock.push(new UndoSetNumElements(oldElem, parseInt(nextCommand[2])));
				this.animatedObjects.setNumElements(
					parseInt(nextCommand[1]),
					parseInt(nextCommand[2])
				);
			} else if (nextCommand[0].toUpperCase() === 'SETPOSITION') {
				const id = parseInt(nextCommand[1]);
				const oldX = this.animatedObjects.getNodeX(id);
				const oldY = this.animatedObjects.getNodeY(id);
				undoBlock.push(new UndoSetPosition(id, oldX, oldY));
				this.animatedObjects.setNodePosition(
					id,
					parseInt(nextCommand[2]),
					parseInt(nextCommand[3])
				);
			} else if (nextCommand[0].toUpperCase() === 'ALIGNRIGHT') {
				const id = parseInt(nextCommand[1]);
				const oldX = this.animatedObjects.getNodeX(id);
				// const oldY = this.animatedObjects.getNodeY(id);
				undoBlock.push(new UndoSetPosition(id, oldX.oldY));
				this.animatedObjects.alignRight(id, parseInt(nextCommand[2]));
			} else if (nextCommand[0].toUpperCase() === 'ALIGNLEFT') {
				const id = parseInt(nextCommand[1]);
				const oldX = this.animatedObjects.getNodeX(id);
				// const oldY = this.animatedObjects.getNodeY(id);
				undoBlock.push(new UndoSetPosition(id, oldX.oldY));
				this.animatedObjects.alignLeft(id, parseInt(nextCommand[2]));
			} else if (nextCommand[0].toUpperCase() === 'ALIGNTOP') {
				const id = parseInt(nextCommand[1]);
				const oldX = this.animatedObjects.getNodeX(id);
				// const oldY = this.animatedObjects.getNodeY(id);
				undoBlock.push(new UndoSetPosition(id, oldX.oldY));
				this.animatedObjects.alignTop(id, parseInt(nextCommand[2]));
			} else if (nextCommand[0].toUpperCase() === 'ALIGNBOTTOM') {
				const id = parseInt(nextCommand[1]);
				const oldX = this.animatedObjects.getNodeX(id);
				// const oldY = this.animatedObjects.getNodeY(id);
				undoBlock.push(new UndoSetPosition(id, oldX.oldY));
				this.animatedObjects.alignBottom(id, parseInt(nextCommand[2]));
			} else if (nextCommand[0].toUpperCase() === 'SETHIGHLIGHTINDEX') {
				const id = parseInt(nextCommand[1]);
				const index = parseInt(nextCommand[2]);
				const oldIndex = this.animatedObjects.getHighlightIndex(id);
				undoBlock.push(new UndoSetHighlightIndex(id, oldIndex));
				this.animatedObjects.setHighlightIndex(id, index);
			} else {
				//			throw "Unknown command: " + nextCommand[0];
			}

			this.currentAnimation++;
		}
		this.currFrame = 0;

		// Hack:  If there are not any animations, and we are currently paused,
		// then set the current frame to the end of the animation, so that we will
		// advance immediately upon the next step button.  If we are not paused, then
		// animate as normal.
		if (
			(!anyAnimations && this.animationPaused) ||
			(!anyAnimations && this.currentAnimation === this.animationSteps.length)
		) {
			this.currFrame = this.animationBlockLength;
		}

		this.undoStack.push(undoBlock);
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
			this.animationSteps = ['Step'];
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
			// Re-kick thie timer.  The timer may or may not be running at this point,
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
			// Re-kick thie timer.  The timer may or may not be running at this point,
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
			// Re-kick thie timer.  The timer should be going now, but we've had some difficulty with
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
					this.currentBlock[i].toY
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
						this.currentBlock[i].toY
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
						this.currentBlock[i].toY
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
						this.currentBlock[i].toY
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
			// advance immediagely upon the next step button.  If we are not paused, then
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
						this.currentBlock[i].toY
					);
				} else if (this.currFrame < this.animationBlockLength) {
					const objectID = this.currentBlock[i].objectID;
					const percent = 1 / (this.animationBlockLength - this.currFrame);
					const newX = this.lerp(
						this.animatedObjects.getNodeX(objectID),
						this.currentBlock[i].toX,
						percent
					);
					const newY = this.lerp(
						this.animatedObjects.getNodeY(objectID),
						this.currentBlock[i].toY,
						percent
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

	anumUndoUnavailable() {
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
