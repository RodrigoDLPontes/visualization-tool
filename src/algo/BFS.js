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
import { act } from '../anim/AnimationMain';

const AUX_ARRAY_WIDTH = 25;
const AUX_ARRAY_HEIGHT = 25;
const AUX_ARRAY_START_Y = 50;

const VISITED_START_X = 475;
const PARENT_START_X = 400;

const HIGHLIGHT_CIRCLE_COLOR = '#000000';
const BFS_TREE_COLOR = '#0000FF';
const BFS_QUEUE_HEAD_COLOR = '#0000FF';

const QUEUE_START_X = 30;
const QUEUE_START_Y = 50;
const QUEUE_SPACING = 30;

export default class BFS extends Graph {
	constructor(am, w, h) {
		super(am, w, h);
		this.showEdgeCosts = false;
	}

	addControls() {
		addLabelToAlgorithmBar('Start Vertex: ');
		this.startField = addControlToAlgorithmBar('Text', '');
		this.startField.onkeydown = this.returnSubmit(
			this.startField,
			this.startCallback.bind(this),
			1,
			false
		);
		this.startField.size = 2;
		this.startButton = addControlToAlgorithmBar('Button', 'Run BFS');
		this.startButton.onclick = this.startCallback.bind(this);

		addDivisorToAlgorithmBar();

		super.addControls();
	}

	setup() {
		super.setup();
		this.messageID = [];
		this.commands = [];
		this.visitedID = new Array(this.size);
		this.visitedIndexID = new Array(this.size);
		this.parentID = new Array(this.size);
		this.parentIndexID = new Array(this.size);

		for (let i = 0; i < this.size; i++) {
			this.visitedID[i] = this.nextIndex++;
			this.visitedIndexID[i] = this.nextIndex++;
			this.parentID[i] = this.nextIndex++;
			this.parentIndexID[i] = this.nextIndex++;
			this.cmd(
				act.createRectangle,
				this.visitedID[i],
				'F',
				AUX_ARRAY_WIDTH,
				AUX_ARRAY_HEIGHT,
				VISITED_START_X,
				AUX_ARRAY_START_Y + i * AUX_ARRAY_HEIGHT
			);
			this.cmd(
				act.createLabel,
				this.visitedIndexID[i],
				String.fromCharCode(65 + i),
				VISITED_START_X - AUX_ARRAY_WIDTH,
				AUX_ARRAY_START_Y + i * AUX_ARRAY_HEIGHT
			);
			this.cmd(act.setForegroundColor, this.visitedIndexID[i], VERTEX_INDEX_COLOR);
			this.cmd(
				act.createRectangle,
				this.parentID[i],
				'',
				AUX_ARRAY_WIDTH,
				AUX_ARRAY_HEIGHT,
				PARENT_START_X,
				AUX_ARRAY_START_Y + i * AUX_ARRAY_HEIGHT
			);
			this.cmd(
				act.createLabel,
				this.parentIndexID[i],
				String.fromCharCode(65 + i),
				PARENT_START_X - AUX_ARRAY_WIDTH,
				AUX_ARRAY_START_Y + i * AUX_ARRAY_HEIGHT
			);
			this.cmd(act.setForegroundColor, this.parentIndexID[i], VERTEX_INDEX_COLOR);
		}
		this.cmd(
			act.createLabel,
			this.nextIndex++,
			'Parent',
			PARENT_START_X - AUX_ARRAY_WIDTH,
			AUX_ARRAY_START_Y - AUX_ARRAY_HEIGHT * 1.5,
			0
		);
		this.cmd(
			act.createLabel,
			this.nextIndex++,
			'Visited',
			VISITED_START_X - AUX_ARRAY_WIDTH,
			AUX_ARRAY_START_Y - AUX_ARRAY_HEIGHT * 1.5,
			0
		);
		this.cmd(
			act.createLabel,
			this.nextIndex++,
			'BFS Queue',
			QUEUE_START_X,
			QUEUE_START_Y - 30,
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

	startCallback() {
		let startvalue;

		if (this.startField.value !== '') {
			startvalue = this.startField.value;
			this.startField.value = '';
			startvalue = startvalue.toUpperCase().charCodeAt(0) - 65;
			if (startvalue < this.size) this.implementAction(this.doBFS.bind(this), startvalue);
		}
	}

	doBFS(startVetex) {
		this.visited = new Array(this.size);
		this.commands = [];
		this.queue = new Array(this.size);
		let head = 0;
		let tail = 0;
		const queueID = new Array(this.size);
		let queueSize = 0;

		if (this.messageID != null) {
			for (let i = 0; i < this.messageID.length; i++) {
				this.cmd(act.delete, this.messageID[i]);
			}
		}

		this.rebuildEdges();
		this.messageID = [];
		for (let i = 0; i < this.size; i++) {
			this.cmd(act.setText, this.visitedID[i], 'F');
			this.cmd(act.setText, this.parentID[i], '');
			this.visited[i] = false;
			queueID[i] = this.nextIndex++;
		}
		let vertex = startVetex;
		this.visited[vertex] = true;
		this.queue[tail] = vertex;
		this.cmd(
			act.createLabel,
			queueID[tail],
			String.fromCharCode(65 + vertex),
			QUEUE_START_X + queueSize * QUEUE_SPACING,
			QUEUE_START_Y
		);
		queueSize = queueSize + 1;
		tail = (tail + 1) % this.size;

		while (queueSize > 0) {
			vertex = this.queue[head];
			this.cmd(
				act.createHighlightCircle,
				this.highlightCircleL,
				HIGHLIGHT_CIRCLE_COLOR,
				this.x_pos_logical[vertex],
				this.y_pos_logical[vertex]
			);
			this.cmd(act.setLayer, this.highlightCircleL, 1);
			this.cmd(
				act.createHighlightCircle,
				this.highlightCircleAL,
				HIGHLIGHT_CIRCLE_COLOR,
				this.adj_list_x_start - this.adj_list_width,
				this.adj_list_y_start + vertex * this.adj_list_height
			);
			this.cmd(act.setLayer, this.highlightCircleAL, 2);
			this.cmd(
				act.createHighlightCircle,
				this.highlightCircleAM,
				HIGHLIGHT_CIRCLE_COLOR,
				this.adj_matrix_x_start - this.adj_matrix_width,
				this.adj_matrix_y_start + vertex * this.adj_matrix_height
			);
			this.cmd(act.setLayer, this.highlightCircleAM, 3);

			this.cmd(act.setTextColor, queueID[head], BFS_QUEUE_HEAD_COLOR);

			for (let neighbor = 0; neighbor < this.size; neighbor++) {
				if (this.adj_matrix[vertex][neighbor] > 0) {
					this.highlightEdge(vertex, neighbor, 1);
					this.cmd(act.setHighlight, this.visitedID[neighbor], 1);
					this.cmd(act.step);
					if (!this.visited[neighbor]) {
						this.visited[neighbor] = true;
						this.cmd(act.setText, this.visitedID[neighbor], 'T');
						this.cmd(
							act.setText,
							this.parentID[neighbor],
							String.fromCharCode(65 + vertex)
						);
						this.highlightEdge(vertex, neighbor, 0);
						this.cmd(act.disconnect, this.circleID[vertex], this.circleID[neighbor]);
						this.cmd(
							act.connect,
							this.circleID[vertex],
							this.circleID[neighbor],
							BFS_TREE_COLOR,
							this.curve[vertex][neighbor],
							1,
							''
						);
						this.queue[tail] = neighbor;
						this.cmd(
							act.createLabel,
							queueID[tail],
							String.fromCharCode(65 + neighbor),
							QUEUE_START_X + queueSize * QUEUE_SPACING,
							QUEUE_START_Y
						);
						tail = (tail + 1) % this.size;
						queueSize = queueSize + 1;
					} else {
						this.highlightEdge(vertex, neighbor, 0);
					}
					this.cmd(act.setHighlight, this.visitedID[neighbor], 0);
					this.cmd(act.step);
				}
			}
			this.cmd(act.delete, queueID[head]);
			head = (head + 1) % this.size;
			queueSize = queueSize - 1;
			for (let i = 0; i < queueSize; i++) {
				const nextQueueIndex = (i + head) % this.size;
				this.cmd(
					act.move,
					queueID[nextQueueIndex],
					QUEUE_START_X + i * QUEUE_SPACING,
					QUEUE_START_Y
				);
			}

			this.cmd(act.delete, this.highlightCircleL);
			this.cmd(act.delete, this.highlightCircleAM);
			this.cmd(act.delete, this.highlightCircleAL);
		}

		return this.commands;
	}

	// NEED TO OVERRIDE IN PARENT
	reset() {
		// Throw an error?
	}

	enableUI(event) {
		this.startField.disabled = false;
		this.startButton.disabled = false;

		// BFS.superclass.enableUI.call(this,event);
		super.enableUI(event);
	}

	disableUI(event) {
		this.startField.disabled = true;
		this.startButton.disabled = true;

		super.disableUI(event);
		// BFS.superclass.disableUI.call(this, event);
	}
}
