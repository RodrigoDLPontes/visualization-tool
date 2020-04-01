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

import Graph, { EDGE_COLOR, VERTEX_INDEX_COLOR } from './Graph.js';
import { addControlToAlgorithmBar, addDivisorToAlgorithmBar, } from './Algorithm.js';
import { act } from '../anim/AnimationMain';

const MESSAGE_LABEL_X = 30;
const MESSAGE_LABEL_Y = 15;

const FIND_LABEL_1_X = 30;
const FIND_LABEL_2_X = 100;
const FIND_LABEL_1_Y = 40;
const FIND_LABEL_2_Y = FIND_LABEL_1_Y;

const PQ_LABEL_X = 145;
const PQ_LABEL_Y = 67;

const SET_ARRAY_ELEM_WIDTH = 22;
const SET_ARRAY_ELEM_HEIGHT = 22;
const SET_ARRAY_START_X = 52;
const SET_ARRAY_START_Y = 100;

const EDGE_LIST_ELEM_WIDTH = 40;
const EDGE_LIST_ELEM_HEIGHT = 40;
const EDGE_LIST_COLUMN_WIDTH = 100;
const EDGE_LIST_MAX_PER_COLUMN = 10;

const EDGE_LIST_START_X = 150;
const EDGE_LIST_START_Y = 110;

const HIGHLIGHT_CIRCLE_COLOR_1 = '#FF9999';
const HIGHLIGHT_CIRCLE_COLOR_2 = '#FF0000';

const MST_EDGE_COLOR = '#3399FF';
const MST_EDGE_THICKNESS = 4;

export default class Kruskals extends Graph {
	constructor(am, w, h) {
		super(am, w, h, false, false, true);
		this.addControls();
	}

	addControls() {
		this.startButton = addControlToAlgorithmBar('Button', 'Run');
		this.startButton.onclick = this.startCallback.bind(this);
		this.controls.push(this.startButton);

		addDivisorToAlgorithmBar();

		super.addControls(false);
	}

	setup() {
		super.setup();
		this.messageID = [];
		this.commands = [];
		this.setID = new Array(this.size);
		this.setIndexID = new Array(this.size);
		this.setData = new Array(this.size);

		let i;
		for (i = 0; i < this.size; i++) {
			this.setID[i] = this.nextIndex++;
			this.setIndexID[i] = this.nextIndex++;
			this.cmd(
				act.createRectangle,
				this.setID[i],
				'',
				SET_ARRAY_ELEM_WIDTH,
				SET_ARRAY_ELEM_HEIGHT,
				SET_ARRAY_START_X,
				SET_ARRAY_START_Y + i * SET_ARRAY_ELEM_HEIGHT
			);
			this.cmd(
				act.createLabel,
				this.setIndexID[i],
				this.toStr(i),
				SET_ARRAY_START_X - SET_ARRAY_ELEM_WIDTH,
				SET_ARRAY_START_Y + i * SET_ARRAY_ELEM_HEIGHT
			);
			this.cmd(act.setForegroundColor, this.setIndexID[i], VERTEX_INDEX_COLOR);
		}

		this.messageLabelID = this.nextIndex++;
		this.cmd(
			act.createLabel,
			this.messageLabelID,
			'',
			MESSAGE_LABEL_X,
			MESSAGE_LABEL_Y,
			0
		);

		this.cmd(
			act.createLabel,
			this.nextIndex++,
			'Disjoint Set:',
			SET_ARRAY_START_X - 1 * SET_ARRAY_ELEM_WIDTH,
			SET_ARRAY_START_Y - SET_ARRAY_ELEM_HEIGHT * 1.5,
			0
		);
		this.cmd(
			act.createLabel,
			this.nextIndex++,
			'Priority Queue:',
			PQ_LABEL_X,
			PQ_LABEL_Y,
			0
		);
		this.animationManager.setAllLayers([0, this.currentLayer]);
		this.animationManager.startNewAnimation(this.commands);
		this.animationManager.skipForward();
		this.animationManager.clearHistory();
	}

	startCallback() {
		this.implementAction(this.doKruskal.bind(this));
	}

	disjointSetFind(valueToFind, highlightCircleID) {
		this.cmd(act.setText, this.messageLabelID, 'Finding value in disjoint set for ' + this.toStr(valueToFind));
		this.cmd(act.setTextColor, this.setID[valueToFind], '#FF0000');
		this.cmd(act.step);
		while (this.setData[valueToFind] >= 0) {
			this.cmd(act.setTextColor, this.setID[valueToFind], '#000000');
			this.cmd(
				act.move,
				highlightCircleID,
				SET_ARRAY_START_X - SET_ARRAY_ELEM_WIDTH,
				SET_ARRAY_START_Y +
					this.setData[valueToFind] * SET_ARRAY_ELEM_HEIGHT
			);
			this.cmd(act.step);
			valueToFind = this.setData[valueToFind];
			this.cmd(act.setTextColor, this.setID[valueToFind], '#FF0000');
			this.cmd(act.step);
		}
		this.cmd(act.setTextColor, this.setID[valueToFind], '#000000');
		return valueToFind;
	}

	doKruskal() {
		this.commands = [];

		this.edgesListLeftID = [];
		this.edgesListRightID = [];
		this.edgesListLeft = [];
		this.edgesListRight = [];

		let i;
		let j;
		for (i = 0; i < this.size; i++) {
			this.setData[i] = -1;
			this.cmd(act.setText, this.setID[i], this.toStr(i));
		}

		this.recolorGraph();

		// Create edge list
		this.cmd(
			act.setText,
			this.messageLabelID,
			'Enqueueing all edges into Priority Queue',
		);
		let top;
		for (i = 0; i < this.size; i++) {
			for (j = i + 1; j < this.size; j++) {
				if (this.adj_matrix[i][j] >= 0) {
					this.edgesListLeftID.push(this.nextIndex++);
					this.edgesListRightID.push(this.nextIndex++);
					top = this.edgesListLeftID.length - 1;
					this.edgesListLeft.push(i);
					this.edgesListRight.push(j);
					this.cmd(
						act.createLabel,
						this.edgesListLeftID[top],
						this.toStr(i) + ' ',
						EDGE_LIST_START_X +
							Math.floor(top / EDGE_LIST_MAX_PER_COLUMN) *
								EDGE_LIST_COLUMN_WIDTH,
						EDGE_LIST_START_Y +
							(top % EDGE_LIST_MAX_PER_COLUMN) * EDGE_LIST_ELEM_HEIGHT
					);
					this.cmd(
						act.createLabel,
						this.edgesListRightID[top],
						' ' + this.toStr(j),
						EDGE_LIST_START_X +
							EDGE_LIST_ELEM_WIDTH +
							Math.floor(top / EDGE_LIST_MAX_PER_COLUMN) *
								EDGE_LIST_COLUMN_WIDTH,
						EDGE_LIST_START_Y +
							(top % EDGE_LIST_MAX_PER_COLUMN) * EDGE_LIST_ELEM_HEIGHT
					);
					this.cmd(
						act.connect,
						this.edgesListLeftID[top],
						this.edgesListRightID[top],
						EDGE_COLOR,
						0,
						0,
						this.adj_matrix[i][j]
					);
				}
			}
		}
		this.cmd(act.step);

		// Sort edge list based on edge cost
		const edgeCount = this.edgesListLeftID.length;
		let tmpLeftID;
		let tmpRightID;
		let tmpLeft;
		let tmpRight;
		for (i = 1; i < edgeCount; i++) {
			tmpLeftID = this.edgesListLeftID[i];
			tmpRightID = this.edgesListRightID[i];
			tmpLeft = this.edgesListLeft[i];
			tmpRight = this.edgesListRight[i];
			j = i;
			while (
				j > 0 &&
				this.adj_matrix[this.edgesListLeft[j - 1]][this.edgesListRight[j - 1]] >
					this.adj_matrix[tmpLeft][tmpRight]
			) {
				this.edgesListLeft[j] = this.edgesListLeft[j - 1];
				this.edgesListRight[j] = this.edgesListRight[j - 1];
				this.edgesListLeftID[j] = this.edgesListLeftID[j - 1];
				this.edgesListRightID[j] = this.edgesListRightID[j - 1];
				j = j - 1;
			}
			this.edgesListLeft[j] = tmpLeft;
			this.edgesListRight[j] = tmpRight;
			this.edgesListLeftID[j] = tmpLeftID;
			this.edgesListRightID[j] = tmpRightID;
		}
		for (i = 0; i < edgeCount; i++) {
			this.cmd(
				act.move,
				this.edgesListLeftID[i],
				EDGE_LIST_START_X +
					Math.floor(i / EDGE_LIST_MAX_PER_COLUMN) *
						EDGE_LIST_COLUMN_WIDTH,
				EDGE_LIST_START_Y +
					(i % EDGE_LIST_MAX_PER_COLUMN) * EDGE_LIST_ELEM_HEIGHT
			);
			this.cmd(
				act.move,
				this.edgesListRightID[i],
				EDGE_LIST_START_X +
					EDGE_LIST_ELEM_WIDTH +
					Math.floor(i / EDGE_LIST_MAX_PER_COLUMN) *
						EDGE_LIST_COLUMN_WIDTH,
				EDGE_LIST_START_Y +
					(i % EDGE_LIST_MAX_PER_COLUMN) * EDGE_LIST_ELEM_HEIGHT
			);
		}
		this.cmd(act.step);

		const findLabelLeft = this.nextIndex++;
		const findLabelRight = this.nextIndex++;
		const highlightCircle1 = this.nextIndex++;
		const highlightCircle2 = this.nextIndex++;
		const moveLabelID = this.nextIndex++;

		let edgesAdded = 0;
		let nextListIndex = 0;
		this.cmd(
			act.createLabel,
			findLabelLeft,
			'',
			FIND_LABEL_1_X,
			FIND_LABEL_1_Y,
			0
		);
		this.cmd(
			act.createLabel,
			findLabelRight,
			'',
			FIND_LABEL_2_X,
			FIND_LABEL_2_Y,
			0
		);

		while (edgesAdded < this.size - 1 && nextListIndex < edgeCount) {
			this.cmd(
				act.setText,
				this.messageLabelID,
				'Dequeueing '
					+ this.toStr(this.edgesListLeft[nextListIndex])
					+ this.toStr(this.edgesListRight[nextListIndex])
			)
			this.cmd(
				act.setEdgeHighlight,
				this.edgesListLeftID[nextListIndex],
				this.edgesListRightID[nextListIndex],
				1
			);

			this.highlightEdge(
				this.edgesListLeft[nextListIndex],
				this.edgesListRight[nextListIndex],
				1
			);

			this.cmd(
				act.setText,
				findLabelLeft,
				'find(' + this.toStr(this.edgesListLeft[nextListIndex]) + ') = '
			);

			this.cmd(
				act.createHighlightCircle,
				highlightCircle1,
				HIGHLIGHT_CIRCLE_COLOR_1,
				EDGE_LIST_START_X +
					Math.floor(nextListIndex / EDGE_LIST_MAX_PER_COLUMN) *
						EDGE_LIST_COLUMN_WIDTH,
				EDGE_LIST_START_Y +
					(nextListIndex % EDGE_LIST_MAX_PER_COLUMN) *
						EDGE_LIST_ELEM_HEIGHT,
				15
			);
			this.cmd(act.step);

			this.cmd(
				act.move,
				highlightCircle1,
				SET_ARRAY_START_X - SET_ARRAY_ELEM_WIDTH,
				SET_ARRAY_START_Y +
					this.edgesListLeft[nextListIndex] * SET_ARRAY_ELEM_HEIGHT
			);
			const left = this.disjointSetFind(this.edgesListLeft[nextListIndex], highlightCircle1);
			this.cmd(
				act.setText,
				findLabelLeft,
				'find(' + this.toStr(this.edgesListLeft[nextListIndex]) + ') = ' + this.toStr(left)
			);
			this.cmd(act.step);

			this.cmd(
				act.setText,
				findLabelRight,
				'find(' + this.toStr(this.edgesListRight[nextListIndex]) + ') = '
			);

			this.cmd(
				act.createHighlightCircle,
				highlightCircle2,
				HIGHLIGHT_CIRCLE_COLOR_2,
				EDGE_LIST_START_X +
					EDGE_LIST_ELEM_WIDTH +
					Math.floor(nextListIndex / EDGE_LIST_MAX_PER_COLUMN) *
						EDGE_LIST_COLUMN_WIDTH,
				EDGE_LIST_START_Y +
					(nextListIndex % EDGE_LIST_MAX_PER_COLUMN) *
						EDGE_LIST_ELEM_HEIGHT,
				15
			);
			this.cmd(act.step);

			this.cmd(
				act.move,
				highlightCircle2,
				SET_ARRAY_START_X - SET_ARRAY_ELEM_WIDTH,
				SET_ARRAY_START_Y +
					this.edgesListRight[nextListIndex] * SET_ARRAY_ELEM_HEIGHT
			);

			const right = this.disjointSetFind(
				this.edgesListRight[nextListIndex],
				highlightCircle2
			);
			this.cmd(
				act.setText,
				findLabelRight,
				'find(' + this.toStr(this.edgesListRight[nextListIndex]) + ') = ' + this.toStr(right)
			);

			this.cmd(act.step);

			if (left !== right) {
				this.cmd(
					act.setText,
					this.messageLabelID,
					'Vertices in different sets.  Add edge to MST.',
				);
				this.highlightEdge(
					this.edgesListLeft[nextListIndex],
					this.edgesListRight[nextListIndex],
					0
				);
				edgesAdded++;
				this.setEdgeColor(
					this.edgesListLeft[nextListIndex],
					this.edgesListRight[nextListIndex],
					MST_EDGE_COLOR
				);
				this.setEdgeThickness(
					this.edgesListLeft[nextListIndex],
					this.edgesListRight[nextListIndex],
					MST_EDGE_THICKNESS
				);
				this.cmd(act.step);

				this.cmd(
					act.setText,
					this.messageLabelID,
					'union(' + this.toStr(left) + ', ' + this.toStr(right) + ')',
				);
				if (this.setData[left] < this.setData[right]) {
					this.setData[left] = this.setData[left] + this.setData[right];
					this.setData[right] = left;
				} else {
					this.setData[right] = this.setData[right] + this.setData[left];
					this.setData[left] = right;
				}
				this.cmd(act.setText, this.setID[left], this.toStr(this.setData[left]));
				this.cmd(act.setText, this.setID[right], this.toStr(this.setData[right]));
			} else {
				this.cmd(
					act.createLabel,
					this.messageLabelID,
					'Vertices in the same tree, skip edge',
				);
				this.cmd(act.step);
			}

			this.highlightEdge(
				this.edgesListLeft[nextListIndex],
				this.edgesListRight[nextListIndex],
				0
			);

			this.cmd(act.delete, highlightCircle1);
			this.cmd(act.delete, highlightCircle2);

			this.cmd(act.delete, this.edgesListLeftID[nextListIndex]);
			this.cmd(act.delete, this.edgesListRightID[nextListIndex]);
			this.cmd(act.setText, findLabelLeft, '');
			this.cmd(act.setText, findLabelRight, '');
			nextListIndex++;
		}
		this.cmd(act.delete, findLabelLeft);
		this.cmd(act.delete, findLabelRight);

		return this.commands;
	}

	reset() {
		this.messageID = [];
	}

	enableUI() {
		for (const control of this.controls) {
			control.disabled = false;
		}
	}

	disableUI() {
		for (const control of this.controls) {
			control.disabled = true;
		}
	}
}
