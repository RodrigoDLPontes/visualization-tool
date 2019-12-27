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
import { act } from '../anim/AnimationMain';
import { addControlToAlgorithmBar } from './Algorithm.js';

export default class Kruskal extends Graph {
	constructor(am, w, h) {
		super(am, w, h, false, false);
		this.showEdgeCosts = true;
	}

	addControls() {
		this.startButton = addControlToAlgorithmBar('Button', 'Run Kruskal');
		this.startButton.onclick = this.startCallback.bind(this);

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
				'-1',
				Kruskal.SET_ARRAY_ELEM_WIDTH,
				Kruskal.SET_ARRAY_ELEM_HEIGHT,
				Kruskal.SET_ARRAY_START_X,
				Kruskal.SET_ARRAY_START_Y + i * Kruskal.SET_ARRAY_ELEM_HEIGHT
			);
			this.cmd(
				act.createLabel,
				this.setIndexID[i],
				i,
				Kruskal.SET_ARRAY_START_X - Kruskal.SET_ARRAY_ELEM_WIDTH,
				Kruskal.SET_ARRAY_START_Y + i * Kruskal.SET_ARRAY_ELEM_HEIGHT
			);
			this.cmd(act.setForegroundColor, this.setIndexID[i], VERTEX_INDEX_COLOR);
		}
		this.cmd(
			act.createLabel,
			this.nextIndex++,
			'Disjoint Set',
			Kruskal.SET_ARRAY_START_X - 1 * Kruskal.SET_ARRAY_ELEM_WIDTH,
			Kruskal.SET_ARRAY_START_Y - Kruskal.SET_ARRAY_ELEM_HEIGHT * 1.5,
			0
		);
		this.animationManager.setAllLayers([0, this.currentLayer]);
		this.animationManager.startNewAnimation(this.commands);
		this.animationManager.skipForward();
		this.animationManager.clearHistory();
	}

	startCallback() {
		this.implementAction(this.doKruskal.bind(this), '');
	}

	disjointSetFind(valueToFind, highlightCircleID) {
		this.cmd(act.setTextColor, this.setID[valueToFind], '#FF0000');
		this.cmd(act.step);
		while (this.setData[valueToFind] >= 0) {
			this.cmd(act.setTextColor, this.setID[valueToFind], '#000000');
			this.cmd(
				act.move,
				highlightCircleID,
				Kruskal.SET_ARRAY_START_X - Kruskal.SET_ARRAY_ELEM_WIDTH,
				Kruskal.SET_ARRAY_START_Y +
					this.setData[valueToFind] * Kruskal.SET_ARRAY_ELEM_HEIGHT
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
			this.cmd(act.setText, this.setID[i], '-1');
		}

		this.recolorGraph();

		// Create Edge List
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
						i,
						Kruskal.EDGE_LIST_START_X +
							Math.floor(top / Kruskal.EDGE_LIST_MAX_PER_COLUMN) *
								Kruskal.EDGE_LIST_COLUMN_WIDTH,
						Kruskal.EDGE_LIST_START_Y +
							(top % Kruskal.EDGE_LIST_MAX_PER_COLUMN) * Kruskal.EDGE_LIST_ELEM_HEIGHT
					);
					this.cmd(
						act.createLabel,
						this.edgesListRightID[top],
						j,
						Kruskal.EDGE_LIST_START_X +
							Kruskal.EDGE_LIST_ELEM_WIDTH +
							Math.floor(top / Kruskal.EDGE_LIST_MAX_PER_COLUMN) *
								Kruskal.EDGE_LIST_COLUMN_WIDTH,
						Kruskal.EDGE_LIST_START_Y +
							(top % Kruskal.EDGE_LIST_MAX_PER_COLUMN) * Kruskal.EDGE_LIST_ELEM_HEIGHT
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
				Kruskal.EDGE_LIST_START_X +
					Math.floor(i / Kruskal.EDGE_LIST_MAX_PER_COLUMN) *
						Kruskal.EDGE_LIST_COLUMN_WIDTH,
				Kruskal.EDGE_LIST_START_Y +
					(i % Kruskal.EDGE_LIST_MAX_PER_COLUMN) * Kruskal.EDGE_LIST_ELEM_HEIGHT
			);
			this.cmd(
				act.move,
				this.edgesListRightID[i],
				Kruskal.EDGE_LIST_START_X +
					Kruskal.EDGE_LIST_ELEM_WIDTH +
					Math.floor(i / Kruskal.EDGE_LIST_MAX_PER_COLUMN) *
						Kruskal.EDGE_LIST_COLUMN_WIDTH,
				Kruskal.EDGE_LIST_START_Y +
					(i % Kruskal.EDGE_LIST_MAX_PER_COLUMN) * Kruskal.EDGE_LIST_ELEM_HEIGHT
			);
		}

		this.cmd(act.step);

		const findLabelLeft = this.nextIndex++;
		const findLabelRight = this.nextIndex++;
		const highlightCircle1 = this.nextIndex++;
		const highlightCircle2 = this.nextIndex++;
		const moveLabelID = this.nextIndex++;
		const messageLabelID = this.nextIndex++;

		let edgesAdded = 0;
		let nextListIndex = 0;
		this.cmd(
			act.createLabel,
			findLabelLeft,
			'',
			Kruskal.FIND_LABEL_1_X,
			Kruskal.FIND_LABEL_1_Y,
			0
		);
		this.cmd(
			act.createLabel,
			findLabelRight,
			'',
			Kruskal.FIND_LABEL_2_X,
			Kruskal.FIND_LABEL_2_Y,
			0
		);

		while (edgesAdded < this.size - 1 && nextListIndex < edgeCount) {
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
			this.highlightEdge(
				this.edgesListRight[nextListIndex],
				this.edgesListLeft[nextListIndex],
				1
			);

			this.cmd(
				act.setText,
				findLabelLeft,
				'find(' + String(this.edgesListLeft[nextListIndex]) + ') = '
			);

			this.cmd(
				act.createHighlightCircle,
				highlightCircle1,
				Kruskal.HIGHLIGHT_CIRCLE_COLOR_1,
				Kruskal.EDGE_LIST_START_X +
					Math.floor(nextListIndex / Kruskal.EDGE_LIST_MAX_PER_COLUMN) *
						Kruskal.EDGE_LIST_COLUMN_WIDTH,
				Kruskal.EDGE_LIST_START_Y +
					(nextListIndex % Kruskal.EDGE_LIST_MAX_PER_COLUMN) *
						Kruskal.EDGE_LIST_ELEM_HEIGHT,
				15
			);
			this.cmd(
				act.move,
				highlightCircle1,
				Kruskal.SET_ARRAY_START_X - Kruskal.SET_ARRAY_ELEM_WIDTH,
				Kruskal.SET_ARRAY_START_Y +
					this.edgesListLeft[nextListIndex] * Kruskal.SET_ARRAY_ELEM_HEIGHT
			);
			this.cmd(act.step);

			const left = this.disjointSetFind(this.edgesListLeft[nextListIndex], highlightCircle1);
			this.cmd(
				act.setText,
				findLabelLeft,
				'find(' + String(this.edgesListLeft[nextListIndex]) + ') = ' + String(left)
			);

			this.cmd(
				act.setText,
				findLabelRight,
				'find(' + String(this.edgesListRight[nextListIndex]) + ') = '
			);

			this.cmd(
				act.createHighlightCircle,
				highlightCircle2,
				Kruskal.HIGHLIGHT_CIRCLE_COLOR_2,
				Kruskal.EDGE_LIST_START_X +
					Kruskal.EDGE_LIST_ELEM_WIDTH +
					Math.floor(nextListIndex / Kruskal.EDGE_LIST_MAX_PER_COLUMN) *
						Kruskal.EDGE_LIST_COLUMN_WIDTH,
				Kruskal.EDGE_LIST_START_Y +
					(nextListIndex % Kruskal.EDGE_LIST_MAX_PER_COLUMN) *
						Kruskal.EDGE_LIST_ELEM_HEIGHT,
				15
			);

			this.cmd(
				act.move,
				highlightCircle2,
				Kruskal.SET_ARRAY_START_X - Kruskal.SET_ARRAY_ELEM_WIDTH,
				Kruskal.SET_ARRAY_START_Y +
					this.edgesListRight[nextListIndex] * Kruskal.SET_ARRAY_ELEM_HEIGHT
			);
			this.cmd(act.step);

			const right = this.disjointSetFind(
				this.edgesListRight[nextListIndex],
				highlightCircle2
			);
			this.cmd(
				act.setText,
				findLabelRight,
				'find(' + String(this.edgesListRight[nextListIndex]) + ') = ' + String(right)
			);

			this.cmd(act.step);

			if (left !== right) {
				this.cmd(
					act.createLabel,
					messageLabelID,
					'Vertices in different trees.  Add edge to tree: Union(' +
						String(left) +
						',' +
						String(right) +
						')',
					Kruskal.MESSAGE_LABEL_X,
					Kruskal.MESSAGE_LABEL_Y,
					0
				);
				this.cmd(act.step);
				this.highlightEdge(
					this.edgesListLeft[nextListIndex],
					this.edgesListRight[nextListIndex],
					1
				);
				this.highlightEdge(
					this.edgesListRight[nextListIndex],
					this.edgesListLeft[nextListIndex],
					1
				);
				edgesAdded++;
				this.setEdgeColor(
					this.edgesListLeft[nextListIndex],
					this.edgesListRight[nextListIndex],
					'#FF0000'
				);
				this.setEdgeColor(
					this.edgesListRight[nextListIndex],
					this.edgesListLeft[nextListIndex],
					'#FF0000'
				);
				if (this.setData[left] < this.setData[right]) {
					this.cmd(act.setText, this.setID[right], '');
					this.cmd(
						act.createLabel,
						moveLabelID,
						this.setData[right],
						Kruskal.SET_ARRAY_START_X,
						Kruskal.SET_ARRAY_START_Y + right * Kruskal.SET_ARRAY_ELEM_HEIGHT
					);
					this.cmd(
						act.move,
						moveLabelID,
						Kruskal.SET_ARRAY_START_X,
						Kruskal.SET_ARRAY_START_Y + left * Kruskal.SET_ARRAY_ELEM_HEIGHT
					);
					this.cmd(act.step);
					this.cmd(act.delete, moveLabelID);
					this.setData[left] = this.setData[left] + this.setData[right];
					this.setData[right] = left;
				} else {
					this.cmd(act.setText, this.setID[left], '');
					this.cmd(
						act.createLabel,
						moveLabelID,
						this.setData[left],
						Kruskal.SET_ARRAY_START_X,
						Kruskal.SET_ARRAY_START_Y + left * Kruskal.SET_ARRAY_ELEM_HEIGHT
					);
					this.cmd(
						act.move,
						moveLabelID,
						Kruskal.SET_ARRAY_START_X,
						Kruskal.SET_ARRAY_START_Y + right * Kruskal.SET_ARRAY_ELEM_HEIGHT
					);
					this.cmd(act.step);
					this.cmd(act.delete, moveLabelID);
					this.setData[right] = this.setData[right] + this.setData[left];
					this.setData[left] = right;
				}
				this.cmd(act.setText, this.setID[left], this.setData[left]);
				this.cmd(act.setText, this.setID[right], this.setData[right]);
			} else {
				this.cmd(
					act.createLabel,
					messageLabelID,
					'Vertices in the same tree.  Skip edge',
					Kruskal.MESSAGE_LABEL_X,
					Kruskal.MESSAGE_LABEL_Y,
					0
				);
				this.cmd(act.step);
			}

			this.highlightEdge(
				this.edgesListLeft[nextListIndex],
				this.edgesListRight[nextListIndex],
				0
			);
			this.highlightEdge(
				this.edgesListRight[nextListIndex],
				this.edgesListLeft[nextListIndex],
				0
			);

			this.cmd(act.delete, messageLabelID);
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

	enableUI(event) {
		this.startButton.disabled = false;

		super.enableUI(event);
	}

	disableUI(event) {
		this.startButton.disabled = true;

		super.disableUI(event);
	}
}

Kruskal.HIGHLIGHT_CIRCLE_COLOR = '#000000';

Kruskal.SET_ARRAY_ELEM_WIDTH = 25;
Kruskal.SET_ARRAY_ELEM_HEIGHT = 25;
Kruskal.SET_ARRAY_START_X = 50;
Kruskal.SET_ARRAY_START_Y = 130;

Kruskal.EDGE_LIST_ELEM_WIDTH = 40;
Kruskal.EDGE_LIST_ELEM_HEIGHT = 40;
Kruskal.EDGE_LIST_COLUMN_WIDTH = 100;
Kruskal.EDGE_LIST_MAX_PER_COLUMN = 10;

Kruskal.EDGE_LIST_START_X = 150;
Kruskal.EDGE_LIST_START_Y = 130;

Kruskal.FIND_LABEL_1_X = 30;
Kruskal.FIND_LABEL_2_X = 100;
Kruskal.FIND_LABEL_1_Y = 30;
Kruskal.FIND_LABEL_2_Y = Kruskal.FIND_LABEL_1_Y;

Kruskal.MESSAGE_LABEL_X = 30;
Kruskal.MESSAGE_LABEL_Y = 50;

Kruskal.HIGHLIGHT_CIRCLE_COLOR_1 = '#FFAAAA';
Kruskal.HIGHLIGHT_CIRCLE_COLOR_2 = '#FF0000';
