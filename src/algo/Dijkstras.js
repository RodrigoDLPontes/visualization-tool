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

import Graph, { VERTEX_INDEX_COLOR } from './Graph.js';
import {
	addControlToAlgorithmBar,
	addDivisorToAlgorithmBar,
	addLabelToAlgorithmBar,
} from './Algorithm.js';
import { DIJKSTRAS_ADJ_LIST } from './util/GraphValues';
import PriorityQueue from './util/PriorityQueue';
import { act } from '../anim/AnimationMain';

const PQ_DEQUEUED_COLOR = '#0000FF';
const VISITED_COLOR = '#99CCFF';

const INFO_MSG_X = 25;
const INFO_MSG_Y = 15;

const VISITED_START_X = 30;
const VISITED_START_Y = 65;
const VISITED_SPACING = 20;

const CURRENT_VERTEX_LABEL_X = 25;
const CURRENT_VERTEX_LABEL_Y = 85;
const CURRENT_VERTEX_X = 110;
const CURRENT_VERTEX_Y = 85;

const PQ_LABEL_X = 25;
const PQ_LABEL_Y = 110;

const PQ_X = 110;
const PQ_Y = 110;
const PQ_SPACING = 42;
const PQ_LINE_SPACING = 25;
const PQ_MAX_PER_LINE = 9;

const TABLE_ENTRY_WIDTH = 50;
const SMALL_TABLE_ENTRY_HEIGHT = 20;
const LARGE_TABLE_ENTRY_HEIGHT = 17;
const TABLE_START_X = 50;
const TABLE_START_Y = 180;

export default class Dijkstras extends Graph {
	constructor(am, w, h) {
		super(am, w, h, DIJKSTRAS_ADJ_LIST, false, false, true);
		this.addControls();
	}

	addControls() {
		addLabelToAlgorithmBar('Start vertex: ');

		this.startField = addControlToAlgorithmBar('Text', '');
		this.startField.onkeydown = this.returnSubmit(
			this.startField,
			this.startCallback.bind(this),
			1,
			false,
		);
		this.startField.size = 2;
		this.controls.push(this.startField);

		this.startButton = addControlToAlgorithmBar('Button', 'Run');
		this.startButton.onclick = this.startCallback.bind(this);
		this.controls.push(this.startButton);

		addDivisorToAlgorithmBar();

		super.addControls();
	}

	setup(adjMatrix) {
		super.setup(adjMatrix);

		this.commands = [];

		this.vertexID = new Array(this.size);

		this.distance = new Array(this.size);
		this.distanceID = new Array(this.size);

		this.visited = [];
		this.visitedID = [];

		this.pq = new PriorityQueue();

		this.tableEntryHeight = this.isLarge ? LARGE_TABLE_ENTRY_HEIGHT : SMALL_TABLE_ENTRY_HEIGHT;
		for (let i = 0; i < this.size; i++) {
			this.vertexID[i] = this.nextIndex++;
			this.distanceID[i] = this.nextIndex++;
			this.cmd(
				act.createRectangle,
				this.vertexID[i],
				this.toStr(i),
				TABLE_ENTRY_WIDTH,
				this.tableEntryHeight,
				TABLE_START_X,
				TABLE_START_Y + i * this.tableEntryHeight,
			);
			this.cmd(
				act.createRectangle,
				this.distanceID[i],
				'',
				TABLE_ENTRY_WIDTH,
				this.tableEntryHeight,
				TABLE_START_X + TABLE_ENTRY_WIDTH,
				TABLE_START_Y + i * this.tableEntryHeight,
			);
			this.cmd(act.setTextColor, this.vertexID[i], VERTEX_INDEX_COLOR);
		}

		this.infoLabelID = this.nextIndex++;
		this.cmd(act.createLabel, this.infoLabelID, '', INFO_MSG_X, INFO_MSG_Y, 0);

		this.cmd(
			act.createLabel,
			this.nextIndex++,
			'Visited Set:',
			VISITED_START_X - 5,
			VISITED_START_Y - 25,
			0,
		);
		this.cmd(
			act.createLabel,
			this.nextIndex++,
			'Current vertex:',
			CURRENT_VERTEX_LABEL_X,
			CURRENT_VERTEX_LABEL_Y,
			0,
		);
		this.cmd(act.createLabel, this.nextIndex++, 'Priority Queue:', PQ_LABEL_X, PQ_LABEL_Y, 0);
		this.cmd(
			act.createLabel,
			this.nextIndex++,
			'Distance Map:',
			TABLE_START_X + 0.5 * TABLE_ENTRY_WIDTH,
			TABLE_START_Y - SMALL_TABLE_ENTRY_HEIGHT,
		);

		this.animationManager.setAllLayers([0, this.currentLayer]);
		this.animationManager.startNewAnimation(this.commands);
		this.animationManager.skipForward();
		this.animationManager.clearHistory();
		this.comparisonMessageID = this.nextIndex++;
		this.lastIndex = this.nextIndex;
	}

	reset() {
		this.nextIndex = this.lastIndex;
		this.messageID = [];
		this.visitedID = [];
		this.pq = new PriorityQueue();
	}

	startCallback() {
		let startvalue;

		if (this.startField.value !== '') {
			startvalue = this.startField.value;
			this.startField.value = '';
			startvalue = startvalue.toUpperCase().charCodeAt(0) - 65;
			if (startvalue >= 0 && startvalue < this.size)
				this.implementAction(this.doDijkstra.bind(this), startvalue);
		}
	}

	doDijkstra(startVertex) {
		this.commands = [];

		let current = startVertex;
		let currentID = this.nextIndex++;

		this.clear();

		this.visitedID = [];

		this.distance[current] = 0;
		this.cmd(act.setText, this.distanceID[current], 0);

		this.pq = new PriorityQueue();
		this.pq.enqueue(current, currentID, 0);
		this.cmd(act.createLabel, currentID, '(' + this.toStr(current) + ', 0)', PQ_X, PQ_Y, 0);
		this.cmd(
			act.setText,
			this.infoLabelID,
			'Enqueueing ' + this.toStr(current) + ' with distance 0 and updating distance map',
		);
		this.cmd(act.step);

		while (this.visited.includes(false) && this.pq.size() !== 0) {
			[current, currentID] = this.pq.dequeue();
			this.cmd(act.setText, this.infoLabelID, 'Dequeueing ' + this.toStr(current));
			this.cmd(act.move, currentID, CURRENT_VERTEX_X, CURRENT_VERTEX_Y);
			this.cmd(act.setText, currentID, this.toStr(current));
			this.cmd(act.setTextColor, currentID, PQ_DEQUEUED_COLOR);
			let pqIDs = this.pq.getIDs();
			for (let i = 0; i < this.pq.size(); i++) {
				this.cmd(
					act.move,
					pqIDs[i],
					PQ_X + (i % PQ_MAX_PER_LINE) * PQ_SPACING,
					PQ_Y + Math.floor(i / PQ_MAX_PER_LINE) * PQ_LINE_SPACING,
				);
			}

			this.visitVertex(current);
			this.cmd(act.step);

			if (!this.visited[current]) {
				this.visited[current] = true;
				this.cmd(
					act.setText,
					this.infoLabelID,
					'Adding ' + this.toStr(current) + ' to visited set',
				);
				this.visitedID.push(this.nextIndex);
				this.cmd(
					act.createLabel,
					this.nextIndex++,
					this.toStr(current),
					VISITED_START_X + (this.visitedID.length - 1) * VISITED_SPACING,
					VISITED_START_Y,
				);
				this.cmd(act.setBackgroundColor, this.circleID[current], VISITED_COLOR);
				this.cmd(act.step);

				this.cmd(
					act.setText,
					this.infoLabelID,
					'Updating neighbors of vertex ' + this.toStr(current),
				);
				for (let neighbor = 0; neighbor < this.size; neighbor++) {
					if (this.adj_matrix[current][neighbor] >= 0) {
						this.highlightEdge(current, neighbor, 1);
						if (this.visited[neighbor]) {
							this.cmd(
								act.setText,
								this.infoLabelID,
								this.toStr(neighbor) + ' has already been visited, skipping',
							);
							this.cmd(act.step);
						} else {
							this.cmd(act.setText, this.infoLabelID, 'Comparing distances');
							this.cmd(act.setHighlight, this.distanceID[current], 1);
							this.cmd(act.setHighlight, this.distanceID[neighbor], 1);
							const curDist = this.distance[current];
							const edgDist = this.adj_matrix[current][neighbor];
							const newDist = curDist + edgDist;
							const oldDist = this.distance[neighbor];
							const oldDistStr =
								oldDist >= 0 ? String(this.distance[neighbor]) : 'INF';

							if (oldDist < 0 || newDist < oldDist) {
								this.distance[neighbor] = newDist;
								this.cmd(
									act.createLabel,
									this.comparisonMessageID,
									'New distance (' +
										curDist +
										' + ' +
										edgDist +
										' = ' +
										newDist +
										') is less than old distance (' +
										oldDistStr +
										'), updating',
									TABLE_START_X + 2 * TABLE_ENTRY_WIDTH - 15,
									TABLE_START_Y + neighbor * this.tableEntryHeight - 5,
									0,
								);
								this.cmd(act.step);
								this.cmd(act.setText, this.infoLabelID, 'Updating distance');
								this.cmd(
									act.setText,
									this.distanceID[neighbor],
									this.distance[neighbor],
								);
								this.cmd(act.setHighlight, this.distanceID[current], 0);
								this.cmd(act.setHighlight, this.distanceID[neighbor], 0);
								this.cmd(act.step);
								this.cmd(act.delete, this.comparisonMessageID);
								this.pq.enqueue(neighbor, this.nextIndex, newDist);
								this.cmd(
									act.setText,
									this.infoLabelID,
									'Enqueueing ' +
										this.toStr(neighbor) +
										' with distance ' +
										newDist,
								);
								this.cmd(
									act.createLabel,
									this.nextIndex++,
									'(' + this.toStr(neighbor) + ', ' + newDist + ')',
									PQ_X + ((this.pq.size() - 1) % PQ_MAX_PER_LINE) * PQ_SPACING,
									PQ_Y +
										Math.floor((this.pq.size() - 1) / PQ_MAX_PER_LINE) *
											PQ_LINE_SPACING,
									0,
								);
								this.cmd(act.step);

								const newPqIDs = this.pq.getIDs();
								if (String(pqIDs) !== String(newPqIDs.slice(0, -1))) {
									// Check if newly enqueued element shifted things
									for (let i = 0; i < this.pq.size(); i++) {
										this.cmd(
											act.move,
											newPqIDs[i],
											PQ_X + (i % PQ_MAX_PER_LINE) * PQ_SPACING,
											PQ_Y +
												Math.floor(i / PQ_MAX_PER_LINE) * PQ_LINE_SPACING,
										);
									}
									this.cmd(act.step);
								}
								pqIDs = newPqIDs;
							} else {
								this.cmd(
									act.createLabel,
									this.comparisonMessageID,
									'New distance (' +
										curDist +
										' + ' +
										edgDist +
										' = ' +
										newDist +
										') is greater than or equal to old distance (' +
										oldDistStr +
										'), skipping',
									TABLE_START_X + 2 * TABLE_ENTRY_WIDTH - 15,
									TABLE_START_Y + neighbor * this.tableEntryHeight - 5,
									0,
								);
								this.cmd(act.step);
								this.cmd(act.delete, this.comparisonMessageID);
								this.cmd(act.setHighlight, this.distanceID[current], 0);
								this.cmd(act.setHighlight, this.distanceID[neighbor], 0);
							}
						}
						this.highlightEdge(current, neighbor, 0);
					}
				}
			} else {
				this.cmd(
					act.setText,
					this.infoLabelID,
					this.toStr(current) + ' has already been visited, skipping',
				);
				this.cmd(act.step);
			}
			this.leaveVertex();
			this.cmd(act.delete, currentID);
		}

		if (this.pq.size() > 0) {
			this.cmd(act.setText, this.infoLabelID, 'All vertices have been visited, done');
		} else {
			this.cmd(act.setText, this.infoLabelID, 'Priority queue is empty, done');
		}

		return this.commands;
	}

	clear() {
		for (let i = 0; i < this.size; i++) {
			this.cmd(act.setBackgroundColor, this.circleID[i], '#FFFFFF');
			this.cmd(act.setText, this.distanceID[i], 'INF');
			this.visited[i] = false;
			this.distance[i] = -1;
		}
		for (let i = 0; i < this.visitedID.length; i++) {
			this.cmd(act.delete, this.visitedID[i]);
		}
		const pqIDs = this.pq.getIDs();
		for (const id of pqIDs) {
			this.cmd(act.delete, id);
		}
		if (this.messageID != null) {
			for (let i = 0; i < this.messageID.length; i++) {
				this.cmd(act.delete, this.messageID[i]);
			}
		}
		this.messageID = [];
	}
}
