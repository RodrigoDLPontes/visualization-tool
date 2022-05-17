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

const LINKED_LIST_START_X = 100;
const LINKED_LIST_START_Y = 200;
const LINKED_LIST_ELEM_WIDTH = 70;
const LINKED_LIST_ELEM_HEIGHT = 30;

const LINKED_LIST_INSERT_X = 200;
const LINKED_LIST_INSERT_Y = 50;

const LINKED_LIST_ELEMS_PER_LINE = 9;
const LINKED_LIST_ELEM_SPACING = 100;
const LINKED_LIST_LINE_SPACING = 100;

const PUSH_LABEL_X = 50;
const PUSH_LABEL_Y = 30;
const PUSH_ELEMENT_X = 120;
const PUSH_ELEMENT_Y = 30;

const HEAD_POS_X = 180;
const HEAD_POS_Y = 100;

const POINTER_LABEL_X = 130;
const HEAD_LABEL_Y = 100;

const POINTER_ELEM_WIDTH = 30;
const POINTER_ELEM_HEIGHT = 30;

const SIZE = 9;

export default class CircularlyLinkedList extends Algorithm {
	constructor(am, w, h) {
		super(am, w, h);
		this.addControls();
		this.nextIndex = 0;
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

		this.cmd(act.setNull, this.headID, 1);

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
		if (
			this.addValueField.value !== '' &&
			this.addIndexField.value !== '' &&
			this.size < SIZE
		) {
			const addVal = parseInt(this.addValueField.value);
			const index = parseInt(this.addIndexField.value);
			if (index >= 0 && index <= this.size) {
				this.addValueField.value = '';
				this.addIndexField.value = '';
				this.implementAction(this.add.bind(this), addVal, index);
			}
		}
	}

	addFrontCallback() {
		if (this.addValueField.value !== '' && this.size < SIZE) {
			const addVal = parseInt(this.addValueField.value);
			this.addValueField.value = '';
			this.implementAction(this.add.bind(this), addVal, 0);
		}
	}

	addBackCallback() {
		if (this.addValueField.value !== '' && this.size < SIZE) {
			const addVal = parseInt(this.addValueField.value);
			this.addValueField.value = '';
			this.implementAction(this.add.bind(this), addVal, this.size);
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

	// CircularlySinglyLinkedList.prototype.getCallback = function()
	// {
	//     if (this.getField.value != "" && this.getField.value > 0 && this.getField.value < this.size)
	//     {
	//         this.implementAction(this.get.bind(this), "");
	//     }
	// }

	clearCallback() {
		this.implementAction(this.clearAll.bind(this));
	}

	add(elemToAdd, index) {
		this.commands = [];

		const labPushID = this.nextIndex++;
		const labPushValID = this.nextIndex++;

		// Order of data should behave as normal
		for (let i = this.size - 1; i >= index; i--) {
			this.arrayData[i + 1] = this.arrayData[i];
		}
		this.arrayData[index] = elemToAdd;

		// Adding to the front or back using O(1) trick, so new node will be added to index 1
		if (this.size !== 0 && (index === 0 || index === this.size)) {
			// Move over all node IDs but the first
			for (let i = this.size - 1; i >= 1; i--) {
				this.linkedListElemID[i + 1] = this.linkedListElemID[i];
			}
			// Place new node's ID at index 1
			this.linkedListElemID[1] = this.nextIndex++;
		}
		// Adding first node or to the middle, so new node will be placed normally
		else {
			for (let i = this.size - 1; i >= index; i--) {
				this.linkedListElemID[i + 1] = this.linkedListElemID[i];
			}
			this.linkedListElemID[index] = this.nextIndex++;
		}

		this.cmd(act.setText, this.leftoverLabelID, '');

		if (this.size !== 0 && (index === 0 || index === this.size)) {
			this.cmd(
				act.createCircularlyLinkedListNode,
				this.linkedListElemID[1],
				'',
				LINKED_LIST_ELEM_WIDTH,
				LINKED_LIST_ELEM_HEIGHT,
				LINKED_LIST_INSERT_X,
				LINKED_LIST_INSERT_Y,
			);
		} else {
			this.cmd(
				act.createCircularlyLinkedListNode,
				this.linkedListElemID[index],
				'',
				LINKED_LIST_ELEM_WIDTH,
				LINKED_LIST_ELEM_HEIGHT,
				LINKED_LIST_INSERT_X,
				LINKED_LIST_INSERT_Y,
			);
		}
		this.cmd(act.createLabel, labPushID, 'Adding Value: ', PUSH_LABEL_X, PUSH_LABEL_Y);
		this.cmd(act.createLabel, labPushValID, elemToAdd, PUSH_ELEMENT_X, PUSH_ELEMENT_Y);
		this.cmd(act.step);

		if (this.size === 0) {
			this.cmd(act.move, labPushValID, LINKED_LIST_INSERT_X, LINKED_LIST_INSERT_Y);
			this.cmd(act.step);

			this.cmd(act.setText, this.linkedListElemID[0], elemToAdd);
			this.cmd(act.delete, labPushValID);
			this.cmd(act.connectCurve, this.linkedListElemID[0], this.linkedListElemID[0], -0.5);
			this.cmd(act.connect, this.headID, this.linkedListElemID[0]);
			this.cmd(act.step);

			this.size = this.size + 1;
			this.resetNodePositions();
		} else {
			if (index === 0 || index === this.size) {
				// Move label from first node to new node
				const labCopiedValID = this.nextIndex++;
				const copiedData = index === 0 ? this.arrayData[1] : this.arrayData[0];
				this.cmd(
					act.createLabel,
					labCopiedValID,
					copiedData,
					LINKED_LIST_START_X,
					LINKED_LIST_START_Y,
				);
				this.cmd(act.move, labCopiedValID, LINKED_LIST_INSERT_X, LINKED_LIST_INSERT_Y);
				this.cmd(act.step);

				this.cmd(act.setText, this.linkedListElemID[1], copiedData);
				this.cmd(act.delete, labCopiedValID);
				this.cmd(act.step);

				// Move label for new data to the first node
				this.cmd(act.move, labPushValID, LINKED_LIST_START_X, LINKED_LIST_START_Y);
				this.cmd(act.step);

				this.cmd(act.setText, this.linkedListElemID[0], elemToAdd);
				this.cmd(act.delete, labPushValID);
				this.cmd(act.step);

				// Change pointers
				if (this.size === 1) {
					// Case where we're adding the second node
					this.cmd(act.disconnect, this.linkedListElemID[0], this.linkedListElemID[0]); // Disconnect head node from itself
					this.cmd(act.connect, this.linkedListElemID[0], this.linkedListElemID[1]); // Connect head node to new node
					this.cmd(
						act.connectCurve,
						this.linkedListElemID[1],
						this.linkedListElemID[0],
						-0.5,
					); // Connect new node to head node
				} else {
					// Other cases
					this.cmd(act.disconnect, this.linkedListElemID[0], this.linkedListElemID[2]); // Disconnect head from old second node
					this.cmd(act.connect, this.linkedListElemID[0], this.linkedListElemID[1]); // Connect head node to new node
					this.cmd(act.connect, this.linkedListElemID[1], this.linkedListElemID[2]); // Connect new node to old second node
				}
				this.cmd(act.step);

				this.size = this.size + 1;
				this.cmd(act.connect, this.headID, this.linkedListElemID[0]);
				this.resetNodePositions();
				this.cmd(act.step);

				// If adding to the back, "move head over" (rotate elements backwards)
				if (index === this.size - 1) {
					// We increment size above, so subtract one to check if adding to back
					let i;
					this.cmd(act.disconnect, this.headID, this.linkedListElemID[0]);
					const firstNodeID = this.linkedListElemID[0];
					for (i = 0; i < this.size - 1; i++) {
						this.linkedListElemID[i] = this.linkedListElemID[i + 1];
					}
					this.linkedListElemID[this.size - 1] = firstNodeID;

					const lastX =
						((this.size - 1) % LINKED_LIST_ELEMS_PER_LINE) * LINKED_LIST_ELEM_SPACING +
						LINKED_LIST_START_X;
					const lastY =
						Math.floor((this.size - 1) / LINKED_LIST_ELEMS_PER_LINE) *
							LINKED_LIST_LINE_SPACING +
						LINKED_LIST_START_Y;
					this.cmd(
						act.move,
						this.linkedListElemID[i],
						(LINKED_LIST_START_X + lastX) / 2,
						lastY + LINKED_LIST_ELEM_HEIGHT * 3,
					);
					this.cmd(act.connect, this.headID, this.linkedListElemID[0]);
					this.cmd(act.step);

					for (let i = 0; i < this.size - 1; i++) {
						const nextX =
							(i % LINKED_LIST_ELEMS_PER_LINE) * LINKED_LIST_ELEM_SPACING +
							LINKED_LIST_START_X;
						const nextY =
							Math.floor(i / LINKED_LIST_ELEMS_PER_LINE) * LINKED_LIST_LINE_SPACING +
							LINKED_LIST_START_Y;
						this.cmd(act.move, this.linkedListElemID[i], nextX, nextY);
					}

					this.cmd(
						act.disconnect,
						this.linkedListElemID[this.size - 2],
						this.linkedListElemID[this.size - 1],
					); // Disconnect curved pointer
					this.cmd(
						act.connect,
						this.linkedListElemID[this.size - 2],
						this.linkedListElemID[this.size - 1],
					); // Connect with normal pointer
					this.cmd(
						act.disconnect,
						this.linkedListElemID[this.size - 1],
						this.linkedListElemID[0],
					); // Disconnect normal pointer
					this.cmd(
						act.connectCurve,
						this.linkedListElemID[this.size - 1],
						this.linkedListElemID[0],
						-0.5,
					); // Connect with curved pointer
					this.cmd(act.move, this.linkedListElemID[i], lastX, lastY);
					this.cmd(act.step);
				}
			} else {
				this.cmd(act.move, labPushValID, LINKED_LIST_INSERT_X, LINKED_LIST_INSERT_Y);
				this.cmd(act.step);

				this.cmd(act.setText, this.linkedListElemID[index], elemToAdd);
				this.cmd(act.delete, labPushValID);
				this.cmd(act.step);

				this.cmd(
					act.disconnect,
					this.linkedListElemID[index - 1],
					this.linkedListElemID[index + 1],
				);
				this.cmd(
					act.connect,
					this.linkedListElemID[index - 1],
					this.linkedListElemID[index],
				);
				this.cmd(
					act.connect,
					this.linkedListElemID[index],
					this.linkedListElemID[index + 1],
				);

				this.size = this.size + 1;
				this.resetNodePositions();
			}
		}

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
				// O(1) remove from front trick
				const labCopiedValID = this.nextIndex++;
				const secondNodeX = LINKED_LIST_START_X + LINKED_LIST_ELEM_SPACING;
				const secondNodeY = LINKED_LIST_START_Y;
				this.cmd(
					act.createLabel,
					labCopiedValID,
					this.arrayData[1],
					secondNodeX,
					secondNodeY,
				);
				this.cmd(act.move, labCopiedValID, LINKED_LIST_START_X, LINKED_LIST_START_Y);
				this.cmd(act.step);

				this.cmd(act.setText, this.linkedListElemID[0], this.arrayData[1]);
				this.cmd(act.delete, labCopiedValID);
				this.cmd(act.step);

				this.cmd(
					act.move,
					this.linkedListElemID[1],
					secondNodeX,
					secondNodeY - LINKED_LIST_ELEM_HEIGHT * 2,
				);
				this.cmd(act.step);

				this.cmd(act.disconnect, this.linkedListElemID[0], this.linkedListElemID[1]);
				if (this.size === 2) {
					// Only one node will remain, connect it to itself
					this.cmd(
						act.connectCurve,
						this.linkedListElemID[0],
						this.linkedListElemID[0],
						-0.5,
					);
				} else {
					// Normal remove
					this.cmd(act.connect, this.linkedListElemID[0], this.linkedListElemID[2]);
				}
			} else if (index === this.size - 1) {
				this.cmd(
					act.disconnect,
					this.linkedListElemID[index - 1],
					this.linkedListElemID[index],
				);
				if (this.size === 2) {
					// Only one node will remain, connect it to itself
					this.cmd(
						act.connectCurve,
						this.linkedListElemID[0],
						this.linkedListElemID[0],
						-0.5,
					);
				} else {
					// Normal remove
					this.cmd(
						act.connectCurve,
						this.linkedListElemID[index - 1],
						this.linkedListElemID[0],
						-0.5,
					);
				}
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
					this.linkedListElemID[index],
				);
				this.cmd(
					act.connect,
					this.linkedListElemID[index - 1],
					this.linkedListElemID[index + 1],
				);
			}
			this.cmd(act.step);

			const removedNodeIndex = index === 0 ? 1 : index; // If deleting from front, we need to remove the second node
			this.cmd(act.delete, this.linkedListElemID[removedNodeIndex]);
			for (let i = removedNodeIndex; i < this.size; i++) {
				this.linkedListElemID[i] = this.linkedListElemID[i + 1];
			}
		} else {
			this.cmd(act.delete, this.linkedListElemID[0]);
			this.cmd(act.setNull, this.headID, 1);
		}

		for (let i = index; i < this.size; i++) {
			this.arrayData[i] = this.arrayData[i + 1];
		}
		this.size = this.size - 1;
		this.resetNodePositions();

		this.cmd(act.delete, labPopValID);
		this.cmd(act.delete, labPopID);
		this.cmd(act.step);

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
		this.cmd(act.setNull, this.headID, 1);
		return this.commands;
	}
}
