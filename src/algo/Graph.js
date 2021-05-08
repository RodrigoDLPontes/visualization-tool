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

// TODO:  UNDO (all the way) is BROKEN.  Redo reset ...

import Algorithm, {
	addControlToAlgorithmBar,
	addDivisorToAlgorithmBar,
	addGroupToAlgorithmBar,
	addRadioButtonGroupToAlgorithmBar,
} from './Algorithm.js';
import {
	LARGE_ALLOWED,
	LARGE_CURVE,
	LARGE_X_POS_LOGICAL,
	LARGE_Y_POS_LOGICAL,
	SMALL_ALLLOWED,
	SMALL_CURVE,
	SMALL_X_POS_LOGICAL,
	SMALL_Y_POS_LOGICAL,
} from './util/GraphValues.js';
import { act } from '../anim/AnimationMain';

const SMALL_ADJ_MATRIX_X_START = 700;
const SMALL_ADJ_MATRIX_Y_START = 45;
const SMALL_ADJ_MATRIX_WIDTH = 30;
const SMALL_ADJ_MATRIX_HEIGHT = 30;

const SMALL_ADJ_LIST_X_START = 600;
const SMALL_ADJ_LIST_Y_START = 30;

const SMALL_ADJ_LIST_ELEM_WIDTH = 80;
const SMALL_ADJ_LIST_ELEM_HEIGHT = 30;

const SMALL_ADJ_LIST_HEIGHT = 36;
const SMALL_ADJ_LIST_WIDTH = 36;

const SMALL_ADJ_LIST_SPACING_AFTER_LIST = 15;
const SMALL_ADJ_LIST_SPACING_BETWEEN_NODES = 15;

const LARGE_ADJ_MATRIX_X_START = 575;
const LARGE_ADJ_MATRIX_Y_START = 40;
const LARGE_ADJ_MATRIX_WIDTH = 23;
const LARGE_ADJ_MATRIX_HEIGHT = 23;

const LARGE_ADJ_LIST_X_START = 600;
const LARGE_ADJ_LIST_Y_START = 30;

const LARGE_ADJ_LIST_ELEM_WIDTH = 80;
const LARGE_ADJ_LIST_ELEM_HEIGHT = 20;

const LARGE_ADJ_LIST_HEIGHT = 25;
const LARGE_ADJ_LIST_WIDTH = 20;

const LARGE_ADJ_LIST_SPACING_AFTER_LIST = 25;
const LARGE_ADJ_LIST_SPACING_BETWEEN_NODES = 15;

export const VERTEX_INDEX_COLOR = '#0000FF';
export const EDGE_COLOR = '#000000';

const HIGHLIGHT_CIRCLE_COLOR = '#000000';

export const SMALL_SIZE = 8;
export const LARGE_SIZE = 18;

export default class Graph extends Algorithm {
	constructor(am, w, h, defaultEdges, dir, dag, costs) {
		super(am, w, h);
		this.controls = [];
		defaultEdges = defaultEdges === [] ? undefined : defaultEdges;
		dir = dir === undefined ? false : dir;
		dag = dag === undefined ? false : dag;
		costs = costs === undefined ? false : costs;

		this.nextIndex = 0;

		this.currentLayer = 1;
		this.defaultEdges = defaultEdges;
		this.directed = dir;
		this.isDAG = dag;
		this.showEdgeCosts = costs;
		this.currentLayer = 1;

		this.setup_small(this.defaultEdges);
	}

	addControls(addDirection) {
		if (addDirection == null) {
			addDirection = true;
		}

		const verticalGroup = addGroupToAlgorithmBar(false);
		this.newGraphButton = addControlToAlgorithmBar('Button', 'New Graph', verticalGroup);
		this.newGraphButton.onclick = this.newGraphCallback.bind(this);
		this.controls.push(this.newGraphButton);
		this.defaultGraphButton = addControlToAlgorithmBar(
			'Button',
			'Default Graph',
			verticalGroup,
		);
		this.defaultGraphButton.onclick = this.defaultGraphCallback.bind(this);
		this.defaultGraphButton.disabled = true;
		this.controls.push(this.defaultGraphButton);

		addDivisorToAlgorithmBar();

		if (addDirection) {
			const radioButtonList = addRadioButtonGroupToAlgorithmBar(
				['Undirected Graph', 'Directed Graph'],
				'GraphType',
			);

			this.undirectedGraphButton = radioButtonList[0];
			this.undirectedGraphButton.onclick = this.directedGraphCallback.bind(this, false);
			this.undirectedGraphButton.checked = !this.directed;
			this.controls.push(this.undirectedGraphButton);

			this.directedGraphButton = radioButtonList[1];
			this.directedGraphButton.onclick = this.directedGraphCallback.bind(this, true);
			this.directedGraphButton.checked = this.directed;
			this.controls.push(this.directedGraphButton);

			addDivisorToAlgorithmBar();
		}

		let radioButtonList = addRadioButtonGroupToAlgorithmBar(
			['Small Graph', 'Large Graph'],
			'GraphSize',
		);

		this.smallGraphButton = radioButtonList[0];
		this.smallGraphButton.onclick = this.smallGraphCallback.bind(this);
		this.smallGraphButton.checked = true;
		this.controls.push(this.smallGraphButton);

		this.largeGraphButton = radioButtonList[1];
		this.largeGraphButton.onclick = this.largeGraphCallback.bind(this);
		this.controls.push(this.largeGraphButton);

		addDivisorToAlgorithmBar();

		// We are explicitly not adding the buttons below to this.controls
		// since we don't want them to be disabled
		radioButtonList = addRadioButtonGroupToAlgorithmBar(
			[
				'Logical Representation',
				'Adjacency List Representation',
				'Adjacency Matrix Representation',
			],
			'GraphRepresentation',
		);

		this.logicalButton = radioButtonList[0];
		this.logicalButton.onclick = this.graphRepChangedCallback.bind(this, 1);

		this.adjacencyListButton = radioButtonList[1];
		this.adjacencyListButton.onclick = this.graphRepChangedCallback.bind(this, 2);

		this.adjacencyMatrixButton = radioButtonList[2];
		this.adjacencyMatrixButton.onclick = this.graphRepChangedCallback.bind(this, 3);
		this.logicalButton.checked = true;
	}

	directedGraphCallback(newDirected) {
		if (newDirected !== this.directed) {
			this.defaultGraphButton.disabled = newDirected;
			this.directed = newDirected;
			this.animationManager.resetAll();
			this.setup();
		}
	}

	smallGraphCallback() {
		if (this.size !== SMALL_SIZE) {
			this.animationManager.resetAll();
			this.setup_small();
		}
	}

	largeGraphCallback() {
		if (this.size !== LARGE_SIZE) {
			this.animationManager.resetAll();
			this.setup_large();
		}
	}

	newGraphCallback() {
		this.animationManager.resetAll();
		this.setup();
	}

	defaultGraphCallback() {
		this.animationManager.resetAll();
		this.setup(this.defaultEdges);
	}

	graphRepChangedCallback(newLayer) {
		this.animationManager.setAllLayers([0, newLayer]);
		this.currentLayer = newLayer;
	}

	recolorGraph() {
		for (let i = 0; i < this.size; i++) {
			for (let j = 0; j < this.size; j++) {
				if (this.adj_matrix[i][j] >= 0) {
					this.setEdgeColor(i, j, EDGE_COLOR);
					this.setEdgeThickness(i, j, 1);
				}
			}
		}
	}

	highlightEdge(i, j, highlightVal, color) {
		this.cmd(act.setHighlight, this.adj_list_edges[i][j], highlightVal, color);
		this.cmd(act.setHighlight, this.adj_matrixID[i][j], highlightVal, color);
		this.cmd(act.setEdgeHighlight, this.circleID[i], this.circleID[j], highlightVal, color);
		if (!this.directed) {
			this.cmd(act.setEdgeHighlight, this.circleID[j], this.circleID[i], highlightVal, color);
		}
	}

	visitVertex(i) {
		this.cmd(
			act.createHighlightCircle,
			this.highlightCircleL,
			HIGHLIGHT_CIRCLE_COLOR,
			this.x_pos_logical[i],
			this.y_pos_logical[i],
		);
		this.cmd(act.setLayer, this.highlightCircleL, 1);
		this.cmd(
			act.createHighlightCircle,
			this.highlightCircleAL,
			HIGHLIGHT_CIRCLE_COLOR,
			this.adj_list_x_start - this.adj_list_width,
			this.adj_list_y_start + i * this.adj_list_height,
		);
		this.cmd(act.setLayer, this.highlightCircleAL, 2);
		this.cmd(
			act.createHighlightCircle,
			this.highlightCircleAM,
			HIGHLIGHT_CIRCLE_COLOR,
			this.adj_matrix_x_start - this.adj_matrix_width,
			this.adj_matrix_y_start + i * this.adj_matrix_height,
		);
		this.cmd(act.setLayer, this.highlightCircleAM, 3);
	}

	leaveVertex() {
		this.cmd(act.delete, this.highlightCircleL);
		this.cmd(act.delete, this.highlightCircleAM);
		this.cmd(act.delete, this.highlightCircleAL);
	}

	setEdgeColor(i, j, color) {
		this.cmd(act.setForegroundColor, this.adj_list_edges[i][j], color);
		this.cmd(act.setTextColor, this.adj_matrixID[i][j], color);
		this.cmd(act.setEdgeColor, this.circleID[i], this.circleID[j], color);
		if (!this.directed) {
			this.cmd(act.setEdgeColor, this.circleID[j], this.circleID[i], color);
		}
	}

	setEdgeThickness(i, j, thickness) {
		this.cmd(act.setEdgeThickness, this.circleID[i], this.circleID[j], thickness);
		if (!this.directed) {
			this.cmd(act.setEdgeThickness, this.circleID[j], this.circleID[i], thickness);
		}
	}

	clearEdges() {
		for (let i = 0; i < this.size; i++) {
			for (let j = 0; j < this.size; j++) {
				if (this.adj_matrix[i][j] >= 0) {
					this.cmd(act.disconnect, this.circleID[i], this.circleID[j]);
				}
			}
		}
	}

	rebuildEdges() {
		this.clearEdges();
		this.buildEdges();
	}

	buildEdges() {
		for (let i = 0; i < this.size; i++) {
			for (let j = 0; j < this.size; j++) {
				if (this.adj_matrix[i][j] >= 0) {
					const edgeLabel = this.showEdgeCosts ? String(this.adj_matrix[i][j]) : '';
					if (this.directed) {
						this.cmd(
							act.connect,
							this.circleID[i],
							this.circleID[j],
							EDGE_COLOR,
							this.adjustCurveForDirectedEdges(
								this.curve[i][j],
								this.adj_matrix[j][i] >= 0,
							),
							1,
							edgeLabel,
						);
					} else if (i < j) {
						this.cmd(
							act.connect,
							this.circleID[i],
							this.circleID[j],
							EDGE_COLOR,
							this.curve[i][j],
							0,
							edgeLabel,
						);
					}
				}
			}
		}
	}

	setup_small(adj_matrix) {
		this.allowed = SMALL_ALLLOWED;
		this.curve = SMALL_CURVE;
		this.x_pos_logical = SMALL_X_POS_LOGICAL;
		this.y_pos_logical = SMALL_Y_POS_LOGICAL;
		this.adj_matrix_x_start = SMALL_ADJ_MATRIX_X_START;
		this.adj_matrix_y_start = SMALL_ADJ_MATRIX_Y_START;
		this.adj_matrix_width = SMALL_ADJ_MATRIX_WIDTH;
		this.adj_matrix_height = SMALL_ADJ_MATRIX_HEIGHT;
		this.adj_list_x_start = SMALL_ADJ_LIST_X_START;
		this.adj_list_y_start = SMALL_ADJ_LIST_Y_START;
		this.adj_list_elem_width = SMALL_ADJ_LIST_ELEM_WIDTH;
		this.adj_list_elem_height = SMALL_ADJ_LIST_ELEM_HEIGHT;
		this.adj_list_height = SMALL_ADJ_LIST_HEIGHT;
		this.adj_list_width = SMALL_ADJ_LIST_WIDTH;
		this.adj_list_spacing_after_list = SMALL_ADJ_LIST_SPACING_AFTER_LIST;
		this.adj_list_spacing_between_nodes = SMALL_ADJ_LIST_SPACING_BETWEEN_NODES;
		this.size = SMALL_SIZE;
		this.isLarge = false;
		this.highlightCircleL = this.nextIndex++;
		this.highlightCircleAL = this.nextIndex++;
		this.highlightCircleAM = this.nextIndex++;
		this.setup(adj_matrix);
	}

	setup_large() {
		this.allowed = LARGE_ALLOWED;
		this.curve = LARGE_CURVE;
		this.x_pos_logical = LARGE_X_POS_LOGICAL;
		this.y_pos_logical = LARGE_Y_POS_LOGICAL;
		this.adj_matrix_x_start = LARGE_ADJ_MATRIX_X_START;
		this.adj_matrix_y_start = LARGE_ADJ_MATRIX_Y_START;
		this.adj_matrix_width = LARGE_ADJ_MATRIX_WIDTH;
		this.adj_matrix_height = LARGE_ADJ_MATRIX_HEIGHT;
		this.adj_list_x_start = LARGE_ADJ_LIST_X_START;
		this.adj_list_y_start = LARGE_ADJ_LIST_Y_START;
		this.adj_list_elem_width = LARGE_ADJ_LIST_ELEM_WIDTH;
		this.adj_list_elem_height = LARGE_ADJ_LIST_ELEM_HEIGHT;
		this.adj_list_height = LARGE_ADJ_LIST_HEIGHT;
		this.adj_list_width = LARGE_ADJ_LIST_WIDTH;
		this.adj_list_spacing_after_list = LARGE_ADJ_LIST_SPACING_AFTER_LIST;
		this.adj_list_spacing_between_nodes = LARGE_ADJ_LIST_SPACING_BETWEEN_NODES;
		this.size = LARGE_SIZE;
		this.isLarge = true;
		this.highlightCircleL = this.nextIndex++;
		this.highlightCircleAL = this.nextIndex++;
		this.highlightCircleAM = this.nextIndex++;
		this.setup();
	}

	adjustCurveForDirectedEdges(curve, bidirectional) {
		if (!this.directed || !bidirectional || Math.abs(curve) > 0.01) {
			return curve;
		} else {
			return 0.1;
		}
	}

	setup(adj_matrix) {
		this.commands = [];
		this.circleID = new Array(this.size);
		for (let i = 0; i < this.size; i++) {
			this.circleID[i] = this.nextIndex++;
			this.cmd(
				act.createCircle,
				this.circleID[i],
				this.toStr(i),
				this.x_pos_logical[i],
				this.y_pos_logical[i],
			);
			this.cmd(act.setTextColor, this.circleID[i], VERTEX_INDEX_COLOR, 0);

			this.cmd(act.setLayer, this.circleID[i], 1);
		}

		if (adj_matrix) {
			this.adj_matrix = adj_matrix;
			this.adj_matrixID = new Array(this.size);
			for (let i = 0; i < this.size; i++) {
				this.adj_matrixID[i] = new Array(this.size);
				for (let j = 0; j < this.size; j++) {
					this.adj_matrixID[i][j] = this.nextIndex++;
				}
			}
			this.buildEdges();
		} else {
			this.adj_matrix = new Array(this.size);
			this.adj_matrixID = new Array(this.size);
			for (let i = 0; i < this.size; i++) {
				this.adj_matrix[i] = new Array(this.size);
				this.adj_matrixID[i] = new Array(this.size);
			}

			let edgePercent;
			if (this.size === SMALL_SIZE) {
				if (this.directed) {
					edgePercent = 0.4;
				} else {
					edgePercent = 0.5;
				}
			} else {
				if (this.directed) {
					edgePercent = 0.35;
				} else {
					edgePercent = 0.6;
				}
			}

			if (this.directed) {
				for (let i = 0; i < this.size; i++) {
					for (let j = 0; j < this.size; j++) {
						this.adj_matrixID[i][j] = this.nextIndex++;
						if (
							this.allowed[i][j] &&
							Math.random() <= edgePercent &&
							(i < j ||
								Math.abs(this.curve[i][j]) < 0.01 ||
								this.adj_matrixID[j][i] === -1) &&
							(!this.isDAG || i < j)
						) {
							if (this.showEdgeCosts) {
								this.adj_matrix[i][j] = Math.floor(Math.random() * 9) + 1;
							} else {
								this.adj_matrix[i][j] = 1;
							}
						} else {
							this.adj_matrix[i][j] = -1;
						}
					}
				}
				this.buildEdges();
			} else {
				for (let i = 0; i < this.size; i++) {
					for (let j = i + 1; j < this.size; j++) {
						this.adj_matrixID[i][j] = this.nextIndex++;
						this.adj_matrixID[j][i] = this.nextIndex++;

						if (this.allowed[i][j] && Math.random() <= edgePercent) {
							if (this.showEdgeCosts) {
								this.adj_matrix[i][j] = Math.floor(Math.random() * 9) + 1;
							} else {
								this.adj_matrix[i][j] = 1;
							}
							this.adj_matrix[j][i] = this.adj_matrix[i][j];
							let edgeLabel;
							if (this.showEdgeCosts) {
								edgeLabel = String(this.adj_matrix[i][j]);
							} else {
								edgeLabel = '';
							}
							this.cmd(
								act.connect,
								this.circleID[i],
								this.circleID[j],
								EDGE_COLOR,
								this.curve[i][j],
								0,
								edgeLabel,
							);
						} else {
							this.adj_matrix[i][j] = -1;
							this.adj_matrix[j][i] = -1;
						}
					}
				}

				this.buildEdges();

				for (let i = 0; i < this.size; i++) {
					this.adj_matrix[i][i] = -1;
				}
			}
		}

		// Create Adj List

		this.buildAdjList();

		// Create Adj Matrix

		this.buildAdjMatrix();

		this.animationManager.setAllLayers([0, this.currentLayer]);
		this.animationManager.startNewAnimation(this.commands);
		this.animationManager.skipForward();
		this.animationManager.clearHistory();
		this.clearHistory();
	}

	resetAll() {}

	buildAdjMatrix() {
		this.adj_matrix_index_x = new Array(this.size);
		this.adj_matrix_index_y = new Array(this.size);
		for (let i = 0; i < this.size; i++) {
			this.adj_matrix_index_x[i] = this.nextIndex++;
			this.adj_matrix_index_y[i] = this.nextIndex++;
			this.cmd(
				act.createLabel,
				this.adj_matrix_index_x[i],
				this.toStr(i),
				this.adj_matrix_x_start + i * this.adj_matrix_width,
				this.adj_matrix_y_start - this.adj_matrix_height,
			);
			this.cmd(act.setForegroundColor, this.adj_matrix_index_x[i], VERTEX_INDEX_COLOR);
			this.cmd(
				act.createLabel,
				this.adj_matrix_index_y[i],
				this.toStr(i),
				this.adj_matrix_x_start - this.adj_matrix_width,
				this.adj_matrix_y_start + i * this.adj_matrix_height,
			);
			this.cmd(act.setForegroundColor, this.adj_matrix_index_y[i], VERTEX_INDEX_COLOR);
			this.cmd(act.setLayer, this.adj_matrix_index_x[i], 3);
			this.cmd(act.setLayer, this.adj_matrix_index_y[i], 3);

			for (let j = 0; j < this.size; j++) {
				this.adj_matrixID[i][j] = this.nextIndex++;
				let lab;
				if (this.adj_matrix[i][j] < 0) {
					lab = '';
				} else {
					lab = String(this.adj_matrix[i][j]);
				}
				this.cmd(
					act.createRectangle,
					this.adj_matrixID[i][j],
					lab,
					this.adj_matrix_width,
					this.adj_matrix_height,
					this.adj_matrix_x_start + j * this.adj_matrix_width,
					this.adj_matrix_y_start + i * this.adj_matrix_height,
				);
				this.cmd(act.setLayer, this.adj_matrixID[i][j], 3);
			}
		}
	}

	removeAdjList() {
		for (let i = 0; i < this.size; i++) {
			this.cmd(act.delete, this.adj_list_list[i], 'RAL1');
			this.cmd(act.delete, this.adj_list_index[i], 'RAL2');
			for (let j = 0; j < this.size; j++) {
				if (this.adj_matrix[i][j] > 0) {
					this.cmd(act.delete, this.adj_list_edges[i][j], 'RAL3');
				}
			}
		}
	}

	buildAdjList() {
		this.adj_list_index = new Array(this.size);
		this.adj_list_list = new Array(this.size);
		this.adj_list_edges = new Array(this.size);

		for (let i = 0; i < this.size; i++) {
			this.adj_list_index[i] = this.nextIndex++;
			this.adj_list_edges[i] = new Array(this.size);
			this.adj_list_index[i] = this.nextIndex++;
			this.adj_list_list[i] = this.nextIndex++;
			this.cmd(
				act.createRectangle,
				this.adj_list_list[i],
				'',
				this.adj_list_width,
				this.adj_list_height,
				this.adj_list_x_start,
				this.adj_list_y_start + i * this.adj_list_height,
			);
			this.cmd(act.setLayer, this.adj_list_list[i], 2);
			this.cmd(
				act.createLabel,
				this.adj_list_index[i],
				this.toStr(i),
				this.adj_list_x_start - this.adj_list_width,
				this.adj_list_y_start + i * this.adj_list_height,
			);
			this.cmd(act.setForegroundColor, this.adj_list_index[i], VERTEX_INDEX_COLOR);
			this.cmd(act.setLayer, this.adj_list_index[i], 2);
			let lastElem = this.adj_list_list[i];
			let nextXPos =
				this.adj_list_x_start +
				this.adj_list_width +
				this.adj_list_spacing_after_list +
				this.adj_list_spacing_between_nodes;
			let hasEdges = false;
			for (let j = 0; j < this.size; j++) {
				if (this.adj_matrix[i][j] >= 0) {
					hasEdges = true;
					this.adj_list_edges[i][j] = this.nextIndex++;
					this.cmd(
						act.createLinkedListNode,
						this.adj_list_edges[i][j],
						[this.toStr(j), this.adj_matrix[i][j]],
						this.adj_list_elem_width,
						this.adj_list_elem_height,
						nextXPos,
						this.adj_list_y_start + i * this.adj_list_height,
						0.25,
						0,
						1,
					);
					this.cmd(act.setNull, this.adj_list_edges[i][j], 1);
					this.cmd(act.setTextColor, this.adj_list_edges[i][j], VERTEX_INDEX_COLOR, 0);
					this.cmd(act.setLayer, this.adj_list_edges[i][j], 2);

					nextXPos =
						nextXPos + this.adj_list_elem_width + this.adj_list_spacing_between_nodes;
					this.cmd(act.connect, lastElem, this.adj_list_edges[i][j]);
					this.cmd(act.setNull, lastElem, 0);
					lastElem = this.adj_list_edges[i][j];
				}
			}
			if (!hasEdges) {
				this.cmd(act.setNull, this.adj_list_list[i], 1);
			}
		}
	}

	// Should be overwritten in child
	reset() {
		throw new Error('reset() should be implemented in child');
	}

	toStr(vertex) {
		return String.fromCharCode(65 + vertex);
	}

	enableUI() {
		for (const control of this.controls) {
			if (
				control === this.defaultGraphButton &&
				(this.directed || this.isLarge || this.adj_matrix === this.defaultEdges)
			) {
				control.disabled = true;
			} else {
				control.disabled = false;
			}
		}
	}

	disableUI() {
		for (const control of this.controls) {
			control.disabled = true;
		}
	}
}
