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
const ARRAY_START_Y = 120;
const ARRAY_ELEM_WIDTH = 50;
const ARRAY_ELEM_HEIGHT = 50;

const COMP_COUNT_X = 100;
const COMP_COUNT_Y = 50;

const CODE_START_X = 50;
const CODE_START_Y = 180;

export default class QuickSort extends Algorithm {
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

		// Toggles
		const pivotButtonList = addRadioButtonGroupToAlgorithmBar(
			['Random pivot', 'Min element', 'First element', 'Perfect pivot'],
			'Traversals',
		);

		this.randomPivotSelect = pivotButtonList[0];
		this.minPivotSelect = pivotButtonList[1];
		this.firstPivotSelect = pivotButtonList[2];
		this.perfectPivotSelect = pivotButtonList[3];
		this.randomPivotSelect.onclick = () => (this.pivotType = 'random');
		this.minPivotSelect.onclick = () => (this.pivotType = 'min');
		this.firstPivotSelect.onclick = () => (this.pivotType = 'first');
		this.perfectPivotSelect.onclick = () => (this.pivotType = 'perfect');
		this.randomPivotSelect.checked = true;
		this.pivotType = 'random';

		this.controls.push(this.randomPivotSelect);
		this.controls.push(this.perfectPivotSelect);
		this.controls.push(this.firstPivotSelect);
		this.controls.push(this.minPivotSelect);

		addDivisorToAlgorithmBar();
	}

	setup() {
		this.commands = [];
		this.arrayData = [];
		this.displayData = [];
		this.arrayID = [];
		this.iPointerID = 0;
		this.jPointerID = 0;
		this.pPointerID = 0;
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
			['procedure QuickSort(array, left, right):'],
			['     pivotIdx <- random index within region being sorted'],
			['     pivot <- array[pivotIdx]'],
			['     swap array[left] and array[pivotIdx]'],
			['     i <- left + 1, j <- right - 1'],
			['     while i <= j do'],
			['          while ', 'i <= j', ' and ', 'array[i] <= pivot'],
			['               i <- i + 1'],
			['          end while'],
			['          while ', 'i <= j', ' and ', 'array[j] >= pivot'],
			['               j <- j - 1'],
			['          end while'],
			['          if i <= j then'],
			['               swap array[i] and array[j]'],
			['               i <- i + 1, j <- j - 1'],
			['          end if'],
			['     end while'],
			['     swap pivot and array[j]'],
			['     QuickSort on array, left, j'],
			['     QuickSort on array, j + 1, right'],
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
		this.displayData = [];
		this.arrayID = [];
		this.removeCode(this.codeID);
		this.iPointerID = 0;
		this.jPointerID = 0;
		this.pPointerID = 0;
		this.comparisonCountID = this.nextIndex++;
		this.compCount = 0;
		this.codeID = this.addCodeToCanvasBase(this.code, CODE_START_X, CODE_START_Y);
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
		this.compCount = 0;
		this.cmd(act.setText, this.comparisonCountID, 'Comparison Count: ' + this.compCount);
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

		const elemCounts = new Map();
		const letterMap = new Map();

		for (let i = 0; i < this.arrayData.length; i++) {
			const count = elemCounts.has(this.arrayData[i]) ? elemCounts.get(this.arrayData[i]) : 0;
			if (count > 0) {
				letterMap.set(this.arrayData[i], 'a');
			}
			elemCounts.set(this.arrayData[i], count + 1);
		}

		for (let i = 0; i < this.arrayData.length; i++) {
			this.arrayData[i] = parseInt(this.arrayData[i]);
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

		this.iPointerID = this.nextIndex++;
		this.jPointerID = this.nextIndex++;
		this.pPointerID = this.nextIndex++;
		this.helper(0, this.arrayData.length - 1);

		return this.commands;
	}

	helper(left, right) {
		if (left > right) return;

		this.highlight(0, 0);

		// Hightlight cells in the current sub-array
		for (let i = left; i <= right; i++) {
			this.cmd(act.setBackgroundColor, this.arrayID[i], '#99CCFF');
		}
		this.cmd(act.step);
		this.unhighlight(0, 0);

		if (left === right) {
			this.cmd(act.setBackgroundColor, this.arrayID[left], '#2ECC71');
			this.cmd(act.step);
			this.unhighlight(0, 0);
			return;
		}

		// Create pivot pointer and swap with left-most element
		// To make things more interesting (and clearer), we don't pick the left-most element as pivot
		let pivot;
		this.highlight(1, 0);
		this.highlight(2, 0);
		if (this.pivotType === 'min') {
			let min = left;
			for (let i = left + 1; i <= right; i++) {
				if (this.arrayData[i] < this.arrayData[min]) {
					min = i;
				}
			}
			pivot = min;
		} else if (this.pivotType === 'first') {
			pivot = left;
		} else if (this.pivotType === 'perfect') {
			const sorted = this.arrayData.slice(left, right + 1);
			sorted.sort((a, b) => a - b);
			const midIndex = Math.floor(sorted.length / 2);
			pivot = this.arrayData.indexOf(sorted[midIndex]);
		} else if (this.pivotType === 'random') {
			pivot = Math.floor(Math.random() * (right - left)) + left + 1;
		}
		const pXPos = pivot * ARRAY_ELEM_WIDTH + ARRAY_START_X;
		this.cmd(act.createHighlightCircle, this.pPointerID, '#FFFF00', pXPos, ARRAY_START_Y);
		this.cmd(act.step);
		this.unhighlight(1, 0);
		this.unhighlight(2, 0);
		this.highlight(3, 0);
		this.swapPivot(pivot, left);
		this.cmd(act.step);
		this.unhighlight(3, 0);
		this.highlight(4, 0);
		// Partition
		let i = left + 1;
		let j = right;
		const iXPos = i * ARRAY_ELEM_WIDTH + ARRAY_START_X;
		const jXPos = j * ARRAY_ELEM_WIDTH + ARRAY_START_X;
		this.cmd(act.createHighlightCircle, this.iPointerID, '#0000FF', iXPos, ARRAY_START_Y);
		this.cmd(act.createHighlightCircle, this.jPointerID, '#0000FF', jXPos, ARRAY_START_Y);
		this.cmd(act.step);
		this.unhighlight(4, 0);
		this.highlight(5, 0);
		while (i <= j) {
			this.cmd(act.step);
			this.highlight(6, 0);
			this.unhighlight(5, 0);
			this.highlight(6, 1);
			this.cmd(act.step);
			this.unhighlight(6, 0);
			this.unhighlight(6, 1);
			this.highlight(6, 3);
			this.cmd(act.step);
			while (i <= j && this.arrayData[left] >= this.arrayData[i]) {
				this.unhighlight(6, 3);
				this.highlight(7, 0);
				i++;
				this.cmd(
					act.setText,
					this.comparisonCountID,
					'Comparison Count: ' + ++this.compCount,
				);
				this.movePointers(i, j);
				this.unhighlight(7, 0);
				this.highlight(6, 1);
				if (i <= j) {
					this.cmd(act.step);
					this.unhighlight(6, 1);
					this.highlight(6, 3);
				}
				this.cmd(act.step);
			}
			this.unhighlight(6, 1);
			this.unhighlight(6, 3);
			if (i <= j) {
				this.cmd(act.setForegroundColor, this.iPointerID, '#FF0000');
				// One additional comparison will be made in the above loop if i <= j
				this.cmd(
					act.setText,
					this.comparisonCountID,
					'Comparison Count: ' + ++this.compCount,
				);
			}

			this.highlight(9, 0);
			this.cmd(act.step);
			this.unhighlight(9, 0);
			this.highlight(9, 1);
			if (i <= j) {
				this.cmd(act.step);
				this.unhighlight(9, 1);
				this.highlight(9, 3);
			}

			this.cmd(act.step);
			while (i <= j && this.arrayData[left] <= this.arrayData[j]) {
				this.unhighlight(9, 3);
				this.highlight(10, 0);
				j--;
				this.cmd(
					act.setText,
					this.comparisonCountID,
					'Comparison Count: ' + ++this.compCount,
				);
				this.movePointers(i, j);
				this.unhighlight(10, 0);
				this.highlight(9, 1);
				if (i <= j) {
					this.cmd(act.step);
					this.unhighlight(9, 1);
					this.highlight(9, 3);
				}
				this.cmd(act.step);
			}
			this.unhighlight(9, 1);
			this.unhighlight(9, 3);
			if (i <= j) {
				this.cmd(act.setForegroundColor, this.jPointerID, '#FF0000');
				this.cmd(
					act.setText,
					this.comparisonCountID,
					'Comparison Count: ' + ++this.compCount,
				);
				this.cmd(act.step);
			}
			if (i <= j) {
				this.highlight(13, 0);
				this.swap(i, j);
				this.unhighlight(13, 0);
				this.highlight(14, 0);
				i++;
				j--;
				this.movePointers(i, j);
				this.unhighlight(14, 0);
			}
		}

		this.highlight(17, 0);
		// Move pivot back and delete pivot pointer
		this.swapPivot(left, j, true);
		this.unhighlight(17, 0);

		// Delete i and j pointers
		this.cmd(act.delete, this.iPointerID);
		this.cmd(act.delete, this.jPointerID);
		this.cmd(act.delete, this.pPointerID);
		this.cmd(act.step);

		// Un-hightlight cells in sub-array and set pivot cell to green
		for (let i = left; i <= right; i++) {
			this.cmd(act.setBackgroundColor, this.arrayID[i], '#FFFFFF');
		}
		this.cmd(act.setBackgroundColor, this.arrayID[j], '#2ECC71');
		this.cmd(act.step);

		this.highlight(18, 0);
		this.cmd(act.step);
		this.unhighlight(18, 0);

		this.helper(left, j - 1);

		this.highlight(19, 0);
		this.cmd(act.step);
		this.unhighlight(19, 0);

		this.helper(j + 1, right);
	}

	movePointers(i, j) {
		const iXPos = i * ARRAY_ELEM_WIDTH + ARRAY_START_X;
		this.cmd(act.move, this.iPointerID, iXPos, ARRAY_START_Y);
		const jXPos = j * ARRAY_ELEM_WIDTH + ARRAY_START_X;
		this.cmd(act.move, this.jPointerID, jXPos, ARRAY_START_Y);
		this.cmd(act.step);
	}

	swapPivot(pivot, other, moveJ) {
		if (pivot === other) return;
		// Create temporary labels and remove text in array
		const lLabelID = this.nextIndex++;
		const lXPos = other * ARRAY_ELEM_WIDTH + ARRAY_START_X;
		this.cmd(act.createLabel, lLabelID, this.displayData[other], lXPos, ARRAY_START_Y);
		const pLabelID = this.nextIndex++;
		const pXPos = pivot * ARRAY_ELEM_WIDTH + ARRAY_START_X;
		this.cmd(act.createLabel, pLabelID, this.displayData[pivot], pXPos, ARRAY_START_Y);
		this.cmd(act.setText, this.arrayID[other], '');
		this.cmd(act.setText, this.arrayID[pivot], '');
		// Move labels and pivot pointer
		this.cmd(act.move, pLabelID, lXPos, ARRAY_START_Y);
		this.cmd(act.move, this.pPointerID, lXPos, ARRAY_START_Y);
		this.cmd(act.move, lLabelID, pXPos, ARRAY_START_Y);
		moveJ && this.cmd(act.move, this.jPointerID, pXPos, ARRAY_START_Y);
		this.cmd(act.step);
		// Set text in array, and delete temporary labels and pointer
		this.cmd(act.setText, this.arrayID[other], this.displayData[pivot]);
		this.cmd(act.setText, this.arrayID[pivot], this.displayData[other]);
		this.cmd(act.delete, pLabelID);
		this.cmd(act.delete, lLabelID);
		// Swap data in backend array
		let temp = this.arrayData[pivot];
		this.arrayData[pivot] = this.arrayData[other];
		this.arrayData[other] = temp;
		//Swap data in backend display data
		temp = this.displayData[pivot];
		this.displayData[pivot] = this.displayData[other];
		this.displayData[other] = temp;
	}

	swap(i, j) {
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
		//Swap data in backend display data
		temp = this.displayData[i];
		this.displayData[i] = this.displayData[j];
		this.displayData[j] = temp;
		// Reset pointer colors back to blue
		this.cmd(act.setForegroundColor, this.iPointerID, '#0000FF');
		this.cmd(act.setForegroundColor, this.jPointerID, '#0000FF');
		this.cmd(act.step);
	}

	// toggleWorstPivot() {
	// 	worstPivotEnabled = !worstPivotEnabled;
	// 	if (firstPivotEnabled) {
	// 		firstPivotEnabled = false;
	// 		this.firstPivotToggle.checked = false;
	// 	}
	// }

	// toggleFirstPivot() {
	// 	firstPivotEnabled = !firstPivotEnabled;
	// 	if (worstPivotEnabled) {
	// 		worstPivotEnabled = false;
	// 		this.worstPivotToggle.checked = false;
	// 	}
	// }

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
