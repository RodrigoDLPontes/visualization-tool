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
	addGroupToAlgorithmBar,
	addLabelToAlgorithmBar,
} from './Algorithm';
import { act } from '../anim/AnimationMain';
import pseudocodeText from '../pseudocode.json';

const INFO_MSG_X = 25;
const INFO_MSG_Y = 15;

const LINKED_LIST_START_X = 170;
const LINKED_LIST_START_Y = 130;
const LINKED_LIST_ELEM_WIDTH = 70;
const LINKED_LIST_ELEM_HEIGHT = 30;

const LINKED_LIST_INSERT_X = 330;
const LINKED_LIST_INSERT_Y = 60;

const LINKED_LIST_ELEMS_PER_LINE = 12;
const LINKED_LIST_ELEM_SPACING = 125;
const LINKED_LIST_LINE_SPACING = 100;

const PUSH_LABEL_X = 65;
const PUSH_LABEL_Y = 25;
const PUSH_ELEMENT_X = 125;
const PUSH_ELEMENT_Y = 25;

const HEAD_POS_X = 170;
const HEAD_POS_Y = 60;

const TAIL_POS_X = 170;
const TAIL_POS_Y = 195;

const POINTER_LABEL_X = 220;
const HEAD_LABEL_Y = 60;

const POINTER_ELEM_WIDTH = 30;
const POINTER_ELEM_HEIGHT = 30;

const SIZE = 32;

const CODE_START_X = 135;
const CODE_START_Y = 230;

export default class DoublyLinkedList extends Algorithm {
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

		const addVerticalGroup = addGroupToAlgorithmBar(false);
		const addTopHorizontalGroup = addGroupToAlgorithmBar(true, addVerticalGroup);
		const addBottomHorizontalGroup = addGroupToAlgorithmBar(true, addVerticalGroup);

		addLabelToAlgorithmBar('Add', addTopHorizontalGroup);

		// Add's value text field
		this.addValueField = addControlToAlgorithmBar('Text', '', addTopHorizontalGroup);
		this.addValueField.style.textAlign = 'center';
		this.addValueField.onkeydown = this.returnSubmit(
			this.addValueField,
			() => this.addIndexCallback(),
			4,
			true,
		);
		this.controls.push(this.addValueField);

		addLabelToAlgorithmBar('at index', addTopHorizontalGroup);

		// Add's index text field
		this.addIndexField = addControlToAlgorithmBar('Text', '', addTopHorizontalGroup);
		this.addIndexField.style.textAlign = 'center';
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
		this.removeField.style.textAlign = 'center';
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

		const verticalGroup2 = addGroupToAlgorithmBar(false);

		// Random data button
		this.randomButton = addControlToAlgorithmBar('Button', 'Random', verticalGroup2);
		this.randomButton.onclick = this.randomCallback.bind(this);
		this.controls.push(this.randomButton);

		// Clear button
		this.clearButton = addControlToAlgorithmBar('Button', 'Clear', verticalGroup2);
		this.clearButton.onclick = () => this.clearCallback();
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

		this.headID = this.nextIndex++;
		this.headLabelID = this.nextIndex++;

		this.tailID = this.nextIndex++;
		this.tailLabelID = this.nextIndex++;

		this.infoLabelID = this.nextIndex++;
		this.cmd(act.createLabel, this.infoLabelID, '', INFO_MSG_X, INFO_MSG_Y, 0);

		this.arrayData = new Array(SIZE);
		this.size = 0;
		this.leftoverLabelID = this.nextIndex++;

		this.cmd(act.createLabel, this.headLabelID, 'Head', POINTER_LABEL_X, HEAD_LABEL_Y);
		this.cmd(
			act.createRectangle,
			this.headID,
			'',
			POINTER_ELEM_WIDTH,
			POINTER_ELEM_HEIGHT,
			HEAD_POS_X,
			HEAD_POS_Y,
		);

		this.cmd(
			act.createLabel,
			this.tailLabelID,
			'Tail',
			POINTER_LABEL_X - 95,
			HEAD_LABEL_Y + 135,
		);
		this.cmd(
			act.createRectangle,
			this.tailID,
			'',
			POINTER_ELEM_WIDTH,
			POINTER_ELEM_HEIGHT,
			TAIL_POS_X,
			TAIL_POS_Y,
		);

		this.cmd(act.setNull, this.headID, 1);
		this.cmd(act.setNull, this.tailID, 1);

		this.cmd(act.createLabel, this.leftoverLabelID, '', PUSH_LABEL_X, PUSH_LABEL_Y);

		this.pseudocode = pseudocodeText.DoublyLinkedList;

		this.resetIndex = this.nextIndex;

		this.animationManager.startNewAnimation(this.commands);
		this.animationManager.skipForward();
		this.animationManager.clearHistory();
	}

	reset() {
		this.size = 0;
		this.nextIndex = this.resetIndex;
	}

	setInfoText(text) {
		this.commands = [];
		this.cmd(act.setText, this.infoLabelID, text);
		return this.commands;
	}

	addIndexCallback() {
		if (this.addValueField.value !== '' && this.addIndexField.value !== '') {
			const addVal = parseInt(this.addValueField.value);
			const index = parseInt(this.addIndexField.value);
			if (index >= 0 && index <= this.size) {
				this.addValueField.value = '';
				this.addIndexField.value = '';
				this.implementAction(this.add.bind(this), addVal, index, false, false, true);
			} else {
				this.implementAction(
					this.setInfoText.bind(this),
					this.size === 0
						? 'Index must be 0 when the list is empty.'
						: `Index must be between 0 and ${this.size}.`,
				);
				this.shake(this.addIndexButton);
			}
		} else {
			this.implementAction(this.setInfoText.bind(this), 'Missing input data or index.');
			this.shake(this.addIndexButton);
		}
	}

	addFrontCallback() {
		if (this.addValueField.value !== '') {
			const addVal = parseInt(this.addValueField.value);
			this.addValueField.value = '';
			this.implementAction(this.add.bind(this), addVal, 0, true, false, false);
		} else {
			this.implementAction(this.setInfoText.bind(this), 'Missing input data.');
			this.shake(this.addFrontButton);
		}
	}

	addBackCallback() {
		if (this.addValueField.value !== '') {
			const addVal = parseInt(this.addValueField.value);
			this.addValueField.value = '';
			this.implementAction(this.add.bind(this), addVal, this.size, false, true, false);
		} else {
			this.implementAction(this.setInfoText.bind(this), 'Missing input data.');
			this.shake(this.addBackButton);
		}
	}

	removeIndexCallback() {
		if (this.removeField.value !== '') {
			const index = this.removeField.value;
			if (index >= 0 && index < this.size) {
				this.removeField.value = '';
				this.implementAction(this.remove.bind(this), index, false, false, true);
			} else {
				let errorMsg = 'Cannot remove from an empty list.';
				if (this.size === 1) {
					errorMsg = 'Index must be 0 when the list contains one element.';
				} else if (this.size > 1) {
					errorMsg = `Index must be between 0 and ${this.size - 1}.`;
				}
				this.implementAction(this.setInfoText.bind(this), errorMsg);
				this.shake(this.removeIndexButton);
			}
		} else {
			this.implementAction(this.setInfoText.bind(this), 'Missing input index.');
			this.shake(this.removeIndexButton);
		}
	}

	removeFrontCallback() {
		if (this.size > 0) {
			this.implementAction(this.remove.bind(this), 0, true, false, false);
		} else {
			this.implementAction(this.setInfoText.bind(this), 'Cannot remove from an empty list.');
			this.shake(this.removeFrontButton);
		}
	}

	removeBackCallback() {
		if (this.size > 0) {
			this.implementAction(this.remove.bind(this), this.size - 1, false, true, false);
		} else {
			this.implementAction(this.setInfoText.bind(this), 'Cannot remove from an empty list.');
			this.shake(this.removeBackButton);
		}
	}

	randomCallback() {
		const LOWER_BOUND = 0;
		const UPPER_BOUND = 16;
		const MAX_SIZE = 6;
		const MIN_SIZE = 3;
		const randomSize = Math.floor(Math.random() * (MAX_SIZE - MIN_SIZE + 1)) + MIN_SIZE;
		const set = new Set();

		this.implementAction(this.clearAll.bind(this));

		for (let i = 0; i < randomSize; i++) {
			const val = Math.floor(Math.random() * (UPPER_BOUND - LOWER_BOUND + 1)) + LOWER_BOUND;
			if (set.has(val)) {
				i--;
			} else {
				set.add(val);
				this.implementAction(this.add.bind(this), val, 0, false, true, false, true);
			}
			this.animationManager.skipForward();
			this.animationManager.clearHistory();
		}
	}

	clearCallback() {
		this.implementAction(this.clearAll.bind(this));
	}

	removeTraverse(index) {
		if (index < this.size / 2) {
			for (let i = 0; i <= index; i++) {
				this.cmd(act.step);
				this.cmd(act.setHighlight, this.linkedListElemID[i], 1);
				if (i > 0) {
					this.cmd(act.setHighlight, this.linkedListElemID[i - 1], 0);
				}
			}
			this.cmd(act.step);
		} else {
			for (let i = this.size - 1; i >= index; i--) {
				this.cmd(act.step);
				this.cmd(act.setHighlight, this.linkedListElemID[i], 1);
				if (i < this.size) {
					this.cmd(act.setHighlight, this.linkedListElemID[i + 1], 0);
				}
			}
			this.cmd(act.step);
		}
	}

	addTraverse(index) {
		if (index + 1 < this.size / 2) {
			for (let i = 0; i <= index; i++) {
				this.cmd(act.step);
				this.cmd(act.setHighlight, this.linkedListElemID[i], 1);
				if (i > 0) {
					this.cmd(act.setHighlight, this.linkedListElemID[i - 1], 0);
				}
			}
			this.cmd(act.step);
		} else {
			for (let i = this.size - 1; i >= index; i--) {
				this.cmd(act.step);
				this.cmd(act.setHighlight, this.linkedListElemID[i], 1);
				if (i < this.size) {
					this.cmd(act.setHighlight, this.linkedListElemID[i + 1], 0);
				}
			}
			this.cmd(act.step);
		}
	}

	add(elemToAdd, index, isAddFront, isAddBack, isAddIndex, skipPseudocode) {
		this.commands = [];
		this.setInfoText('');

		if (!skipPseudocode) {
			this.addIndexCodeID = this.addCodeToCanvasBaseAll(
				this.pseudocode,
				'addIndex',
				CODE_START_X,
				CODE_START_Y,
			);
			this.addFrontCodeID = this.addCodeToCanvasBaseAll(
				this.pseudocode,
				'addFront',
				CODE_START_X + 325,
				CODE_START_Y,
			);
			this.addBackCodeID = this.addCodeToCanvasBaseAll(
				this.pseudocode,
				'addBack',
				CODE_START_X + 620,
				CODE_START_Y,
			);
		}

		if (isAddFront) {
			this.highlight(0, 0, this.addFrontCodeID);
		} else if (isAddBack) {
			this.highlight(0, 0, this.addBackCodeID);
		} else if (isAddIndex) {
			this.highlight(0, 0, this.addIndexCodeID);
		}

		if (isAddIndex && index === 0) {
			this.highlight(1, 0, this.addIndexCodeID);
			this.highlight(2, 0, this.addIndexCodeID);
			this.highlight(0, 0, this.addFrontCodeID);
		} else if (isAddIndex && index === this.size) {
			this.highlight(3, 0, this.addIndexCodeID);
			this.highlight(4, 0, this.addIndexCodeID);
			this.highlight(0, 0, this.addBackCodeID);
		}

		this.cmd(act.step);

		const labPushID = this.nextIndex++;
		const labPushValID = this.nextIndex++;

		// iterate to the correct node if it is an index != 0 or size
		const indexToTraverseTo = index - 1;
		if (index > 0 && index < this.size) {
			this.highlight(5, 0, this.addIndexCodeID);
			if (isAddIndex && index < this.size / 2) {
				this.highlight(6, 0, this.addIndexCodeID);
				this.highlight(7, 0, this.addIndexCodeID);
				this.highlight(8, 0, this.addIndexCodeID);
				this.highlight(9, 0, this.addIndexCodeID);
			} else {
				this.highlight(10, 0, this.addIndexCodeID);
				this.highlight(11, 0, this.addIndexCodeID);
				this.highlight(12, 0, this.addIndexCodeID);
				this.highlight(13, 0, this.addIndexCodeID);
			}
			this.addTraverse(indexToTraverseTo);
		}

		for (let i = this.size - 1; i >= index; i--) {
			this.arrayData[i + 1] = this.arrayData[i];
			this.linkedListElemID[i + 1] = this.linkedListElemID[i];
		}
		this.arrayData[index] = elemToAdd;
		this.linkedListElemID[index] = this.nextIndex++;

		this.cmd(act.setText, this.leftoverLabelID, '');

		this.cmd(act.step);

		if ((isAddFront || (isAddIndex && index === 0)) && this.size === 0) {
			this.highlight(1, 0, this.addFrontCodeID);
		} else if (isAddFront || (isAddIndex && index === 0)) {
			this.highlight(4, 0, this.addFrontCodeID);
		} else if (isAddIndex && index === 0) {
			this.unhighlight(1, 0, this.addIndexCodeID);
		} else if (isAddIndex && index < this.size / 2) {
			this.unhighlight(6, 0, this.addIndexCodeID);
			this.unhighlight(7, 0, this.addIndexCodeID);
			this.unhighlight(8, 0, this.addIndexCodeID);
			this.unhighlight(9, 0, this.addIndexCodeID);
		} else if ((isAddBack || (isAddIndex && index === this.size)) && this.size === 0) {
			this.highlight(1, 0, this.addBackCodeID);
		} else if (isAddBack || (isAddIndex && index === this.size)) {
			this.highlight(4, 0, this.addBackCodeID);
		} else if (isAddIndex) {
			this.unhighlight(10, 0, this.addIndexCodeID);
			this.unhighlight(11, 0, this.addIndexCodeID);
			this.unhighlight(12, 0, this.addIndexCodeID);
			this.unhighlight(13, 0, this.addIndexCodeID);
		}

		this.cmd(act.step);

		this.cmd(
			act.createDoublyLinkedListNode,
			this.linkedListElemID[index],
			'',
			LINKED_LIST_ELEM_WIDTH,
			LINKED_LIST_ELEM_HEIGHT,
			LINKED_LIST_INSERT_X,
			LINKED_LIST_INSERT_Y,
		);

		if ((isAddFront || (isAddIndex && index === 0)) && this.size === 0) {
			this.highlight(2, 0, this.addFrontCodeID);
			this.highlight(3, 0, this.addFrontCodeID);
		} else if (isAddFront || (isAddIndex && index === 0)) {
			this.highlight(5, 0, this.addFrontCodeID);
		} else if ((isAddBack || (isAddIndex && index === this.size)) && this.size === 0) {
			this.highlight(2, 0, this.addBackCodeID);
			this.highlight(3, 0, this.addBackCodeID);
		} else if (isAddBack || (isAddIndex && index === this.size)) {
			this.highlight(5, 0, this.addBackCodeID);
		} else if (isAddIndex) {
			this.highlight(14, 0, this.addIndexCodeID);
		}

		this.cmd(act.createLabel, labPushID, 'Adding Value: ', PUSH_LABEL_X, PUSH_LABEL_Y);
		this.cmd(act.createLabel, labPushValID, elemToAdd, PUSH_ELEMENT_X, PUSH_ELEMENT_Y);
		this.cmd(act.step);

		this.cmd(act.move, labPushValID, LINKED_LIST_INSERT_X, LINKED_LIST_INSERT_Y);

		this.cmd(act.setText, this.linkedListElemID[index], elemToAdd);
		this.cmd(act.delete, labPushValID);
		this.cmd(act.step);

		if (index === 0) {
			this.cmd(act.setPrevNull, this.linkedListElemID[index], 1);
			this.cmd(act.connect, this.headID, this.linkedListElemID[index]);
		}

		if (index === this.size) {
			this.cmd(act.setNextNull, this.linkedListElemID[index], 1);
			this.cmd(act.connect, this.tailID, this.linkedListElemID[index]);
		}

		if (this.size !== 0) {
			if (index === 0) {
				if (isAddFront || (isAddIndex && index === 0)) {
					this.unhighlight(5, 0, this.addFrontCodeID);
					this.highlight(6, 0, this.addFrontCodeID);
					this.highlight(7, 0, this.addFrontCodeID);
					this.highlight(8, 0, this.addFrontCodeID);
				}
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
				this.cmd(act.disconnect, this.headID, this.linkedListElemID[index + 1]);
			} else if (index === this.size) {
				if (isAddBack || (isAddIndex && index === this.size)) {
					this.unhighlight(5, 0, this.addBackCodeID);
					this.highlight(6, 0, this.addBackCodeID);
					this.highlight(7, 0, this.addBackCodeID);
					this.highlight(8, 0, this.addBackCodeID);
				}
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
				this.cmd(act.disconnect, this.tailID, this.linkedListElemID[index - 1]);
			} else {
				if (isAddIndex) {
					this.unhighlight(14, 0, this.addIndexCodeID);
					this.highlight(15, 0, this.addIndexCodeID);
					this.highlight(16, 0, this.addIndexCodeID);
					this.highlight(17, 0, this.addIndexCodeID);
					this.highlight(18, 0, this.addIndexCodeID);
				}
				this.cmd(
					act.disconnect,
					this.linkedListElemID[index - 1],
					this.linkedListElemID[index + 1],
				);
				this.cmd(
					act.disconnect,
					this.linkedListElemID[index + 1],
					this.linkedListElemID[index - 1],
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

		this.cmd(
			act.setHighlight,
			this.linkedListElemID[index < this.size / 2 ? indexToTraverseTo : indexToTraverseTo],
			0,
		);

		this.size = this.size + 1;
		this.resetNodePositions();
		this.cmd(act.delete, labPushID);
		this.cmd(act.step);

		if (isAddFront || (isAddIndex && index === 0)) {
			this.unhighlight(1, 0, this.addFrontCodeID);
			this.unhighlight(2, 0, this.addFrontCodeID);
			this.unhighlight(3, 0, this.addFrontCodeID);
			this.unhighlight(4, 0, this.addFrontCodeID);
			this.unhighlight(5, 0, this.addFrontCodeID);
			this.unhighlight(6, 0, this.addFrontCodeID);
			this.unhighlight(7, 0, this.addFrontCodeID);
			this.unhighlight(8, 0, this.addFrontCodeID);
			this.highlight(9, 0, this.addFrontCodeID);
		} else if (isAddBack || (isAddIndex && index === this.size - 1)) {
			this.unhighlight(1, 0, this.addBackCodeID);
			this.unhighlight(2, 0, this.addBackCodeID);
			this.unhighlight(3, 0, this.addBackCodeID);
			this.unhighlight(4, 0, this.addBackCodeID);
			this.unhighlight(5, 0, this.addBackCodeID);
			this.unhighlight(6, 0, this.addBackCodeID);
			this.unhighlight(7, 0, this.addBackCodeID);
			this.unhighlight(8, 0, this.addBackCodeID);
			this.highlight(9, 0, this.addBackCodeID);
		} else if (isAddIndex) {
			this.unhighlight(15, 0, this.addIndexCodeID);
			this.unhighlight(16, 0, this.addIndexCodeID);
			this.unhighlight(17, 0, this.addIndexCodeID);
			this.unhighlight(18, 0, this.addIndexCodeID);
			this.highlight(19, 0, this.addIndexCodeID);
		}

		this.cmd(act.step);

		if (isAddFront || (isAddIndex && index === 0)) {
			this.unhighlight(0, 0, this.addFrontCodeID);
			this.unhighlight(9, 0, this.addFrontCodeID);
			this.unhighlight(0, 0, this.addIndexCodeID);
			this.unhighlight(1, 0, this.addIndexCodeID);
			this.unhighlight(2, 0, this.addIndexCodeID);
		} else if (isAddBack || (isAddIndex && index === this.size - 1)) {
			this.unhighlight(0, 0, this.addBackCodeID);
			this.unhighlight(9, 0, this.addBackCodeID);
			this.unhighlight(0, 0, this.addIndexCodeID);
			this.unhighlight(3, 0, this.addIndexCodeID);
			this.unhighlight(4, 0, this.addIndexCodeID);
		} else if (isAddIndex) {
			this.unhighlight(0, 0, this.addIndexCodeID);
			this.unhighlight(5, 0, this.addIndexCodeID);
			this.unhighlight(19, 0, this.addIndexCodeID);
		}

		if (!skipPseudocode) {
			this.removeCode(this.addFrontCodeID);
			this.removeCode(this.addBackCodeID);
			this.removeCode(this.addIndexCodeID);
		}

		return this.commands;
	}

	remove(index, isRemoveFront, isRemoveBack, isRemoveIndex) {
		this.commands = [];
		this.setInfoText('');

		this.removeIndexCodeID = this.addCodeToCanvasBaseAll(
			this.pseudocode,
			'removeIndex',
			CODE_START_X,
			CODE_START_Y,
		);
		this.removeFrontCodeID = this.addCodeToCanvasBaseAll(
			this.pseudocode,
			'removeFront',
			CODE_START_X + 325,
			CODE_START_Y,
		);
		this.removeBackCodeID = this.addCodeToCanvasBaseAll(
			this.pseudocode,
			'removeBack',
			CODE_START_X + 620,
			CODE_START_Y,
		);

		index = parseInt(index);

		if (isRemoveFront) {
			this.highlight(0, 0, this.removeFrontCodeID);
		} else if (isRemoveBack) {
			this.highlight(0, 0, this.removeBackCodeID);
		} else if (isRemoveIndex) {
			this.highlight(0, 0, this.removeIndexCodeID);
		}

		if (isRemoveIndex && index === 0) {
			this.highlight(1, 0, this.removeIndexCodeID);
			this.highlight(2, 0, this.removeIndexCodeID);
			this.highlight(0, 0, this.removeFrontCodeID);
		} else if (isRemoveIndex && index === this.size - 1) {
			this.highlight(3, 0, this.removeIndexCodeID);
			this.highlight(4, 0, this.removeIndexCodeID);
			this.highlight(0, 0, this.removeBackCodeID);
		}

		const labPopID = this.nextIndex++;
		const labPopValID = this.nextIndex++;

		this.cmd(act.setText, this.leftoverLabelID, '');

		this.cmd(act.step);

		if (index > 0 && index < this.size - 1) {
			if (isRemoveIndex) {
				this.highlight(5, 0, this.removeIndexCodeID);
				if (index < this.size / 2) {
					this.highlight(6, 0, this.removeIndexCodeID);
					this.highlight(7, 0, this.removeIndexCodeID);
					this.highlight(8, 0, this.removeIndexCodeID);
					this.highlight(9, 0, this.removeIndexCodeID);
				} else {
					this.highlight(10, 0, this.removeIndexCodeID);
					this.highlight(11, 0, this.removeIndexCodeID);
					this.highlight(12, 0, this.removeIndexCodeID);
					this.highlight(13, 0, this.removeIndexCodeID);
				}
			}
			this.removeTraverse(index);
		}

		const nodePosX = LINKED_LIST_START_X + LINKED_LIST_ELEM_SPACING * index;
		const nodePosY = LINKED_LIST_START_Y;

		if (isRemoveFront || (isRemoveIndex && index === 0)) {
			this.highlight(1, 0, this.removeFrontCodeID);
		} else if (isRemoveBack || (isRemoveIndex && index === this.size - 1)) {
			this.highlight(1, 0, this.removeBackCodeID);
		} else if (isRemoveIndex) {
			this.unhighlight(6, 0, this.removeIndexCodeID);
			this.unhighlight(7, 0, this.removeIndexCodeID);
			this.unhighlight(8, 0, this.removeIndexCodeID);
			this.unhighlight(9, 0, this.removeIndexCodeID);
			this.unhighlight(10, 0, this.removeIndexCodeID);
			this.unhighlight(11, 0, this.removeIndexCodeID);
			this.unhighlight(12, 0, this.removeIndexCodeID);
			this.unhighlight(13, 0, this.removeIndexCodeID);
			this.highlight(14, 0, this.removeIndexCodeID);
		}

		this.cmd(act.createLabel, labPopID, 'Removing Value: ', PUSH_LABEL_X, PUSH_LABEL_Y);
		this.cmd(act.createLabel, labPopValID, this.arrayData[index], nodePosX, nodePosY);
		this.cmd(act.move, labPopValID, PUSH_ELEMENT_X + 4, PUSH_ELEMENT_Y);
		this.cmd(act.step);

		if (this.size !== 1) {
			if (index === 0) {
				if (isRemoveFront || (isRemoveIndex && index === 0)) {
					this.unhighlight(1, 0, this.removeFrontCodeID);
					this.highlight(2, 0, this.removeFrontCodeID);
				}
				this.cmd(act.connect, this.headID, this.linkedListElemID[index + 1]);
				this.cmd(act.disconnect, this.headID, this.linkedListElemID[index]);
				this.cmd(act.step);
				if (isRemoveFront || (isRemoveIndex && index === 0)) {
					this.unhighlight(2, 0, this.removeFrontCodeID);
					this.highlight(5, 0, this.removeFrontCodeID);
					this.highlight(6, 0, this.removeFrontCodeID);
				}
				this.cmd(
					act.disconnect,
					this.linkedListElemID[index + 1],
					this.linkedListElemID[index],
				);
				this.cmd(act.setPrevNull, this.linkedListElemID[index + 1], 1);
			} else if (index === this.size - 1) {
				if (isRemoveBack || (isRemoveIndex && index === this.size - 1)) {
					this.unhighlight(1, 0, this.removeBackCodeID);
					this.highlight(2, 0, this.removeBackCodeID);
				}
				this.cmd(act.connect, this.tailID, this.linkedListElemID[index - 1]);
				this.cmd(act.disconnect, this.tailID, this.linkedListElemID[index]);
				this.cmd(act.step);
				if (isRemoveBack || (isRemoveIndex && index === this.size - 1)) {
					this.unhighlight(2, 0, this.removeBackCodeID);
					this.highlight(5, 0, this.removeBackCodeID);
					this.highlight(6, 0, this.removeBackCodeID);
				}
				this.cmd(
					act.disconnect,
					this.linkedListElemID[index - 1],
					this.linkedListElemID[index],
				);
				this.cmd(act.setNextNull, this.linkedListElemID[index - 1], 1);
			} else {
				const xPos =
					(index % LINKED_LIST_ELEMS_PER_LINE) * LINKED_LIST_ELEM_SPACING +
					LINKED_LIST_START_X;
				const yPos = LINKED_LIST_START_Y - LINKED_LIST_ELEM_HEIGHT * 1.6;
				this.cmd(act.move, this.linkedListElemID[index], xPos, yPos);
				if (isRemoveIndex) {
					this.unhighlight(14, 0, this.removeIndexCodeID);
					this.highlight(15, 0, this.removeIndexCodeID);
					this.highlight(16, 0, this.removeIndexCodeID);
				}
				this.cmd(
					act.disconnect,
					this.linkedListElemID[index - 1],
					this.linkedListElemID[index],
				);
				this.cmd(
					act.disconnect,
					this.linkedListElemID[index + 1],
					this.linkedListElemID[index],
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
		} else {
			if (isRemoveFront || (isRemoveIndex && index === 0)) {
				this.unhighlight(1, 0, this.removeFrontCodeID);
				this.highlight(2, 0, this.removeFrontCodeID);
			} else if (isRemoveBack || (isRemoveIndex && index === this.size - 1)) {
				this.unhighlight(1, 0, this.removeBackCodeID);
				this.highlight(2, 0, this.removeBackCodeID);
				this.highlight(3, 0, this.removeBackCodeID);
				this.highlight(4, 0, this.removeBackCodeID);
			}
			this.cmd(act.disconnect, this.headID, this.linkedListElemID[index]);
			if (isRemoveFront || (isRemoveIndex && index === 0)) {
				this.cmd(act.step);
			}
			if (isRemoveFront || (isRemoveIndex && index === 0)) {
				this.unhighlight(2, 0, this.removeFrontCodeID);
				this.highlight(3, 0, this.removeFrontCodeID);
				this.highlight(4, 0, this.removeFrontCodeID);
			}
			this.cmd(act.disconnect, this.tailID, this.linkedListElemID[index]);
		}
		this.cmd(act.step);
		this.cmd(act.delete, this.linkedListElemID[index]);

		for (let i = index; i < this.size; i++) {
			this.arrayData[i] = this.arrayData[i + 1];
			this.linkedListElemID[i] = this.linkedListElemID[i + 1];
		}
		this.size = this.size - 1;
		this.resetNodePositions();

		this.cmd(act.step);

		if (isRemoveFront || (isRemoveIndex && index === 0)) {
			this.unhighlight(3, 0, this.removeFrontCodeID);
			this.unhighlight(4, 0, this.removeFrontCodeID);
			this.unhighlight(5, 0, this.removeFrontCodeID);
			this.unhighlight(6, 0, this.removeFrontCodeID);
			this.highlight(7, 0, this.removeFrontCodeID);
		} else if (isRemoveBack || (isRemoveIndex && index === this.size)) {
			this.unhighlight(2, 0, this.removeBackCodeID);
			this.unhighlight(3, 0, this.removeBackCodeID);
			this.unhighlight(4, 0, this.removeBackCodeID);
			this.unhighlight(5, 0, this.removeBackCodeID);
			this.unhighlight(6, 0, this.removeBackCodeID);
			this.highlight(7, 0, this.removeBackCodeID);
		} else if (isRemoveIndex) {
			this.unhighlight(15, 0, this.removeIndexCodeID);
			this.unhighlight(16, 0, this.removeIndexCodeID);
			this.highlight(17, 0, this.removeIndexCodeID);
		}

		this.cmd(act.delete, labPopValID);
		this.cmd(act.delete, labPopID);
		this.cmd(act.step);

		if (isRemoveFront || (isRemoveIndex && index === 0)) {
			this.unhighlight(0, 0, this.removeIndexCodeID);
			this.unhighlight(1, 0, this.removeIndexCodeID);
			this.unhighlight(2, 0, this.removeIndexCodeID);
			this.unhighlight(0, 0, this.removeFrontCodeID);
			this.unhighlight(7, 0, this.removeFrontCodeID);
		} else if (isRemoveBack || (isRemoveIndex && index === this.size)) {
			this.unhighlight(0, 0, this.removeBackCodeID);
			this.unhighlight(7, 0, this.removeBackCodeID);
			this.unhighlight(0, 0, this.removeIndexCodeID);
			this.unhighlight(3, 0, this.removeIndexCodeID);
			this.unhighlight(4, 0, this.removeIndexCodeID);
		} else if (isRemoveIndex) {
			this.unhighlight(0, 0, this.removeIndexCodeID);
			this.unhighlight(5, 0, this.removeIndexCodeID);
			this.unhighlight(17, 0, this.removeIndexCodeID);
		}

		this.removeCode(this.removeFrontCodeID);
		this.removeCode(this.removeBackCodeID);
		this.removeCode(this.removeIndexCodeID);

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
		this.addValueField.value = '';
		this.addIndexField.value = '';
		this.removeField.value = '';
		this.commands = [];
		this.cmd(act.setText, this.infoLabelID, '');
		for (let i = 0; i < this.size; i++) {
			this.cmd(act.delete, this.linkedListElemID[i]);
		}
		this.size = 0;
		this.cmd(act.setNull, this.headID, 1);
		this.cmd(act.setNull, this.tailID, 1);
		return this.commands;
	}
}
