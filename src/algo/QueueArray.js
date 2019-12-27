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

import Algorithm, { addControlToAlgorithmBar } from './Algorithm.js';
import { act } from '../anim/AnimationMain';

const ARRAY_START_X = 100;
const ARRAY_START_Y = 200;
const ARRAY_ELEM_WIDTH = 50;
const ARRAY_ELEM_HEIGHT = 50;

const ARRRAY_ELEMS_PER_LINE = 15;
const ARRAY_LINE_SPACING = 130;

const HEAD_POS_X = 180;
const HEAD_POS_Y = 100;
const HEAD_LABEL_X = 130;
const HEAD_LABEL_Y = 100;

const TAIL_POS_X = 280;
const TAIL_POS_Y = 100;
const TAIL_LABEL_X = 230;
const TAIL_LABEL_Y = 100;

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
		//this.tail_pos_y = h - LINKED_LIST_ELEM_HEIGHT;
		//	this.tail_label_y = this.tail_pos_y;
		this.setup();
		this.initialIndex = this.nextIndex;
	}

	addControls() {
		this.controls = [];
		this.enqueueField = addControlToAlgorithmBar('Text', '');
		this.enqueueField.onkeydown = this.returnSubmit(
			this.enqueueField,
			this.enqueueCallback.bind(this),
			6
		);
		this.enqueueButton = addControlToAlgorithmBar('Button', 'Enqueue');
		this.enqueueButton.onclick = this.enqueueCallback.bind(this);
		this.controls.push(this.enqueueField);
		this.controls.push(this.enqueueButton);

		this.dequeueButton = addControlToAlgorithmBar('Button', 'Dequeue');
		this.dequeueButton.onclick = this.dequeueCallback.bind(this);
		this.controls.push(this.dequeueButton);

		this.clearButton = addControlToAlgorithmBar('Button', 'Clear Queue');
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
		this.headID = this.nextIndex++;
		const headLabelID = this.nextIndex++;
		this.tailID = this.nextIndex++;
		const tailLabelID = this.nextIndex++;

		this.arrayData = new Array(SIZE);
		this.head = 0;
		this.tail = 0;
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
				ypos
			);
			this.cmd(act.createLabel, this.arrayLabelID[i], i, xpos, ypos + ARRAY_ELEM_HEIGHT);
			this.cmd(act.setForegroundColor, this.arrayLabelID[i], INDEX_COLOR);
		}
		this.cmd(act.createLabel, headLabelID, 'Head', HEAD_LABEL_X, HEAD_LABEL_Y);
		this.cmd(
			act.createRectangle,
			this.headID,
			0,
			ARRAY_ELEM_WIDTH,
			ARRAY_ELEM_HEIGHT,
			HEAD_POS_X,
			HEAD_POS_Y
		);

		this.cmd(act.createLabel, tailLabelID, 'Tail', TAIL_LABEL_X, TAIL_LABEL_Y);
		this.cmd(
			act.createRectangle,
			this.tailID,
			0,
			ARRAY_ELEM_WIDTH,
			ARRAY_ELEM_HEIGHT,
			TAIL_POS_X,
			TAIL_POS_Y
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
		if ((this.tail + 1) % SIZE !== this.head && this.enqueueField.value !== '') {
			const pushVal = this.enqueueField.value;
			this.enqueueField.value = '';
			this.implementAction(this.enqueue.bind(this), pushVal);
		}
	}

	dequeueCallback() {
		if (this.tail !== this.head) {
			this.implementAction(this.dequeue.bind(this), '');
		}
	}

	clearCallback() {
		this.implementAction(this.clearAll.bind(this), '');
	}

	enqueue(elemToEnqueue) {
		this.commands = [];

		const labEnqueueID = this.nextIndex++;
		const labEnqueueValID = this.nextIndex++;
		this.arrayData[this.tail] = elemToEnqueue;
		this.cmd(act.setText, this.leftoverLabelID, '');

		this.cmd(act.createLabel, labEnqueueID, 'Enqueuing Value: ', QUEUE_LABEL_X, QUEUE_LABEL_Y);
		this.cmd(act.createLabel, labEnqueueValID, elemToEnqueue, QUEUE_ELEMENT_X, QUEUE_ELEMENT_Y);

		this.cmd(act.step);
		this.cmd(act.createHighlightCircle, this.highlight1ID, INDEX_COLOR, TAIL_POS_X, TAIL_POS_Y);
		this.cmd(act.step);

		const xpos = (this.tail % ARRRAY_ELEMS_PER_LINE) * ARRAY_ELEM_WIDTH + ARRAY_START_X;
		const ypos =
			Math.floor(this.tail / ARRRAY_ELEMS_PER_LINE) * ARRAY_LINE_SPACING + ARRAY_START_Y;

		this.cmd(act.move, this.highlight1ID, xpos, ypos + ARRAY_ELEM_HEIGHT);
		this.cmd(act.step);

		this.cmd(act.move, labEnqueueValID, xpos, ypos);
		this.cmd(act.step);

		this.cmd(act.setText, this.arrayID[this.tail], elemToEnqueue);
		this.cmd(act.delete, labEnqueueValID);

		this.cmd(act.delete, this.highlight1ID);

		this.cmd(act.setHighlight, this.tailID, 1);
		this.cmd(act.step);
		this.tail = (this.tail + 1) % SIZE;
		this.cmd(act.setText, this.tailID, this.tail);
		this.cmd(act.step);
		this.cmd(act.setHighlight, this.tailID, 0);
		this.cmd(act.delete, labEnqueueID);

		return this.commands;
	}

	dequeue() {
		this.commands = [];

		const labDequeueID = this.nextIndex++;
		const labDequeueValID = this.nextIndex++;

		this.cmd(act.setText, this.leftoverLabelID, '');

		this.cmd(act.createLabel, labDequeueID, 'Dequeued Value: ', QUEUE_LABEL_X, QUEUE_LABEL_Y);

		this.cmd(act.createHighlightCircle, this.highlight1ID, INDEX_COLOR, HEAD_POS_X, HEAD_POS_Y);
		this.cmd(act.step);

		const xpos = (this.head % ARRRAY_ELEMS_PER_LINE) * ARRAY_ELEM_WIDTH + ARRAY_START_X;
		const ypos =
			Math.floor(this.head / ARRRAY_ELEMS_PER_LINE) * ARRAY_LINE_SPACING + ARRAY_START_Y;

		this.cmd(act.move, this.highlight1ID, xpos, ypos + ARRAY_ELEM_HEIGHT);
		this.cmd(act.step);

		this.cmd(act.delete, this.highlight1ID);

		const dequeuedVal = this.arrayData[this.head];
		this.cmd(act.createLabel, labDequeueValID, dequeuedVal, xpos, ypos);
		this.cmd(act.setText, this.arrayID[this.head], '');
		this.cmd(act.move, labDequeueValID, QUEUE_ELEMENT_X, QUEUE_ELEMENT_Y);
		this.cmd(act.step);

		this.cmd(act.setHighlight, this.headID, 1);
		this.cmd(act.step);
		this.head = (this.head + 1) % SIZE;
		this.cmd(act.setText, this.headID, this.head);
		this.cmd(act.step);
		this.cmd(act.setHighlight, this.headID, 0);

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
		this.head = 0;
		this.tail = 0;
		this.cmd(act.setText, this.headID, '0');
		this.cmd(act.setText, this.tailID, '0');
		return this.commands;
	}
}
