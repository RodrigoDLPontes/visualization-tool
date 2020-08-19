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
import { KRUSKALS_DS_COLORS, PRIMS_KRUSKALS_ADJ_LIST } from './util/GraphValues';
import { addControlToAlgorithmBar, addDivisorToAlgorithmBar } from './Algorithm.js';
import { act } from '../anim/AnimationMain';

const MESSAGE_LABEL_X = 30;
const MESSAGE_LABEL_Y = 15;

const FIND_LABEL_1_X = 30;
const FIND_LABEL_2_X = 100;
const FIND_LABEL_1_Y = 40;
const FIND_LABEL_2_Y = FIND_LABEL_1_Y;

const CURRENT_LABEL_X = 145;
const CURRENT_LABEL_Y = 67;

const PQ_LABEL_X = 145;
const PQ_LABEL_Y = 92;

const SET_ARRAY_ELEM_WIDTH = 50;
const SET_ARRAY_ELEM_HEIGHT = 20;
const SET_ARRAY_START_X = 52;
const SET_ARRAY_START_Y = 110;

const EDGE_LIST_ELEM_WIDTH = 40;
const EDGE_LIST_ELEM_HEIGHT = 40;
const EDGE_LIST_COLUMN_WIDTH = 100;
const EDGE_LIST_MAX_PER_COLUMN = 9;

const EDGE_LIST_START_X = 150;
const EDGE_LIST_START_Y = 135;

const HIGHLIGHT_CIRCLE_COLOR_1 = '#FF9999';
const HIGHLIGHT_CIRCLE_COLOR_2 = '#FF0000';
const HIGHLIGHT_CIRCLE_COLOR_3 = '#0000FF';
const HIGHLIGHT_CIRCLE_RADIUS = 12;

const MST_EDGE_COLOR = '#3399FF';
const MST_EDGE_THICKNESS = 4;

export default class Kruskals extends Graph {
	constructor(am, w, h) {
		super(am, w, h, PRIMS_KRUSKALS_ADJ_LIST, false, false, true);
		this.addControls();
	}

	addControls() {
		this.startButton = addControlToAlgorithmBar('Button', 'Run');
		this.startButton.onclick = this.startCallback.bind(this);
		this.controls.push(this.startButton);

		addDivisorToAlgorithmBar();

		super.addControls(false);
	}

	setup(adjMatrix) {
		super.setup(adjMatrix);
		this.messageID = [];
		this.commands = [];
		this.setID = new Array(this.size);
		this.setIndexID = new Array(this.size);
		this.setData = new Array(this.size);
		this.edgesListLeftID = [];
		this.edgesListRightID = [];

		let i;
		for (i = 0; i < this.size; i++) {
			this.setID[i] = this.nextIndex++;
			this.setIndexID[i] = this.nextIndex++;
			this.cmd(
				act.createRectangle,
				this.setIndexID[i],
				this.toStr(i),
				SET_ARRAY_ELEM_WIDTH,
				SET_ARRAY_ELEM_HEIGHT,
				SET_ARRAY_START_X,
				SET_ARRAY_START_Y + i * SET_ARRAY_ELEM_HEIGHT,
			);
			this.cmd(
				act.createRectangle,
				this.setID[i],
				'',
				SET_ARRAY_ELEM_WIDTH,
				SET_ARRAY_ELEM_HEIGHT,
				SET_ARRAY_START_X + SET_ARRAY_ELEM_WIDTH,
				SET_ARRAY_START_Y + i * SET_ARRAY_ELEM_HEIGHT,
			);
			this.cmd(act.setTextColor, this.setIndexID[i], VERTEX_INDEX_COLOR);
		}

		this.messageLabelID = this.nextIndex++;
		this.cmd(act.createLabel, this.messageLabelID, '', MESSAGE_LABEL_X, MESSAGE_LABEL_Y, 0);

		this.cmd(
			act.createLabel,
			this.nextIndex++,
			'Disjoint Set:',
			SET_ARRAY_START_X + 0.5 * SET_ARRAY_ELEM_WIDTH,
			SET_ARRAY_START_Y - 37,
			1,
		);
		this.cmd(
			act.createLabel,
			this.nextIndex++,
			'Vertex',
			SET_ARRAY_START_X,
			SET_ARRAY_START_Y - 22,
			1,
		);
		this.cmd(
			act.createLabel,
			this.nextIndex++,
			'Set ID',
			SET_ARRAY_START_X + SET_ARRAY_ELEM_WIDTH,
			SET_ARRAY_START_Y - 22,
			1,
		);
		this.cmd(
			act.createLabel,
			this.nextIndex++,
			'Current edge:',
			CURRENT_LABEL_X,
			CURRENT_LABEL_Y,
			0,
		);
		this.cmd(act.createLabel, this.nextIndex++, 'Priority Queue:', PQ_LABEL_X, PQ_LABEL_Y, 0);
		this.animationManager.setAllLayers([0, this.currentLayer]);
		this.animationManager.startNewAnimation(this.commands);
		this.animationManager.skipForward();
		this.animationManager.clearHistory();
		this.lastIndex = this.nextIndex;
	}

	reset() {
		this.nextIndex = this.lastIndex;
		this.messageID = [];
		this.edgesListLeft = [];
		this.edgesListRight = [];
		this.edgesListLeftID = [];
		this.edgesListRightID = [];
	}

	startCallback() {
		this.implementAction(this.doKruskal.bind(this));
	}

	doKruskal() {
		this.commands = [];

		for (let k = 0; k < this.edgesListLeftID.length; k++) {
			this.cmd(act.delete, this.edgesListLeftID[k]);
			this.cmd(act.delete, this.edgesListRightID[k]);
		}

		this.edgesListLeftID = [];
		this.edgesListRightID = [];
		this.edgesListLeft = [];
		this.edgesListRight = [];

		let i;
		let j;
		for (i = 0; i < this.size; i++) {
			this.setData[i] = i + 1;
			this.cmd(act.setText, this.setID[i], i + 1);
			!this.isLarge && this.cmd(act.setBackgroundColor, this.setID[i], KRUSKALS_DS_COLORS[i]);
		}

		this.recolorGraph();

		// Create edge list
		this.cmd(act.setText, this.messageLabelID, 'Enqueueing all edges into Priority Queue');
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
							Math.floor(top / EDGE_LIST_MAX_PER_COLUMN) * EDGE_LIST_COLUMN_WIDTH,
						EDGE_LIST_START_Y +
							(top % EDGE_LIST_MAX_PER_COLUMN) * EDGE_LIST_ELEM_HEIGHT,
					);
					this.cmd(
						act.createLabel,
						this.edgesListRightID[top],
						' ' + this.toStr(j),
						EDGE_LIST_START_X +
							EDGE_LIST_ELEM_WIDTH +
							Math.floor(top / EDGE_LIST_MAX_PER_COLUMN) * EDGE_LIST_COLUMN_WIDTH,
						EDGE_LIST_START_Y +
							(top % EDGE_LIST_MAX_PER_COLUMN) * EDGE_LIST_ELEM_HEIGHT,
					);
					this.cmd(
						act.connect,
						this.edgesListLeftID[top],
						this.edgesListRightID[top],
						EDGE_COLOR,
						0,
						0,
						this.adj_matrix[i][j],
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
					Math.floor(i / EDGE_LIST_MAX_PER_COLUMN) * EDGE_LIST_COLUMN_WIDTH,
				EDGE_LIST_START_Y + (i % EDGE_LIST_MAX_PER_COLUMN) * EDGE_LIST_ELEM_HEIGHT,
			);
			this.cmd(
				act.move,
				this.edgesListRightID[i],
				EDGE_LIST_START_X +
					EDGE_LIST_ELEM_WIDTH +
					Math.floor(i / EDGE_LIST_MAX_PER_COLUMN) * EDGE_LIST_COLUMN_WIDTH,
				EDGE_LIST_START_Y + (i % EDGE_LIST_MAX_PER_COLUMN) * EDGE_LIST_ELEM_HEIGHT,
			);
		}
		this.cmd(act.step);

		const findLabelLeft = this.nextIndex++;
		const findLabelRight = this.nextIndex++;
		const highlightCircle1 = this.nextIndex++;
		const highlightCircle2 = this.nextIndex++;
		const highlightCircle3 = this.nextIndex++;

		let edgesAdded = 0;
		let nextListIndex = 0;
		this.cmd(act.createLabel, findLabelLeft, '', FIND_LABEL_1_X, FIND_LABEL_1_Y, 0);
		this.cmd(act.createLabel, findLabelRight, '', FIND_LABEL_2_X, FIND_LABEL_2_Y, 0);

		// Run algorithm
		while (edgesAdded < this.size - 1 && nextListIndex < edgeCount) {
			this.cmd(
				act.setText,
				this.messageLabelID,
				'Dequeueing ' +
					this.toStr(this.edgesListLeft[nextListIndex]) +
					this.toStr(this.edgesListRight[nextListIndex]),
			);

			this.cmd(
				act.move,
				this.edgesListLeftID[nextListIndex],
				CURRENT_LABEL_X + 90,
				CURRENT_LABEL_Y + 6,
			);
			this.cmd(
				act.move,
				this.edgesListRightID[nextListIndex],
				CURRENT_LABEL_X + EDGE_LIST_ELEM_WIDTH + 90,
				CURRENT_LABEL_Y + 6,
			);

			for (i = nextListIndex + 1; i < edgeCount; i++) {
				const newPos = i - nextListIndex - 1;
				this.cmd(
					act.move,
					this.edgesListLeftID[i],
					EDGE_LIST_START_X +
						Math.floor(newPos / EDGE_LIST_MAX_PER_COLUMN) * EDGE_LIST_COLUMN_WIDTH,
					EDGE_LIST_START_Y + (newPos % EDGE_LIST_MAX_PER_COLUMN) * EDGE_LIST_ELEM_HEIGHT,
				);
				this.cmd(
					act.move,
					this.edgesListRightID[i],
					EDGE_LIST_START_X +
						EDGE_LIST_ELEM_WIDTH +
						Math.floor(newPos / EDGE_LIST_MAX_PER_COLUMN) * EDGE_LIST_COLUMN_WIDTH,
					EDGE_LIST_START_Y + (newPos % EDGE_LIST_MAX_PER_COLUMN) * EDGE_LIST_ELEM_HEIGHT,
				);
			}

			this.highlightEdge(
				this.edgesListLeft[nextListIndex],
				this.edgesListRight[nextListIndex],
				1,
			);
			this.cmd(act.step);

			this.cmd(act.setText, this.messageLabelID, 'Looking at disjoint set');

			this.cmd(
				act.setText,
				findLabelLeft,
				'find(' + this.toStr(this.edgesListLeft[nextListIndex]) + ') = ',
			);

			this.cmd(
				act.createHighlightCircle,
				highlightCircle1,
				HIGHLIGHT_CIRCLE_COLOR_1,
				CURRENT_LABEL_X + 88,
				CURRENT_LABEL_Y + 6,
				HIGHLIGHT_CIRCLE_RADIUS,
			);
			this.cmd(act.step);

			const left = this.edgesListLeft[nextListIndex];
			const leftRoot = this.setData[left];
			this.cmd(
				act.move,
				highlightCircle1,
				SET_ARRAY_START_X,
				SET_ARRAY_START_Y + this.edgesListLeft[nextListIndex] * SET_ARRAY_ELEM_HEIGHT,
			);
			this.cmd(
				act.setText,
				findLabelLeft,
				'find(' + this.toStr(this.edgesListLeft[nextListIndex]) + ') = ' + leftRoot,
			);
			this.cmd(act.step);

			this.cmd(
				act.setText,
				findLabelRight,
				'find(' + this.toStr(this.edgesListRight[nextListIndex]) + ') = ',
			);

			this.cmd(
				act.createHighlightCircle,
				highlightCircle2,
				HIGHLIGHT_CIRCLE_COLOR_2,
				CURRENT_LABEL_X + EDGE_LIST_ELEM_WIDTH + 91,
				CURRENT_LABEL_Y + 6,
				HIGHLIGHT_CIRCLE_RADIUS,
			);
			this.cmd(act.step);

			const right = this.edgesListRight[nextListIndex];
			const rightRoot = this.setData[right];
			this.cmd(
				act.move,
				highlightCircle2,
				SET_ARRAY_START_X,
				SET_ARRAY_START_Y + this.edgesListRight[nextListIndex] * SET_ARRAY_ELEM_HEIGHT,
			);
			this.cmd(
				act.setText,
				findLabelRight,
				'find(' + this.toStr(this.edgesListRight[nextListIndex]) + ') = ' + rightRoot,
			);
			this.cmd(act.step);

			if (leftRoot !== rightRoot) {
				this.cmd(
					act.setText,
					this.messageLabelID,
					'Vertices in different sets.  Add edge to MST.',
				);
				this.highlightEdge(
					this.edgesListLeft[nextListIndex],
					this.edgesListRight[nextListIndex],
					0,
				);
				edgesAdded++;
				this.setEdgeColor(
					this.edgesListLeft[nextListIndex],
					this.edgesListRight[nextListIndex],
					MST_EDGE_COLOR,
				);
				this.setEdgeThickness(
					this.edgesListLeft[nextListIndex],
					this.edgesListRight[nextListIndex],
					MST_EDGE_THICKNESS,
				);
				this.cmd(act.step);

				this.cmd(
					act.setText,
					this.messageLabelID,
					'Union sets ' + leftRoot + ' and ' + rightRoot,
				);
				this.cmd(
					act.setText,
					findLabelLeft, // reusing find label
					'union(' + this.toStr(left) + ', ' + this.toStr(right) + ')',
				);
				this.cmd(act.setText, findLabelRight, '');
				this.cmd(act.step);
				const minRoot = Math.min(leftRoot, rightRoot);
				const maxRoot = Math.max(leftRoot, rightRoot);
				let firstMatch = true;
				for (let k = 0; k < this.size; k++) {
					if (this.setData[k] === maxRoot) {
						if (firstMatch) {
							firstMatch = false;
							this.cmd(
								act.createHighlightCircle,
								highlightCircle3,
								HIGHLIGHT_CIRCLE_COLOR_3,
								SET_ARRAY_START_X + SET_ARRAY_ELEM_WIDTH,
								SET_ARRAY_START_Y + k * SET_ARRAY_ELEM_HEIGHT,
								HIGHLIGHT_CIRCLE_RADIUS,
							);
							this.cmd(act.setHighlight, highlightCircle3, 1);
						} else {
							this.cmd(
								act.move,
								highlightCircle3,
								SET_ARRAY_START_X + SET_ARRAY_ELEM_WIDTH,
								SET_ARRAY_START_Y + k * SET_ARRAY_ELEM_HEIGHT,
							);
						}
						this.cmd(act.step);
						this.setData[k] = minRoot;
						this.cmd(act.setText, this.setID[k], minRoot);
						!this.isLarge &&
							this.cmd(
								act.setBackgroundColor,
								this.setID[k],
								KRUSKALS_DS_COLORS[minRoot - 1],
							);
						this.cmd(act.step);
					}
				}
				this.cmd(act.delete, highlightCircle3);
			} else {
				this.cmd(act.setText, this.messageLabelID, 'Vertices in the same set, skip edge');
				this.cmd(act.step);
			}

			this.highlightEdge(
				this.edgesListLeft[nextListIndex],
				this.edgesListRight[nextListIndex],
				0,
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

		this.edgesListLeftID = this.edgesListLeftID.slice(nextListIndex);
		this.edgesListRightID = this.edgesListRightID.slice(nextListIndex);

		if (edgesAdded === this.size - 1) {
			this.cmd(act.setText, this.messageLabelID, 'MST has correct amount of edges, done');
		} else {
			this.cmd(act.setText, this.messageLabelID, 'Priority queue is empty, done');
		}

		return this.commands;
	}
}
