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

const CODE_START_X = 50;
const CODE_START_Y = 200;

let lastSwapEnabled = true;

export default class BubbleSort extends Algorithm {
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

		addDivisorToAlgorithmBar();

		// Last swap optimization toggle
		this.lastSwapCheckbox = addCheckboxToAlgorithmBar('Enable last swap optimization', true);
		this.lastSwapCheckbox.onclick = this.toggleLastSwap.bind(this);
		this.controls.push(this.lastSwapCheckbox);
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
			['procedure BubbleSort(array):'],
			['     end <- length of array'],
			['     start <- 0'],
			['     swapped <- start'],
			['     while start < end'],
			['          swapped <- start'],
			['          for j <- 0, end do'],
			['               if arr[j] > arr[j + 1]'],
			['                    swap arr[j], arr[j + 1]'],
			['                    swapped <- j'],
			['               end if'],
			['          end for'],
			['          end <- swapped'],
			['     end while'],
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
		this.codeID = this.addCodeToCanvasBase(this.code, CODE_START_X, CODE_START_Y);
		if (!lastSwapEnabled) {
			this.cmd(act.setText, this.codeID[3][0], '     sorted <- false');
			this.cmd(act.setText, this.codeID[4][0], '     while start < end and sorted is false');
			this.cmd(act.setText, this.codeID[5][0], '          sorted <- true');
			this.cmd(act.setText, this.codeID[9][0], '                    sorted <- false');
			this.cmd(act.setText, this.codeID[12][0], '          end <- end - 1');
		}
		this.compCount = 0;
	}

	sortCallback() {
		const list = this.listField.value.split(',').filter(x => x !== '');
		console.log(list);
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

	toggleLastSwap() {
		this.implementAction(this.clear.bind(this));
		if (lastSwapEnabled) {
			this.cmd(act.setText, this.codeID[3][0], '     sorted <- false');
			this.cmd(act.setText, this.codeID[4][0], '     while start < end and sorted is false');
			this.cmd(act.setText, this.codeID[5][0], '          sorted <- true');
			this.cmd(act.setText, this.codeID[9][0], '                    sorted <- false');
			this.cmd(act.setText, this.codeID[12][0], '          end <- end - 1');
		} else {
			this.cmd(act.setText, this.codeID[3][0], '     swapped <- start');
			this.cmd(act.setText, this.codeID[4][0], '     while start < end');
			this.cmd(act.setText, this.codeID[5][0], '          swapped <- start');
			this.cmd(act.setText, this.codeID[9][0], '                    swapped <- j');
			this.cmd(act.setText, this.codeID[12][0], '          end <- swapped');
		}
		lastSwapEnabled = !lastSwapEnabled;
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
		this.cmd(
			act.createHighlightCircle,
			this.iPointerID,
			'#0000FF',
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
		this.cmd(act.step);
		this.unhighlight(0, 0);

		let sorted = true;
		let end = this.arrayData.length - 1;
		let lastSwapped = 0;
		this.highlight(4, 0);
		this.cmd(act.step);
		do {
			this.unhighlight(4, 0);
			this.highlight(5, 0);
			this.cmd(act.step);
			this.unhighlight(5, 0);
			sorted = true;
			this.highlight(6, 0);
			for (let i = 0; i < end; i++) {
				this.movePointers(i, i + 1);
				this.highlight(7, 0);
				this.unhighlight(6, 0);
				this.cmd(act.step);
				this.cmd(
					act.setText,
					this.comparisonCountID,
					'Comparison Count: ' + ++this.compCount,
				);
				this.unhighlight(7, 0);
				if (this.arrayData[i] > this.arrayData[i + 1]) {
					this.swap(i, i + 1);
					sorted = false;
					lastSwapped = i;
				}
			}
			this.unhighlight(6, 0);
			this.highlight(12, 0);
			if (lastSwapEnabled) {
				end = lastSwapped;
			} else {
				end--;
			}
			if (!sorted) {
				for (let i = end + 1; i < this.arrayData.length; i++) {
					this.cmd(act.setBackgroundColor, this.arrayID[i], '#2ECC71');
				}
			}
			this.cmd(act.step);
			this.unhighlight(12, 0);
		} while (!sorted);
		this.highlight(4, 0);

		this.cmd(act.delete, this.iPointerID);
		this.cmd(act.delete, this.jPointerID);
		this.cmd(act.step);
		this.unhighlight(4, 0);

		for (let i = 0; i < this.arrayData.length; i++) {
			this.cmd(act.setBackgroundColor, this.arrayID[i], '#2ECC71');
		}
		this.cmd(act.step);

		return this.commands;
	}

	movePointers(i, j) {
		const iXPos = i * ARRAY_ELEM_WIDTH + ARRAY_START_X;
		this.cmd(act.move, this.iPointerID, iXPos, ARRAY_START_Y);
		const jXPos = j * ARRAY_ELEM_WIDTH + ARRAY_START_X;
		this.cmd(act.move, this.jPointerID, jXPos, ARRAY_START_Y);
		this.cmd(act.step);
	}

	swap(i, j) {
		this.highlight(8, 0);
		this.highlight(9, 0);
		// Change pointer colors to red
		this.cmd(act.setForegroundColor, this.iPointerID, '#FF0000');
		this.cmd(act.setForegroundColor, this.jPointerID, '#FF0000');
		// Create temporary labels and remove text in array
		const iLabelID = this.nextIndex++;
		const iXPos = i * ARRAY_ELEM_WIDTH + ARRAY_START_X;
		this.cmd(act.createLabel, iLabelID, this.displayData[i], iXPos, ARRAY_START_Y);
		const jLabelID = this.nextIndex++;
		const jXPos = j * ARRAY_ELEM_WIDTH + ARRAY_START_X;
		this.cmd(act.createLabel, jLabelID, this.displayData[j], jXPos, ARRAY_START_Y);
		this.cmd(act.setText, this.arrayID[i], '');
		this.cmd(act.setText, this.arrayID[j], '');
		// Move labels
		this.cmd(act.move, iLabelID, jXPos, ARRAY_START_Y);
		this.cmd(act.move, jLabelID, iXPos, ARRAY_START_Y);
		this.cmd(act.step);
		// Set text in array and delete temporary labels
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
		// Reset pointer colors back to blue
		this.cmd(act.setForegroundColor, this.iPointerID, '#0000FF');
		this.cmd(act.setForegroundColor, this.jPointerID, '#0000FF');
		this.unhighlight(8, 0);
		this.unhighlight(9, 0);
		this.cmd(act.step);
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
