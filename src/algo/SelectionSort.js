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
	addDropDownGroupToAlgorithmBar,
	addGroupToAlgorithmBar,
	addLabelToAlgorithmBar,
	addRadioButtonGroupToAlgorithmBar,
} from './Algorithm.js';
import { act } from '../anim/AnimationMain';
import pseudocodeText from '../pseudocode.json';

const MAX_ARRAY_SIZE = 18;

const INFO_MSG_X = 25;
const INFO_MSG_Y = 15;

const ARRAY_START_X = 100;
const ARRAY_START_Y = 130;
const ARRAY_ELEM_WIDTH = 50;
const ARRAY_ELEM_HEIGHT = 50;

const COMP_COUNT_X = 100;
const COMP_COUNT_Y = 50;

const CODE_START_X = 50;
const CODE_START_Y = 200;

// const ARRRAY_ELEMS_PER_LINE = 15;
// const ARRAY_LINE_SPACING = 130;

// const TOP_POS_X = 180;
// const TOP_POS_Y = 100;
// const TOP_LABEL_X = 130;
// const TOP_LABEL_Y = 100;

// const PUSH_LABEL_X = 50;
// const PUSH_LABEL_Y = 30;
// const PUSH_ELEMENT_X = 120;
// const PUSH_ELEMENT_Y = 30;

// const SIZE = 10;

export default class SelectionSort extends Algorithm {
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
			'Comma seperated list (e.g. "3,1,2"). Max 18 elements & no elements > 999',
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
				['1,2,3,4,5,6,7,8,9', 'Sorted'],
				['9,8,7,6,5,4,3,2,1', 'Reverse Sorted'],
				['2,3,4,5,6,7,8,9,1', 'Almost Sorted'],
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

		//Min & Max selection button
		addDivisorToAlgorithmBar();

		const minMaxButtonList = addRadioButtonGroupToAlgorithmBar(
			['Maximum', 'Minimum'],
			'Max/Min',
		);

		this.minButton = minMaxButtonList[1];
		this.minButton.onclick = this.minCallback.bind(this);
		this.controls.push(this.minButton);
		this.maxButton = minMaxButtonList[0];
		this.maxButton.onclick = this.maxCallback.bind(this);
		this.controls.push(this.maxButton);
		this.maxButton.checked = true;
		this.isMin = false;
	}

	setup() {
		this.commands = [];
		this.arrayData = [];
		this.arrayID = [];
		this.displayData = [];
		this.iPointerID = this.nextIndex++;
		this.jPointerID = this.nextIndex++;
		this.comparisonCountID = this.nextIndex++;

		this.compCount = 0;
		this.cmd(
			act.createLabel,
			this.comparisonCountID,
			'Comparison Count: ' + this.compCount,
			COMP_COUNT_X,
			COMP_COUNT_Y,
		);

		this.infoLabelID = this.nextIndex++;
		this.cmd(act.createLabel, this.infoLabelID, '', INFO_MSG_X, INFO_MSG_Y, 0);

		this.swapCountID = this.nextIndex++;
		this.swapCount = 0;
		this.cmd(
			act.createLabel,
			this.swapCountID,
			'Swap Count: ' + this.swapCount,
			COMP_COUNT_X + 250,
			COMP_COUNT_Y,
		);

		this.pseudocode = pseudocodeText.SelectionSort;
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
		this.displayData = [];
		this.compCount = 0;
		this.swapCount = 0;
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
			const MIN_DATA_VALUE = 1;
			const MAX_DATA_VALUE = 14;
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

	minCallback() {
		if (!this.isMin) {
			this.implementAction(this.clear.bind(this));
			this.cmd(act.setText, this.codeID.code[2][0], '  for i ← 0, length:');
			this.cmd(act.setText, this.codeID.code[3][0], '    min ← i');
			this.cmd(act.setText, this.codeID.code[4][0], '    for j ← i + 1, length:');
			this.cmd(act.setText, this.codeID.code[5][0], '      if array[j] < array[min]:');
			this.cmd(act.setText, this.codeID.code[6][0], '        min ← j');
			this.cmd(act.setText, this.codeID.code[9][0], '    swap array[min], array[i]');

			this.cmd(act.setText, this.codeID.english[2][0], '  for (i from start to end):');
			this.cmd(act.setText, this.codeID.english[3][0], '    initialize min value');
			this.cmd(act.setText, this.codeID.english[4][0], '    for (j from i to end):');
			this.cmd(act.setText, this.codeID.english[5][0], '      if (array[j] < min value):');
			this.cmd(act.setText, this.codeID.english[6][0], '        min value is array[j]');
			this.cmd(act.setText, this.codeID.english[9][0], '    swap min value with array[i]');
			this.isMin = true;
		}
	}

	maxCallback() {
		if (this.isMin) {
			this.implementAction(this.clear.bind(this));
			this.cmd(act.setText, this.codeID.code[2][0], '  for i ← length - 1, 0:');
			this.cmd(act.setText, this.codeID.code[3][0], '    max ← i');
			this.cmd(act.setText, this.codeID.code[4][0], '    for j ← i - 1, 0:');
			this.cmd(act.setText, this.codeID.code[5][0], '      if array[j] > array[max]:');
			this.cmd(act.setText, this.codeID.code[6][0], '        max ← j');
			this.cmd(act.setText, this.codeID.code[9][0], '    swap array[max], array[i]');

			this.cmd(act.setText, this.codeID.english[2][0], '  for (i from end to start):');
			this.cmd(act.setText, this.codeID.english[3][0], '    initialize max value');
			this.cmd(act.setText, this.codeID.english[4][0], '    for (j from start to i):');
			this.cmd(act.setText, this.codeID.english[5][0], '      if (array[j] > max value):');
			this.cmd(act.setText, this.codeID.english[6][0], '        max value is array[j]');
			this.cmd(act.setText, this.codeID.english[9][0], '    swap max value with array[i]');
			this.isMin = false;
		}
	}

	sortCallback() {
		const list = this.listField.value.split(',').filter(x => x !== '');
		this.implementAction(this.clear.bind(this), true);
		this.implementAction(this.sort.bind(this), list);
	}

	clearCallback() {
		this.implementAction(this.clear.bind(this));
	}

	clear(keepInput) {
		this.commands = [];

		for (let i = 0; i < this.arrayID.length; i++) {
			this.cmd(act.delete, this.arrayID[i]);
		}

		this.arrayData = [];
		this.arrayID = [];
		this.compCount = 0;
		this.swapCount = 0;
		this.displayData = [];
		if (!keepInput) this.listField.value = '';
		this.cmd(act.setText, this.infoLabelID, '');
		this.cmd(act.setText, this.comparisonCountID, 'Comparison Count: ' + this.compCount);
		this.cmd(act.setText, this.swapCountID, 'Swap Count: ' + this.swapCount);
		return this.commands;
	}

	sort(list) {
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
		} else if (list.map(Number).filter(x => x > 999 || Number.isNaN(x)).length) {
			this.shake(this.sortButton);
			this.cmd(
				act.setText,
				this.infoLabelID,
				'Data cannot contain non-numeric values or numbers > 999',
			);
			return this.commands;
		}

		this.highlight(1, 0, this.codeID);

		this.arrayID = [];
		this.arrayData = list
			.map(Number)
			.filter(x => !Number.isNaN(x))
			.slice(0, MAX_ARRAY_SIZE);
		const length = this.arrayData.length;
		this.displayData = new Array(length);

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
		let circleShift = 0;
		if (!this.isMin) {
			circleShift = ARRAY_ELEM_WIDTH * (this.arrayData.length - 1);
		}
		this.cmd(
			act.createHighlightCircle,
			this.iPointerID,
			'#FF0000',
			ARRAY_START_X + circleShift,
			ARRAY_START_Y,
		);

		circleShift = ARRAY_ELEM_WIDTH;
		if (!this.isMin) {
			circleShift = ARRAY_ELEM_WIDTH * (this.arrayData.length - 2);
		}

		this.cmd(act.setHighlight, this.iPointerID, 1);
		this.cmd(
			act.createHighlightCircle,
			this.jPointerID,
			'#0000FF',
			ARRAY_START_X + circleShift,
			ARRAY_START_Y,
		);
		this.cmd(act.step);
		this.unhighlight(1, 0, this.codeID);
		this.cmd(act.setHighlight, this.jPointerID, 1);
		this.highlight(2, 0, this.codeID);
		this.cmd(act.step);
		for (let i = 0; i < this.arrayData.length - 1; i++) {
			this.highlight(3, 0, this.codeID);
			let k = i;
			if (!this.isMin) {
				k = this.arrayData.length - 1 - i;
			}

			let toSwap = k;
			this.cmd(act.setBackgroundColor, this.arrayID[toSwap], '#FFFF00');
			this.cmd(act.step);
			this.unhighlight(3, 0, this.codeID);
			this.highlight(4, 0, this.codeID);
			this.cmd(act.step);
			for (let j = i + 1; j < this.arrayData.length; j++) {
				let w = j;
				if (!this.isMin) {
					w = this.arrayData.length - 1 - j;
				}

				this.movePointers(toSwap, w);
				if (this.compare(this.arrayData[w], this.arrayData[toSwap])) {
					this.cmd(act.setBackgroundColor, this.arrayID[toSwap], '#FFFFFF');
					this.highlight(6, 0, this.codeID);
					this.cmd(act.step);
					toSwap = w;
					this.movePointers(toSwap, w);
					this.cmd(act.setBackgroundColor, this.arrayID[toSwap], '#FFFF00');
					this.cmd(act.step);
					this.unhighlight(6, 0, this.codeID);
				}
			}
			this.unhighlight(4, 0, this.codeID);
			this.swap(k, toSwap);
			this.cmd(act.setBackgroundColor, this.arrayID[toSwap], '#FFFFFF');
			this.cmd(act.step);
			this.cmd(act.setBackgroundColor, this.arrayID[k], '#2ECC71');
			this.cmd(act.step);
		}
		this.unhighlight(2, 0, this.codeID);

		this.cmd(act.delete, this.iPointerID);
		this.cmd(act.delete, this.jPointerID);
		this.cmd(act.step);

		let lastIndex = this.arrayID.length - 1;
		if (!this.isMin) {
			lastIndex = 0;
		}
		this.cmd(act.setBackgroundColor, this.arrayID[lastIndex], '#2ECC71');

		return this.commands;
	}

	compare(i, j) {
		this.highlight(5, 0, this.codeID);
		this.cmd(act.setText, this.comparisonCountID, 'Comparison Count: ' + ++this.compCount);
		this.cmd(act.step);
		this.unhighlight(5, 0, this.codeID);
		if (this.isMin) {
			return i < j;
		} else {
			return i > j;
		}
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
		this.highlight(9, 0, this.codeID);
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
		this.cmd(act.setText, this.swapCountID, 'Swap Count: ' + ++this.swapCount);
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
		this.unhighlight(9, 0, this.codeID);
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
