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

export default class RedBlackTree extends Algorithm {
    constructor(am, w, h) {
        super(am, w, h);

        this.first_print_pos_y = h - 2 * RedBlackTree.PRINT_VERTICAL_GAP;
        this.print_max = w - 10;
        this.startingX = w / 2;
        this.addControls();
        this.nextIndex = 1;
        this.commands = [];
        this.edges = [];
        this.cmd(act.createLabel, 0, '', RedBlackTree.EXPLANITORY_TEXT_X, RedBlackTree.EXPLANITORY_TEXT_Y, 0);
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

        this.printButton = addControlToAlgorithmBar('Button', 'Print');
        this.printButton.onclick = this.printCallback.bind(this);
        this.controls.push(this.printButton);

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
        let insertedValue = this.insertField.value;
        // Get text value
        insertedValue = this.normalizeNumber(insertedValue, 4);
        if (insertedValue !== '') {
            // set text value
            this.insertField.value = '';
            this.implementAction(this.add.bind(this), parseInt(insertedValue));
        }
    }

    deleteCallback() {
        let deletedValue = this.deleteField.value;
        if (deletedValue !== '') {
            deletedValue = this.normalizeNumber(deletedValue, 4);
            this.deleteField.value = '';
            this.implementAction(this.remove.bind(this), parseInt(deletedValue));
        }
    }

    findCallback() {
        let findValue = this.findField.value;
        if (findValue !== '') {
            findValue = this.normalizeNumber(findValue, 4);
            this.findField.value = '';
            this.implementAction(this.findElement.bind(this), parseInt(findValue));
        }
    }

    printCallback() {
        this.implementAction(this.printTree.bind(this));
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
                RedBlackTree.HIGHLIGHT_COLOR,
                this.treeRoot.x,
                this.treeRoot.y,
            );
            this.xPosOfNextLabel = RedBlackTree.FIRST_PRINT_POS_X;
            this.yPosOfNextLabel = this.first_print_pos_y;
            this.printTreeRec(this.treeRoot);
            this.cmd(act.delete, this.highlightID);
            this.cmd(act.step);
            for (let i = firstLabel; i < this.nextIndex; i++) this.cmd(act.delete, i);
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
        this.cmd(act.setForegroundColor, nextLabelID, RedBlackTree.PRINT_COLOR);
        this.cmd(act.move, nextLabelID, this.xPosOfNextLabel, this.yPosOfNextLabel);
        this.cmd(act.step);

        this.xPosOfNextLabel += RedBlackTree.PRINT_HORIZONTAL_GAP;
        if (this.xPosOfNextLabel > this.print_max) {
            this.xPosOfNextLabel = RedBlackTree.FIRST_PRINT_POS_X;
            this.yPosOfNextLabel += RedBlackTree.PRINT_VERTICAL_GAP;
        }
        if (tree.right != null) {
            this.cmd(act.move, this.highlightID, tree.right.x, tree.right.y);
            this.printTreeRec(tree.right);
            this.cmd(act.move, this.highlightID, tree.x, tree.y);
            this.cmd(act.step);
        }
        return;
    }

    findElement(findValue) {
        this.commands = [];

        this.highlightID = this.nextIndex++;

        this.doFind(this.treeRoot, findValue);

        return this.commands;
    }

    doFind(tree, value) {
        this.cmd(act.setText, 0, 'Searchiing for ' + value);
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
                            RedBlackTree.HIGHLIGHT_COLOR,
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
                            RedBlackTree.HIGHLIGHT_COLOR,
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
                ' Searching for ' + value + ' : < Empty Tree > (Element not found)',
            );
            this.cmd(act.step);
            this.cmd(act.setText, 0, ' Searching for ' + value + ' :  (Element not found)');
        }
    }

    remakeTree(curr) {
        if (curr == null) return;
        if (curr.left != null) {
            this.cmd(act.connect, curr.graphicID, curr.left.graphicID, RedBlackTree.LINK_COLOR);
            this.remakeTree(curr.left);
        }
        if (curr.right != null) {
            this.cmd(act.connect, curr.graphicID, curr.right.graphicID, RedBlackTree.LINK_COLOR);
            this.remakeTree(curr.right);
        }
    }

    add(data) {
        this.commands = [];
        this.cmd(act.setText, 0, ' Inserting ' + data);
        this.treeRoot = this.addH(data, this.treeRoot);
        this.resizeTree();
        return this.commands;
    }

    addH(data, curr) {
        if (curr == null) {
            this.cmd(act.setText, 0, 'Null found, inserting new node');
            const treeNodeID = this.nextIndex++;
            const heightLabelID = this.nextIndex++;
            const bfLabelID = this.nextIndex++;
            this.cmd(act.createCircle, treeNodeID, data, 30, RedBlackTree.STARTING_Y);

            this.cmd(act.setForegroundColor, treeNodeID, RedBlackTree.FOREGROUND_COLOR);
            this.cmd(act.setBackgroundColor, treeNodeID, RedBlackTree.BACKGROUND_COLOR);
            this.cmd(act.createLabel, heightLabelID, 0, 30 - 20, RedBlackTree.STARTING_Y - 20);
            this.cmd(act.setForegroundColor, heightLabelID, RedBlackTree.HEIGHT_LABEL_COLOR);

            this.cmd(act.createLabel, bfLabelID, 0, 30 + 20, RedBlackTree.STARTING_Y - 20);
            this.cmd(act.setForegroundColor, bfLabelID, RedBlackTree.HEIGHT_LABEL_COLOR);
            this.cmd(act.step);
            this.cmd(act.setText, 0, '');
            return new RedBlackTreeNode(data, treeNodeID, heightLabelID, bfLabelID, 0, 0);
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
        curr = this.balance(curr);
        this.cmd(act.setHighlight, curr.graphicID, 0);
        this.cmd(act.setText, 0, '');
        return curr;
    }

    connectSmart(id1, id2) {
        if (!this.edges.some(e => e[0] === id1 && e[1] === id2)) {
            this.cmd(act.connect, id1, id2, RedBlackTree.LINK_COLOR);
            this.cmd(act.setEdgeAlpha, id1, id2, RedBlackTree.LINK_OPACITY);
            this.edges.push([id1, id2]);
            return true;
        }
        return false;
    }

    balance(curr) {
        curr.updateHeightAndBF();
        this.cmd(act.setText, curr.heightLabelID, curr.height);
        this.cmd(act.setText, curr.bfLabelID, curr.bf);
        this.cmd(act.setText, 0, 'Adjusting height and balance factor after recursive call');
        this.cmd(act.step);

        if (curr.bf < -1) {
            this.cmd(act.setText, 0, 'Balance factor < -1');
            this.cmd(act.setTextColor, curr.bfLabelID, RedBlackTree.HIGHLIGHT_LABEL_COLOR);
            this.cmd(act.step);
            if (curr.right != null && curr.right.bf > 0) {
                this.cmd(act.setText, 0, 'Right child balance factor > 0');
                this.cmd(act.setTextColor, curr.right.bfLabelID, RedBlackTree.HIGHLIGHT_LABEL_COLOR);
                this.cmd(act.step);
                this.cmd(act.setText, 0, 'Right-left rotation');
                this.cmd(act.step);
                this.cmd(act.setTextColor, curr.right.bfLabelID, RedBlackTree.HEIGHT_LABEL_COLOR);
                curr.right = this.singleRotateRight(curr.right);
            } else {
                if (curr.right != null) {
                    this.cmd(act.setText, 0, 'Right child balance factor <= 0');
                    this.cmd(act.setTextColor, curr.right.bfLabelID, RedBlackTree.HIGHLIGHT_LABEL_COLOR);
                    this.cmd(act.step);
                } else {
                    this.cmd(act.setText, 0, 'No right child');
                    this.cmd(act.step);
                }
                this.cmd(act.setText, 0, 'Left rotation');
                this.cmd(act.step);
            }
            this.cmd(act.setTextColor, curr.bfLabelID, RedBlackTree.HEIGHT_LABEL_COLOR);
            this.cmd(act.setTextColor, curr.right.bfLabelID, RedBlackTree.HEIGHT_LABEL_COLOR);
            curr = this.singleRotateLeft(curr);
        } else if (curr.bf > 1) {
            this.cmd(act.setText, 0, 'Balance factor > 1');
            this.cmd(act.setTextColor, curr.bfLabelID, RedBlackTree.HIGHLIGHT_LABEL_COLOR);
            this.cmd(act.step);
            if (curr.left != null && curr.left.bf < 0) {
                this.cmd(act.setText, 0, 'Left child balance factor < 0');
                this.cmd(act.setTextColor, curr.left.bfLabelID, RedBlackTree.HIGHLIGHT_LABEL_COLOR);
                this.cmd(act.step);
                this.cmd(act.setText, 0, 'Left-right rotation');
                this.cmd(act.step);
                this.cmd(act.setTextColor, curr.left.bfLabelID, RedBlackTree.HEIGHT_LABEL_COLOR);
                curr.left = this.singleRotateLeft(curr.left);
            } else {
                if (curr.left != null) {
                    this.cmd(act.setText, 0, 'Left child balance factor >= 0');
                    this.cmd(act.setTextColor, curr.left.bfLabelID, RedBlackTree.HIGHLIGHT_LABEL_COLOR);
                    this.cmd(act.step);
                } else {
                    this.cmd(act.setText, 0, 'No left child');
                    this.cmd(act.step);
                }
                this.cmd(act.setText, 0, 'Right rotation');
                this.cmd(act.step);
                this.cmd(act.setTextColor, curr.bfLabelID, RedBlackTree.HEIGHT_LABEL_COLOR);
            }
            this.cmd(act.setTextColor, curr.bfLabelID, RedBlackTree.HEIGHT_LABEL_COLOR);
            this.cmd(act.setTextColor, curr.left.bfLabelID, RedBlackTree.HEIGHT_LABEL_COLOR);
            curr = this.singleRotateRight(curr);
        }
        return curr;
    }

    singleRotateRight(tree) {
        const B = tree;
        const A = tree.left;
        const t2 = A.right;

        // this.cmd(act.setText, 0, 'Single Rotate Right');
        this.cmd(act.setEdgeHighlight, B.graphicID, A.graphicID, 1);
        this.cmd(act.step);

        if (t2 != null) {
            this.cmd(act.disconnect, A.graphicID, t2.graphicID);
            this.cmd(act.connect, B.graphicID, t2.graphicID, RedBlackTree.LINK_COLOR);
            this.cmd(act.setEdgeAlpha, B.graphicID, t2.graphicID, RedBlackTree.LINK_OPACITY);
            t2.parent = B;
        }
        this.cmd(act.disconnect, B.graphicID, A.graphicID);
        this.cmd(act.connect, A.graphicID, B.graphicID, RedBlackTree.LINK_COLOR);
        this.cmd(act.setEdgeAlpha, A.graphicID, B.graphicID, RedBlackTree.LINK_OPACITY);
        A.parent = B.parent;
        if (this.treeRoot === B) {
            this.treeRoot = A;
        } else {
            this.cmd(act.disconnect, B.parent.graphicID, B.graphicID, RedBlackTree.LINK_COLOR);
            this.cmd(act.connect, B.parent.graphicID, A.graphicID, RedBlackTree.LINK_COLOR);
            this.cmd(act.setEdgeAlpha, B.parent.graphicID, A.graphicID, RedBlackTree.LINK_OPACITY);

            if (B.isLeftChild()) {
                B.parent.left = A;
            } else {
                B.parent.right = A;
            }
        }
        A.right = B;
        B.parent = A;
        B.left = t2;
        this.cmd(act.setHighlight, A.graphicID, 0);
        this.cmd(act.setHighlight, B.graphicID, 0);
        B.updateHeightAndBF();
        this.cmd(act.setText, B.heightLabelID, B.height);
        this.cmd(act.setText, B.bfLabelID, B.bf);
        A.updateHeightAndBF();
        this.cmd(act.setText, A.heightLabelID, A.height);
        this.cmd(act.setText, A.bfLabelID, A.bf);
        this.resizeTree();
        return A;
    }

    singleRotateLeft(tree) {
        const A = tree;
        const B = tree.right;
        const t2 = B.left;

        // this.cmd(act.setText, 0, 'Single Rotate Left');
        this.cmd(act.setEdgeHighlight, A.graphicID, B.graphicID, 1);
        this.cmd(act.step);

        if (t2 != null) {
            this.cmd(act.disconnect, B.graphicID, t2.graphicID);
            this.cmd(act.connect, A.graphicID, t2.graphicID, RedBlackTree.LINK_COLOR);
            this.cmd(act.setEdgeAlpha, A.graphicID, t2.graphicID, RedBlackTree.LINK_OPACITY);

            t2.parent = A;
        }
        this.cmd(act.disconnect, A.graphicID, B.graphicID);
        this.cmd(act.connect, B.graphicID, A.graphicID, RedBlackTree.LINK_COLOR);
        this.cmd(act.setEdgeAlpha, B.graphicID, A.graphicID, RedBlackTree.LINK_OPACITY);

        B.parent = A.parent;
        if (this.treeRoot === A) {
            this.treeRoot = B;
        } else {
            this.cmd(act.disconnect, A.parent.graphicID, A.graphicID, RedBlackTree.LINK_COLOR);
            this.cmd(act.connect, A.parent.graphicID, B.graphicID, RedBlackTree.LINK_COLOR);
            this.cmd(act.setEdgeAlpha, A.parent.graphicID, B.graphicID, RedBlackTree.LINK_OPACITY);

            if (A.isLeftChild()) {
                A.parent.left = B;
            } else {
                A.parent.right = B;
            }
        }
        B.left = A;
        A.parent = B;
        A.right = t2;
        this.cmd(act.setHighlight, A.graphicID, 0);
        this.cmd(act.setHighlight, B.graphicID, 0);
        A.updateHeightAndBF();
        this.cmd(act.setText, A.heightLabelID, A.height);
        this.cmd(act.setText, A.bfLabelID, A.bf);
        B.updateHeightAndBF();
        this.cmd(act.setText, B.heightLabelID, B.height);
        this.cmd(act.setText, B.bfLabelID, B.bf);

        this.resizeTree();
        return B;
    }

    getHeight(tree) {
        if (tree == null) {
            return -1;
        }
        return tree.height;
    }

    resetHeight(tree) {
        if (tree != null) {
            const newHeight = Math.max(this.getHeight(tree.left), this.getHeight(tree.right)) + 1;
            if (tree.height !== newHeight) {
                tree.height = Math.max(this.getHeight(tree.left), this.getHeight(tree.right)) + 1;
                this.cmd(act.setText, tree.heightLabelID, newHeight);
            }
        }
    }

    deleteNode(curr) {
        this.cmd(act.delete, curr.graphicID);
        this.cmd(act.delete, curr.heightLabelID);
        this.cmd(act.delete, curr.bfLabelID);
    }

    remove(data) {
        this.commands = [];

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
        curr = this.balance(curr);
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
        this.cmd(act.step);
        curr.left = this.removeSucc(curr.left, dummy);
        if (curr.left != null) {
            curr.left.parent = curr;
            this.connectSmart(curr.graphicID, curr.left.graphicID);
            this.resizeTree();
        }
        curr = this.balance(curr);
        this.cmd(act.setHighlight, curr.graphicID, 0);
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
        curr = this.balance(curr);
        this.cmd(act.setHighlight, curr.graphicID, 0);
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
            this.setNewPositions(this.treeRoot, startingPoint, RedBlackTree.STARTING_Y, 0);
            this.animateNewPositions(this.treeRoot);
            this.cmd(act.step);
        }
    }

    setNewPositions(tree, xPosition, yPosition, side) {
        if (tree != null) {
            tree.y = yPosition;
            if (side === -1) {
                xPosition = xPosition - tree.rightWidth;
                tree.heightLabelX = xPosition - 20;
                tree.bfLabelX = xPosition + 20;
            } else if (side === 1) {
                xPosition = xPosition + tree.leftWidth;
                tree.heightLabelX = xPosition - 20;
                tree.bfLabelX = xPosition + 20;
            } else {
                tree.heightLabelX = xPosition - 20;
                tree.bfLabelX = xPosition + 20;
            }
            tree.x = xPosition;
            tree.heightLabelY = tree.y - 20;
            tree.bfLabelY = tree.y - 20;
            this.setNewPositions(tree.left, xPosition, yPosition + RedBlackTree.HEIGHT_DELTA, -1);
            this.setNewPositions(tree.right, xPosition, yPosition + RedBlackTree.HEIGHT_DELTA, 1);
        }
    }

    animateNewPositions(tree) {
        if (tree != null) {
            this.cmd(act.move, tree.graphicID, tree.x, tree.y);
            this.cmd(act.move, tree.heightLabelID, tree.heightLabelX, tree.heightLabelY);
            this.cmd(act.move, tree.bfLabelID, tree.bfLabelX, tree.bfLabelY);
            this.animateNewPositions(tree.left);
            this.animateNewPositions(tree.right);
        }
    }

    resizeWidths(tree) {
        if (tree == null) {
            return 0;
        }
        tree.leftWidth = Math.max(this.resizeWidths(tree.left), RedBlackTree.WIDTH_DELTA / 2);
        tree.rightWidth = Math.max(this.resizeWidths(tree.right), RedBlackTree.WIDTH_DELTA / 2);
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
            this.cmd(act.delete, curr.heightLabelID);
            this.cmd(act.delete, curr.bfLabelID);
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

class RedBlackTreeNode {
    constructor(val, id, hid, bfid, initialX, initialY) {
        this.data = val;
        this.x = initialX;
        this.y = initialY;
        this.heightLabelID = hid;
        this.bfLabelID = bfid;
        this.height = 0;
        this.bf = 0;

        this.graphicID = id;
        this.left = null;
        this.right = null;
        this.parent = null;
    }

    updateHeightAndBF() {
        const h = node => (node == null ? -1 : node.height);
        const l = h(this.left);
        const r = h(this.right);
        this.height = Math.max(l, r) + 1;
        this.bf = l - r;
    }

    isLeftChild() {
        if (this.parent == null) {
            return true;
        }
        return this.parent.left === this;
    }
}

// Various constants

RedBlackTree.HIGHLIGHT_LABEL_COLOR = '#FF0000';
RedBlackTree.HIGHLIGHT_LINK_COLOR = '#FF0000';

RedBlackTree.HIGHLIGHT_COLOR = '#007700';
RedBlackTree.HEIGHT_LABEL_COLOR = '#065e9d';

RedBlackTree.LINK_COLOR = '#00B000';
RedBlackTree.LINK_OPACITY = 0.25;
RedBlackTree.HIGHLIGHT_CIRCLE_COLOR = '#007700';
RedBlackTree.FOREGROUND_COLOR = '#007700';
RedBlackTree.BACKGROUND_COLOR = '#DDFFDD';
RedBlackTree.PRINT_COLOR = RedBlackTree.FOREGROUND_COLOR;

RedBlackTree.WIDTH_DELTA = 50;
RedBlackTree.HEIGHT_DELTA = 50;
RedBlackTree.STARTING_Y = 50;

RedBlackTree.FIRST_PRINT_POS_X = 50;
RedBlackTree.PRINT_VERTICAL_GAP = 20;
RedBlackTree.PRINT_HORIZONTAL_GAP = 50;
RedBlackTree.EXPLANITORY_TEXT_X = 10;
RedBlackTree.EXPLANITORY_TEXT_Y = 10;
