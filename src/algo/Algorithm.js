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

import { act } from '../anim/AnimationMain';

export function addLabelToAlgorithmBar(labelName, group) {
	const element = document.createElement('p');
	element.appendChild(document.createTextNode(labelName));

	if (!group) {
		const tableEntry = document.createElement('td');
		tableEntry.appendChild(element);

		const controlBar = document.getElementById('AlgorithmSpecificControls');
		// Append the element in page (in span)
		controlBar.appendChild(tableEntry);
	} else {
		group.appendChild(element);
		element.setAttribute('class', 'groupChild');
	}

	return element;
}

export function addCheckboxToAlgorithmBar(boxLabel, checked, group) {
	const element = document.createElement('input');

	element.setAttribute('type', 'checkbox');
	element.setAttribute('id', boxLabel);
	element.setAttribute('name', boxLabel);
	element.setAttribute('value', boxLabel);
	checked && element.setAttribute('checked', 'true');

	const label = document.createElement('label');
	label.setAttribute('for', boxLabel);
	const txtNode = document.createTextNode(boxLabel);
	label.appendChild(txtNode);

	if (!group) {
		const tableEntry = document.createElement('td');
		tableEntry.appendChild(element);
		tableEntry.appendChild(label);

		const controlBar = document.getElementById('AlgorithmSpecificControls');
		controlBar.appendChild(tableEntry);
	} else {
		const span = document.createElement('span');
		span.appendChild(element);
		span.appendChild(label);

		group.appendChild(span);
		span.setAttribute('class', 'groupChild');
	}

	return element;
}

export function addRadioButtonGroupToAlgorithmBar(buttonNames, groupName, group) {
	const buttonList = [];
	const newTable = document.createElement('table');

	for (let i = 0; i < buttonNames.length; i++) {
		const midLevel = document.createElement('tr');
		const bottomLevel = document.createElement('td');

		const button = document.createElement('input');
		button.setAttribute('type', 'radio');
		button.setAttribute('name', groupName);
		button.setAttribute('id', buttonNames[i]);
		button.setAttribute('value', buttonNames[i]);
		bottomLevel.appendChild(button);
		midLevel.appendChild(bottomLevel);
		const label = document.createElement('label');
		label.setAttribute('for', buttonNames[i]);
		const txtNode = document.createTextNode(' ' + buttonNames[i]);
		label.appendChild(txtNode);
		bottomLevel.appendChild(label);
		newTable.appendChild(midLevel);
		buttonList.push(button);
	}

	if (!group) {
		const topLevelTableEntry = document.createElement('td');
		topLevelTableEntry.appendChild(newTable);

		const controlBar = document.getElementById('AlgorithmSpecificControls');
		controlBar.appendChild(topLevelTableEntry);
	} else {
		group.appendChild(newTable);
		newTable.setAttribute('class', 'groupChild');
	}

	return buttonList;
}

export function addControlToAlgorithmBar(type, value, group) {
	const element = document.createElement('input');

	element.setAttribute('type', type);
	element.setAttribute('value', value);

	if (!group) {
		const tableEntry = document.createElement('td');
		tableEntry.appendChild(element);

		const controlBar = document.getElementById('AlgorithmSpecificControls');
		controlBar.appendChild(tableEntry);
	} else {
		group.appendChild(element);
		element.setAttribute('class', 'groupChild');
	}

	return element;
}

export function addDivisorToAlgorithmBar() {
	const divisorLeft = document.createElement('td');
	divisorLeft.setAttribute('class', 'divisorLeft');

	const divisorRight = document.createElement('td');
	divisorRight.setAttribute('class', 'divisorRight');

	const controlBar = document.getElementById('AlgorithmSpecificControls');
	controlBar.appendChild(divisorLeft);
	controlBar.appendChild(divisorRight);
}

export function addGroupToAlgorithmBar(horizontal, parentGroup) {
	const group = document.createElement('div');

	group.setAttribute('class', horizontal ? 'hgroup' : 'vgroup');

	if (!parentGroup) {
		const tableEntry = document.createElement('td');
		tableEntry.appendChild(group);

		const controlBar = document.getElementById('AlgorithmSpecificControls');
		controlBar.appendChild(tableEntry);
	} else {
		parentGroup.appendChild(group);
	}

	return group;
}

const CODE_LINE_HEIGHT = 14;
const CODE_HIGHLIGHT_COLOR = '#FF0000';
const CODE_STANDARD_COLOR = '#000000';

export default class Algorithm {
	constructor(am, w, h) {
		if (am == null) {
			return;
		}
		this.animationManager = am;
		am.addListener('AnimationStarted', this, this.disableUI);
		am.addListener('AnimationEnded', this, this.enableUI);
		am.addListener('AnimationUndo', this, this.undo);
		this.canvasWidth = w;
		this.canvasHeight = h;

		this.actionHistory = [];
		this.recordAnimation = true;
		this.commands = [];
	}

	addCodeToCanvasBase(code, start_x, start_y, line_height, standard_color, layer) {
		line_height = typeof line_height !== 'undefined' ? line_height : CODE_LINE_HEIGHT;
		standard_color =
			typeof standard_color !== 'undefined' ? standard_color : CODE_STANDARD_COLOR;
		layer = typeof layer !== 'undefined' ? layer : 0;
		const codeID = Array(code.length);
		console.log(this.nextIndex);
		let i, j;
		for (i = 0; i < code.length; i++) {
			codeID[i] = new Array(code[i].length);
			for (j = 0; j < code[i].length; j++) {
				codeID[i][j] = this.nextIndex++;
				this.cmd(
					act.createLabel,
					codeID[i][j],
					code[i][j],
					start_x,
					start_y + i * line_height,
					0,
				);
				this.cmd(act.setForegroundColor, codeID[i][j], standard_color);
				this.cmd(act.setLayer, codeID[i][j], layer);
				if (j > 0) {
					this.cmd(act.alignRight, codeID[i][j], codeID[i][j - 1]);
				}
			}
		}
		return codeID;
	}

	highlight(ind1, ind2) {
		this.cmd(act.setForegroundColor, this.codeID[ind1][ind2], CODE_HIGHLIGHT_COLOR);
	}

	unhighlight(ind1, ind2) {
		this.cmd(act.setForegroundColor, this.codeID[ind1][ind2], CODE_STANDARD_COLOR);
	}

	removeCode(codeID) {
		for (let i = 0; i < codeID.length; i++) {
			for (let j = 0; j < codeID[i].length; j++) {
				this.cmd(act.delete, codeID[i][j]);
			}
		}
	}

	setCodeAlpha(code, newAlpha) {
		for (let i = 0; i < code.length; i++) {
			for (let j = 0; j < code[i].length; j++) {
				this.cmd(act.setAlpha, code[i][j], newAlpha);
			}
		}
	}

	cmd(act, ...params) {
		// Helper method to add command to stack
		if (this.recordAnimation) {
			this.commands.push([act, params]);
		}
	}

	clearHistory() {
		this.actionHistory = [];
	}

	undo() {
		// Remove the last action (the one that we are going to undo)
		this.actionHistory.pop();
		// Clear out our data structure.  Be sure to implement reset in
		// every AlgorithmAnimation subclass!
		this.reset();
		//  Redo all actions from the beginning, throwing out the animation
		//  commands (the animation manager will update the animation on its own).
		//  Note that if you do something non-deterministic, you might cause problems!
		//  Be sure if you do anything non-deterministic (that is, calls to a random
		//  number generator) you clear out the undo stack here and in the animation
		//  manager.

		//  If this seems horribly inefficient -- it is! However, it seems to work well
		//  in practice, and you get undo for free for all algorithms, which is a non-trivial
		//  gain.
		const len = this.actionHistory.length;
		this.recordAnimation = false;
		for (let i = 0; i < len; i++) {
			this.actionHistory[i][0](...this.actionHistory[i][1]);
		}
		this.recordAnimation = true;
	}

	implementAction(func, ...args) {
		const next = [func, args];
		this.actionHistory.push(next);
		const retVal = func(...args);
		this.animationManager.startNewAnimation(retVal);
	}

	normalizeNumber(input, maxLen) {
		const isAllDigits = str => !/\D/.test(str);
		if (!isAllDigits(input) || input === '') {
			return input;
		}
		return input.substr(-maxLen);
	}

	returnSubmit(field, funct, maxsize, intOnly) {
		if (maxsize !== undefined) {
			field.size = maxsize;
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

			if (keyASCII === 13 && funct != null) {
				funct();
			} else if (
				keyASCII === 190 ||
				keyASCII === 59 ||
				keyASCII === 173 ||
				keyASCII === 189
			) {
				return false;
			} else if (
				(maxsize !== undefined && field.value.length >= maxsize) ||
				(intOnly && (keyASCII < 48 || keyASCII > 57))
			) {
				if (!controlKey(keyASCII)) return false;
			}
		};
	}

	// Abstract methods - these should be implemented in the base class

	// eslint-disable-next-line no-unused-vars
	sizeChanged(newWidth, newHeight) {
		throw new Error('sizeChanged() should be implemented in base class');
	}

	// eslint-disable-next-line no-unused-vars
	disableUI(event) {
		throw new Error('disableUI() should be implemented in base class');
	}

	// eslint-disable-next-line no-unused-vars
	enableUI(event) {
		throw new Error('enableUI() should be implemented in base class');
	}

	reset() {
		throw new Error('reset() should be implemented in base class');
	}
}

export function controlKey(keyASCII) {
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

Algorithm.prototype.returnSubmitFloat = function (field, funct, maxsize) {
	if (maxsize !== undefined) {
		field.size = maxsize;
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
		// Submit on return
		if (keyASCII === 13) {
			funct();
		}
		// Control keys (arrows, del, etc) are always OK
		else if (controlKey(keyASCII)) {
			return;
		}
		// - (minus sign) only OK at beginning of number
		//  (For now we will allow anywhere -- hard to see where the beginning of the
		//   number is ...)
		//else if (keyASCII == 109 && field.value.length  == 0)
		else if (keyASCII === 109) {
			return;
		}
		// Digis are OK if we have enough space
		else if (
			(maxsize !== undefined || field.value.length < maxsize) &&
			keyASCII >= 48 &&
			keyASCII <= 57
		) {
			return;
		}
		// . (Decimal point) is OK if we haven't had one yet, and there is space
		else if (
			(maxsize !== undefined || field.value.length < maxsize) &&
			keyASCII === 190 &&
			field.value.indexOf('.') === -1
		) {
			return;
		}
		// Nothing else is OK
		else {
			return false;
		}
	};
};

Algorithm.prototype.addReturnSubmit = function (field, action) {
	field.onkeydown = this.returnSubmit(field, action, 4, false);
};
