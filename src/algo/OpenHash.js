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

import {
	addControlToAlgorithmBar,
	addDivisorToAlgorithmBar,
	addDropDownGroupToAlgorithmBar,
	addGroupToAlgorithmBar,
	addLabelToAlgorithmBar,
} from './Algorithm.js';
import Hash from './Hash.js';
import { act } from '../anim/AnimationMain';

const ARRAY_ELEM_WIDTH = 85;
const ARRAY_ELEM_HEIGHT = 30;
const ARRAY_ELEM_START_Y = 110;
const ARRAY_VERTICAL_SEPARATION = 70;

const CLOSED_HASH_TABLE_SIZE = 7;

const ARRAY_ELEM_START_X = 100;
// If you want to center the array:
// const ARRAY_ELEM_START_X = (window.screen.width - CLOSED_HASH_TABLE_SIZE * ARRAY_ELEM_WIDTH + ARRAY_ELEM_WIDTH) / 2;
const ARRAY_RESIZE_ELEM_START_Y = 240;
const ELEMS_PER_ROW = 14;

const LOAD_LABEL_X = 15;
const LOAD_LABEL_Y = 15;

const HASH2_LABEL_X = 270;
const HASH2_LABEL_Y = 70;

const RESIZE_LABEL_X = 400;
const RESIZE_LABEL_Y = 20;

const DEFAULT_LOAD_FACTOR = 0.67;

const MAX_SIZE = 70;

const INDEX_COLOR = '#0000FF';

export default class OpenHash extends Hash {
	constructor(am, w, h) {
		super(am, w, h);
		this.elements_per_row = ELEMS_PER_ROW;
		//this.elements_per_row = Math.floor(w / ARRAY_ELEM_WIDTH) - 1;

		this.setup();
	}

	addControls() {
		super.addControls();

		this.probeTypeLabel = addLabelToAlgorithmBar('Probe Type:', this.dropDownLabelGroup);
		this.probeTypeDropDown = addDropDownGroupToAlgorithmBar(
			[
				['linear', 'Linear Probing: i = i_0 + probe_count'],
				['quadratic', 'Quadratic Probing: i = i_0 + probe_count^2'],
				['double', 'Double Hashing: i = i_0  + (probe_count * hash2(elem))'],
			],
			'Probing Type',
			this.dropDownGroup,
		);
		this.probeTypeDropDown.style.width = '132px';
		this.probeTypeDropDown.onchange = this.checkProbeType.bind(this);

		addDivisorToAlgorithmBar();

		this.hashTypeParentGroup = addGroupToAlgorithmBar(false);
		this.hashTypeLabelGroup = addGroupToAlgorithmBar(true, this.hashTypeParentGroup);
		this.hashTypedropDownGroup = addGroupToAlgorithmBar(true, this.hashTypeParentGroup);

		this.hashTypeLabel = addLabelToAlgorithmBar('Hash Type:', this.hashTypeLabelGroup);
		this.hashTypeDropDown = addDropDownGroupToAlgorithmBar(
			[
				['Integers', 'Hash Integers'],
				['Strings', 'Hash Strings'],
				['True', 'True Hash Function'],
			],
			'Hash Type',
			this.hashTypedropDownGroup,
		);
		this.hashTypeDropDown.onchange = this.checkHashType.bind(this);

		addDivisorToAlgorithmBar();

		// Random data button
		this.randomButton = addControlToAlgorithmBar('Button', 'Random', this.randomGroup);
		this.randomButton.onclick = this.randomCallback.bind(this);
		this.controls.push(this.randomButton);

		this.currentProbeType = 'linear';

		this.initialCapacityField.value = CLOSED_HASH_TABLE_SIZE;
	}

	checkProbeType() {
		if (this.probeTypeDropDown.value === 'linear') {
			this.implementAction(this.changeProbeType.bind(this), 'linear');
		} else if (this.probeTypeDropDown.value === 'quadratic') {
			this.implementAction(this.changeProbeType.bind(this), 'quadratic');
		} else if (this.probeTypeDropDown.value === 'double') {
			this.implementAction(this.changeProbeType.bind(this), 'double');
		}
	}

	changeProbeType(newProbingType) {
		if (newProbingType === 'linear') {
			this.currentProbeType = 'linear';
			for (let i = 0; i < this.table_size; i++) {
				this.skipDist[i] = i + 1;
			}
		} else if (newProbingType === 'quadratic') {
			this.currentProbeType = 'quadratic';

			for (let i = 0; i < this.table_size; i++) {
				this.skipDist[i] = (i + 1) * (i + 1);
			}
		} else if (newProbingType === 'double') {
			this.currentProbeType = 'double';
		}
		this.commands = this.resetAll();
		return this.commands;
	}

	randomCallback() {
		const LOWER_BOUND = 0;
		const UPPER_BOUND = 16;
		const MAX_SIZE = this.table_size * this.load_factor - 1;
		const MIN_SIZE = 2;
		const randomSize = Math.floor(Math.random() * (MAX_SIZE - MIN_SIZE + 1)) + MIN_SIZE;

		this.implementAction(this.resetAll.bind(this));

		for (let i = 0; i < randomSize; i++) {
			let key;
			let value;
			if (this.hashType === 'integers') {
				key = Math.floor(Math.random() * (UPPER_BOUND - LOWER_BOUND + 1)) + LOWER_BOUND;
				value = Math.floor(Math.random() * (UPPER_BOUND - LOWER_BOUND + 1)) + LOWER_BOUND;
			} else if (this.hashType === 'strings') {
				const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
				const letter = letters.charAt(Math.floor(Math.random() * letters.length));
				key = letter;
				value = Math.floor(Math.random() * (UPPER_BOUND - LOWER_BOUND + 1)) + LOWER_BOUND;
			} else if (this.hashType === 'true') {
				const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ;:/?=+=_-*&^%$#@!';
				const letter = letters.charAt(Math.floor(Math.random() * letters.length));
				key = letter;
				value = Math.floor(Math.random() * (UPPER_BOUND - LOWER_BOUND + 1)) + LOWER_BOUND;
			}
			this.implementAction(this.insertElement.bind(this), key.toString(), value);
			this.animationManager.skipForward();
			this.animationManager.clearHistory();
		}
	}

	insertElement(key, value) {
		const entry = new MapEntry(key, value);
		const elem = entry.elem;
		this.commands = [];
		if (
			(this.size + 1) / this.table_size > this.load_factor &&
			this.table_size * 2 + 1 < MAX_SIZE
		) {
			this.resize(false);
		}
		this.cmd(act.setText, this.ExplainLabel, 'Inserting element: ' + elem);
		this.cmd(act.step);

		let index = this.doHash(key);

		index = this.getEmptyIndex(index, key);

		if (index === -2 && this.table_size * 2 < MAX_SIZE) {
			this.resize(true);
			index = this.doHash(key);
			index = this.getEmptyIndex(index, key);
		} else if (index === -2) {
			this.cmd(
				act.setText,
				this.ExplainLabel,
				`Array would normally resize after length number of probes,
				however there just isn't enough space on the screen to resize. 
				So here's a cute emoji of jack instead: V•ᴥ•V`,
			);
			return this.commands;
		}

		if (
			this.hashTableValues[index] &&
			this.hashTableValues[index].key === key &&
			!this.deleted[index]
		) {
			this.cmd(
				act.setText,
				this.ExplainLabel,
				'Key ' + key + ' is already in HashMap, updating value.',
				``,
			);
			this.size--;
		}

		const labID = this.nextIndex++;
		this.cmd(act.createLabel, labID, elem, 20, 25);
		this.cmd(act.move, labID, this.indexXPos[index], this.indexYPos[index] - ARRAY_ELEM_HEIGHT);
		this.cmd(act.step);
		this.cmd(act.delete, labID);
		this.cmd(act.setText, this.hashTableVisual[index], elem);
		this.cmd(act.setHighlight, this.hashTableVisual[index], 0);
		this.hashTableValues[index] = entry;
		this.empty[index] = false;
		this.deleted[index] = false;
		this.size++;

		this.cmd(act.setText, this.ExplainLabel, '');
		this.cmd(act.setText, this.DelIndexLabel, '');
		return this.commands;
	}

	resetSkipDist(key, labelID) {
		const skipVal = this.nextLowestPrime - (this.currHash % this.nextLowestPrime);
		this.cmd(
			act.createLabel,
			labelID,
			`hash2(${String(key)}) = ` +
				`${this.nextLowestPrime} - ${String(this.currHash)} % ${
					this.nextLowestPrime
				} = ${String(skipVal)}`,
			HASH2_LABEL_X,
			HASH2_LABEL_Y,
			0,
		);
		this.skipDist[0] = skipVal;
		for (let i = 1; i < this.table_size; i++) {
			this.skipDist[i] = this.skipDist[i - 1] + skipVal;
		}
		return skipVal;
	}

	getEmptyIndex(index, key) {
		let HashID = -1;
		let skipVal = 1;
		if (this.currentProbeType === 'double') {
			HashID = this.nextIndex++;
			skipVal = this.resetSkipDist(key, HashID);
		}

		let probes = 0;
		let removedIndex = -1;
		const start = index;
		this.cmd(act.setHighlight, this.hashTableVisual[index], 1);
		while (
			probes < this.table_size &&
			!this.empty[index] &&
			!(this.hashTableValues[index].key === key)
		) {
			this.cmd(act.setText, this.ExplainLabel, `Index occupied, so probe forward`);
			this.cmd(act.step);
			// storing removed index
			if (removedIndex === -1 && this.deleted[index]) {
				this.cmd(act.setText, this.ExplainLabel, 'Storing index of first deleted element');
				this.cmd(act.setText, this.DelIndexLabel, 'First Deleted Index: ' + index);
				removedIndex = index;
				this.cmd(act.step);
			}

			// increment index and clear labels
			this.cmd(act.setHighlight, this.hashTableVisual[index], 0);
			this.cmd(act.setText, this.ExplainLabel, '');

			index = (start + this.skipDist[probes]) % this.table_size;

			if (this.currentProbeType === 'quadratic') {
				skipVal = probes + 1;
			}

			this.cmd(
				act.setText,
				this.HashIndexID,
				`Index to probe: (${start} + ${probes + 1}*${skipVal}) % ${this.table_size} =` +
					` ${(start + this.skipDist[probes]) % this.table_size}`,
			);

			this.cmd(act.setHighlight, this.hashTableVisual[index], 1);
			if (this.empty[index]) {
				this.cmd(
					act.setText,
					this.ExplainLabel,
					'Encountered null spot, so terminate loop',
				);
			} else if (this.hashTableValues[index].key === key) {
				this.cmd(
					act.setText,
					this.ExplainLabel,
					`Encountered matching key, so terminate loop`,
				);
			}
			probes++;
			this.cmd(act.step);
		}

		this.cmd(act.setText, this.HashIndexID, '');

		if (HashID !== -1) {
			this.cmd(act.delete, HashID);
			this.nextIndex--;
		}

		if (!this.empty[index] && this.hashTableValues[index].key === key && !this.deleted[index]) {
			this.cmd(act.setHighlight, this.hashTableVisual[index], 0);
			return index;
		} else if (probes === this.table_size && removedIndex === -1) {
			this.cmd(act.setHighlight, this.hashTableVisual[index], 0);
			return -2;
		} else {
			if (removedIndex !== -1) {
				this.cmd(act.setHighlight, this.hashTableVisual[index], 0);
				this.cmd(act.setText, this.ExplainLabel, 'Inserting at earliest DEL spot');
				index = removedIndex;
			} else if (this.hashTableValues[index] == null) {
				this.cmd(act.setText, this.ExplainLabel, 'Inserting at null spot');
			} else if (this.hashTableValues[index].key === key) {
				this.cmd(act.setText, this.ExplainLabel, 'Inserting at DEL spot with same key');
			}
			this.cmd(act.setHighlight, this.hashTableVisual[index], 1);
			this.cmd(act.step);
			return removedIndex !== -1 ? removedIndex : index;
		}
	}

	getElemIndex(index, key) {
		let HashID = -1;
		let skipVal = 1;
		if (this.currentProbeType === 'double') {
			HashID = this.nextIndex++;
			skipVal = this.resetSkipDist(key, HashID);
		}

		const start = index;
		let foundIndex = -1;
		let candidateIndex = index;
		for (let i = 0; i < this.table_size; i++) {
			this.cmd(act.setHighlight, this.hashTableVisual[candidateIndex], 1);
			this.cmd(act.step);
			this.cmd(act.setHighlight, this.hashTableVisual[candidateIndex], 0);
			if (
				!this.empty[candidateIndex] &&
				!this.deleted[candidateIndex] &&
				this.hashTableValues[candidateIndex].key === key
			) {
				foundIndex = candidateIndex;
				break;
			} else if (
				this.empty[candidateIndex] ||
				(this.deleted[candidateIndex] && this.hashTableValues[candidateIndex].key === key)
			) {
				break;
			}

			if (this.currentProbeType === 'quadratic') {
				skipVal = i + 1;
			}

			this.cmd(
				act.setText,
				this.HashIndexID,
				`Index to probe: (${start} + ${i + 1}*${skipVal}) % ${this.table_size} =` +
					` ${(start + this.skipDist[i]) % this.table_size}`,
			);
			candidateIndex = (index + this.skipDist[i]) % this.table_size;
		}

		this.cmd(act.setText, this.HashIndexID, '');
		if (HashID !== -1) {
			this.cmd(act.delete, HashID);
			this.nextIndex--;
		}

		return foundIndex;
	}

	deleteElement(key) {
		this.commands = [];
		this.cmd(act.setText, this.ExplainLabel, 'Deleting element with key: ' + key);
		let index = this.doHash(key);

		index = this.getElemIndex(index, key);

		if (index >= 0) {
			const elem = this.hashTableValues[index].elem;
			this.cmd(
				act.setText,
				this.ExplainLabel,
				'Deleting element: ' + elem + '  Element deleted',
			);
			// this.empty[index] = true;
			this.deleted[index] = true;
			this.cmd(act.setText, this.hashTableVisual[index], 'DEL');
			this.size--;
		} else {
			this.cmd(
				act.setText,
				this.ExplainLabel,
				'Deleting element with key: ' + key + '  Key not in table',
			);
		}
		return this.commands;
	}

	findElement(key) {
		this.commands = [];

		this.cmd(act.setText, this.ExplainLabel, 'Finding Key: ' + key);
		const index = this.doHash(key);

		const found = this.getElemIndex(index, key);
		if (found !== -1) {
			this.cmd(
				act.setText,
				this.ExplainLabel,
				'Found Key: ' + key + '  Value: ' + this.hashTableValues[found].val,
			);
		} else {
			this.cmd(act.setText, this.ExplainLabel, 'Finding Key: ' + key + '  Not Found!');
		}
		return this.commands;
	}

	resize(fromCycle) {
		this.cmd(act.setText, this.ExplainLabel, '');
		this.cmd(act.setText, this.DelIndexLabel, '');

		const resizeLabel = this.nextIndex++;
		if (!fromCycle) {
			this.cmd(
				act.createLabel,
				resizeLabel,
				`(Resize Required): (Size + 1.0 / length) > Load Factor --> (${this.size} + 1 / ${this.table_size}) > ${this.load_factor}`,
				RESIZE_LABEL_X,
				RESIZE_LABEL_Y,
			);
		} else {
			this.cmd(
				act.createLabel,
				resizeLabel,
				`(Resize Required): ${this.table_size} elements probed`,
				RESIZE_LABEL_X,
				RESIZE_LABEL_Y,
			);
		}

		this.table_size = this.table_size * 2 + 1;

		if (this.table_size * 2 + 1 > MAX_SIZE) {
			this.load_factor = 0.99;
			this.cmd(act.setText, this.loadFactorID, `Load Factor: ${this.load_factor}`);
			// this.loadButton.setAttribute('style', 'pointer-events: none; color: grey'); // removed for consistency, might revisit later
		}

		this.cmd(act.step);

		this.oldHashTableVisual = this.hashTableVisual;
		this.oldHashTableValues = this.hashTableValues;
		this.oldskipDist = this.skipDist;
		this.oldempty = this.empty;
		this.olddeleted = this.deleted;
		this.oldIndexXPos = this.indexXPos;
		this.oldIndexYPos = this.indexYPos;
		this.oldindexLabelID = this.indexLabelID;

		this.hashTableValues = new Array(this.table_size);
		this.hashTableVisual = new Array(this.table_size);
		this.skipDist = new Array(this.table_size);
		this.empty = new Array(this.table_size);
		this.deleted = new Array(this.table_size);
		this.indexXPos = new Array(this.table_size);
		this.indexYPos = new Array(this.table_size);
		this.indexLabelID = new Array(this.table_size);

		if (this.currentProbeType === 'linear') {
			for (let i = 0; i < this.table_size; i++) {
				this.skipDist[i] = i + 1;
			}
		} else if (this.currentProbeType === 'quadratic') {
			for (let i = 0; i < this.table_size; i++) {
				this.skipDist[i] = (i + 1) * (i + 1);
			}
		}

		for (let i = 0; i < this.table_size; i++) {
			this.hashTableVisual[i] = this.nextIndex++;
			this.empty[i] = true;
			this.deleted[i] = false;

			const nextXPos = ARRAY_ELEM_START_X + (i % this.elements_per_row) * ARRAY_ELEM_WIDTH;
			const nextYPos =
				ARRAY_RESIZE_ELEM_START_Y +
				Math.floor(i / this.elements_per_row) * ARRAY_VERTICAL_SEPARATION;
			this.cmd(
				act.createRectangle,
				this.hashTableVisual[i],
				'',
				ARRAY_ELEM_WIDTH,
				ARRAY_ELEM_HEIGHT,
				nextXPos,
				nextYPos,
			);
			this.indexLabelID[i] = this.nextIndex++;
			this.indexXPos[i] = nextXPos;
			this.indexYPos[i] = nextYPos + ARRAY_ELEM_HEIGHT;

			this.cmd(
				act.createLabel,
				this.indexLabelID[i],
				i,
				this.indexXPos[i],
				this.indexYPos[i],
			);
			this.cmd(act.setForegroundColor, this.indexLabelID[i], INDEX_COLOR);
		}
		this.cmd(act.step);

		let elementsMoved = 0;

		for (let i = 0; i < this.table_size / 2 && elementsMoved < this.size; i++) {
			this.cmd(act.setHighlight, this.oldHashTableVisual[i], 1);
			this.cmd(act.step);

			if (!this.oldempty[i] && !this.olddeleted[i]) {
				const oldElement = this.oldHashTableValues[i];

				let index = this.doHash(oldElement.key);

				index = this.getEmptyIndex(index, oldElement.key);

				if (index !== -1) {
					const labID = this.nextIndex++;
					this.cmd(
						act.createLabel,
						labID,
						oldElement.elem,
						this.oldIndexXPos[i],
						this.oldIndexYPos[i] - ARRAY_ELEM_HEIGHT,
					);
					this.cmd(
						act.move,
						labID,
						this.indexXPos[index],
						this.indexYPos[index] - ARRAY_ELEM_HEIGHT,
					);
					this.cmd(act.step);
					this.cmd(act.delete, labID);
					this.cmd(act.setText, this.hashTableVisual[index], oldElement.elem);
					this.cmd(act.setHighlight, this.hashTableVisual[index], 0);
					this.hashTableValues[index] = oldElement;
					this.empty[index] = false;
					this.deleted[index] = false;
					elementsMoved++;
				}
			}

			this.cmd(act.setHighlight, this.oldHashTableVisual[i], 0);
		}

		this.cmd(act.delete, resizeLabel);

		for (let i = 0; i < this.table_size; i++) {
			const nextXPos = ARRAY_ELEM_START_X + (i % this.elements_per_row) * ARRAY_ELEM_WIDTH;
			const nextYPos =
				ARRAY_ELEM_START_Y +
				Math.floor(i / this.elements_per_row) * ARRAY_VERTICAL_SEPARATION;
			if (i < (this.table_size - 1) / 2) {
				this.cmd(act.delete, this.oldHashTableVisual[i]);
				this.cmd(act.delete, this.oldindexLabelID[i]);
			}
			this.cmd(act.move, this.hashTableVisual[i], nextXPos, nextYPos);
			this.cmd(act.move, this.indexLabelID[i], nextXPos, nextYPos + ARRAY_ELEM_HEIGHT);
			this.indexYPos[i] = nextYPos + ARRAY_ELEM_HEIGHT;
		}

		return this.commands;
	}

	changeLoadFactor(LF) {
		this.commands = [];

		if (this.table_size * 2 + 1 <= MAX_SIZE) {
			this.load_factor = LF;
			this.cmd(act.setText, this.loadFactorID, `Load Factor: ${this.load_factor}`);
		} else {
			this.cmd(
				act.setText,
				this.loadFactorID,
				`Load Factor: ${this.load_factor}\n(Array length too large for resize)`,
			);
		}
		this.cmd(act.step);

		return this.commands;
	}

	setup() {
		this.resetIndex = this.nextIndex;
		this.table_size = CLOSED_HASH_TABLE_SIZE;
		this.nextLowestPrime = 11;
		this.load_factor = DEFAULT_LOAD_FACTOR;
		this.skipDist = new Array(this.table_size);
		this.hashTableVisual = new Array(this.table_size);
		this.hashTableValues = new Array(this.table_size);
		this.size = 0;

		this.indexLabelID = new Array(this.table_size);
		this.indexXPos = new Array(this.table_size);
		this.indexYPos = new Array(this.table_size);

		this.empty = new Array(this.table_size);
		this.deleted = new Array(this.table_size);

		this.ExplainLabel = this.nextIndex++;

		this.HashIndexID = this.nextIndex++;

		// stores deleted index
		this.DelIndexLabel = this.nextIndex++;

		// stores the load factor
		this.loadFactorID = this.nextIndex++;

		this.commands = [];

		for (let i = 0; i < this.table_size; i++) {
			this.skipDist[i] = i + 1; // Start with linear probing
			this.hashTableVisual[i] = this.nextIndex++;
			this.empty[i] = true;
			this.deleted[i] = false;

			const nextXPos = ARRAY_ELEM_START_X + (i % this.elements_per_row) * ARRAY_ELEM_WIDTH;
			const nextYPos =
				ARRAY_ELEM_START_Y +
				Math.floor(i / this.elements_per_row) * ARRAY_VERTICAL_SEPARATION;
			this.cmd(
				act.createRectangle,
				this.hashTableVisual[i],
				'',
				ARRAY_ELEM_WIDTH,
				ARRAY_ELEM_HEIGHT,
				nextXPos,
				nextYPos,
			);
			this.indexLabelID[i] = this.nextIndex++;
			this.indexXPos[i] = nextXPos;
			this.indexYPos[i] = nextYPos + ARRAY_ELEM_HEIGHT;

			this.cmd(
				act.createLabel,
				this.indexLabelID[i],
				i,
				this.indexXPos[i],
				this.indexYPos[i],
			);
			this.cmd(act.setForegroundColor, this.indexLabelID[i], INDEX_COLOR);
		}
		this.cmd(act.createLabel, this.ExplainLabel, '', 10, 40, 0);
		this.cmd(act.createLabel, this.HashIndexID, '', HASH2_LABEL_X + 300, HASH2_LABEL_Y + 5);
		this.cmd(act.createLabel, this.DelIndexLabel, '', 10, 60, 0);
		this.cmd(
			act.createLabel,
			this.loadFactorID,
			`Load Factor: ${this.load_factor}`,
			LOAD_LABEL_X,
			LOAD_LABEL_Y,
			false,
		);
		this.animationManager.startNewAnimation(this.commands);
		this.animationManager.skipForward();
		this.animationManager.clearHistory();
	}

	resetAll() {
		this.commands = super.resetAll();

		this.size = 0;

		for (let i = 0; i < this.table_size; i++) {
			this.empty[i] = true;
			this.deleted[i] = false;
			this.hashTableValues[i] = undefined;
			this.cmd(act.setText, this.hashTableVisual[i], '');
		}

		return this.commands;
		// Clear array, etc
	}

	// NEED TO OVERRIDE IN PARENT
	reset() {
		this.nextIndex = this.resetIndex;
		this.table_size = CLOSED_HASH_TABLE_SIZE;
		this.load_factor = DEFAULT_LOAD_FACTOR;
		this.size = 0;

		this.empty = new Array(this.table_size);
		this.deleted = new Array(this.table_size);
		this.hashTableVisual = new Array(this.table_size);
		this.hashTableValues = new Array(this.table_size);
		this.indexLabelID = new Array(this.table_size);

		this.ExplainLabel = this.nextIndex++;

		this.HashIndexID = this.nextIndex++;

		// stores deleted index
		this.DelIndexLabel = this.nextIndex++;

		// stores the load factor
		this.loadFactorID = this.nextIndex++;

		for (let i = 0; i < this.table_size; i++) {
			this.empty[i] = true;
			this.deleted[i] = false;
			this.hashTableVisual[i] = this.nextIndex++;
			this.indexLabelID[i] = this.nextIndex++;
		}

		super.reset();
	}

	clear() {
		this.commands = [];
		this.resetAll();

		for (let i = 0; i < this.table_size; i++) {
			this.cmd(act.delete, this.hashTableVisual[i]);
			this.cmd(act.delete, this.indexLabelID[i]);
		}

		this.table_size = parseInt(this.initialCapacityField.value)
			? Math.min(Math.max(0, parseInt(this.initialCapacityField.value)), MAX_SIZE)
			: CLOSED_HASH_TABLE_SIZE;

		if (this.table_size * 2 + 1 > MAX_SIZE) {
			this.load_factor = 0.99;
			this.cmd(
				act.setText,
				this.loadFactorID,
				`Load Factor: ${this.load_factor}\n(Array length too large for resize)`,
			);
			this.cmd(act.step);
		} else {
			this.load_factor = DEFAULT_LOAD_FACTOR;
			this.cmd(act.setText, this.loadFactorID, `Load Factor: ${this.load_factor}`);
			this.cmd(act.step);
		}
		this.empty = Array(this.table_size);
		this.deleted = Array(this.table_size);
		const newHashTableVisual = Array(this.table_size);
		const newIndexLabelID = Array(this.table_size);
		this.hashTableValues = Array(this.table_size);

		for (let i = 0; i < this.table_size; i++) {
			newHashTableVisual[i] = this.nextIndex++;
			const nextXPos = ARRAY_ELEM_START_X + (i % this.elements_per_row) * ARRAY_ELEM_WIDTH;
			const nextYPos =
				ARRAY_ELEM_START_Y +
				Math.floor(i / this.elements_per_row) * ARRAY_VERTICAL_SEPARATION;
			this.cmd(
				act.createRectangle,
				newHashTableVisual[i],
				'',
				ARRAY_ELEM_WIDTH,
				ARRAY_ELEM_HEIGHT,
				nextXPos,
				nextYPos,
			);

			newIndexLabelID[i] = this.nextIndex++;
			this.indexXPos[i] = nextXPos;
			this.indexYPos[i] = nextYPos + ARRAY_ELEM_HEIGHT;
			this.cmd(act.createLabel, newIndexLabelID[i], i, this.indexXPos[i], this.indexYPos[i]);
			this.cmd(act.setForegroundColor, newIndexLabelID[i], INDEX_COLOR);

			this.empty[i] = true;
			this.deleted[i] = false;
			this.hashTableValues[i] = undefined;
		}
		this.size = 0;
		this.hashTableVisual = newHashTableVisual;
		this.indexLabelID = newIndexLabelID;
		return this.commands;
	}

	resetCallback() {}

	disableUI() {
		super.disableUI();
		// 'linear'.disabled = true;
		// 'quadratic'.disabled = true;
		// 'double'.disabled = true;
	}

	enableUI() {
		super.enableUI();
		// 'linear'.disabled = false;
		// 'quadratic'.disabled = false;
		// 'double'.disabled = false;
	}
}

class MapEntry {
	constructor(key, val) {
		this.key = key;
		this.val = val;
		this.elem = `<${key}, ${val}>`;
	}
}
