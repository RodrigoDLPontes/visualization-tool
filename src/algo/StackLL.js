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
const LINKED_LIST_START_Y = 250;
const LINKED_LIST_ELEM_WIDTH = 70;
const LINKED_LIST_ELEM_HEIGHT = 30;

const LINKED_LIST_INSERT_X = 250;
const LINKED_LIST_INSERT_Y = 50;

const LINKED_LIST_ELEMS_PER_LINE = 12;
const LINKED_LIST_ELEM_SPACING = 100;
const LINKED_LIST_LINE_SPACING = 100;

const TOP_POS_X = 180;
const TOP_POS_Y = 135;
const TOP_LABEL_X = 130;
const TOP_LABEL_Y = 135;

const TOP_ELEM_WIDTH = 30;
const TOP_ELEM_HEIGHT = 30;

const PUSH_LABEL_X = 50;
const PUSH_LABEL_Y = 30;
const PUSH_ELEMENT_X = 120;
const PUSH_ELEMENT_Y = 30;

const CODE_START_X = 400;
const CODE_START_Y = 25;

const SIZE = 32;

export default class StackLL extends Algorithm {
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
		this.pushField = addControlToAlgorithmBar('Text', '');
		this.pushField.style.textAlign = 'center';
		this.pushField.onkeydown = this.returnSubmit(
			this.pushField,
			this.pushCallback.bind(this),
			4,
			true,
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
		this.topID = this.nextIndex++;
		this.topLabelID = this.nextIndex++;

		this.arrayData = new Array(SIZE);
		this.top = 0;
		this.leftoverLabelID = this.nextIndex++;
		this.leftoverValID = this.nextIndex++;

		this.cmd(act.createLabel, this.topLabelID, 'Head', TOP_LABEL_X, TOP_LABEL_Y);
		this.cmd(
			act.createRectangle,
			this.topID,
			'',
			TOP_ELEM_WIDTH,
			TOP_ELEM_HEIGHT,
			TOP_POS_X,
			TOP_POS_Y,
		);
		this.cmd(act.setNull, this.topID, 1);

		this.cmd(act.createLabel, this.leftoverLabelID, '', PUSH_LABEL_X, PUSH_LABEL_Y);
		this.cmd(act.createLabel, this.leftoverValID, '', PUSH_ELEMENT_X, PUSH_ELEMENT_Y);

		this.pseudocode = pseudocodeText.StackLL;
		this.pushCodeID = this.addCodeToCanvasBaseAll(
			this.pseudocode,
			'push',
			CODE_START_X,
			CODE_START_Y,
		);
		this.popCodeID = this.addCodeToCanvasBaseAll(
			this.pseudocode,
			'pop',
			CODE_START_X + 325,
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

	pushCallback() {
		if (this.top < SIZE && this.pushField.value !== '') {
			const pushVal = this.pushField.value;
			this.pushField.value = '';
			this.implementAction(this.push.bind(this), pushVal);
		} else {
			this.shake(this.pushButton);
		}
	}

	popCallback() {
		if (this.top > 0) {
			this.implementAction(this.pop.bind(this));
		} else {
			this.shake(this.popButton);
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
				this.implementAction(this.push.bind(this), val);
			}
			this.animationManager.skipForward();
			this.animationManager.clearHistory();
		}
	}

	clearCallback() {
		this.implementAction(this.clearAll.bind(this));
	}

	push(elemToPush) {
		this.commands = [];

		const labPushID = this.nextIndex++;
		const labPushValID = this.nextIndex++;
		this.arrayData[this.top] = elemToPush;

		this.cmd(act.setText, this.leftoverLabelID, '');
		this.cmd(act.setText, this.leftoverValID, '');
		this.highlight(1, 0, this.pushCodeID);

		this.cmd(
			act.createLinkedListNode,
			this.linkedListElemID[this.top],
			'',
			LINKED_LIST_ELEM_WIDTH,
			LINKED_LIST_ELEM_HEIGHT,
			LINKED_LIST_INSERT_X,
			LINKED_LIST_INSERT_Y,
			0.25,
			0,
			1,
		);

		this.cmd(act.createLabel, labPushID, 'Pushing Value: ', PUSH_LABEL_X, PUSH_LABEL_Y);
		this.cmd(act.createLabel, labPushValID, elemToPush, PUSH_ELEMENT_X, PUSH_ELEMENT_Y);

		this.cmd(act.step);

		this.cmd(act.move, labPushValID, LINKED_LIST_INSERT_X, LINKED_LIST_INSERT_Y);

		this.cmd(act.step);
		this.cmd(act.setText, this.linkedListElemID[this.top], elemToPush);
		this.cmd(act.delete, labPushValID);

		this.unhighlight(1, 0, this.pushCodeID);
		if (this.top === 0) {
			this.cmd(act.setNull, this.topID, 0);
			this.cmd(act.setNull, this.linkedListElemID[this.top], 1);
		} else {
			this.cmd(
				act.connect,
				this.linkedListElemID[this.top],
				this.linkedListElemID[this.top - 1],
			);
			this.cmd(act.step);
			this.cmd(act.disconnect, this.topID, this.linkedListElemID[this.top - 1]);
		}
		this.cmd(act.connect, this.topID, this.linkedListElemID[this.top]);
		this.highlight(2, 0, this.pushCodeID, 'english');
		this.highlight(3, 0, this.pushCodeID, 'english');

		this.cmd(act.step);
		this.top = this.top + 1;
		this.unhighlight(2, 0, this.pushCodeID, 'english');
		this.unhighlight(3, 0, this.pushCodeID, 'english');
		this.highlight(4, 0, this.pushCodeID, 'english');
		this.resetLinkedListPositions();
		this.cmd(act.delete, labPushID);
		this.cmd(act.step);
		this.unhighlight(4, 0, this.pushCodeID, 'english');

		return this.commands;
	}

	pop() {
		this.commands = [];

		const labPopID = this.nextIndex++;
		const labPopValID = this.nextIndex++;

		this.cmd(act.setText, this.leftoverLabelID, '');
		this.cmd(act.setText, this.leftoverValID, '');

		this.cmd(act.createLabel, labPopID, 'Popped Value: ', PUSH_LABEL_X, PUSH_LABEL_Y);
		this.cmd(
			act.createLabel,
			labPopValID,
			this.arrayData[this.top - 1],
			LINKED_LIST_START_X,
			LINKED_LIST_START_Y,
		);

		this.highlight(1, 0, this.popCodeID);
		this.cmd(act.move, labPopValID, PUSH_ELEMENT_X, PUSH_ELEMENT_Y);
		this.cmd(act.step);
		this.cmd(act.disconnect, this.topID, this.linkedListElemID[this.top - 1]);
		this.unhighlight(1, 0, this.popCodeID);

		if (this.top === 1) {
			this.cmd(act.setNull, this.topID, 1);
		} else {
			this.cmd(act.connect, this.topID, this.linkedListElemID[this.top - 2]);
		}
		this.highlight(2, 0, this.popCodeID);
		this.cmd(act.step);
		this.unhighlight(2, 0, this.popCodeID);
		this.cmd(act.delete, this.linkedListElemID[this.top - 1]);
		this.highlight(3, 0, this.popCodeID);
		this.highlight(4, 0, this.popCodeID, 'english');
		this.top = this.top - 1;
		this.resetLinkedListPositions();
		this.cmd(act.step);
		this.unhighlight(3, 0, this.popCodeID);
		this.unhighlight(4, 0, this.popCodeID, 'english');

		this.cmd(act.delete, labPopValID);
		this.cmd(act.delete, labPopID);
		this.cmd(act.setText, this.leftoverLabelID, 'Popped Value: ');
		this.cmd(act.setText, this.leftoverValID, this.arrayData[this.top]);

		return this.commands;
	}

	clearAll() {
		this.pushField.value = '';
		this.commands = [];
		for (let i = 0; i < this.top; i++) {
			this.cmd(act.delete, this.linkedListElemID[i]);
		}
		this.top = 0;
		this.cmd(act.setNull, this.topID, 1);
		return this.commands;
	}
}
