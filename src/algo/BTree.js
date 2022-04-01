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

import Algorithm, {
	addControlToAlgorithmBar,
	addDivisorToAlgorithmBar,
	addLabelToAlgorithmBar,
	addRadioButtonGroupToAlgorithmBar,
} from './Algorithm.js';
import { act } from '../anim/AnimationMain';

const FIRST_PRINT_POS_X = 50;
const PRINT_VERTICAL_GAP = 20;
const PRINT_MAX = 990;
const PRINT_HORIZONTAL_GAP = 50;

const MIN_MAX_DEGREE = 4;

const HEIGHT_DELTA = 50;
const NODE_SPACING = 3;
const STARTING_Y = 30;
const WIDTH_PER_ELEM = 40;
const NODE_HEIGHT = 20;

const MESSAGE_X = 5;
const MESSAGE_Y = 10;

const FOREGROUND_COLOR = '#007700';
const BACKGROUND_COLOR = '#EEFFEE';
const PRINT_COLOR = FOREGROUND_COLOR;

export default class BTree extends Algorithm {
	constructor(am, w, h) {
		super(am, w, h);
		this.nextIndex = 0;

		this.starting_x = w / 2;

		this.preemptiveSplit = false;

		this.addControls();

		this.max_keys = 3;
		this.min_keys = 1;
		this.split_index = 1;

		this.max_degree = 4;

		this.messageID = this.nextIndex++;
		this.cmd(act.createLabel, this.messageID, '', MESSAGE_X, MESSAGE_Y, 0);
		this.moveLabel1ID = this.nextIndex++;
		this.moveLabel2ID = this.nextIndex++;

		this.animationManager.startNewAnimation(this.commands);
		this.animationManager.skipForward();
		this.animationManager.clearHistory();
		this.commands = [];

		this.first_print_pos_y = h - 3 * PRINT_VERTICAL_GAP;

		this.xPosOfNextLabel = 100;
		this.yPosOfNextLabel = 200;
	}

	addControls() {
		this.controls = [];

		this.insertField = addControlToAlgorithmBar('Text', '');
		this.insertField.onkeydown = this.returnSubmit(
			this.insertField,
			this.insertCallback.bind(this),
			4,
			true,
		);
		this.controls.push(this.insertField);

		this.insertButton = addControlToAlgorithmBar('Button', 'Insert');
		this.insertButton.onclick = this.insertCallback.bind(this);
		this.controls.push(this.insertButton);

		addDivisorToAlgorithmBar();

		this.deleteField = addControlToAlgorithmBar('Text', '');
		this.deleteField.onkeydown = this.returnSubmit(
			this.deleteField,
			this.deleteCallback.bind(this),
			4,
			true,
		);
		this.controls.push(this.deleteField);

		this.deleteButton = addControlToAlgorithmBar('Button', 'Delete');
		this.deleteButton.onclick = this.deleteCallback.bind(this);
		this.controls.push(this.deleteButton);

		addDivisorToAlgorithmBar();

		this.findField = addControlToAlgorithmBar('Text', '');
		this.findField.onkeydown = this.returnSubmit(
			this.findField,
			this.findCallback.bind(this),
			4,
			true,
		);
		this.controls.push(this.findField);

		this.findButton = addControlToAlgorithmBar('Button', 'Find');
		this.findButton.onclick = this.findCallback.bind(this);
		this.controls.push(this.findButton);

		addDivisorToAlgorithmBar();

		this.printButton = addControlToAlgorithmBar('Button', 'Print');
		this.printButton.onclick = this.printCallback.bind(this);
		this.controls.push(this.printButton);

		addDivisorToAlgorithmBar();

		this.clearButton = addControlToAlgorithmBar('Button', 'Clear');
		this.clearButton.onclick = this.clearCallback.bind(this);
		this.controls.push(this.clearButton);

		addDivisorToAlgorithmBar();
		addLabelToAlgorithmBar('Promote with');
		const splitIndexButtonList = addRadioButtonGroupToAlgorithmBar(
			['second data', 'third data'],
			'Split Index',
		);

		this.splitSecondSelect = splitIndexButtonList[0];
		this.splitThirdSelect = splitIndexButtonList[1];
		this.splitSecondSelect.onclick = () => (this.split_index = 1);
		this.splitThirdSelect.onclick = () => (this.split_index = 2);
		this.splitSecondSelect.checked = true;
		this.split_index = 1;

		addDivisorToAlgorithmBar();

		const predSuccButtonList = addRadioButtonGroupToAlgorithmBar(
			['Predecessor', 'Successor'],
			'Predecessor/Successor',
		);

		this.predButton = predSuccButtonList[0];
		this.succButton = predSuccButtonList[1];

		this.predButton.onclick = this.predCallback.bind(this);
		this.succButton.onclick = this.succCallback.bind(this);
		this.succButton.checked = true;
		this.predSucc = 'succ';
	}

	reset() {
		this.nextIndex = 3;
		this.max_degree = 4;
		this.max_keys = 3;
		this.min_keys = 1;
		this.split_index = 1;
		// NOTE: The order of these last two this.commands matters!
		this.treeRoot = null;
		this.ignoreInputs = true;
		this.ignoreInputs = false;
	}

	enableUI() {
		let i;
		for (i = 0; i < this.controls.length; i++) {
			this.controls[i].disabled = false;
		}
	}

	disableUI() {
		for (let i = 0; i < this.controls.length; i++) {
			this.controls[i].disabled = true;
		}
	}

	maxDegreeChangedHandler(newMaxDegree) {
		if (this.max_degree !== newMaxDegree) {
			this.implementAction(this.changeDegree.bind(this), newMaxDegree);
			this.animationManager.skipForward();
			this.animationManager.clearHistory();
		}
	}

	predCallback() {
		if (this.predSucc !== 'pred') {
			this.predSucc = 'pred';
			//this.commands = this.clearCallback();  maybe this isn't necessary?
		}
	}

	succCallback() {
		if (this.predSucc !== 'succ') {
			this.predSucc = 'succ';
			//this.commands = this.clearCallback();
		}
	}

	insertCallback() {
		const insertedValue = this.normalizeNumber(this.insertField.value, 4);
		if (insertedValue !== '') {
			this.insertField.value = '';
			this.implementAction(this.insertElement.bind(this), parseInt(insertedValue));
		}
	}

	deleteCallback() {
		let deletedValue = this.deleteField.value;
		if (deletedValue !== '') {
			deletedValue = this.normalizeNumber(this.deleteField.value, 4);
			this.deleteField.value = '';
			this.implementAction(this.deleteElement.bind(this), parseInt(deletedValue));
		}
	}

	clearCallback() {
		this.implementAction(this.clearTree.bind(this));
	}

	premtiveSplitCallback() {
		if (this.preemptiveSplit !== this.premptiveSplitBox.checked) {
			this.implementAction(
				this.changePreemtiveSplit.bind(this),
				this.premptiveSplitBox.checked,
			);
		}
	}

	changePreemtiveSplit(newValue) {
		this.commands = [];
		this.cmd(act.step);
		this.preemptiveSplit = newValue;
		if (this.premptiveSplitBox.checked !== this.preemptiveSplit) {
			this.premptiveSplitBox.checked = this.preemptiveSplit;
		}
		return this.commands;
	}

	printCallback() {
		this.implementAction(this.printTree.bind(this));
	}

	printTree() {
		this.commands = [];
		this.cmd(act.setText, this.messageID, 'Printing tree');
		const firstLabel = this.nextIndex;

		this.xPosOfNextLabel = FIRST_PRINT_POS_X;
		this.yPosOfNextLabel = this.first_print_pos_y;

		this.printTreeRec(this.treeRoot);
		this.cmd(act.step);
		for (let i = firstLabel; i < this.nextIndex; i++) {
			this.cmd(act.delete, i);
		}
		this.nextIndex = firstLabel;
		this.cmd(act.setText, this.messageID, '');
		return this.commands;
	}

	printTreeRec(tree) {
		this.cmd(act.setHighlight, tree.graphicID, 1);
		let nextLabelID;
		if (tree.isLeaf) {
			for (let i = 0; i < tree.numKeys; i++) {
				nextLabelID = this.nextIndex++;
				this.cmd(
					act.createLabel,
					nextLabelID,
					tree.keys[i],
					this.getLabelX(tree, i),
					tree.y,
				);
				this.cmd(act.setForegroundColor, nextLabelID, PRINT_COLOR);
				this.cmd(act.move, nextLabelID, this.xPosOfNextLabel, this.yPosOfNextLabel);
				this.cmd(act.step);
				this.xPosOfNextLabel += PRINT_HORIZONTAL_GAP;
				if (this.xPosOfNextLabel > PRINT_MAX) {
					this.xPosOfNextLabel = FIRST_PRINT_POS_X;
					this.yPosOfNextLabel += PRINT_VERTICAL_GAP;
				}
			}
			this.cmd(act.setHighlight, tree.graphicID, 0);
		} else {
			this.cmd(act.setEdgeHighlight, tree.graphicID, tree.children[0].graphicID, 1);
			this.cmd(act.step);
			this.cmd(act.setHighlight, tree.graphicID, 0);
			this.cmd(act.setEdgeHighlight, tree.graphicID, tree.children[0].graphicID, 0);
			this.printTreeRec(tree.children[0]);
			for (let i = 0; i < tree.numKeys; i++) {
				this.cmd(act.setHighlight, tree.graphicID, 1);
				nextLabelID = this.nextIndex++;
				this.cmd(
					act.createLabel,
					nextLabelID,
					tree.keys[i],
					this.getLabelX(tree, i),
					tree.y,
				);
				this.cmd(act.setForegroundColor, nextLabelID, PRINT_COLOR);
				this.cmd(act.move, nextLabelID, this.xPosOfNextLabel, this.yPosOfNextLabel);
				this.cmd(act.step);
				this.xPosOfNextLabel += PRINT_HORIZONTAL_GAP;
				if (this.xPosOfNextLabel > PRINT_MAX) {
					this.xPosOfNextLabel = FIRST_PRINT_POS_X;
					this.yPosOfNextLabel += PRINT_VERTICAL_GAP;
				}
				this.cmd(act.setEdgeHighlight, tree.graphicID, tree.children[i + 1].graphicID, 1);
				this.cmd(act.step);
				this.cmd(act.setHighlight, tree.graphicID, 0);
				this.cmd(act.setEdgeHighlight, tree.graphicID, tree.children[i + 1].graphicID, 0);
				this.printTreeRec(tree.children[i + 1]);
			}
			this.cmd(act.setHighlight, tree.graphicID, 1);
			this.cmd(act.step);
			this.cmd(act.setHighlight, tree.graphicID, 0);
		}
	}

	clearTree() {
		this.commands = [];
		this.deleteTree(this.treeRoot);
		this.treeRoot = null;
		this.nextIndex = 3;
		return this.commands;
	}

	deleteTree(tree) {
		if (tree != null) {
			if (!tree.isLeaf) {
				for (let i = 0; i <= tree.numKeys; i++) {
					this.cmd(act.disconnect, tree.graphicID, tree.children[i].graphicID);
					this.deleteTree(tree.children[i]);
				}
			}
			this.cmd(act.delete, tree.graphicID);
		}
	}

	changeDegree(degree) {
		this.commands = [];
		this.deleteTree(this.treeRoot);
		this.treeRoot = null;
		this.nextIndex = 3;
		const newDegree = degree;
		this.ignoreInputs = true;
		this.maxDegreeRadioButtons[newDegree - MIN_MAX_DEGREE].checked = true;

		this.ignoreInputs = false;
		this.max_degree = newDegree;
		this.max_keys = newDegree - 1;
		this.min_keys = Math.floor((newDegree + 1) / 2) - 1;
		this.split_index = Math.floor((newDegree - 1) / 2);
		if (this.commands.length === 0) {
			this.cmd(act.step);
		}
		if (newDegree % 2 !== 0 && this.preemptiveSplit) {
			this.preemptiveSplit = false;
			this.premptiveSplitBox.checked = false;
		}
		return this.commands;
	}

	findCallback() {
		const findValue = this.normalizeNumber(this.findField.value, 4);
		this.findField.value = '';
		this.implementAction(this.findElement.bind(this), parseInt(findValue));
	}

	findElement(findValue) {
		this.commands = [];

		this.cmd(act.setText, this.messageID, 'Finding ' + findValue);
		this.findInTree(this.treeRoot, findValue);

		return this.commands;
	}

	findInTree(tree, val) {
		if (tree != null) {
			this.cmd(act.setHighlight, tree.graphicID, 1);
			this.cmd(act.step);
			let i;
			for (i = 0; i < tree.numKeys && tree.keys[i] < val; i++);
			if (i === tree.numKeys) {
				if (!tree.isLeaf) {
					this.cmd(
						act.setEdgeHighlight,
						tree.graphicID,
						tree.children[tree.numKeys].graphicID,
						1,
					);
					this.cmd(act.step);
					this.cmd(act.setHighlight, tree.graphicID, 0);
					this.cmd(
						act.setEdgeHighlight,
						tree.graphicID,
						tree.children[tree.numKeys].graphicID,
						0,
					);
					this.findInTree(tree.children[tree.numKeys], val);
				} else {
					this.cmd(act.setHighlight, tree.graphicID, 0);
					this.cmd(act.setText, this.messageID, 'Element ' + val + ' is not in the tree');
				}
			} else if (tree.keys[i] > val) {
				if (!tree.isLeaf) {
					this.cmd(act.setEdgeHighlight, tree.graphicID, tree.children[i].graphicID, 1);
					this.cmd(act.step);
					this.cmd(act.setHighlight, tree.graphicID, 0);
					this.cmd(act.setEdgeHighlight, tree.graphicID, tree.children[i].graphicID, 0);
					this.findInTree(tree.children[i], val);
				} else {
					this.cmd(act.setHighlight, tree.graphicID, 0);
					this.cmd(act.setText, this.messageID, 'Element ' + val + ' is not in the tree');
				}
			} else {
				this.cmd(act.setTextColor, tree.graphicID, '#FF0000', i);
				this.cmd(act.setText, this.messageID, 'Element ' + val + ' found');
				this.cmd(act.step);
				this.cmd(act.setTextColor, tree.graphicID, FOREGROUND_COLOR, i);
				this.cmd(act.setHighlight, tree.graphicID, 0);

				this.cmd(act.step);
			}
		} else {
			this.cmd(act.setText, this.messageID, 'Element ' + val + ' is not in the tree');
		}
	}

	insertElement(insertedValue) {
		this.commands = [];

		this.cmd(act.setText, this.messageID, 'Inserting ' + insertedValue);
		this.cmd(act.step);

		if (this.treeRoot == null) {
			this.treeRoot = new BTreeNode(this.nextIndex++, this.starting_x, STARTING_Y);
			this.cmd(
				act.createBTreeNode,
				this.treeRoot.graphicID,
				WIDTH_PER_ELEM,
				NODE_HEIGHT,
				1,
				this.starting_x,
				STARTING_Y,
				BACKGROUND_COLOR,
				FOREGROUND_COLOR,
			);
			this.treeRoot.keys[0] = insertedValue;
			this.cmd(act.setText, this.treeRoot.graphicID, insertedValue, 0);
		} else {
			if (this.preemptiveSplit) {
				if (this.treeRoot.numKeys === this.max_keys) {
					this.split(this.treeRoot);
					this.resizeTree();
					this.cmd(act.step);
				}
				this.insertNotFull(this.treeRoot, insertedValue);
			} else {
				this.insert(this.treeRoot, insertedValue);
			}
			if (!this.treeRoot.isLeaf) {
				this.resizeTree();
			}
		}

		this.cmd(act.setText, this.messageID, '');

		return this.commands;
	}

	insertNotFull(tree, insertValue) {
		this.cmd(act.setHighlight, tree.graphicID, 1);
		this.cmd(act.step);
		if (tree.isLeaf) {
			this.cmd(
				act.setText,
				this.messageID,
				'Inserting ' + insertValue + '.  Inserting into a leaf',
			);
			tree.numKeys++;
			this.cmd(act.setNumElements, tree.graphicID, tree.numKeys);
			let insertIndex = tree.numKeys - 1;
			while (insertIndex > 0 && tree.keys[insertIndex - 1] > insertValue) {
				tree.keys[insertIndex] = tree.keys[insertIndex - 1];
				this.cmd(act.setText, tree.graphicID, tree.keys[insertIndex], insertIndex);
				insertIndex--;
			}
			tree.keys[insertIndex] = insertValue;
			this.cmd(act.setText, tree.graphicID, tree.keys[insertIndex], insertIndex);
			this.cmd(act.setHighlight, tree.graphicID, 0);
			this.resizeTree();
		} else {
			let findIndex = 0;
			while (findIndex < tree.numKeys && tree.keys[findIndex] < insertValue) {
				findIndex++;
			}
			this.cmd(act.setEdgeHighlight, tree.graphicID, tree.children[findIndex].graphicID, 1);
			this.cmd(act.step);
			this.cmd(act.setEdgeHighlight, tree.graphicID, tree.children[findIndex].graphicID, 0);
			this.cmd(act.setHighlight, tree.graphicID, 0);
			if (tree.children[findIndex].numKeys === this.max_keys) {
				const newTree = this.split(tree.children[findIndex]);
				this.resizeTree();
				this.cmd(act.step);
				this.insertNotFull(newTree, insertValue);
			} else {
				this.insertNotFull(tree.children[findIndex], insertValue);
			}
		}
	}

	insert(tree, insertValue) {
		this.cmd(act.setHighlight, tree.graphicID, 1);
		this.cmd(act.step);
		if (tree.isLeaf) {
			this.cmd(
				act.setText,
				this.messageID,
				'Inserting ' + insertValue + '.  Inserting into a leaf',
			);
			tree.numKeys++;
			this.cmd(act.setNumElements, tree.graphicID, tree.numKeys);
			let insertIndex = tree.numKeys - 1;
			while (insertIndex > 0 && tree.keys[insertIndex - 1] > insertValue) {
				tree.keys[insertIndex] = tree.keys[insertIndex - 1];
				this.cmd(act.setText, tree.graphicID, tree.keys[insertIndex], insertIndex);
				insertIndex--;
			}
			tree.keys[insertIndex] = insertValue;
			this.cmd(act.setText, tree.graphicID, tree.keys[insertIndex], insertIndex);
			this.cmd(act.setHighlight, tree.graphicID, 0);
			this.resizeTree();
			this.insertRepair(tree);
		} else {
			let findIndex = 0;
			while (findIndex < tree.numKeys && tree.keys[findIndex] < insertValue) {
				findIndex++;
			}
			this.cmd(act.setEdgeHighlight, tree.graphicID, tree.children[findIndex].graphicID, 1);
			this.cmd(act.step);
			this.cmd(act.setEdgeHighlight, tree.graphicID, tree.children[findIndex].graphicID, 0);
			this.cmd(act.setHighlight, tree.graphicID, 0);
			this.insert(tree.children[findIndex], insertValue);
		}
	}

	insertRepair(tree) {
		if (tree.numKeys <= this.max_keys) {
			return;
		} else if (tree.parent == null) {
			this.treeRoot = this.split(tree);
			return;
		} else {
			const newNode = this.split(tree);
			this.insertRepair(newNode);
		}
	}

	split(tree) {
		this.cmd(act.setText, this.messageID, 'Node now contains too many keys.  Splittig ...');
		this.cmd(act.setHighlight, tree.graphicID, 1);
		this.cmd(act.step);
		this.cmd(act.setHighlight, tree.graphicID, 0);
		const rightNode = new BTreeNode(this.nextIndex++, tree.x + 100, tree.y);
		rightNode.numKeys = tree.numKeys - this.split_index - 1;
		const risingNode = tree.keys[this.split_index];
		let currentParent;
		let parentIndex;
		if (tree.parent != null) {
			currentParent = tree.parent;
			for (
				parentIndex = 0;
				parentIndex < currentParent.numKeys + 1 &&
				currentParent.children[parentIndex] !== tree;
				parentIndex++
			);
			if (parentIndex === currentParent.numKeys + 1) {
				throw new Error("Couldn't find which child we were!");
			}
			this.cmd(act.setNumElements, currentParent.graphicID, currentParent.numKeys + 1);
			for (let i = currentParent.numKeys; i > parentIndex; i--) {
				currentParent.children[i + 1] = currentParent.children[i];
				this.cmd(
					act.disconnect,
					currentParent.graphicID,
					currentParent.children[i].graphicID,
				);
				this.cmd(
					act.connect,
					currentParent.graphicID,
					currentParent.children[i].graphicID,
					FOREGROUND_COLOR,
					0, // Curve
					0, // Directed
					'', // Label
					i + 1,
				);

				currentParent.keys[i] = currentParent.keys[i - 1];
				this.cmd(act.setText, currentParent.graphicID, currentParent.keys[i], i);
			}
			currentParent.numKeys++;
			currentParent.keys[parentIndex] = risingNode;
			this.cmd(act.setText, currentParent.graphicID, '', parentIndex);
			this.moveLabel1ID = this.nextIndex++;
			this.cmd(
				act.createLabel,
				this.moveLabel1ID,
				risingNode,
				this.getLabelX(tree, this.split_index),
				tree.y,
			);
			this.cmd(act.setForegroundColor, this.moveLabel1ID, FOREGROUND_COLOR);

			this.cmd(
				act.move,
				this.moveLabel1ID,
				this.getLabelX(currentParent, parentIndex),
				currentParent.y,
			);

			currentParent.children[parentIndex + 1] = rightNode;
			rightNode.parent = currentParent;
		}

		this.cmd(
			act.createBTreeNode,
			rightNode.graphicID,
			WIDTH_PER_ELEM,
			NODE_HEIGHT,
			tree.numKeys - this.split_index - 1,
			tree.x,
			tree.y,
			BACKGROUND_COLOR,
			FOREGROUND_COLOR,
		);

		for (let i = this.split_index + 1; i < tree.numKeys + 1; i++) {
			rightNode.children[i - this.split_index - 1] = tree.children[i];
			if (tree.children[i] != null) {
				rightNode.isLeaf = false;
				this.cmd(act.disconnect, tree.graphicID, tree.children[i].graphicID);

				this.cmd(
					act.connect,
					rightNode.graphicID,
					rightNode.children[i - this.split_index - 1].graphicID,
					FOREGROUND_COLOR,
					0, // Curve
					0, // Directed
					'', // Label
					i - this.split_index - 1,
				);
				if (tree.children[i] != null) {
					tree.children[i].parent = rightNode;
				}
				tree.children[i] = null;
			}
		}
		for (let i = this.split_index + 1; i < tree.numKeys; i++) {
			rightNode.keys[i - this.split_index - 1] = tree.keys[i];
			this.cmd(
				act.setText,
				rightNode.graphicID,
				rightNode.keys[i - this.split_index - 1],
				i - this.split_index - 1,
			);
		}
		const leftNode = tree;
		leftNode.numKeys = this.split_index;
		for (let i = this.split_index; i < tree.numKeys; i++) {
			this.cmd(act.setText, tree.graphicID, '', i);
		}
		this.cmd(act.setNumElements, tree.graphicID, this.split_index);

		if (tree.parent != null) {
			this.cmd(
				act.connect,
				currentParent.graphicID,
				rightNode.graphicID,
				FOREGROUND_COLOR,
				0, // Curve
				0, // Directed
				'', // Label
				parentIndex + 1,
			);
			this.resizeTree();
			this.cmd(act.step);
			this.cmd(act.delete, this.moveLabel1ID);
			this.cmd(act.setText, currentParent.graphicID, risingNode, parentIndex);
			return tree.parent;
		} else {
			this.treeRoot = new BTreeNode(this.nextIndex++, this.starting_x, STARTING_Y);
			this.cmd(
				act.createBTreeNode,
				this.treeRoot.graphicID,
				WIDTH_PER_ELEM,
				NODE_HEIGHT,
				1,
				this.starting_x,
				STARTING_Y,
				BACKGROUND_COLOR,
				FOREGROUND_COLOR,
			);
			this.treeRoot.keys[0] = risingNode;
			this.cmd(act.setText, this.treeRoot.graphicID, risingNode, 0);
			this.treeRoot.children[0] = leftNode;
			this.treeRoot.children[1] = rightNode;
			leftNode.parent = this.treeRoot;
			rightNode.parent = this.treeRoot;
			this.cmd(
				act.connect,
				this.treeRoot.graphicID,
				leftNode.graphicID,
				FOREGROUND_COLOR,
				0, // Curve
				0, // Directed
				'', // Label
				0,
			); // Connection Point
			this.cmd(
				act.connect,
				this.treeRoot.graphicID,
				rightNode.graphicID,
				FOREGROUND_COLOR,
				0, // Curve
				0, // Directed
				'', // Label
				1,
			); // Connection Point
			this.treeRoot.isLeaf = false;
			return this.treeRoot;
		}
	}

	deleteElement(deletedValue) {
		this.commands = [];
		this.cmd(act.setText, 0, 'Deleting ' + deletedValue);
		this.cmd(act.step);
		this.cmd(act.setText, 0, '');
		this.highlightID = this.nextIndex++;
		this.cmd(act.setText, 0, '');
		if (this.preemptiveSplit) {
			this.doDeleteNotEmpty(this.treeRoot, deletedValue);
		} else {
			this.doDelete(this.treeRoot, deletedValue);
		}
		if (this.treeRoot.numKeys === 0) {
			this.cmd(act.step);
			this.cmd(act.delete, this.treeRoot.graphicID);
			this.treeRoot = this.treeRoot.children[0];
			this.treeRoot.parent = null;
			this.resizeTree();
		}
		return this.commands;
	}

	doDeleteNotEmpty(tree, val) {
		if (tree != null) {
			let nextNode;
			this.cmd(act.setHighlight, tree.graphicID, 1);
			this.cmd(act.step);
			let i;
			for (i = 0; i < tree.numKeys && tree.keys[i] < val; i++);
			if (i === tree.numKeys) {
				if (!tree.isLeaf) {
					this.cmd(
						act.setEdgeHighlight,
						tree.graphicID,
						tree.children[tree.numKeys].graphicID,
						1,
					);
					this.cmd(act.step);
					this.cmd(act.setHighlight, tree.graphicID, 0);
					this.cmd(
						act.setEdgeHighlight,
						tree.graphicID,
						tree.children[tree.numKeys].graphicID,
						0,
					);

					if (tree.children[tree.numKeys].numKeys === this.min_keys) {
						if (tree.children[tree.numKeys - 1].numKeys > this.min_keys) {
							nextNode = this.stealFromLeft(
								tree.children[tree.numKeys],
								tree.numKeys,
							);
							this.doDeleteNotEmpty(nextNode, val);
						} else {
							nextNode = this.mergeRight(tree.children[tree.numKeys - 1]);
							this.doDeleteNotEmpty(nextNode, val);
						}
					} else {
						this.doDeleteNotEmpty(tree.children[tree.numKeys], val);
					}
				} else {
					this.cmd(act.setHighlight, tree.graphicID, 0);
				}
			} else if (tree.keys[i] > val) {
				if (!tree.isLeaf) {
					this.cmd(act.setEdgeHighlight, tree.graphicID, tree.children[i].graphicID, 1);
					this.cmd(act.step);
					this.cmd(act.setHighlight, tree.graphicID, 0);
					this.cmd(act.setEdgeHighlight, tree.graphicID, tree.children[i].graphicID, 0);

					if (tree.children[i].numKeys > this.min_keys) {
						this.doDeleteNotEmpty(tree.children[i], val);
					} else {
						if (tree.children[i + 1].numKeys > this.min_keys) {
							nextNode = this.stealFromRight(tree.children[i], i);
							this.doDeleteNotEmpty(nextNode, val);
						} else {
							nextNode = this.mergeRight(tree.children[i]);
							this.doDeleteNotEmpty(nextNode, val);
						}
					}
				} else {
					this.cmd(act.setHighlight, tree.graphicID, 0);
				}
			} else {
				this.cmd(act.setTextColor, tree.graphicID, 'FF0000', i);
				this.cmd(act.step);
				if (tree.isLeaf) {
					this.cmd(act.setTextColor, tree.graphicID, FOREGROUND_COLOR, i);
					for (let j = i; j < tree.numKeys - 1; j++) {
						tree.keys[j] = tree.keys[j + 1];
						this.cmd(act.setText, tree.graphicID, tree.keys[j], j);
					}
					tree.numKeys--;
					this.cmd(act.setText, tree.graphicID, '', tree.numKeys);
					this.cmd(act.setNumElements, tree.graphicID, tree.numKeys);
					this.cmd(act.setHighlight, tree.graphicID, 0);
					this.resizeTree();
					this.cmd(act.setText, this.messageID, '');
				} else {
					this.cmd(
						act.setText,
						this.messageID,
						'Checking to see if tree to left of element to delete \nhas an extra key',
					);
					this.cmd(act.setEdgeHighlight, tree.graphicID, tree.children[i].graphicID, 1);

					this.cmd(act.step);
					this.cmd(act.setEdgeHighlight, tree.graphicID, tree.children[i].graphicID, 0);
					let maxNode = tree.children[i];

					if (tree.children[i].numKeys === this.min_keys) {
						this.cmd(
							act.setText,
							this.messageID,
							'Tree to left of element to delete does not have an extra key.  \nLooking to the right ...',
						);
						this.cmd(
							act.setEdgeHighlight,
							tree.graphicID,
							tree.children[i + 1].graphicID,
							1,
						);
						this.cmd(act.step);
						this.cmd(
							act.setEdgeHighlight,
							tree.graphicID,
							tree.children[i + 1].graphicID,
							0,
						);
						// Trees to left and right of node to delete don't have enough keys
						// Do a merge, and then recursively delete the element
						if (tree.children[i + 1].numKeys === this.min_keys) {
							this.cmd(
								act.setText,
								this.messageID,
								'Neither subtree has extra nodes.  Mergeing around the key to delete, \nand recursively deleting ...',
							);
							this.cmd(act.step);
							this.cmd(act.setTextColor, tree.graphicID, FOREGROUND_COLOR, i);
							nextNode = this.mergeRight(tree.children[i]);
							this.doDeleteNotEmpty(nextNode, val);
							return;
						} else {
							this.cmd(
								act.setText,
								this.messageID,
								'Tree to right of element to delete does have an extra key. \nFinding the smallest key in that subtree ...',
							);
							this.cmd(act.step);

							let minNode = tree.children[i + 1];
							while (!minNode.isLeaf) {
								this.cmd(act.setHighlight, minNode.graphicID, 1);
								this.cmd(act.step);
								this.cmd(act.setHighlight, minNode.graphicID, 0);
								if (minNode.children[0].numKeys === this.min_keys) {
									if (minNode.children[1].numKeys === this.min_keys) {
										minNode = this.mergeRight(minNode.children[0]);
									} else {
										minNode = this.stealFromRight(minNode.children[0], 0);
									}
								} else {
									minNode = minNode.children[0];
								}
							}

							this.cmd(act.setHighlight, minNode.graphicID, 1);
							tree.keys[i] = minNode.keys[0];
							this.cmd(act.setTextColor, tree.graphicID, FOREGROUND_COLOR, i);
							this.cmd(act.setText, tree.graphicID, '', i);
							this.cmd(act.setText, minNode.graphicID, '', 0);

							this.cmd(
								act.createLabel,
								this.moveLabel1ID,
								minNode.keys[0],
								this.getLabelX(minNode, 0),
								minNode.y,
							);
							this.cmd(act.move, this.moveLabel1ID, this.getLabelX(tree, i), tree.y);
							this.cmd(act.step);
							this.cmd(act.delete, this.moveLabel1ID);
							this.cmd(act.setText, tree.graphicID, tree.keys[i], i);
							for (i = 1; i < minNode.numKeys; i++) {
								minNode.keys[i - 1] = minNode.keys[i];
								this.cmd(
									act.setText,
									minNode.graphicID,
									minNode.keys[i - 1],
									i - 1,
								);
							}
							this.cmd(act.setText, minNode.graphicID, '', minNode.numKeys - 1);

							minNode.numKeys--;
							this.cmd(act.setHighlight, minNode.graphicID, 0);
							this.cmd(act.setHighlight, tree.graphicID, 0);

							this.cmd(act.setNumElements, minNode.graphicID, minNode.numKeys);
							this.resizeTree();
							this.cmd(act.setText, this.messageID, '');
						}
					} else {
						this.cmd(
							act.setText,
							this.messageID,
							'Tree to left of element to delete does have \nan extra key. Finding the largest key in that subtree ...',
						);
						this.cmd(act.step);
						while (!maxNode.isLeaf) {
							this.cmd(act.setHighlight, maxNode.graphicID, 1);
							this.cmd(act.step);
							this.cmd(act.setHighlight, maxNode.graphicID, 0);
							if (maxNode.children[maxNode.numKeys].numKeys === this.min_keys) {
								if (maxNode.children[maxNode.numKeys - 1] > this.min_keys) {
									maxNode = this.stealFromLeft(
										maxNode.children[maxNode.numKeys],
										maxNode.numKeys,
									);
								}
								maxNode = this.mergeRight(maxNode.children[maxNode.numKeys - 1]);
							} else {
								maxNode = maxNode.children[maxNode.numKeys];
							}
						}
						this.cmd(act.setHighlight, maxNode.graphicID, 1);
						tree.keys[i] = maxNode.keys[maxNode.numKeys - 1];
						this.cmd(act.setTextColor, tree.graphicID, FOREGROUND_COLOR, i);
						this.cmd(act.setText, tree.graphicID, '', i);
						this.cmd(act.setText, maxNode.graphicID, '', maxNode.numKeys - 1);
						this.cmd(
							act.createLabel,
							this.moveLabel1ID,
							tree.keys[i],
							this.getLabelX(maxNode, maxNode.numKeys - 1),
							maxNode.y,
						);
						this.cmd(act.move, this.moveLabel1ID, this.getLabelX(tree, i), tree.y);
						this.cmd(act.step);
						this.cmd(act.delete, this.moveLabel1ID);
						this.cmd(act.setText, tree.graphicID, tree.keys[i], i);
						maxNode.numKeys--;
						this.cmd(act.setHighlight, maxNode.graphicID, 0);
						this.cmd(act.setHighlight, tree.graphicID, 0);

						this.cmd(act.setNumElements, maxNode.graphicID, maxNode.numKeys);
						this.resizeTree();
						this.cmd(act.setText, this.messageID, '');
					}
				}
			}
		}
	}

	doDelete(tree, val) {
		if (tree != null) {
			this.cmd(act.setHighlight, tree.graphicID, 1);
			this.cmd(act.step);
			let i;
			for (i = 0; i < tree.numKeys && tree.keys[i] < val; i++);
			if (i === tree.numKeys) {
				if (!tree.isLeaf) {
					this.cmd(
						act.setEdgeHighlight,
						tree.graphicID,
						tree.children[tree.numKeys].graphicID,
						1,
					);
					this.cmd(act.step);
					this.cmd(act.setHighlight, tree.graphicID, 0);
					this.cmd(
						act.setEdgeHighlight,
						tree.graphicID,
						tree.children[tree.numKeys].graphicID,
						0,
					);
					this.doDelete(tree.children[tree.numKeys], val);
				} else {
					this.cmd(act.setHighlight, tree.graphicID, 0);
				}
			} else if (tree.keys[i] > val) {
				if (!tree.isLeaf) {
					this.cmd(act.setEdgeHighlight, tree.graphicID, tree.children[i].graphicID, 1);
					this.cmd(act.step);
					this.cmd(act.setHighlight, tree.graphicID, 0);
					this.cmd(act.setEdgeHighlight, tree.graphicID, tree.children[i].graphicID, 0);
					this.doDelete(tree.children[i], val);
				} else {
					this.cmd(act.setHighlight, tree.graphicID, 0);
				}
			} else {
				this.cmd(act.setTextColor, tree.graphicID, '#FF0000', i);
				this.cmd(act.step);
				if (tree.isLeaf) {
					this.cmd(act.setTextColor, tree.graphicID, FOREGROUND_COLOR, i);
					for (let j = i; j < tree.numKeys - 1; j++) {
						tree.keys[j] = tree.keys[j + 1];
						this.cmd(act.setText, tree.graphicID, tree.keys[j], j);
					}
					tree.numKeys--;
					this.cmd(act.setText, tree.graphicID, '', tree.numKeys);
					this.cmd(act.setNumElements, tree.graphicID, tree.numKeys);
					this.cmd(act.setHighlight, tree.graphicID, 0);
					this.repairAfterDelete(tree);
				} else {
					let maxNode;
					if (this.predSucc === 'pred') {
						maxNode = tree.children[i];
						while (!maxNode.isLeaf) {
							this.cmd(act.setHighlight, maxNode.graphicID, 1);
							this.cmd(act.step);
							this.cmd(act.setHighlight, maxNode.graphicID, 0);
							maxNode = maxNode.children[maxNode.numKeys];
						}
						this.cmd(act.setHighlight, maxNode.graphicID, 1);
						tree.keys[i] = maxNode.keys[maxNode.numKeys - 1];
						this.cmd(act.setTextColor, tree.graphicID, FOREGROUND_COLOR, i);
						this.cmd(act.setText, tree.graphicID, '', i);
						this.cmd(act.setText, maxNode.graphicID, '', maxNode.numKeys - 1);
						this.cmd(
							act.createLabel,
							this.moveLabel1ID,
							tree.keys[i],
							this.getLabelX(maxNode, maxNode.numKeys - 1),
							maxNode.y,
						);
					} else {
						maxNode = tree.children[i + 1];
						while (!maxNode.isLeaf) {
							this.cmd(act.setHighlight, maxNode.graphicID, 1);
							this.cmd(act.step);
							this.cmd(act.setHighlight, maxNode.graphicID, 0);
							maxNode = maxNode.children[0];
						}
						this.cmd(act.setHighlight, maxNode.graphicID, 1);
						tree.keys[i] = maxNode.keys[0];
						this.cmd(act.setTextColor, tree.graphicID, FOREGROUND_COLOR, i);
						this.cmd(act.setText, tree.graphicID, '', i);
						this.cmd(act.setText, maxNode.graphicID, '', 0);
						this.cmd(
							act.createLabel,
							this.moveLabel1ID,
							tree.keys[i],
							this.getLabelX(maxNode, 0),
							maxNode.y,
						);
					}
					this.cmd(act.move, this.moveLabel1ID, this.getLabelX(tree, i), tree.y);
					this.cmd(act.step);
					this.cmd(act.delete, this.moveLabel1ID);
					this.cmd(act.setText, tree.graphicID, tree.keys[i], i);
					maxNode.numKeys--;
					this.cmd(act.setHighlight, maxNode.graphicID, 0);
					this.cmd(act.setHighlight, tree.graphicID, 0);

					/* When setNumElements is called with the new #, it cuts of the last element
					(like removeFromBack in an array). Removing the successor is more like 
					removeFromFront so you need to shift elements left by 1*/
					if (this.predSucc === 'succ') {
						for (let j = 0; j < maxNode.numKeys; j++) {
							maxNode.keys[j] = maxNode.keys[j + 1];
							this.cmd(act.setText, maxNode.graphicID, maxNode.keys[j], j);
						}
					}
					this.cmd(act.setNumElements, maxNode.graphicID, maxNode.numKeys);
					this.repairAfterDelete(maxNode);
				}
			}
		}
	}

	mergeRight(tree) {
		this.cmd(act.setText, this.messageID, 'Merging node');

		const parentNode = tree.parent;
		let parentIndex = 0;
		for (parentIndex = 0; parentNode.children[parentIndex] !== tree; parentIndex++);
		const rightSib = parentNode.children[parentIndex + 1];
		this.cmd(act.setHighlight, tree.graphicID, 1);
		this.cmd(act.setHighlight, parentNode.graphicID, 1);
		this.cmd(act.setHighlight, rightSib.graphicID, 1);

		this.cmd(act.step);
		this.cmd(act.setNumElements, tree.graphicID, tree.numKeys + rightSib.numKeys + 1);
		tree.x = (tree.x + rightSib.x) / 2;
		this.cmd(act.setPosition, tree.graphicID, tree.x, tree.y);

		tree.keys[tree.numKeys] = parentNode.keys[parentIndex];
		const fromParentIndex = tree.numKeys;
		this.cmd(act.setText, tree.graphicID, '', tree.numKeys);
		this.cmd(
			act.createLabel,
			this.moveLabel1ID,
			parentNode.keys[parentIndex],
			this.getLabelX(parentNode, parentIndex),
			parentNode.y,
		);

		for (let i = 0; i < rightSib.numKeys; i++) {
			tree.keys[tree.numKeys + 1 + i] = rightSib.keys[i];
			this.cmd(
				act.setText,
				tree.graphicID,
				tree.keys[tree.numKeys + 1 + i],
				tree.numKeys + 1 + i,
			);
			this.cmd(act.setText, rightSib.graphicID, '', i);
		}
		if (!tree.isLeaf) {
			for (let i = 0; i <= rightSib.numKeys; i++) {
				this.cmd(act.disconnect, rightSib.graphicID, rightSib.children[i].graphicID);
				tree.children[tree.numKeys + 1 + i] = rightSib.children[i];
				tree.children[tree.numKeys + 1 + i].parent = tree;
				this.cmd(
					act.connect,
					tree.graphicID,
					tree.children[tree.numKeys + 1 + i].graphicID,
					FOREGROUND_COLOR,
					0, // Curve
					0, // Directed
					'', // Label
					tree.numKeys + 1 + i,
				);
			}
		}
		this.cmd(act.disconnect, parentNode.graphicID, rightSib.graphicID);
		for (let i = parentIndex + 1; i < parentNode.numKeys; i++) {
			this.cmd(act.disconnect, parentNode.graphicID, parentNode.children[i + 1].graphicID);
			parentNode.children[i] = parentNode.children[i + 1];
			this.cmd(
				act.connect,
				parentNode.graphicID,
				parentNode.children[i].graphicID,
				FOREGROUND_COLOR,
				0, // Curve
				0, // Directed
				'', // Label
				i,
			);
			parentNode.keys[i - 1] = parentNode.keys[i];
			this.cmd(act.setText, parentNode.graphicID, parentNode.keys[i - 1], i - 1);
		}
		this.cmd(act.setText, parentNode.graphicID, '', parentNode.numKeys - 1);
		parentNode.numKeys--;
		this.cmd(act.setNumElements, parentNode.graphicID, parentNode.numKeys);
		this.cmd(act.setHighlight, tree.graphicID, 0);
		this.cmd(act.setHighlight, parentNode.graphicID, 0);

		this.cmd(act.delete, rightSib.graphicID);
		tree.numKeys = tree.numKeys + rightSib.numKeys + 1;
		this.cmd(act.move, this.moveLabel1ID, this.getLabelX(tree, fromParentIndex), tree.y);

		this.cmd(act.step);
		this.cmd(act.delete, this.moveLabel1ID);
		this.cmd(act.setText, tree.graphicID, tree.keys[fromParentIndex], fromParentIndex);

		this.cmd(act.setText, this.messageID, '');
		return tree;
	}

	stealFromRight(tree, parentIndex) {
		// Steal from right sibling
		const parentNode = tree.parent;

		this.cmd(act.setNumElements, tree.graphicID, tree.numKeys + 1);

		this.cmd(act.setText, this.messageID, 'Stealing from right sibling');

		const rightSib = parentNode.children[parentIndex + 1];
		tree.numKeys++;

		this.cmd(act.setNumElements, tree.graphicID, tree.numKeys);

		this.cmd(act.setText, tree.graphicID, '', tree.numKeys - 1);
		this.cmd(act.setText, parentNode.graphicID, '', parentIndex);
		this.cmd(act.setText, rightSib.graphicID, '', 0);

		const tmpLabel1 = this.nextIndex++;
		const tmpLabel2 = this.nextIndex++;

		this.cmd(
			act.createLabel,
			tmpLabel1,
			rightSib.keys[0],
			this.getLabelX(rightSib, 0),
			rightSib.y,
		);
		this.cmd(
			act.createLabel,
			tmpLabel2,
			parentNode.keys[parentIndex],
			this.getLabelX(parentNode, parentIndex),
			parentNode.y,
		);
		this.cmd(act.setForegroundColor, tmpLabel1, FOREGROUND_COLOR);
		this.cmd(act.setForegroundColor, tmpLabel2, FOREGROUND_COLOR);

		this.cmd(act.move, tmpLabel1, this.getLabelX(parentNode, parentIndex), parentNode.y);
		this.cmd(act.move, tmpLabel2, this.getLabelX(tree, tree.numKeys - 1), tree.y);

		this.cmd(act.step);
		this.cmd(act.delete, tmpLabel1);
		this.cmd(act.delete, tmpLabel2);
		tree.keys[tree.numKeys - 1] = parentNode.keys[parentIndex];
		parentNode.keys[parentIndex] = rightSib.keys[0];

		this.cmd(act.setText, tree.graphicID, tree.keys[tree.numKeys - 1], tree.numKeys - 1);
		this.cmd(act.setText, parentNode.graphicID, parentNode.keys[parentIndex], parentIndex);
		if (!tree.isLeaf) {
			tree.children[tree.numKeys] = rightSib.children[0];
			tree.children[tree.numKeys].parent = tree;
			this.cmd(act.disconnect, rightSib.graphicID, rightSib.children[0].graphicID);
			this.cmd(
				act.connect,
				tree.graphicID,
				tree.children[tree.numKeys].graphicID,
				FOREGROUND_COLOR,
				0, // Curve
				0, // Directed
				'', // Label
				tree.numKeys,
			);

			for (let i = 1; i < rightSib.numKeys + 1; i++) {
				this.cmd(act.disconnect, rightSib.graphicID, rightSib.children[i].graphicID);
				rightSib.children[i - 1] = rightSib.children[i];
				this.cmd(
					act.connect,
					rightSib.graphicID,
					rightSib.children[i - 1].graphicID,
					FOREGROUND_COLOR,
					0, // Curve
					0, // Directed
					'', // Label
					i - 1,
				);
			}
		}
		for (let i = 1; i < rightSib.numKeys; i++) {
			rightSib.keys[i - 1] = rightSib.keys[i];
			this.cmd(act.setText, rightSib.graphicID, rightSib.keys[i - 1], i - 1);
		}
		this.cmd(act.setText, rightSib.graphicID, '', rightSib.numKeys - 1);
		rightSib.numKeys--;
		this.cmd(act.setNumElements, rightSib.graphicID, rightSib.numKeys);
		this.resizeTree();
		this.cmd(act.setText, this.messageID, '');
		return tree;
	}

	stealFromLeft(tree, parentIndex) {
		const parentNode = tree.parent;
		// Steal from left sibling
		tree.numKeys++;
		this.cmd(act.setNumElements, tree.graphicID, tree.numKeys);
		this.cmd(
			act.setText,
			this.messageID,
			'Node has too few keys.  Stealing from left sibling.',
		);

		for (let i = tree.numKeys - 1; i > 0; i--) {
			tree.keys[i] = tree.keys[i - 1];
			this.cmd(act.setText, tree.graphicID, tree.keys[i], i);
		}
		const leftSib = parentNode.children[parentIndex - 1];

		this.cmd(act.setText, tree.graphicID, '', 0);
		this.cmd(act.setText, parentNode.graphicID, '', parentIndex - 1);
		this.cmd(act.setText, leftSib.graphicID, '', leftSib.numKeys - 1);

		const tmpLabel1 = this.nextIndex++;
		const tmpLabel2 = this.nextIndex++;

		this.cmd(
			act.createLabel,
			tmpLabel1,
			leftSib.keys[leftSib.numKeys - 1],
			this.getLabelX(leftSib, leftSib.numKeys - 1),
			leftSib.y,
		);
		this.cmd(
			act.createLabel,
			tmpLabel2,
			parentNode.keys[parentIndex - 1],
			this.getLabelX(parentNode, parentIndex - 1),
			parentNode.y,
		);
		this.cmd(act.setForegroundColor, tmpLabel1, FOREGROUND_COLOR);
		this.cmd(act.setForegroundColor, tmpLabel2, FOREGROUND_COLOR);

		this.cmd(act.move, tmpLabel1, this.getLabelX(parentNode, parentIndex - 1), parentNode.y);
		this.cmd(act.move, tmpLabel2, this.getLabelX(tree, 0), tree.y);

		this.cmd(act.step);
		this.cmd(act.delete, tmpLabel1);
		this.cmd(act.delete, tmpLabel2);

		if (!tree.isLeaf) {
			for (let i = tree.numKeys; i > 0; i--) {
				this.cmd(act.disconnect, tree.graphicID, tree.children[i - 1].graphicID);
				tree.children[i] = tree.children[i - 1];
				this.cmd(
					act.connect,
					tree.graphicID,
					tree.children[i].graphicID,
					FOREGROUND_COLOR,
					0, // Curve
					0, // Directed
					'', // Label
					i,
				);
			}
			tree.children[0] = leftSib.children[leftSib.numKeys];
			this.cmd(
				act.disconnect,
				leftSib.graphicID,
				leftSib.children[leftSib.numKeys].graphicID,
			);
			this.cmd(
				act.connect,
				tree.graphicID,
				tree.children[0].graphicID,
				FOREGROUND_COLOR,
				0, // Curve
				0, // Directed
				'', // Label
				0,
			);
			leftSib.children[leftSib.numKeys] = null;
			tree.children[0].parent = tree;
		}

		tree.keys[0] = parentNode.keys[parentIndex - 1];
		this.cmd(act.setText, tree.graphicID, tree.keys[0], 0);
		parentNode.keys[parentIndex - 1] = leftSib.keys[leftSib.numKeys - 1];
		this.cmd(
			act.setText,
			parentNode.graphicID,
			parentNode.keys[parentIndex - 1],
			parentIndex - 1,
		);
		this.cmd(act.setText, leftSib.graphicID, '', leftSib.numKeys - 1);

		leftSib.numKeys--;
		this.cmd(act.setNumElements, leftSib.graphicID, leftSib.numKeys);
		this.resizeTree();
		this.cmd(act.setText, this.messageID, '');
		return tree;
	}

	repairAfterDelete(tree) {
		if (tree.numKeys < this.min_keys) {
			if (tree.parent == null) {
				if (tree.numKeys === 0) {
					this.cmd(act.step);
					this.cmd(act.delete, tree.graphicID);
					this.treeRoot = tree.children[0];
					if (this.treeRoot != null) this.treeRoot.parent = null;
					this.resizeTree();
				}
			} else {
				const parentNode = tree.parent;
				let parentIndex;
				let nextNode;
				for (parentIndex = 0; parentNode.children[parentIndex] !== tree; parentIndex++);
				if (
					parentIndex > 0 &&
					parentNode.children[parentIndex - 1].numKeys > this.min_keys
				) {
					this.stealFromLeft(tree, parentIndex);
				} else if (
					parentIndex < parentNode.numKeys &&
					parentNode.children[parentIndex + 1].numKeys > this.min_keys
				) {
					this.stealFromRight(tree, parentIndex);
				} else if (parentIndex === 0) {
					// Merge with right sibling
					nextNode = this.mergeRight(tree);
					this.repairAfterDelete(nextNode.parent);
				} else {
					// Merge with left sibling
					nextNode = this.mergeRight(parentNode.children[parentIndex - 1]);
					this.repairAfterDelete(nextNode.parent);
				}
			}
		}
	}

	getLabelX(tree, index) {
		return (
			tree.x -
			(WIDTH_PER_ELEM * tree.numKeys) / 2 +
			WIDTH_PER_ELEM / 2 +
			index * WIDTH_PER_ELEM
		);
	}

	resizeTree() {
		this.resizeWidths(this.treeRoot);
		this.setNewPositions(this.treeRoot, this.starting_x, STARTING_Y);
		this.animateNewPositions(this.treeRoot);
	}

	setNewPositions(tree, xPosition, yPosition) {
		if (tree != null) {
			tree.y = yPosition;
			tree.x = xPosition;
			if (!tree.isLeaf) {
				const leftEdge = xPosition - tree.width / 2;
				let priorWidth = 0;
				for (let i = 0; i < tree.numKeys + 1; i++) {
					this.setNewPositions(
						tree.children[i],
						leftEdge + priorWidth + tree.widths[i] / 2,
						yPosition + HEIGHT_DELTA,
					);
					priorWidth += tree.widths[i];
				}
			}
		}
	}

	animateNewPositions(tree) {
		if (tree == null) {
			return;
		}
		let i;
		for (i = 0; i < tree.numKeys + 1; i++) {
			this.animateNewPositions(tree.children[i]);
		}
		this.cmd(act.move, tree.graphicID, tree.x, tree.y);
	}

	resizeWidths(tree) {
		if (tree == null) {
			return 0;
		}
		if (tree.isLeaf) {
			for (let i = 0; i < tree.numKeys + 1; i++) {
				tree.widths[i] = 0;
			}
			tree.width = tree.numKeys * WIDTH_PER_ELEM + NODE_SPACING;
			return tree.width;
		} else {
			let treeWidth = 0;
			for (let i = 0; i < tree.numKeys + 1; i++) {
				tree.widths[i] = this.resizeWidths(tree.children[i]);
				treeWidth = treeWidth + tree.widths[i];
			}
			treeWidth = Math.max(treeWidth, tree.numKeys * WIDTH_PER_ELEM + NODE_SPACING);
			tree.width = treeWidth;
			return treeWidth;
		}
	}
}

function BTreeNode(id, initialX, initialY) {
	this.widths = [];
	this.keys = [];
	this.children = [];
	this.x = initialX;
	this.y = initialY;
	this.graphicID = id;
	this.numKeys = 1;
	this.isLeaf = true;
	this.parent = null;

	this.leftWidth = 0;
	this.rightWidth = 0;
}
