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
	addLabelToAlgorithmBar,
} from './Algorithm.js';
import Hash from './Hash';
import { act } from '../anim/AnimationMain';

const ARRAY_ELEM_WIDTH = 60;
const ARRAY_ELEM_HEIGHT = 30;
const ARRAY_ELEM_START_Y = 200;

const CLOSED_HASH_TABLE_SIZE = 18;

const ARRAY_ELEM_START_X = 100;
// If you want to center the array:
// const ARRAY_ELEM_START_X = (window.screen.width - CLOSED_HASH_TABLE_SIZE * ARRAY_ELEM_WIDTH + ARRAY_ELEM_WIDTH) / 2;
const ELEMS_PER_ROW = 18;

const LOAD_LABEL_X = 100;
const LOAD_LABEL_Y = 20;

const HASH2_LABEL_X = 270;
const HASH2_LABEL_Y = 70;

const DEFAULT_LOAD_FACTOR = 0.67;

const INDEX_COLOR = '#0000FF';

const sin = x => -50 * Math.sin((x * Math.PI) / 4);
const exponential = x => -1 * Math.pow(1.41, x) + 200;
const quadratic = x => Math.pow(2.2 * x - 18.7, 2) - 150;
const logarithmic = x => -100 * Math.log(x + 0.4) + 170;
const mult_inverse = x => 250 / (2.8 * x - 24.1);

const EQUATIONS = [
	{
		name: 'sin',
		equation: sin,
	},
	{
		name: 'exponential',
		equation: exponential,
	},
	{
		name: 'quadratic',
		equation: quadratic,
	},
	{
		name: 'logarithmic',
		equation: logarithmic,
	},
	{
		name: 'multaplicative inverse',
		equation: mult_inverse,
	},
];

export default class NonLinearProbing extends Hash {
	constructor(am, w, h) {
		super(am, w, h);
		this.elements_per_row = ELEMS_PER_ROW;
		//this.elements_per_row = Math.floor(w / ARRAY_ELEM_WIDTH) - 1;

		this.setup();
	}

	addControls() {
		super.addControls();

		addDivisorToAlgorithmBar();

		this.fillButton = addControlToAlgorithmBar('Button', 'Fill HashMap');
		this.fillButton.onclick = this.fillCallback.bind(this);
		this.controls.push(this.fillButton);

		addDivisorToAlgorithmBar();

		addLabelToAlgorithmBar('Collision Strategy: h(elem) + i ???');
	}

	setup() {
		this.resetIndex = this.nextIndex;
		this.table_size = CLOSED_HASH_TABLE_SIZE;
		this.load_factor = DEFAULT_LOAD_FACTOR;
		this.skipDist = new Array(this.table_size);
		this.hashTableVisual = new Array(this.table_size);
		this.hashTableValues = new Array(this.table_size);
		this.size = 0;

		this.indexLabelID = new Array(this.table_size);
		this.indexXPos = new Array(this.table_size);
		this.indexYPos = new Array(this.table_size);
		this.indexEqYPos = new Array(this.table_size);

		this.empty = new Array(this.table_size);
		this.deleted = new Array(this.table_size);

		this.ExplainLabel = this.nextIndex++;

		this.HashIndexID = this.nextIndex++;

		// stores deleted index
		this.DelIndexLabel = this.nextIndex++;

		// stores the load factor
		this.loadFactorID = this.nextIndex++;

		this.commands = [];

		this.equation = EQUATIONS[parseInt(Math.random() * (EQUATIONS.length - 1))];
		console.log(this.equation.name);

		for (let i = 0; i < this.table_size; i++) {
			this.skipDist[i] = i + 1; // Start with "linear" probing
			this.hashTableVisual[i] = this.nextIndex++;
			this.empty[i] = true;
			this.deleted[i] = false;

			const nextXPos = ARRAY_ELEM_START_X + (i % this.elements_per_row) * ARRAY_ELEM_WIDTH;
			const nextYPos = ARRAY_ELEM_START_Y + Math.floor(i / this.elements_per_row);
			const nextEqYPos = ARRAY_ELEM_START_Y + this.equation.equation(i);
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
			this.indexEqYPos[i] = nextEqYPos;

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
		);
		this.animationManager.startNewAnimation(this.commands);
		this.animationManager.skipForward();
		this.animationManager.clearHistory();
	}

	fillCallback() {
		this.implementAction(this.fillMap.bind(this));
	}

	fillMap() {
		this.commands = [];
		const emptySpaces = this.hashTableValues.length - this.size;
		for (let i = 0; i < emptySpaces; i++) {
			this.insertElement(i, 'val', true);
			// this.commandsTemp = this.commands;
			// this.commandsTemp.push(this.insertElement(i, "val"));
			// this.commands = this.commandsTemp;
		}
		return this.commands;
	}

	insertElement(key, value, fill) {
		const entry = new MapEntry(key, value);
		const elem = entry.elem;
		if (!fill) {
			this.commands = [];
		}

		this.cmd(act.setText, this.ExplainLabel, 'Inserting element: ' + elem);
		this.cmd(act.step);

		let index = this.doHash(key);

		index = this.getEmptyIndex(index, key);

		if (index === -2) {
			this.cmd(
				act.setText,
				this.ExplainLabel,
				`Happy april fools!
                  - Grant, Liam, William, and the TAs :)`,
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
		this.cmd(act.step);

		//fun stuff :)
		this.cmd(
			act.move,
			this.hashTableVisual[index],
			this.indexXPos[index],
			this.indexEqYPos[index] - ARRAY_ELEM_HEIGHT,
		);
		this.cmd(
			act.move,
			this.indexLabelID[index],
			this.indexXPos[index],
			this.indexEqYPos[index],
		);
		this.cmd(act.step);

		this.hashTableValues[index] = entry;
		this.empty[index] = false;
		this.deleted[index] = false;
		this.size++;

		this.cmd(act.setText, this.ExplainLabel, '');
		this.cmd(act.setText, this.DelIndexLabel, '');
		return this.commands;
	}

	getEmptyIndex(index, key) {
		const HashID = -1;
		let skipVal = 1;

		let probes = 0;
		let removedIndex = -1;
		const start = index;
		this.cmd(act.setHighlight, this.hashTableVisual[index], 1);
		while (
			probes < this.table_size &&
			!this.empty[index] &&
			!(this.hashTableValues[index].key === key)
		) {
			this.cmd(act.setText, this.ExplainLabel, `Entry occupied, so probe forward`);
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

			if (this.currentHashingTypeButtonState === this.quadraticProbingButton) {
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
				this.cmd(act.setText, this.ExplainLabel, 'Inserting at earlier DEL spot');
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
		const HashID = -1;
		let skipVal = 1;

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

			if (this.currentHashingTypeButtonState === this.quadraticProbingButton) {
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

		const found = this.getElemIndex(index, key) !== -1;
		if (found) {
			this.cmd(
				act.setText,
				this.ExplainLabel,
				'Found Key: ' + key + '  Value: ' + this.hashTableValues[index].val,
			);
		} else {
			this.cmd(act.setText, this.ExplainLabel, 'Finding Key: ' + key + '  Not Found!');
		}
		return this.commands;
	}

	changeLoadFactor(LF) {
		this.commands = [];

		this.cmd(act.setText, this.loadFactorID, `Resizing? We don't do that here`);
		this.cmd(act.step);

		return this.commands;
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

	resetCallback() {}

	disableUI() {
		super.disableUI();
	}

	enableUI() {
		super.enableUI();
	}
}

class MapEntry {
	constructor(key, val) {
		this.key = key;
		this.val = val;
		this.elem = `<${key}, ${val}>`;
	}
}
