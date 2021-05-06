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
    addCheckboxToAlgorithmBar,
    addControlToAlgorithmBar
} from './Algorithm.js';
import {act} from '../anim/AnimationMain';

export default class RedBlack extends Algorithm {
    constructor(am, w, h) {
        super(am, w, h);

        this.addControls();
        this.nextIndex = 1;
        this.commands = [];
        this.startingX = w / 2;
        this.print_max = w - RedBlack.PRINT_HORIZONTAL_GAP;
        this.first_print_pos_y = h - 2 * RedBlack.PRINT_VERTICAL_GAP;

        this.cmd(act.createLabel, 0, "", RedBlack.EXPLANITORY_TEXT_X, RedBlack.EXPLANITORY_TEXT_Y, 0);
        this.animationManager.startNewAnimation(this.commands);
        this.animationManager.skipForward();
        this.animationManager.clearHistory();
    }

    addControls() {

        this.controls = [];

        this.insertField = addControlToAlgorithmBar("Text", "");
        this.insertField.onkeydown = this.returnSubmit(this.insertField, this.insertCallback.bind(this), 4, true);
        this.controls.push(this.insertField);

        this.insertButton = addControlToAlgorithmBar("Button", "Insert");
        this.insertButton.onclick = this.insertCallback.bind(this);
        this.controls.push(this.insertButton);

        this.deleteField = addControlToAlgorithmBar("Text", "");
        this.deleteField.onkeydown = this.returnSubmit(this.deleteField, this.deleteCallback.bind(this), 4, true);
        this.controls.push(this.deleteField);

        this.deleteButton = addControlToAlgorithmBar("Button", "Delete");
        this.deleteButton.onclick = this.deleteCallback.bind(this);
        this.controls.push(this.deleteButton);

        this.findField = addControlToAlgorithmBar("Text", "");
        this.findField.onkeydown = this.returnSubmit(this.findField, this.findCallback.bind(this), 4, true);
        this.controls.push(this.findField);

        this.findButton = addControlToAlgorithmBar("Button", "Find");
        this.findButton.onclick = this.findCallback.bind(this);
        this.controls.push(this.findButton);

        this.printButton = addControlToAlgorithmBar("Button", "Print");
        this.printButton.onclick = this.printCallback.bind(this);
        this.controls.push(this.printButton);

        this.showNullLeaves = addCheckboxToAlgorithmBar("Show Null Leaves");
        this.showNullLeaves.onclick = this.showNullLeavesCallback.bind(this);
        this.showNullLeaves.checked = false;
        this.controls.push(this.showNullLeaves)
    }


    reset() {
        this.nextIndex = 1;
        this.treeRoot = null;
    }


    insertCallback() {
        let insertedValue = this.insertField.value;
        insertedValue = this.normalizeNumber(insertedValue, 4);
        if (insertedValue !== "") {
            this.insertField.value = "";
            this.implementAction(this.insertElement.bind(this), parseInt(insertedValue));
        }
    }


    deleteCallback() {
        let deletedValue = this.deleteField.value;
        if (deletedValue !== "") {
            deletedValue = this.normalizeNumber(deletedValue, 4);
            this.deleteField.value = "";
            this.implementAction(this.deleteElement.bind(this), parseInt(deletedValue));
        }
    }


    findCallback() {
        let findValue = this.findField.value;
        if (findValue !== "") {
            findValue = this.normalizeNumber(findValue, 4);
            this.findField.value = "";
            this.implementAction(this.findElement.bind(this), parseInt(findValue));
        }
    }


    printCallback() {
        this.implementAction(this.printTree.bind(this));
    }


    showNullLeavesCallback() {
        if (this.showNullLeaves.checked) {
            this.animationManager.setAllLayers([0, 1]);
        } else {
            this.animationManager.setAllLayers([0]);
        }
    }


    printTree() {
        this.commands = [];

        if (this.treeRoot != null) {
            this.highlightID = this.nextIndex++;
            const firstLabel = this.nextIndex;
            this.cmd(act.createHighlightCircle, this.highlightID, RedBlack.HIGHLIGHT_COLOR, this.treeRoot.x, this.treeRoot.y);
            this.xPosOfNextLabel = RedBlack.FIRST_PRINT_POS_X;
            this.yPosOfNextLabel = this.first_print_pos_y;
            this.printTreeRec(this.treeRoot);
            this.cmd(act.delete, this.highlightID);
            this.cmd(act.step);
            for (let i = firstLabel; i < this.nextIndex; i++) {
                this.cmd(act.delete(), i);
            }
            this.nextIndex = this.highlightID;
        }
        return this.commands;
    }


    printTreeRec(tree) {
        this.cmd(act.step);
        if (tree.left != null && !tree.left.phantomLeaf) {
            this.printSubtree(tree, tree.left)
        }

        const nextLabelID = this.nextIndex++;
        this.cmd(act.createLabel, nextLabelID, tree.data, tree.x, tree.y);
        this.cmd(act.setForegroundColor, nextLabelID, RedBlack.PRINT_COLOR);
        this.cmd(act.move, nextLabelID, this.xPosOfNextLabel, this.yPosOfNextLabel);
        this.cmd(act.step);

        this.xPosOfNextLabel += RedBlack.PRINT_HORIZONTAL_GAP;
        if (this.xPosOfNextLabel > this.print_max) {
            this.xPosOfNextLabel = RedBlack.FIRST_PRINT_POS_X;
            this.yPosOfNextLabel += RedBlack.PRINT_VERTICAL_GAP;

        }
        if (tree.right != null && !tree.right.phantomLeaf) {
            this.printSubtree(tree, tree.right)
        }
    }


    printSubtree(tree, subtree) {
        this.cmd(act.move, this.highlightID, subtree.left.x, subtree.left.y);
        this.printTreeRec(subtree.left);
        this.cmd(act.move, this.highlightID, tree.x, subtree.y);
        this.cmd(act.step);
    }


    findElement(findValue) {
        this.commands = [];
        this.highlightID = this.nextIndex++;
        this.doFind(this.treeRoot, findValue);
        return this.commands;
    }


    doFind(tree, value) {
        this.cmd(act.setText, 0, "Searching for " + value);
        if (tree != null && !tree.phantomLeaf) {
            this.cmd(act.setHighlight, tree.graphicID, 1);
            if (parseInt(tree.data) === value) {
                this.cmd(act.setText, 0, "Searching for " + value + " : " + value + " = " + value + " (Element found!)");
                this.cmd(act.step);
                this.cmd(act.setText, 0, "Found:" + value);
                this.cmd(act.setHighlight, tree.graphicID, 0);
            } else {
                if (tree.data > value) {
                    this.cmd(act.setText, 0, "Searching for " + value + " : " + value + " < " + tree.data + " (look to left subtree)");
                    this.cmd(act.step);
                    this.cmd(act.setHighlight, tree.graphicID, 0);
                    this.highlightHelper(tree, tree.left)
                    this.doFind(tree.left, value);
                } else {
                    this.cmd(act.setText, 0, " Searching for " + value + " : " + value + " > " + tree.data + " (look to right subtree)");
                    this.cmd(act.step);
                    this.cmd(act.setHighlight, tree.graphicID, 0);
                    this.highlightHelper(tree, tree.right);
                    this.doFind(tree.right, value);
                }
            }

        } else {
            this.cmd(act.setText, 0, ' Searching for ' + value + ' : < Empty Tree > (Element not found)');
            this.cmd(act.step);
            this.cmd(act.setText, 0, ' Searching for ' + value + ' :  (Element not found)');
        }
    }


    findUncle(tree) {
        if (tree.parent == null) {
            return null;
        }
        const par = tree.parent;
        if (par.parent == null) {
            return null;
        }
        const grandPar = par.parent;

        if (grandPar.left === par) {
            return grandPar.right;
        } else {
            return grandPar.left;
        }
    }


    blackLevel(tree) {
        if (tree == null) {
            return 1;
        } else {
            return tree.blackLevel;
        }
    }


    insertElement(insertedValue) {
        this.commands = [];
        this.cmd(act.setText, 0, " Inserting " + insertedValue);
        this.highlightID = this.nextIndex++;
        let treeNodeID;
        if (this.treeRoot == null) {
            treeNodeID = this.nextIndex++;
            this.cmd(act.createCircle, treeNodeID, insertedValue, this.startingX, RedBlack.STARTING_Y);
            this.colorBlack(treeNodeID);
            this.treeRoot = new RedBlackNode(insertedValue, treeNodeID, this.startingX, RedBlack.STARTING_Y);
            this.treeRoot.blackLevel = 1;

            this.attachNullLeaves(this.treeRoot);
            this.resizeTree();

        } else {
            treeNodeID = this.nextIndex++;

            this.cmd(act.createCircle, treeNodeID, insertedValue, 30, RedBlack.STARTING_Y);
            this.colorRed(treeNodeID);
            this.cmd(act.step);
            const insertElem = new RedBlackNode(insertedValue, treeNodeID, 100, 100)

            this.cmd(act.setHighlight, insertElem.graphicID, 1);
            insertElem.height = 1;
            this.insert(insertElem, this.treeRoot);
        }
        this.cmd(act.setText, 0, " ");
        return this.commands;
    }


    singleRotateRight(tree) {
        const B = tree;
        const A = tree.left;
        const t2 = A.right;

        this.cmd(act.setText, 0, "Single Rotate Right");
        this.cmd(act.setEdgeHighlight, B.graphicID, A.graphicID, 1);
        this.cmd(act.step);

        if (t2 != null) {
            this.cmd(act.disconnect, A.graphicID, t2.graphicID);
            this.cmd(act.connect, B.graphicID, t2.graphicID, RedBlack.LINK_COLOR);
            t2.parent = B;
        }
        this.cmd(act.disconnect, B.graphicID, A.graphicID);
        this.cmd(act.connect, A.graphicID, B.graphicID, RedBlack.LINK_COLOR);

        A.parent = B.parent;
        if (this.treeRoot === B) {
            this.treeRoot = A;
        } else {
            this.cmd(act.disconnect, B.parent.graphicID, B.graphicID, RedBlack.LINK_COLOR);
            this.cmd(act.connect, B.parent.graphicID, A.graphicID, RedBlack.LINK_COLOR)
            if (B.isLeftChild()) {
                B.parent.left = A;
            } else {
                B.parent.right = A;
            }
        }
        A.right = B;
        B.parent = A;
        B.left = t2;
        this.resetHeight(B);
        this.resetHeight(A);
        this.resizeTree();
        return A;
    }


    singleRotateLeft(tree) {
        const A = tree;
        const B = tree.right;
        const t2 = B.left;

        this.cmd(act.setText, 0, "Single Rotate Left");
        this.cmd(act.setEdgeHighlight, A.graphicID, B.graphicID, 1);
        this.cmd(act.step);

        if (t2 != null) {
            this.cmd(act.disconnect, B.graphicID, t2.graphicID);
            this.cmd(act.connect, A.graphicID, t2.graphicID, RedBlack.LINK_COLOR);
            t2.parent = A;
        }
        this.cmd(act.disconnect, A.graphicID, B.graphicID);
        this.cmd(act.connect, B.graphicID, A.graphicID, RedBlack.LINK_COLOR);
        B.parent = A.parent;
        if (this.treeRoot === A) {
            this.treeRoot = B;
        } else {
            this.cmd(act.disconnect, A.parent.graphicID, A.graphicID, RedBlack.LINK_COLOR);
            this.cmd(act.connect, A.parent.graphicID, B.graphicID, RedBlack.LINK_COLOR)

            if (A.isLeftChild()) {
                A.parent.left = B;
            } else {
                A.parent.right = B;
            }
        }
        B.left = A;
        A.parent = B;
        A.right = t2;
        this.resetHeight(A);
        this.resetHeight(B);

        this.resizeTree();
        return B;
    }


    getHeight(tree) {
        if (tree == null) {
            return 0;
        }
        return tree.height;
    }


    resetHeight(tree) {
        if (tree != null) {
            const newHeight = Math.max(this.getHeight(tree.left), this.getHeight(tree.right)) + 1;
            if (tree.height !== newHeight) {
                tree.height = Math.max(this.getHeight(tree.left), this.getHeight(tree.right)) + 1
            }
        }
    }


    insert(elem, tree) {
        this.cmd(act.setHighlight, tree.graphicID, 1);
        this.cmd(act.setHighlight, elem.graphicID, 1);

        if (elem.data < tree.data) {
            this.cmd(act.setText, 0, elem.data + " < " + tree.data + ".  Looking at left subtree");
        } else {
            this.cmd(act.setText, 0, elem.data + " >= " + tree.data + ".  Looking at right subtree");
        }
        this.cmd(act.step);
        this.cmd(act.setHighlight, tree.graphicID, 0);
        this.cmd(act.setHighlight, elem.graphicID, 0);

        if (elem.data < tree.data) {
            if (tree.left == null || tree.left.phantomLeaf) {
                this.cmd(act.setText, 0, "Found null tree (or phantom leaf), inserting element");
                if (tree.left !== null) {
                    this.cmd(act.delete, tree.left.graphicID);
                }
                this.cmd(act.setHighlight, elem.graphicID, 0);
                tree.left = elem;
                elem.parent = tree;
                this.cmd(act.connect, tree.graphicID, elem.graphicID, RedBlack.LINK_COLOR);

                this.attachNullLeaves(elem);
                this.resizeTree();

                this.fixDoubleRed(elem);

            } else {
                this.highlightHelper(tree, tree.left)
                this.insert(elem, tree.left);

            }
        } else {
            if (tree.right == null || tree.right.phantomLeaf) {
                this.cmd(act.setText, 0, "Found null tree (or phantom leaf), inserting element");
                if (tree.right != null) {
                    this.cmd(act.delete, tree.right.graphicID);
                }

                this.cmd(act.setHighlight, elem.graphicID, 0);
                tree.right = elem;
                elem.parent = tree;
                this.cmd(act.connect, tree.graphicID, elem.graphicID, RedBlack.LINK_COLOR);
                elem.x = tree.x + RedBlack.WIDTH_DELTA / 2;
                elem.y = tree.y + RedBlack.HEIGHT_DELTA
                this.cmd(act.move, elem.graphicID, elem.x, elem.y);


                this.attachNullLeaves(elem);
                this.resizeTree();


                this.resizeTree();
                this.fixDoubleRed(elem);
            } else {
                this.highlightHelper(tree, tree.right)
                this.insert(elem, tree.right);
            }
        }
    }


    fixDoubleRed(tree) {
        if (tree.parent != null) {
            if (tree.parent.blackLevel > 0) {
                return;
            }
            if (tree.parent.parent == null) {
                this.cmd(act.setText, 0, "Tree root is red, color it black.");
                this.cmd(act.step);
                tree.parent.blackLevel = 1;
                this.colorBlack(tree.parent.graphicID);
                return;
            }
            const uncle = this.findUncle(tree);
            if (this.blackLevel(uncle) === 0) {
                this.cmd(act.setText, 0, "Node and parent are both red.  Uncle of node is red -- push blackness down from grandparent");
                this.cmd(act.step);

                this.colorBlack(uncle.graphicID);
                uncle.blackLevel = 1;

                tree.parent.blackLevel = 1;
                this.colorBlack(tree.parent.graphicID);

                tree.parent.parent.blackLevel = 0;
                this.colorRed(tree.parent.parent.graphicID);

                this.cmd(act.step);
                this.fixDoubleRed(tree.parent.parent);
            } else {
                if (tree.isLeftChild() && !tree.parent.isLeftChild()) {
                    this.cmd(act.setText, 0, "Node and parent are both red.  Node is left child, parent is right child -- rotate");
                    this.cmd(act.step);

                    this.singleRotateRight(tree.parent);
                    tree = tree.right;

                } else if (!tree.isLeftChild() && tree.parent.isLeftChild()) {
                    this.cmd(act.setText, 0, "Node and parent are both red.  Node is right child, parent is left child -- rotate");
                    this.cmd(act.step);

                    this.singleRotateLeft(tree.parent);
                    tree = tree.left;
                }

                if (tree.isLeftChild()) {
                    this.cmd(act.setText, 0, "Node and parent are both red.  Node is left child, parent is left child\nCan fix extra redness with a single rotation");
                    this.cmd(act.step);

                    this.singleRotateRight(tree.parent.parent);
                    tree.parent.blackLevel = 1;
                    this.colorBlack(tree.parent.graphicID);

                    tree.parent.right.blackLevel = 0;
                    this.colorRed(tree.parent.right.graphicID);

                } else {
                    this.cmd(act.setText, 0, "Node and parent are both red.  Node is right child, parent is right child\nCan fix extra redness with a single rotation");
                    this.cmd(act.step);

                    this.singleRotateLeft(tree.parent.parent);
                    tree.parent.blackLevel = 1;
                    this.colorBlack(tree.parent.graphicID);

                    tree.parent.left.blackLevel = 0;
                    this.colorRed(tree.parent.left.graphicID);
                }
            }

        } else {
            if (tree.blackLevel === 0) {
                this.cmd(act.setText, 0, "Root of the tree is red.  Color it black");
                this.cmd(act.step);

                tree.blackLevel = 1;
                this.colorBlack(tree.graphicID);
            }
        }
    }


    deleteElement(deletedValue) {
        this.commands = [];
        this.cmd(act.setText, 0, "Deleting " + deletedValue);
        this.cmd(act.step);
        this.cmd(act.setText, 0, " ");
        this.highlightID = this.nextIndex++;
        this.treeDelete(this.treeRoot, deletedValue);
        this.cmd(act.setText, 0, " ");
        return this.commands;
    }


    attachNullLeaf(node, side) {
        const treeNodeID = this.nextIndex++;
        this.cmd(act.createCircle, treeNodeID, "NULL", node.x, node.y);
        this.colorBlack(treeNodeID);
        if (side === RedBlack.LEFT) {
            node.left = new RedBlackNode("", treeNodeID, this.startingX, RedBlack.STARTING_Y);
            node.left.phantomLeaf = true;
            node.left.blackLevel = 1;
        } else {
            node.right = new RedBlackNode("", treeNodeID, this.startingX, RedBlack.STARTING_Y);
            node.right.phantomLeaf = true;
            node.right.blackLevel = 1;
        }
        this.cmd(act.setLayer, treeNodeID, 1);
        this.cmd(act.connect, node.graphicID, treeNodeID, RedBlack.LINK_COLOR);
    }


    attachNullLeaves(node) {
        this.attachNullLeaf(node, RedBlack.LEFT);
        this.attachNullLeaf(node, RedBlack.RIGHT);
    }


    fixNullLeaf(tree, side) {
        const treeNodeID = this.nextIndex++;
        this.cmd(act.setText, 0, "Coloring 'Null Leaf' double black");

        this.cmd(act.createCircle, treeNodeID, "NULL", tree.x, tree.y);
        this.cmd(act.setForegroundColor, treeNodeID, RedBlack.FOREGROUND_BLACK);
        this.cmd(act.setBackgroundColor, treeNodeID, RedBlack.BACKGROUND_DOUBLE_BLACK);
        const nullLeaf = new RedBlackNode("NULL", treeNodeID, tree.x, tree.x);
        nullLeaf.parent = tree;
        nullLeaf.phantomLeaf = true;
        nullLeaf.blackLevel = 2;

        if (side === RedBlack.LEFT) {
            tree.left = nullLeaf;
        } else {
            tree.right = nullLeaf;
        }

        this.cmd(act.connect, tree.graphicID, nullLeaf.graphicID, RedBlack.LINK_COLOR);

        this.resizeTree();

        this.fixExtraBlackChild(tree, false);

        this.cmd(act.setLayer, nullLeaf.graphicID, 1);
        nullLeaf.blackLevel = 1;
        this.fixNodeColor(nullLeaf);
    }


    fixExtraBlackChild(parentNode, isLeftChild) {
        let sibling;
        let doubleBlackNode;
        if (isLeftChild) {
            sibling = parentNode.right;
            doubleBlackNode = parentNode.left;
        } else {
            sibling = parentNode.left;
            doubleBlackNode = parentNode.right;
        }
        if (this.blackLevel(sibling) > 0 && this.blackLevel(sibling.left) > 0 && this.blackLevel(sibling.right) > 0) {
            this.cmd(act.setText, 0, "Double black node has black sibling and 2 black nephews.  Push up black level");
            this.cmd(act.step);
            sibling.blackLevel = 0;
            this.fixNodeColor(sibling);
            if (doubleBlackNode != null) {
                doubleBlackNode.blackLevel = 1;
                this.fixNodeColor(doubleBlackNode);

            }
            if (parentNode.blackLevel === 0) {
                parentNode.blackLevel = 1;
                this.fixNodeColor(parentNode);
            } else {
                parentNode.blackLevel = 2;
                this.fixNodeColor(parentNode);
                this.cmd(act.setText, 0, "Pushing up black level created another double black node.  Repeating ...");
                this.cmd(act.step);
                this.fixExtraBlack(parentNode);
            }
        } else if (this.blackLevel(sibling) === 0) {
            this.cmd(act.setText, 0, "Double black node has red sibling.  Rotate tree to make sibling black ...");
            this.cmd(act.step);
            if (isLeftChild) {
                const newPar = this.singleRotateLeft(parentNode);
                newPar.blackLevel = 1;
                this.fixNodeColor(newPar);
                newPar.left.blackLevel = 0;
                this.fixNodeColor(newPar.left);
                this.cmd(act.step);
                this.fixExtraBlack(newPar.left.left);

            } else {
                const newPar = this.singleRotateRight(parentNode);
                newPar.blackLevel = 1;
                this.fixNodeColor(newPar);
                newPar.right.blackLevel = 0;
                this.fixNodeColor(newPar.right);
                this.cmd(act.step);

                this.fixExtraBlack(newPar.right.right);
            }
        } else if (isLeftChild && this.blackLevel(sibling.right) > 0) {
            this.cmd(act.setText, 0, "Double black node has black sibling, but double black node is a left child, \nand the right nephew is black.  Rotate tree to make opposite nephew red ...");
            this.cmd(act.step);

            const newSib = this.singleRotateRight(sibling);
            newSib.blackLevel = 1;
            this.fixNodeColor(newSib);
            newSib.right.blackLevel = 0;
            this.fixNodeColor(newSib.right);
            this.cmd(act.step);
            this.fixExtraBlackChild(parentNode, isLeftChild);
        } else if (!isLeftChild && this.blackLevel(sibling.left) > 0) {
            this.cmd(act.setText, 0, "Double black node has black sibling, but double black node is a right child, \nand the left nephew is black.  Rotate tree to make opposite nephew red ...");
            this.cmd(act.step);
            const newSib = this.singleRotateLeft(sibling);
            newSib.blackLevel = 1;
            this.fixNodeColor(newSib);
            newSib.left.blackLevel = 0;
            this.fixNodeColor(newSib.left);
            this.cmd(act.step);
            this.fixExtraBlackChild(parentNode, isLeftChild);
        } else if (isLeftChild) {
            this.cmd(act.setText, 0, "Double black node has black sibling, is a left child, and its right nephew is red.\nOne rotation can fix double-blackness.");
            this.cmd(act.step);

            const oldParBlackLevel = parentNode.blackLevel;
            const newPar = this.singleRotateLeft(parentNode);
            this.fixParentNodeColor(oldParBlackLevel, newPar, newPar.left, newPar.left.left);
        } else {
            this.cmd(act.setText, 0, "Double black node has black sibling, is a right child, and its left nephew is red.\nOne rotation can fix double-blackness.");
            this.cmd(act.step);

            const oldParBlackLevel = parentNode.blackLevel;
            const newPar = this.singleRotateRight(parentNode);
            this.fixParentNodeColor(oldParBlackLevel, newPar, newPar.right, newPar.right.right);
        }
    }


    fixParentNodeColor(oldParBlackLevel, newPar, newParSub, newParSubSub) {
        if (oldParBlackLevel === 0) {
            newPar.blackLevel = 0;
            this.fixNodeColor(newPar);
            newParSub.blackLevel = 1;
            this.fixNodeColor(newPar.right);
        }
        newPar.left.blackLevel = 1;
        this.fixNodeColor(newPar.left);
        if (newParSubSub != null) {
            newParSubSub.blackLevel = 1;
            this.fixNodeColor(newParSubSub);
        }
    }


    fixExtraBlack(tree) {
        if (tree.blackLevel > 1) {
            if (tree.parent == null) {
                this.cmd(act.setText, 0, "Double black node is root. Make it single black.");
                this.cmd(act.step);

                tree.blackLevel = 1;
                this.cmd(act.setBackgroundColor, tree.graphicID, RedBlack.BACKGROUND_BLACK);
            } else if (tree.parent.left === tree) {
                this.fixExtraBlackChild(tree.parent, true);
            } else {
                this.fixExtraBlackChild(tree.parent, false);
            }
        }
    }


    treeDelete(tree, valueToDelete) {
        let left_child = false;
        if (tree != null && !tree.phantomLeaf) {
            if (tree.parent != null) {
                left_child = tree.parent.left === tree;
            }
            this.cmd(act.setHighlight, tree.graphicID, 1);
            if (valueToDelete < tree.data) {
                this.cmd(act.setText, 0, valueToDelete + " < " + tree.data + ".  Looking at left subtree");
            } else if (valueToDelete > tree.data) {
                this.cmd(act.setText, 0, valueToDelete + " > " + tree.data + ".  Looking at right subtree");
            } else {
                this.cmd(act.setText, 0, valueToDelete + " == " + tree.data + ".  Found node to delete");
            }
            this.cmd(act.step);
            this.cmd(act.setHighlight, tree.graphicID, 0);

            if (valueToDelete === tree.data) {
                let needsFix = tree.blackLevel > 0;
                if (((tree.left == null) || tree.left.phantomLeaf) && ((tree.right == null) || tree.right.phantomLeaf)) {
                    this.cmd(act.setText, 0, "Node to delete is a leaf.  Delete it.");
                    this.cmd(act.delete, tree.graphicID);

                    if (tree.left != null) {
                        this.cmd(act.delete, tree.left.graphicID);
                    }
                    if (tree.right != null) {
                        this.cmd(act.delete, tree.right.graphicID);
                    }


                    if (left_child && tree.parent != null) {
                        tree.parent.left = null;
                        this.resizeTree();

                        if (needsFix) {
                            this.fixNullLeaf(tree.parent, RedBlack.LEFT);
                        } else {

                            this.attachNullLeaf(tree.parent, RedBlack.LEFT);
                            this.resizeTree();
                        }
                    } else if (tree.parent != null) {
                        tree.parent.right = null;
                        this.resizeTree();
                        if (needsFix) {
                            this.fixNullLeaf(tree.parent, RedBlack.RIGHT);
                        } else {
                            this.attachNullLeaf(tree.parent, RedBlack.RIGHT);
                            this.resizeTree();
                        }
                    } else {
                        this.treeRoot = null;
                    }

                } else if (tree.left == null || tree.left.phantomLeaf) {
                    this.cmd(act.setText, 0, "Node to delete has no left child.  \nSet parent of deleted node to right child of deleted node.");
                    if (tree.left != null) {
                        this.cmd(act.delete, tree.left.graphicID);
                        tree.left = null;
                    }

                    if (tree.parent != null) {
                        this.cmd(act.disconnect, tree.parent.graphicID, tree.graphicID);
                        this.cmd(act.connect, tree.parent.graphicID, tree.right.graphicID, RedBlack.LINK_COLOR);
                        this.cmd(act.step);
                        this.cmd(act.delete, tree.graphicID);
                        if (left_child) {
                            tree.parent.left = tree.right;
                            if (needsFix) {
                                this.cmd(act.setText, 0, "Back node removed.  Increasing child's blackness level");
                                tree.parent.left.blackLevel++;
                                this.fixNodeColor(tree.parent.left);
                                this.fixExtraBlack(tree.parent.left);
                            }
                        } else {
                            tree.parent.right = tree.right;
                            if (needsFix) {
                                tree.parent.right.blackLevel++;
                                this.cmd(act.setText, 0, "Back node removed.  Increasing child's blackness level");
                                this.fixNodeColor(tree.parent.right);
                                this.fixExtraBlack(tree.parent.right);
                            }

                        }
                        tree.right.parent = tree.parent;
                    } else {
                        this.cmd(act.delete, tree.graphicID);
                        this.treeRoot = tree.right;
                        this.treeRoot.parent = null;
                        if (this.treeRoot.blackLevel === 0) {
                            this.treeRoot.blackLevel = 1;
                            this.colorBlack(this.treeRoot.graphicID);
                        }
                    }
                    this.resizeTree();
                } else if (tree.right == null || tree.right.phantomLeaf) {
                    this.cmd(act.setText, 0, "Node to delete has no right child.  \nSet parent of deleted node to left child of deleted node.");
                    if (tree.right != null) {
                        this.cmd(act.delete, tree.right.graphicID);
                        tree.right = null;
                    }
                    if (tree.parent != null) {
                        this.cmd(act.disconnect, tree.parent.graphicID, tree.graphicID);
                        this.cmd(act.connect, tree.parent.graphicID, tree.left.graphicID, RedBlack.LINK_COLOR);
                        this.cmd(act.step);
                        this.cmd(act.delete, tree.graphicID);

                        if (left_child && needsFix) {
                            tree.parent.left = tree.left;
                            tree.parent.left.blackLevel++;
                            this.fixNodeColor(tree.parent.left);
                            this.fixExtraBlack(tree.parent.left);
                            this.resizeTree();
                        } else if (!left_child && needsFix) {
                            tree.parent.right = tree.left;
                            tree.parent.right.blackLevel++;
                            this.fixNodeColor(tree.parent.right);
                            this.fixExtraBlack(tree.parent.left);
                            this.resizeTree();
                        } else {
                            this.cmd(act.setText, 0, "Deleted node was red.  No tree rotations required.");
                            this.resizeTree();
                        }
                        tree.left.parent = tree.parent;
                    } else {
                        this.cmd(act.delete, tree.graphicID);
                        this.treeRoot = tree.left;
                        this.treeRoot.parent = null;
                        if (this.treeRoot.blackLevel === 0) {
                            this.treeRoot.blackLevel = 1;
                            this.fixNodeColor(this.treeRoot);
                        }
                    }
                } else {
                    this.cmd(act.setText, 0, "Node to delete has two children.  \nFind largest node in left subtree.");

                    this.highlightID = this.nextIndex;
                    this.nextIndex += 1;
                    this.cmd(act.createHighlightCircle, this.highlightID, RedBlack.HIGHLIGHT_COLOR, tree.x, tree.y);
                    let tmp = tree.left;
                    this.cmd(act.move, this.highlightID, tmp.x, tmp.y);
                    this.cmd(act.step);
                    while (tmp.right != null && !tmp.right.phantomLeaf) {
                        tmp = tmp.right;
                        this.cmd(act.move, this.highlightID, tmp.x, tmp.y);
                        this.cmd(act.step);
                    }
                    if (tmp.right != null) {
                        this.cmd(act.delete, tmp.right.graphicID);
                        tmp.right = null;
                    }
                    this.cmd(act.setText, tree.graphicID, " ");
                    const labelID = this.nextIndex;
                    this.nextIndex += 1;
                    this.cmd(act.createLabel, labelID, tmp.data, tmp.x, tmp.y);
                    this.cmd(act.setForegroundColor, labelID, RedBlack.BLUE);
                    tree.data = tmp.data;
                    this.cmd(act.move, labelID, tree.x, tree.y);
                    this.cmd(act.setText, 0, "Copy largest value of left subtree into node to delete.");

                    this.cmd(act.step);
                    this.cmd(act.setHighlight, tree.graphicID, 0);
                    this.cmd(act.delete, labelID);
                    this.cmd(act.setText, tree.graphicID, tree.data);
                    this.cmd(act.delete, this.highlightID);
                    this.cmd(act.setText, 0, "Remove node whose value we copied.");

                    needsFix = tmp.blackLevel > 0;


                    if (tmp.left == null) {
                        this.cmd(act.delete, tmp.graphicID);
                        if (tmp.parent !== tree) {
                            tmp.parent.right = null;
                            this.resizeTree();
                            if (needsFix) {
                                this.fixNullLeaf(tmp.parent, RedBlack.RIGHT);
                            } else {
                                this.cmd(act.setText, 0, "Deleted node was red.  No tree rotations required.");
                                this.cmd(act.step);
                            }
                        } else {
                            tree.left = null;
                            this.resizeTree();
                            if (needsFix) {
                                this.fixNullLeaf(tmp.parent, RedBlack.LEFT);
                            } else {
                                this.cmd(act.setText, 0, "Deleted node was red.  No tree rotations required.");
                                this.cmd(act.step);
                            }
                        }
                    } else {
                        this.cmd(act.disconnect, tmp.parent.graphicID, tmp.graphicID);
                        this.cmd(act.connect, tmp.parent.graphicID, tmp.left.graphicID, RedBlack.LINK_COLOR);
                        this.cmd(act.step);
                        this.cmd(act.delete, tmp.graphicID);

                        if (tmp.parent !== tree) {
                            tmp.parent.right = tmp.left;
                            tmp.left.parent = tmp.parent;
                            this.resizeTree();

                            this.deleteRotationHelper(needsFix, tmp);
                        } else {
                            tree.left = tmp.left;
                            tmp.left.parent = tree;
                            this.resizeTree();
                            this.deleteRotationHelper(needsFix, tmp);
                        }
                    }

                }
            } else if (valueToDelete < tree.data) {
                this.highlightHelper(tree, tree.left)
                this.treeDelete(tree.left, valueToDelete);
            } else {
                this.highlightHelper(tree, tree.right)
                this.treeDelete(tree.right, valueToDelete);
            }
        } else {
            this.cmd(act.setText, 0, "Element " + valueToDelete + " not found, could not delete");
        }
    }


    deleteRotationHelper(needFix, tmp) {
        if (needFix) {
            this.cmd(act.setText, 0, "Coloring child of deleted node black");
            this.cmd(act.step);
            tmp.left.blackLevel++;
            if (tmp.left.phantomLeaf) {
                this.cmd(act.setLayer, tmp.left.graphicID, 0);
            }
            this.fixNodeColor(tmp.left);
            this.fixExtraBlack(tmp.left);
            if (tmp.left.phantomLeaf) {
                this.cmd(act.setLayer, tmp.left.graphicID, 1);
            }

        } else {
            this.cmd(act.setText, 0, "Deleted node was red.  No tree rotations required.");
            this.cmd(act.step);
        }
    }


    fixNodeColor(tree) {
        if (tree.blackLevel === 0) {
            this.colorRed(tree.graphicID);
        } else {
            this.cmd(act.setForegroundColor, tree.graphicID, RedBlack.FOREGROUND_BLACK);
            if (tree.blackLevel > 1) {
                this.cmd(act.setBackgroundColor, tree.graphicID, RedBlack.BACKGROUND_DOUBLE_BLACK);
            } else {
                this.cmd(act.setBackgroundColor, tree.graphicID, RedBlack.BACKGROUND_BLACK);
            }
        }
    }


    colorBlack(graphicID) {
        this.cmd(act.setForegroundColor, graphicID, RedBlack.FOREGROUND_BLACK);
        this.cmd(act.setBackgroundColor, graphicID, RedBlack.BACKGROUND_BLACK);
    }


    colorRed(graphicID) {
        this.cmd(act.setForegroundColor, graphicID, RedBlack.FOREGROUND_RED);
        this.cmd(act.setBackgroundColor, graphicID, RedBlack.BACKGROUND_RED);
    }


    highlightHelper(tree, subtree) {
        if (subtree != null) {
            this.cmd(act.createHighlightCircle, this.highlightID, RedBlack.HIGHLIGHT_COLOR, tree.x, tree.y);
            this.cmd(act.move, this.highlightID, subtree.x, subtree.y);
            this.cmd(act.step);
            this.cmd(act.delete, this.highlightID);
        }
    }


    resizeTree() {
        let startingPoint = this.startingX;
        this.resizeWidths(this.treeRoot);
        if (this.treeRoot != null) {
            if (this.treeRoot.leftWidth > startingPoint) {
                startingPoint = this.treeRoot.leftWidth;
            } else if (this.treeRoot.rightWidth > startingPoint) {
                startingPoint = Math.max(this.treeRoot.leftWidth, 2 * startingPoint - this.treeRoot.rightWidth);
            }
            this.setNewPositions(this.treeRoot, startingPoint, RedBlack.STARTING_Y, 0);
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
            } else if (side === 1) {
                xPosition = xPosition + tree.leftWidth;
                tree.heightLabelX = xPosition + 20;
            } else {
                tree.heightLabelX = xPosition - 20;
            }
            tree.x = xPosition;
            tree.heightLabelY = tree.y - 20;
            this.setNewPositions(tree.left, xPosition, yPosition + RedBlack.HEIGHT_DELTA, -1)
            this.setNewPositions(tree.right, xPosition, yPosition + RedBlack.HEIGHT_DELTA, 1)
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
        tree.leftWidth = Math.max(this.resizeWidths(tree.left), RedBlack.WIDTH_DELTA / 2);
        tree.rightWidth = Math.max(this.resizeWidths(tree.right), RedBlack.WIDTH_DELTA / 2);
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

function RedBlackNode(val, id, initialX, initialY) {
    this.data = val;
    this.x = initialX;
    this.y = initialY;
    this.blackLevel = 0;
    this.phantomLeaf = false;
    this.graphicID = id;
    this.left = null;
    this.right = null;
    this.parent = null;
    this.height = 0;
    this.leftWidth = 0;
    this.rightWidth = 0;
}

RedBlackNode.prototype.isLeftChild = function () {
    if (this.parent == null) {
        return true;
    }
    return this.parent.left === this;
}


// Various constants
RedBlack.FIRST_PRINT_POS_X = 50;
RedBlack.PRINT_VERTICAL_GAP = 20;
RedBlack.PRINT_HORIZONTAL_GAP = 50;
RedBlack.FOREGROUND_RED = "#AA0000";
RedBlack.BACKGROUND_RED = "#FFAAAA";
RedBlack.FOREGROUND_BLACK = "#000000"
RedBlack.BACKGROUND_BLACK = "#AAAAAA";
RedBlack.BACKGROUND_DOUBLE_BLACK = "#777777";


RedBlack.HIGHLIGHT_LABEL_COLOR = "#FF0000"
RedBlack.HIGHLIGHT_LINK_COLOR = "#FF0000"

RedBlack.BLUE = "#0000FF";
RedBlack.LINK_COLOR = "#000000"
RedBlack.BACKGROUND_COLOR = RedBlack.BACKGROUND_BLACK;
RedBlack.HIGHLIGHT_COLOR = "#007700";
RedBlack.FOREGROUND_COLOR = RedBlack.FOREGROUND_BLACK;
RedBlack.PRINT_COLOR = RedBlack.FOREGROUND_COLOR
RedBlack.WIDTH_DELTA = 50;
RedBlack.HEIGHT_DELTA = 50;
RedBlack.STARTING_Y = 50;
RedBlack.RIGHT = 'right';
RedBlack.LEFT = 'left';

RedBlack.FIRST_PRINT_POS_X = 40;
RedBlack.PRINT_VERTICAL_GAP = 20;
RedBlack.PRINT_HORIZONTAL_GAP = 50;
RedBlack.EXPLANITORY_TEXT_X = 10;
RedBlack.EXPLANITORY_TEXT_Y = 10;