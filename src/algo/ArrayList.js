/* eslint-disable lines-between-class-members */
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
} from './Algorithm';
import { act } from '../anim/AnimationMain';

const ARRAY_START_X = 100;
const ARRAY_START_Y = 150;
const RESIZE_ARRAY_START_X = 100;
const RESIZE_ARRAY_START_Y = 280;
const ARRAY_ELEM_WIDTH = 50;
const ARRAY_ELEM_HEIGHT = 50;

const ARRAY_ELEMS_PER_LINE = 14;
const ARRAY_LINE_SPACING = 130;

const PUSH_LABEL_X = 50;
const PUSH_LABEL_Y = 30;
const PUSH_ELEMENT_X = 120;
const PUSH_ELEMENT_Y = 30;
const PUSH_RESIZE_LABEL_X = 60;
const PUSH_RESIZE_LABEL_Y = 60;

const SIZE = 7;
const MAX_SIZE = 30;

export default class ArrayList extends Algorithm {
	constructor(am, w, h) {
		super(am, w, h);
		this.addControls();
		this.nextIndex = 0;
		this.setup();
	}

	addControls() {
		this.controls = [];

		const addVerticalGroup = addGroupToAlgorithmBar(false);
		const addTopHorizontalGroup = addGroupToAlgorithmBar(true, addVerticalGroup);
		const addBottomHorizontalGroup = addGroupToAlgorithmBar(true, addVerticalGroup);

		addLabelToAlgorithmBar('Add', addTopHorizontalGroup);

		// Add's value text field
		this.addValueField = addControlToAlgorithmBar('Text', '', addTopHorizontalGroup);
		this.addValueField.onkeydown = this.returnSubmit(
			this.addValueField,
			() => this.addIndexCallback(),
			4,
		);
		this.controls.push(this.addValueField);

		addLabelToAlgorithmBar('at index', addTopHorizontalGroup);

		// Add's index text field
		this.addIndexField = addControlToAlgorithmBar('Text', '', addTopHorizontalGroup);
		this.addIndexField.onkeydown = this.returnSubmit(
			this.addIndexField,
			() => this.addIndexCallback(),
			4,
			true,
		);
		this.controls.push(this.addIndexField);

		// Add to front button
		this.addFrontButton = addControlToAlgorithmBar(
			'Button',
			'Add to Front',
			addBottomHorizontalGroup,
		);
		this.addFrontButton.onclick = this.addFrontCallback.bind(this);
		this.controls.push(this.addFrontButton);

		// Add to back button
		this.addBackButton = addControlToAlgorithmBar(
			'Button',
			'Add to Back',
			addBottomHorizontalGroup,
		);
		this.addBackButton.onclick = () => this.addBackCallback();
		this.controls.push(this.addBackButton);

		addLabelToAlgorithmBar('or', addBottomHorizontalGroup);

		// Add at index button
		this.addIndexButton = addControlToAlgorithmBar(
			'Button',
			'Add at Index',
			addBottomHorizontalGroup,
		);
		this.addIndexButton.onclick = this.addIndexCallback.bind(this);
		this.controls.push(this.addIndexButton);

		addDivisorToAlgorithmBar();

		const removeVerticalGroup = addGroupToAlgorithmBar(false);
		const removeTopHorizontalGroup = addGroupToAlgorithmBar(true, removeVerticalGroup);
		const removeBottomHorizontalGroup = addGroupToAlgorithmBar(true, removeVerticalGroup);

		addLabelToAlgorithmBar('Index', removeTopHorizontalGroup);

		// Remove's index text field
		this.removeField = addControlToAlgorithmBar('Text', '', removeTopHorizontalGroup);
		this.removeField.onkeydown = this.returnSubmit(
			this.removeField,
			() => this.removeIndexCallback(),
			4,
			true,
		);
		this.controls.push(this.removeField);

		// Remove from index button
		this.removeIndexButton = addControlToAlgorithmBar(
			'Button',
			'Remove from Index',
			removeTopHorizontalGroup,
		);
		this.removeIndexButton.onclick = () => this.removeIndexCallback();
		this.controls.push(this.removeIndexButton);

		addLabelToAlgorithmBar('or', removeBottomHorizontalGroup);

		// Remove from front button
		this.removeFrontButton = addControlToAlgorithmBar(
			'Button',
			'Remove from Front',
			removeBottomHorizontalGroup,
		);
		this.removeFrontButton.onclick = () => this.removeFrontCallback();
		this.controls.push(this.removeFrontButton);

		// Remove from back button
		this.removeBackButton = addControlToAlgorithmBar(
			'Button',
			'Remove from Back',
			removeBottomHorizontalGroup,
		);
		this.removeBackButton.onclick = () => this.removeBackCallback();
		this.controls.push(this.removeBackButton);

		// Get's index text field
		// this.getField = addControlToAlgorithmBar("Text", "");
		// this.getField.onkeydown = this.returnSubmit(this.getField, () => this.getCallback(), 4, true);
		// this.controls.push(this.getField);

		// Get button
		// this.getButton = addControlToAlgorithmBar("Button", "Get");
		// this.getButton.onclick = () => this.getCallback();
		// this.controls.push(this.getButton);

		addDivisorToAlgorithmBar();

		// Clear button
		this.clearButton = addControlToAlgorithmBar('Button', 'Clear');
		this.clearButton.onclick = () => this.clearCallback();
		this.controls.push(this.clearButton);
	}

	setup() {
		this.arrayID = new Array(SIZE);
		this.arrayLabelID = new Array(SIZE);
		for (let i = 0; i < SIZE; i++) {
			this.arrayID[i] = this.nextIndex++;
			this.arrayLabelID[i] = this.nextIndex++;
		}

		this.arrayData = new Array(SIZE);

		this.size = 0;
		this.length = SIZE;
		this.commands = [];

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
			this.cmd(act.setForegroundColor, this.arrayLabelID[i], '#0000FF');
		}

		this.highlight1ID = this.nextIndex++;

		this.animationManager.startNewAnimation(this.commands);
		this.animationManager.skipForward();
		this.animationManager.clearHistory();
	}

	reset() {
		this.nextIndex = 0;
		this.size = 0;
		this.length = SIZE;
		this.arrayID = new Array(SIZE);
		this.arrayLabelID = new Array(SIZE);
		this.arrayData = new Array(SIZE);

		for (let i = 0; i < SIZE; i++) {
			this.arrayID[i] = this.nextIndex++;
			this.arrayLabelID[i] = this.nextIndex++;
		}
		this.highlight1ID = this.nextIndex++;
	}

	addIndexCallback() {
		if (
			this.addValueField.value !== '' &&
			this.addIndexField.value !== '' &&
			!(this.length === this.size && this.length * 2 > MAX_SIZE)
		) {
			const addVal = this.addValueField.value;
			const index = this.addIndexField.value;
			if (index >= 0 && index <= this.size) {
				this.addValueField.value = '';
				this.addIndexField.value = '';
				if (this.size === this.length) {
					this.implementAction(this.resize.bind(this), addVal, index);
				} else {
					this.implementAction(this.add.bind(this), addVal, index);
				}
			}
		}
	}

	addFrontCallback() {
		if (
			this.addValueField.value !== '' &&
			!(this.length === this.size && this.length * 2 > MAX_SIZE)
		) {
			const addVal = this.addValueField.value;
			this.addValueField.value = '';
			if (this.size === this.length) {
				this.implementAction(this.resize.bind(this), addVal, 0);
			} else {
				this.implementAction(this.add.bind(this), addVal, 0);
			}
		}
	}

	addBackCallback() {
		if (
			this.addValueField.value !== '' &&
			!(this.length === this.size && this.length * 2 > MAX_SIZE)
		) {
			const addVal = this.addValueField.value;
			this.addValueField.value = '';
			if (this.size === this.length) {
				this.implementAction(this.resize.bind(this), addVal, this.size);
			} else {
				this.implementAction(this.add.bind(this), addVal, this.size);
			}
		}
	}

	removeIndexCallback() {
		if (this.removeField.value !== '') {
			const index = this.removeField.value;
			if (index >= 0 && index < this.size) {
				this.removeField.value = '';
				this.implementAction(this.remove.bind(this), index);
			}
		}
	}

	removeFrontCallback() {
		if (this.size > 0) {
			this.implementAction(this.remove.bind(this), 0);
		}
	}

	removeBackCallback() {
		if (this.size > 0) {
			this.implementAction(this.remove.bind(this), this.size - 1);
		}
	}

	clearCallback() {
		this.implementAction(this.clear.bind(this));
	}

	clear() {
		this.commands = [];
		this.clearAll();
		return this.commands;
	}

	add(elemToAdd, index) {
		this.commands = [];

		const labPushID = this.nextIndex++;
		const labPushValID = this.nextIndex++;

		this.cmd(act.createLabel, labPushID, 'Adding Value: ', PUSH_LABEL_X, PUSH_LABEL_Y);
		this.cmd(act.createLabel, labPushValID, elemToAdd, PUSH_ELEMENT_X, PUSH_ELEMENT_Y);
		this.cmd(act.step);

		for (let i = this.size; i >= index; i--) {
			this.arrayData[i + 1] = this.arrayData[i];
		}
		this.arrayData[index] = elemToAdd;

		this.arrayMoveID = new Array(this.size);

		if (index !== this.size) {
			for (let i = this.size - 1; i >= index; i--) {
				const xpos = (i % ARRAY_ELEMS_PER_LINE) * ARRAY_ELEM_WIDTH + ARRAY_START_X;
				const ypos =
					Math.floor(i / ARRAY_ELEMS_PER_LINE) * ARRAY_LINE_SPACING + ARRAY_START_Y;
				this.arrayMoveID[i] = this.nextIndex++;
				this.cmd(act.createLabel, this.arrayMoveID[i], this.arrayData[i + 1], xpos, ypos);
				this.cmd(act.setText, this.arrayID[i], '');
				this.cmd(act.move, this.arrayMoveID[i], xpos + ARRAY_ELEM_WIDTH, ypos);
			}
			this.cmd(act.step);

			for (let i = this.size - 1; i >= index; i--) {
				this.cmd(act.setText, this.arrayID[i + 1], this.arrayData[i + 1]);
				this.cmd(act.delete, this.arrayMoveID[i]);
			}
			this.cmd(act.step);
		}

		this.cmd(
			act.createHighlightCircle,
			this.highlight1ID,
			'#0000FF',
			PUSH_ELEMENT_X,
			PUSH_ELEMENT_Y,
		);
		this.cmd(act.step);

		const xpos = (parseInt(index) % ARRAY_ELEMS_PER_LINE) * ARRAY_ELEM_WIDTH + ARRAY_START_X;
		const ypos =
			Math.floor(parseInt(index) / ARRAY_ELEMS_PER_LINE) * ARRAY_LINE_SPACING + ARRAY_START_Y;

		this.cmd(act.move, this.highlight1ID, xpos, ypos);
		this.cmd(act.move, labPushValID, xpos, ypos);
		this.cmd(act.step);

		this.cmd(act.setText, this.arrayID[index], elemToAdd);
		this.cmd(act.delete, labPushValID);
		this.cmd(act.delete, this.highlight1ID);
		this.cmd(act.step);

		this.cmd(act.delete, labPushID);
		this.cmd(act.step);

		if (index != null) {
			this.nextIndex = this.nextIndex - (this.size - index) - 2;
		} else {
			this.nextIndex = this.nextIndex - 2;
		}

		this.size = this.size + 1;

		return this.commands;
	}

	remove(index) {
		this.commands = [];

		index = parseInt(index);
		const labPopValID = this.nextIndex++;

		const xpos = (index % ARRAY_ELEMS_PER_LINE) * ARRAY_ELEM_WIDTH + ARRAY_START_X;
		const ypos = Math.floor(index / ARRAY_ELEMS_PER_LINE) * ARRAY_LINE_SPACING + ARRAY_START_Y;

		this.cmd(act.createHighlightCircle, this.highlight1ID, '#0000FF', xpos, ypos);
		this.cmd(act.createLabel, labPopValID, this.arrayData[index], xpos, ypos);
		this.cmd(act.setText, this.arrayID[index], '');
		this.cmd(act.move, this.highlight1ID, xpos, ypos - 100);
		this.cmd(act.move, labPopValID, xpos, ypos - 100);
		this.cmd(act.step);

		this.cmd(act.delete, labPopValID);
		this.cmd(act.delete, this.highlight1ID);
		this.cmd(act.step);

		for (let i = index; i < this.size; i++) {
			this.arrayData[i] = this.arrayData[i + 1];
		}
		this.arrayData[this.size] = null;

		this.arrayMoveID = new Array(this.size);

		for (let i = index + 1; i < this.size; i++) {
			const xpos = (i % ARRAY_ELEMS_PER_LINE) * ARRAY_ELEM_WIDTH + ARRAY_START_X;
			const ypos = Math.floor(i / ARRAY_ELEMS_PER_LINE) * ARRAY_LINE_SPACING + ARRAY_START_Y;
			this.arrayMoveID[i] = this.nextIndex++;
			this.cmd(act.createLabel, this.arrayMoveID[i], this.arrayData[i - 1], xpos, ypos);
			this.cmd(act.setText, this.arrayID[i], '');
			this.cmd(act.move, this.arrayMoveID[i], xpos - ARRAY_ELEM_WIDTH, ypos);
		}
		this.cmd(act.step);

		for (let i = index + 1; i < this.size; i++) {
			this.cmd(act.setText, this.arrayID[i - 1], this.arrayData[i - 1]);
			this.cmd(act.delete, this.arrayMoveID[i]);
		}
		this.cmd(act.step);

		if (index != null) {
			this.nextIndex = this.nextIndex - (this.size - index);
		} else {
			this.nextIndex = this.nextIndex - 2;
		}

		this.size = this.size - 1;

		return this.commands;
	}

	resize(elemToAdd, index) {
		this.commands = [];

		const labPushID = this.nextIndex++;
		const labPushValID = this.nextIndex++;
		const labPushResizeID = this.nextIndex++;

		this.cmd(act.createLabel, labPushID, 'Adding Value: ', PUSH_LABEL_X, PUSH_LABEL_Y);
		this.cmd(act.createLabel, labPushValID, elemToAdd, PUSH_ELEMENT_X, PUSH_ELEMENT_Y);
		this.cmd(
			act.createLabel,
			labPushResizeID,
			'(Resize Required)',
			PUSH_RESIZE_LABEL_X,
			PUSH_RESIZE_LABEL_Y,
		);
		this.cmd(act.step);

		this.arrayIDNew = new Array(this.size * 2);
		this.arrayLabelIDNew = new Array(this.size * 2);
		this.arrayDataNew = new Array(this.size * 2);

		this.length = this.length * 2;

		for (let i = 0; i < this.size * 2; i++) {
			this.arrayIDNew[i] = this.nextIndex++;
			this.arrayLabelIDNew[i] = this.nextIndex++;
			if (i < index) {
				this.arrayDataNew[i] = this.arrayData[i];
			} else if (i > index && i <= this.size) {
				this.arrayDataNew[i] = this.arrayData[i - 1];
			}
		}

		this.arrayDataNew[index] = elemToAdd;

		this.highlight1ID = this.nextIndex++;

		//Create new array
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

		this.arrayMoveID = new Array(this.size);

		//Move elements before index from old array
		for (let i = 0; i < index; i++) {
			const xposinit = (i % ARRAY_ELEMS_PER_LINE) * ARRAY_ELEM_WIDTH + ARRAY_START_X;
			const yposinit =
				Math.floor(i / ARRAY_ELEMS_PER_LINE) * ARRAY_LINE_SPACING + ARRAY_START_Y;

			const xpos = (i % ARRAY_ELEMS_PER_LINE) * ARRAY_ELEM_WIDTH + RESIZE_ARRAY_START_X;
			const ypos =
				Math.floor(i / ARRAY_ELEMS_PER_LINE) * ARRAY_LINE_SPACING + RESIZE_ARRAY_START_Y;

			this.arrayMoveID[i] = this.nextIndex++;

			this.cmd(act.createLabel, this.arrayMoveID[i], this.arrayData[i], xposinit, yposinit);
			this.cmd(act.move, this.arrayMoveID[i], xpos, ypos);
		}
		this.cmd(act.step);

		//delete movement id objects and set text
		for (let i = 0; i < index; i++) {
			this.cmd(act.delete, this.arrayMoveID[i]);
			this.cmd(act.setText, this.arrayIDNew[i], this.arrayData[i]);
		}

		//Add elemToAdd at the index
		this.cmd(
			act.createHighlightCircle,
			this.highlight1ID,
			'#0000FF',
			PUSH_ELEMENT_X,
			PUSH_ELEMENT_Y,
		);
		this.cmd(act.step);

		const xpos =
			(parseInt(index) % ARRAY_ELEMS_PER_LINE) * ARRAY_ELEM_WIDTH + RESIZE_ARRAY_START_X;
		const ypos =
			Math.floor(parseInt(index) / ARRAY_ELEMS_PER_LINE) * ARRAY_LINE_SPACING +
			RESIZE_ARRAY_START_Y;

		this.cmd(act.move, this.highlight1ID, xpos, ypos);
		this.cmd(act.move, labPushValID, xpos, ypos);
		this.cmd(act.step);

		this.cmd(act.setText, this.arrayIDNew[index], elemToAdd);
		this.cmd(act.delete, labPushValID);
		this.cmd(act.delete, this.highlight1ID);
		this.cmd(act.step);

		//Move elements after index from old array
		for (let i = index; i < this.size; i++) {
			const xposinit = (i % ARRAY_ELEMS_PER_LINE) * ARRAY_ELEM_WIDTH + ARRAY_START_X;
			const yposinit =
				Math.floor(i / ARRAY_ELEMS_PER_LINE) * ARRAY_LINE_SPACING + ARRAY_START_Y;

			const xpos = (i % (ARRAY_ELEMS_PER_LINE - 1)) * ARRAY_ELEM_WIDTH + RESIZE_ARRAY_START_X;
			const ypos =
				Math.floor(i / (ARRAY_ELEMS_PER_LINE - 1)) * ARRAY_LINE_SPACING +
				RESIZE_ARRAY_START_Y;

			this.arrayMoveID[i] = this.nextIndex++;

			this.cmd(act.createLabel, this.arrayMoveID[i], this.arrayData[i], xposinit, yposinit);
			this.cmd(act.move, this.arrayMoveID[i], xpos + ARRAY_ELEM_WIDTH, ypos);
		}
		this.cmd(act.step);

		//delete movement id objects
		for (let i = index; i <= this.size; i++) {
			if (i < this.size) {
				this.cmd(act.delete, this.arrayMoveID[i]);
			}
			this.cmd(act.setText, this.arrayIDNew[i], this.arrayData[i - 1]);
		}

		this.cmd(act.setText, this.arrayIDNew[index], elemToAdd);

		this.cmd(act.delete, labPushID);
		this.cmd(act.delete, labPushResizeID);
		this.cmd(act.step);

		for (let i = 0; i < this.size; i++) {
			this.cmd(act.delete, this.arrayID[i]);
			this.cmd(act.delete, this.arrayLabelID[i]);
		}

		for (let i = 0; i < this.size * 2; i++) {
			const xpos = (i % ARRAY_ELEMS_PER_LINE) * ARRAY_ELEM_WIDTH + ARRAY_START_X;
			const ypos = Math.floor(i / ARRAY_ELEMS_PER_LINE) * ARRAY_LINE_SPACING + ARRAY_START_Y;

			this.cmd(act.move, this.arrayIDNew[i], xpos, ypos);
			this.cmd(act.move, this.arrayLabelIDNew[i], xpos, ypos + ARRAY_ELEM_HEIGHT);
		}

		this.arrayID = this.arrayIDNew;
		this.arrayLabelID = this.arrayLabelIDNew;
		this.arrayData = this.arrayDataNew;

		if (index != null) {
			this.nextIndex = this.nextIndex - this.size;
		}

		this.size = this.size + 1;

		return this.commands;
	}

	clearAll() {
		this.commands = [];
		for (let i = 0; i < this.size; i++) {
			this.cmd(act.setText, this.arrayID[i], '');
			this.arrayData[i] = null;
		}
		this.size = 0;
		return this.commands;
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
