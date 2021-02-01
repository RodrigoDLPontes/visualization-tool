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

import Algorithm, { addControlToAlgorithmBar, addDivisorToAlgorithmBar } from './Algorithm.js';
import { act } from '../anim/AnimationMain';

const ARRAY_START_X = 100;
const ARRAY_START_Y = 200;
const ARRAY_ELEM_WIDTH = 50;
const ARRAY_ELEM_HEIGHT = 50;
const RESIZE_ARRAY_START_X = 100;
const RESIZE_ARRAY_START_Y = 300;

const ARRAY_ELEMS_PER_LINE = 14;
const ARRAY_LINE_SPACING = 130;

const TOP_POS_X = 180;
const TOP_POS_Y = 100;
const TOP_LABEL_X = 130;
const TOP_LABEL_Y = 100;

const PUSH_LABEL_X = 50;
const PUSH_LABEL_Y = 30;
const PUSH_ELEMENT_X = 120;
const PUSH_ELEMENT_Y = 30;
const PUSH_RESIZE_LABEL_X = 60;
const PUSH_RESIZE_LABEL_Y = 60;

const SIZE = 7;
const MAX_SIZE = 30;

export default class StackArray extends Algorithm {
	constructor(am, w, h) {
		super(am, w, h);
		this.addControls();
		this.nextIndex = 0;
		this.commands = [];
		this.setup();
	}

	addControls() {
		this.controls = [];
		this.pushField = addControlToAlgorithmBar('Text', '');
		this.pushField.onkeydown = this.returnSubmit(
			this.pushField,
			this.pushCallback.bind(this),
			4,
		);

		this.pushButton = addControlToAlgorithmBar('Button', 'Push');
		this.pushButton.onclick = this.pushCallback.bind(this);
		this.controls.push(this.pushField);
		this.controls.push(this.pushButton);

		addDivisorToAlgorithmBar();

		this.popButton = addControlToAlgorithmBar('Button', 'Pop');
		this.popButton.onclick = this.popCallback.bind(this);
		this.controls.push(this.popButton);

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

		this.arrayID = new Array(SIZE);
		this.arrayLabelID = new Array(SIZE);
		this.arrayData = new Array(SIZE);

		for (let i = 0; i < SIZE; i++) {
			this.arrayID[i] = this.nextIndex++;
			this.arrayLabelID[i] = this.nextIndex++;
		}

		this.topID = this.nextIndex++;
		this.topLabelID = this.nextIndex++;

		this.top = 0;
		this.leftoverLabelID = this.nextIndex++;
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
		this.cmd(act.createLabel, this.topLabelID, 'Size', TOP_LABEL_X, TOP_LABEL_Y);
		this.cmd(
			act.createRectangle,
			this.topID,
			0,
			ARRAY_ELEM_WIDTH,
			ARRAY_ELEM_HEIGHT,
			TOP_POS_X,
			TOP_POS_Y,
		);

		this.cmd(act.createLabel, this.leftoverLabelID, '', PUSH_LABEL_X, PUSH_LABEL_Y);

		this.highlight1ID = this.nextIndex++;
		this.highlight2ID = this.nextIndex++;

		this.animationManager.startNewAnimation(this.commands);
		this.animationManager.skipForward();
		this.animationManager.clearHistory();
	}

	reset() {
		this.top = 0;
		this.nextIndex = 0;
		this.length = SIZE;

		this.arrayID = new Array(SIZE);
		this.arrayLabelID = new Array(SIZE);
		this.arrayData = new Array(SIZE);

		for (let i = 0; i < SIZE; i++) {
			this.arrayID[i] = this.nextIndex++;
			this.arrayLabelID[i] = this.nextIndex++;
		}

		this.nextIndex = this.nextIndex + 3;
		//^ To keep nextIndex in the same place relative to setup()
		this.highlight1ID = this.nextIndex++;
		this.highlight2ID = this.nextIndex++;
	}

	pushCallback() {
		if (this.top < this.arrayData.length && this.pushField.value !== '') {
			const pushVal = this.pushField.value;
			this.pushField.value = '';
			this.implementAction(this.push.bind(this), pushVal);
		} else if (this.top === this.arrayData.length && this.top * 2 < MAX_SIZE) {
			const pushVal = this.pushField.value;
			this.pushField.value = '';
			this.implementAction(this.resize.bind(this), pushVal);
		}
	}

	popCallback() {
		if (this.top > 0) {
			this.implementAction(this.pop.bind(this));
		}
	}

	clearCallback() {
		this.implementAction(this.clearData.bind(this));
	}

	clearData() {
		this.commands = [];
		this.clearAll();
		return this.commands;
	}

	push(elemToPush) {
		this.commands = [];

		this.arrayData[this.top] = elemToPush;

		const labPushID = this.nextIndex++;
		const labPushValID = this.nextIndex++;

		this.cmd(act.setText, this.leftoverLabelID, '');

		this.cmd(act.createLabel, labPushID, 'Pushing Value: ', PUSH_LABEL_X, PUSH_LABEL_Y);
		this.cmd(act.createLabel, labPushValID, elemToPush, PUSH_ELEMENT_X, PUSH_ELEMENT_Y);

		this.cmd(act.step);
		this.cmd(act.createHighlightCircle, this.highlight1ID, '#0000FF', TOP_POS_X, TOP_POS_Y);
		this.cmd(act.step);

		const xpos = (this.top % ARRAY_ELEMS_PER_LINE) * ARRAY_ELEM_WIDTH + ARRAY_START_X;
		const ypos =
			Math.floor(this.top / ARRAY_ELEMS_PER_LINE) * ARRAY_LINE_SPACING + ARRAY_START_Y;

		this.cmd(act.move, this.highlight1ID, xpos, ypos + ARRAY_ELEM_HEIGHT);
		this.cmd(act.step);

		this.cmd(act.move, labPushValID, xpos, ypos);
		this.cmd(act.step);

		this.cmd(act.setText, this.arrayID[this.top], elemToPush);
		this.cmd(act.delete, labPushValID);

		this.cmd(act.delete, this.highlight1ID);

		this.cmd(act.setHighlight, this.topID, 1);
		this.cmd(act.step);
		this.top = this.top + 1;
		this.cmd(act.setText, this.topID, this.top);
		this.cmd(act.delete, labPushID);
		this.cmd(act.step);
		this.cmd(act.setHighlight, this.topID, 0);

		if (elemToPush != null) {
			this.nextIndex = this.nextIndex - 2;
		}

		return this.commands;
	}

	pop() {
		this.commands = [];

		const labPopID = this.nextIndex++;
		const labPopValID = this.nextIndex++;

		this.cmd(act.setText, this.leftoverLabelID, '');

		this.cmd(act.createLabel, labPopID, 'Popped Value: ', PUSH_LABEL_X, PUSH_LABEL_Y);

		this.cmd(act.setHighlight, this.topID, 1);
		this.cmd(act.step);
		this.top = this.top - 1;

		const popVal = this.arrayData[this.top];
		this.arrayData[this.top] = '';

		this.cmd(act.setText, this.topID, this.top);
		this.cmd(act.step);
		this.cmd(act.setHighlight, this.topID, 0);

		this.cmd(act.createHighlightCircle, this.highlight1ID, '#0000FF', TOP_POS_X, TOP_POS_Y);
		this.cmd(act.step);

		const xpos = (this.top % ARRAY_ELEMS_PER_LINE) * ARRAY_ELEM_WIDTH + ARRAY_START_X;
		const ypos =
			Math.floor(this.top / ARRAY_ELEMS_PER_LINE) * ARRAY_LINE_SPACING + ARRAY_START_Y;

		this.cmd(act.move, this.highlight1ID, xpos, ypos + ARRAY_ELEM_HEIGHT);
		this.cmd(act.step);

		this.cmd(act.createLabel, labPopValID, popVal, xpos, ypos);
		this.cmd(act.setText, this.arrayID[this.top], '');
		this.cmd(act.move, labPopValID, PUSH_ELEMENT_X, PUSH_ELEMENT_Y);
		this.cmd(act.step);
		this.cmd(act.delete, labPopID);
		this.cmd(act.delete, this.highlight1ID);
		this.cmd(act.setText, this.leftoverLabelID, 'Popped Value: ' + popVal);
		this.cmd(act.delete, labPopValID);

		this.nextIndex = this.nextIndex - 2;

		return this.commands;
	}

	resize(elemToPush) {
		this.commands = [];

		const labPushID = this.nextIndex++;
		const labPushValID = this.nextIndex++;
		const labPushResizeID = this.nextIndex++;

		this.cmd(act.createLabel, labPushID, 'Pushing Value: ', PUSH_LABEL_X, PUSH_LABEL_Y);
		this.cmd(act.createLabel, labPushValID, elemToPush, PUSH_ELEMENT_X, PUSH_ELEMENT_Y);
		this.cmd(
			act.createLabel,
			labPushResizeID,
			'(Resize Required)',
			PUSH_RESIZE_LABEL_X,
			PUSH_RESIZE_LABEL_Y,
		);
		this.cmd(act.step);

		this.arrayIDNew = new Array(this.top * 2);
		this.arrayLabelIDNew = new Array(this.top * 2);
		this.arrayDataNew = new Array(this.top * 2);

		for (let i = 0; i < this.top * 2; i++) {
			this.arrayIDNew[i] = this.nextIndex++;
			this.arrayLabelIDNew[i] = this.nextIndex++;
			if (i < this.top) {
				this.arrayDataNew[i] = this.arrayData[i];
			}
		}
		this.arrayDataNew[this.top] = elemToPush;

		this.highlight1ID = this.nextIndex++;

		//Create new array
		for (let i = 0; i < this.top * 2; i++) {
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

		this.arrayMoveID = new Array(this.top);

		//Move old array elements to the new array
		for (let i = 0; i < this.top; i++) {
			const xposinit = (i % ARRAY_ELEMS_PER_LINE) * ARRAY_ELEM_WIDTH + ARRAY_START_X;
			const yposinit =
				Math.floor(i / ARRAY_ELEMS_PER_LINE) * ARRAY_LINE_SPACING + ARRAY_START_Y;

			const xpos = (i % ARRAY_ELEMS_PER_LINE) * ARRAY_ELEM_WIDTH + RESIZE_ARRAY_START_X;
			const ypos =
				Math.floor(i / ARRAY_ELEMS_PER_LINE) * ARRAY_LINE_SPACING + RESIZE_ARRAY_START_Y;

			this.arrayMoveID[i] = this.nextIndex++;

			// const display = this.animationManager.objectManager.getText(this.arrayID[i]);
			const display = this.arrayData[i];

			this.cmd(act.createLabel, this.arrayMoveID[i], display, xposinit, yposinit);
			this.cmd(act.move, this.arrayMoveID[i], xpos, ypos);
		}
		this.cmd(act.step);

		//delete movement id objects and set text
		for (let i = 0; i < this.top; i++) {
			// const display = this.animationManager.objectManager.getText(this.arrayID[i]);
			const display = this.arrayData[i];

			this.cmd(act.setText, this.arrayIDNew[i], display);
			this.cmd(act.delete, this.arrayMoveID[i]);
		}
		this.cmd(act.step);

		//Add elemToPush at the index
		this.cmd(
			act.createHighlightCircle,
			this.highlight1ID,
			'#0000FF',
			PUSH_ELEMENT_X,
			PUSH_ELEMENT_Y,
		);
		this.cmd(act.step);

		const xpos =
			(parseInt(this.top) % ARRAY_ELEMS_PER_LINE) * ARRAY_ELEM_WIDTH + RESIZE_ARRAY_START_X;
		const ypos =
			Math.floor(parseInt(this.top) / ARRAY_ELEMS_PER_LINE) * ARRAY_LINE_SPACING +
			RESIZE_ARRAY_START_Y;

		this.cmd(act.move, this.highlight1ID, xpos, ypos);
		this.cmd(act.move, labPushValID, xpos, ypos);
		this.cmd(act.step);

		this.cmd(act.setText, this.arrayIDNew[this.top], elemToPush);
		this.cmd(act.delete, labPushValID);
		this.cmd(act.delete, this.highlight1ID);
		this.cmd(act.step);

		for (let i = 0; i < this.top; i++) {
			this.cmd(act.delete, this.arrayID[i]);
			this.cmd(act.delete, this.arrayLabelID[i]);
		}

		for (let i = 0; i < this.top * 2; i++) {
			const xpos = (i % ARRAY_ELEMS_PER_LINE) * ARRAY_ELEM_WIDTH + ARRAY_START_X;
			const ypos = Math.floor(i / ARRAY_ELEMS_PER_LINE) * ARRAY_LINE_SPACING + ARRAY_START_Y;

			this.cmd(act.move, this.arrayIDNew[i], xpos, ypos);
			this.cmd(act.move, this.arrayLabelIDNew[i], xpos, ypos + ARRAY_ELEM_HEIGHT);
		}
		this.cmd(act.step);

		this.cmd(act.setHighlight, this.topID, 1);
		this.cmd(act.step);

		this.top = this.top + 1;
		this.cmd(act.setText, this.topID, this.top);
		this.cmd(act.delete, labPushID);
		this.cmd(act.delete, labPushResizeID);
		this.cmd(act.step);

		this.cmd(act.setHighlight, this.topID, 0);

		this.arrayID = this.arrayIDNew;
		this.arrayLabelID = this.arrayLabelIDNew;
		this.arrayData = this.arrayDataNew;

		this.nextIndex = this.nextIndex - this.top + 1;

		return this.commands;
	}

	clearAll() {
		this.commands = [];
		for (let i = 0; i < this.top; i++) {
			this.cmd(act.setText, this.arrayID[i], '');
		}
		this.top = 0;
		this.cmd(act.setText, this.topID, '0');
		return this.commands;
	}
}
