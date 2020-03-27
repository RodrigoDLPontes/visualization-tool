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
	addRadioButtonGroupToAlgorithmBar
} from './Algorithm.js';
import { act } from '../anim/AnimationMain';

const TERMINATION_MSG_X = 25;
const TERMINATION_MSG_Y = 15;

const AUX_ARRAY_WIDTH = 25;
const AUX_ARRAY_HEIGHT = 25;
const AUX_ARRAY_START_Y = 50;

const VISITED_START_X = 475;

const HIGHLIGHT_CIRCLE_COLOR = '#000000';
const DFS_TREE_COLOR = '#0000FF';
const DFS_STACK_TOP_COLOR = '#0000FF';

const LIST_START_X = 30;
const LIST_START_Y = 70;
const LIST_SPACING = 20;

const CURRENT_VERTEX_LABEL_X = 25;
const CURRENT_VERTEX_LABEL_Y = 110;
const CURRENT_VERTEX_X = 115;
const CURRENT_VERTEX_Y = 116;

const STACK_LABEL_X = 25;
const STACK_LABEL_Y = 140;

const STACK_START_X = 60;
const STACK_START_Y = 420;
const STACK_SPACING = 30;

const RECURSION_START_X = 30;
const RECURSION_START_Y = 170;

const CHECKMARK = '\u2713';

export default class DFS extends Graph {
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
		this.startButton = addControlToAlgorithmBar('Button', 'Run DFS');
		this.startButton.onclick = this.startCallback.bind(this);

		addDivisorToAlgorithmBar();

		const radioButtonList = addRadioButtonGroupToAlgorithmBar(
			['Stack', 'Recursion'],
			'StackType'
		);
		this.physicalStackButton = radioButtonList[0];
		this.recursiveStackButton = radioButtonList[1];
		this.physicalStackButton.onclick = () => (this.stackType = 'physical');
		this.recursiveStackButton.onclick = () => (this.stackType = 'recursive');
		this.physicalStackButton.checked = true;
		this.stackType = 'physical';

		addDivisorToAlgorithmBar();

		super.addControls();
	}

	setup() {
		super.setup();
		this.commands = [];
		this.messageID = [];

		this.visitedID = new Array(this.size);
		this.visitedIndexID = new Array(this.size);

		this.visited = [];
		this.stackID = [];
		this.listID = [];

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
				String.fromCharCode(65 + i),
				VISITED_START_X - AUX_ARRAY_WIDTH,
				AUX_ARRAY_START_Y + i * AUX_ARRAY_HEIGHT
			);
			this.cmd(act.setForegroundColor, this.visitedIndexID[i], VERTEX_INDEX_COLOR);
		}

		this.terminationLabelID = this.nextIndex++;
		this.cmd(
			act.createLabel,
			this.terminationLabelID,
			'',
			TERMINATION_MSG_X,
			TERMINATION_MSG_Y,
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
			'List:',
			LIST_START_X - 5,
			LIST_START_Y - 30,
			0
		);
		this.cmd(
			act.createLabel,
			this.nextIndex++,
			'Current vertex:',
			CURRENT_VERTEX_LABEL_X,
			CURRENT_VERTEX_LABEL_Y,
			0
		);
		this.cmd(
			act.createLabel,
			this.nextIndex++,
			'Stack / Recursive calls:',
			STACK_LABEL_X,
			STACK_LABEL_Y,
			0
		);
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
		this.listID = [];
		this.messageID = [];
	}

	startCallback() {
		if (this.startField.value !== '') {
			let startvalue = this.startField.value;
			this.startField.value = '';
			startvalue = startvalue.toUpperCase().charCodeAt(0) - 65;
			if (startvalue >= 0 && startvalue < this.size) {
				if (this.stackType === 'physical') {
					this.implementAction(this.doDFSStack.bind(this), startvalue);
				} else {
					this.implementAction(this.doDFSRecursive.bind(this), startvalue);
				}
			}
		}
	}

	doDFSStack(startVertex) {
		this.commands = [];

		this.clear();

		this.visited = new Array(this.size);
		this.stack = [];
		this.stackID = [];
		this.listID = [];

		if (this.messageID != null) {
			for (let i = 0; i < this.messageID.length; i++) {
				this.cmd(act.delete, this.messageID[i]);
			}
		}
		this.rebuildEdges();
		this.messageID = [];

		this.cmd(act.setText, this.terminationLabelID, '');
		let vertex = startVertex;
		let vertexID = this.nextIndex++;
		this.visited[vertex] = true;
		this.cmd(act.setText, this.visitedID[vertex], CHECKMARK);
		this.cmd(act.setBackgroundColor, this.circleID[vertex], "#99CCFF");
		this.stack.push(vertex);
		this.stackID.push(vertexID);
		this.cmd(
			act.createLabel,
			vertexID,
			String.fromCharCode(65 + vertex),
			STACK_START_X,
			STACK_START_Y
		);
		this.cmd(act.step);

		while (this.stack.length > 0 && this.listID.length < this.size) {
			vertex = this.stack.pop();
			vertexID = this.stackID.pop();

			this.cmd(act.setTextColor, vertexID, DFS_STACK_TOP_COLOR);
			this.cmd(act.move, vertexID, CURRENT_VERTEX_X, CURRENT_VERTEX_Y);

			this.listID.push(this.nextIndex);
			this.cmd(
				act.createLabel,
				this.nextIndex++,
				String.fromCharCode(65 + vertex),
				LIST_START_X + (this.listID.length - 1) * LIST_SPACING,
				LIST_START_Y
			);

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

			this.cmd(act.step);

			for (let neighbor = 0; neighbor < this.size; neighbor++) {
				if (this.adj_matrix[vertex][neighbor] > 0) {
					this.highlightEdge(vertex, neighbor, 1);
					this.cmd(act.setHighlight, this.visitedID[neighbor], 1);
					this.cmd(act.step);
					if (!this.visited[neighbor]) {
						this.visited[neighbor] = true;
						this.cmd(act.setText, this.visitedID[neighbor], CHECKMARK);
						this.cmd(act.setBackgroundColor, this.circleID[neighbor], "#99CCFF")
						this.highlightEdge(vertex, neighbor, 0);
						this.cmd(act.disconnect, this.circleID[vertex], this.circleID[neighbor]);
						this.cmd(
							act.connect,
							this.circleID[vertex],
							this.circleID[neighbor],
							DFS_TREE_COLOR,
							this.adjustCurveForDirectedEdges(
								this.curve[vertex][neighbor],
								this.adj_matrix[neighbor][vertex] >= 0
							),
							1,
							''
						);
						this.stack.push(neighbor);
						this.stackID.push(this.nextIndex);
						this.cmd(
							act.createLabel,
							this.nextIndex++,
							String.fromCharCode(65 + neighbor),
							STACK_START_X,
							STACK_START_Y - (this.stack.length - 1) * STACK_SPACING
						);
					} else {
						this.highlightEdge(vertex, neighbor, 0);
					}
					this.cmd(act.setHighlight, this.visitedID[neighbor], 0);
					this.cmd(act.step);
				}
			}

			this.cmd(act.delete, vertexID);

			this.cmd(act.delete, this.highlightCircleL);
			this.cmd(act.delete, this.highlightCircleAM);
			this.cmd(act.delete, this.highlightCircleAL);
		}

		if (this.stack.length > 0) {
			this.cmd(act.setText, this.terminationLabelID, 'All vertices have been visited, done.');
		} else {
			this.cmd(act.setText, this.terminationLabelID, 'Stack is empty, done.');
		}

		return this.commands;
	}

	doDFSRecursive(startVertex) {
		this.commands = [];

		this.clear();

		this.visited = new Array(this.size);
		this.listID = [];
		this.currentID = this.nextIndex++;

		if (this.messageID != null) {
			for (let i = 0; i < this.messageID.length; i++) {
				this.cmd(act.delete, this.messageID[i]);
			}
		}
		this.rebuildEdges();
		this.messageID = [];

		this.cmd(act.setText, this.terminationLabelID, '');

		const vertex = startVertex;

		this.cmd(
			act.createLabel,
			this.currentID,
			'',
			CURRENT_VERTEX_X,
			CURRENT_VERTEX_Y
		);
		this.cmd(act.setTextColor, this.currentID, DFS_STACK_TOP_COLOR);

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

		this.messageY = RECURSION_START_Y;
		this.dfsVisit(vertex, RECURSION_START_X);

		this.cmd(act.setText, this.terminationLabelID, 'Done.');
		this.cmd(act.delete, this.highlightCircleL);
		this.cmd(act.delete, this.highlightCircleAL);
		this.cmd(act.delete, this.highlightCircleAM);

		return this.commands;
	}

	dfsVisit(startVertex, messageX) {
		let nextMessage = this.nextIndex++;
		this.messageID.push(nextMessage);

		this.cmd(act.setText, this.currentID, String.fromCharCode(65 + startVertex));
		this.cmd(
			act.createLabel,
			nextMessage,
			'DFS(' + String.fromCharCode(65 + startVertex) + ')',
			messageX,
			this.messageY,
			0
		);
		this.messageY = this.messageY + 20;
		if (!this.visited[startVertex]) {
			this.visited[startVertex] = true;
			this.listID.push(this.nextIndex);
			this.cmd(
				act.createLabel,
				this.nextIndex++,
				String.fromCharCode(65 + startVertex),
				LIST_START_X + (this.listID.length - 1) * LIST_SPACING,
				LIST_START_Y
			);
			this.cmd(act.setText, this.visitedID[startVertex], CHECKMARK);
			this.cmd(act.setBackgroundColor, this.circleID[startVertex], "#99CCFF");
			this.cmd(act.step);
			for (let neighbor = 0; neighbor < this.size; neighbor++) {
				if (this.adj_matrix[startVertex][neighbor] > 0) {
					this.highlightEdge(startVertex, neighbor, 1);
					this.cmd(act.setHighlight, this.visitedID[neighbor], 1);
					if (this.visited[neighbor]) {
						nextMessage = this.nextIndex;
						this.cmd(
							act.createLabel,
							nextMessage,
							'Vertex ' + String.fromCharCode(65 + neighbor) + ' already visited.',
							messageX,
							this.messageY,
							0
						);
					}
					this.cmd(act.step);
					this.highlightEdge(startVertex, neighbor, 0);
					this.cmd(act.setHighlight, this.visitedID[neighbor], 0);
					if (this.visited[neighbor]) {
						this.cmd(act.delete, nextMessage);
					}

					if (!this.visited[neighbor]) {
						this.cmd(act.disconnect, this.circleID[startVertex], this.circleID[neighbor]);
						this.cmd(
							act.connect,
							this.circleID[startVertex],
							this.circleID[neighbor],
							DFS_TREE_COLOR,
							this.adjustCurveForDirectedEdges(
								this.curve[startVertex][neighbor],
								this.adj_matrix[neighbor][startVertex] >= 0
							),
							1,
							''
						);
						this.cmd(
							act.move,
							this.highlightCircleL,
							this.x_pos_logical[neighbor],
							this.y_pos_logical[neighbor]
						);
						this.cmd(
							act.move,
							this.highlightCircleAL,
							this.adj_list_x_start - this.adj_list_width,
							this.adj_list_y_start + neighbor * this.adj_list_height
						);
						this.cmd(
							act.move,
							this.highlightCircleAM,
							this.adj_matrix_x_start - this.adj_matrix_width,
							this.adj_matrix_y_start + neighbor * this.adj_matrix_height
						);

						this.dfsVisit(neighbor, messageX + 20);
						nextMessage = this.nextIndex;
						this.cmd(
							act.createLabel,
							nextMessage,
							'Returning from recursive call: DFS(' +
								String.fromCharCode(65 + neighbor) +
								')',
							messageX + 20,
							this.messageY,
							0
						);

						this.cmd(
							act.move,
							this.highlightCircleAL,
							this.adj_list_x_start - this.adj_list_width,
							this.adj_list_y_start + startVertex * this.adj_list_height
						);
						this.cmd(
							act.move,
							this.highlightCircleL,
							this.x_pos_logical[startVertex],
							this.y_pos_logical[startVertex]
						);
						this.cmd(
							act.move,
							this.highlightCircleAM,
							this.adj_matrix_x_start - this.adj_matrix_width,
							this.adj_matrix_y_start + startVertex * this.adj_matrix_height
						);
						this.cmd(act.step);
						this.cmd(act.delete, nextMessage);
					}
					this.cmd(act.step);
				}
			}
		}
	}

	clear() {
		for (let i = 0; i < this.size; i++) {
			this.cmd(act.setBackgroundColor, this.circleID[i], "#FFFFFF");
			this.cmd(act.setText, this.visitedID[i], '');
			this.visited[i] = false;
		}
		for (let i = 0; i < this.listID.length; i++) {
			this.cmd(act.delete, this.listID[i]);
		}
	}

	enableUI(event) {
		this.startField.disabled = false;
		this.startButton.disabled = false;
		this.physicalStackButton.disabled = false;
		this.recursiveStackButton.disabled = false;

		super.enableUI(event);
	}

	disableUI(event) {
		this.startField.disabled = true;
		this.startButton.disabled = true;
		this.physicalStackButton.disabled = true;
		this.recursiveStackButton.disabled = true;

		super.disableUI(event);
	}
}
