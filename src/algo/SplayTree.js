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
// THIS SOFTWARE IS PROVIDED BY David Galles ``AS IS'' AND ANY EXPRESS OR IMPLIED
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

import Algorithm, { addControlToAlgorithmBar, addDivisorToAlgorithmBar } from './Algorithm.js';
import { act } from '../anim/AnimationMain';

const LINK_COLOR = '#000000';
const HIGHLIGHT_CIRCLE_COLOR = '#007700';
const FOREGROUND_COLOR = '#000000';
const BACKGROUND_COLOR = '#FFFFFF';
const PRINT_COLOR = '#007700';

const WIDTH_DELTA = 50;
const HEIGHT_DELTA = 50;
const STARTING_Y = 50;

const FIRST_PRINT_POS_X = 50;
const PRINT_VERTICAL_GAP = 20;
const PRINT_HORIZONTAL_GAP = 50;

export default class SplayTree extends Algorithm {
	constructor(am, w, h) {
		super(am, w, h);
		this.startingX = w / 2;
		this.first_print_pos_y = h - 2 * PRINT_VERTICAL_GAP;
		this.print_max = w - 10;

		this.addControls();
		this.nextIndex = 0;
		this.commands = [];
		this.cmd(act.createLabel, 0, '', 20, 10, 0);
		this.nextIndex = 1;
		this.animationManager.startNewAnimation(this.commands);
		this.animationManager.skipForward();
		this.animationManager.clearHistory();
	}

	addControls() {
		this.controls = [];

		this.insertField = addControlToAlgorithmBar('Text', '');
		this.insertField.style.textAlign = 'center';
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
		this.deleteField.style.textAlign = 'center';
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
		this.findField.style.textAlign = 'center';
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
	}

	reset() {
		this.nextIndex = 1;
		this.treeRoot = null;
	}

	insertCallback() {
		let insertedValue = this.insertField.value;
		// Get text value
		insertedValue = this.normalizeNumber(insertedValue, 4);
		if (insertedValue !== '') {
			// set text value
			this.insertField.value = '';
			this.implementAction(this.insertElement.bind(this), parseInt(insertedValue));
		}
	}

	deleteCallback() {
		let deletedValue = this.deleteField.value;
		if (deletedValue !== '') {
			deletedValue = this.normalizeNumber(deletedValue, 4);
			this.deleteField.value = '';
			this.implementAction(this.deleteElement.bind(this), parseInt(deletedValue));
		}
	}

	//  TODO:  This top-down version is broken.  Don't use
	splay(value) {
		if (this.treeRoot == null) {
			return false;
		}
		if (this.treeRoot.data === value) {
			return true;
		}
		if (value < this.treeRoot.data) {
			if (this.treeRoot.left == null) {
				return false;
			} else if (this.treeRoot.left.data === value) {
				this.singleRotateRight(this.treeRoot);
				return true;
			} else if (value < this.treeRoot.left.data) {
				if (this.treeRoot.left.left == null) {
					this.singleRotateRight(this.treeRoot);
					return this.splay(value);
				} else {
					this.zigZigRight(this.treeRoot);
					return this.splay(value);
				}
			} else {
				if (this.treeRoot.left.right == null) {
					this.singleRotateRight(this.treeRoot);
					return this.splay(value);
				} else {
					this.doubleRotateRight(this.treeRoot);
					return this.splay(value);
				}
			}
		} else {
			if (this.treeRoot.right == null) {
				return false;
			} else if (this.treeRoot.right.data === value) {
				this.singleRotateLeft(this.treeRoot);
				return true;
			} else if (value > this.treeRoot.right.data) {
				if (this.treeRoot.right.right == null) {
					this.singleRotateLeft(this.treeRoot);
					return this.splay(value);
				} else {
					this.zigZigLeft(this.treeRoot);
					return this.splay(value);
				}
			} else {
				if (this.treeRoot.right.left == null) {
					this.singleRotateLeft(this.treeRoot);
					return this.splay(value);
				} else {
					this.doubleRotateLeft(this.treeRot);
					return this.splay(value);
				}
			}
		}
	}

	printCallback() {
		this.implementAction(this.printTree.bind(this));
	}

	printTree() {
		this.commands = [];

		if (this.treeRoot != null) {
			this.highlightID = this.nextIndex++;
			const firstLabel = this.nextIndex;
			this.cmd(
				act.createHighlightCircle,
				this.highlightID,
				HIGHLIGHT_CIRCLE_COLOR,
				this.treeRoot.x,
				this.treeRoot.y,
			);
			this.xPosOfNextLabel = FIRST_PRINT_POS_X;
			this.yPosOfNextLabel = this.first_print_pos_y;
			this.printTreeRec(this.treeRoot);
			this.cmd(act.delete, this.highlightID);
			this.cmd(act.step);

			for (let i = firstLabel; i < this.nextIndex; i++) {
				this.cmd(act.delete, i);
			}
			this.nextIndex = this.highlightID; /// Reuse objects.  Not necessary.
		}
		return this.commands;
	}

	printTreeRec(tree) {
		this.cmd(act.step);
		if (tree.left != null) {
			this.cmd(act.move, this.highlightID, tree.left.x, tree.left.y);
			this.printTreeRec(tree.left);
			this.cmd(act.move, this.highlightID, tree.x, tree.y);
			this.cmd(act.step);
		}
		const nextLabelID = this.nextIndex++;
		this.cmd(act.createLabel, nextLabelID, tree.data, tree.x, tree.y);
		this.cmd(act.setForegroundColor, nextLabelID, PRINT_COLOR);
		this.cmd(act.move, nextLabelID, this.xPosOfNextLabel, this.yPosOfNextLabel);
		this.cmd(act.step);

		this.xPosOfNextLabel += PRINT_HORIZONTAL_GAP;
		if (this.xPosOfNextLabel > this.print_max) {
			this.xPosOfNextLabel = FIRST_PRINT_POS_X;
			this.yPosOfNextLabel += PRINT_VERTICAL_GAP;
		}
		if (tree.right != null) {
			this.cmd(act.move, this.highlightID, tree.right.x, tree.right.y);
			this.printTreeRec(tree.right);
			this.cmd(act.move, this.highlightID, tree.x, tree.y);
			this.cmd(act.step);
		}
		return;
	}

	clearCallback() {
		this.implementAction(this.clear.bind(this));
	}

	clear() {
		this.commands = [];
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

	findCallback() {
		const findValue = this.normalizeNumber(this.findField.value, 4);
		if (findValue !== '') {
			this.findField.value = '';
			this.implementAction(this.findElement.bind(this), parseInt(findValue));
		}
	}

	findElement(findValue) {
		this.commands = [];

		this.highlightID = this.nextIndex++;

		const found = this.doFind(this.treeRoot, findValue);

		if (found) {
			this.cmd(act.setText, 0, 'Element ' + findValue + ' found.');
		} else {
			this.cmd(act.setText, 0, 'Element ' + findValue + ' not found.');
		}

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
				this.cmd(act.setText, 0, 'Splaying found node to root of tree');
				this.cmd(act.step);
				this.cmd(act.setHighlight, tree.graphicID, 0);
				this.splayUp(tree);
				return true;
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
							HIGHLIGHT_CIRCLE_COLOR,
							tree.x,
							tree.y,
						);
						this.cmd(act.move, this.highlightID, tree.left.x, tree.left.y);
						this.cmd(act.step);
						this.cmd(act.delete, this.highlightID);
						return this.doFind(tree.left, value);
					} else {
						this.splayUp(tree);
						return false;
					}
				} else {
					this.cmd(
						act.setText,
						0,
						'Searching for ' +
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
							HIGHLIGHT_CIRCLE_COLOR,
							tree.x,
							tree.y,
						);
						this.cmd(act.move, this.highlightID, tree.right.x, tree.right.y);
						this.cmd(act.step);
						this.cmd(act.delete, this.highlightID);
						return this.doFind(tree.right, value);
					} else {
						this.splayUp(tree);
						return false;
					}
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
			return false;
		}
	}

	insertElement(insertedValue) {
		this.commands = [];
		this.cmd(act.setText, 0, 'Inserting ' + insertedValue);
		this.highlightID = this.nextIndex++;

		if (this.treeRoot == null) {
			this.cmd(act.createCircle, this.nextIndex, insertedValue, this.startingX, STARTING_Y);
			this.cmd(act.setForegroundColor, this.nextIndex, FOREGROUND_COLOR);
			this.cmd(act.setBackgroundColor, this.nextIndex, BACKGROUND_COLOR);
			this.cmd(act.step);
			this.treeRoot = new BSTNode(insertedValue, this.nextIndex, this.startingX, STARTING_Y);
			this.nextIndex += 1;
		} else {
			this.cmd(act.createCircle, this.nextIndex, insertedValue, 100, 100);
			this.cmd(act.setForegroundColor, this.nextIndex, FOREGROUND_COLOR);
			this.cmd(act.setBackgroundColor, this.nextIndex, BACKGROUND_COLOR);
			this.cmd(act.step);
			const insertElem = new BSTNode(insertedValue, this.nextIndex, 100, 100);

			this.nextIndex += 1;
			this.cmd(act.setHighlight, insertElem.graphicID, 1);
			this.insert(insertElem, this.treeRoot);
			this.resizeTree();
			this.cmd(act.setText, 0, 'Splay inserted element to root of tree');
			this.cmd(act.step);
			this.splayUp(insertElem);
		}
		this.cmd(act.setText, 0, '');
		return this.commands;
	}

	insert(elem, tree) {
		let foundDuplicate = false;
		this.cmd(act.setHighlight, tree.graphicID, 1);
		this.cmd(act.setHighlight, elem.graphicID, 1);

		if (elem.data < tree.data) {
			this.cmd(act.setText, 0, elem.data + ' < ' + tree.data + '.  Looking at left subtree');
		} else if (elem.data > tree.data) {
			this.cmd(
				act.setText,
				0,
				elem.data + ' >= ' + tree.data + '.  Looking at right subtree',
			);
		} else {
			this.cmd(act.setText, 0, elem.data + ' = ' + tree.data + '. Ignoring duplicate');
			foundDuplicate = true;
		}
		this.cmd(act.step);
		this.cmd(act.setHighlight, tree.graphicID, 0);
		this.cmd(act.setHighlight, elem.graphicID, 0);

		if (foundDuplicate) {
			this.cmd(act.delete, elem.graphicID, 0);
			return;
		}

		if (elem.data < tree.data) {
			if (tree.left == null) {
				this.cmd(act.setText, 0, 'Found null tree, inserting element');

				this.cmd(act.setHighlight, elem.graphicID, 0);
				tree.left = elem;
				elem.parent = tree;
				this.cmd(act.connect, tree.graphicID, elem.graphicID, LINK_COLOR);
			} else {
				this.cmd(
					act.createHighlightCircle,
					this.highlightID,
					HIGHLIGHT_CIRCLE_COLOR,
					tree.x,
					tree.y,
				);
				this.cmd(act.move, this.highlightID, tree.left.x, tree.left.y);
				this.cmd(act.step);
				this.cmd(act.delete, this.highlightID);
				this.insert(elem, tree.left);
			}
		} else {
			if (tree.right == null) {
				this.cmd(act.setText, 0, 'Found null tree, inserting element');
				this.cmd(act.setHighlight, elem.graphicID, 0);
				tree.right = elem;
				elem.parent = tree;
				this.cmd(act.connect, tree.graphicID, elem.graphicID, LINK_COLOR);
				elem.x = tree.x + WIDTH_DELTA / 2;
				elem.y = tree.y + HEIGHT_DELTA;
				this.cmd(act.move, elem.graphicID, elem.x, elem.y);
			} else {
				this.cmd(
					act.createHighlightCircle,
					this.highlightID,
					HIGHLIGHT_CIRCLE_COLOR,
					tree.x,
					tree.y,
				);
				this.cmd(act.move, this.highlightID, tree.right.x, tree.right.y);
				this.cmd(act.step);
				this.cmd(act.delete, this.highlightID);
				this.insert(elem, tree.right);
			}
		}
	}

	deleteElement(deletedValue) {
		this.commands = [];
		this.cmd(act.setText, 0, 'Deleting ' + deletedValue);
		this.cmd(act.step);
		this.cmd(act.setText, 0, '');
		this.highlightID = this.nextIndex++;
		this.treeDelete(this.treeRoot, deletedValue);
		this.cmd(act.setText, 0, '');
		// Do delete
		return this.commands;
	}

	treeDelete(tree, valueToDelete) {
		this.cmd(act.setText, 0, 'Finding ' + valueToDelete + ' and splaying to rooot');
		this.cmd(act.step);

		const inTree = this.doFind(this.treeRoot, valueToDelete);
		this.cmd(act.setText, 0, 'Removing root, leaving left and right trees');
		this.cmd(act.step);
		if (inTree) {
			if (this.treeRoot.right == null) {
				this.cmd(act.delete, this.treeRoot.graphicID);
				this.cmd(act.setText, 0, 'No right tree, make left tree the root.');
				this.cmd(act.step);
				this.treeRoot = this.treeRoot.left;
				this.treeRoot.parent = null;
				this.resizeTree();
			} else if (this.treeRoot.left == null) {
				this.cmd(act.delete, this.treeRoot.graphicID);
				this.cmd(act.setText, 0, 'No left tree, make right tree the root.');
				this.cmd(act.step);
				this.treeRoot = this.treeRoot.right;
				this.treeRoot.parent = null;
				this.resizeTree();
			} else {
				const right = this.treeRoot.right;
				const left = this.treeRoot.left;
				const oldGraphicID = this.treeRoot.graphicID;
				this.cmd(act.disconnect, this.treeRoot.graphicID, left.graphicID);
				this.cmd(act.disconnect, this.treeRoot.graphicID, right.graphicID);
				this.cmd(act.setAlpha, this.treeRoot.graphicID, 0);
				this.cmd(act.setText, 0, 'Splay largest element in left tree to root');
				this.cmd(act.step);

				left.parent = null;
				const largestLeft = this.findMax(left);
				this.splayUp(largestLeft);
				this.cmd(
					act.setText,
					0,
					'Left tree now has no right subtree, connect left and right trees',
				);
				this.cmd(act.step);
				this.cmd(act.connect, largestLeft.graphicID, right.graphicID, LINK_COLOR);
				largestLeft.parent = null;
				largestLeft.right = right;
				right.parent = largestLeft;
				this.treeRoot = largestLeft;
				this.cmd(act.delete, oldGraphicID);
				this.resizeTree();
			}
		}
	}

	singleRotateRight(tree) {
		const B = tree;
		// const t3 = B.right;
		const A = tree.left;
		// const t1 = A.left;
		const t2 = A.right;

		this.cmd(act.setText, 0, 'Zig Right');
		this.cmd(act.setEdgeHighlight, B.graphicID, A.graphicID, 1);
		this.cmd(act.step);

		if (t2 != null) {
			this.cmd(act.disconnect, A.graphicID, t2.graphicID);
			this.cmd(act.connect, B.graphicID, t2.graphicID, LINK_COLOR);
			t2.parent = B;
		}
		this.cmd(act.disconnect, B.graphicID, A.graphicID);
		this.cmd(act.connect, A.graphicID, B.graphicID, LINK_COLOR);
		A.parent = B.parent;
		if (B.parent == null) {
			this.treeRoot = A;
		} else {
			this.cmd(act.disconnect, B.parent.graphicID, B.graphicID, LINK_COLOR);
			this.cmd(act.connect, B.parent.graphicID, A.graphicID, LINK_COLOR);
			if (B.isLeftChild()) {
				B.parent.left = A;
			} else {
				B.parent.right = A;
			}
		}
		A.right = B;
		B.parent = A;
		B.left = t2;
		this.resizeTree();
	}

	zigZigRight(tree) {
		const C = tree;
		const B = tree.left;
		const A = tree.left.left;
		// const t1 = A.left;
		const t2 = A.right;
		const t3 = B.right;
		// const t4 = C.right;

		this.cmd(act.setText, 0, 'Zig-Zig Right');
		this.cmd(act.setEdgeHighlight, C.graphicID, B.graphicID, 1);
		this.cmd(act.setEdgeHighlight, B.graphicID, A.graphicID, 1);
		this.cmd(act.step);
		this.cmd(act.setEdgeHighlight, C.graphicID, B.graphicID, 0);
		this.cmd(act.setEdgeHighlight, B.graphicID, A.graphicID, 0);

		if (C.parent != null) {
			this.cmd(act.disconnect, C.parent.graphicID, C.graphicID);
			this.cmd(act.connect, C.parent.graphicID, A.graphicID, LINK_COLOR);
			if (C.isLeftChild()) {
				C.parent.left = A;
			} else {
				C.parent.right = A;
			}
		} else {
			this.treeRoot = A;
		}

		if (t2 != null) {
			this.cmd(act.disconnect, A.graphicID, t2.graphicID);
			this.cmd(act.connect, B.graphicID, t2.graphicID, LINK_COLOR);
			t2.parent = B;
		}
		if (t3 != null) {
			this.cmd(act.disconnect, B.graphicID, t3.graphicID);
			this.cmd(act.connect, C.graphicID, t3.graphicID, LINK_COLOR);
			t3.parent = C;
		}
		this.cmd(act.disconnect, B.graphicID, A.graphicID);
		this.cmd(act.connect, A.graphicID, B.graphicID, LINK_COLOR);
		this.cmd(act.disconnect, C.graphicID, B.graphicID);
		this.cmd(act.connect, B.graphicID, C.graphicID, LINK_COLOR);

		A.right = B;
		A.parent = C.parent;
		B.parent = A;
		B.left = t2;
		B.right = C;
		C.parent = B;
		C.left = t3;
		this.resizeTree();
	}

	zigZigLeft(tree) {
		const A = tree;
		const B = tree.right;
		const C = tree.right.right;
		// const t1 = A.left;
		const t2 = B.left;
		const t3 = C.left;
		// const t4 = C.right;

		this.cmd(act.setText, 0, 'Zig-Zig Left');
		this.cmd(act.setEdgeHighlight, A.graphicID, B.graphicID, 1);
		this.cmd(act.setEdgeHighlight, B.graphicID, C.graphicID, 1);
		this.cmd(act.step);
		this.cmd(act.setEdgeHighlight, A.graphicID, B.graphicID, 0);
		this.cmd(act.setEdgeHighlight, B.graphicID, C.graphicID, 0);

		if (A.parent != null) {
			this.cmd(act.disconnect, A.parent.graphicID, A.graphicID);
			this.cmd(act.connect, A.parent.graphicID, C.graphicID, LINK_COLOR);
			if (A.isLeftChild()) {
				A.parent.left = C;
			} else {
				A.parent.right = C;
			}
		} else {
			this.treeRoot = C;
		}

		if (t2 != null) {
			this.cmd(act.disconnect, B.graphicID, t2.graphicID);
			this.cmd(act.connect, A.graphicID, t2.graphicID, LINK_COLOR);
			t2.parent = A;
		}
		if (t3 != null) {
			this.cmd(act.disconnect, C.graphicID, t3.graphicID);
			this.cmd(act.connect, B.graphicID, t3.graphicID, LINK_COLOR);
			t3.parent = B;
		}
		this.cmd(act.disconnect, A.graphicID, B.graphicID);
		this.cmd(act.disconnect, B.graphicID, C.graphicID);
		this.cmd(act.connect, C.graphicID, B.graphicID, LINK_COLOR);
		this.cmd(act.connect, B.graphicID, A.graphicID, LINK_COLOR);
		C.parent = A.parent;
		A.right = t2;
		B.left = A;
		A.parent = B;
		B.right = t3;
		C.left = B;
		B.parent = C;

		this.resizeTree();
	}

	singleRotateLeft(tree) {
		const A = tree;
		const B = tree.right;
		// const t1 = A.left;
		const t2 = B.left;
		// const t3 = B.right;

		this.cmd(act.setText, 0, 'Zig Left');
		this.cmd(act.setEdgeHighlight, A.graphicID, B.graphicID, 1);
		this.cmd(act.step);

		if (t2 != null) {
			this.cmd(act.disconnect, B.graphicID, t2.graphicID);
			this.cmd(act.connect, A.graphicID, t2.graphicID, LINK_COLOR);
			t2.parent = A;
		}
		this.cmd(act.disconnect, A.graphicID, B.graphicID);
		this.cmd(act.connect, B.graphicID, A.graphicID, LINK_COLOR);
		B.parent = A.parent;
		if (A.parent == null) {
			this.treeRoot = B;
		} else {
			this.cmd(act.disconnect, A.parent.graphicID, A.graphicID, LINK_COLOR);
			this.cmd(act.connect, A.parent.graphicID, B.graphicID, LINK_COLOR);

			if (A.isLeftChild()) {
				A.parent.left = B;
			} else {
				A.parent.right = B;
			}
		}
		B.left = A;
		A.parent = B;
		A.right = t2;

		this.resizeTree();
	}

	splayUp(tree) {
		if (tree.parent == null) {
			return;
		} else if (tree.parent.parent == null) {
			if (tree.isLeftChild()) {
				this.singleRotateRight(tree.parent);
			} else {
				this.singleRotateLeft(tree.parent);
			}
		} else if (tree.isLeftChild() && !tree.parent.isLeftChild()) {
			this.doubleRotateLeft(tree.parent.parent);
			this.splayUp(tree);
		} else if (!tree.isLeftChild() && tree.parent.isLeftChild()) {
			this.doubleRotateRight(tree.parent.parent);
			this.splayUp(tree);
		} else if (tree.isLeftChild()) {
			this.zigZigRight(tree.parent.parent);
			this.splayUp(tree);
		} else {
			this.zigZigLeft(tree.parent.parent);
			this.splayUp(tree);
		}
	}

	findMax(tree) {
		if (tree.right != null) {
			this.highlightID = this.nextIndex++;
			this.cmd(
				act.createHighlightCircle,
				this.highlightID,
				HIGHLIGHT_CIRCLE_COLOR,
				tree.x,
				tree.y,
			);
			this.cmd(act.step);
			while (tree.right != null) {
				this.cmd(act.move, this.highlightID, tree.right.x, tree.right.y);
				this.cmd(act.step);
				tree = tree.right;
			}
			this.cmd(act.delete, this.highlightID);
			return tree;
		} else {
			return tree;
		}
	}

	doubleRotateRight(tree) {
		this.cmd(act.setText, 0, 'Zig-Zag Right');
		const A = tree.left;
		const B = tree.left.right;
		const C = tree;
		// const t1 = A.left;
		const t2 = B.left;
		const t3 = B.right;
		// const t4 = C.right;

		this.cmd(act.setEdgeHighlight, C.graphicID, A.graphicID, 1);
		this.cmd(act.setEdgeHighlight, A.graphicID, B.graphicID, 1);

		this.cmd(act.step);

		if (t2 != null) {
			this.cmd(act.disconnect, B.graphicID, t2.graphicID);
			t2.parent = A;
			A.right = t2;
			this.cmd(act.connect, A.graphicID, t2.graphicID, LINK_COLOR);
		}
		if (t3 != null) {
			this.cmd(act.disconnect, B.graphicID, t3.graphicID);
			t3.parent = C;
			C.left = t2;
			this.cmd(act.connect, C.graphicID, t3.graphicID, LINK_COLOR);
		}
		if (C.parent == null) {
			B.parent = null;
			this.treeRoot = B;
		} else {
			this.cmd(act.disconnect, C.parent.graphicID, C.graphicID);
			this.cmd(act.connect, C.parent.graphicID, B.graphicID, LINK_COLOR);
			if (C.isLeftChild()) {
				C.parent.left = B;
			} else {
				C.parent.right = B;
			}
			B.parent = C.parent;
			C.parent = B;
		}
		this.cmd(act.disconnect, C.graphicID, A.graphicID);
		this.cmd(act.disconnect, A.graphicID, B.graphicID);
		this.cmd(act.connect, B.graphicID, A.graphicID, LINK_COLOR);
		this.cmd(act.connect, B.graphicID, C.graphicID, LINK_COLOR);
		B.left = A;
		A.parent = B;
		B.right = C;
		C.parent = B;
		A.right = t2;
		C.left = t3;

		this.resizeTree();
	}

	doubleRotateLeft(tree) {
		this.cmd(act.setText, 0, 'Zig-Zag Left');
		const A = tree;
		const B = tree.right.left;
		const C = tree.right;
		// const t1 = A.left;
		const t2 = B.left;
		const t3 = B.right;
		// const t4 = C.right;

		this.cmd(act.setEdgeHighlight, A.graphicID, C.graphicID, 1);
		this.cmd(act.setEdgeHighlight, C.graphicID, B.graphicID, 1);

		this.cmd(act.step);

		if (t2 != null) {
			this.cmd(act.disconnect, B.graphicID, t2.graphicID);
			t2.parent = A;
			A.right = t2;
			this.cmd(act.connect, A.graphicID, t2.graphicID, LINK_COLOR);
		}
		if (t3 != null) {
			this.cmd(act.disconnect, B.graphicID, t3.graphicID);
			t3.parent = C;
			C.left = t2;
			this.cmd(act.connect, C.graphicID, t3.graphicID, LINK_COLOR);
		}

		if (A.parent == null) {
			B.parent = null;
			this.treeRoot = B;
		} else {
			this.cmd(act.disconnect, A.parent.graphicID, A.graphicID);
			this.cmd(act.connect, A.parent.graphicID, B.graphicID, LINK_COLOR);
			if (A.isLeftChild()) {
				A.parent.left = B;
			} else {
				A.parent.right = B;
			}
			B.parent = A.parent;
			A.parent = B;
		}
		this.cmd(act.disconnect, A.graphicID, C.graphicID);
		this.cmd(act.disconnect, C.graphicID, B.graphicID);
		this.cmd(act.connect, B.graphicID, A.graphicID, LINK_COLOR);
		this.cmd(act.connect, B.graphicID, C.graphicID, LINK_COLOR);
		B.left = A;
		A.parent = B;
		B.right = C;
		C.parent = B;
		A.right = t2;
		C.left = t3;

		this.resizeTree();
	}

	resizeTree() {
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
			this.setNewPositions(this.treeRoot, startingPoint, STARTING_Y, 0);
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
			this.setNewPositions(tree.left, xPosition, yPosition + HEIGHT_DELTA, -1);
			this.setNewPositions(tree.right, xPosition, yPosition + HEIGHT_DELTA, 1);
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
		tree.leftWidth = Math.max(this.resizeWidths(tree.left), WIDTH_DELTA / 2);
		tree.rightWidth = Math.max(this.resizeWidths(tree.right), WIDTH_DELTA / 2);
		return tree.leftWidth + tree.rightWidth;
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

	isLeftChild() {
		if (this.parent == null) {
			return true;
		}
		return this.parent.left === this;
	}
}
