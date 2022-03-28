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
	addRadioButtonGroupToAlgorithmBar,
} from './Algorithm.js';
import { act } from '../anim/AnimationMain';

const MAX_ARRAY_SIZE = 18;

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

		// Clear button
		this.clearButton = addControlToAlgorithmBar('Button', 'Clear');
		this.clearButton.onclick = this.clearCallback.bind(this);
		this.controls.push(this.clearButton);

		//Min & Max selection button
		addDivisorToAlgorithmBar();

		const minMaxButtonList = addRadioButtonGroupToAlgorithmBar(['Min', 'Max'], 'Min/Max');

		this.minButton = minMaxButtonList[0];
		this.minButton.onclick = this.minCallback.bind(this);
		this.controls.push(this.minButton);
		this.minButton.checked = true;
		this.maxButton = minMaxButtonList[1];
		this.maxButton.onclick = this.maxCallback.bind(this);
		this.controls.push(this.maxButton);
		this.isMin = true;
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

		this.code = [
			['procedure SelectionSort(array):'],
			['     length <- length of array'],
			['     for i <- 0, length do'],
			['          min <- i'],
			['          for j <- i + 1, length do'],
			['               if array[j] < array[min]'],
			['                    min <- j'],
			['               end if'],
			['          end for'],
			['          swap array[min], array[i]'],
			['     end for'],
			['end procedure'],
		];

		this.codeID = this.addCodeToCanvasBase(this.code, CODE_START_X, CODE_START_Y);

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
		this.compCount = 0;
		this.codeID = this.addCodeToCanvasBase(this.code, CODE_START_X, CODE_START_Y);
		if (!this.isMin) {
			this.cmd(act.setText, this.codeID[2][0], '     for i <- length - 1, 0 do');
			this.cmd(act.setText, this.codeID[3][0], '          max <- i');
			this.cmd(act.setText, this.codeID[4][0], '          for j <- i - 1, 0 do');
			this.cmd(act.setText, this.codeID[5][0], '               if array[j] > array[max]');
			this.cmd(act.setText, this.codeID[5][0], '                    max <- j');
			this.cmd(act.setText, this.codeID[9][0], '          swap array[max], array[i]');
		}
	}

	minCallback() {
		if (!this.isMin) {
			this.implementAction(this.clear.bind(this));
			this.cmd(act.setText, this.codeID[2][0], '     for i <- 0, length do');
			this.cmd(act.setText, this.codeID[3][0], '          min <- i');
			this.cmd(act.setText, this.codeID[4][0], '          for j <- i + 1, length do');
			this.cmd(act.setText, this.codeID[5][0], '               if array[j] < array[min]');
			this.cmd(act.setText, this.codeID[6][0], '                    min <- j');
			this.cmd(act.setText, this.codeID[9][0], '          swap array[min], array[i]');
			this.isMin = true;
		}
	}

	maxCallback() {
		if (this.isMin) {
			this.implementAction(this.clear.bind(this));
			this.cmd(act.setText, this.codeID[2][0], '     for i <- length - 1, 0 do');
			this.cmd(act.setText, this.codeID[3][0], '          max <- i');
			this.cmd(act.setText, this.codeID[4][0], '          for j <- i - 1, 0 do');
			this.cmd(act.setText, this.codeID[5][0], '               if array[j] > array[max]');
			this.cmd(act.setText, this.codeID[6][0], '                    max <- j');
			this.cmd(act.setText, this.codeID[9][0], '          swap array[max], array[i]');
			this.isMin = false;
		}
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
		this.compCount = 0;
		this.displayData = [];
		this.cmd(act.setText, this.comparisonCountID, 'Comparison Count: ' + this.compCount);
		return this.commands;
	}

	sort(params) {
		this.commands = [];
		this.highlight(0, 0);

		this.arrayID = [];
		this.arrayData = params
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
		this.unhighlight(0, 0);
		this.cmd(act.setHighlight, this.jPointerID, 1);
		this.highlight(2, 0);
		this.cmd(act.step);
		this.unhighlight(2, 0);
		for (let i = 0; i < this.arrayData.length - 1; i++) {
			this.highlight(3, 0);
			let k = i;
			if (!this.isMin) {
				k = this.arrayData.length - 1 - i;
			}

			let toSwap = k;
			this.cmd(act.setBackgroundColor, this.arrayID[toSwap], '#FFFF00');
			this.cmd(act.step);
			this.unhighlight(3, 0);
			this.highlight(4, 0);
			this.cmd(act.step);
			for (let j = i + 1; j < this.arrayData.length; j++) {
				this.unhighlight(4, 0);
				let w = j;
				if (!this.isMin) {
					w = this.arrayData.length - 1 - j;
				}

				this.movePointers(toSwap, w);
				if (this.compare(this.arrayData[w], this.arrayData[toSwap])) {
					this.cmd(act.setBackgroundColor, this.arrayID[toSwap], '#FFFFFF');
					this.highlight(6, 0);
					this.cmd(act.step);
					toSwap = w;
					this.movePointers(toSwap, w);
					this.cmd(act.setBackgroundColor, this.arrayID[toSwap], '#FFFF00');
					this.cmd(act.step);
					this.unhighlight(6, 0);
				}
			}
			this.swap(k, toSwap);
			this.cmd(act.setBackgroundColor, this.arrayID[toSwap], '#FFFFFF');
			this.cmd(act.step);
			this.cmd(act.setBackgroundColor, this.arrayID[k], '#2ECC71');
			this.cmd(act.step);
		}

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
		this.highlight(5, 0);
		this.cmd(act.setText, this.comparisonCountID, 'Comparison Count: ' + ++this.compCount);
		this.cmd(act.step);
		this.unhighlight(5, 0);
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
		this.highlight(9, 0);
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
		this.unhighlight(9, 0);
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
