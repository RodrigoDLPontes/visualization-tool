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

import Algorithm, {
	addControlToAlgorithmBar,
	addDivisorToAlgorithmBar,
	addGroupToAlgorithmBar,
	addLabelToAlgorithmBar,
	addRadioButtonGroupToAlgorithmBar,
} from './Algorithm.js';
import { act } from '../anim/AnimationMain';

const ARRAY_SIZE = 32;
const ARRAY_ELEM_WIDTH = 30;
const ARRAY_ELEM_HEIGHT = 25;
const ARRAY_INITIAL_X = 30;

const ARRAY_Y_POS = 50;
const ARRAY_LABEL_Y_POS = 75;

const HEAP_X_POSITIONS = [
	0,
	450,
	250,
	650,
	150,
	350,
	550,
	750,
	100,
	200,
	300,
	400,
	500,
	600,
	700,
	800,
	75,
	125,
	175,
	225,
	275,
	325,
	375,
	425,
	475,
	525,
	575,
	625,
	675,
	725,
	775,
	825,
];

const HEAP_Y_POSITIONS = [
	0,
	110,
	180,
	180,
	250,
	250,
	250,
	250,
	320,
	320,
	320,
	320,
	320,
	320,
	320,
	320,
	390,
	390,
	390,
	390,
	390,
	390,
	390,
	390,
	390,
	390,
	390,
	390,
	390,
	390,
	390,
	390,
];

export default class Heap extends Algorithm {
	constructor(am) {
		super(am);

		this.addControls();
		this.nextIndex = 0;
		this.createArray();
	}

	addControls() {
		this.insertField = addControlToAlgorithmBar('Text', '');
		this.insertField.onkeydown = this.returnSubmit(
			this.insertField,
			this.insertCallback.bind(this),
			4,
			true
		);

		this.insertButton = addControlToAlgorithmBar('Button', 'Enqueue');
		this.insertButton.onclick = this.insertCallback.bind(this);

		addDivisorToAlgorithmBar();

		this.removeButton = addControlToAlgorithmBar('Button', 'Dequeue');
		this.removeButton.onclick = this.removeCallback.bind(this);

		addDivisorToAlgorithmBar();

		this.clearButton = addControlToAlgorithmBar('Button', 'Clear');
		this.clearButton.onclick = this.clearCallback.bind(this);

		addDivisorToAlgorithmBar();

		const verticalGroup = addGroupToAlgorithmBar(false);

		addLabelToAlgorithmBar(
			'Comma separated list (e.g. "3,1,2", max 31 elements)',
			verticalGroup
		);

		const horizontalGroup = addGroupToAlgorithmBar(true, verticalGroup);

		this.buildHeapField = addControlToAlgorithmBar('Text', '', horizontalGroup);
		this.buildHeapField.onkeydown = this.returnSubmit(
			this.buildHeapField,
			this.buildHeapCallback.bind(this),
			61,
			false
		);

		this.buildHeapButton = addControlToAlgorithmBar('Button', 'BuildHeap', horizontalGroup);
		this.buildHeapButton.onclick = this.buildHeapCallback.bind(this);

		addDivisorToAlgorithmBar();

		const minMaxButtonList = addRadioButtonGroupToAlgorithmBar(
			['MinHeap', 'MaxHeap'],
			'MinHeap/MaxHeap'
		);

		this.minHeapButton = minMaxButtonList[0];
		this.minHeapButton.onclick = this.minHeapCallback.bind(this);
		this.minHeapButton.checked = true;
		this.maxHeapButton = minMaxButtonList[1];
		this.maxHeapButton.onclick = this.maxHeapCallback.bind(this);
		this.isMinHeap = true;
	}

	createArray() {
		this.commands = [];

		this.arrayData = new Array(ARRAY_SIZE);
		this.arrayLabels = new Array(ARRAY_SIZE);
		this.arrayRects = new Array(ARRAY_SIZE);
		this.circleObjs = new Array(ARRAY_SIZE);
		this.arrayXPositions = new Array(ARRAY_SIZE);
		this.currentHeapSize = 0;

		for (let i = 0; i < ARRAY_SIZE; i++) {
			this.arrayXPositions[i] = ARRAY_INITIAL_X + i * ARRAY_ELEM_WIDTH;
			this.arrayLabels[i] = this.nextIndex++;
			this.arrayRects[i] = this.nextIndex++;
			this.circleObjs[i] = this.nextIndex++;
			this.cmd(
				act.createRectangle,
				this.arrayRects[i],
				'',
				ARRAY_ELEM_WIDTH,
				ARRAY_ELEM_HEIGHT,
				this.arrayXPositions[i],
				ARRAY_Y_POS
			);
			this.cmd(
				act.createLabel,
				this.arrayLabels[i],
				i,
				this.arrayXPositions[i],
				ARRAY_LABEL_Y_POS
			);
			this.cmd(act.setForegroundColor, this.arrayLabels[i], '#0000FF');
		}
		this.cmd(act.setText, this.arrayRects[0], 'null');
		this.swapLabel1 = this.nextIndex++;
		this.swapLabel2 = this.nextIndex++;
		this.swapLabel3 = this.nextIndex++;
		this.swapLabel4 = this.nextIndex++;
		this.descriptLabel1 = this.nextIndex++;
		this.descriptLabel2 = this.nextIndex++;
		this.cmd(act.createLabel, this.descriptLabel1, '', 20, 10, 0);
		this.animationManager.startNewAnimation(this.commands);
		this.animationManager.skipForward();
		this.animationManager.clearHistory();
	}

	insertCallback() {
		const insertedValue = this.normalizeNumber(this.insertField.value, 4);
		if (insertedValue !== '') {
			this.insertField.value = '';
			this.implementAction(this.insertElement.bind(this), parseInt(insertedValue));
		}
	}

	removeCallback() {
		this.implementAction(this.remove.bind(this));
	}

	clearCallback() {
		this.implementAction(this.clear.bind(this));
	}

	buildHeapCallback() {
		if (this.buildHeapField.value !== '') {
			const list = this.buildHeapField.value;
			this.buildHeapField.value = '';
			this.implementAction(this.buildHeap.bind(this), list);
		}
	}

	minHeapCallback() {
		if (!this.isMinHeap) {
			this.implementAction(this.clear.bind(this));
			this.isMinHeap = true;
		}
	}

	maxHeapCallback() {
		if (this.isMinHeap) {
			this.implementAction(this.clear.bind(this));
			this.isMinHeap = false;
		}
	}

	clear() {
		this.commands = [];
		while (this.currentHeapSize > 0) {
			this.cmd(act.delete, this.circleObjs[this.currentHeapSize]);
			this.cmd(act.setText, this.arrayRects[this.currentHeapSize], '');
			this.currentHeapSize--;
		}
		return this.commands;
	}

	reset() {
		this.currentHeapSize = 0;
	}

	swap(index1, index2) {
		this.cmd(act.setText, this.arrayRects[index1], '');
		this.cmd(act.setText, this.arrayRects[index2], '');
		this.cmd(act.setText, this.circleObjs[index1], '');
		this.cmd(act.setText, this.circleObjs[index2], '');
		this.cmd(
			act.createLabel,
			this.swapLabel1,
			this.arrayData[index1],
			this.arrayXPositions[index1],
			ARRAY_Y_POS
		);
		this.cmd(
			act.createLabel,
			this.swapLabel2,
			this.arrayData[index2],
			this.arrayXPositions[index2],
			ARRAY_Y_POS
		);
		this.cmd(
			act.createLabel,
			this.swapLabel3,
			this.arrayData[index1],
			HEAP_X_POSITIONS[index1],
			HEAP_Y_POSITIONS[index1]
		);
		this.cmd(
			act.createLabel,
			this.swapLabel4,
			this.arrayData[index2],
			HEAP_X_POSITIONS[index2],
			HEAP_Y_POSITIONS[index2]
		);
		this.cmd(act.move, this.swapLabel1, this.arrayXPositions[index2], ARRAY_Y_POS);
		this.cmd(act.move, this.swapLabel2, this.arrayXPositions[index1], ARRAY_Y_POS);
		this.cmd(act.move, this.swapLabel3, HEAP_X_POSITIONS[index2], HEAP_Y_POSITIONS[index2]);
		this.cmd(act.move, this.swapLabel4, HEAP_X_POSITIONS[index1], HEAP_Y_POSITIONS[index1]);
		const tmp = this.arrayData[index1];
		this.arrayData[index1] = this.arrayData[index2];
		this.arrayData[index2] = tmp;
		this.cmd(act.step);
		this.cmd(act.setText, this.arrayRects[index1], this.arrayData[index1]);
		this.cmd(act.setText, this.arrayRects[index2], this.arrayData[index2]);
		this.cmd(act.setText, this.circleObjs[index1], this.arrayData[index1]);
		this.cmd(act.setText, this.circleObjs[index2], this.arrayData[index2]);
		this.cmd(act.delete, this.swapLabel1);
		this.cmd(act.delete, this.swapLabel2);
		this.cmd(act.delete, this.swapLabel3);
		this.cmd(act.delete, this.swapLabel4);
	}

	setIndexHighlight(index, highlightVal) {
		this.cmd(act.setHighlight, this.circleObjs[index], highlightVal);
		this.cmd(act.setHighlight, this.arrayRects[index], highlightVal);
	}

	pushDown(index) {
		let childIndex; // Used to keep track of smallest (in MinHeap) or largest (in MaxHeap) child

		while (index * 2 <= this.currentHeapSize) {
			childIndex = 2 * index;

			if (index * 2 + 1 <= this.currentHeapSize) {
				this.setIndexHighlight(2 * index, 1);
				this.setIndexHighlight(2 * index + 1, 1);
				this.cmd(act.step);
				this.setIndexHighlight(2 * index, 0);
				this.setIndexHighlight(2 * index + 1, 0);
				if (this.downheapCheckRightChild(index)) {
					childIndex = 2 * index + 1;
				}
			}
			this.setIndexHighlight(index, 1);
			this.setIndexHighlight(childIndex, 1);
			this.cmd(act.step);
			this.setIndexHighlight(index, 0);
			this.setIndexHighlight(childIndex, 0);

			if (this.downheapCompare(childIndex, index)) {
				this.swap(childIndex, index);
				index = childIndex;
			} else {
				return;
			}
		}
	}

	downheapCheckRightChild(index) {
		// Checks if the right child is smaller (in MinHeap) or greater (in MaxHeap) than left child
		if (this.isMinHeap) {
			if (this.arrayData[2 * index + 1] < this.arrayData[2 * index]) {
				return true;
			}
		} else {
			if (this.arrayData[2 * index + 1] > this.arrayData[2 * index]) {
				return true;
			}
		}
	}

	downheapCompare(childIndex, index) {
		// Checks if smallest child is smaller than parent (in MinHeap)
		// or greatest child is greater than parent (in MaxHeap)
		if (this.isMinHeap) {
			if (this.arrayData[childIndex] < this.arrayData[index]) {
				return true;
			}
		} else {
			if (this.arrayData[childIndex] > this.arrayData[index]) {
				return true;
			}
		}
	}

	remove() {
		this.commands = [];
		this.cmd(act.setText, this.descriptLabel1, '');

		if (this.currentHeapSize === 0) {
			this.cmd(act.setText, this.descriptLabel1, 'Heap is empty, cannot dequeue');
			return this.commands;
		}

		this.cmd(act.setText, this.descriptLabel1, 'Removing element:');
		this.cmd(
			act.createLabel,
			this.descriptLabel2,
			this.arrayData[1],
			HEAP_X_POSITIONS[1],
			HEAP_Y_POSITIONS[1],
			0
		);
		this.cmd(act.setText, this.circleObjs[1], '');
		this.cmd(act.move, this.descriptLabel2, 120, 40);
		this.cmd(act.step);
		this.cmd(act.delete, this.descriptLabel2);
		this.cmd(act.setText, this.descriptLabel1, 'Removing element: ' + this.arrayData[1]);
		this.arrayData[1] = '';
		if (this.currentHeapSize > 1) {
			this.cmd(act.setText, this.arrayRects[1], '');
			this.cmd(act.setText, this.arrayRects[this.currentHeapSize], '');
			this.swap(1, this.currentHeapSize);
			this.cmd(act.delete, this.circleObjs[this.currentHeapSize]);
			this.currentHeapSize--;
			this.pushDown(1);
		} else {
			this.cmd(act.setText, this.arrayRects[1], '');
			this.cmd(act.delete, this.circleObjs[this.currentHeapSize]);
			this.currentHeapSize--;
		}
		return this.commands;
	}

	buildHeap(params) {
		this.commands = [];
		this.arrayData = params
			.split(',') // Split on commas
			.map(Number) // Map to numbers (to remove invalid characters)
			.filter(x => !Number.isNaN(x)) // Remove stuff that was invalid
			.slice(0, 31); // Get first 31 numbers
		this.arrayData.unshift(0); // Add a 0 to start of array
		this.clear();
		for (let i = 1; i < this.arrayData.length; i++) {
			this.cmd(
				act.createCircle,
				this.circleObjs[i],
				this.arrayData[i],
				HEAP_X_POSITIONS[i],
				HEAP_Y_POSITIONS[i]
			);
			this.cmd(act.setText, this.arrayRects[i], this.arrayData[i]);
			if (i > 1) {
				this.cmd(act.connect, this.circleObjs[Math.floor(i / 2)], this.circleObjs[i]);
			}
		}
		this.cmd(act.step);
		this.currentHeapSize = this.arrayData.length - 1;
		let nextElem = this.currentHeapSize;
		while (nextElem > 0) {
			this.pushDown(nextElem);
			nextElem = nextElem - 1;
		}
		return this.commands;
	}

	insertElement(insertedValue) {
		this.commands = [];

		if (this.currentHeapSize >= ARRAY_SIZE - 1) {
			this.cmd(act.setText, this.descriptLabel1, 'Heap Full!');
			return this.commands;
		}

		this.cmd(act.setText, this.descriptLabel1, 'Enqueueing Element: ' + insertedValue);
		this.cmd(act.step);
		this.cmd(act.setText, this.descriptLabel1, 'Enqueueing Element: ');
		this.currentHeapSize++;
		this.arrayData[this.currentHeapSize] = insertedValue;
		this.cmd(
			act.createCircle,
			this.circleObjs[this.currentHeapSize],
			'',
			HEAP_X_POSITIONS[this.currentHeapSize],
			HEAP_Y_POSITIONS[this.currentHeapSize]
		);
		this.cmd(act.createLabel, this.descriptLabel2, insertedValue, 120, 45, 1);
		if (this.currentHeapSize > 1) {
			this.cmd(
				act.connect,
				this.circleObjs[Math.floor(this.currentHeapSize / 2)],
				this.circleObjs[this.currentHeapSize]
			);
		}

		this.cmd(
			act.move,
			this.descriptLabel2,
			HEAP_X_POSITIONS[this.currentHeapSize],
			HEAP_Y_POSITIONS[this.currentHeapSize]
		);
		this.cmd(act.step);
		this.cmd(act.setText, this.circleObjs[this.currentHeapSize], insertedValue);
		this.cmd(act.delete, this.descriptLabel2);
		this.cmd(act.setText, this.arrayRects[this.currentHeapSize], insertedValue);

		let currentIndex = this.currentHeapSize;
		let parentIndex = Math.floor(currentIndex / 2);

		if (currentIndex > 1) {
			this.setIndexHighlight(currentIndex, 1);
			this.setIndexHighlight(parentIndex, 1);
			this.cmd(act.step);
			this.setIndexHighlight(currentIndex, 0);
			this.setIndexHighlight(parentIndex, 0);
		}

		while (currentIndex > 1 && this.upheapCompare(currentIndex, parentIndex)) {
			this.swap(currentIndex, parentIndex);
			currentIndex = parentIndex;
			parentIndex = Math.floor(parentIndex / 2);
			if (currentIndex > 1) {
				this.setIndexHighlight(currentIndex, 1);
				this.setIndexHighlight(parentIndex, 1);
				this.cmd(act.step);
				this.setIndexHighlight(currentIndex, 0);
				this.setIndexHighlight(parentIndex, 0);
			}
		}
		this.cmd(act.setText, this.descriptLabel1, '');

		return this.commands;
	}

	upheapCompare(currentIndex, parentIndex) {
		if (this.isMinHeap) {
			if (this.arrayData[currentIndex] < this.arrayData[parentIndex]) {
				return true;
			}
		} else {
			if (this.arrayData[currentIndex] > this.arrayData[parentIndex]) {
				return true;
			}
		}
	}

	disableUI() {
		this.insertField.disabled = true;
		this.insertButton.disabled = true;
		this.removeButton.disabled = true;
		this.clearButton.disabled = true;
		this.buildHeapButton.disabled = true;
		this.minHeapButton.disabled = true;
		this.maxHeapButton.disabled = true;
	}

	enableUI() {
		this.insertField.disabled = false;
		this.insertButton.disabled = false;
		this.removeButton.disabled = false;
		this.clearButton.disabled = false;
		this.buildHeapButton.disabled = false;
		this.minHeapButton.disabled = false;
		this.maxHeapButton.disabled = false;
	}
}
