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

const LINKED_LIST_START_X = 100;
const LINKED_LIST_START_Y = 200;
const LINKED_LIST_ELEM_WIDTH = 70;
const LINKED_LIST_ELEM_HEIGHT = 30;

const LINKED_LIST_INSERT_X = 250;
const LINKED_LIST_INSERT_Y = 50;

const LINKED_LIST_ELEMS_PER_LINE = 8;
const LINKED_LIST_ELEM_SPACING = 100;
const LINKED_LIST_LINE_SPACING = 100;

const TOP_POS_X = 180;
const TOP_POS_Y = 100;
const TOP_LABEL_X = 130;
const TOP_LABEL_Y = 100;

const TOP_ELEM_WIDTH = 30;
const TOP_ELEM_HEIGHT = 30;

const TAIL_POS_X = 180;
const TAIL_LABEL_X = 130;

const PUSH_LABEL_X = 50;
const PUSH_LABEL_Y = 30;
const PUSH_ELEMENT_X = 120;
const PUSH_ELEMENT_Y = 30;

const SIZE = 32;

export default class QueueLL extends Algorithm {
	constructor(am, w, h) {
		super(am, w, h);

		this.addControls();
		this.nextIndex = 0;
		this.commands = [];
		this.tail_pos_y = h - LINKED_LIST_ELEM_HEIGHT;
		this.tail_label_y = this.tail_pos_y;
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
		this.linkedListElemID = new Array(SIZE);
		for (let i = 0; i < SIZE; i++) {
			this.linkedListElemID[i] = this.nextIndex++;
		}
		this.headID = this.nextIndex++;
		this.headLabelID = this.nextIndex++;

		this.tailID = this.nextIndex++;
		this.tailLabelID = this.nextIndex++;

		this.arrayData = new Array(SIZE);
		this.top = 0;
		this.leftoverLabelID = this.nextIndex++;

		this.cmd('CreateLabel', this.headLabelID, 'Head', TOP_LABEL_X, TOP_LABEL_Y);
		this.cmd(
			'CreateRectangle',
			this.headID,
			'',
			TOP_ELEM_WIDTH,
			TOP_ELEM_HEIGHT,
			TOP_POS_X,
			TOP_POS_Y
		);
		this.cmd('SetNull', this.headID, 1);

		this.cmd('CreateLabel', this.tailLabelID, 'Tail', TAIL_LABEL_X, this.tail_label_y);
		this.cmd(
			'CreateRectangle',
			this.tailID,
			'',
			TOP_ELEM_WIDTH,
			TOP_ELEM_HEIGHT,
			TAIL_POS_X,
			this.tail_pos_y
		);
		this.cmd('SetNull', this.tailID, 1);

		this.cmd('CreateLabel', this.leftoverLabelID, '', 5, PUSH_LABEL_Y, 0);

		this.animationManager.StartNewAnimation(this.commands);
		this.animationManager.skipForward();
		this.animationManager.clearHistory();
	}

	resetLinkedListPositions() {
		for (let i = this.top - 1; i >= 0; i--) {
			const nextX =
				((this.top - 1 - i) % LINKED_LIST_ELEMS_PER_LINE) * LINKED_LIST_ELEM_SPACING +
				LINKED_LIST_START_X;
			const nextY =
				Math.floor((this.top - 1 - i) / LINKED_LIST_ELEMS_PER_LINE) *
					LINKED_LIST_LINE_SPACING +
				LINKED_LIST_START_Y;
			this.cmd('Move', this.linkedListElemID[i], nextX, nextY);
		}
	}

	reset() {
		this.top = 0;
		this.nextIndex = this.initialIndex;
	}

	enqueueCallback() {
		if (this.top < SIZE && this.enqueueField.value !== '') {
			const pushVal = this.enqueueField.value;
			this.enqueueField.value = '';
			this.implementAction(this.enqueue.bind(this), pushVal);
		}
	}

	dequeueCallback() {
		if (this.top > 0) {
			this.implementAction(this.dequeue.bind(this), '');
		}
	}

	clearCallback() {
		this.implementAction(this.clearAll.bind(this), '');
	}

	enqueue(elemToPush) {
		this.commands = [];

		this.arrayData[this.top] = elemToPush;

		this.cmd('SetText', this.leftoverLabelID, '');

		for (let i = this.top; i > 0; i--) {
			this.arrayData[i] = this.arrayData[i - 1];
			this.linkedListElemID[i] = this.linkedListElemID[i - 1];
		}
		this.arrayData[0] = elemToPush;
		this.linkedListElemID[0] = this.nextIndex++;

		const labPushID = this.nextIndex++;
		const labPushValID = this.nextIndex++;
		this.cmd(
			'CreateLinkedList',
			this.linkedListElemID[0],
			'',
			LINKED_LIST_ELEM_WIDTH,
			LINKED_LIST_ELEM_HEIGHT,
			LINKED_LIST_INSERT_X,
			LINKED_LIST_INSERT_Y,
			0.25,
			0,
			1,
			1
		);

		this.cmd('SetNull', this.linkedListElemID[0], 1);
		this.cmd('CreateLabel', labPushID, 'Enqueuing Value: ', PUSH_LABEL_X, PUSH_LABEL_Y);
		this.cmd('CreateLabel', labPushValID, elemToPush, PUSH_ELEMENT_X, PUSH_ELEMENT_Y);

		this.cmd('Step');

		this.cmd('Move', labPushValID, LINKED_LIST_INSERT_X, LINKED_LIST_INSERT_Y);

		this.cmd('Step');
		this.cmd('SetText', this.linkedListElemID[0], elemToPush);
		this.cmd('Delete', labPushValID);

		if (this.top === 0) {
			this.cmd('SetNull', this.headID, 0);
			this.cmd('SetNull', this.tailID, 0);
			this.cmd('connect', this.headID, this.linkedListElemID[this.top]);
			this.cmd('connect', this.tailID, this.linkedListElemID[this.top]);
		} else {
			this.cmd('SetNull', this.linkedListElemID[1], 0);
			this.cmd('Connect', this.linkedListElemID[1], this.linkedListElemID[0]);
			this.cmd('Step');
			this.cmd('Disconnect', this.tailID, this.linkedListElemID[1]);
		}
		this.cmd('Connect', this.tailID, this.linkedListElemID[0]);

		this.cmd('Step');
		this.top = this.top + 1;
		this.resetLinkedListPositions();
		this.cmd('Delete', labPushID);
		this.cmd('Step');

		return this.commands;
	}

	dequeue() {
		this.commands = [];

		const labPopID = this.nextIndex++;
		const labPopValID = this.nextIndex++;

		this.cmd('SetText', this.leftoverLabelID, '');

		this.cmd('CreateLabel', labPopID, 'Dequeued Value: ', PUSH_LABEL_X, PUSH_LABEL_Y);
		this.cmd(
			'CreateLabel',
			labPopValID,
			this.arrayData[this.top - 1],
			LINKED_LIST_START_X,
			LINKED_LIST_START_Y
		);

		this.cmd('Move', labPopValID, PUSH_ELEMENT_X, PUSH_ELEMENT_Y);
		this.cmd('Step');
		this.cmd('Disconnect', this.headID, this.linkedListElemID[this.top - 1]);

		if (this.top === 1) {
			this.cmd('SetNull', this.headID, 1);
			this.cmd('SetNull', this.tailID, 1);
			this.cmd('Disconnect', this.tailID, this.linkedListElemID[this.top - 1]);
		} else {
			this.cmd('Connect', this.headID, this.linkedListElemID[this.top - 2]);
		}
		this.cmd('Step');
		this.cmd('Delete', this.linkedListElemID[this.top - 1]);
		this.top = this.top - 1;
		this.resetLinkedListPositions();

		this.cmd('Delete', labPopValID);
		this.cmd('Delete', labPopID);
		this.cmd('SetText', this.leftoverLabelID, 'Dequeued Value: ' + this.arrayData[this.top]);

		return this.commands;
	}

	clearAll() {
		this.commands = [];
		for (let i = 0; i < this.top; i++) {
			this.cmd('Delete', this.linkedListElemID[i]);
		}
		this.top = 0;
		this.cmd('SetNull', this.headID, 1);
		return this.commands;
	}
}
