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
import { addControlToAlgorithmBar, addDivisorToAlgorithmBar, addLabelToAlgorithmBar } from './Algorithm.js';
import PriorityQueue from './util/PriorityQueue';
import { act } from '../anim/AnimationMain';

const AUX_ARRAY_WIDTH = 25;
const AUX_ARRAY_HEIGHT = 25;
const AUX_ARRAY_START_Y = 50;

const VISITED_START_X = 500;

const PQ_DEQUEUED_COLOR = '#0000FF';
const VISITED_COLOR = '#99CCFF';
const MST_EDGE_COLOR = '#3399FF';
const MST_EDGE_THICKNESS = 4;

const MESSAGE_LABEL_1_X = 20;
const MESSAGE_LABEL_1_Y = 15;

const CURRENT_VERTEX_LABEL_X = 20;
const CURRENT_VERTEX_LABEL_Y = 40;
const CURRENT_VERTEX_X = 110; 
const CURRENT_VERTEX_Y = 46;

const PQ_LABEL_X = 20;
const PQ_LABEL_Y = 65;

const PQ_X = 40;
const PQ_Y = 93;
const PQ_SPACING = 45;
const PQ_LINE_SPACING = 25;
const PQ_MAX_PER_LINE = 9;

const CHECKMARK = '\u2713';

export default class Prims extends Graph {
	constructor(am, w, h) {
		super(am, w, h, false, false, true);
		this.addControls();
	}

	addControls() {
		addLabelToAlgorithmBar('Start vertex: ');

		this.startField = addControlToAlgorithmBar('Text', '');
		this.startField.onkeydown = this.returnSubmit(
			this.startField,
			this.startCallback.bind(this),
			1,
			false
		);
		this.startField.size = 2;
		this.controls.push(this.startField);

		this.startButton = addControlToAlgorithmBar('Button', "Run");
		this.startButton.onclick = this.startCallback.bind(this);
		this.controls.push(this.startButton);

		addDivisorToAlgorithmBar();

		super.addControls(false);
	}

	setup() {
		super.setup();
		this.commands = [];
		this.messageID = null;

		this.visited = [];
		this.visitedID = new Array(this.size);
		this.visitedIndexID = new Array(this.size);
		this.pq = new PriorityQueue();

		for (let i = 0; i < this.size; i++) {
			this.visitedID[i] = this.nextIndex++;
			this.visitedIndexID[i] = this.nextIndex++;
			this.cmd(
				act.createRectangle,
				this.visitedID[i],
				'',
				AUX_ARRAY_WIDTH,
				AUX_ARRAY_HEIGHT,
				VISITED_START_X,
				AUX_ARRAY_START_Y + i * AUX_ARRAY_HEIGHT
			);
			this.cmd(
				act.createLabel,
				this.visitedIndexID[i],
				this.toStr(i),
				VISITED_START_X - AUX_ARRAY_WIDTH,
				AUX_ARRAY_START_Y + i * AUX_ARRAY_HEIGHT
			);
			this.cmd(act.setForegroundColor, this.visitedIndexID[i], VERTEX_INDEX_COLOR);
		}

		this.message1ID = this.nextIndex++;
		this.cmd(
			act.createLabel,
			this.message1ID,
			'',
			MESSAGE_LABEL_1_X,
			MESSAGE_LABEL_1_Y,
			0
		);

		this.cmd(
			act.createLabel,
			this.nextIndex++,
			'Visited:',
			VISITED_START_X - AUX_ARRAY_WIDTH,
			AUX_ARRAY_START_Y - AUX_ARRAY_HEIGHT * 1.5,
			0
		);
		this.cmd(
			act.createLabel,
			this.nextIndex++,
			'Current edge:',
			CURRENT_VERTEX_LABEL_X,
			CURRENT_VERTEX_LABEL_Y,
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
		this.highlightCircleL = this.nextIndex++;
		this.highlightCircleAL = this.nextIndex++;
		this.highlightCircleAM = this.nextIndex++;
	}

	reset() {
		this.messageID = [];
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

		if (this.messageID != null) {
			for (let i = 0; i < this.messageID.length; i++) {
				this.cmd(act.delete, this.messageID[i]);
			}
		}
		this.messageID = [];

		this.visitVertex(startVertex);

		this.visited[startVertex] = true;
		this.cmd(act.setText, this.visitedID[startVertex], CHECKMARK);
		this.cmd(act.setBackgroundColor, this.circleID[startVertex], VISITED_COLOR);
		this.cmd(
			act.setText,
			this.message1ID,
			'Adding ' + this.toStr(startVertex) + ' to visited set'
		);
		this.cmd(act.step);

		this.pq = new PriorityQueue();
		let pqIDs = [];
		this.cmd(
			act.setText,
			this.message1ID,
			'Enqueuing edges of ' + this.toStr(startVertex)
		);
		for (let neighbor = 0; neighbor < this.size; neighbor++) {
			const weight = this.adj_matrix[startVertex][neighbor];
			if (weight > 0) {
				this.highlightEdge(startVertex, neighbor, 1);
				this.cmd(act.createLabel,
					this.nextIndex,
					'(' + this.toStr(startVertex) + this.toStr(neighbor) + ', ' + weight + ')',
					PQ_X + this.pq.size() % PQ_MAX_PER_LINE * PQ_SPACING,
					PQ_Y + Math.floor(this.pq.size() / PQ_MAX_PER_LINE) * PQ_LINE_SPACING
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
							PQ_X + i % PQ_MAX_PER_LINE * PQ_SPACING,
							PQ_Y + Math.floor(i / PQ_MAX_PER_LINE) * PQ_LINE_SPACING
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
				this.message1ID,
				'Dequeued ' + edgeStr + ', with destination ' + this.toStr(edge[1])
			);
			this.cmd(act.move, edgeID, CURRENT_VERTEX_X, CURRENT_VERTEX_Y);
			this.cmd(act.setText, edgeID, this.toStr(edge[0]) + this.toStr(edge[1]));
			this.cmd(act.setTextColor, edgeID, PQ_DEQUEUED_COLOR);
			pqIDs = this.pq.getIDs();
			for (let i = 0; i < this.pq.size(); i++) {
				this.cmd(
					act.move,
					pqIDs[i],
					PQ_X + i % PQ_MAX_PER_LINE * PQ_SPACING,
					PQ_Y + Math.floor(i / PQ_MAX_PER_LINE) * PQ_LINE_SPACING
				);
			}
			this.highlightEdge(edge[0], edge[1], 1);
			this.visitVertex(edge[1]);
			this.cmd(act.step);

			if (!this.visited[edge[1]]) {
				this.cmd(act.setText, this.message1ID, 'Adding ' + edgeStr + ' to MST');
				this.highlightEdge(edge[0], edge[1], 0);
				this.setEdgeColor(edge[0], edge[1], MST_EDGE_COLOR);
				this.setEdgeThickness(edge[0], edge[1], MST_EDGE_THICKNESS)
				this.cmd(act.step);

				this.visited[edge[1]] = true;
				this.cmd(act.setHighlight, this.visitedID[edge[1]], 1);
				this.cmd(act.setText, this.message1ID, 'Adding ' + this.toStr(edge[1]) + ' to visited set');
				this.cmd(act.setText, this.visitedID[edge[1]], CHECKMARK);
				this.cmd(act.setBackgroundColor, this.circleID[edge[1]], VISITED_COLOR);
				this.cmd(act.step);

				this.cmd(act.setHighlight, this.visitedID[edge[1]], 0);
				this.cmd(
					act.setText,
					this.message1ID,
					'Enqueuing edges of ' + this.toStr(edge[1])
				);
				for (let neighbor = 0; neighbor < this.size; neighbor++) {
					if (this.adj_matrix[edge[1]][neighbor] >= 0) {
						this.highlightEdge(edge[1], neighbor, 1);
						this.cmd(act.setHighlight, this.circleID[neighbor], 1);
						this.cmd(act.setHighlight, this.visitedID[neighbor], 1);
						if (this.visited[neighbor]) {
							this.cmd(
								act.setText,
								this.message1ID,
								'Vertex ' + this.toStr(neighbor) + ' has already been visited, skipping'
							);
							this.cmd(act.step);
							this.cmd(act.setHighlight, this.circleID[neighbor], 0);
							this.cmd(act.setHighlight, this.visitedID[neighbor], 0);
						} else {
							this.cmd(
								act.setText,
								this.message1ID,
								'Vertex ' + this.toStr(neighbor) + ' has not yet been visited'
							);
							this.cmd(act.step);

							this.cmd(act.setHighlight, this.circleID[neighbor], 0);
							this.cmd(act.setHighlight, this.visitedID[neighbor], 0);
							edgeStr = this.toStr(edge[1]) + this.toStr(neighbor);
							this.cmd(
								act.setText,
								this.message1ID,
								'Enqueueing edge ' + edgeStr + ' with weight ' + this.adj_matrix[edge[1]][neighbor]
							);
							this.cmd(
								act.createLabel,
								this.nextIndex,
								'(' + edgeStr + ', ' + this.adj_matrix[edge[1]][neighbor] + ')',
								PQ_X + this.pq.size() % PQ_MAX_PER_LINE * PQ_SPACING,
								PQ_Y + Math.floor(this.pq.size() / PQ_MAX_PER_LINE) * PQ_LINE_SPACING
							);
							this.pq.enqueue([edge[1], neighbor], this.nextIndex++, this.adj_matrix[edge[1]][neighbor]);
							this.cmd(act.step);

							const newPqIDs = this.pq.getIDs();
							if (String(pqIDs) !== String(newPqIDs.slice(0, -1))) {
								// Check if newly enqueued element shifted things
								for (let i = 0; i < this.pq.size(); i++) {
									this.cmd(
										act.move,
										newPqIDs[i],
										PQ_X + i % PQ_MAX_PER_LINE * PQ_SPACING,
										PQ_Y + Math.floor(i / PQ_MAX_PER_LINE) * PQ_LINE_SPACING
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
				this.cmd(act.setHighlight, this.visitedID[edge[1]], 1);
				this.cmd(
					act.setText,
					this.message1ID,
					this.toStr(edge[1]) + ' has already been visited, skipping'
				);
				this.cmd(act.step);
				this.cmd(act.setHighlight, this.visitedID[edge[1]], 0);
			}
			this.leaveVertex();
			this.cmd(act.delete, edgeID);
		}

		if (this.pq.size() > 0) {
			this.cmd(
				act.setText,
				this.message1ID,
				'MST has correct amount of edges / all vertices have been visited, done'
			);
		} else {
			this.cmd(act.setText, this.message1ID, 'Priority queue is empty, done');
		}

		return this.commands;
	}

	clear() {
		this.recolorGraph();
		for (let i = 0; i < this.size; i++) {
			this.cmd(act.setBackgroundColor, this.circleID[i], "#FFFFFF");
			this.cmd(act.setText, this.visitedID[i], '');
			this.visited[i] = false;
		}
		const pqIDs = this.pq.getIDs();
		for (const id of pqIDs) {
			this.cmd(act.delete, id);
		}
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
