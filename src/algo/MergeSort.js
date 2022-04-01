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

const MAX_ARRAY_SIZE = 15;

const ARRAY_START_X = 450;
const ARRAY_START_Y = 50;
const ARRAY_LINE_SPACING = 75;
const ARRAY_ELEM_WIDTH = 50;
const ARRAY_ELEM_HEIGHT = 50;

const COMP_COUNT_X = 100;
const COMP_COUNT_Y = 50;

const CODE_START_X = 50;
const CODE_START_Y = 80;

// const ARRRAY_ELEMS_PER_LINE = 15;

// const TOP_POS_X = 180;
// const TOP_POS_Y = 100;
// const TOP_LABEL_X = 130;
// const TOP_LABEL_Y = 100;

// const PUSH_LABEL_X = 50;
// const PUSH_LABEL_Y = 30;
// const PUSH_ELEMENT_X = 120;
// const PUSH_ELEMENT_Y = 30;

// const SIZE = 10;

const LARGE_OFFSET = 15;
const SMALL_OFFSET = 7;

export default class MergeSort extends Algorithm {
	constructor(am, w, h) {
		super(am, w, h);

		this.addControls();

		// Useful for memory management
		this.nextIndex = 0;

		// TODO:  Add any code necessary to set up your own algorithm.  Initialize data
		// structures, etc.
		this.setup();
	}

	addControls() {
		this.controls = [];

		const verticalGroup = addGroupToAlgorithmBar(false);

		addLabelToAlgorithmBar(
			'Comma seperated list (e.g. "3,1,2"). Max 15 elements & no elements > 999',
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
		this.iPointerID = 0;
		this.jPointerID = 0;
		this.kPointerID = 0;
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
			['procedure MergeSort(array)'],
			['     length <- length of array, midIdx <- length / 2'],
			['     leftArray <- array[0...midIdx - 1]'],
			['     rightArray <- array[midIdx...length - 1]'],
			['     MergeSort(leftArray)'],
			['     MergeSort(rightArray)'],
			['     leftIdx, rightIdx, currIdx <- 0'],
			['     while leftIdx < midIdx and rightIdx < length - midIdx do'],
			['          if leftArray[leftIdx] <= rightArray[rightIdx] then'],
			['               array[currIdx] <- leftArray[leftIdx]'],
			['               leftIdx <- leftIdx + 1'],
			['          else'],
			['               array[currIdx] <- rightArray[rightIdx]'],
			['               rightIdx <- rightIdx + 1'],
			['          end if'],
			['          currIdx <- currIdx + 1'],
			['     end while'],
			['     while leftIdx < midIdx do'],
			['          array[currIdx] <- leftArray[leftIdx]'],
			['          currIdx <- currIdx + 1'],
			['          leftIdx <- leftIdx + 1'],
			['     end while'],
			['     while rightIdx < length - midIdx do'],
			['          array[currIdx] <- rightArray[rightIdx]'],
			['          currIdx <- currIdx + 1'],
			['          rightIdx <- rightIdx + 1'],
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
		this.iPointerID = 0;
		this.jPointerID = 0;
		this.kPointerID = 0;
		this.comparisonCountID = this.nextIndex++;
		this.compCount = 0;
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
		this.displayData = [];
		this.arrayID = [];
		this.compCount = 0;
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
			const xPos = i * ARRAY_ELEM_WIDTH + ARRAY_START_X;
			const yPos = ARRAY_START_Y;
			this.arrayID.push(this.nextIndex);

			let displayData = this.arrayData[i].toString();
			if (letterMap.has(this.arrayData[i])) {
				const currChar = letterMap.get(this.arrayData[i]);
				displayData += currChar;
				letterMap.set(this.arrayData[i], String.fromCharCode(currChar.charCodeAt(0) + 1));
			}
			this.displayData[i] = displayData;
			this.cmd(
				act.createRectangle,
				this.nextIndex++,
				displayData,
				ARRAY_ELEM_WIDTH,
				ARRAY_ELEM_HEIGHT,
				xPos,
				yPos,
			);
		}
		this.cmd(act.step);
		this.unhighlight(0, 0);

		if (this.arrayData.length !== 1) {
			this.highlight(2, 0);
			this.highlight(3, 0);
			this.cmd(act.step);
			this.unhighlight(2, 0);
			this.unhighlight(3, 0);
			const mid = Math.ceil((this.arrayData.length - 1) / 2);
			this.highlight(4, 0);
			this.leftHelper(0, mid - 1, -LARGE_OFFSET, 0, 1);
			this.unhighlight(4, 0);
			this.highlight(5, 0);
			this.rightHelper(mid, this.arrayData.length - 1, LARGE_OFFSET, 0, 1);
			this.unhighlight(5, 0);
			this.merge(
				0,
				this.arrayData.length - 1,
				mid,
				0,
				0,
				-LARGE_OFFSET,
				LARGE_OFFSET,
				this.arrayID,
			);
		} else {
			this.cmd(act.setBackgroundColor, this.arrayID[0], '#2ECC71');
			this.cmd(act.step);
		}

		return this.commands;
	}

	leftHelper(left, right, offset, prevOffset, row) {
		this.cmd(act.step);
		if (left > right) return;
		this.unhighlight(4, 0);
		this.unhighlight(5, 0);
		this.highlight(0, 0);

		const tempArrayID = this.drawArrayAndCopy(left, right, offset, prevOffset, row);
		this.unhighlight(0, 0);

		if (left !== right) {
			this.highlight(2, 0);
			this.highlight(3, 0);
			this.cmd(act.step);
			this.unhighlight(2, 0);
			this.unhighlight(3, 0);
			const mid = Math.ceil((left + right) / 2);
			const extraOffset = row < 2 ? 2 * LARGE_OFFSET : 2 * SMALL_OFFSET;
			this.highlight(4, 0);
			this.leftHelper(left, mid - 1, offset - extraOffset, offset, row + 1);
			this.unhighlight(4, 0);
			this.highlight(5, 0);
			this.leftHelper(mid, right, offset, offset, row + 1);
			this.unhighlight(5, 0);
			this.merge(left, right, mid, row, offset, offset - extraOffset, offset, tempArrayID);
		} else {
			this.cmd(act.setBackgroundColor, tempArrayID[left], '#2ECC71');
			this.cmd(act.step);
		}
	}

	rightHelper(left, right, offset, prevOffset, row) {
		this.cmd(act.step);
		if (left > right) return;
		this.unhighlight(4, 0);
		this.unhighlight(5, 0);
		this.highlight(0, 0);

		const tempArrayID = this.drawArrayAndCopy(left, right, offset, prevOffset, row);
		this.unhighlight(0, 0);

		if (left !== right) {
			this.highlight(2, 0);
			this.highlight(3, 0);
			this.cmd(act.step);
			this.unhighlight(2, 0);
			this.unhighlight(3, 0);
			const mid = Math.ceil((left + right) / 2);
			const extraOffset = row < 2 ? 2 * LARGE_OFFSET : 2 * SMALL_OFFSET;
			this.highlight(4, 0);
			this.rightHelper(left, mid - 1, offset, offset, row + 1);
			this.unhighlight(4, 0);
			this.highlight(5, 0);
			this.rightHelper(mid, right, offset + extraOffset, offset, row + 1);
			this.unhighlight(5, 0);
			this.merge(left, right, mid, row, offset, offset, offset + extraOffset, tempArrayID);
		} else {
			this.cmd(act.setBackgroundColor, tempArrayID[left], '#2ECC71');
			this.cmd(act.step);
		}
	}

	drawArrayAndCopy(left, right, offset, prevOffset, row) {
		const tempArrayID = [];

		// Display subarray
		for (let i = left; i <= right; i++) {
			const xPos = i * ARRAY_ELEM_WIDTH + ARRAY_START_X + offset;
			const yPos = ARRAY_START_Y + row * ARRAY_LINE_SPACING;
			tempArrayID[i] = this.nextIndex;
			this.arrayID.push(this.nextIndex);
			this.cmd(
				act.createRectangle,
				this.nextIndex++,
				'',
				ARRAY_ELEM_WIDTH,
				ARRAY_ELEM_HEIGHT,
				xPos,
				yPos,
			);
		}
		this.cmd(act.step);

		// Copy elements from big array to current subarray
		for (let i = left; i <= right; i++) {
			this.copyData(
				i,
				i,
				prevOffset,
				offset,
				row - 1,
				row,
				this.displayData[i],
				tempArrayID[i],
				-1,
			);
		}

		return tempArrayID;
	}

	merge(left, right, mid, row, currOffset, leftOffset, rightOffset, currArrayID) {
		const tempArray = new Array(this.arrayData.length); // Temporary array to store data for sorting
		const tempDisplay = new Array(this.arrayData.length);

		// Copy data to temporary array
		for (let i = left; i <= right; i++) {
			tempArray[i] = this.arrayData[i];
			tempDisplay[i] = this.displayData[i];
		}

		this.highlight(6, 0);

		// Create pointers
		const bottomYPos = ARRAY_START_Y + (row + 1) * ARRAY_LINE_SPACING;
		const iPointerID = this.nextIndex++;
		const iXPos = left * ARRAY_ELEM_WIDTH + ARRAY_START_X + leftOffset;
		this.cmd(act.createHighlightCircle, iPointerID, '#0000FF', iXPos, bottomYPos);
		const jPointerID = this.nextIndex++;
		const jXPos = mid * ARRAY_ELEM_WIDTH + ARRAY_START_X + rightOffset;
		this.cmd(act.createHighlightCircle, jPointerID, '#0000FF', jXPos, bottomYPos);
		const kPointerID = this.nextIndex++;
		const kXPos = left * ARRAY_ELEM_WIDTH + ARRAY_START_X + currOffset;
		const topYPos = ARRAY_START_Y + row * ARRAY_LINE_SPACING;
		this.cmd(act.createHighlightCircle, kPointerID, '#0000FF', kXPos, topYPos);
		this.cmd(act.step);

		this.unhighlight(6, 0);
		this.highlight(7, 0);
		this.cmd(act.step);
		this.unhighlight(7, 0);
		// Merge data and animate
		let i = left;
		let j = mid;
		let k = left;
		while (i < mid && j <= right) {
			this.cmd(act.setText, this.comparisonCountID, 'Comparison Count: ' + ++this.compCount);
			this.highlight(8, 0);
			this.cmd(act.step);
			this.unhighlight(8, 0);
			if (tempArray[i] <= tempArray[j]) {
				this.highlight(9, 0);
				this.copyData(
					i,
					k,
					leftOffset,
					currOffset,
					row + 1,
					row,
					tempDisplay[i],
					currArrayID[k],
					iPointerID,
				);
				this.unhighlight(9, 0);
				this.arrayData[k] = tempArray[i];
				this.displayData[k] = tempDisplay[i];
				i++;
				this.highlight(10, 0);
				if (i < mid) {
					this.movePointer(i, row + 1, leftOffset, iPointerID);
				}
				this.cmd(act.step);
				this.unhighlight(10, 0);
			} else {
				this.highlight(11, 0);
				this.cmd(act.step);
				this.unhighlight(11, 0);
				this.highlight(12, 0);
				this.copyData(
					j,
					k,
					rightOffset,
					currOffset,
					row + 1,
					row,
					tempDisplay[j],
					currArrayID[k],
					jPointerID,
				);
				this.unhighlight(12, 0);
				this.arrayData[k] = tempArray[j];
				this.displayData[k] = tempDisplay[j];
				j++;
				this.highlight(13, 0);
				if (j <= right) {
					this.movePointer(j, row + 1, rightOffset, jPointerID);
				}
				this.cmd(act.step);

				this.unhighlight(13, 0);
			}
			k++;
			this.highlight(15, 0);
			this.movePointer(k, row, currOffset, kPointerID);
			this.cmd(act.step);
			this.unhighlight(15, 0);
		}
		this.highlight(17, 0);
		this.cmd(act.step);
		this.unhighlight(17, 0);
		while (i < mid) {
			this.highlight(18, 0);
			this.copyData(
				i,
				k,
				leftOffset,
				currOffset,
				row + 1,
				row,
				tempDisplay[i],
				currArrayID[k],
				iPointerID,
			);
			this.unhighlight(18, 0);
			this.highlight(19, 0);
			this.highlight(20, 0);
			this.arrayData[k] = tempArray[i];
			this.displayData[k] = tempDisplay[i];
			k++;
			i++;
			if (k <= right) {
				this.movePointer(i, row + 1, leftOffset, iPointerID);
				this.movePointer(k, row, currOffset, kPointerID);
			}
			this.cmd(act.step);
			this.unhighlight(19, 0);
			this.unhighlight(20, 0);
		}
		this.highlight(22, 0);
		this.cmd(act.step);
		this.unhighlight(22, 0);
		while (j <= right) {
			this.highlight(23, 0);
			this.copyData(
				j,
				k,
				rightOffset,
				currOffset,
				row + 1,
				row,
				tempDisplay[j],
				currArrayID[k],
				jPointerID,
			);
			this.unhighlight(23, 0);
			this.highlight(24, 0);
			this.highlight(25, 0);
			this.arrayData[k] = tempArray[j];
			this.displayData[k] = tempDisplay[j];
			j++;
			k++;
			if (k <= right) {
				this.movePointer(j, row + 1, rightOffset, jPointerID);
				this.movePointer(k, row, currOffset, kPointerID);
			}
			this.cmd(act.step);

			this.unhighlight(24, 0);
			this.unhighlight(25, 0);
		}

		// Delete pointers
		this.cmd(act.delete, iPointerID);
		this.cmd(act.delete, jPointerID);
		this.cmd(act.delete, kPointerID);
		this.cmd(act.step);
	}

	copyData(fromIndex, toIndex, fromOffset, toOffset, fromRow, toRow, value, cellID, pointerID) {
		if (pointerID !== -1) {
			this.cmd(act.setForegroundColor, pointerID, '#FF0000');
			this.cmd(act.step);
		}
		const fromXPos = fromIndex * ARRAY_ELEM_WIDTH + ARRAY_START_X + fromOffset;
		const fromYPos = ARRAY_START_Y + fromRow * ARRAY_LINE_SPACING;
		const labelID = this.nextIndex++;
		this.cmd(act.createLabel, labelID, value, fromXPos, fromYPos);
		const toXPos = toIndex * ARRAY_ELEM_WIDTH + ARRAY_START_X + toOffset;
		const toYPos = ARRAY_START_Y + toRow * ARRAY_LINE_SPACING;
		this.cmd(act.move, labelID, toXPos, toYPos);
		this.cmd(act.step);
		this.cmd(act.setText, cellID, value);
		this.cmd(act.delete, labelID);
		if (pointerID !== -1) {
			this.cmd(act.setBackgroundColor, cellID, '#2ECC71');
			this.cmd(act.setForegroundColor, pointerID, '#0000FF');
			this.cmd(act.step);
		}
	}

	movePointer(index, row, offset, pointerID) {
		const xPos = index * ARRAY_ELEM_WIDTH + ARRAY_START_X + offset;
		const yPos = ARRAY_START_Y + row * ARRAY_LINE_SPACING;
		this.cmd(act.move, pointerID, xPos, yPos);
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
