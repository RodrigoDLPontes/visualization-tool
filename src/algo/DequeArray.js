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
	addLabelToAlgorithmBar,
} from './Algorithm';
import { act } from '../anim/AnimationMain';
import pseudocodeText from '../pseudocode.json';

const ARRAY_START_X = 100;
const ARRAY_START_Y = 245;
const ARRAY_ELEM_WIDTH = 50;
const ARRAY_ELEM_HEIGHT = 50;

const ARRAY_ELEMS_PER_LINE = 14;
const ARRAY_LINE_SPACING = 130;

const FRONT_POS_X = 180;
const FRONT_POS_Y = 120;
const FRONT_LABEL_X = 130;
const FRONT_LABEL_Y = 120;

const SIZE_POS_X = 280;
const SIZE_POS_Y = 120;
const SIZE_LABEL_X = 230;
const SIZE_LABEL_Y = 120;

const QUEUE_LABEL_X = 60;
const QUEUE_LABEL_Y = 30;
const QUEUE_ELEMENT_X = 130;
const QUEUE_ELEMENT_Y = 30;

const RESIZE_ARRAY_START_X = 100;
const RESIZE_ARRAY_START_Y = 340;
const QUEUE_RESIZE_LABEL_X = 60;
const QUEUE_RESIZE_LABEL_Y = 60;

const FRONT_LABEL_OFFSET = -40;

const INDEX_COLOR = '#0000FF';

const CODE_START_X = 450;
const CODE_START_Y = 20;

const SIZE = 7;
const MAX_SIZE = 30;

export default class DequeArray extends Algorithm {
	constructor(am, w, h) {
		super(am, w, h);
		this.addControls();
		this.nextIndex = 0;
		this.commands = [];
		this.setup();
		this.initialIndex = this.nextIndex;
	}

	addControls() {
		this.controls = [];

		// Add's value text field
		this.addField = addControlToAlgorithmBar('Text', '');
		this.addField.style.textAlign = 'center';
		this.addField.onkeydown = this.returnSubmit(this.addField, null, 4, true);
		this.controls.push(this.addField);

		// Add first button
		this.addFirstButton = addControlToAlgorithmBar('Button', 'Add First');
		this.addFirstButton.onclick = this.addFirstCallBack.bind(this);
		this.controls.push(this.addFirstButton);

		addLabelToAlgorithmBar('or');

		// Add last button
		this.addLastButton = addControlToAlgorithmBar('Button', 'Add Last');
		this.addLastButton.onclick = this.addLastCallback.bind(this);
		this.controls.push(this.addLastButton);

		addDivisorToAlgorithmBar();

		// Remove first button
		this.removeFirstButton = addControlToAlgorithmBar('Button', 'Remove First');
		this.removeFirstButton.onclick = this.removeFirstCallback.bind(this);
		this.controls.push(this.removeFirstButton);

		addLabelToAlgorithmBar('or');

		// Remove last button
		this.removeLastButton = addControlToAlgorithmBar('Button', 'Remove Last');
		this.removeLastButton.onclick = this.removeLastCallback.bind(this);
		this.controls.push(this.removeLastButton);

		addDivisorToAlgorithmBar();

		this.randomButton = addControlToAlgorithmBar('Button', 'Random');
		this.randomButton.onclick = this.randomCallback.bind(this);
		this.controls.push(this.randomButton);

		addDivisorToAlgorithmBar();

		this.clearButton = addControlToAlgorithmBar('Button', 'Clear');
		this.clearButton.onclick = this.clearCallback.bind(this);
		this.controls.push(this.clearButton);
	}

	enableUI() {
		for (let i = 0; i < this.controls.length; i++) {
			this.controls[i].disabled = false;
		}
	}

	disableUI() {
		for (let i = 0; i < this.controls.length; i++) {
			this.controls[i].disabled = true;
		}
	}

	setup() {
		this.nextIndex = 0;

		this.pseudocode = pseudocodeText.DequeArray;

		this.resetIndex = this.nextIndex;

		this.arrayID = new Array(SIZE);
		this.arrayLabelID = new Array(SIZE);
		for (let i = 0; i < SIZE; i++) {
			this.arrayID[i] = this.nextIndex++;
			this.arrayLabelID[i] = this.nextIndex++;
		}
		this.frontID = this.nextIndex++;
		const frontLabelID = this.nextIndex++;
		this.frontPointerID = this.nextIndex++;
		this.sizeID = this.nextIndex++;
		const sizeLabelID = this.nextIndex++;

		this.arrayData = new Array(SIZE);
		this.front = 0;
		this.size = 0;
		this.leftoverLabelID = this.nextIndex++;
		this.leftoverValID = this.nextIndex++;
		this.formulaLabelID = this.nextIndex++;
		this.arraySize = SIZE;

		for (let i = 0; i < SIZE; i++) {
			const xpos = (i % ARRAY_ELEMS_PER_LINE) * ARRAY_ELEM_WIDTH + ARRAY_START_X;
			const ypos = Math.floor(i / ARRAY_ELEMS_PER_LINE) * ARRAY_LINE_SPACING + ARRAY_START_Y;
			this.cmd(
				act.createRectangle,
				this.arrayID[i],
				'',
				ARRAY_ELEM_WIDTH,
				ARRAY_ELEM_HEIGHT,
				xpos,
				ypos,
			);
			this.cmd(act.createLabel, this.arrayLabelID[i], i, xpos, ypos + ARRAY_ELEM_HEIGHT);
			this.cmd(act.setForegroundColor, this.arrayLabelID[i], INDEX_COLOR);
		}
		this.cmd(act.createLabel, frontLabelID, 'Front', FRONT_LABEL_X, FRONT_LABEL_Y);
		this.cmd(
			act.createRectangle,
			this.frontID,
			0,
			ARRAY_ELEM_WIDTH,
			ARRAY_ELEM_HEIGHT,
			FRONT_POS_X,
			FRONT_POS_Y,
		);

		this.cmd(act.createLabel, sizeLabelID, 'Size', SIZE_LABEL_X, SIZE_LABEL_Y);
		this.cmd(
			act.createRectangle,
			this.sizeID,
			0,
			ARRAY_ELEM_WIDTH,
			ARRAY_ELEM_HEIGHT,
			SIZE_POS_X,
			SIZE_POS_Y,
		);

		this.cmd(
			act.createLabel,
			this.frontPointerID,
			'Front',
			ARRAY_START_X,
			ARRAY_START_Y + FRONT_LABEL_OFFSET,
		);

		this.cmd(act.createLabel, this.leftoverLabelID, '', QUEUE_LABEL_X, QUEUE_LABEL_Y, true);
		this.cmd(act.createLabel, this.leftoverValID, '', QUEUE_ELEMENT_X, QUEUE_ELEMENT_Y, true);
		this.cmd(
			act.createLabel,
			this.formulaLabelID,
			'',
			QUEUE_LABEL_X + 170,
			QUEUE_LABEL_Y + 30,
			true,
		);

		this.highlight1ID = this.nextIndex++;

		this.animationManager.startNewAnimation(this.commands);
		this.animationManager.skipForward();
		this.animationManager.clearHistory();
	}

	reset() {
		this.top = 0;
		this.front = 0;
		this.size = 0;
		this.nextIndex = this.resetIndex;
		this.arraySize = SIZE;

		this.arrayData = new Array(SIZE);
		this.arrayID = new Array(SIZE);
		this.arrayLabelID = new Array(SIZE);

		for (let i = 0; i < SIZE; i++) {
			this.arrayID[i] = this.nextIndex++;
			this.arrayLabelID[i] = this.nextIndex++;
		}

		this.nextIndex = this.nextIndex + 9;
	}

	addLastCallback() {
		if (this.size < this.arraySize && this.addField.value !== '') {
			const pushVal = this.addField.value;
			this.addField.value = '';
			this.implementAction(this.addLast.bind(this), pushVal);
		} else if (
			this.size === this.arraySize &&
			this.addField.value !== '' &&
			this.size * 2 < MAX_SIZE
		) {
			const pushVal = this.addField.value;
			this.addField.value = '';
			this.implementAction(this.resize.bind(this), pushVal, false);
		} else {
			this.shake(this.addLastButton);
		}
	}

	removeFirstCallback() {
		if (this.size !== 0) {
			this.implementAction(this.removeFirst.bind(this));
		} else {
			this.shake(this.removeFirstButton);
		}
	}

	removeLastCallback() {
		if (this.size !== 0) {
			this.implementAction(this.removeLast.bind(this));
		} else {
			this.shake(this.removeLastButton);
		}
	}

	addFirstCallBack() {
		if (this.size < this.arraySize && this.addField.value !== '') {
			const pushVal = this.addField.value;
			this.addField.value = '';
			this.implementAction(this.addFirst.bind(this), pushVal);
		} else if (
			this.size === this.arraySize &&
			this.addField.value !== '' &&
			this.size * 2 < MAX_SIZE
		) {
			const pushVal = this.addField.value;
			this.addField.value = '';
			this.implementAction(this.resize.bind(this), pushVal, true);
		} else {
			this.shake(this.addFirstButton);
		}
	}

	randomCallback() {
		const LOWER_BOUND = 0;
		const UPPER_BOUND = 16;
		const MAX_SIZE = SIZE - 1;
		const MIN_SIZE = 3;
		const randomSize = Math.floor(Math.random() * (MAX_SIZE - MIN_SIZE + 1)) + MIN_SIZE;
		const set = new Set();

		this.implementAction(this.clearAll.bind(this));

		for (let i = 0; i < randomSize; i++) {
			const val = Math.floor(Math.random() * (UPPER_BOUND - LOWER_BOUND + 1)) + LOWER_BOUND;
			const randomNum = Math.floor(Math.random() * 2);
			if (set.has(val)) {
				i--;
			} else {
				set.add(val);
				if (randomNum === 0) {
					this.implementAction(this.addFirst.bind(this), val, true);
				} else {
					this.implementAction(this.addLast.bind(this), val, true);
				}
			}
			this.animationManager.skipForward();
			this.animationManager.clearHistory();
		}
	}

	clearCallback() {
		this.implementAction(this.clearAll.bind(this));
	}

	addLast(elemToAddLast, skipPseudocode) {
		this.commands = [];

		if (!skipPseudocode) {
			this.addLastCodeID = this.addCodeToCanvasBaseAll(
				this.pseudocode,
				'addLast',
				CODE_START_X,
				CODE_START_Y,
			);
		}

		const labAddLastID = this.nextIndex++;
		const labAddLastValID = this.nextIndex++;
		const addIndex = (this.front + this.size) % this.arraySize;

		this.highlight(0, 0, this.addLastCodeID);
		this.cmd(act.setText, this.leftoverLabelID, '');
		this.cmd(act.setText, this.leftoverValID, '');

		this.arrayData[addIndex] = elemToAddLast;

		this.cmd(act.createLabel, labAddLastID, 'Enqueuing Value: ', QUEUE_LABEL_X, QUEUE_LABEL_Y);
		this.cmd(act.createLabel, labAddLastValID, elemToAddLast, QUEUE_ELEMENT_X, QUEUE_ELEMENT_Y);

		this.cmd(act.step);
		this.highlight(7, 0, this.addLastCodeID, 'code');
		this.highlight(8, 0, this.addLastCodeID, 'english');
		this.cmd(act.createHighlightCircle, this.highlight1ID, INDEX_COLOR, SIZE_POS_X, SIZE_POS_Y);
		this.cmd(act.step);
		this.cmd(
			act.setText,
			this.formulaLabelID,
			`Adding ${elemToAddLast} to back at index (${this.front} + ${this.size}) % ${this.arraySize}`,
		);

		const xpos = (addIndex % ARRAY_ELEMS_PER_LINE) * ARRAY_ELEM_WIDTH + ARRAY_START_X;
		const ypos =
			Math.floor(addIndex / ARRAY_ELEMS_PER_LINE) * ARRAY_LINE_SPACING + ARRAY_START_Y;

		this.cmd(act.move, this.highlight1ID, xpos, ypos + ARRAY_ELEM_HEIGHT);
		this.cmd(act.step);

		this.cmd(act.move, labAddLastValID, xpos, ypos);
		this.cmd(act.step);

		this.cmd(act.setText, this.arrayID[addIndex], elemToAddLast);
		this.cmd(act.delete, labAddLastValID);

		this.cmd(act.delete, this.highlight1ID);

		this.unhighlight(7, 0, this.addLastCodeID, 'code');
		this.unhighlight(8, 0, this.addLastCodeID, 'english');
		this.highlight(8, 0, this.addLastCodeID, 'code');
		this.highlight(9, 0, this.addLastCodeID, 'english');
		this.cmd(act.setHighlight, this.sizeID, 1);
		this.cmd(act.step);

		this.size = this.size + 1;
		this.cmd(act.setText, this.sizeID, this.size);
		this.cmd(act.step);

		this.unhighlight(8, 0, this.addLastCodeID, 'code');
		this.unhighlight(9, 0, this.addLastCodeID, 'english');
		this.unhighlight(0, 0, this.addLastCodeID);
		this.cmd(act.setHighlight, this.sizeID, 0);
		this.cmd(act.delete, labAddLastID);
		this.cmd(act.setText, this.formulaLabelID, '');

		this.nextIndex = this.nextIndex - 2;

		if (!skipPseudocode) {
			this.removeCode(this.addLastCodeID);
		}

		return this.commands;
	}

	addFirst(elemToAdd, skipPseudocode) {
		this.commands = [];

		if (!skipPseudocode) {
			this.addFirstCodeID = this.addCodeToCanvasBaseAll(
				this.pseudocode,
				'addFirst',
				CODE_START_X,
				CODE_START_Y,
			);
		}

		const labelAddID = this.nextIndex++;
		const labelAddIDVal = this.nextIndex++;

		this.highlight(0, 0, this.addFirstCodeID);
		this.cmd(act.setText, this.leftoverLabelID, '');
		this.cmd(act.setText, this.leftoverValID, '');

		const addIndex = (this.front - 1 + this.arraySize) % this.arraySize;

		const xpos = (addIndex % ARRAY_ELEMS_PER_LINE) * ARRAY_ELEM_WIDTH + ARRAY_START_X;
		const ypos =
			Math.floor(addIndex / ARRAY_ELEMS_PER_LINE) * ARRAY_LINE_SPACING + ARRAY_START_Y;

		this.arrayData[addIndex] = elemToAdd;

		this.cmd(act.createLabel, labelAddID, 'Enqueuing Value: ', QUEUE_LABEL_X, QUEUE_LABEL_Y);
		this.cmd(act.createLabel, labelAddIDVal, elemToAdd, QUEUE_ELEMENT_X, QUEUE_ELEMENT_Y);
		this.cmd(act.step);

		this.highlight(7, 0, this.addFirstCodeID, 'code');
		this.highlight(8, 0, this.addFirstCodeID);
		this.highlight(9, 0, this.addFirstCodeID, 'english');
		this.cmd(
			act.createHighlightCircle,
			this.highlight1ID,
			INDEX_COLOR,
			FRONT_POS_X,
			FRONT_POS_Y,
		);
		this.cmd(
			act.setText,
			this.formulaLabelID,
			`Adding ${elemToAdd} to front at index (${this.front} - 1) % ${this.arraySize}`,
		);
		this.cmd(act.step);

		this.cmd(
			act.move,
			this.highlight1ID,
			this.front * ARRAY_ELEM_WIDTH + ARRAY_START_X,
			ypos + ARRAY_ELEM_HEIGHT,
		);

		this.front = addIndex;

		const frontxpos = (addIndex % ARRAY_ELEMS_PER_LINE) * ARRAY_ELEM_WIDTH + ARRAY_START_X;
		const frontypos =
			Math.floor(addIndex / ARRAY_ELEMS_PER_LINE) * ARRAY_LINE_SPACING +
			ARRAY_START_Y +
			FRONT_LABEL_OFFSET;

		this.cmd(act.setHighlight, this.frontID, 1);
		this.cmd(act.setHighlight, this.frontPointerID, 1);
		this.cmd(act.step);

		this.cmd(act.move, this.frontPointerID, frontxpos, frontypos);
		this.cmd(act.move, this.highlight1ID, xpos, ypos + ARRAY_ELEM_HEIGHT);
		this.cmd(act.setText, this.frontID, this.front);
		this.cmd(act.step);

		this.unhighlight(7, 0, this.addFirstCodeID, 'code');
		this.unhighlight(8, 0, this.addFirstCodeID);
		this.unhighlight(9, 0, this.addFirstCodeID, 'english');
		this.highlight(9, 0, this.addFirstCodeID, 'code');
		this.highlight(10, 0, this.addFirstCodeID, 'english');
		this.cmd(act.setHighlight, this.frontID, 0);
		this.cmd(act.setHighlight, this.frontPointerID, 0);
		this.cmd(act.move, labelAddIDVal, xpos, ypos);
		this.cmd(act.step);

		this.cmd(act.setText, this.arrayID[addIndex], elemToAdd);
		this.cmd(act.delete, labelAddIDVal);
		this.cmd(act.step);

		this.unhighlight(9, 0, this.addFirstCodeID, 'code');
		this.unhighlight(10, 0, this.addFirstCodeID, 'english');
		this.highlight(10, 0, this.addFirstCodeID, 'code');
		this.highlight(11, 0, this.addFirstCodeID, 'english');
		this.cmd(act.setHighlight, this.sizeID, 1);
		this.cmd(act.step);

		this.cmd(act.setText, this.sizeID, this.size + 1);
		this.cmd(act.step);

		this.unhighlight(10, 0, this.addFirstCodeID, 'code');
		this.unhighlight(11, 0, this.addFirstCodeID, 'english');
		this.cmd(act.setHighlight, this.sizeID, 0);
		this.cmd(act.step);

		this.unhighlight(0, 0, this.addFirstCodeID);
		this.cmd(act.delete, this.highlight1ID);
		this.cmd(act.delete, labelAddID);
		this.cmd(act.setText, this.formulaLabelID, '');
		this.size++;

		this.nextIndex = this.nextIndex - 2;

		if (!skipPseudocode) {
			this.removeCode(this.addFirstCodeID);
		}

		return this.commands;
	}

	removeFirst() {
		this.commands = [];

		this.removeFirstCodeID = this.addCodeToCanvasBaseAll(
			this.pseudocode,
			'removeFirst',
			CODE_START_X - 40,
			CODE_START_Y + 20,
		);

		const labremoveFirstID = this.nextIndex++;
		const labremoveFirstValID = this.nextIndex++;

		this.highlight(0, 0, this.removeFirstCodeID);
		this.cmd(act.setText, this.leftoverLabelID, '');
		this.cmd(act.setText, this.leftoverValID, '');
		this.cmd(act.step);

		this.cmd(
			act.createLabel,
			labremoveFirstID,
			'Removed Value: ',
			QUEUE_LABEL_X,
			QUEUE_LABEL_Y,
		);

		this.highlight(1, 0, this.removeFirstCodeID);
		this.cmd(
			act.createHighlightCircle,
			this.highlight1ID,
			INDEX_COLOR,
			FRONT_POS_X,
			FRONT_POS_Y,
		);
		this.cmd(act.step);

		const xpos = (this.front % ARRAY_ELEMS_PER_LINE) * ARRAY_ELEM_WIDTH + ARRAY_START_X;
		const ypos =
			Math.floor(this.front / ARRAY_ELEMS_PER_LINE) * ARRAY_LINE_SPACING + ARRAY_START_Y;

		this.cmd(act.move, this.highlight1ID, xpos, ypos + ARRAY_ELEM_HEIGHT);
		this.cmd(act.step);

		this.cmd(act.delete, this.highlight1ID);

		const removeFirstVal = this.arrayData[this.front];
		this.cmd(act.createLabel, labremoveFirstValID, removeFirstVal, xpos, ypos);
		// this.cmd(act.setText, this.arrayID[this.front], '');
		this.cmd(act.move, labremoveFirstValID, QUEUE_ELEMENT_X, QUEUE_ELEMENT_Y);
		this.cmd(act.step);

		this.unhighlight(1, 0, this.removeFirstCodeID);
		this.highlight(2, 0, this.removeFirstCodeID);
		this.cmd(act.setText, this.arrayID[this.front], '');
		this.cmd(act.step);

		this.unhighlight(2, 0, this.removeFirstCodeID);
		this.highlight(3, 0, this.removeFirstCodeID);
		this.cmd(act.setHighlight, this.frontID, 1);
		this.cmd(act.setHighlight, this.frontPointerID, 1);
		this.cmd(act.step);

		this.front = (this.front + 1) % this.arraySize;
		const frontxpos = (this.front % ARRAY_ELEMS_PER_LINE) * ARRAY_ELEM_WIDTH + ARRAY_START_X;
		const frontypos =
			Math.floor(this.front / ARRAY_ELEMS_PER_LINE) * ARRAY_LINE_SPACING +
			ARRAY_START_Y +
			FRONT_LABEL_OFFSET;

		this.cmd(act.setText, this.frontID, this.front);
		this.cmd(act.move, this.frontPointerID, frontxpos, frontypos);
		this.cmd(act.step);

		this.unhighlight(3, 0, this.removeFirstCodeID);
		this.cmd(act.setHighlight, this.frontID, 0);
		this.cmd(act.setHighlight, this.frontPointerID, 0);
		this.cmd(act.setText, this.leftoverLabelID, 'Removed Value: ');
		this.cmd(act.setText, this.leftoverValID, removeFirstVal);

		this.cmd(act.setText, this.formulaLabelID, '');

		this.cmd(act.delete, labremoveFirstID);
		this.cmd(act.delete, labremoveFirstValID);
		this.cmd(act.step);

		this.highlight(4, 0, this.removeFirstCodeID);
		this.highlight(5, 0, this.removeFirstCodeID);
		this.cmd(act.setHighlight, this.sizeID, 1);
		this.cmd(act.step);

		this.size--;
		this.cmd(act.setText, this.sizeID, this.size);
		this.cmd(act.step);

		this.unhighlight(4, 0, this.removeFirstCodeID);
		this.unhighlight(5, 0, this.removeFirstCodeID);
		this.cmd(act.setHighlight, this.sizeID, 0);
		this.cmd(act.step);

		this.unhighlight(0, 0, this.removeFirstCodeID);
		this.nextIndex = this.nextIndex - 2;

		this.removeCode(this.removeFirstCodeID);

		return this.commands;
	}

	removeLast() {
		this.commands = [];

		this.removeLastCodeID = this.addCodeToCanvasBaseAll(
			this.pseudocode,
			'removeLast',
			CODE_START_X - 40,
			CODE_START_Y + 20,
		);

		const remLabelID = this.nextIndex++;
		const remLabelValID = this.nextIndex++;

		const remIndex = (this.front + this.size - 1 + this.arraySize) % this.arraySize;

		this.highlight(0, 0, this.removeLastCodeID);
		this.cmd(act.setText, this.leftoverLabelID, '');
		this.cmd(act.setText, this.leftoverValID, '');
		this.cmd(act.step);

		this.cmd(act.createLabel, remLabelID, 'Removed Value: ', QUEUE_LABEL_X, QUEUE_LABEL_Y);
		this.cmd(
			act.createHighlightCircle,
			this.highlight1ID,
			INDEX_COLOR,
			FRONT_POS_X,
			FRONT_POS_Y,
		);
		this.cmd(act.createHighlightCircle, this.highlight2ID, INDEX_COLOR, SIZE_POS_X, SIZE_POS_Y);
		this.cmd(act.step);

		const xpos = (remIndex % ARRAY_ELEMS_PER_LINE) * ARRAY_ELEM_WIDTH + ARRAY_START_X;
		const ypos =
			Math.floor(remIndex / ARRAY_ELEMS_PER_LINE) * ARRAY_LINE_SPACING + ARRAY_START_Y;

		this.highlight(1, 0, this.removeLastCodeID);
		this.highlight(2, 0, this.removeLastCodeID, 'code');
		this.cmd(act.move, this.highlight1ID, xpos, ypos + ARRAY_ELEM_HEIGHT);
		this.cmd(act.move, this.highlight2ID, xpos, ypos + ARRAY_ELEM_HEIGHT);
		this.cmd(act.step);

		this.unhighlight(1, 0, this.removeLastCodeID);
		this.unhighlight(2, 0, this.removeLastCodeID, 'code');
		this.highlight(2, 0, this.removeLastCodeID, 'english');
		this.highlight(3, 0, this.removeLastCodeID, 'code');
		this.cmd(act.delete, this.highlight1ID);
		this.cmd(act.delete, this.highlight2ID);
		const removedVal = this.arrayData[remIndex];
		this.cmd(act.createLabel, remLabelValID, removedVal, xpos, ypos);
		this.cmd(act.move, remLabelValID, QUEUE_ELEMENT_X, QUEUE_ELEMENT_Y);
		this.cmd(act.step);

		this.unhighlight(2, 0, this.removeLastCodeID, 'english');
		this.unhighlight(3, 0, this.removeLastCodeID, 'code');
		this.highlight(3, 0, this.removeLastCodeID, 'english');
		this.highlight(4, 0, this.removeLastCodeID, 'code');
		this.cmd(act.setText, this.leftoverLabelID, 'Removed Value: ');
		this.cmd(act.setText, this.leftoverValID, removedVal);
		this.cmd(act.setText, this.formulaLabelID, '');
		this.cmd(act.setText, this.arrayID[remIndex], '');

		this.cmd(act.delete, remLabelID);
		this.cmd(act.delete, remLabelValID);
		this.cmd(act.step);

		this.highlight(4, 0, this.removeLastCodeID, 'english');
		this.highlight(5, 0, this.removeLastCodeID, 'code');
		this.cmd(act.setHighlight, this.sizeID, 1);
		this.cmd(act.step);

		this.cmd(act.setText, this.sizeID, this.size - 1);
		this.cmd(act.step);

		this.cmd(act.setHighlight, this.sizeID, 0);
		this.cmd(act.step);

		this.unhighlight(3, 0, this.removeLastCodeID);
		this.unhighlight(4, 0, this.removeLastCodeID);
		this.unhighlight(5, 0, this.removeLastCodeID, 'code');
		this.unhighlight(0, 0, this.removeLastCodeID);
		this.size--;
		this.nextIndex = this.nextIndex - 2;

		this.removeCode(this.removeLastCodeID);

		return this.commands;
	}

	resize(elemToEnqueue, isFront) {
		this.commands = [];

		if (isFront) {
			this.addFirstCodeID = this.addCodeToCanvasBaseAll(
				this.pseudocode,
				'addFirst',
				CODE_START_X,
				CODE_START_Y,
			);
		} else {
			this.addLastCodeID = this.addCodeToCanvasBaseAll(
				this.pseudocode,
				'addLast',
				CODE_START_X,
				CODE_START_Y,
			);
		}

		const labEnqueueID = this.nextIndex++;
		const labEnqueueValID = this.nextIndex++;
		const labEnqueueResizeID = this.nextIndex++;

		this.arrayIDNew = new Array(this.size * 2);
		this.arrayLabelIDNew = new Array(this.size * 2);
		this.arrayDataNew = new Array(this.size * 2);

		const frontOffset = isFront ? 1 : 0;

		for (let i = 0; i < this.size * 2; i++) {
			this.arrayIDNew[i] = this.nextIndex++;
			this.arrayLabelIDNew[i] = this.nextIndex++;
			if (i < this.size) {
				this.arrayDataNew[i + frontOffset] =
					this.arrayData[(this.front + i) % this.arraySize];
			}
		}

		const extra = isFront ? ': elements shifted by 1' : '';

		if (isFront) {
			this.highlight(0, 0, this.addFirstCodeID);
			this.highlight(1, 0, this.addFirstCodeID);
		} else {
			this.highlight(0, 0, this.addLastCodeID);
			this.highlight(1, 0, this.addLastCodeID);
		}
		this.cmd(act.createLabel, labEnqueueID, 'Enqueuing Value:', QUEUE_LABEL_X, QUEUE_LABEL_Y);
		this.cmd(act.createLabel, labEnqueueValID, elemToEnqueue, QUEUE_ELEMENT_X, QUEUE_ELEMENT_Y);
		this.cmd(
			act.createLabel,
			labEnqueueResizeID,
			`(Resize Required${extra})`,
			isFront ? QUEUE_RESIZE_LABEL_X + 100 : QUEUE_RESIZE_LABEL_X,
			QUEUE_RESIZE_LABEL_Y,
		);
		this.cmd(act.step);

		//Create new array
		if (isFront) {
			this.highlight(2, 0, this.addFirstCodeID);
		} else {
			this.highlight(2, 0, this.addLastCodeID);
		}
		for (let i = 0; i < this.size * 2; i++) {
			const xpos = (i % ARRAY_ELEMS_PER_LINE) * ARRAY_ELEM_WIDTH + RESIZE_ARRAY_START_X;
			const ypos =
				Math.floor(i / ARRAY_ELEMS_PER_LINE) * ARRAY_LINE_SPACING + RESIZE_ARRAY_START_Y;
			this.cmd(
				act.createRectangle,
				this.arrayIDNew[i],
				'',
				ARRAY_ELEM_WIDTH,
				ARRAY_ELEM_HEIGHT,
				xpos,
				ypos,
			);
			this.cmd(act.createLabel, this.arrayLabelIDNew[i], i, xpos, ypos + ARRAY_ELEM_HEIGHT);
			this.cmd(act.setForegroundColor, this.arrayLabelIDNew[i], '#0000FF');
		}
		this.cmd(act.step);

		this.highlight1ID = this.nextIndex++;
		this.arrayMoveID = new Array(this.size);

		//Move old elements to new array
		if (isFront) {
			this.unhighlight(2, 0, this.addFirstCodeID);
			this.highlight(3, 0, this.addFirstCodeID);
			this.highlight(4, 0, this.addFirstCodeID);
		} else {
			this.unhighlight(2, 0, this.addLastCodeID);
			this.highlight(3, 0, this.addLastCodeID);
			this.highlight(4, 0, this.addLastCodeID);
		}
		for (let i = 0; i < this.size; i++) {
			const xposinit =
				(((this.front + i) % this.arraySize) % ARRAY_ELEMS_PER_LINE) * ARRAY_ELEM_WIDTH +
				ARRAY_START_X;
			const yposinit =
				Math.floor(((this.front + i) % this.arraySize) / ARRAY_ELEMS_PER_LINE) *
					ARRAY_LINE_SPACING +
				ARRAY_START_Y;

			const xpos =
				((i + frontOffset) % ARRAY_ELEMS_PER_LINE) * ARRAY_ELEM_WIDTH +
				RESIZE_ARRAY_START_X;
			const ypos =
				Math.floor((i + frontOffset) / ARRAY_ELEMS_PER_LINE) * ARRAY_LINE_SPACING +
				RESIZE_ARRAY_START_Y;

			this.arrayMoveID[i] = this.nextIndex++;

			this.cmd(
				act.createLabel,
				this.arrayMoveID[i],
				this.arrayData[(this.front + i) % this.arraySize],
				xposinit,
				yposinit,
			);
			this.cmd(act.move, this.arrayMoveID[i], xpos, ypos);
			this.cmd(act.step);
		}

		//Delete movement objects and set text
		for (let i = 0; i < this.size; i++) {
			this.cmd(act.delete, this.arrayMoveID[i]);
			this.cmd(
				act.setText,
				this.arrayIDNew[i + frontOffset],
				this.arrayDataNew[i + frontOffset],
			);
		}
		this.cmd(act.step);

		//Delete old array
		if (isFront) {
			this.unhighlight(3, 0, this.addFirstCodeID);
			this.unhighlight(4, 0, this.addFirstCodeID);
			this.highlight(5, 0, this.addFirstCodeID);
		} else {
			this.unhighlight(3, 0, this.addLastCodeID);
			this.unhighlight(4, 0, this.addLastCodeID);
			this.highlight(5, 0, this.addLastCodeID);
		}
		for (let i = 0; i < this.size; i++) {
			this.cmd(act.delete, this.arrayID[i]);
			this.cmd(act.delete, this.arrayLabelID[i]);
		}

		//Move new array
		for (let i = 0; i < this.size * 2; i++) {
			const xpos = (i % ARRAY_ELEMS_PER_LINE) * ARRAY_ELEM_WIDTH + ARRAY_START_X;
			const ypos = Math.floor(i / ARRAY_ELEMS_PER_LINE) * ARRAY_LINE_SPACING + ARRAY_START_Y;

			this.cmd(act.move, this.arrayIDNew[i], xpos, ypos);
			this.cmd(act.move, this.arrayLabelIDNew[i], xpos, ypos + ARRAY_ELEM_HEIGHT);
		}
		this.cmd(act.step);

		this.front = 0;
		this.arrayID = this.arrayIDNew;
		this.arrayLabelID = this.arrayLabelIDNew;
		this.arrayData = this.arrayDataNew;

		if (isFront) {
			this.unhighlight(5, 0, this.addFirstCodeID);
			this.highlight(6, 0, this.addFirstCodeID);
		} else {
			this.unhighlight(5, 0, this.addLastCodeID);
			this.highlight(6, 0, this.addLastCodeID);
		}
		this.cmd(act.setHighlight, this.frontID, 1);
		this.cmd(act.setHighlight, this.frontPointerID, 1);
		this.cmd(act.step);

		this.cmd(act.setText, this.frontID, this.front);
		this.cmd(act.move, this.frontPointerID, ARRAY_START_X, ARRAY_START_Y + FRONT_LABEL_OFFSET);
		this.cmd(act.step);

		if (isFront) {
			this.unhighlight(1, 0, this.addFirstCodeID);
			this.unhighlight(6, 0, this.addFirstCodeID);
			this.highlight(9, 0, this.addFirstCodeID);
		} else {
			this.unhighlight(1, 0, this.addLastCodeID);
			this.unhighlight(6, 0, this.addLastCodeID);
			this.highlight(7, 0, this.addLastCodeID);
		}
		this.cmd(act.setHighlight, this.frontID, 0);
		this.cmd(act.setHighlight, this.frontPointerID, 0);

		//Delete '(resize required)' text, create circle at the "size" object, add enqueue text

		const addIndex = !isFront
			? (this.front + this.size) % this.arrayDataNew.length
			: this.front;

		this.cmd(act.delete, labEnqueueResizeID);

		//Just so the element travels over the array instead of underneath it
		this.cmd(act.delete, labEnqueueValID);
		const labEnqueueValIDNew = this.nextIndex++;
		this.cmd(
			act.createLabel,
			labEnqueueValIDNew,
			elemToEnqueue,
			QUEUE_ELEMENT_X,
			QUEUE_ELEMENT_Y,
		);
		this.cmd(act.step);

		if (isFront) {
			this.cmd(
				act.createHighlightCircle,
				this.highlight1ID,
				INDEX_COLOR,
				FRONT_POS_X,
				FRONT_POS_Y,
			);
		} else {
			this.cmd(
				act.createHighlightCircle,
				this.highlight1ID,
				INDEX_COLOR,
				SIZE_POS_X,
				SIZE_POS_Y,
			);
		}
		this.cmd(act.step);

		const xpos = (addIndex % ARRAY_ELEMS_PER_LINE) * ARRAY_ELEM_WIDTH + ARRAY_START_X;
		const ypos =
			Math.floor(addIndex / ARRAY_ELEMS_PER_LINE) * ARRAY_LINE_SPACING + ARRAY_START_Y;

		this.cmd(
			act.move,
			this.highlight1ID,
			this.front * ARRAY_ELEM_WIDTH + ARRAY_START_X,
			ypos + ARRAY_ELEM_HEIGHT,
		);
		this.cmd(act.step);
		this.cmd(act.move, this.highlight1ID, xpos, ypos + ARRAY_ELEM_HEIGHT);
		this.cmd(act.step);
		this.cmd(act.move, labEnqueueValIDNew, xpos, ypos);
		this.cmd(act.step);
		this.cmd(act.delete, labEnqueueValIDNew);
		this.cmd(act.delete, this.highlight1ID);

		this.arrayData[addIndex] = elemToEnqueue;
		this.cmd(act.setText, this.arrayID[addIndex], elemToEnqueue);
		this.cmd(act.step);

		if (isFront) {
			this.unhighlight(9, 0, this.addFirstCodeID);
			this.highlight(10, 0, this.addFirstCodeID);
		} else {
			this.unhighlight(7, 0, this.addLastCodeID);
			this.highlight(8, 0, this.addLastCodeID);
		}
		this.cmd(act.setHighlight, this.sizeID, 1);
		this.cmd(act.step);

		this.cmd(act.setText, this.sizeID, this.size + 1);
		this.cmd(act.step);

		if (isFront) {
			this.unhighlight(0, 0, this.addFirstCodeID);
			this.unhighlight(10, 0, this.addFirstCodeID);
		} else {
			this.unhighlight(0, 0, this.addLastCodeID);
			this.unhighlight(8, 0, this.addLastCodeID);
		}
		this.cmd(act.setHighlight, this.sizeID, 0);
		this.cmd(act.delete, labEnqueueID);
		this.cmd(act.setText, this.leftoverLabelID, '');
		this.arraySize = this.size * 2;
		this.size++;

		this.nextIndex = this.nextIndex - this.size;

		if (isFront) {
			this.removeCode(this.addFirstCodeID);
		} else {
			this.removeCode(this.addLastCodeID);
		}

		return this.commands;
	}

	clearAll() {
		this.addField.value = '';
		this.commands = [];
		this.cmd(act.setText, this.leftoverLabelID, '');
		this.cmd(act.setText, this.leftoverValID, '');

		for (let i = 0; i < this.arraySize; i++) {
			this.cmd(act.setText, this.arrayID[i], '');
		}
		this.front = 0;
		this.size = 0;
		this.cmd(act.setText, this.frontID, '0');
		this.cmd(act.setText, this.sizeID, '0');
		this.cmd(
			act.setPosition,
			this.frontPointerID,
			ARRAY_START_X,
			ARRAY_START_Y + FRONT_LABEL_OFFSET,
		);

		// Reset array graphic
		for (let i = SIZE; i < this.arraySize; i++) {
			this.cmd(act.delete, this.arrayID[i]);
			this.cmd(act.delete, this.arrayLabelID[i]);
		}
		this.arraySize = SIZE;

		return this.commands;
	}
}
