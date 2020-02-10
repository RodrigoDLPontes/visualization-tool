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

import Algorithm, { addControlToAlgorithmBar, addLabelToAlgorithmBar } from './Algorithm';
import { act } from '../anim/AnimationMain';

const ARRAY_START_X = 100;
const ARRAY_START_Y = 200;
const ARRAY_ELEM_WIDTH = 50;
const ARRAY_ELEM_HEIGHT = 50;

const ARRRAY_ELEMS_PER_LINE = 15;
const ARRAY_LINE_SPACING = 130;

// const TOP_POS_X = 180;
// const TOP_POS_Y = 100;
// const TOP_LABEL_X = 130;
// const TOP_LABEL_Y =  100;

const PUSH_LABEL_X = 50;
const PUSH_LABEL_Y = 30;
const PUSH_ELEMENT_X = 120;
const PUSH_ELEMENT_Y = 30;

const SIZE = 10;

export default class ArrayList extends Algorithm {
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

		addLabelToAlgorithmBar('Value');

		// Add's value text field
		this.addValueField = addControlToAlgorithmBar('Text', '');
		this.addValueField.onkeydown = this.returnSubmit(
			this.addValueField,
			() => this.addIndexCallback(),
			4,
			true
		);
		this.controls.push(this.addValueField);

		addLabelToAlgorithmBar('at index');

		// Add's index text field
		this.addIndexField = addControlToAlgorithmBar('Text', '');
		this.addIndexField.onkeydown = this.returnSubmit(
			this.addIndexField,
			() => this.addIndexCallback(),
			4,
			true
		);
		this.controls.push(this.addIndexField);

		// Add at index button
		this.addIndexButton = addControlToAlgorithmBar('Button', 'Add at Index');
		this.addIndexButton.onclick = this.addIndexCallback.bind(this);
		this.controls.push(this.addIndexButton);

		addLabelToAlgorithmBar('or');

		// Add to front button
		this.addFrontButton = addControlToAlgorithmBar('Button', 'Add to Front');
		this.addFrontButton.onclick = this.addFrontCallback.bind(this);
		this.controls.push(this.addFrontButton);

		// Add to back button
		this.addBackButton = addControlToAlgorithmBar('Button', 'Add to Back');
		this.addBackButton.onclick = () => this.addBackCallback();
		this.controls.push(this.addBackButton);

		// Remove's index text field
		this.removeField = addControlToAlgorithmBar('Text', '');
		this.removeField.onkeydown = this.returnSubmit(
			this.removeField,
			() => this.removeIndexCallback(),
			4,
			true
		);
		this.controls.push(this.removeField);

		// Remove from index button
		this.removeIndexButton = addControlToAlgorithmBar('Button', 'Remove from Index');
		this.removeIndexButton.onclick = () => this.removeIndexCallback();
		this.controls.push(this.removeIndexButton);

		addLabelToAlgorithmBar('or');

		// Remove from front button
		this.removeFrontButton = addControlToAlgorithmBar('Button', 'Remove from Front');
		this.removeFrontButton.onclick = () => this.removeFrontCallback();
		this.controls.push(this.removeFrontButton);

		// Remove from back button
		this.removeBackButton = addControlToAlgorithmBar('Button', 'Remove from Back');
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

		// Clear button
		this.clearButton = addControlToAlgorithmBar('Button', 'Clear');
		this.clearButton.onclick = () => this.clearCallback();
		this.controls.push(this.clearButton);
	}

	setup() {
		this.arrayData = new Array(SIZE);
		this.arrayID = new Array(SIZE);
		this.arrayLabelID = new Array(SIZE);
		for (let i = 0; i < SIZE; i++) {
			this.arrayData[i] = 0;
			this.arrayID[i] = this.nextIndex++;
			this.arrayLabelID[i] = this.nextIndex++;
		}

		this.size = 0;
		this.commands = [];

		for (let i = 0; i < SIZE; i++) {
			const xpos = (i % ARRRAY_ELEMS_PER_LINE) * ARRAY_ELEM_WIDTH + ARRAY_START_X;
			const ypos = Math.floor(i / ARRRAY_ELEMS_PER_LINE) * ARRAY_LINE_SPACING + ARRAY_START_Y;
			this.cmd(
				act.createRectangle,
				this.arrayID[i],
				'',
				ARRAY_ELEM_WIDTH,
				ARRAY_ELEM_HEIGHT,
				xpos,
				ypos
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
		// Reset all of your data structures to *exactly* the state they have immediately after the init
		// function is called.  This method is called whenever an "undo" is performed.  Your data
		// structures are completely cleaned, and then all of the actions *up to but not including* the
		// last action are then redone.  If you implement all of your actions through the "implementAction"
		// method below, then all of this work is done for you in the Animation "superclass"

		// Reset the (very simple) memory manager
		this.nextIndex = 0;
		this.size = 0;
		for (let i = 0; i < SIZE; i++) {
			this.arrayData[i] = 0;
			this.arrayID[i] = this.nextIndex++;
			this.arrayLabelID[i] = this.nextIndex++;
		}
		this.highlight1ID = this.nextIndex++;
	}

	addIndexCallback() {
		if (
			this.addValueField.value !== '' &&
			this.addIndexField.value !== '' &&
			this.size < SIZE
		) {
			const addVal = this.addValueField.value;
			const index = this.addIndexField.value;
			if (index >= 0 && index <= this.size) {
				this.addValueField.value = '';
				this.addIndexField.value = '';
				this.implementAction(_ => this.add(_), addVal + ',' + index);
			}
		}
	}

	addFrontCallback() {
		if (this.addValueField.value !== '' && this.size < SIZE) {
			const addVal = this.addValueField.value;
			this.addValueField.value = '';
			this.implementAction(_ => this.add(_), addVal + ',' + 0);
		}
	}

	addBackCallback() {
		if (this.addValueField.value !== '' && this.size < SIZE) {
			const addVal = this.addValueField.value;
			this.addValueField.value = '';
			this.implementAction(_ => this.add(_), addVal + ',' + this.size);
		}
	}

	removeIndexCallback() {
		if (this.removeField.value !== '') {
			const index = this.removeField.value;
			if (index >= 0 && index < this.size) {
				this.removeField.value = '';
				this.implementAction(_ => this.remove(_), index);
			}
		}
	}

	removeFrontCallback() {
		if (this.size > 0) {
			this.implementAction(_ => this.remove(_), 0);
		}
	}

	removeBackCallback() {
		if (this.size > 0) {
			this.implementAction(_ => this.remove(_), this.size - 1);
		}
	}

	clearCallback() {
		this.implementAction(() => this.clear(), '');
	}

	clear() {
		this.commands = [];
		this.clearAll();
		return this.commands;
	}

	add(params) {
		this.commands = [];

		const elemToAdd = parseInt(params.split(',')[0]);
		const index = parseInt(params.split(',')[1]);
		const labPushID = this.nextIndex++;
		const labPushValID = this.nextIndex++;

		for (let i = this.size - 1; i >= index; i--) {
			this.arrayData[i + 1] = this.arrayData[i];
		}
		this.arrayData[index] = elemToAdd;

		this.cmd(act.createLabel, labPushID, 'Adding Value: ', PUSH_LABEL_X, PUSH_LABEL_Y);
		this.cmd(act.createLabel, labPushValID, elemToAdd, PUSH_ELEMENT_X, PUSH_ELEMENT_Y);
		this.cmd(act.step);

		for (let i = this.size - 1; i >= index; i--) {
			const xpos = (i % ARRRAY_ELEMS_PER_LINE) * ARRAY_ELEM_WIDTH + ARRAY_START_X;
			const ypos = Math.floor(i / ARRRAY_ELEMS_PER_LINE) * ARRAY_LINE_SPACING + ARRAY_START_Y;
			const presentID = this.nextIndex + i;
			this.cmd(act.createLabel, presentID, this.arrayData[i + 1], xpos, ypos);
			this.cmd(act.setText, this.arrayID[i], '');
			this.cmd(act.move, presentID, xpos + ARRAY_ELEM_WIDTH, ypos);
		}
		this.cmd(act.step);

		for (let i = this.size - 1; i >= index; i--) {
			const presentID = this.nextIndex + i;
			this.cmd(act.setText, this.arrayID[i + 1], this.arrayData[i + 1]);
			this.cmd(act.delete, presentID);
		}
		this.cmd(act.step);

		this.nextIndex += this.size - index;

		this.cmd(
			act.createHighlightCircle,
			this.highlight1ID,
			'#0000FF',
			PUSH_ELEMENT_X,
			PUSH_ELEMENT_Y
		);
		this.cmd(act.step);

		const xpos = (parseInt(index) % ARRRAY_ELEMS_PER_LINE) * ARRAY_ELEM_WIDTH + ARRAY_START_X;
		const ypos =
			Math.floor(parseInt(index) / ARRRAY_ELEMS_PER_LINE) * ARRAY_LINE_SPACING +
			ARRAY_START_Y;

		this.cmd(act.move, this.highlight1ID, xpos, ypos);
		this.cmd(act.move, labPushValID, xpos, ypos);
		this.cmd(act.step);

		this.cmd(act.setText, this.arrayID[index], elemToAdd);
		this.cmd(act.delete, labPushValID);
		this.cmd(act.delete, this.highlight1ID);
		this.cmd(act.step);

		this.cmd(act.delete, labPushID);
		this.cmd(act.step);

		this.size = this.size + 1;
		return this.commands;
	}

	remove(index) {
		this.commands = [];

		index = parseInt(index);
		const labPopValID = this.nextIndex++;

		const xpos = (index % ARRRAY_ELEMS_PER_LINE) * ARRAY_ELEM_WIDTH + ARRAY_START_X;
		const ypos = Math.floor(index / ARRRAY_ELEMS_PER_LINE) * ARRAY_LINE_SPACING + ARRAY_START_Y;

		this.cmd(act.createHighlightCircle, this.highlight1ID, '#0000FF', xpos, ypos);
		this.cmd(act.createLabel, labPopValID, this.arrayData[index], xpos, ypos);
		this.cmd(act.setText, this.arrayID[index], '');
		this.cmd(act.move, this.highlight1ID, xpos, ypos - 100);
		this.cmd(act.move, labPopValID, xpos, ypos - 100);
		this.cmd(act.step);

		this.cmd(act.delete, labPopValID);
		this.cmd(act.delete, this.highlight1ID);
		this.cmd(act.step);

		for (let i = index + 1; i < this.size; i++) {
			const xpos = (i % ARRRAY_ELEMS_PER_LINE) * ARRAY_ELEM_WIDTH + ARRAY_START_X;
			const ypos = Math.floor(i / ARRRAY_ELEMS_PER_LINE) * ARRAY_LINE_SPACING + ARRAY_START_Y;
			const presentID = this.nextIndex + i;
			this.cmd(act.createLabel, presentID, this.arrayData[i], xpos, ypos);
			this.cmd(act.setText, this.arrayID[i], '');
			this.cmd(act.move, presentID, xpos - ARRAY_ELEM_WIDTH, ypos);
		}
		this.cmd(act.step);

		for (let i = index + 1; i < this.size; i++) {
			const presentID = this.nextIndex + i;
			this.cmd(act.setText, this.arrayID[i - 1], this.arrayData[i]);
			this.cmd(act.delete, presentID);
		}
		this.cmd(act.step);

		for (let i = index; i < this.size; i++) {
			this.arrayData[i] = this.arrayData[i + 1];
		}

		this.size = this.size - 1;
		return this.commands;
	}

	clearAll() {
		this.commands = [];
		for (let i = 0; i < this.size; i++) {
			this.cmd(act.setText, this.arrayID[i], '');
		}
		this.size = 0;
		return this.commands;
	}

	// Called by our superclass when we get an animation started event -- need to wait for the
	// event to finish before we start doing anything
	disableUI() {
		for (let i = 0; i < this.controls.length; i++) {
			this.controls[i].disabled = true;
		}
	}

	// Called by our superclass when we get an animation completed event -- we can
	/// now interact again.
	enableUI() {
		for (let i = 0; i < this.controls.length; i++) {
			this.controls[i].disabled = false;
		}
	}
}