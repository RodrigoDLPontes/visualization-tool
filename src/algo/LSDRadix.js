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

const INFO_LABEL_X = 75;
const INFO_LABEL_Y = 20;

const ARRAY_START_X = 100;
const ARRAY_START_Y = 70;

const ARRAY_ELEM_WIDTH = 50;
const ARRAY_ELEM_HEIGHT = 50;

const BUCKETS_START_X = 100;
const BUCKETS_START_Y = 140;

const BUCKET_ELEM_WIDTH = 50;
const BUCKET_ELEM_HEIGHT = 20;
const BUCKET_ELEM_SPACING = 15;

export default class LSDRadix extends Algorithm {
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
			'Comma seperated list (e.g. "3,1,2"). Max 18 elements & no elements < 0',
			verticalGroup
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
		this.arrayData = [];
		this.arrayID = [];
		this.arrayDisplay = [];
		this.bucketsData = [];
		this.bucketsID = [];
		this.bucketsDisplay = [];
		this.iPointerID = this.nextIndex++;
		this.jPointerID = this.nextIndex++;
		this.infoLabelID = this.nextIndex++;

		this.animationManager.startNewAnimation();
		this.animationManager.skipForward();
		this.animationManager.clearHistory();
	}

	reset() {
		this.nextIndex = 0;
		this.arrayData = [];
		this.arrayID = [];
		this.arrayDisplay = [];
		this.bucketsData = [];
		this.bucketsID = [];
		this.bucketsDisplay = [];
		this.iPointerID = this.nextIndex++;
		this.jPointerID = this.nextIndex++;
		this.infoLabelID = this.nextIndex++;
	}

	sortCallback() {
		const list = this.listField.value.split(',').filter(x => x !== '');
		if (
			this.listField.value !== ''
			&& list.length <= MAX_ARRAY_SIZE
			&& list.map(Number).filter(x => Number.isNaN(x)).length <= 0
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
		for (let i = 0; i < this.bucketsID.length; i++) {
			for (let j = 0; j < this.bucketsID[i].length; j++) {
				this.cmd(act.delete, this.bucketsID[i][j]);
			}
		}
		this.arrayData = [];
		this.arrayID = [];
		this.arrayDisplay = [];
		this.bucketsData = [];
		this.bucketsID = [];
		this.bucketsDisplay = [];
		return this.commands;
	}

	sort(params) {
		this.commands = [];

		this.arrayID = [];
		this.arrayData = params
			.map(Number)
			.filter(x => !Number.isNaN(x))
			.slice(0, MAX_ARRAY_SIZE);
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

		// Create data array
		for (let i = 0; i < length; i++) {
			this.arrayID[i] = this.nextIndex++;
			const xpos = i * ARRAY_ELEM_WIDTH + ARRAY_START_X;
			const ypos = ARRAY_START_Y;

			let arrayDisplay = this.arrayData[i].toString();
			if (letterMap.has(this.arrayData[i])) {
				const currChar = letterMap.get(this.arrayData[i]);
				arrayDisplay += currChar;
				letterMap.set(this.arrayData[i], String.fromCharCode(currChar.charCodeAt(0) + 1));
			}
			this.arrayDisplay[i] = arrayDisplay;
			this.cmd(
				act.createRectangle,
				this.arrayID[i],
				arrayDisplay,
				ARRAY_ELEM_WIDTH,
				ARRAY_ELEM_HEIGHT,
				xpos,
				ypos,
			);
		}

		this.bucketsData = [];
		this.bucketsID = [];

		// Create buckets
		for (let i = 0; i < 10; i++) {
			this.bucketsData[i] = [];
			this.bucketsID[i] = [];
			this.bucketsDisplay[i] = [];
			this.bucketsID[i].push(this.nextIndex++);
			const xpos = i * ARRAY_ELEM_WIDTH + BUCKETS_START_X;
			const ypos = BUCKETS_START_Y;
			this.cmd(
				act.createRectangle,
				this.bucketsID[i][0],
				i,
				BUCKET_ELEM_WIDTH,
				BUCKET_ELEM_HEIGHT,
				xpos,
				ypos,
			);
			this.cmd(act.setBackgroundColor, this.bucketsID[i], '#D3D3D3');
		}

		// Find number of digits
		this.cmd(
			act.createLabel,
			this.infoLabelID,
			'Searching for number with greatest magnitude',
			INFO_LABEL_X,
			INFO_LABEL_Y,
			0,
		);
		this.cmd(
			act.createHighlightCircle,
			this.iPointerID,
			'#FF0000',
			ARRAY_START_X,
			ARRAY_START_Y,
		);
		this.cmd(act.setHighlight, this.iPointerID, 1);
		this.cmd(
			act.createHighlightCircle,
			this.jPointerID,
			'#0000FF',
			ARRAY_START_X + ARRAY_ELEM_WIDTH,
			ARRAY_START_Y,
		);
		this.cmd(act.setHighlight, this.jPointerID, 1);

		let greatest = 0;
		for (let i = 1; i < this.arrayData.length; i++) {
			this.movePointers(greatest, i);
			if (this.arrayData[i] > this.arrayData[greatest]) {
				greatest = i;
				this.movePointers(greatest, i);
			}
		}

		this.cmd(act.delete, this.iPointerID);
		this.cmd(act.delete, this.jPointerID);
		this.cmd(act.setBackgroundColor, this.arrayID[greatest], '#FFFF00');

		let digits = Math.floor(Math.log10(this.arrayData[greatest])) + 1;
		digits = digits || 1; // If greatest is 0, above returns NaN, so set to 1 if that happens

		const longData = this.arrayData[greatest];
		this.cmd(
			act.setText,
			this.infoLabelID,
			longData + ' has greatest magnitude, number of digits is ' + digits,
		);
		this.cmd(act.step);
		this.cmd(act.setBackgroundColor, this.arrayID[greatest], '#FFFFFF');

		// Run algorithm
		for (let i = 0; i < digits; i++) {
			this.cmd(act.setText, this.infoLabelID, 'Getting digits at position ' + (i + 1));
			this.cmd(
				act.createHighlightCircle,
				this.iPointerID,
				'#0000FF',
				ARRAY_START_X,
				ARRAY_START_Y,
			);
			this.cmd(act.setHighlight, this.iPointerID, 1);
			for (let j = 0; j < this.arrayData.length; j++) {
				this.cmd(
					act.move,
					this.iPointerID,
					ARRAY_START_X + j * ARRAY_ELEM_WIDTH,
					ARRAY_START_Y,
				);
				this.cmd(act.step);
				const id = this.nextIndex++;
				const data = this.arrayData[j];
				const display = this.arrayDisplay[j];
				const digit = this.nthDigit(data, i);
				this.bucketsID[digit].push(id);
				this.bucketsData[digit].push(data);
				this.bucketsDisplay[digit].push(display);
				const len = this.bucketsData[digit].length;
				this.cmd(
					act.createRectangle,
					id,
					display,
					BUCKET_ELEM_WIDTH,
					BUCKET_ELEM_HEIGHT,
					BUCKETS_START_X + digit * BUCKET_ELEM_WIDTH,
					BUCKETS_START_Y + len * BUCKET_ELEM_HEIGHT + len * BUCKET_ELEM_SPACING,
				);
				this.cmd(
					act.connect,
					this.bucketsID[digit][this.bucketsID[digit].length - 2],
					id,
					0,
					0,
					1,
					'',
					2,
				);
				this.cmd(act.step);
			}
			this.cmd(act.delete, this.iPointerID);
			this.cmd(act.step);
			let index = 0;
			for (let j = 0; j < 10; j++) {
				const idBucket = this.bucketsID[j];
				const dataBucket = this.bucketsData[j];
				const displayBucket = this.bucketsDisplay[j];
				while (dataBucket.length) {
					const labelID = this.nextIndex++;
					const nodeID = idBucket.splice(1, 1)[0];
					const data = dataBucket.shift();
					const display = displayBucket.shift();
					this.cmd(
						act.createLabel,
						labelID,
						display,
						BUCKETS_START_X + j * BUCKET_ELEM_WIDTH,
						BUCKETS_START_Y + BUCKET_ELEM_HEIGHT + BUCKET_ELEM_SPACING,
					);
					this.cmd(
						act.move,
						labelID,
						ARRAY_START_X + index * ARRAY_ELEM_WIDTH,
						ARRAY_START_Y,
					);
					this.cmd(act.step);
					this.cmd(act.setText, this.arrayID[index], display);
					this.cmd(act.delete, labelID);
					this.cmd(act.delete, nodeID);
					if (dataBucket.length) {
						this.cmd(act.connect, idBucket[0], idBucket[1]);
						for (let k = 1; k < idBucket.length; k++) {
							this.cmd(
								act.move,
								idBucket[k],
								BUCKETS_START_X + j * BUCKET_ELEM_WIDTH,
								BUCKETS_START_Y + k * BUCKET_ELEM_HEIGHT + k * BUCKET_ELEM_SPACING,
							);
						}
						this.cmd(act.step);
					}
					this.arrayData[index] = data;
					this.arrayDisplay[index] = display;
					index++;
				}
			}
		}

		this.cmd(act.delete, this.infoLabelID);

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

	swap(i, j) {
		const iLabelID = this.nextIndex++;
		const iXPos = i * ARRAY_ELEM_WIDTH + ARRAY_START_X;
		const iYPos = ARRAY_START_Y;
		this.cmd(act.createLabel, iLabelID, this.displayData[i], iXPos, iYPos);
		const jLabelID = this.nextIndex++;
		const jXPos = j * ARRAY_ELEM_WIDTH + ARRAY_START_X;
		const jYPos = ARRAY_START_Y;
		this.cmd(act.createLabel, jLabelID, this.displayData[j], jXPos, jYPos);
		this.cmd(act.setText, this.arrayID[i], '');
		this.cmd(act.setText, this.arrayID[j], '');
		this.cmd(act.move, iLabelID, jXPos, jYPos);
		this.cmd(act.move, jLabelID, iXPos, iYPos);
		this.cmd(act.step);
		this.cmd(act.setText, this.arrayID[i], this.displayData[j]);
		this.cmd(act.setText, this.arrayID[j], this.displayData[i]);
		this.cmd(act.delete, iLabelID);
		this.cmd(act.delete, jLabelID);
		// Swap data in backend array
		let temp = this.arrayData[i];
		this.arrayData[i] = this.arrayData[j];
		this.arrayData[j] = temp;
		// Swap data in display array
		temp = this.displayData[i];
		this.displayData[i] = this.displayData[j];
		this.displayData[j] = temp;
	}

	nthDigit(data, digit) {
		data = Math.floor(data / Math.pow(10, digit));
		data %= 10;
		return data;
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
