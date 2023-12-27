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
import pseudocodeText from '../pseudocode.json';

const LINKED_LIST_START_X = 100;
const LINKED_LIST_START_Y = 225;
const LINKED_LIST_ELEM_WIDTH = 70;
const LINKED_LIST_ELEM_HEIGHT = 30;

const LINKED_LIST_INSERT_X = 250;
const LINKED_LIST_INSERT_Y = 100;

const LINKED_LIST_ELEMS_PER_LINE = 12;
const LINKED_LIST_ELEM_SPACING = 100;
const LINKED_LIST_LINE_SPACING = 100;

const TOP_POS_X = 180;
const TOP_POS_Y = 100;
const TOP_LABEL_X = 130;
const TOP_LABEL_Y = 100;

const TOP_ELEM_WIDTH = 30;
const TOP_ELEM_HEIGHT = 30;

const TAIL_POS_X = 180;
const TAIL_POS_Y = 335;
const TAIL_LABEL_X = 130;

const QUEUE_LABEL_X = 60;
const QUEUE_LABEL_Y = 30;
const QUEUE_ELEMENT_X = 130;
const QUEUE_ELEMENT_Y = 30;

const CODE_START_X = 330;
const CODE_START_Y = 30;

const SIZE = 32;

export default class QueueLL extends Algorithm {
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
		this.enqueueField.style.textAlign = 'center';
		this.enqueueField.onkeydown = this.returnSubmit(
			this.enqueueField,
			this.enqueueCallback.bind(this),
			4,
			true,
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
		this.leftoverValID = this.nextIndex++;

		this.cmd(act.createLabel, this.headLabelID, 'Head', TOP_LABEL_X, TOP_LABEL_Y);
		this.cmd(
			act.createRectangle,
			this.headID,
			'',
			TOP_ELEM_WIDTH,
			TOP_ELEM_HEIGHT,
			TOP_POS_X,
			TOP_POS_Y,
		);
		this.cmd(act.setNull, this.headID, 1);

		this.cmd(act.createLabel, this.tailLabelID, 'Tail', TAIL_LABEL_X, TAIL_POS_Y);
		this.cmd(
			act.createRectangle,
			this.tailID,
			'',
			TOP_ELEM_WIDTH,
			TOP_ELEM_HEIGHT,
			TAIL_POS_X,
			TAIL_POS_Y,
		);
		this.cmd(act.setNull, this.tailID, 1);

		this.cmd(act.createLabel, this.leftoverLabelID, '', QUEUE_LABEL_X, QUEUE_LABEL_Y);
		this.cmd(act.createLabel, this.leftoverValID, '', QUEUE_ELEMENT_X, QUEUE_ELEMENT_Y);

		this.pseudocode = pseudocodeText.QueueLL;
		this.enqueueCodeID = this.addCodeToCanvasBaseAll(
			this.pseudocode,
			'enqueue',
			CODE_START_X,
			CODE_START_Y,
		);
		this.dequeueCodeID = this.addCodeToCanvasBaseAll(
			this.pseudocode,
			'dequeue',
			CODE_START_X + 285,
			CODE_START_Y,
		);

		this.animationManager.startNewAnimation(this.commands);
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
			this.cmd(act.move, this.linkedListElemID[i], nextX, nextY);
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
		} else {
			this.shake(this.enqueueButton);
		}
	}

	dequeueCallback() {
		if (this.top > 0) {
			this.implementAction(this.dequeue.bind(this));
		} else {
			this.shake(this.dequeueButton);
		}
	}

	randomCallback() {
		const LOWER_BOUND = 0;
		const UPPER_BOUND = 16;
		const MAX_SIZE = 7;
		const MIN_SIZE = 2;
		const randomSize = Math.floor(Math.random() * (MAX_SIZE - MIN_SIZE + 1)) + MIN_SIZE;
		const set = new Set();

		this.implementAction(this.clearAll.bind(this));

		for (let i = 0; i < randomSize; i++) {
			const val = Math.floor(Math.random() * (UPPER_BOUND - LOWER_BOUND + 1)) + LOWER_BOUND;
			if (set.has(val)) {
				i--;
			} else {
				set.add(val);
				this.implementAction(this.enqueue.bind(this), val);
			}

			this.animationManager.skipForward();
			this.animationManager.clearHistory();
		}
	}

	clearCallback() {
		this.implementAction(this.clearAll.bind(this));
	}

	enqueue(elemToPush) {
		this.commands = [];

		this.arrayData[this.top] = elemToPush;

		this.highlight(0, 0, this.enqueueCodeID);
		this.cmd(act.setText, this.leftoverLabelID, '');
		this.cmd(act.setText, this.leftoverValID, '');
		this.cmd(act.step);

		for (let i = this.top; i > 0; i--) {
			this.arrayData[i] = this.arrayData[i - 1];
			this.linkedListElemID[i] = this.linkedListElemID[i - 1];
		}
		this.arrayData[0] = elemToPush;
		this.linkedListElemID[0] = this.nextIndex++;

		const labPushID = this.nextIndex++;
		const labPushValID = this.nextIndex++;
		this.highlight(1, 0, this.enqueueCodeID);
		this.cmd(
			act.createLinkedListNode,
			this.linkedListElemID[0],
			'',
			LINKED_LIST_ELEM_WIDTH,
			LINKED_LIST_ELEM_HEIGHT,
			LINKED_LIST_INSERT_X,
			LINKED_LIST_INSERT_Y,
			0.25,
			0,
			1,
		);

		this.cmd(act.setNull, this.linkedListElemID[0], 1);
		this.cmd(act.createLabel, labPushID, 'Enqueuing Value: ', QUEUE_LABEL_X, QUEUE_LABEL_Y);
		this.cmd(act.createLabel, labPushValID, elemToPush, QUEUE_ELEMENT_X, QUEUE_ELEMENT_Y);
		this.cmd(act.step);

		this.cmd(act.move, labPushValID, LINKED_LIST_INSERT_X, LINKED_LIST_INSERT_Y);
		this.cmd(act.setText, this.linkedListElemID[0], elemToPush);
		this.cmd(act.delete, labPushValID);
		this.cmd(act.step);

		this.unhighlight(1, 0, this.enqueueCodeID);
		if (this.top === 0) {
			this.highlight(2, 0, this.enqueueCodeID);
			this.highlight(3, 0, this.enqueueCodeID);
			this.cmd(act.setNull, this.headID, 0);
			this.cmd(act.setNull, this.tailID, 0);
			this.cmd(act.connect, this.headID, this.linkedListElemID[this.top]);
			this.cmd(act.connect, this.tailID, this.linkedListElemID[this.top]);
			this.cmd(act.step);
		} else {
			this.highlight(4, 0, this.enqueueCodeID);
			this.highlight(5, 0, this.enqueueCodeID);
			this.cmd(act.setNull, this.linkedListElemID[1], 0);
			this.cmd(act.connect, this.linkedListElemID[1], this.linkedListElemID[0]);
			this.cmd(act.step);
		}

		this.top = this.top + 1;
		this.resetLinkedListPositions();
		this.cmd(act.step);
		this.unhighlight(2, 0, this.enqueueCodeID);
		this.unhighlight(3, 0, this.enqueueCodeID);
		this.unhighlight(4, 0, this.enqueueCodeID);
		this.unhighlight(5, 0, this.enqueueCodeID);
		this.highlight(6, 0, this.enqueueCodeID);

		this.cmd(act.disconnect, this.tailID, this.linkedListElemID[1]);
		this.cmd(act.connect, this.tailID, this.linkedListElemID[0]);
		this.cmd(act.step);
		this.unhighlight(6, 0, this.enqueueCodeID);
		this.highlight(7, 0, this.enqueueCodeID);
		this.cmd(act.step);

		this.cmd(act.delete, labPushID);
		this.unhighlight(7, 0, this.enqueueCodeID);
		this.unhighlight(0, 0, this.enqueueCodeID);
		return this.commands;
	}

	dequeue() {
		this.commands = [];

		const labPopID = this.nextIndex++;
		const labPopValID = this.nextIndex++;

		this.highlight(0, 0, this.dequeueCodeID);
		this.cmd(act.setText, this.leftoverLabelID, '');
		this.cmd(act.step);

		this.highlight(1, 0, this.dequeueCodeID);
		this.cmd(act.createLabel, labPopID, 'Dequeued Value: ', QUEUE_LABEL_X, QUEUE_LABEL_Y);
		this.cmd(
			act.createLabel,
			labPopValID,
			this.arrayData[this.top - 1],
			LINKED_LIST_START_X,
			LINKED_LIST_START_Y,
		);

		this.cmd(act.move, labPopValID, QUEUE_ELEMENT_X, QUEUE_ELEMENT_Y);
		this.cmd(act.step);

		this.unhighlight(1, 0, this.dequeueCodeID);
		this.cmd(act.disconnect, this.headID, this.linkedListElemID[this.top - 1]);

		if (this.top === 1) {
			this.highlight(2, 0, this.dequeueCodeID);
			this.highlight(3, 0, this.dequeueCodeID);
			this.highlight(4, 0, this.dequeueCodeID);
			this.cmd(act.setNull, this.headID, 1);
			this.cmd(act.setNull, this.tailID, 1);
			this.cmd(act.disconnect, this.tailID, this.linkedListElemID[this.top - 1]);
		} else {
			this.highlight(5, 0, this.dequeueCodeID);
			this.highlight(6, 0, this.dequeueCodeID);
			this.cmd(act.connect, this.headID, this.linkedListElemID[this.top - 2]);
		}
		this.cmd(act.step);

		this.unhighlight(2, 0, this.dequeueCodeID);
		this.unhighlight(3, 0, this.dequeueCodeID);
		this.unhighlight(4, 0, this.dequeueCodeID);
		this.unhighlight(5, 0, this.dequeueCodeID);
		this.unhighlight(6, 0, this.dequeueCodeID);
		this.highlight(7, 0, this.dequeueCodeID);
		this.highlight(8, 0, this.dequeueCodeID);
		this.cmd(act.delete, this.linkedListElemID[this.top - 1]);
		this.top = this.top - 1;
		this.resetLinkedListPositions();
		this.cmd(act.step);

		this.unhighlight(8, 0, this.dequeueCodeID);
		this.unhighlight(7, 0, this.dequeueCodeID);
		this.unhighlight(0, 0, this.dequeueCodeID);
		this.cmd(act.delete, labPopValID);
		this.cmd(act.delete, labPopID);

		return this.commands;
	}

	clearAll() {
		this.enqueueField.value = '';
		this.commands = [];
		for (let i = 0; i < this.top; i++) {
			this.cmd(act.delete, this.linkedListElemID[i]);
		}
		this.top = 0;
		this.cmd(act.setNull, this.headID, 1);
		this.cmd(act.setNull, this.tailID, 1);
		return this.commands;
	}
}
