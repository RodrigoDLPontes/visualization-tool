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

// Constants.

import Algorithm, { addControlToAlgorithmBar } from './Algorithm.js';
import { act } from '../anim/AnimationMain';

const LINK_COLOR = '#007700';
const HIGHLIGHT_CIRCLE_COLOR = '#007700';
const FOREGROUND_COLOR = '#007700';
const BACKGROUND_COLOR = '#EEFFEE';
const PRINT_COLOR = FOREGROUND_COLOR;

const WIDTH_DELTA = 50;
const HEIGHT_DELTA = 50;
const STARTING_Y = 50;

const FIRST_PRINT_POS_X = 50;
const PRINT_VERTICAL_GAP = 20;
const PRINT_HORIZONTAL_GAP = 50;

export default class BST extends Algorithm {
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
		this.insertField.onkeydown = this.returnSubmit(
			this.insertField,
			this.insertCallback.bind(this),
			4
		);
		this.controls.push(this.insertField);

		this.insertButton = addControlToAlgorithmBar('Button', 'Insert');
		this.insertButton.onclick = this.insertCallback.bind(this);
		this.controls.push(this.insertButton);

		this.deleteField = addControlToAlgorithmBar('Text', '');
		this.deleteField.onkeydown = this.returnSubmit(
			this.deleteField,
			this.deleteCallback.bind(this),
			4
		);
		this.controls.push(this.deleteField);

		this.deleteButton = addControlToAlgorithmBar('Button', 'Delete');
		this.deleteButton.onclick = this.deleteCallback.bind(this);
		this.controls.push(this.deleteButton);

		this.findField = addControlToAlgorithmBar('Text', '');
		this.findField.onkeydown = this.returnSubmit(
			this.findField,
			this.findCallback.bind(this),
			4
		);
		this.controls.push(this.findField);

		this.findButton = addControlToAlgorithmBar('Button', 'Find');
		this.findButton.onclick = this.findCallback.bind(this);
		this.controls.push(this.findButton);

		this.printButton = addControlToAlgorithmBar('Button', 'Print');
		this.printButton.onclick = this.printCallback.bind(this);
		this.controls.push(this.printButton);

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
			this.implementAction(this.insertElement.bind(this), insertedValue);
		}
	}

	deleteCallback() {
		let deletedValue = this.deleteField.value;
		if (deletedValue !== '') {
			deletedValue = this.normalizeNumber(deletedValue, 4);
			this.deleteField.value = '';
			this.implementAction(this.deleteElement.bind(this), deletedValue);
		}
	}

	printCallback() {
		this.implementAction(this.printTree.bind(this), '');
	}

	clearCallback() {
		this.implementAction(this.clear.bind(this), '');
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
				this.treeRoot.y
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

	findCallback() {
		const findValue = this.normalizeNumber(this.findField.value, 4);
		this.findField.value = '';
		this.implementAction(this.findElement.bind(this), findValue);
	}

	findElement(findValue) {
		this.commands = [];

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
					'Searching for ' + value + ' : ' + value + ' = ' + value + ' (Element found!)'
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
							' (look to left subtree)'
					);
					this.cmd(act.step);
					this.cmd(act.setHighlight, tree.graphicID, 0);
					if (tree.left != null) {
						this.cmd(
							act.createHighlightCircle,
							this.highlightID,
							HIGHLIGHT_CIRCLE_COLOR,
							tree.x,
							tree.y
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
						'Searching for ' +
							value +
							' : ' +
							value +
							' > ' +
							tree.data +
							' (look to right subtree)'
					);
					this.cmd(act.step);
					this.cmd(act.setHighlight, tree.graphicID, 0);
					if (tree.right != null) {
						this.cmd(
							act.createHighlightCircle,
							this.highlightID,
							HIGHLIGHT_CIRCLE_COLOR,
							tree.x,
							tree.y
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
				'Searching for ' + value + ' : < Empty Tree > (Element not found)'
			);
			this.cmd(act.step);
			this.cmd(act.setText, 0, 'Searching for ' + value + ' :  (Element not found)');
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
			this.cmd(act.setText, 0, elem.data + ' > ' + tree.data + '.  Looking at right subtree');
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
					tree.y
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
					tree.y
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
		let leftchild = false;
		if (tree != null) {
			if (tree.parent != null) {
				leftchild = tree.parent.left === tree;
			}
			this.cmd(act.setHighlight, tree.graphicID, 1);
			if (valueToDelete < tree.data) {
				this.cmd(
					act.setText,
					0,
					valueToDelete + ' < ' + tree.data + '.  Looking at left subtree'
				);
			} else if (valueToDelete > tree.data) {
				this.cmd(
					act.setText,
					0,
					valueToDelete + ' > ' + tree.data + '.  Looking at right subtree'
				);
			} else {
				this.cmd(
					act.setText,
					0,
					valueToDelete + ' == ' + tree.data + '.  Found node to delete'
				);
			}
			this.cmd(act.step);
			this.cmd(act.setHighlight, tree.graphicID, 0);

			if (valueToDelete === tree.data) {
				if (tree.left == null && tree.right == null) {
					this.cmd(act.setText, 0, 'Node to delete is a leaf.  Delete it.');
					this.cmd(act.delete, tree.graphicID);
					if (leftchild && tree.parent != null) {
						tree.parent.left = null;
					} else if (tree.parent != null) {
						tree.parent.right = null;
					} else {
						this.treeRoot = null;
					}
					this.resizeTree();
					this.cmd(act.step);
				} else if (tree.left == null) {
					this.cmd(
						act.setText,
						0,
						'Node to delete has no left child.  \nSet parent of deleted node to right child of deleted node.'
					);
					if (tree.parent != null) {
						this.cmd(act.disconnect, tree.parent.graphicID, tree.graphicID);
						this.cmd(
							act.connect,
							tree.parent.graphicID,
							tree.right.graphicID,
							LINK_COLOR
						);
						this.cmd(act.step);
						this.cmd(act.delete, tree.graphicID);
						if (leftchild) {
							tree.parent.left = tree.right;
						} else {
							tree.parent.right = tree.right;
						}
						tree.right.parent = tree.parent;
					} else {
						this.cmd(act.delete, tree.graphicID);
						this.treeRoot = tree.right;
						this.treeRoot.parent = null;
					}
					this.resizeTree();
				} else if (tree.right == null) {
					this.cmd(
						act.setText,
						0,
						'Node to delete has no right child.  \nSet parent of deleted node to left child of deleted node.'
					);
					if (tree.parent != null) {
						this.cmd(act.disconnect, tree.parent.graphicID, tree.graphicID);
						this.cmd(act.connect, tree.parent.graphicID, tree.left.graphicID, LINK_COLOR);
						this.cmd(act.step);
						this.cmd(act.delete, tree.graphicID);
						if (leftchild) {
							tree.parent.left = tree.left;
						} else {
							tree.parent.right = tree.left;
						}
						tree.left.parent = tree.parent;
					} else {
						this.cmd(act.delete, tree.graphicID);
						this.treeRoot = tree.left;
						this.treeRoot.parent = null;
					}
					this.resizeTree();
				} // tree.left != null && tree.right != null
				else {
					this.cmd(
						act.setText,
						0,
						'Node to delete has two childern.  \nFind largest node in left subtree.'
					);

					this.highlightID = this.nextIndex;
					this.nextIndex += 1;
					this.cmd(
						act.createHighlightCircle,
						this.highlightID,
						HIGHLIGHT_CIRCLE_COLOR,
						tree.x,
						tree.y
					);
					let tmp = tree;
					tmp = tree.left;
					this.cmd(act.move, this.highlightID, tmp.x, tmp.y);
					this.cmd(act.step);
					while (tmp.right != null) {
						tmp = tmp.right;
						this.cmd(act.move, this.highlightID, tmp.x, tmp.y);
						this.cmd(act.step);
					}
					this.cmd(act.setText, tree.graphicID, ' ');
					const labelID = this.nextIndex;
					this.nextIndex += 1;
					this.cmd(act.createLabel, labelID, tmp.data, tmp.x, tmp.y);
					tree.data = tmp.data;
					this.cmd(act.move, labelID, tree.x, tree.y);
					this.cmd(
						act.setText,
						0,
						'Copy largest value of left subtree into node to delete.'
					);

					this.cmd(act.step);
					this.cmd(act.setHighlight, tree.graphicID, 0);
					this.cmd(act.delete, labelID);
					this.cmd(act.setText, tree.graphicID, tree.data);
					this.cmd(act.delete, this.highlightID);
					this.cmd(act.setText, 0, 'Remove node whose value we copied.');

					if (tmp.left == null) {
						if (tmp.parent !== tree) {
							tmp.parent.right = null;
						} else {
							tree.left = null;
						}
						this.cmd(act.delete, tmp.graphicID);
						this.resizeTree();
					} else {
						this.cmd(act.disconnect, tmp.parent.graphicID, tmp.graphicID);
						this.cmd(act.connect, tmp.parent.graphicID, tmp.left.graphicID, LINK_COLOR);
						this.cmd(act.step);
						this.cmd(act.delete, tmp.graphicID);
						if (tmp.parent !== tree) {
							tmp.parent.right = tmp.left;
							tmp.left.parent = tmp.parent;
						} else {
							tree.left = tmp.left;
							tmp.left.parent = tree;
						}
						this.resizeTree();
					}
				}
			} else if (valueToDelete < tree.data) {
				if (tree.left != null) {
					this.cmd(
						act.createHighlightCircle,
						this.highlightID,
						HIGHLIGHT_CIRCLE_COLOR,
						tree.x,
						tree.y
					);
					this.cmd(act.move, this.highlightID, tree.left.x, tree.left.y);
					this.cmd(act.step);
					this.cmd(act.delete, this.highlightID);
				}
				this.treeDelete(tree.left, valueToDelete);
			} else {
				if (tree.right != null) {
					this.cmd(
						act.createHighlightCircle,
						this.highlightID,
						HIGHLIGHT_CIRCLE_COLOR,
						tree.x,
						tree.y
					);
					this.cmd(act.move, this.highlightID, tree.right.x, tree.right.y);
					this.cmd(act.step);
					this.cmd(act.delete, this.highlightID);
				}
				this.treeDelete(tree.right, valueToDelete);
			}
		} else {
			this.cmd(act.setText, 0, 'Elemet ' + valueToDelete + ' not found, could not delete');
		}
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
					2 * startingPoint - this.treeRoot.rightWidth
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

function BSTNode(val, id, initialX, initialY) {
	this.data = val;
	this.x = initialX;
	this.y = initialY;
	this.graphicID = id;
	this.left = null;
	this.right = null;
	this.parent = null;
}
