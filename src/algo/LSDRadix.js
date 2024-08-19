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
	addCheckboxToAlgorithmBar,
	addControlToAlgorithmBar,
	addDivisorToAlgorithmBar,
	addDropDownGroupToAlgorithmBar,
	addGroupToAlgorithmBar,
	addLabelToAlgorithmBar,
} from './Algorithm.js';
import { act } from '../anim/AnimationMain';
import pseudocodeText from '../pseudocode.json';

const MAX_ARRAY_SIZE = 18;

const INFO_MSG_X = 25;
const INFO_MSG_Y = 15;

const ARRAY_START_X = 485;
const ARRAY_START_Y = 70;

const ARRAY_ELEM_WIDTH = 50;
const ARRAY_ELEM_HEIGHT = 50;

const BUCKETS_START_X = 485;
const NEGATIVE_BUCKETS_START_X = 935;
const BUCKETS_START_Y = 140;

const BUCKET_ELEM_WIDTH = 50;
const BUCKET_ELEM_HEIGHT = 20;
const BUCKET_ELEM_SPACING = 15;

const CODE_START_X = 15;
const CODE_START_Y = 100;

const MAX_VALUE = 999999;

let negativeNumbersEnabled = false;

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
			'Comma seperated list (e.g. "3,1,2"). Max 18 elements & no elements > 6 digits.',
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

		// Examples dropdown
		this.exampleDropdown = addDropDownGroupToAlgorithmBar(
			[
				['', 'Select Example'],
				['603,509,701,404,307,909,102,800,401', "Zero in 10's Place"],
				['362980,46,99,76,69,80,35,28,11', 'One Long Number'],
				['191,225,326,421,537,676,760,845,924', 'Sorted'],
				['Random', 'Random'],
			],
			'Example',
		);
		this.exampleDropdown.onclick = this.exampleCallback.bind(this);
		this.controls.push(this.exampleDropdown);

		// Clear button
		this.clearButton = addControlToAlgorithmBar('Button', 'Clear');
		this.clearButton.onclick = this.clearCallback.bind(this);
		this.controls.push(this.clearButton);

		addDivisorToAlgorithmBar();

		// Option to sort negative numbers
		this.negativeNumbersCheckbox = addCheckboxToAlgorithmBar('Sort negative numbers', false);
		this.negativeNumbersCheckbox.onclick = this.toggleNegativeNumbers.bind(this);
		this.controls.push(this.negativeNumbersCheckbox);
	}

	setup() {
		this.commands = [];
		this.arrayData = [];
		this.arrayID = [];
		this.arrayDisplay = [];
		this.bucketsData = [];
		this.bucketsID = [];
		this.bucketsDisplay = [];
		this.iPointerID = this.nextIndex++;
		this.jPointerID = this.nextIndex++;

		this.infoLabelID = this.nextIndex++;
		this.cmd(act.createLabel, this.infoLabelID, '', INFO_MSG_X, INFO_MSG_Y, 0);

		this.pseudocode = pseudocodeText.LSDRadixSort;
		this.codeID = this.addCodeToCanvasBaseAll(
			this.pseudocode,
			'find',
			CODE_START_X,
			CODE_START_Y,
		);
		this.resetIndex = this.nextIndex;

		this.animationManager.startNewAnimation(this.commands);
		this.animationManager.skipForward();
		this.animationManager.clearHistory();
	}

	reset() {
		this.nextIndex = this.resetIndex;
		this.arrayData = [];
		this.arrayID = [];
		this.arrayDisplay = [];
		this.bucketsData = [];
		this.bucketsID = [];
		this.bucketsDisplay = [];
	}

	sortCallback() {
		const list = this.listField.value.split(',').filter(x => x !== '');
		this.implementAction(this.clear.bind(this), true);
		this.implementAction(this.sort.bind(this), list);
	}

	exampleCallback() {
		const selection = this.exampleDropdown.value;
		if (!selection) {
			return;
		}

		let values = '';
		if (selection === 'Random') {
			//Generate between 5 and 15 random values
			const RANDOM_ARRAY_SIZE = Math.floor(Math.random() * 9) + 5;
			let MIN_DATA_VALUE = 1;
			if (negativeNumbersEnabled) {
				MIN_DATA_VALUE = -500;
			}
			const MAX_DATA_VALUE = 500;
			values = '';
			for (let i = 0; i < RANDOM_ARRAY_SIZE; i++) {
				values += (
					Math.floor(Math.random() * (MAX_DATA_VALUE - MIN_DATA_VALUE)) + MIN_DATA_VALUE
				).toString();
				if (i < RANDOM_ARRAY_SIZE - 1) {
					values += ',';
				}
			}
		} else {
			values = selection;
		}
		this.exampleDropdown.value = '';
		this.listField.value = values;
	}

	clearCallback() {
		this.implementAction(this.clear.bind(this));
	}

	toggleNegativeNumbers() {
		negativeNumbersEnabled = !negativeNumbersEnabled;
		this.implementAction(this.clear.bind(this));
		if (negativeNumbersEnabled) {
			this.cmd(act.setText, this.codeID.code[1][0], '  buckets ← array of 19 lists');
			this.cmd(act.setText, this.codeID.code[7][0], '      b ← array[j] / div % 10 + 9');
			this.cmd(act.setText, this.codeID.code[11][0], '    for bucket ← 0, 18:');

			this.cmd(
				act.setText,
				this.codeID.english[1][0],
				'  buckets is an array containing 19 lists',
			);
			this.cmd(
				act.setText,
				this.codeID.english[7][0],
				'      b is (num at array[j] / base % 10 + 9)',
			);
		} else {
			this.cmd(act.setText, this.codeID.code[1][0], '  buckets ← array of 10 lists');
			this.cmd(act.setText, this.codeID.code[7][0], '      b ← array[j] / div % 10');
			this.cmd(act.setText, this.codeID.code[11][0], '    for bucket ← 0, 9:');

			this.cmd(
				act.setText,
				this.codeID.english[1][0],
				'  buckets is an array containing 10 lists',
			);
			this.cmd(
				act.setText,
				this.codeID.english[7][0],
				'      b is (num at array[j] / base % 10)',
			);
		}
	}

	clear(keepInput) {
		this.commands = [];
		for (let i = 0; i < this.arrayID.length; i++) {
			this.cmd(act.delete, this.arrayID[i]);
		}
		for (let i = 0; i < this.bucketsID.length; i++) {
			for (let j = 0; j < this.bucketsID[i].length; j++) {
				this.cmd(act.delete, this.bucketsID[i][j]);
			}
		}

		if (!keepInput) this.listField.value = '';
		this.cmd(act.setText, this.infoLabelID, '');
		// this.cmd(act.setText, this.codeID[0][0], 'procedure LSDRadixSort(array):'); // dummy line to start animation

		this.arrayData = [];
		this.arrayID = [];
		this.arrayDisplay = [];
		this.bucketsData = [];
		this.bucketsID = [];
		this.bucketsDisplay = [];
		return this.commands;
	}

	sort(list) {
		this.highlight(0, 0, this.codeID);
		this.commands = [];

		// User input validation
		if (!list.length) {
			this.shake(this.sortButton);
			this.cmd(act.setText, this.infoLabelID, 'Data must contain integers such as "3,1,2"');
			return this.commands;
		} else if (list.length > MAX_ARRAY_SIZE) {
			this.shake(this.sortButton);
			this.cmd(
				act.setText,
				this.infoLabelID,
				`Data cannot contain more than ${MAX_ARRAY_SIZE} numbers (you put ${list.length})`,
			);
			return this.commands;
		} else if (list.map(Number).filter(x => Number.isNaN(x)).length) {
			this.shake(this.sortButton);
			this.cmd(act.setText, this.infoLabelID, 'Data cannot contain non-numeric values');
			return this.commands;
		} else if (list.filter(x => Math.abs(x) > MAX_VALUE).length > 0) {
			this.shake(this.sortButton);
			this.cmd(
				act.setText,
				this.infoLabelID,
				'Data cannot contain numbers with more than 6 digits',
			);
			return this.commands;
		} else if (!negativeNumbersEnabled && list.filter(x => x < 0).length > 0) {
			this.shake(this.sortButton);
			this.cmd(
				act.setText,
				this.infoLabelID,
				'Data cannot contain negative numbers unless "Sort negative numbers" is enabled',
			);
			return this.commands;
		}

		this.arrayID = [];
		this.arrayData = list
			.map(x => parseInt(x, 10))
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

		this.cmd(act.step);
		this.unhighlight(0, 0, this.codeID);
		this.highlight(1, 0, this.codeID);

		// Create buckets
		if (negativeNumbersEnabled) {
			for (let i = 0; i < 19; i++) {
				this.bucketsData[i] = [];
				this.bucketsID[i] = [];
				this.bucketsDisplay[i] = [];
				this.bucketsID[i].push(this.nextIndex++);
				const xpos = (i - 9) * ARRAY_ELEM_WIDTH + NEGATIVE_BUCKETS_START_X;
				const ypos = BUCKETS_START_Y;
				this.cmd(
					act.createRectangle,
					this.bucketsID[i][0],
					i - 9,
					BUCKET_ELEM_WIDTH,
					BUCKET_ELEM_HEIGHT,
					xpos,
					ypos,
				);
				this.cmd(act.setBackgroundColor, this.bucketsID[i], '#D3D3D3');
			}
		} else {
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
		}

		// Find number of digits
		this.cmd(act.setText, this.infoLabelID, 'Searching for number with greatest magnitude');
		this.cmd(
			act.createHighlightCircle,
			this.iPointerID,
			'#FF0000',
			ARRAY_START_X,
			ARRAY_START_Y,
			21.5,
		);
		this.cmd(act.setHighlight, this.iPointerID, 1);
		this.cmd(
			act.createHighlightCircle,
			this.jPointerID,
			'#0000FF',
			ARRAY_START_X + ARRAY_ELEM_WIDTH,
			ARRAY_START_Y,
			21.5,
		);
		this.cmd(act.setHighlight, this.jPointerID, 1);

		this.cmd(act.step);
		this.unhighlight(1, 0, this.codeID);
		this.highlight(2, 0, this.codeID);
		let greatest = 0;
		for (let i = 1; i < this.arrayData.length; i++) {
			this.movePointers(greatest, i);
			if (Math.abs(this.arrayData[i]) > Math.abs(this.arrayData[greatest])) {
				greatest = i;
				this.movePointers(greatest, i);
			}
		}

		this.cmd(act.delete, this.iPointerID);
		this.cmd(act.delete, this.jPointerID);
		this.cmd(act.setBackgroundColor, this.arrayID[greatest], '#FFFF00');

		let digits = Math.floor(Math.log10(Math.abs(this.arrayData[greatest]))) + 1;
		digits = digits || 1; // If greatest is 0, above returns NaN, so set to 1 if that happens

		const longData = this.arrayData[greatest];
		this.cmd(
			act.setText,
			this.infoLabelID,
			longData + ' the has largest magnitude with a number of digits k = ' + digits,
		);
		this.cmd(act.step);
		this.unhighlight(2, 0, this.codeID);
		this.cmd(act.setBackgroundColor, this.arrayID[greatest], '#FFFFFF');
		this.highlight(5, 0, this.codeID);

		// Run algorithm
		for (let i = 0; i < digits; i++) {
			this.cmd(
				act.setText,
				this.infoLabelID,
				'Getting digits at index ' + i + ' (0-aligned)',
			);
			this.cmd(
				act.createHighlightCircle,
				this.iPointerID,
				'#0000FF',
				ARRAY_START_X,
				ARRAY_START_Y,
				21.5,
			);
			this.cmd(act.setHighlight, this.iPointerID, 1);
			this.cmd(act.step);
			this.highlight(6, 0, this.codeID);
			for (let j = 0; j < this.arrayData.length; j++) {
				this.cmd(
					act.move,
					this.iPointerID,
					ARRAY_START_X + j * ARRAY_ELEM_WIDTH,
					ARRAY_START_Y,
				);
				this.cmd(act.step);
				this.highlight(7, 0, this.codeID);
				this.cmd(act.step);
				this.unhighlight(7, 0, this.codeID);
				this.highlight(8, 0, this.codeID);
				const id = this.nextIndex++;
				const data = this.arrayData[j];
				const display = this.arrayDisplay[j];
				const digit = this.nthDigit(data, i);
				const offset = negativeNumbersEnabled ? 9 : 0;
				this.bucketsID[digit + offset].push(id);
				this.bucketsData[digit + offset].push(data);
				this.bucketsDisplay[digit + offset].push(display);
				const len = this.bucketsData[digit + offset].length;

				if (negativeNumbersEnabled) {
					this.cmd(
						act.createRectangle,
						id,
						display,
						BUCKET_ELEM_WIDTH,
						BUCKET_ELEM_HEIGHT,
						NEGATIVE_BUCKETS_START_X + digit * BUCKET_ELEM_WIDTH,
						BUCKETS_START_Y + len * BUCKET_ELEM_HEIGHT + len * BUCKET_ELEM_SPACING,
					);
				} else {
					this.cmd(
						act.createRectangle,
						id,
						display,
						BUCKET_ELEM_WIDTH,
						BUCKET_ELEM_HEIGHT,
						BUCKETS_START_X + digit * BUCKET_ELEM_WIDTH,
						BUCKETS_START_Y + len * BUCKET_ELEM_HEIGHT + len * BUCKET_ELEM_SPACING,
					);
				}
				this.cmd(
					act.connect,
					this.bucketsID[digit + offset][this.bucketsID[digit + offset].length - 2],
					id,
					0,
					0,
					1,
					'',
					2,
				);
				this.cmd(act.step);
				this.unhighlight(8, 0, this.codeID);
			}
			this.unhighlight(6, 0, this.codeID);
			this.cmd(act.delete, this.iPointerID);
			this.highlight(10, 0, this.codeID);
			this.cmd(act.step);
			this.unhighlight(10, 0, this.codeID);
			this.highlight(11, 0, this.codeID);
			let index = 0;
			this.cmd(act.step);
			if (negativeNumbersEnabled) {
				for (let j = 0; j < 19; j++) {
					const idBucket = this.bucketsID[j];
					const dataBucket = this.bucketsData[j];
					const displayBucket = this.bucketsDisplay[j];
					this.highlight(12, 0, this.codeID);
					while (dataBucket.length) {
						this.cmd(act.step);
						this.highlight(13, 0, this.codeID);
						const labelID = this.nextIndex++;
						const nodeID = idBucket.splice(1, 1)[0];
						const data = dataBucket.shift();
						const display = displayBucket.shift();
						this.cmd(
							act.createLabel,
							labelID,
							display,
							NEGATIVE_BUCKETS_START_X + (j - 9) * BUCKET_ELEM_WIDTH,
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
						this.unhighlight(13, 0, this.codeID);
						this.highlight(14, 0, this.codeID);
						if (dataBucket.length) {
							this.cmd(act.connect, idBucket[0], idBucket[1]);
							for (let k = 1; k < idBucket.length; k++) {
								this.cmd(
									act.move,
									idBucket[k],
									NEGATIVE_BUCKETS_START_X + (j - 9) * BUCKET_ELEM_WIDTH,
									BUCKETS_START_Y +
										k * BUCKET_ELEM_HEIGHT +
										k * BUCKET_ELEM_SPACING,
								);
							}
						}
						this.cmd(act.step);
						this.arrayData[index] = data;
						this.arrayDisplay[index] = display;
						index++;
						this.unhighlight(14, 0, this.codeID);
					}
					this.unhighlight(12, 0, this.codeID);
				}
				this.unhighlight(11, 0, this.codeID);
			} else {
				for (let j = 0; j < 10; j++) {
					const idBucket = this.bucketsID[j];
					const dataBucket = this.bucketsData[j];
					const displayBucket = this.bucketsDisplay[j];
					this.highlight(12, 0, this.codeID);
					while (dataBucket.length) {
						this.cmd(act.step);
						this.highlight(13, 0, this.codeID);
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
						this.unhighlight(13, 0, this.codeID);
						this.highlight(14, 0, this.codeID);
						if (dataBucket.length) {
							this.cmd(act.connect, idBucket[0], idBucket[1]);
							for (let k = 1; k < idBucket.length; k++) {
								this.cmd(
									act.move,
									idBucket[k],
									BUCKETS_START_X + j * BUCKET_ELEM_WIDTH,
									BUCKETS_START_Y +
										k * BUCKET_ELEM_HEIGHT +
										k * BUCKET_ELEM_SPACING,
								);
							}
						}
						this.cmd(act.step);
						this.arrayData[index] = data;
						this.arrayDisplay[index] = display;
						index++;
						this.unhighlight(14, 0, this.codeID);
					}
					this.unhighlight(12, 0, this.codeID);
				}
				this.unhighlight(11, 0, this.codeID);
				this.highlight(17, 0, this.codeID);
				this.cmd(act.step);
				this.unhighlight(17, 0, this.codeID);
			}
		}
		this.unhighlight(5, 0, this.codeID);

		this.cmd(act.setText, this.infoLabelID, '');
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
		const sign = Math.sign(data);
		data = Math.abs(data);
		data = Math.floor(data / Math.pow(10, digit));
		data %= 10;
		if (sign === -1) {
			data *= -1;
		}
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
