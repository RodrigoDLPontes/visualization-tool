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

const ARRRAY_ELEMS_PER_LINE = 15;
const ARRAY_LINE_SPACING = 130;

const FRONT_POS_X = 180;
const FRONT_POS_Y = 100;
const FRONT_LABEL_X = 130;
const FRONT_LABEL_Y = 100;

const SIZE_POS_X = 280;
const SIZE_POS_Y = 100;
const SIZE_LABEL_X = 230;
const SIZE_LABEL_Y = 100;

const QUEUE_LABEL_X = 50;
const QUEUE_LABEL_Y = 30;
const QUEUE_ELEMENT_X = 120;
const QUEUE_ELEMENT_Y = 30;

const INDEX_COLOR = '#0000FF';

const SIZE = 15;

export default class QueueArray extends Algorithm {
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
		this.enqueueField = addControlToAlgorithmBar('Text', '');
		this.enqueueField.onkeydown = this.returnSubmit(
			this.enqueueField,
			this.enqueueCallback.bind(this),
			4,
		);

		this.enqueueButton = addControlToAlgorithmBar('Button', 'Enqueue');
		this.enqueueButton.onclick = this.enqueueCallback.bind(this);
		this.controls.push(this.enqueueField);
		this.controls.push(this.enqueueButton);

		addDivisorToAlgorithmBar();

		this.dequeueButton = addControlToAlgorithmBar('Button', 'Dequeue');
		this.dequeueButton.onclick = this.dequeueCallback.bind(this);
		this.controls.push(this.dequeueButton);

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
		for (let i = 0; i < SIZE; i++) {
			this.arrayID[i] = this.nextIndex++;
			this.arrayLabelID[i] = this.nextIndex++;
		}
		this.frontID = this.nextIndex++;
		const frontLabelID = this.nextIndex++;
		this.sizeID = this.nextIndex++;
		const sizeLabelID = this.nextIndex++;

		this.arrayData = new Array(SIZE);
		this.front = 0;
		this.size = 0;
		this.leftoverLabelID = this.nextIndex++;

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

		this.cmd(act.createLabel, this.leftoverLabelID, '', QUEUE_LABEL_X, QUEUE_LABEL_Y);

		this.initialIndex = this.nextIndex;

		this.highlight1ID = this.nextIndex++;
		this.highlight2ID = this.nextIndex++;

		this.animationManager.startNewAnimation(this.commands);
		this.animationManager.skipForward();
		this.animationManager.clearHistory();
	}

	reset() {
		this.top = 0;
		this.nextIndex = this.initialIndex;
	}

	enqueueCallback() {
		if ((this.size + 1) % SIZE !== this.front && this.enqueueField.value !== '') {
			const pushVal = this.enqueueField.value;
			this.enqueueField.value = '';
			this.implementAction(this.enqueue.bind(this), pushVal);
		}
	}

	dequeueCallback() {
		if (this.size !== this.front) {
			this.implementAction(this.dequeue.bind(this));
		}
	}

	clearCallback() {
		this.implementAction(this.clearAll.bind(this));
	}

	enqueue(elemToEnqueue) {
		this.commands = [];

		const labEnqueueID = this.nextIndex++;
		const labEnqueueValID = this.nextIndex++;
		this.arrayData[this.size] = elemToEnqueue;
		this.cmd(act.setText, this.leftoverLabelID, '');

		this.cmd(act.createLabel, labEnqueueID, 'Enqueuing Value: ', QUEUE_LABEL_X, QUEUE_LABEL_Y);
		this.cmd(act.createLabel, labEnqueueValID, elemToEnqueue, QUEUE_ELEMENT_X, QUEUE_ELEMENT_Y);

		this.cmd(act.step);
		this.cmd(act.createHighlightCircle, this.highlight1ID, INDEX_COLOR, SIZE_POS_X, SIZE_POS_Y);
		this.cmd(act.step);

		const xpos = (this.size % ARRRAY_ELEMS_PER_LINE) * ARRAY_ELEM_WIDTH + ARRAY_START_X;
		const ypos =
			Math.floor(this.size / ARRRAY_ELEMS_PER_LINE) * ARRAY_LINE_SPACING + ARRAY_START_Y;

		this.cmd(act.move, this.highlight1ID, xpos, ypos + ARRAY_ELEM_HEIGHT);
		this.cmd(act.step);

		this.cmd(act.move, labEnqueueValID, xpos, ypos);
		this.cmd(act.step);

		this.cmd(act.setText, this.arrayID[this.size], elemToEnqueue);
		this.cmd(act.delete, labEnqueueValID);

		this.cmd(act.delete, this.highlight1ID);

		this.cmd(act.setHighlight, this.sizeID, 1);
		this.cmd(act.step);
		this.size = (this.size + 1) % SIZE;
		this.cmd(act.setText, this.sizeID, this.size);
		this.cmd(act.step);
		this.cmd(act.setHighlight, this.sizeID, 0);
		this.cmd(act.delete, labEnqueueID);

		return this.commands;
	}

	dequeue() {
		this.commands = [];

		const labDequeueID = this.nextIndex++;
		const labDequeueValID = this.nextIndex++;

		this.cmd(act.setText, this.leftoverLabelID, '');

		this.cmd(act.createLabel, labDequeueID, 'Dequeued Value: ', QUEUE_LABEL_X, QUEUE_LABEL_Y);

		this.cmd(act.createHighlightCircle, this.highlight1ID, INDEX_COLOR, FRONT_POS_X, FRONT_POS_Y);
		this.cmd(act.step);

		const xpos = (this.front % ARRRAY_ELEMS_PER_LINE) * ARRAY_ELEM_WIDTH + ARRAY_START_X;
		const ypos =
			Math.floor(this.front / ARRRAY_ELEMS_PER_LINE) * ARRAY_LINE_SPACING + ARRAY_START_Y;

		this.cmd(act.move, this.highlight1ID, xpos, ypos + ARRAY_ELEM_HEIGHT);
		this.cmd(act.step);

		this.cmd(act.delete, this.highlight1ID);

		const dequeuedVal = this.arrayData[this.front];
		this.cmd(act.createLabel, labDequeueValID, dequeuedVal, xpos, ypos);
		this.cmd(act.setText, this.arrayID[this.front], '');
		this.cmd(act.move, labDequeueValID, QUEUE_ELEMENT_X, QUEUE_ELEMENT_Y);
		this.cmd(act.step);

		this.cmd(act.setHighlight, this.frontID, 1);
		this.cmd(act.step);
		this.front = (this.front + 1) % SIZE;
		this.cmd(act.setText, this.frontID, this.front);
		this.cmd(act.step);
		this.cmd(act.setHighlight, this.frontID, 0);

		this.cmd(act.setText, this.leftoverLabelID, 'Dequeued Value: ' + dequeuedVal);

		this.cmd(act.delete, labDequeueID);
		this.cmd(act.delete, labDequeueValID);

		return this.commands;
	}

	clearAll() {
		this.commands = [];
		this.cmd(act.setText, this.leftoverLabelID, '');

		for (let i = 0; i < SIZE; i++) {
			this.cmd(act.setText, this.arrayID[i], '');
		}
		this.front = 0;
		this.size = 0;
		this.cmd(act.setText, this.frontID, '0');
		this.cmd(act.setText, this.sizeID, '0');
		return this.commands;
	}
}
