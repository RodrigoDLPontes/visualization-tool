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

import Hash from './Hash.js';
import { addRadioButtonGroupToAlgorithmBar } from './Algorithm.js';

const ARRAY_ELEM_WIDTH = 90;
const ARRAY_ELEM_HEIGHT = 30;
const ARRAY_ELEM_START_X = 50;
const ARRAY_ELEM_START_Y = 100;
const ARRAY_VERTICAL_SEPARATION = 100;

const CLOSED_HASH_TABLE_SIZE = 29;

// const ARRAY_Y_POS = 350;

const INDEX_COLOR = '#0000FF';

// const MAX_DATA_VALUE = 999;

// const HASH_TABLE_SIZE = 13;

export default class ClosedHash extends Hash {
	constructor(am, w, h) {
		super(am, w, h);
		this.elements_per_row = Math.floor(w / ARRAY_ELEM_WIDTH);

		//Change me!
		this.nextIndex = 0;
		//this.POINTER_ARRAY_ELEM_Y = h - POINTER_ARRAY_ELEM_WIDTH;
		this.setup();
	}

	addControls() {
		super.addControls();
		const radioButtonList = addRadioButtonGroupToAlgorithmBar(
			[
				'Linear Probing: f(i) = i',
				'Quadratic Probing: f(i) = i * i',
				'Double Hashing: f(i) = i * hash2(elem)',
			],
			'CollisionStrategy'
		);
		this.linearProblingButton = radioButtonList[0];
		this.linearProblingButton.onclick = this.linearProbeCallback.bind(this);
		this.quadraticProbingButton = radioButtonList[1];
		this.quadraticProbingButton.onclick = this.quadraticProbeCallback.bind(this);
		this.doubleHashingButton = radioButtonList[2];
		this.doubleHashingButton.onclick = this.doubleHashingCallback.bind(this);

		this.linearProblingButton.checked = true;
		this.currentHashingTypeButtonState = this.linearProblingButton;

		// Add new controls
	}

	changeProbeType(newProbingType) {
		if (newProbingType === this.linearProblingButton) {
			this.linearProblingButton.checked = true;
			this.currentHashingTypeButtonState = this.linearProblingButton;
			for (let i = 0; i < this.table_size; i++) {
				this.skipDist[i] = i;
			}
		} else if (newProbingType === this.quadraticProbingButton) {
			this.quadraticProbingButton.checked = true;
			this.currentHashingTypeButtonState = this.quadraticProbingButton;

			for (let i = 0; i < this.table_size; i++) {
				this.skipDist[i] = i * i;
			}
		} else if (newProbingType === this.doubleHashingButton) {
			this.doubleHashingButton.checked = true;
			this.currentHashingTypeButtonState = this.doubleHashingButton;
		}
		this.commands = this.resetAll();
		return this.commands;
	}

	quadraticProbeCallback() {
		if (this.currentHashingTypeButtonState !== this.quadraticProbingButton) {
			this.implementAction(this.changeProbeType.bind(this), this.quadraticProbingButton);
		}
	}

	doubleHashingCallback() {
		if (this.currentHashingTypeButtonState !== this.doubleHashingButton) {
			this.implementAction(this.changeProbeType.bind(this), this.doubleHashingButton);
		}
	}

	linearProbeCallback() {
		if (this.currentHashingTypeButtonState !== this.linearProblingButton) {
			this.implementAction(this.changeProbeType.bind(this), this.linearProblingButton);
		}
	}

	insertElement(elem) {
		this.commands = [];
		this.cmd('SetText', this.ExplainLabel, 'Inserting element: ' + String(elem));
		let index = this.doHash(elem);

		index = this.getEmptyIndex(index, elem);
		this.cmd('SetText', this.ExplainLabel, '');
		if (index !== -1) {
			const labID = this.nextIndex++;
			this.cmd('CreateLabel', labID, elem, 20, 25);
			this.cmd(
				'Move',
				labID,
				this.indexXPos[index],
				this.indexYPos[index] - ARRAY_ELEM_HEIGHT
			);
			this.cmd('Step');
			this.cmd('Delete', labID);
			this.cmd('SetText', this.hashTableVisual[index], elem);
			this.hashTableValues[index] = elem;
			this.empty[index] = false;
			this.deleted[index] = false;
		}
		return this.commands;
	}

	resetSkipDist(elem, labelID) {
		const skipVal = 7 - (this.currHash % 7);
		this.cmd(
			'CreateLabel',
			labelID,
			'hash2(' +
				String(elem) +
				') = 1 - ' +
				String(this.currHash) +
				' % 7 = ' +
				String(skipVal),
			20,
			45,
			0
		);
		this.skipDist[0] = 0;
		for (let i = 1; i < this.table_size; i++) {
			this.skipDist[i] = this.skipDist[i - 1] + skipVal;
		}
	}

	getEmptyIndex(index, elem) {
		if (this.currentHashingTypeButtonState === this.doubleHashingButton) {
			this.resetSkipDist(elem, this.nextIndex++);
		}
		let foundIndex = -1;
		for (let i = 0; i < this.table_size; i++) {
			const candidateIndex = (index + this.skipDist[i]) % this.table_size;
			this.cmd('SetHighlight', this.hashTableVisual[candidateIndex], 1);
			this.cmd('Step');
			this.cmd('SetHighlight', this.hashTableVisual[candidateIndex], 0);
			if (this.empty[candidateIndex]) {
				foundIndex = candidateIndex;
				break;
			}
		}
		if (this.currentHashingTypeButtonState === this.doubleHashingButton) {
			this.cmd('Delete', --this.nextIndex);
		}
		return foundIndex;
	}

	getElemIndex(index, elem) {
		if (this.currentHashingTypeButtonState === this.doubleHashingButton) {
			this.resetSkipDist(elem, this.nextIndex++);
		}
		let foundIndex = -1;
		for (let i = 0; i < this.table_size; i++) {
			const candidateIndex = (index + this.skipDist[i]) % this.table_size;
			this.cmd('SetHighlight', this.hashTableVisual[candidateIndex], 1);
			this.cmd('Step');
			this.cmd('SetHighlight', this.hashTableVisual[candidateIndex], 0);
			if (!this.empty[candidateIndex] && this.hashTableValues[candidateIndex] === elem) {
				foundIndex = candidateIndex;
				break;
			} else if (this.empty[candidateIndex] && !this.deleted[candidateIndex]) {
				break;
			}
		}
		if (this.currentHashingTypeButtonState === this.doubleHashingButton) {
			this.cmd('Delete', --this.nextIndex);
		}
		return foundIndex;
	}

	deleteElement(elem) {
		this.commands = [];
		this.cmd('SetText', this.ExplainLabel, 'Deleting element: ' + elem);
		let index = this.doHash(elem);

		index = this.getElemIndex(index, elem);

		if (index > 0) {
			this.cmd(
				'SetText',
				this.ExplainLabel,
				'Deleting element: ' + elem + '  Element deleted'
			);
			this.empty[index] = true;
			this.deleted[index] = true;
			this.cmd('SetText', this.hashTableVisual[index], '<deleted>');
		} else {
			this.cmd(
				'SetText',
				this.ExplainLabel,
				'Deleting element: ' + elem + '  Element not in table'
			);
		}
		return this.commands;
	}

	findElement(elem) {
		this.commands = [];

		this.cmd('SetText', this.ExplainLabel, 'Finding Element: ' + elem);
		const index = this.doHash(elem);

		const found = this.getElemIndex(index, elem) !== -1;
		if (found) {
			this.cmd('SetText', this.ExplainLabel, 'Finding Element: ' + elem + '  Found!');
		} else {
			this.cmd('SetText', this.ExplainLabel, 'Finding Element: ' + elem + '  Not Found!');
		}
		return this.commands;
	}

	setup() {
		this.table_size = CLOSED_HASH_TABLE_SIZE;
		this.skipDist = new Array(this.table_size);
		this.hashTableVisual = new Array(this.table_size);
		this.hashTableIndices = new Array(this.table_size);
		this.hashTableValues = new Array(this.table_size);

		this.indexXPos = new Array(this.table_size);
		this.indexYPos = new Array(this.table_size);

		this.empty = new Array(this.table_size);
		this.deleted = new Array(this.table_size);

		this.ExplainLabel = this.nextIndex++;

		this.commands = [];

		for (let i = 0; i < this.table_size; i++) {
			this.skipDist[i] = i; // Start with linear probing
			let nextID = this.nextIndex++;
			this.empty[i] = true;
			this.deleted[i] = false;

			const nextXPos = ARRAY_ELEM_START_X + (i % this.elements_per_row) * ARRAY_ELEM_WIDTH;
			const nextYPos =
				ARRAY_ELEM_START_Y +
				Math.floor(i / this.elements_per_row) * ARRAY_VERTICAL_SEPARATION;
			this.cmd(
				'CreateRectangle',
				nextID,
				'',
				ARRAY_ELEM_WIDTH,
				ARRAY_ELEM_HEIGHT,
				nextXPos,
				nextYPos
			);
			this.hashTableVisual[i] = nextID;
			nextID = this.nextIndex++;
			this.hashTableIndices[i] = nextID;
			this.indexXPos[i] = nextXPos;
			this.indexYPos[i] = nextYPos + ARRAY_ELEM_HEIGHT;

			this.cmd('CreateLabel', nextID, i, this.indexXPos[i], this.indexYPos[i]);
			this.cmd('SetForegroundColor', nextID, INDEX_COLOR);
		}
		this.cmd('CreateLabel', this.ExplainLabel, '', 10, 25, 0);
		this.animationManager.StartNewAnimation(this.commands);
		this.animationManager.skipForward();
		this.animationManager.clearHistory();
		this.resetIndex = this.nextIndex;
	}

	resetAll() {
		this.commands = super.resetAll();

		for (let i = 0; i < this.table_size; i++) {
			this.empty[i] = true;
			this.deleted[i] = false;
			this.cmd('SetText', this.hashTableVisual[i], '');
		}
		return this.commands;
		// Clear array, etc
	}

	// NEED TO OVERRIDE IN PARENT
	reset() {
		for (let i = 0; i < this.table_size; i++) {
			this.empty[i] = true;
			this.deleted[i] = false;
		}
		this.nextIndex = this.resetIndex;
		super.reset();
	}

	resetCallback() {}

	disableUI() {
		super.disableUI();
		this.linearProblingButton.disabled = true;
		this.quadraticProbingButton.disabled = true;
		this.doubleHashingButton.disabled = true;
	}

	enableUI() {
		super.enableUI();
		this.linearProblingButton.disabled = false;
		this.quadraticProbingButton.disabled = false;
		this.doubleHashingButton.disabled = false;
	}
}
