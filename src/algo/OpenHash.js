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
import { act } from '../anim/AnimationMain';

const POINTER_ARRAY_ELEM_WIDTH = 50;
const POINTER_ARRAY_ELEM_HEIGHT = 25;
const POINTER_ARRAY_ELEM_START_X = 70;
const POINTER_ARRAY_ELEM_START_Y = 100;

const RESIZE_POINTER_ARRAY_ELEM_START_X = 670;
const RESIZE_POINTER_ARRAY_ELEM_START_Y = 50;
const RESIZE_LABEL_X = 800;
const RESIZE_LABEL_Y = 20;

const LINKED_ITEM_WIDTH = 70;
const LINKED_ITEM_HEIGHT = 20;

const LINKED_ITEM_INITIAL_X = 60;
const LINKED_ITEM_INITIAL_Y = 40;
const LINKED_ITEM_X_DELTA_INIT = 70;
const LINKED_ITEM_X_DELTA = 90;

const EXPLAIN_LABEL_X = 550;
const EXPLAIN_LABEL_Y = 15;

const HASH_TABLE_SIZE = 7;

const DEFAULT_LOAD_FACTOR = 0.67;

const LOAD_LABEL_X = 60;
const LOAD_LABEL_Y = 20;

const MAX_SIZE = 30;

const INDEX_COLOR = '#0000FF';

export default class OpenHash extends Hash {
	constructor(am, w, h) {
		super(am, w, h);
		this.nextIndex = 0;
		this.POINTER_ARRAY_ELEM_Y = h - POINTER_ARRAY_ELEM_WIDTH;
		this.setup();
	}

	addControls() {
		super.addControls();
	}

	setup() {
		this.hashTableVisual = new Array(HASH_TABLE_SIZE);
		this.hashTableIndices = new Array(HASH_TABLE_SIZE);
		this.hashTableValues = new Array(HASH_TABLE_SIZE);
		this.indexXPos = new Array(HASH_TABLE_SIZE);
		this.indexYPos = new Array(HASH_TABLE_SIZE);

		this.ExplainLabel = this.nextIndex++;

		this.loadFactorID = this.nextIndex++;

		this.size = 0;

		this.table_size = HASH_TABLE_SIZE;

		this.load_factor = DEFAULT_LOAD_FACTOR;

		this.resetIndex = this.nextIndex;

		this.commands = [];
		for (let i = 0; i < HASH_TABLE_SIZE; i++) {
			let nextID = this.nextIndex++;

			this.cmd(
				act.createRectangle,
				nextID,
				'',
				POINTER_ARRAY_ELEM_WIDTH,
				POINTER_ARRAY_ELEM_HEIGHT,
				POINTER_ARRAY_ELEM_START_X,
				POINTER_ARRAY_ELEM_START_Y + i * POINTER_ARRAY_ELEM_HEIGHT,
			);
			this.hashTableVisual[i] = nextID;
			this.cmd(act.setNull, this.hashTableVisual[i], 1);

			nextID = this.nextIndex++;
			this.hashTableIndices[i] = nextID;
			this.hashTableValues[i] = null;

			this.indexXPos[i] = POINTER_ARRAY_ELEM_START_X - POINTER_ARRAY_ELEM_WIDTH;
			this.indexYPos[i] = POINTER_ARRAY_ELEM_START_Y + i * POINTER_ARRAY_ELEM_HEIGHT;

			this.cmd(act.createLabel, nextID, i, this.indexXPos[i], this.indexYPos[i]);
			this.cmd(act.setForegroundColor, nextID, INDEX_COLOR);
		}
		this.cmd(
			act.createLabel,
			this.loadFactorID,
			`Load Factor: ${this.load_factor}`,
			LOAD_LABEL_X,
			LOAD_LABEL_Y,
		);
		this.cmd(act.createLabel, this.ExplainLabel, '', EXPLAIN_LABEL_X, EXPLAIN_LABEL_Y, 0);
		this.animationManager.startNewAnimation(this.commands);
		this.animationManager.skipForward();
		this.animationManager.clearHistory();
	}

	insertElement(key, value) {
		const elem = `<${key}, ${value}>`;
		this.commands = [];

		this.cmd(act.setText, this.loadFactorID, `Load Factor: ${this.load_factor}`);

		if (
			(this.size + 1) / this.table_size > this.load_factor &&
			this.table_size * 2 + 1 < MAX_SIZE
		) {
			this.resize();
		}

		this.cmd(act.setText, this.ExplainLabel, 'Inserting element ' + elem);
		const node = new LinkedListNode(key, value, this.nextIndex++, LINKED_ITEM_INITIAL_X, LINKED_ITEM_INITIAL_Y);
		this.cmd(
			act.createLinkedListNode,
			node.graphicID,
			elem,
			LINKED_ITEM_WIDTH,
			LINKED_ITEM_HEIGHT,
			LINKED_ITEM_INITIAL_X,
			LINKED_ITEM_INITIAL_Y,
			0.25,
			0,
			1
		);

		const index = this.doHash(key);

		let found = false;
		let prev = null;
		let old;
		if (this.hashTableValues[index] != null) {
			// Search for duplicates
			this.cmd(act.setText, this.ExplainLabel, 'Searching for duplicates of ' + key);

			const compareIndex = this.nextIndex++;
			let tmp = this.hashTableValues[index];
			this.cmd(act.createLabel, compareIndex, '', EXPLAIN_LABEL_X, EXPLAIN_LABEL_Y + 30, 0);
			while (tmp != null && !found) {
				this.cmd(act.setHighlight, tmp.graphicID, 1);
				if (tmp.key === key) {
					this.cmd(act.setText, compareIndex, tmp.key + '==' + key);
					old = tmp;
					found = true;
					this.cmd(act.step);
					this.cmd(act.setHighlight, tmp.graphicID, 0);
					break;
				} else {
					this.cmd(act.setText, compareIndex, tmp.key + '!=' + key);
				}
				this.cmd(act.step);
				this.cmd(act.setHighlight, tmp.graphicID, 0);
				prev = tmp;
				tmp = tmp.next;
			}

			this.cmd(act.delete, compareIndex);
			this.nextIndex--;
		} else {
			this.cmd(act.setNull, node.graphicID, 1);
			this.cmd(act.setNull, this.hashTableVisual[index], 0);
		}

		if (found) {
			this.cmd(
				act.setText,
				this.ExplainLabel,
				'Key ' + key + ' is already in HashMap, updating value.',
			);
			this.cmd(act.delete, old.graphicID);
			node.next = old.next;

			if (prev != null) {
				prev.next = node;
				this.cmd(act.connect, prev.graphicID, node.graphicID);
			} else {
				this.cmd(
					act.disconnect,
					this.hashTableVisual[index],
					this.hashTableValues[index].graphicID,
				);
				this.cmd(act.connect, this.hashTableVisual[index], node.graphicID);
				this.hashTableValues[index] = node;
			}
			if (node.next != null) {
				this.cmd(act.connect, node.graphicID, node.next.graphicID);
			} else {
				this.cmd(act.setNull, node.graphicID, 1);
			}

			this.repositionList(index, this.hashTableValues[index]);
			this.cmd(act.step);
		} else {
			this.cmd(act.setText, this.ExplainLabel, 'Duplicate of  ' + key + '  not found!');
			this.cmd(act.step);

			if (this.hashTableValues[index] != null) {
				this.cmd(act.connect, node.graphicID, this.hashTableValues[index].graphicID);
				this.cmd(
					act.disconnect,
					this.hashTableVisual[index],
					this.hashTableValues[index].graphicID,
				);
			}

			this.cmd(act.connect, this.hashTableVisual[index], node.graphicID);
			node.next = this.hashTableValues[index];
			this.hashTableValues[index] = node;
			this.repositionList(index, this.hashTableValues[index]);
			this.size++;
		}

		this.cmd(act.setText, this.ExplainLabel, '');

		return this.commands;
	}

	repositionList(index, tmp) {
		let startX = POINTER_ARRAY_ELEM_START_X + LINKED_ITEM_X_DELTA_INIT;
		const startY = POINTER_ARRAY_ELEM_START_Y + index * POINTER_ARRAY_ELEM_HEIGHT;
		// let tmp = this.hashTableValues[index];
		while (tmp != null) {
			tmp.x = startX;
			tmp.y = startY;
			this.cmd(act.move, tmp.graphicID, tmp.x, tmp.y);
			startX = startX + LINKED_ITEM_X_DELTA;
			tmp = tmp.next;
		}
	}

	repositionResizeList(index) {
		let startX = RESIZE_POINTER_ARRAY_ELEM_START_X + LINKED_ITEM_X_DELTA_INIT;
		const startY = RESIZE_POINTER_ARRAY_ELEM_START_Y + index * POINTER_ARRAY_ELEM_HEIGHT;
		let tmp = this.hashTableValues[index];
		while (tmp != null) {
			tmp.x = startX;
			tmp.y = startY;
			this.cmd(act.move, tmp.graphicID, tmp.x, tmp.y);
			startX = startX + LINKED_ITEM_X_DELTA;
			tmp = tmp.next;
		}
	}

	deleteElement(key) {
		this.commands = [];
		this.cmd(act.setText, this.ExplainLabel, 'Deleting entry with key: ' + key);
		const index = this.doHash(key);
		if (this.hashTableValues[index] == null) {
			this.cmd(
				act.setText,
				this.ExplainLabel,
				'Deleting entry with key: ' + key + '  Key not in table',
			);
			return this.commands;
		}
		this.cmd(act.setHighlight, this.hashTableValues[index].graphicID, 1);
		this.cmd(act.step);
		this.cmd(act.setHighlight, this.hashTableValues[index].graphicID, 0);
		if (this.hashTableValues[index].key === key) {
			if (this.hashTableValues[index].next != null) {
				this.cmd(
					act.connect,
					this.hashTableVisual[index],
					this.hashTableValues[index].next.graphicID,
				);
			} else {
				this.cmd(act.setNull, this.hashTableVisual[index], 1);
			}
			this.cmd(act.delete, this.hashTableValues[index].graphicID);
			this.hashTableValues[index] = this.hashTableValues[index].next;
			this.repositionList(index, this.hashTableValues[index]);
			return this.commands;
		}
		let tmpPrev = this.hashTableValues[index];
		let tmp = this.hashTableValues[index].next;
		let found = false;
		while (tmp != null && !found) {
			this.cmd(act.setHighlight, tmp.graphicID, 1);
			this.cmd(act.step);
			this.cmd(act.setHighlight, tmp.graphicID, 0);
			if (tmp.key === key) {
				found = true;
				this.cmd(
					act.setText,
					this.ExplainLabel,
					'Deleting entry with key: ' + key + '  Entry deleted',
				);
				if (tmp.next != null) {
					this.cmd(act.connect, tmpPrev.graphicID, tmp.next.graphicID);
				} else {
					this.cmd(act.setNull, tmpPrev.graphicID, 1);
				}
				tmpPrev.next = tmpPrev.next.next;
				this.cmd(act.delete, tmp.graphicID);
				this.repositionList(index, this.hashTableValues[index]);
			} else {
				tmpPrev = tmp;
				tmp = tmp.next;
			}
		}
		if (!found) {
			this.cmd(
				act.setText,
				this.ExplainLabel,
				'Deleting entry with key: ' + key + '  Key not in table',
			);
		}
		return this.commands;
	}

	findElement(key) {
		this.commands = [];
		this.cmd(act.setText, this.ExplainLabel, 'Finding entry with key: ' + key);

		const index = this.doHash(key);
		const compareIndex = this.nextIndex++;
		let found = false;
		let tmp = this.hashTableValues[index];
		let value = null;
		this.cmd(act.createLabel, compareIndex, '', 10, 40, 0);
		while (tmp != null && !found) {
			this.cmd(act.setHighlight, tmp.graphicID, 1);
			if (tmp.key === key) {
				this.cmd(act.setText, compareIndex, tmp.key + '==' + key);
				found = true;
				value = tmp.val;
			} else {
				this.cmd(act.setText, compareIndex, tmp.key + '!=' + key);
			}
			this.cmd(act.step);
			this.cmd(act.setHighlight, tmp.graphicID, 0);
			tmp = tmp.next;
		}
		if (found) {
			this.cmd(act.setText, this.ExplainLabel, 'Found entry with key: ' + key + '  Value: ' + value);
		} else {
			this.cmd(
				act.setText,
				this.ExplainLabel,
				'Finding entry with key: ' + key + '  Not Found!',
			);
		}
		this.cmd(act.delete, compareIndex);
		this.nextIndex--;
		return this.commands;
	}

	resize() {
		this.commands = [];

		this.cmd(act.setText, this.ExplainLabel, '');

		const resizeLabel = this.nextIndex++;
		this.cmd(
			act.createLabel,
			resizeLabel,
			`(Resize Required): (Size + 1 / length) > Load Factor --> (${this.size} + 1 / ${
				this.table_size
			}) > ${this.load_factor}`,
			RESIZE_LABEL_X,
			RESIZE_LABEL_Y,
		);

		this.table_size = this.table_size * 2 + 1;

		if (this.table_size * 2 + 1 > MAX_SIZE) {
			this.load_factor = 0.99;
			this.cmd(act.setText, this.loadFactorID, `Load Factor: ${this.load_factor}`);
		}

		this.cmd(act.step);

		this.oldHashTableVisual = this.hashTableVisual;
		this.oldHashTableValues = this.hashTableValues;
		this.oldHashTableIndices = this.hashTableIndices;
		this.oldIndexXPos = this.indexXPos;
		this.oldIndexYPos = this.indexYPos;

		this.hashTableValues = new Array(this.table_size);
		this.hashTableVisual = new Array(this.table_size);
		this.hashTableIndices = new Array(this.table_size);
		this.indexXPos = new Array(this.table_size);
		this.indexYPos = new Array(this.table_size);

		for (let i = 0; i < this.table_size; i++) {
			let nextID = this.nextIndex++;

			this.cmd(
				act.createRectangle,
				nextID,
				'',
				POINTER_ARRAY_ELEM_WIDTH,
				POINTER_ARRAY_ELEM_HEIGHT,
				RESIZE_POINTER_ARRAY_ELEM_START_X,
				RESIZE_POINTER_ARRAY_ELEM_START_Y + i * POINTER_ARRAY_ELEM_HEIGHT,
			);
			this.hashTableVisual[i] = nextID;
			this.cmd(act.setNull, this.hashTableVisual[i], 1);

			nextID = this.nextIndex++;
			this.hashTableIndices[i] = nextID;
			this.hashTableValues[i] = null;

			this.indexXPos[i] = RESIZE_POINTER_ARRAY_ELEM_START_X - POINTER_ARRAY_ELEM_WIDTH;
			this.indexYPos[i] = RESIZE_POINTER_ARRAY_ELEM_START_Y + i * POINTER_ARRAY_ELEM_HEIGHT;

			this.cmd(act.createLabel, nextID, i, this.indexXPos[i], this.indexYPos[i]);
			this.cmd(act.setForegroundColor, nextID, INDEX_COLOR);
		}

		for (let i = 0; i < (this.table_size - 1) / 2; i++) {
			this.cmd(act.setHighlight, this.oldHashTableVisual[i], 1);
			this.cmd(act.step);

			while (this.oldHashTableValues[i] != null) {
				this.cmd(act.setHighlight, this.oldHashTableVisual[i], 0);

				const node = this.oldHashTableValues[i];
				this.cmd(act.setHighlight, node.graphicID, 1);
				this.cmd(act.step);

				this.cmd(act.move, node.graphicID, LINKED_ITEM_INITIAL_X, LINKED_ITEM_INITIAL_Y);

				this.oldHashTableValues[i] = this.oldHashTableValues[i].next;

				this.cmd(act.disconnect, this.oldHashTableVisual[i], node.graphicID);
				if (this.oldHashTableValues[i] != null) {
					this.cmd(act.connect, this.oldHashTableVisual[i], this.oldHashTableValues[i].graphicID);
					this.cmd(act.disconnect, node.graphicID, this.oldHashTableValues[i].graphicID);
					this.repositionList(i, this.oldHashTableValues[i]);
				} else {
					this.cmd(act.setNull, this.oldHashTableVisual[i], 1);
				}
				this.cmd(act.step);

				const index = this.doHash(node.key);

				node.next = this.hashTableValues[index];
				this.cmd(act.setNull, node.graphicID, 1);
				this.cmd(act.setNull, this.hashTableVisual[index], 0);

				if (node.next != null) {
					this.cmd(
						act.disconnect,
						this.hashTableVisual[index],
						node.next.graphicID,
					);
					this.cmd(act.connect, node.graphicID, node.next.graphicID);
				}
				this.cmd(act.connect, this.hashTableVisual[index], node.graphicID);
				this.hashTableValues[index] = node;
				this.repositionResizeList(index);
				
				this.cmd(act.setHighlight, node.graphicID, 0);
			}
			this.cmd(act.setHighlight, this.oldHashTableVisual[i], 0);
		}
		this.cmd(act.step);

		for (let i = 0; i < (this.table_size - 1) / 2; i++) {
			this.cmd(act.setNull, this.oldHashTableVisual[i], 1);
			this.cmd(act.delete, this.oldHashTableVisual[i]);
			this.cmd(act.delete, this.oldHashTableIndices[i]);
		}

		for (let i = 0; i < this.table_size; i++) {
			const xpos = POINTER_ARRAY_ELEM_START_X;
			const ypos = POINTER_ARRAY_ELEM_START_Y + i * POINTER_ARRAY_ELEM_HEIGHT;

			this.indexXPos[i] = POINTER_ARRAY_ELEM_START_X - POINTER_ARRAY_ELEM_WIDTH;
			this.indexYPos[i] = POINTER_ARRAY_ELEM_START_Y + i * POINTER_ARRAY_ELEM_HEIGHT;

			this.cmd(act.move, this.hashTableVisual[i], xpos, ypos);
			this.cmd(act.move, this.hashTableIndices[i], xpos - POINTER_ARRAY_ELEM_WIDTH, ypos);

			let index = 0;
			let tmp = this.hashTableValues[i];
			while (tmp != null) {
				this.cmd(act.move, tmp.graphicID, xpos + LINKED_ITEM_X_DELTA_INIT + (LINKED_ITEM_X_DELTA * index), ypos);
				index++;
				tmp = tmp.next;
			}
		}

		this.cmd(act.delete, resizeLabel);
		this.cmd(act.step);
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
				`Load Factor: ${this.load_factor}
			(Max Array Length)`,
			);
		}
		this.cmd(act.step);

		return this.commands;
	}

	resetAll() {
		let tmp;
		this.commands = super.resetAll();

		this.size = 0;

		for (let i = 0; i < this.hashTableValues.length; i++) {
			tmp = this.hashTableValues[i];
			if (tmp != null) {
				while (tmp != null) {
					this.cmd(act.delete, tmp.graphicID);
					tmp = tmp.next;
				}
				this.hashTableValues[i] = null;
				this.cmd(act.setNull, this.hashTableVisual[i], 1);
			}
		}
		return this.commands;
	}

	// NEED TO OVERRIDE IN PARENT
	reset() {
		this.nextIndex = this.resetIndex;
		this.table_size = HASH_TABLE_SIZE;
		this.load_factor = DEFAULT_LOAD_FACTOR;
		this.size = 0;

		this.hashTableVisual = new Array(this.table_size);
		this.hashTableValues = new Array(this.table_size);
		this.hashTableIndices = new Array(HASH_TABLE_SIZE);

		this.indexXPos = new Array(HASH_TABLE_SIZE);
		this.indexYPos = new Array(HASH_TABLE_SIZE);

		for (let i = 0; i < this.table_size; i++) {
			this.hashTableValues[i] = null;
			this.hashTableVisual[i] = this.nextIndex++;
			this.hashTableIndices[i] = this.nextIndex++;
		}
		
		super.reset();
	}

	/*this.nextIndex = 0;
 this.commands = [];
 this.cmd(act.createLabel, 0, "", 20, 50, 0);
 this.animationManager.startNewAnimation(this.commands);
 this.animationManager.skipForward();
 this.animationManager.clearHistory(); */

	disableUI() {
		super.disableUI();
	}

	enableUI() {
		super.enableUI();
	}
}

class LinkedListNode {
	constructor(key, val, id, initialX, initialY) {
		this.key = key;
		this.val = val;
		this.graphicID = id;
		this.x = initialX;
		this.y = initialY;
		this.next = null;
	}
}
