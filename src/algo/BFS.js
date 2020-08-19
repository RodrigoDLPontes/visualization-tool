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
import { BFS_DFS_ADJ_LIST } from './util/GraphValues';
import Graph from './Graph.js';
import { act } from '../anim/AnimationMain';

const BFS_QUEUE_HEAD_COLOR = '#0000FF';
const VISITED_COLOR = '#99CCFF';

const INFO_MSG_X = 25;
const INFO_MSG_Y = 15;

const LIST_START_X = 30;
const LIST_START_Y = 65;
const LIST_SPACING = 20;

const VISITED_START_X = 30;
const VISITED_START_Y = 115;

const CURRENT_VERTEX_LABEL_X = 25;
const CURRENT_VERTEX_LABEL_Y = 140;
const CURRENT_VERTEX_X = 115;
const CURRENT_VERTEX_Y = 146;

const QUEUE_START_X = 30;
const QUEUE_START_Y = 190;
const QUEUE_SPACING = 20;

export default class BFS extends Graph {
	constructor(am, w, h) {
		super(am, w, h, BFS_DFS_ADJ_LIST);
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
		this.messageID = [];

		this.visited = [];

		this.queueID = [];
		this.listID = [];
		this.visitedID = [];

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
			'List:',
			LIST_START_X - 5,
			LIST_START_Y - 25,
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
		this.cmd(
			act.createLabel,
			this.nextIndex++,
			'Queue:',
			QUEUE_START_X - 5,
			QUEUE_START_Y - 25,
			0,
		);
		this.animationManager.setAllLayers([0, this.currentLayer]);
		this.animationManager.startNewAnimation(this.commands);
		this.animationManager.skipForward();
		this.animationManager.clearHistory();
		this.lastIndex = this.nextIndex;
	}

	reset() {
		this.nextIndex = this.lastIndex;
		this.listID = [];
		this.messageID = [];
		this.visitedID = [];
	}

	startCallback() {
		if (this.startField.value !== '') {
			let startvalue = this.startField.value;
			this.startField.value = '';
			startvalue = startvalue.toUpperCase().charCodeAt(0) - 65;
			if (startvalue >= 0 && startvalue < this.size) {
				this.implementAction(this.doBFS.bind(this), startvalue);
			}
		}
	}

	doBFS(startVetex) {
		this.commands = [];

		this.clear();

		this.queue = [];
		this.queueID = [];
		this.listID = [];
		this.visitedID = [];

		this.rebuildEdges();

		let vertex = startVetex;
		this.cmd(
			act.setText,
			this.infoLabelID,
			'Enqueueing ' + this.toStr(vertex) + ' and adding to visited set',
		);
		this.visited[vertex] = true;
		this.visitedID.push(this.nextIndex);
		this.cmd(
			act.createLabel,
			this.nextIndex++,
			this.toStr(vertex),
			VISITED_START_X,
			VISITED_START_Y,
		);
		this.cmd(act.setBackgroundColor, this.circleID[vertex], VISITED_COLOR);
		this.queue.push(vertex);
		this.queueID.push(this.nextIndex);
		this.cmd(
			act.createLabel,
			this.nextIndex++,
			this.toStr(vertex),
			QUEUE_START_X,
			QUEUE_START_Y,
		);
		this.cmd(act.step);

		while (this.queue.length > 0 && this.listID.length < this.size) {
			vertex = this.queue.shift();

			this.cmd(
				act.setText,
				this.infoLabelID,
				'Dequeueing ' + this.toStr(vertex) + ' and adding to list',
			);

			this.cmd(act.setTextColor, this.queueID[0], BFS_QUEUE_HEAD_COLOR);
			this.cmd(act.move, this.queueID[0], CURRENT_VERTEX_X, CURRENT_VERTEX_Y);
			for (let i = 1; i < this.queueID.length; i++) {
				this.cmd(
					act.move,
					this.queueID[i],
					QUEUE_START_X + (i - 1) * QUEUE_SPACING,
					QUEUE_START_Y,
				);
			}

			this.listID.push(this.nextIndex);
			this.cmd(
				act.createLabel,
				this.nextIndex++,
				this.toStr(vertex),
				LIST_START_X + (this.listID.length - 1) * LIST_SPACING,
				LIST_START_Y,
			);

			this.visitVertex(vertex);
			this.cmd(act.step);

			for (let neighbor = 0; neighbor < this.size; neighbor++) {
				if (this.adj_matrix[vertex][neighbor] > 0) {
					this.highlightEdge(vertex, neighbor, 1);
					if (!this.visited[neighbor]) {
						this.visited[neighbor] = true;
						this.visitedID.push(this.nextIndex);
						this.cmd(
							act.setText,
							this.infoLabelID,
							this.toStr(neighbor) +
								' has not yet been visited, enqueueing and adding to visited set',
						);
						this.cmd(
							act.createLabel,
							this.nextIndex++,
							this.toStr(neighbor),
							VISITED_START_X + (this.visitedID.length - 1) * LIST_SPACING,
							VISITED_START_Y,
						);
						this.cmd(act.setBackgroundColor, this.circleID[neighbor], VISITED_COLOR);
						this.queue.push(neighbor);
						this.queueID.push(this.nextIndex);
						this.cmd(
							act.createLabel,
							this.nextIndex++,
							this.toStr(neighbor),
							QUEUE_START_X + (this.queue.length - 1) * QUEUE_SPACING,
							QUEUE_START_Y,
						);
					} else {
						this.cmd(
							act.setText,
							this.infoLabelID,
							this.toStr(neighbor) + ' has already been visited, skipping',
						);
					}
					this.cmd(act.step);
					this.highlightEdge(vertex, neighbor, 0);
				}
			}

			this.cmd(act.delete, this.queueID.shift());

			this.leaveVertex();
		}

		if (this.queue.length > 0) {
			this.cmd(act.setText, this.infoLabelID, 'All vertices have been visited, done');
		} else {
			this.cmd(act.setText, this.infoLabelID, 'Queue is empty, done');
		}

		return this.commands;
	}

	clear() {
		for (let i = 0; i < this.size; i++) {
			this.cmd(act.setBackgroundColor, this.circleID[i], '#FFFFFF');
			this.visited[i] = false;
		}
		for (let i = 0; i < this.listID.length; i++) {
			this.cmd(act.delete, this.listID[i]);
		}
		for (let i = 0; i < this.visitedID.length; i++) {
			this.cmd(act.delete, this.visitedID[i]);
		}
		if (this.messageID != null) {
			for (let i = 0; i < this.messageID.length; i++) {
				this.cmd(act.delete, this.messageID[i]);
			}
		}
		this.messageID = [];
	}
}
