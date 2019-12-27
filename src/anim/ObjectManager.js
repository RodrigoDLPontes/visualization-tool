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


// Object Manager
//
// Manage all of our animated objects.  Control any animated object should occur through
// this interface (not language enforced, because enforcing such things in Javascript is
// problematic.)
//
// This class is only accessed through:
//
//  AnimationMain
//  Undo objects (which are themselves controlled by AnimationMain)

import AnimatedBTreeNode from './AnimatedBTreeNode';
import AnimatedCircle from './AnimatedCircle';
import AnimatedCircularlyLinkedListNode from './AnimatedCircularlyLinkedListNode';
import AnimatedDoublyLinkedListNode from './AnimatedDoublyLinkedListNode';
import AnimatedHighlightCircle from './AnimatedHighlightCircle';
import AnimatedLabel from './AnimatedLabel';
import AnimatedLine from './AnimatedLine';
import AnimatedLinkedListNode from './AnimatedLinkedListNode';
import AnimatedRectangle from './AnimatedRectangle';
import AnimatedSkipListNode from './AnimatedSkipListNode';

export default class ObjectManager {
	constructor(canvasRef) {
		this.Nodes = [];
		this.Edges = [];
		this.BackEdges = [];
		this.activeLayers = [];
		this.activeLayers[0] = true;
		this.ctx = canvasRef.current.getContext('2d');
		this.framenum = 0;
		this.width = 0;
		this.height = 0;
		this.statusReport = new AnimatedLabel(-1, 'XXX', false, 30);
		this.statusReport.x = 30;
	}

	draw() {
		this.framenum++;
		if (this.framenum > 1000) this.framenum = 0;

		this.ctx.clearRect(0, 0, this.width, this.height); // clear canvas
		this.statusReport.y = this.height - 15;

		let i;
		let j;
		for (i = 0; i < this.Nodes.length; i++) {
			if (
				this.Nodes[i] != null &&
				!this.Nodes[i].highlighted &&
				this.Nodes[i].addedToScene &&
				!this.Nodes[i].alwaysOnTop
			) {
				this.Nodes[i].draw(this.ctx);
			}
		}
		for (i = 0; i < this.Nodes.length; i++) {
			if (
				this.Nodes[i] != null &&
				this.Nodes[i].highlighted &&
				!this.Nodes[i].alwaysOnTop &&
				this.Nodes[i].addedToScene
			) {
				this.Nodes[i].pulseHighlight(this.framenum);
				this.Nodes[i].draw(this.ctx);
			}
		}

		for (i = 0; i < this.Nodes.length; i++) {
			if (this.Nodes[i] != null && this.Nodes[i].alwaysOnTop && this.Nodes[i].addedToScene) {
				this.Nodes[i].pulseHighlight(this.framenum);
				this.Nodes[i].draw(this.ctx);
			}
		}

		for (i = 0; i < this.Edges.length; i++) {
			if (this.Edges[i] != null) {
				for (j = 0; j < this.Edges[i].length; j++) {
					if (this.Edges[i][j].addedToScene) {
						this.Edges[i][j].pulseHighlight(this.framenum);
						this.Edges[i][j].draw(this.ctx);
					}
				}
			}
		}
		this.statusReport.draw(this.ctx);
	}

	update() {}

	setLayers(shown, layers) {
		for (let i = 0; i < layers.length; i++) {
			this.activeLayers[layers[i]] = shown;
		}
		this.resetLayers();
	}

	addHighlightCircleObject(objectID, objectColor, radius) {
		if (this.Nodes[objectID] != null && this.Nodes[objectID] !== undefined) {
			throw new Error(
				'addHighlightCircleObject:Object with same ID (' +
					String(objectID) +
					') already Exists!'
			);
		}
		const newNode = new AnimatedHighlightCircle(objectID, objectColor, radius);
		this.Nodes[objectID] = newNode;
	}

	setEdgeAlpha(fromID, toID, alphaVal) {
		let oldAlpha = 1.0;
		if (this.Edges[fromID] != null && this.Edges[fromID] !== undefined) {
			const len = this.Edges[fromID].length;
			for (let i = len - 1; i >= 0; i--) {
				if (
					this.Edges[fromID][i] != null &&
					this.Edges[fromID][i] !== undefined &&
					this.Edges[fromID][i].toID === this.Nodes[toID]
				) {
					oldAlpha = this.Edges[fromID][i].alpha;
					this.Edges[fromID][i].alpha = alphaVal;
				}
			}
		}
		return oldAlpha;
	}

	setAlpha(nodeID, alphaVal) {
		if (this.Nodes[nodeID] != null && this.Nodes[nodeID] !== undefined) {
			this.Nodes[nodeID].setAlpha(alphaVal);
		}
	}

	getAlpha(nodeID) {
		if (this.Nodes[nodeID] != null && this.Nodes[nodeID] !== undefined) {
			return this.Nodes[nodeID].getAlpha();
		} else {
			return -1;
		}
	}

	getTextColor(nodeID, index) {
		if (this.Nodes[nodeID] != null && this.Nodes[nodeID] !== undefined) {
			return this.Nodes[nodeID].getTextColor(index);
		} else {
			return '#000000';
		}
	}

	setTextColor(nodeID, color, index) {
		if (this.Nodes[nodeID] != null && this.Nodes[nodeID] !== undefined) {
			this.Nodes[nodeID].setTextColor(color, index);
		}
	}

	setHighlightIndex(nodeID, index) {
		if (this.Nodes[nodeID] != null && this.Nodes[nodeID] !== undefined) {
			this.Nodes[nodeID].setHighlightIndex(index);
		}
	}

	setAllLayers(layers) {
		this.activeLayers = [];
		for (let i = 0; i < layers.length; i++) {
			this.activeLayers[layers[i]] = true;
		}
		this.resetLayers();
	}

	resetLayers() {
		let i;
		for (i = 0; i < this.Nodes.length; i++) {
			if (this.Nodes[i] != null && this.Nodes[i] !== undefined) {
				this.Nodes[i].addedToScene = this.activeLayers[this.Nodes[i].layer] === true;
			}
		}
		for (i = this.Edges.length - 1; i >= 0; i--) {
			if (this.Edges[i] != null && this.Edges[i] !== undefined) {
				for (let j = 0; j < this.Edges[i].length; j++) {
					if (this.Edges[i][j] != null && this.Edges[i][j] !== undefined) {
						this.Edges[i][j].addedToScene =
							this.activeLayers[this.Edges[i][j].fromID.layer] === true &&
							this.activeLayers[this.Edges[i][j].toID.layer] === true;
					}
				}
			}
		}
	}

	setLayer(objectID, layer) {
		if (this.Nodes[objectID] != null && this.Nodes[objectID] !== undefined) {
			this.Nodes[objectID].layer = layer;
			if (this.activeLayers[layer]) {
				this.Nodes[objectID].addedToScene = true;
			} else {
				this.Nodes[objectID].addedToScene = false;
			}
			if (this.Edges[objectID] != null && this.Edges[objectID] !== undefined) {
				for (let i = 0; i < this.Edges[objectID].length; i++) {
					const nextEdge = this.Edges[objectID][i];
					if (nextEdge != null && nextEdge !== undefined) {
						nextEdge.addedToScene =
							nextEdge.fromID.addedToScene && nextEdge.toID.addedToScene;
					}
				}
			}
			if (this.BackEdges[objectID] != null && this.BackEdges[objectID] !== undefined) {
				for (let i = 0; i < this.BackEdges[objectID].length; i++) {
					const nextEdge = this.BackEdges[objectID][i];
					if (nextEdge != null && nextEdge !== undefined) {
						nextEdge.addedToScene =
							nextEdge.fromID.addedToScene && nextEdge.toID.addedToScene;
					}
				}
			}
		}
	}

	clearAllObjects() {
		this.Nodes = [];
		this.Edges = [];
		this.BackEdges = [];
	}

	setForegroundColor(objectID, color) {
		if (this.Nodes[objectID] != null && this.Nodes[objectID] !== undefined) {
			this.Nodes[objectID].setForegroundColor(color);
		}
	}

	setBackgroundColor(objectID, color) {
		if (this.Nodes[objectID] != null) {
			this.Nodes[objectID].setBackgroundColor(color);
		}
	}

	setHighlight(nodeID, val, color) {
		if (this.Nodes[nodeID] == null || this.Nodes[nodeID] === undefined) {
			// TODO:  Error here?
			return;
		}
		this.Nodes[nodeID].setHighlight(val, color);
	}

	getHighlight(nodeID) {
		if (this.Nodes[nodeID] == null || this.Nodes[nodeID] === undefined) {
			// TODO:  Error here?
			return false;
		}
		return this.Nodes[nodeID].getHighlight();
	}

	getHighlightIndex(nodeID) {
		if (this.Nodes[nodeID] == null || this.Nodes[nodeID] === undefined) {
			// TODO:  Error here?
			return false;
		}
		return this.Nodes[nodeID].getHighlightIndex();
	}

	setWidth(nodeID, val) {
		if (this.Nodes[nodeID] == null || this.Nodes[nodeID] === undefined) {
			// TODO:  Error here?
			return;
		}
		this.Nodes[nodeID].setWidth(val);
	}

	setHeight(nodeID, val) {
		if (this.Nodes[nodeID] == null || this.Nodes[nodeID] === undefined) {
			// TODO:  Error here?
			return;
		}
		this.Nodes[nodeID].setHeight(val);
	}

	getHeight(nodeID) {
		if (this.Nodes[nodeID] == null || this.Nodes[nodeID] === undefined) {
			// TODO:  Error here?
			return -1;
		}
		return this.Nodes[nodeID].getHeight();
	}

	getWidth(nodeID) {
		if (this.Nodes[nodeID] == null || this.Nodes[nodeID] === undefined) {
			// TODO:  Error here?
			return -1;
		}
		return this.Nodes[nodeID].getWidth();
	}

	backgroundColor(objectID) {
		if (this.Nodes[objectID] != null) {
			return this.Nodes[objectID].fillColor;
		} else {
			return '#000000';
		}
	}

	foregroundColor(objectID) {
		if (this.Nodes[objectID] != null) {
			return this.Nodes[objectID].edgeColor;
		} else {
			return '#000000';
		}
	}

	disconnect(objectIDfrom, objectIDto) {
		let undo = null;
		let len;
		let deleted;
		if (this.Edges[objectIDfrom] != null) {
			len = this.Edges[objectIDfrom].length;
			for (let i = len - 1; i >= 0; i--) {
				if (
					this.Edges[objectIDfrom][i] != null &&
					this.Edges[objectIDfrom][i].toID === this.Nodes[objectIDto]
				) {
					deleted = this.Edges[objectIDfrom][i];
					undo = deleted.createUndoConnect();
					this.Edges[objectIDfrom][i] = this.Edges[objectIDfrom][len - 1];
					len -= 1;
					this.Edges[objectIDfrom].pop();
				}
			}
		}
		if (this.BackEdges[objectIDto] != null) {
			len = this.BackEdges[objectIDto].length;
			for (let i = len - 1; i >= 0; i--) {
				if (
					this.BackEdges[objectIDto][i] != null &&
					this.BackEdges[objectIDto][i].fromID === this.Nodes[objectIDfrom]
				) {
					deleted = this.BackEdges[objectIDto][i];
					// Note:  Don't need to remove this child, did it above on the regular edge
					this.BackEdges[objectIDto][i] = this.BackEdges[objectIDto][len - 1];
					len -= 1;
					this.BackEdges[objectIDto].pop();
				}
			}
		}
		return undo;
	}

	deleteIncident(objectID) {
		const undoStack = [];
		let len;
		let deleted;
		if (this.Edges[objectID] != null) {
			len = this.Edges[objectID].length;
			for (let i = len - 1; i >= 0; i--) {
				deleted = this.Edges[objectID][i];
				const node2ID = deleted.toID.identifier();
				undoStack.push(deleted.createUndoConnect());

				let len2 = this.BackEdges[node2ID].length;
				for (let j = len2 - 1; j >= 0; j--) {
					if (this.BackEdges[node2ID][j] === deleted) {
						this.BackEdges[node2ID][j] = this.BackEdges[node2ID][len2 - 1];
						len2 -= 1;
						this.BackEdges[node2ID].pop();
					}
				}
			}
			this.Edges[objectID] = null;
		}
		if (this.BackEdges[objectID] != null) {
			len = this.BackEdges[objectID].length;
			for (let i = len - 1; i >= 0; i--) {
				deleted = this.BackEdges[objectID][i];
				const node1ID = deleted.fromID.identifier();
				undoStack.push(deleted.createUndoConnect());

				let len2 = this.Edges[node1ID].length;
				for (let j = len2 - 1; j >= 0; j--) {
					if (this.Edges[node1ID][j] === deleted) {
						this.Edges[node1ID][j] = this.Edges[node1ID][len2 - 1];
						len2 -= 1;
						this.Edges[node1ID].pop();
					}
				}
			}
			this.BackEdges[objectID] = null;
		}
		return undoStack;
	}

	removeObject(ObjectID) {
		const OldObject = this.Nodes[ObjectID];
		if (ObjectID === this.Nodes.length - 1) {
			this.Nodes.pop();
		} else {
			this.Nodes[ObjectID] = null;
		}
		return OldObject;
	}

	getObject(objectID) {
		if (this.Nodes[objectID] == null || this.Nodes[objectID] === undefined) {
			throw new Error('getObject:Object with ID (' + String(objectID) + ') does not exist');
		}
		return this.Nodes[objectID];
	}

	addCircleObject(objectID, objectLabel) {
		if (this.Nodes[objectID] != null && this.Nodes[objectID] !== undefined) {
			throw new Error(
				'addCircleObject:Object with same ID (' + String(objectID) + ') already Exists!'
			);
		}
		const newNode = new AnimatedCircle(objectID, objectLabel);
		this.Nodes[objectID] = newNode;
	}

	getNodeX(nodeID) {
		if (this.Nodes[nodeID] == null || this.Nodes[nodeID] === undefined) {
			throw new Error('getting x position of an object that does not exit');
		}
		return this.Nodes[nodeID].x;
	}

	getTextWidth(text) {
		// TODO:  Need to make fonts more flexible, and less hardwired.
		this.ctx.font = '10px sans-serif';
		const strList = text.split('\n');
		let width = 0;
		if (strList.length === 1) {
			width = this.ctx.measureText(text).width;
		} else {
			for (let i = 0; i < strList.length; i++) {
				width = Math.max(width, this.ctx.measureText(strList[i]).width);
			}
		}

		return width;
	}

	setText(nodeID, text, index) {
		if (this.Nodes[nodeID] == null || this.Nodes[nodeID] === undefined) {
			throw new Error('setting text of an object that does not exist');
		}
		this.Nodes[nodeID].setText(text, index, this.getTextWidth(text));
	}

	getText(nodeID, index) {
		if (this.Nodes[nodeID] == null || this.Nodes[nodeID] === undefined) {
			throw new Error('getting text of an object that does not exit');
		}
		return this.Nodes[nodeID].getText(index);
	}

	getNodeY(nodeID) {
		if (this.Nodes[nodeID] == null || this.Nodes[nodeID] === undefined) {
			throw new Error('getting y position of an object that does not exit');
		}
		return this.Nodes[nodeID].y;
	}

	connectEdge(objectIDfrom, objectIDto, color, curve, directed, lab, connectionPoint) {
		const fromObj = this.Nodes[objectIDfrom];
		const toObj = this.Nodes[objectIDto];
		if (fromObj == null || toObj == null) {
			throw new Error("Tried to connect two nodes, one didn't exist!");
		}
		const l = new AnimatedLine(fromObj, toObj, color, curve, directed, lab, connectionPoint);
		if (this.Edges[objectIDfrom] == null) {
			this.Edges[objectIDfrom] = [];
		}
		if (this.BackEdges[objectIDto] == null) {
			this.BackEdges[objectIDto] = [];
		}
		l.addedToScene = fromObj.addedToScene && toObj.addedToScene;
		this.Edges[objectIDfrom].push(l);
		this.BackEdges[objectIDto].push(l);
	}

	setNull(objectID, nullVal) {
		if (this.Nodes[objectID] != null && this.Nodes[objectID] !== undefined) {
			this.Nodes[objectID].setNull(nullVal);
		}
	}

	setPrevNull(objectID, nullVal) {
		if (this.Nodes[objectID] != null && this.Nodes[objectID] !== undefined) {
			this.Nodes[objectID].setPrevNull(nullVal);
		}
	}

	setNextNull(objectID, nullVal) {
		if (this.Nodes[objectID] != null && this.Nodes[objectID] !== undefined) {
			this.Nodes[objectID].setNextNull(nullVal);
		}
	}

	getNull(objectID) {
		if (this.Nodes[objectID] != null && this.Nodes[objectID] !== undefined) {
			return this.Nodes[objectID].getNull();
		}
		return false; // TODO:  Error here?
	}

	getLeftNull(objectID) {
		if (this.Nodes[objectID] != null && this.Nodes[objectID] !== undefined) {
			return this.Nodes[objectID].getLeftNull();
		}
		return false; // TODO:  Error here?
	}

	getRightNull(objectID) {
		if (this.Nodes[objectID] != null && this.Nodes[objectID] !== undefined) {
			return this.Nodes[objectID].getRightNull();
		}
		return false; // TODO:  Error here?
	}

	setEdgeColor(
		fromID,
		toID,
		color // returns old color
	) {
		let oldColor = '#000000';
		if (this.Edges[fromID] != null && this.Edges[fromID] !== undefined) {
			const len = this.Edges[fromID].length;
			for (let i = len - 1; i >= 0; i--) {
				if (
					this.Edges[fromID][i] != null &&
					this.Edges[fromID][i] !== undefined &&
					this.Edges[fromID][i].toID === this.Nodes[toID]
				) {
					oldColor = this.Edges[fromID][i].color();
					this.Edges[fromID][i].setColor(color);
				}
			}
		}
		return oldColor;
	}

	alignTop(id1, id2) {
		if (
			this.Nodes[id1] == null ||
			this.Nodes[id1] === undefined ||
			this.Nodes[id2] == null ||
			this.Nodes[id2] === undefined
		) {
			throw new Error(
				"Tring to align two nodes, one doesn't exist: " + String(id1) + ',' + String(id2)
			);
		}
		this.Nodes[id1].alignTop(this.Nodes[id2]);
	}

	alignLeft(id1, id2) {
		if (
			this.Nodes[id1] == null ||
			this.Nodes[id1] === undefined ||
			this.Nodes[id2] == null ||
			this.Nodes[id2] === undefined
		) {
			throw new Error(
				"Tring to align two nodes, one doesn't exist: " + String(id1) + ',' + String(id2)
			);
		}
		this.Nodes[id1].alignLeft(this.Nodes[id2]);
	}

	alignRight(id1, id2) {
		if (
			this.Nodes[id1] == null ||
			this.Nodes[id1] === undefined ||
			this.Nodes[id2] == null ||
			this.Nodes[id2] === undefined
		) {
			throw new Error(
				"Tring to align two nodes, one doesn't exist: " + String(id1) + ',' + String(id2)
			);
		}
		this.Nodes[id1].alignRight(this.Nodes[id2]);
	}

	getAlignRightPos(id1, id2) {
		if (
			this.Nodes[id1] == null ||
			this.Nodes[id1] === undefined ||
			this.Nodes[id2] == null ||
			this.Nodes[id2] === undefined
		) {
			throw new Error(
				"Tring to align two nodes, one doesn't exist: " + String(id1) + ',' + String(id2)
			);
		}
		return this.Nodes[id1].getAlignRightPos(this.Nodes[id2]);
	}

	getAlignLeftPos(id1, id2) {
		if (
			this.Nodes[id1] == null ||
			this.Nodes[id1] === undefined ||
			this.Nodes[id2] == null ||
			this.Nodes[id2] === undefined
		) {
			throw new Error(
				"Tring to align two nodes, one doesn't exist: " + String(id1) + ',' + String(id2)
			);
		}
		return this.Nodes[id1].getAlignLeftPos(this.Nodes[id2]);
	}

	alignBottom(id1, id2) {
		if (
			this.Nodes[id1] == null ||
			this.Nodes[id1] === undefined ||
			this.Nodes[id2] == null ||
			this.Nodes[id2] === undefined
		) {
			throw new Error(
				"Tring to align two nodes, one doesn't exist: " + String(id1) + ',' + String(id2)
			);
		}
		this.Nodes[id1].alignBottom(this.Nodes[id2]);
	}

	setEdgeHighlight(
		fromID,
		toID,
		val // returns old color
	) {
		let oldHighlight = false;
		if (this.Edges[fromID] != null && this.Edges[fromID] !== undefined) {
			const len = this.Edges[fromID].length;
			for (let i = len - 1; i >= 0; i--) {
				if (
					this.Edges[fromID][i] != null &&
					this.Edges[fromID][i] !== undefined &&
					this.Edges[fromID][i].toID === this.Nodes[toID]
				) {
					oldHighlight = this.Edges[fromID][i].highlighted;
					this.Edges[fromID][i].setHighlight(val);
				}
			}
		}
		return oldHighlight;
	}

	addLabelObject(objectID, objectLabel, centering) {
		if (this.Nodes[objectID] != null && this.Nodes[objectID] !== undefined) {
			throw new Error('addLabelObject: Object Already Exists!');
		}

		const newLabel = new AnimatedLabel(
			objectID,
			objectLabel,
			centering,
			this.getTextWidth(objectLabel)
		);
		this.Nodes[objectID] = newLabel;
	}

	addLinkedListObject(
		objectID,
		nodeLabel,
		width,
		height,
		linkPer,
		verticalOrientation,
		linkPosEnd,
		backgroundColor,
		foregroundColor
	) {
		if (this.Nodes[objectID] != null) {
			throw new Error('addLinkedListObject:Object with same ID already Exists!');
		}
		const newNode = new AnimatedLinkedListNode(
			objectID,
			nodeLabel,
			width,
			height,
			linkPer,
			verticalOrientation,
			linkPosEnd,
			backgroundColor,
			foregroundColor
		);
		this.Nodes[objectID] = newNode;
	}

	addDoublyLinkedListObject(
		objectID,
		nodeLabel,
		width,
		height,
		linkPer,
		backgroundColor,
		foregroundColor
	) {
		if (this.Nodes[objectID] != null) {
			throw new Error('addDoublyLinkedListObject:Object with same ID already Exists!');
		}
		const newNode = new AnimatedDoublyLinkedListNode(
			objectID,
			nodeLabel,
			width,
			height,
			linkPer,
			backgroundColor,
			foregroundColor
		);
		this.Nodes[objectID] = newNode;
	}

	addCircularlyLinkedListObject(
		objectID,
		nodeLabel,
		width,
		height,
		linkPer,
		backgroundColor,
		foregroundColor
	) {
		if (this.Nodes[objectID] != null) {
			throw new Error('addCircularlyLinkedListObject:Object with same ID already Exists!');
		}
		const newNode = new AnimatedCircularlyLinkedListNode(
			objectID,
			nodeLabel,
			width,
			height,
			linkPer,
			backgroundColor,
			foregroundColor
		);
		this.Nodes[objectID] = newNode;
	}

	addSkipListObject(
		objectID,
		nodeLabel,
		width,
		height,
		backgroundColor,
		foregroundColor
	) {
		if (this.Nodes[objectID] != null) {
			throw new Error('addSkipListObject:Object with same ID already Exists!');
		}
		const newNode = new AnimatedSkipListNode(
			objectID,
			nodeLabel,
			width,
			height,
			backgroundColor,
			foregroundColor
		);
		this.Nodes[objectID] = newNode;
	}

	getNumElements(objectID) {
		return this.Nodes[objectID].getNumElements();
	}

	setNumElements(objectID, numElems) {
		this.Nodes[objectID].setNumElements(numElems);
	}

	addBTreeNode(objectID, widthPerElem, height, numElems, backgroundColor, foregroundColor) {
		backgroundColor = backgroundColor === undefined ? '#FFFFFF' : backgroundColor;
		foregroundColor = foregroundColor === undefined ? '#FFFFFF' : foregroundColor;

		if (this.Nodes[objectID] != null && this.Nodes[objectID] !== undefined) {
			throw new Error('addBTreeNode:Object with same ID already Exists!');
		}

		const newNode = new AnimatedBTreeNode(
			objectID,
			widthPerElem,
			height,
			numElems,
			backgroundColor,
			foregroundColor
		);
		this.Nodes[objectID] = newNode;
	}

	addRectangleObject(
		objectID,
		nodeLabel,
		width,
		height,
		xJustify,
		yJustify,
		backgroundColor,
		foregroundColor
	) {
		if (this.Nodes[objectID] != null || this.Nodes[objectID] !== undefined) {
			throw new Error('addRectangleObject:Object with same ID already Exists!');
		}
		const newNode = new AnimatedRectangle(
			objectID,
			nodeLabel,
			width,
			height,
			xJustify,
			yJustify,
			backgroundColor,
			foregroundColor
		);
		this.Nodes[objectID] = newNode;
	}

	setNodePosition(nodeID, newX, newY) {
		if (this.Nodes[nodeID] == null || this.Nodes[nodeID] === undefined) {
			// TODO:  Error here?
			return;
		}
		if (newX === undefined || newY === undefined) {
			return;
		}
		this.Nodes[nodeID].x = newX;
		this.Nodes[nodeID].y = newY;
		/* Don't need to dirty anything, since we repaint everything every frame
		 (TODO:  Revisit if we do conditional redraws) */
	}
}
