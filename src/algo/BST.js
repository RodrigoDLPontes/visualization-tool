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
	addRadioButtonGroupToAlgorithmBar,
} from './Algorithm.js';
import { act } from '../anim/AnimationMain';

const CODE_START_X = 25;
const CODE_START_Y = 35;
const CODE_LINE_HEIGHT = 14;
const CODE_HIGHLIGHT_COLOR = '#FF0000';
const CODE_STANDARD_COLOR = '#000000';

export default class BST extends Algorithm {
	constructor(am, w, h) {
		super(am, w, h);

		this.first_print_pos_y = h - 2 * BST.PRINT_VERTICAL_GAP;
		this.print_max = w - 10;
		this.startingX = w / 2;
		this.addControls();
		this.nextIndex = 1;
		this.commands = [];
		this.edges = [];
		this.toClear = [];
		this.cmd(act.createLabel, 0, '', BST.EXPLANITORY_TEXT_X, BST.EXPLANITORY_TEXT_Y, 0);
		this.animationManager.startNewAnimation(this.commands);
		this.animationManager.skipForward();
		this.animationManager.clearHistory();
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

		const traversalButtonList = addRadioButtonGroupToAlgorithmBar(
			['Pre-order', 'In-order', 'Post-order', 'Level order'],
			'Traversals',
		);

		this.preOrderSelect = traversalButtonList[0];
		this.inOrderSelect = traversalButtonList[1];
		this.postOrderSelect = traversalButtonList[2];
		this.levelOrderSelect = traversalButtonList[3];
		this.preOrderSelect.onclick = () => (this.traversal = 'pre');
		this.inOrderSelect.onclick = () => (this.traversal = 'in');
		this.postOrderSelect.onclick = () => (this.traversal = 'post');
		this.levelOrderSelect.onclick = () => (this.traversal = 'level');
		this.preOrderSelect.checked = true;
		this.traversal = 'pre';

		this.traverseButton = addControlToAlgorithmBar('Button', 'Traverse');
		this.traverseButton.onclick = this.traverseCallback.bind(this);
		this.controls.push(this.traverseButton);

		addDivisorToAlgorithmBar();

		this.clearButton = addControlToAlgorithmBar('Button', 'Clear');
		this.clearButton.onclick = this.clearCallback.bind(this);
		this.controls.push(this.clearButton);

		addDivisorToAlgorithmBar();

		const predSuccButtonList = addRadioButtonGroupToAlgorithmBar(
			['Predecessor', 'Successor'],
			'Predecessor/Successor',
		);

		this.predButton = predSuccButtonList[0];
		this.succButton = predSuccButtonList[1];
		this.predButton.onclick = () => (this.predSucc = 'pred');
		this.succButton.onclick = () => (this.predSucc = 'succ');
		this.succButton.checked = true;
		this.predSucc = 'succ';
	}

	reset() {
		this.nextIndex = 1;
		this.treeRoot = null;
		this.edges = [];
	}

	insertCallback() {
		const insertedValue = this.insertField.value;
		// Get text value
		if (insertedValue !== '') {
			// set text value
			this.insertField.value = '';
			this.implementAction(this.add.bind(this), parseInt(insertedValue));
		}
	}

	deleteCallback() {
		const deletedValue = this.deleteField.value;
		if (deletedValue !== '') {
			this.deleteField.value = '';
			this.implementAction(this.remove.bind(this), parseInt(deletedValue));
		}
	}

	findCallback() {
		const findValue = this.findField.value;
		if (findValue !== '') {
			this.findField.value = '';
			this.implementAction(this.findElement.bind(this), parseInt(findValue));
		}
	}

	traverseCallback() {
		this.implementAction(this.traverse.bind(this));
	}

	clearCallback() {
		this.implementAction(this.clear.bind(this));
	}

	sizeChanged(newWidth) {
		this.startingX = newWidth / 2;
	}

	printTree() {
		this.commands = [];

		if (this.treeRoot != null) {
			this.highlightID = this.nextIndex++;
			const firstLabel = this.nextIndex;
			this.cmd(
				act.createHighlightCircle,
				this.highlightID,
				BST.HIGHLIGHT_COLOR,
				this.treeRoot.x,
				this.treeRoot.y,
			);
			this.xPosOfNextLabel = BST.FIRST_PRINT_POS_X;
			this.yPosOfNextLabel = this.first_print_pos_y;
			this.printTreeRec(this.treeRoot);
			this.cmd(act.delete, this.highlightID);
			this.cmd(act.step);
			for (let i = firstLabel; i < this.nextIndex; i++) this.cmd(act.delete, i);
			this.nextIndex = this.highlightID; /// Reuse objects.  Not necessary.
		}
		return this.commands;
	}



	preOrderRec(tree, passedCodeID) {
		this.codeID = passedCodeID;
		this.cmd(act.step);

		const nextLabelID = this.nextIndex++;

		this.unhighlight(3,0)
		this.unhighlight(4,0)
		this.highlight(2,0);

		this.cmd(act.createLabel, nextLabelID, tree.data, tree.x, tree.y);
		this.cmd(act.setForegroundColor, nextLabelID, BST.PRINT_COLOR);
		this.cmd(act.move, nextLabelID, this.xPosOfNextLabel, this.yPosOfNextLabel);
		this.cmd(act.step);

		this.xPosOfNextLabel += BST.PRINT_HORIZONTAL_GAP;
		if (this.xPosOfNextLabel > this.print_max) {
			this.xPosOfNextLabel = BST.FIRST_PRINT_POS_X;
			this.yPosOfNextLabel += BST.PRINT_VERTICAL_GAP;
		}
		this.unhighlight(2,0);

		if (tree.left != null) {
			this.highlight(3,0);
			this.cmd(act.move, this.highlightID, tree.left.x, tree.left.y);
			this.preOrderRec(tree.left, passedCodeID);
			
			this.cmd(act.move, this.highlightID, tree.x, tree.y);
			this.cmd(act.step);
		}
		this.unhighlight(3,0);

		if (tree.right != null) {
			this.highlight(4,0);
			this.cmd(act.move, this.highlightID, tree.right.x, tree.right.y);
			this.preOrderRec(tree.right, passedCodeID);
			this.cmd(act.move, this.highlightID, tree.x, tree.y);
			this.cmd(act.step);
		}
		this.unhighlight(4,0);


		return;
	}

	levelOrder(tree) {

		this.highlightID = this.nextIndex++;
		// const firstLabel = this.nextIndex;
		this.cmd(
			act.createHighlightCircle,
			this.highlightID,
			BST.HIGHLIGHT_COLOR,
			this.treeRoot.x,
			this.treeRoot.y,
		);
		this.xPosOfNextLabel = BST.FIRST_PRINT_POS_X;
		this.yPosOfNextLabel = this.first_print_pos_y;

		const queue = [tree];

		while (queue.length !== 0) {
			const curr = queue.shift();

			const nextLabelID = this.nextIndex++;
			this.cmd(act.move, this.highlightID, curr.x, curr.y);
			this.cmd(act.step);
			this.cmd(act.createLabel, nextLabelID, curr.data, curr.x, curr.y);
			this.cmd(act.setForegroundColor, nextLabelID, BST.PRINT_COLOR);
			this.cmd(act.move, nextLabelID, this.xPosOfNextLabel, this.yPosOfNextLabel);
			this.cmd(act.step);

			this.xPosOfNextLabel += BST.PRINT_HORIZONTAL_GAP;
			if (this.xPosOfNextLabel > this.print_max) {
				this.xPosOfNextLabel = BST.FIRST_PRINT_POS_X;
				this.yPosOfNextLabel += BST.PRINT_VERTICAL_GAP;
			}

			if (curr.left != null) {
				queue.push(curr.left);
			}

			if (curr.right != null) {
				queue.push(curr.right);
			}
		}

		this.cmd(act.delete, this.highlightID);
		this.cmd(act.step);
		// for (let i = firstLabel; i < this.nextIndex; i++) this.cmd(act.delete, i);
		// this.nextIndex = this.highlightID; /// Reuse objects.  Not necessary.
	}

	traverse() {
		this.commands = [];
		this.clearOldObjects();

		if (this.treeRoot == null) {
			return this.commands;
		}

		if (this.traversal === 'level') {
			this.levelOrder(this.treeRoot);
		}

		this.highlightID = this.nextIndex++;
		const firstLabel = this.nextIndex;
		this.cmd(
			act.createHighlightCircle,
			this.highlightID,
			BST.HIGHLIGHT_COLOR,
			this.treeRoot.x,
			this.treeRoot.y,
		);
		this.xPosOfNextLabel = BST.FIRST_PRINT_POS_X;
		this.yPosOfNextLabel = this.first_print_pos_y;

		if (this.traversal === 'pre') {
			this.codeID = this.setUpPseudocode(
				[
					['procedure preOrder(Node node)'],
					['     if node is not null:'],
					['          look at data in the node'],
					['          recurse left'],
					['          recurse right'],
					['end procedure']
				]
			);
			this.preOrderRec(this.treeRoot, this.codeID);
		} else if (this.traversal === 'in') {
			this.codeID = this.setUpPseudocode(
				[
					['procedure inOrder(Node node)'],
					['     if node is not null:'],
					['          recurse left'],
					['          look at data in the node'],
					['          recurse right'],
					['end procedure']
				]
			);
			this.printTreeRec(this.treeRoot, this.codeID);
		} else if (this.traversal === 'post') {
			this.codeID = this.setUpPseudocode(
				[
					['procedure postOrder(Node node)'],
					['     if node is not null:'],
					['          recurse left'],
					['          recurse right'],
					['          look at data in the node'],
					['end procedure']
				]
			);
			this.postOrderRec(this.treeRoot, this.codeID);
		}

		this.cmd(act.delete, this.highlightID);
		this.cmd(act.step);

		for (let i = firstLabel; i < this.nextIndex; i++) this.toClear.push(i);
		// this.nextIndex = this.highlightID; /// Reuse objects.  Not necessary.

		return this.commands;
	}


	postOrderRec(tree, passedCodeID) {
		this.codeID = passedCodeID;
		this.cmd(act.step);
		if (tree.left != null) {
			this.unhighlight(3,0)
			this.highlight(2,0)
			this.cmd(act.move, this.highlightID, tree.left.x, tree.left.y);
			this.postOrderRec(tree.left, passedCodeID);
			this.cmd(act.move, this.highlightID, tree.x, tree.y);
			this.cmd(act.step);
		}
		this.unhighlight(2,0)


		if (tree.right != null) {
			this.unhighlight(2,0)
			this.highlight(3,0)
			this.cmd(act.move, this.highlightID, tree.right.x, tree.right.y);
			this.postOrderRec(tree.right, passedCodeID);
			this.cmd(act.move, this.highlightID, tree.x, tree.y);
			this.cmd(act.step);
		}
		this.unhighlight(3,0)

		this.highlight(4,0)
		const nextLabelID = this.nextIndex++;
		this.cmd(act.createLabel, nextLabelID, tree.data, tree.x, tree.y);
		this.cmd(act.setForegroundColor, nextLabelID, BST.PRINT_COLOR);
		this.cmd(act.move, nextLabelID, this.xPosOfNextLabel, this.yPosOfNextLabel);
		this.cmd(act.step);

		this.xPosOfNextLabel += BST.PRINT_HORIZONTAL_GAP;
		if (this.xPosOfNextLabel > this.print_max) {
			this.xPosOfNextLabel = BST.FIRST_PRINT_POS_X;
			this.yPosOfNextLabel += BST.PRINT_VERTICAL_GAP;
		}
		this.unhighlight(4,0)

		return;
	}

	printTreeRec(tree, passedCodeID) {
		this.codeID = passedCodeID;
		
		this.cmd(act.step);
		if (tree.left != null) {
			this.unhighlight(3, 0);
			this.unhighlight(4, 0);
			this.highlight(2, 0);
			this.cmd(act.move, this.highlightID, tree.left.x, tree.left.y);
			this.printTreeRec(tree.left, passedCodeID);
			this.cmd(act.move, this.highlightID, tree.x, tree.y);
			this.cmd(act.step);
		}
		this.unhighlight(2,0);

		this.unhighlight(4,0);
		this.highlight(3,0);
		const nextLabelID = this.nextIndex++;
		this.cmd(act.createLabel, nextLabelID, tree.data, tree.x, tree.y);
		this.cmd(act.setForegroundColor, nextLabelID, BST.PRINT_COLOR);
		this.cmd(act.move, nextLabelID, this.xPosOfNextLabel, this.yPosOfNextLabel);
		this.cmd(act.step);

		this.xPosOfNextLabel += BST.PRINT_HORIZONTAL_GAP;
		if (this.xPosOfNextLabel > this.print_max) {
			this.xPosOfNextLabel = BST.FIRST_PRINT_POS_X;
			this.yPosOfNextLabel += BST.PRINT_VERTICAL_GAP;
		}
		this.unhighlight(3,0);

		if (tree.right != null) {
			this.unhighlight(2, 0);
			this.unhighlight(3, 0);
			this.highlight(4, 0);
			this.cmd(act.move, this.highlightID, tree.right.x, tree.right.y);
			this.printTreeRec(tree.right, passedCodeID);
			this.cmd(act.move, this.highlightID, tree.x, tree.y);
			this.cmd(act.step);
		}
		this.unhighlight(4,0);

		return;
	}

	findElement(findValue) {
		this.commands = [];
		this.clearOldObjects();

		this.highlightID = this.nextIndex++;

		this.doFind(this.treeRoot, findValue);

		return this.commands;
	}

	doFind(tree, value) {
		this.cmd(act.setText, 0, 'Searching for ' + value);
		if (tree != null) {
			this.cmd(act.setHighlight, tree.graphicID, 1);
			if (tree.data === value) {
				this.cmd(
					act.setText,
					0,
					'Searching for ' + value + ' : ' + value + ' = ' + value + ' (Element found!)',
				);
				this.cmd(act.step);
				this.cmd(act.setText, 0, 'Found:' + value);
				this.cmd(act.setHighlight, tree.graphicID, 0);
			} else {
				if (tree.data > value) {
					this.cmd(
						act.setText,
						0,
						'Searching for ' +
							value +
							' : ' +
							value +
							' < ' +
							tree.data +
							' (look to left subtree)',
					);
					this.cmd(act.step);
					this.cmd(act.setHighlight, tree.graphicID, 0);
					if (tree.left != null) {
						this.cmd(
							act.createHighlightCircle,
							this.highlightID,
							BST.HIGHLIGHT_COLOR,
							tree.x,
							tree.y,
						);
						this.cmd(act.move, this.highlightID, tree.left.x, tree.left.y);
						this.cmd(act.step);
						this.cmd(act.delete, this.highlightID);
					}
					this.doFind(tree.left, value);
				} else {
					this.cmd(
						act.setText,
						0,
						' Searching for ' +
							value +
							' : ' +
							value +
							' > ' +
							tree.data +
							' (look to right subtree)',
					);
					this.cmd(act.step);
					this.cmd(act.setHighlight, tree.graphicID, 0);
					if (tree.right != null) {
						this.cmd(
							act.createHighlightCircle,
							this.highlightID,
							BST.HIGHLIGHT_COLOR,
							tree.x,
							tree.y,
						);
						this.cmd(act.move, this.highlightID, tree.right.x, tree.right.y);
						this.cmd(act.step);
						this.cmd(act.delete, this.highlightID);
					}
					this.doFind(tree.right, value);
				}
			}
		} else {
			this.cmd(
				act.setText,
				0,
				'Searching for ' + value + ' : < Empty Tree > (Element not found)',
			);
			this.cmd(act.step);
			this.cmd(act.setText, 0, 'Searching for ' + value + ' :  (Element not found)');
		}
	}

	remakeTree(curr) {
		if (curr == null) return;
		if (curr.left != null) {
			this.cmd(act.connect, curr.graphicID, curr.left.graphicID, BST.LINK_COLOR);
			this.remakeTree(curr.left);
		}
		if (curr.right != null) {
			this.cmd(act.connect, curr.graphicID, curr.right.graphicID, BST.LINK_COLOR);
			this.remakeTree(curr.right);
		}
	}

	clearOldObjects() {
		this.toClear.forEach(i => this.cmd(act.delete, i));
		this.toClear = [];
	}

	add(data) {
		this.commands = [];
		this.clearOldObjects();
		this.cmd(act.setText, 0, 'Inserting ' + data);
		this.treeRoot = this.addH(data, this.treeRoot);
		this.resizeTree();
		return this.commands;
	}

	addH(data, curr) {
		if (curr == null) {
			this.cmd(act.setText, 0, 'Null found, inserting new node');
			const treeNodeID = this.nextIndex++;
			this.cmd(act.createCircle, treeNodeID, data, 30, BST.STARTING_Y);

			this.cmd(act.setForegroundColor, treeNodeID, BST.FOREGROUND_COLOR);
			this.cmd(act.setBackgroundColor, treeNodeID, BST.BACKGROUND_COLOR);

			this.cmd(act.step);
			this.cmd(act.setText, 0, '');
			return new BSTNode(data, treeNodeID, 0, 0);
		}
		this.cmd(act.setHighlight, curr.graphicID, 1);
		if (data < curr.data) {
			this.cmd(act.setText, 0, `${data} < ${curr.data}. Looking at left subtree`);
			this.cmd(act.step);
			curr.left = this.addH(data, curr.left);
			curr.left.parent = curr;
			this.resizeTree();
			const connected = this.connectSmart(curr.graphicID, curr.left.graphicID);
			connected && this.cmd(act.step);
		} else if (data > curr.data) {
			this.cmd(act.setText, 0, `${data} > ${curr.data}. Looking at right subtree`);
			this.cmd(act.step);
			curr.right = this.addH(data, curr.right);
			curr.right.parent = curr;
			this.resizeTree();
			const connected = this.connectSmart(curr.graphicID, curr.right.graphicID);
			connected && this.cmd(act.step);
		} else {
			this.cmd(act.setText, 0, `${data} == ${curr.data}. Ignoring duplicate!`);
			this.cmd(act.step);
		}
		this.cmd(act.setHighlight, curr.graphicID, 0);
		this.cmd(act.setText, 0, '');
		return curr;
	}

	connectSmart(id1, id2) {
		if (!this.edges.some(e => e[0] === id1 && e[1] === id2)) {
			this.cmd(act.connect, id1, id2, BST.LINK_COLOR);
			this.edges.push([id1, id2]);
			return true;
		}
		return false;
	}

	deleteNode(curr) {
		this.cmd(act.delete, curr.graphicID);
	}

	remove(data) {
		this.commands = [];
		this.clearOldObjects();

		this.cmd(act.setText, 0, `Deleting ${data}`);
		this.cmd(act.step);
		this.cmd(act.setText, 0, ' ');

		this.highlightID = this.nextIndex++;
		this.treeRoot = this.removeH(this.treeRoot, data);
		this.cmd(act.setText, 0, '');
		this.resizeTree();
		return this.commands;
	}

	removeH(curr, data) {
		if (curr == null) {
			this.cmd(act.setText, 0, `${data} not found in the tree`);
			return;
		}
		this.cmd(act.setHighlight, curr.graphicID, 1);
		if (data < curr.data) {
			this.cmd(act.setText, 0, `${data} < ${curr.data}. Looking left`);
			this.cmd(act.step);
			curr.left = this.removeH(curr.left, data);
			if (curr.left != null) {
				curr.left.parent = curr;
				this.connectSmart(curr.graphicID, curr.left.graphicID);
				this.resizeTree();
			}
		} else if (data > curr.data) {
			this.cmd(act.setText, 0, `${data} > ${curr.data}. Looking right`);
			this.cmd(act.step);
			curr.right = this.removeH(curr.right, data);
			if (curr.right != null) {
				curr.right.parent = curr;
				this.connectSmart(curr.graphicID, curr.right.graphicID);
				this.resizeTree();
			}
		} else {
			if (curr.left == null && curr.right == null) {
				this.cmd(act.setText, 0, 'Element to delete is a leaf node');
				this.cmd(act.step);
				this.deleteNode(curr);
				this.cmd(act.step);
				return null;
			} else if (curr.left == null) {
				this.cmd(act.setText, 0, `One-child case, replace with right child`);
				this.cmd(act.step);
				this.deleteNode(curr);
				this.cmd(act.step);
				return curr.right;
			} else if (curr.right == null) {
				this.cmd(act.setText, 0, `One-child case, replace with left child`);
				this.cmd(act.step);
				this.deleteNode(curr);
				this.cmd(act.step);
				return curr.left;
			} else {
				const dummy = [];
				if (this.predSucc === 'succ') {
					this.cmd(act.setText, 0, `Two-child case, replace data with successor`);
					this.cmd(act.step);
					curr.right = this.removeSucc(curr.right, dummy);
					curr.right && this.connectSmart(curr.graphicID, curr.right.graphicID);
				} else {
					this.cmd(act.setText, 0, `Two-child case, replace data with predecessor`);
					this.cmd(act.step);
					curr.left = this.removePred(curr.left, dummy);
					curr.left && this.connectSmart(curr.graphicID, curr.left.graphicID);
				}
				this.resizeTree();
				curr.data = dummy[0];
				this.cmd(act.setText, curr.graphicID, curr.data);
			}
		}
		this.cmd(act.setHighlight, curr.graphicID, 0);
		this.cmd(act.setText, 0, '');
		return curr;
	}

	removeSucc(curr, dummy) {
		this.cmd(act.setHighlight, curr.graphicID, 1, '#0000ff');
		this.cmd(act.step);
		if (curr.left == null) {
			this.cmd(act.setText, 0, 'No left child, replace with right child');
			this.cmd(act.step);
			dummy.push(curr.data);
			this.deleteNode(curr);
			this.cmd(act.step);
			this.cmd(act.setText, 0, '');
			return curr.right;
		}
		this.cmd(act.setText, 0, 'Left child exists, look left');
		curr.left = this.removeSucc(curr.left, dummy);
		if (curr.left != null) {
			curr.left.parent = curr;
			this.connectSmart(curr.graphicID, curr.left.graphicID);
			this.resizeTree();
		}
		this.cmd(act.setHighlight, curr.graphicID, 0, '#0000ff');
		return curr;
	}

	removePred(curr, dummy) {
		this.cmd(act.setHighlight, curr.graphicID, 1, '#0000ff');
		this.cmd(act.step);
		if (curr.right == null) {
			this.cmd(act.setText, 0, 'No right child, replace with right child');
			this.cmd(act.step);
			dummy.push(curr.data);
			this.deleteNode(curr);
			this.cmd(act.step);
			this.cmd(act.setText, 0, '');
			return curr.left;
		}
		this.cmd(act.setText, 0, 'Right child exists, look right');
		this.cmd(act.step);
		curr.right = this.removePred(curr.right, dummy);
		if (curr.right != null) {
			curr.right.parent = curr;
			this.connectSmart(curr.graphicID, curr.right.graphicID);
			this.resizeTree();
		}
		this.cmd(act.setHighlight, curr.graphicID, 0, '#0000ff');
		return curr;
	}

	resizeTree() {
		if (this.treeRoot == null) {
			return;
		}
		let startingPoint = this.startingX;
		this.resizeWidths(this.treeRoot);
		if (this.treeRoot != null) {
			if (this.treeRoot.leftWidth > startingPoint) {
				startingPoint = this.treeRoot.leftWidth;
			} else if (this.treeRoot.rightWidth > startingPoint) {
				startingPoint = Math.max(
					this.treeRoot.leftWidth,
					2 * startingPoint - this.treeRoot.rightWidth,
				);
			}
			this.setNewPositions(this.treeRoot, startingPoint, BST.STARTING_Y, 0);
			this.animateNewPositions(this.treeRoot);
			this.cmd(act.step);
		}
	}

	setNewPositions(tree, xPosition, yPosition, side) {
		if (tree != null) {
			tree.y = yPosition;
			if (side === -1) {
				xPosition = xPosition - tree.rightWidth;
			} else if (side === 1) {
				xPosition = xPosition + tree.leftWidth;
			}
			tree.x = xPosition;
			this.setNewPositions(tree.left, xPosition, yPosition + BST.HEIGHT_DELTA, -1);
			this.setNewPositions(tree.right, xPosition, yPosition + BST.HEIGHT_DELTA, 1);
		}
	}

	animateNewPositions(tree) {
		if (tree != null) {
			this.cmd(act.move, tree.graphicID, tree.x, tree.y);
			this.animateNewPositions(tree.left);
			this.animateNewPositions(tree.right);
		}
	}

	resizeWidths(tree) {
		if (tree == null) {
			return 0;
		}
		tree.leftWidth = Math.max(this.resizeWidths(tree.left), BST.WIDTH_DELTA / 2);
		tree.rightWidth = Math.max(this.resizeWidths(tree.right), BST.WIDTH_DELTA / 2);
		return tree.leftWidth + tree.rightWidth;
	}

	clear() {
		this.commands = [];
		this.clearOldObjects();

		this.recClear(this.treeRoot);
		this.treeRoot = null;
		return this.commands;
	}

	recClear(curr) {
		if (curr != null) {
			this.cmd(act.delete, curr.graphicID);
			this.recClear(curr.left);
			this.recClear(curr.right);
		}
	}

	disableUI() {
		for (let i = 0; i < this.controls.length; i++) {
			this.controls[i].disabled = true;
		}
	}

	enableUI() {
		for (let i = 0; i < this.controls.length; i++) {
			this.controls[i].disabled = false;
		}
	}


	setUpPseudocode(tailoredCode) {
		this.code = tailoredCode;

		this.codeID = Array(this.code.length);
		let i, j;
		for (i = 0; i < this.code.length; i++) {
			this.codeID[i] = new Array(this.code[i].length);
			for (j = 0; j < this.code[i].length; j++) {
				this.codeID[i][j] = this.nextIndex++;
				this.cmd(
					act.createLabel,
					this.codeID[i][j],
					this.code[i][j],
					CODE_START_X,
					CODE_START_Y + i * CODE_LINE_HEIGHT,
					0,
				);
				this.cmd(act.setForegroundColor, this.codeID[i][j], CODE_STANDARD_COLOR);
				if (j > 0) {
					this.cmd(act.alignRight, this.codeID[i][j], this.codeID[i][j - 1]);
				}
			}
		}

		return this.codeID;

	}

	highlight(ind1, ind2) {
		this.cmd(act.setForegroundColor, this.codeID[ind1][ind2], CODE_HIGHLIGHT_COLOR);
	}

	unhighlight(ind1, ind2) {
		this.cmd(act.setForegroundColor, this.codeID[ind1][ind2], CODE_STANDARD_COLOR);
	}
}

class BSTNode {
	constructor(val, id, initialX, initialY) {
		this.data = val;
		this.x = initialX;
		this.y = initialY;

		this.graphicID = id;
		this.left = null;
		this.right = null;
		this.parent = null;
	}
}

// Various constants

BST.HIGHLIGHT_LABEL_COLOR = '#FF0000';
BST.HIGHLIGHT_LINK_COLOR = '#FF0000';

BST.HIGHLIGHT_COLOR = '#007700';
BST.HEIGHT_LABEL_COLOR = '#007700';

BST.LINK_COLOR = '#00B000';
BST.HIGHLIGHT_CIRCLE_COLOR = '#007700';
BST.FOREGROUND_COLOR = '#007700';
BST.BACKGROUND_COLOR = '#DDFFDD';
BST.PRINT_COLOR = BST.FOREGROUND_COLOR;

BST.WIDTH_DELTA = 50;
BST.HEIGHT_DELTA = 50;
BST.STARTING_Y = 50;

BST.FIRST_PRINT_POS_X = 50;
BST.PRINT_VERTICAL_GAP = 20;
BST.PRINT_HORIZONTAL_GAP = 50;
BST.EXPLANITORY_TEXT_X = 10;
BST.EXPLANITORY_TEXT_Y = 10;
