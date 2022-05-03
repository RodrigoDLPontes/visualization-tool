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
import Graph from './Graph.js';
import { PRIMS_KRUSKALS_ADJ_LIST } from './util/GraphValues';
import PriorityQueue from './util/PriorityQueue';
import { act } from '../anim/AnimationMain';

const PQ_DEQUEUED_COLOR = '#0000FF';
const VISITED_COLOR = '#99CCFF';
const MST_EDGE_COLOR = '#3399FF';
const MST_EDGE_THICKNESS = 4;

const INFO_MSG_X = 25;
const INFO_MSG_Y = 15;

const VISITED_START_X = 30;
const VISITED_START_Y = 65;
const VISITED_SPACING = 20;

const CURRENT_EDGE_LABEL_X = 25;
const CURRENT_EDGE_LABEL_Y = 90;
const CURRENT_VERTEX_X = 110;
const CURRENT_VERTEX_Y = 96;

const PQ_LABEL_X = 25;
const PQ_LABEL_Y = 115;

const PQ_X = 45;
const PQ_Y = 143;
const PQ_SPACING = 50;
const PQ_LINE_SPACING = 25;
const PQ_MAX_PER_LINE = 8;

export default class Prims extends Graph {
	constructor(am, w, h) {
		super(am, w, h, PRIMS_KRUSKALS_ADJ_LIST, false, false, true);
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

		super.addControls(false);
	}

	setup(adjMatrix) {
		super.setup(adjMatrix);
		this.commands = [];
		this.messageID = null;

		this.visited = [];
		this.visitedID = [];
		this.pq = new PriorityQueue();

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
			'Current edge:',
			CURRENT_EDGE_LABEL_X,
			CURRENT_EDGE_LABEL_Y,
			0,
		);
		this.cmd(act.createLabel, this.nextIndex++, 'Priority Queue:', PQ_LABEL_X, PQ_LABEL_Y, 0);

		this.animationManager.setAllLayers([0, this.currentLayer]);
		this.animationManager.startNewAnimation(this.commands);
		this.animationManager.skipForward();
		this.animationManager.clearHistory();
		this.highlightCircleL = this.nextIndex++;
		this.highlightCircleAL = this.nextIndex++;
		this.highlightCircleAM = this.nextIndex++;
		this.lastIndex = this.nextIndex;
	}

	reset() {
		this.nextIndex = this.lastIndex;
		this.messageID = [];
		this.visitedID = [];
		this.pq = new PriorityQueue();
	}

	startCallback() {
		if (this.startField.value !== '') {
			let startvalue = this.startField.value;
			this.startField.value = '';
			startvalue = startvalue.toUpperCase().charCodeAt(0) - 65;
			if (startvalue >= 0 && startvalue < this.size)
				this.implementAction(this.doPrim.bind(this), startvalue);
		}
	}

	doPrim(startVertex) {
		this.commands = [];

		this.clear();

		this.visitedID = [];

		this.visitVertex(startVertex);

		this.visited[startVertex] = true;
		this.visitedID.push(this.nextIndex);
		this.cmd(
			act.createLabel,
			this.nextIndex++,
			this.toStr(startVertex),
			VISITED_START_X,
			VISITED_START_Y,
		);
		this.cmd(act.setBackgroundColor, this.circleID[startVertex], VISITED_COLOR);
		this.cmd(
			act.setText,
			this.infoLabelID,
			'Adding ' + this.toStr(startVertex) + ' to visited set',
		);
		this.cmd(act.step);

		this.pq = new PriorityQueue();
		let pqIDs = [];
		this.cmd(act.setText, this.infoLabelID, 'Enqueuing edges of ' + this.toStr(startVertex));
		for (let neighbor = 0; neighbor < this.size; neighbor++) {
			const weight = this.adj_matrix[startVertex][neighbor];
			if (weight >= 0) {
				this.highlightEdge(startVertex, neighbor, 1);
				this.cmd(
					act.createLabel,
					this.nextIndex,
					'(' + this.toStr(startVertex) + this.toStr(neighbor) + ', ' + weight + ')',
					PQ_X + (this.pq.size() % PQ_MAX_PER_LINE) * PQ_SPACING,
					PQ_Y + Math.floor(this.pq.size() / PQ_MAX_PER_LINE) * PQ_LINE_SPACING,
				);
				this.pq.enqueue([startVertex, neighbor], this.nextIndex++, weight);
				this.cmd(act.step);
				const newPqIDs = this.pq.getIDs();
				if (String(pqIDs) !== String(newPqIDs.slice(0, -1))) {
					// Check if newly enqueued element shifted things
					for (let i = 0; i < this.pq.size(); i++) {
						this.cmd(
							act.move,
							newPqIDs[i],
							PQ_X + (i % PQ_MAX_PER_LINE) * PQ_SPACING,
							PQ_Y + Math.floor(i / PQ_MAX_PER_LINE) * PQ_LINE_SPACING,
						);
					}
					this.cmd(act.step);
				}
				pqIDs = newPqIDs;
				this.highlightEdge(startVertex, neighbor, 0);
			}
		}

		this.leaveVertex();

		while (this.visited.includes(false) && this.pq.size() !== 0) {
			const [edge, edgeID] = this.pq.dequeue();
			let edgeStr = this.toStr(edge[0]) + this.toStr(edge[1]);
			this.cmd(
				act.setText,
				this.infoLabelID,
				'Dequeued ' + edgeStr + ', with destination ' + this.toStr(edge[1]),
			);
			this.cmd(act.move, edgeID, CURRENT_VERTEX_X, CURRENT_VERTEX_Y);
			this.cmd(act.setText, edgeID, this.toStr(edge[0]) + this.toStr(edge[1]));
			this.cmd(act.setTextColor, edgeID, PQ_DEQUEUED_COLOR);
			pqIDs = this.pq.getIDs();
			for (let i = 0; i < this.pq.size(); i++) {
				this.cmd(
					act.move,
					pqIDs[i],
					PQ_X + (i % PQ_MAX_PER_LINE) * PQ_SPACING,
					PQ_Y + Math.floor(i / PQ_MAX_PER_LINE) * PQ_LINE_SPACING,
				);
			}
			this.highlightEdge(edge[0], edge[1], 1);
			this.visitVertex(edge[1]);
			this.cmd(act.step);

			if (!this.visited[edge[1]]) {
				this.cmd(act.setText, this.infoLabelID, 'Adding ' + edgeStr + ' to MST');
				this.highlightEdge(edge[0], edge[1], 0);
				this.setEdgeColor(edge[0], edge[1], MST_EDGE_COLOR);
				this.setEdgeThickness(edge[0], edge[1], MST_EDGE_THICKNESS);
				this.cmd(act.step);

				this.visited[edge[1]] = true;
				this.cmd(
					act.setText,
					this.infoLabelID,
					'Adding ' + this.toStr(edge[1]) + ' to visited set',
				);
				this.visitedID.push(this.nextIndex);
				this.cmd(
					act.createLabel,
					this.nextIndex++,
					this.toStr(edge[1]),
					VISITED_START_X + (this.visitedID.length - 1) * VISITED_SPACING,
					VISITED_START_Y,
				);
				this.cmd(act.setBackgroundColor, this.circleID[edge[1]], VISITED_COLOR);
				this.cmd(act.step);

				this.cmd(
					act.setText,
					this.infoLabelID,
					'Enqueuing edges of ' + this.toStr(edge[1]),
				);
				for (let neighbor = 0; neighbor < this.size; neighbor++) {
					if (this.adj_matrix[edge[1]][neighbor] >= 0) {
						this.highlightEdge(edge[1], neighbor, 1);
						this.cmd(act.setHighlight, this.circleID[neighbor], 1);
						if (this.visited[neighbor]) {
							this.cmd(
								act.setText,
								this.infoLabelID,
								'Vertex ' +
									this.toStr(neighbor) +
									' has already been visited, skipping',
							);
							this.cmd(act.step);
							this.cmd(act.setHighlight, this.circleID[neighbor], 0);
						} else {
							this.cmd(
								act.setText,
								this.infoLabelID,
								'Vertex ' + this.toStr(neighbor) + ' has not yet been visited',
							);
							this.cmd(act.step);

							this.cmd(act.setHighlight, this.circleID[neighbor], 0);
							edgeStr = this.toStr(edge[1]) + this.toStr(neighbor);
							this.cmd(
								act.setText,
								this.infoLabelID,
								'Enqueueing edge ' +
									edgeStr +
									' with weight ' +
									this.adj_matrix[edge[1]][neighbor],
							);
							this.cmd(
								act.createLabel,
								this.nextIndex,
								'(' + edgeStr + ', ' + this.adj_matrix[edge[1]][neighbor] + ')',
								PQ_X + (this.pq.size() % PQ_MAX_PER_LINE) * PQ_SPACING,
								PQ_Y +
									Math.floor(this.pq.size() / PQ_MAX_PER_LINE) * PQ_LINE_SPACING,
							);
							this.pq.enqueue(
								[edge[1], neighbor],
								this.nextIndex++,
								this.adj_matrix[edge[1]][neighbor],
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
										PQ_Y + Math.floor(i / PQ_MAX_PER_LINE) * PQ_LINE_SPACING,
									);
								}
								this.cmd(act.step);
							}
							pqIDs = newPqIDs;
						}
						this.highlightEdge(edge[1], neighbor, 0);
					}
				}
			} else {
				this.highlightEdge(edge[0], edge[1], 0);
				this.cmd(
					act.setText,
					this.infoLabelID,
					this.toStr(edge[1]) + ' has already been visited, skipping',
				);
				this.cmd(act.step);
			}
			this.leaveVertex();
			this.cmd(act.delete, edgeID);
		}

		if (this.pq.size() > 0) {
			this.cmd(
				act.setText,
				this.infoLabelID,
				'MST has correct amount of edges / all vertices have been visited, done',
			);
		} else {
			this.cmd(act.setText, this.infoLabelID, 'Priority queue is empty, done');
		}

		return this.commands;
	}

	clear() {
		this.recolorGraph();
		for (let i = 0; i < this.size; i++) {
			this.cmd(act.setBackgroundColor, this.circleID[i], '#FFFFFF');
			this.visited[i] = false;
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
