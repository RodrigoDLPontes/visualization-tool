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

import Algorithm, { addControlToAlgorithmBar, addLabelToAlgorithmBar } from './Algorithm.js';
import { act } from '../anim/AnimationMain';

const LINKED_LIST_START_X = 100;
const LINKED_LIST_START_Y = 200;
const LINKED_LIST_ELEM_WIDTH = 100;
const LINKED_LIST_ELEM_HEIGHT = 30;

const LINKED_LIST_INSERT_X = 200;
const LINKED_LIST_INSERT_Y = 50;

const LINKED_LIST_ELEMS_PER_LINE = 8;
const LINKED_LIST_ELEM_SPACING = 150;
const LINKED_LIST_LINE_SPACING = 100;

// let TOP_POS_X = 180;
// let TOP_POS_Y = 100;
// let TOP_LABEL_X = 130;
// let TOP_LABEL_Y = 100;

// let TOP_ELEM_WIDTH = 30;
// let TOP_ELEM_HEIGHT = 30;

const PUSH_LABEL_X = 50;
const PUSH_LABEL_Y = 30;
const PUSH_ELEMENT_X = 120;
const PUSH_ELEMENT_Y = 30;

const SIZE = 32;

export default class DequeLL extends Algorithm {
	constructor(am, w, h) {
		super(am, w, h);

		this.addControls();

		// Useful for memory management
		this.nextIndex = 0;

		this.setup();

		this.initialIndex = this.nextIndex;
	}

	addControls() {
		this.controls = [];

		addLabelToAlgorithmBar('Value');

		// Add's value text field
		this.addValueField = addControlToAlgorithmBar('Text', '');
		this.controls.push(this.addValueField);

		// Add to front button
		this.addFrontButton = addControlToAlgorithmBar('Button', 'Add to Front');
		this.addFrontButton.onclick = this.addFrontCallback.bind(this);
		this.controls.push(this.addFrontButton);

		// Add to back button
		this.addBackButton = addControlToAlgorithmBar('Button', 'Add to Back');
		this.addBackButton.onclick = this.addBackCallback.bind(this);
		this.controls.push(this.addBackButton);

		addLabelToAlgorithmBar('or');

		// Remove from front button
		this.removeFrontButton = addControlToAlgorithmBar('Button', 'Remove from Front');
		this.removeFrontButton.onclick = this.removeFrontCallback.bind(this);
		this.controls.push(this.removeFrontButton);

		// Remove from back button
		this.removeBackButton = addControlToAlgorithmBar('Button', 'Remove from Back');
		this.removeBackButton.onclick = this.removeBackCallback.bind(this);
		this.controls.push(this.removeBackButton);

		// Get's index text field
		// this.getField = addControlToAlgorithmBar("Text", "");
		// this.getField.onkeydown = this.returnSubmit(this.getField, this.getCallback.bind(this), 4, true);
		// this.controls.push(this.getField);

		// Get button
		// this.getButton = addControlToAlgorithmBar("Button", "Get");
		// this.getButton.onclick = this.getCallback.bind(this);
		// this.controls.push(this.getButton);

		// Clear button
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

		this.arrayData = new Array(SIZE);
		this.size = 0;
		this.leftoverLabelID = this.nextIndex++;

		this.cmd(act.createLabel, this.leftoverLabelID, '', PUSH_LABEL_X, PUSH_LABEL_Y);

		this.animationManager.startNewAnimation(this.commands);
		this.animationManager.skipForward();
		this.animationManager.clearHistory();
	}

	reset() {
		this.size = 0;
		this.nextIndex = this.initialIndex;
	}

	addIndexCallback() {
		if (this.addValueField.value !== '' && this.addIndexField.value !== '') {
			const addVal = this.addValueField.value;
			const index = this.addIndexField.value;
			if (index >= 0 && index <= this.size) {
				this.addValueField.value = '';
				this.addIndexField.value = '';
				this.implementAction(this.add.bind(this), addVal + ',' + index);
			}
		}
	}

	addFrontCallback() {
		if (this.addValueField.value !== '') {
			const addVal = this.addValueField.value;
			this.addValueField.value = '';
			this.implementAction(this.add.bind(this), addVal + ',' + 0);
		}
	}

	addBackCallback() {
		if (this.addValueField.value !== '') {
			const addVal = this.addValueField.value;
			this.addValueField.value = '';
			this.implementAction(this.add.bind(this), addVal + ',' + this.size);
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

	// getCallback(event)
	// {
	//     if (this.getField.value != "" && this.getField.value > 0 && this.getField.value < this.size)
	//     {
	//         this.implementAction(this.get.bind(this), "");
	//     }
	// }

	clearCallback() {
		this.implementAction(this.clearAll.bind(this), '');
	}

	add(params) {
		this.commands = [];

		const elemToAdd = parseInt(params.split(',')[0]);
		const index = parseInt(params.split(',')[1]);
		const labPushID = this.nextIndex++;
		const labPushValID = this.nextIndex++;

		for (let i = this.size - 1; i >= index; i--) {
			this.arrayData[i + 1] = this.arrayData[i];
			this.linkedListElemID[i + 1] = this.linkedListElemID[i];
		}
		this.arrayData[index] = elemToAdd;
		this.linkedListElemID[index] = this.nextIndex++;

		this.cmd(act.setText, this.leftoverLabelID, '');

		this.cmd(
			act.createDoublyLinkedListNode,
			this.linkedListElemID[index],
			'',
			LINKED_LIST_ELEM_WIDTH,
			LINKED_LIST_ELEM_HEIGHT,
			LINKED_LIST_INSERT_X,
			LINKED_LIST_INSERT_Y,
			0.25,
		);

		this.cmd(act.createLabel, labPushID, 'Adding Value: ', PUSH_LABEL_X, PUSH_LABEL_Y);
		this.cmd(act.createLabel, labPushValID, elemToAdd, PUSH_ELEMENT_X, PUSH_ELEMENT_Y);

		this.cmd(act.step);

		this.cmd(act.move, labPushValID, LINKED_LIST_INSERT_X, LINKED_LIST_INSERT_Y);

		this.cmd(act.step);
		this.cmd(act.setText, this.linkedListElemID[index], elemToAdd);
		this.cmd(act.delete, labPushValID);

		if (index === 0) {
			this.cmd(act.setPrevNull, this.linkedListElemID[index], 1);
		}

		if (index === this.size) {
			this.cmd(act.setNextNull, this.linkedListElemID[index], 1);
		}

		if (this.size !== 0) {
			if (index === 0) {
				this.cmd(act.setPrevNull, this.linkedListElemID[index + 1], 0);
				this.cmd(
					act.connectNext,
					this.linkedListElemID[index],
					this.linkedListElemID[index + 1],
				);
				this.cmd(
					act.connectPrev,
					this.linkedListElemID[index + 1],
					this.linkedListElemID[index],
				);
			} else if (index === this.size) {
				this.cmd(act.setNextNull, this.linkedListElemID[index - 1], 0);
				this.cmd(
					act.connectNext,
					this.linkedListElemID[index - 1],
					this.linkedListElemID[index],
				);
				this.cmd(
					act.connectPrev,
					this.linkedListElemID[index],
					this.linkedListElemID[index - 1],
				);
			} else {
				this.cmd(
					act.disconnect,
					this.linkedListElemID[index - 1],
					this.linkedListElemID[index + 1]
				);
				this.cmd(
					act.disconnect,
					this.linkedListElemID[index + 1],
					this.linkedListElemID[index - 1]
				);
				this.cmd(
					act.connectNext,
					this.linkedListElemID[index - 1],
					this.linkedListElemID[index],
				);
				this.cmd(
					act.connectPrev,
					this.linkedListElemID[index],
					this.linkedListElemID[index - 1],
				);
				this.cmd(
					act.connectNext,
					this.linkedListElemID[index],
					this.linkedListElemID[index + 1],
				);
				this.cmd(
					act.connectPrev,
					this.linkedListElemID[index + 1],
					this.linkedListElemID[index],
				);
			}
		}

		this.cmd(act.step);
		this.size = this.size + 1;
		this.resetNodePositions();
		this.cmd(act.delete, labPushID);
		this.cmd(act.step);

		return this.commands;
	}

	remove(index) {
		this.commands = [];

		index = parseInt(index);
		const labPopID = this.nextIndex++;
		const labPopValID = this.nextIndex++;

		this.cmd(act.setText, this.leftoverLabelID, '');

		const nodePosX = LINKED_LIST_START_X + LINKED_LIST_ELEM_SPACING * index;
		const nodePosY = LINKED_LIST_START_Y;
		this.cmd(act.createLabel, labPopID, 'Removing Value: ', PUSH_LABEL_X, PUSH_LABEL_Y);
		this.cmd(act.createLabel, labPopValID, this.arrayData[index], nodePosX, nodePosY);
		this.cmd(act.move, labPopValID, PUSH_ELEMENT_X, PUSH_ELEMENT_Y);
		this.cmd(act.step);

		if (this.size !== 1) {
			if (index === 0) {
				this.cmd(
					act.disconnect,
					this.linkedListElemID[index + 1],
					this.linkedListElemID[index]
				);
				this.cmd(act.setPrevNull, this.linkedListElemID[index + 1], 1);
			} else if (index === this.size - 1) {
				this.cmd(
					act.disconnect,
					this.linkedListElemID[index - 1],
					this.linkedListElemID[index]
				);
				this.cmd(act.setNextNull, this.linkedListElemID[index - 1], 1);
			} else {
				const xPos =
					(index % LINKED_LIST_ELEMS_PER_LINE) * LINKED_LIST_ELEM_SPACING +
					LINKED_LIST_START_X;
				const yPos = LINKED_LIST_START_Y - LINKED_LIST_ELEM_HEIGHT * 2;
				this.cmd(act.move, this.linkedListElemID[index], xPos, yPos);
				this.cmd(act.step);
				this.cmd(
					act.disconnect,
					this.linkedListElemID[index - 1],
					this.linkedListElemID[index]
				);
				this.cmd(
					act.disconnect,
					this.linkedListElemID[index + 1],
					this.linkedListElemID[index]
				);
				this.cmd(
					act.connectNext,
					this.linkedListElemID[index - 1],
					this.linkedListElemID[index + 1],
				);
				this.cmd(
					act.connectPrev,
					this.linkedListElemID[index + 1],
					this.linkedListElemID[index - 1],
				);
			}
		}
		this.cmd(act.step);
		this.cmd(act.delete, this.linkedListElemID[index]);

		for (let i = index; i < this.size; i++) {
			this.arrayData[i] = this.arrayData[i + 1];
			this.linkedListElemID[i] = this.linkedListElemID[i + 1];
		}
		this.size = this.size - 1;
		this.resetNodePositions();

		this.cmd(act.delete, labPopValID);
		this.cmd(act.delete, labPopID);

		return this.commands;
	}

	resetNodePositions() {
		for (let i = 0; i < this.size; i++) {
			const nextX =
				(i % LINKED_LIST_ELEMS_PER_LINE) * LINKED_LIST_ELEM_SPACING + LINKED_LIST_START_X;
			const nextY =
				Math.floor(i / LINKED_LIST_ELEMS_PER_LINE) * LINKED_LIST_LINE_SPACING +
				LINKED_LIST_START_Y;
			this.cmd(act.move, this.linkedListElemID[i], nextX, nextY);
		}
	}

	clearAll() {
		this.commands = [];
		for (let i = 0; i < this.size; i++) {
			this.cmd(act.delete, this.linkedListElemID[i]);
		}
		this.size = 0;
		return this.commands;
	}
}
