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
// THIS SOFTWARE IS PROVIDED BY David Galles ``AS IS'' AND ANY EXPRESS OR IMPLIED
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

import Algorithm, {
	addControlToAlgorithmBar,
	addDivisorToAlgorithmBar,
	addGroupToAlgorithmBar,
	addLabelToAlgorithmBar,
} from './Algorithm.js';
import { act } from '../anim/AnimationMain';

const MAX_ARRAY_SIZE = 18;

const ARRAY_START_X = 100;
const ARRAY_START_Y = 130;
const ARRAY_ELEM_WIDTH = 50;
const ARRAY_ELEM_HEIGHT = 50;

const COMP_COUNT_X = 100;
const COMP_COUNT_Y = 50;

const WARN_START_X = 200;
const WARN_START_Y = 200;

export default class BogoSort extends Algorithm {
	constructor(am, w, h) {
		super(am, w, h);
		this.addControls();
		this.nextIndex = 0;
		this.setup();
	}

	addControls() {
		this.controls = [];

		const verticalGroup = addGroupToAlgorithmBar(false);

		addLabelToAlgorithmBar(
			'Comma seperated list (e.g. "3,1,2"). No more than 5 elements, unless you have time to spare...',
			verticalGroup,
		);

		const horizontalGroup = addGroupToAlgorithmBar(true, verticalGroup);

		// List text field
		this.listField = addControlToAlgorithmBar('Text', '', horizontalGroup);
		this.listField.onkeydown = this.returnSubmit(
			this.listField,
			this.sortCallback.bind(this),
			60,
			false,
		);
		this.controls.push(this.listField);

		// Sort button
		this.sortButton = addControlToAlgorithmBar('Button', 'Sort', horizontalGroup);
		this.sortButton.onclick = this.sortCallback.bind(this);
		this.controls.push(this.sortButton);

		addDivisorToAlgorithmBar();

		// Clear button
		this.clearButton = addControlToAlgorithmBar('Button', 'Clear');
		this.clearButton.onclick = this.clearCallback.bind(this);
		this.controls.push(this.clearButton);
	}

	setup() {
		this.commands = [];
		this.arrayData = [];
		this.arrayID = [];
		this.displayData = [];
		this.iPointerID = this.nextIndex++;
		this.jPointerID = this.nextIndex++;
		this.comparisonCountID = this.nextIndex++;
		this.warningID = this.nextIndex++;
		this.iterations = 0;

		this.colors = [
			'#f0928e',
			'#f8b896',
			'#a9fd99',
			'#a8fdff',
			'#94b3f9',
			'#ca8ff9',
			'#f092f9',
			'#ed74f0',
			'#ec74b3',
			'#ed7370',
		];

		this.cmd(
			act.createLabel,
			this.comparisonCountID,
			'Iterations: ' + this.iterations,
			COMP_COUNT_X,
			COMP_COUNT_Y,
		);

		this.cmd(act.createLabel, this.warningID, '', WARN_START_X, WARN_START_Y);

		this.animationManager.startNewAnimation(this.commands);
		this.animationManager.skipForward();
		this.animationManager.clearHistory();
	}

	reset() {
		this.nextIndex = 0;
		this.arrayData = [];
		this.arrayID = [];
		this.displayData = [];
		this.removeCode(this.codeID);
		this.iPointerID = this.nextIndex++;
		this.jPointerID = this.nextIndex++;
		this.comparisonCountID = this.nextIndex++;
		this.warningID = this.nextIndex++;
		this.iterations = 0;
	}

	sortCallback() {
		const list = this.listField.value.split(',').filter(x => x !== '');

		if (
			this.listField.value !== '' &&
			list.length <= MAX_ARRAY_SIZE &&
			list.map(Number).filter(x => x > 999 || Number.isNaN(x)).length <= 0
		) {
			this.implementAction(this.clear.bind(this));
			this.listField.value = '';
			this.implementAction(this.sort.bind(this), list);
		}
	}

	clearCallback() {
		this.implementAction(this.clear.bind(this));
	}

	clear() {
		this.commands = [];
		for (let i = 0; i < this.arrayID.length; i++) {
			this.cmd(act.delete, this.arrayID[i]);
		}
		this.arrayData = [];
		this.arrayID = [];
		this.displayData = [];
		this.iterations = 0;
		this.cmd(act.setText, this.comparisonCountID, 'Iterations: ' + this.iterations);
		this.cmd(act.setText, this.warningID, '');
		return this.commands;
	}

	sort(params) {
		this.commands = [];

		this.arrayID = [];
		this.arrayData = params
			.map(Number)
			.filter(x => !Number.isNaN(x))
			.slice(0, MAX_ARRAY_SIZE);
		this.displayData = new Array(this.arrayData.length);
		const length = this.arrayData.length;
		const elemCounts = new Map();
		const letterMap = new Map();

		for (let i = 0; i < length; i++) {
			const count = elemCounts.has(this.arrayData[i]) ? elemCounts.get(this.arrayData[i]) : 0;
			if (count > 0) {
				letterMap.set(this.arrayData[i], 'a');
			}
			elemCounts.set(this.arrayData[i], count + 1);
		}

		for (let i = 0; i < length; i++) {
			this.arrayID[i] = this.nextIndex++;
			const xpos = i * ARRAY_ELEM_WIDTH + ARRAY_START_X;
			const ypos = ARRAY_START_Y;

			let displayData = this.arrayData[i].toString();
			if (letterMap.has(this.arrayData[i])) {
				const currChar = letterMap.get(this.arrayData[i]);
				displayData += currChar;
				letterMap.set(this.arrayData[i], String.fromCharCode(currChar.charCodeAt(0) + 1));
			}
			this.displayData[i] = displayData;
			this.cmd(
				act.createRectangle,
				this.arrayID[i],
				displayData,
				ARRAY_ELEM_WIDTH,
				ARRAY_ELEM_HEIGHT,
				xpos,
				ypos,
			);
		}

		for (let i = 0; i < this.arrayData.length; i++) {
			this.cmd(act.setBackgroundColor, this.arrayID[i], this.colors[i % this.colors.length]);
		}

		this.cmd(act.step);

		if (this.arrayData.length >= 10) {
			for (let i = 0; i < this.arrayData.length / 2; i++) {
				this.cmd(act.step);
			}
			while (this.arrayID.length > 0) {
				const cell = this.arrayID.splice(
					Math.floor(Math.random() * (this.arrayID.length - 1)),
					1,
				);
				this.cmd(act.delete, cell);
				this.cmd(act.step);
			}
			this.arrayID = [];
			this.arrayData = [];
			this.displayData = [];
			this.iterations = 0;
			this.cmd(act.setText, this.comparisonCountID, 'Iterations: ' + this.iterations);
			this.cmd(
				act.setText,
				this.warningID,
				'Yeah so that array was too long...try something smaller',
			);
			return this.commands;
		}

		let sorted = false;
		while (!sorted) {
			this.cmd(act.setText, this.comparisonCountID, 'Iterations: ' + this.iterations++);
			sorted = true;

			for (let i = 0; i < length - 1; i++) {
				if (this.arrayData[i] > this.arrayData[i + 1]) {
					sorted = false;
					break;
				}
			}
			if (!sorted) {
				this.shuffle();
			} else {
				for (let i = 0; i < length; i++) {
					this.cmd(
						act.setBackgroundColor,
						this.arrayID[i],
						this.colors[i % this.colors.length],
					);
				}
			}
			this.cmd(act.step);
		}

		this.cmd(act.step);

		return this.commands;
	}

	movePointers(i, j) {
		const iXPos = i * ARRAY_ELEM_WIDTH + ARRAY_START_X;
		const iYPos = ARRAY_START_Y;
		this.cmd(act.move, this.iPointerID, iXPos, iYPos);
		const jXPos = j * ARRAY_ELEM_WIDTH + ARRAY_START_X;
		const jYPos = ARRAY_START_Y;
		this.cmd(act.move, this.jPointerID, jXPos, jYPos);
		this.cmd(act.step);
	}

	shuffle() {
		for (let i = 0; i < this.arrayData.length; i++) {
			this.swap(i, Math.floor(Math.random() * (this.arrayData.length - 1)));
			this.cmd(
				act.setBackgroundColor,
				this.arrayID[i],
				this.colors[Math.abs(this.iterations - i) % this.colors.length],
			);
		}
	}

	swap(i, j) {
		this.cmd(act.setText, this.arrayID[i], this.displayData[j]);
		this.cmd(act.setText, this.arrayID[j], this.displayData[i]);

		// Swap data in backend array
		let temp = this.arrayData[i];
		this.arrayData[i] = this.arrayData[j];
		this.arrayData[j] = temp;

		// Swap data in display array
		temp = this.displayData[i];
		this.displayData[i] = this.displayData[j];
		this.displayData[j] = temp;
	}

	disableUI() {
		for (let i = 0; i < this.controls.length; i++) {
			this.controls[i].disabled = true;
		}
	}

	enableUI() {
		for (let i = 0; i < this.controls.length; i++) {
			this.controls[i].disabled = false;
		}
	}
}
