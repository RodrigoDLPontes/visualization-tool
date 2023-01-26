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
		this.nodes = [];
		this.edges = [];
		this.backEdges = [];
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
		for (i = 0; i < this.nodes.length; i++) {
			if (
				this.nodes[i] != null &&
				!this.nodes[i].highlighted &&
				this.nodes[i].addedToScene &&
				!this.nodes[i].alwaysOnTop
			) {
				this.nodes[i].draw(this.ctx);
			}
		}
		for (i = 0; i < this.nodes.length; i++) {
			if (
				this.nodes[i] != null &&
				this.nodes[i].highlighted &&
				!this.nodes[i].alwaysOnTop &&
				this.nodes[i].addedToScene
			) {
				this.nodes[i].pulseHighlight(this.framenum);
				this.nodes[i].draw(this.ctx);
			}
		}

		for (i = 0; i < this.nodes.length; i++) {
			if (
				this.nodes[i] != null &&
				!this.nodes[i].highlighted &&
				this.nodes[i].alwaysOnTop &&
				this.nodes[i].addedToScene
			) {
				this.nodes[i].draw(this.ctx);
			}
		}

		for (i = 0; i < this.nodes.length; i++) {
			if (
				this.nodes[i] != null &&
				this.nodes[i].highlighted &&
				this.nodes[i].alwaysOnTop &&
				this.nodes[i].addedToScene
			) {
				this.nodes[i].pulseHighlight(this.framenum);
				this.nodes[i].draw(this.ctx);
			}
		}

		for (i = 0; i < this.edges.length; i++) {
			if (this.edges[i] != null) {
				for (j = 0; j < this.edges[i].length; j++) {
					if (this.edges[i][j].addedToScene) {
						this.edges[i][j].pulseHighlight(this.framenum);
						this.edges[i][j].draw(this.ctx);
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
		if (this.nodes[objectID] != null && this.nodes[objectID] !== undefined) {
			throw new Error(
				'addHighlightCircleObject: object with same ID (' +
					String(objectID) +
					') already exists!',
			);
		}
		const newNode = new AnimatedHighlightCircle(objectID, objectColor, radius);
		this.nodes[objectID] = newNode;
	}

	setEdgeAlpha(fromID, toID, alphaVal) {
		let oldAlpha = 1.0;
		if (this.edges[fromID] != null && this.edges[fromID] !== undefined) {
			const len = this.edges[fromID].length;
			for (let i = len - 1; i >= 0; i--) {
				if (
					this.edges[fromID][i] != null &&
					this.edges[fromID][i] !== undefined &&
					this.edges[fromID][i].toID === this.nodes[toID]
				) {
					oldAlpha = this.edges[fromID][i].alpha;
					this.edges[fromID][i].alpha = alphaVal;
				}
			}
		}
		return oldAlpha;
	}

	setAlpha(nodeID, alphaVal) {
		if (this.nodes[nodeID] != null && this.nodes[nodeID] !== undefined) {
			this.nodes[nodeID].setAlpha(alphaVal);
		}
	}

	getAlpha(nodeID) {
		if (this.nodes[nodeID] != null && this.nodes[nodeID] !== undefined) {
			return this.nodes[nodeID].getAlpha();
		} else {
			return -1;
		}
	}

	getTextColor(nodeID, index) {
		if (this.nodes[nodeID] != null && this.nodes[nodeID] !== undefined) {
			return this.nodes[nodeID].getTextColor(index);
		} else {
			return '#000000';
		}
	}

	setTextColor(nodeID, color, index) {
		if (this.nodes[nodeID] != null && this.nodes[nodeID] !== undefined) {
			this.nodes[nodeID].setTextColor(color, index);
		}
	}

	setHighlightIndex(nodeID, index) {
		if (this.nodes[nodeID] != null && this.nodes[nodeID] !== undefined) {
			this.nodes[nodeID].setHighlightIndex(index);
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
		for (i = 0; i < this.nodes.length; i++) {
			if (this.nodes[i] != null && this.nodes[i] !== undefined) {
				this.nodes[i].addedToScene = this.activeLayers[this.nodes[i].layer] === true;
			}
		}
		for (i = this.edges.length - 1; i >= 0; i--) {
			if (this.edges[i] != null && this.edges[i] !== undefined) {
				for (let j = 0; j < this.edges[i].length; j++) {
					if (this.edges[i][j] != null && this.edges[i][j] !== undefined) {
						this.edges[i][j].addedToScene =
							this.activeLayers[this.edges[i][j].fromID.layer] === true &&
							this.activeLayers[this.edges[i][j].toID.layer] === true;
					}
				}
			}
		}
	}

	setLayer(objectID, layer) {
		if (this.nodes[objectID] != null && this.nodes[objectID] !== undefined) {
			this.nodes[objectID].layer = layer;
			if (this.activeLayers[layer]) {
				this.nodes[objectID].addedToScene = true;
			} else {
				this.nodes[objectID].addedToScene = false;
			}
			if (this.edges[objectID] != null && this.edges[objectID] !== undefined) {
				for (let i = 0; i < this.edges[objectID].length; i++) {
					const nextEdge = this.edges[objectID][i];
					if (nextEdge != null && nextEdge !== undefined) {
						nextEdge.addedToScene =
							nextEdge.fromID.addedToScene && nextEdge.toID.addedToScene;
					}
				}
			}
			if (this.backEdges[objectID] != null && this.backEdges[objectID] !== undefined) {
				for (let i = 0; i < this.backEdges[objectID].length; i++) {
					const nextEdge = this.backEdges[objectID][i];
					if (nextEdge != null && nextEdge !== undefined) {
						nextEdge.addedToScene =
							nextEdge.fromID.addedToScene && nextEdge.toID.addedToScene;
					}
				}
			}
		}
	}

	clearAllObjects() {
		this.nodes = [];
		this.edges = [];
		this.backEdges = [];
	}

	setForegroundColor(objectID, color) {
		if (this.nodes[objectID] != null && this.nodes[objectID] !== undefined) {
			this.nodes[objectID].setForegroundColor(color);
		}
	}

	setBackgroundColor(objectID, color) {
		if (this.nodes[objectID] != null) {
			this.nodes[objectID].setBackgroundColor(color);
		}
	}

	setHighlight(nodeID, val, color) {
		if (this.nodes[nodeID] == null || this.nodes[nodeID] === undefined) {
			// TODO:  Error here?
			return;
		}
		this.nodes[nodeID].setHighlight(val, color);
	}

	getHighlight(nodeID) {
		if (this.nodes[nodeID] == null || this.nodes[nodeID] === undefined) {
			// TODO:  Error here?
			return false;
		}
		return this.nodes[nodeID].getHighlight();
	}

	getHighlightIndex(nodeID) {
		if (this.nodes[nodeID] == null || this.nodes[nodeID] === undefined) {
			// TODO:  Error here?
			return false;
		}
		return this.nodes[nodeID].getHighlightIndex();
	}

	setWidth(nodeID, val) {
		if (this.nodes[nodeID] == null || this.nodes[nodeID] === undefined) {
			// TODO:  Error here?
			return;
		}
		this.nodes[nodeID].setWidth(val);
	}

	setHeight(nodeID, val) {
		if (this.nodes[nodeID] == null || this.nodes[nodeID] === undefined) {
			// TODO:  Error here?
			return;
		}
		this.nodes[nodeID].setHeight(val);
	}

	getHeight(nodeID) {
		if (this.nodes[nodeID] == null || this.nodes[nodeID] === undefined) {
			// TODO:  Error here?
			return -1;
		}
		return this.nodes[nodeID].getHeight();
	}

	getWidth(nodeID) {
		if (this.nodes[nodeID] == null || this.nodes[nodeID] === undefined) {
			// TODO:  Error here?
			return -1;
		}
		return this.nodes[nodeID].getWidth();
	}

	backgroundColor(objectID) {
		if (this.nodes[objectID] != null) {
			return this.nodes[objectID].backgroundColor;
		} else {
			return '#000000';
		}
	}

	foregroundColor(objectID) {
		if (this.nodes[objectID] != null) {
			return this.nodes[objectID].foregroundColor;
		} else {
			return '#000000';
		}
	}

	disconnect(objectIDfrom, objectIDto) {
		let undo = null;
		let len;
		let deleted;
		if (this.edges[objectIDfrom] != null) {
			len = this.edges[objectIDfrom].length;
			for (let i = len - 1; i >= 0; i--) {
				if (
					this.edges[objectIDfrom][i] != null &&
					this.edges[objectIDfrom][i].toID === this.nodes[objectIDto]
				) {
					deleted = this.edges[objectIDfrom][i];
					undo = deleted.createUndoConnect();
					this.edges[objectIDfrom][i] = this.edges[objectIDfrom][len - 1];
					len -= 1;
					this.edges[objectIDfrom].pop();
				}
			}
		}
		if (this.backEdges[objectIDto] != null) {
			len = this.backEdges[objectIDto].length;
			for (let i = len - 1; i >= 0; i--) {
				if (
					this.backEdges[objectIDto][i] != null &&
					this.backEdges[objectIDto][i].fromID === this.nodes[objectIDfrom]
				) {
					deleted = this.backEdges[objectIDto][i];
					// Note:  Don't need to remove this child, did it above on the regular edge
					this.backEdges[objectIDto][i] = this.backEdges[objectIDto][len - 1];
					len -= 1;
					this.backEdges[objectIDto].pop();
				}
			}
		}
		return undo;
	}

	deleteIncident(objectID) {
		const undoStack = [];
		let len;
		let deleted;
		if (this.edges[objectID] != null) {
			len = this.edges[objectID].length;
			for (let i = len - 1; i >= 0; i--) {
				deleted = this.edges[objectID][i];
				const node2ID = deleted.toID.identifier();
				undoStack.push(deleted.createUndoConnect());

				let len2 = this.backEdges[node2ID].length;
				for (let j = len2 - 1; j >= 0; j--) {
					if (this.backEdges[node2ID][j] === deleted) {
						this.backEdges[node2ID][j] = this.backEdges[node2ID][len2 - 1];
						len2 -= 1;
						this.backEdges[node2ID].pop();
					}
				}
			}
			this.edges[objectID] = null;
		}
		if (this.backEdges[objectID] != null) {
			len = this.backEdges[objectID].length;
			for (let i = len - 1; i >= 0; i--) {
				deleted = this.backEdges[objectID][i];
				const node1ID = deleted.fromID.identifier();
				undoStack.push(deleted.createUndoConnect());

				let len2 = this.edges[node1ID].length;
				for (let j = len2 - 1; j >= 0; j--) {
					if (this.edges[node1ID][j] === deleted) {
						this.edges[node1ID][j] = this.edges[node1ID][len2 - 1];
						len2 -= 1;
						this.edges[node1ID].pop();
					}
				}
			}
			this.backEdges[objectID] = null;
		}
		return undoStack;
	}

	removeObject(objectID) {
		const oldObject = this.nodes[objectID];
		if (objectID === this.nodes.length - 1) {
			this.nodes.pop();
		} else {
			this.nodes[objectID] = null;
		}
		return oldObject;
	}

	getObject(objectID) {
		if (this.nodes[objectID] == null || this.nodes[objectID] === undefined) {
			throw new Error('getObject:Object with ID (' + String(objectID) + ') does not exist');
		}
		return this.nodes[objectID];
	}

	addCircleObject(objectID, objectLabel) {
		if (this.nodes[objectID] != null && this.nodes[objectID] !== undefined) {
			throw new Error(
				'addCircleObject: object with same ID (' + String(objectID) + ') already exists!',
			);
		}
		const newNode = new AnimatedCircle(objectID, objectLabel);
		this.nodes[objectID] = newNode;
	}

	getNodeX(nodeID) {
		if (this.nodes[nodeID] == null || this.nodes[nodeID] === undefined) {
			throw new Error('Getting x position of an object that does not exist');
		}
		return this.nodes[nodeID].x;
	}

	getTextWidth(text) {
		// TODO:  Need to make fonts more flexible, and less hardwired.
		this.ctx.font = '12px Arial';
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
		if (this.nodes[nodeID] == null || this.nodes[nodeID] === undefined) {
			throw new Error('setting text of an object that does not exist');
		}
		this.nodes[nodeID].setText(text, index, this.getTextWidth(text));
	}

	getText(nodeID, index) {
		if (this.nodes[nodeID] == null || this.nodes[nodeID] === undefined) {
			throw new Error('getting text of an object that does not exist');
		}
		return this.nodes[nodeID].getText(index);
	}

	getNodeY(nodeID) {
		if (this.nodes[nodeID] == null || this.nodes[nodeID] === undefined) {
			throw new Error('getting y position of an object that does not exist');
		}
		return this.nodes[nodeID].y;
	}

	connectEdge(objectIDfrom, objectIDto, color, curve, directed, lab, connectionPoint, thickness) {
		const fromObj = this.nodes[objectIDfrom];
		const toObj = this.nodes[objectIDto];
		if (fromObj == null || toObj == null) {
			throw new Error("Tried to connect two nodes, one didn't exist!");
		}
		const l = new AnimatedLine(
			fromObj,
			toObj,
			color,
			curve,
			directed,
			lab,
			connectionPoint,
			thickness,
		);
		if (this.edges[objectIDfrom] == null) {
			this.edges[objectIDfrom] = [];
		}
		if (this.backEdges[objectIDto] == null) {
			this.backEdges[objectIDto] = [];
		}
		l.addedToScene = fromObj.addedToScene && toObj.addedToScene;
		this.edges[objectIDfrom].push(l);
		this.backEdges[objectIDto].push(l);
	}

	setNull(objectID, nullVal) {
		if (this.nodes[objectID] != null && this.nodes[objectID] !== undefined) {
			this.nodes[objectID].setNull(nullVal);
		}
	}

	setPrevNull(objectID, nullVal) {
		if (this.nodes[objectID] != null && this.nodes[objectID] !== undefined) {
			this.nodes[objectID].setPrevNull(nullVal);
		}
	}

	setNextNull(objectID, nullVal) {
		if (this.nodes[objectID] != null && this.nodes[objectID] !== undefined) {
			this.nodes[objectID].setNextNull(nullVal);
		}
	}

	getNull(objectID) {
		if (this.nodes[objectID] != null && this.nodes[objectID] !== undefined) {
			return this.nodes[objectID].getNull();
		}
		return false; // TODO:  Error here?
	}

	getLeftNull(objectID) {
		if (this.nodes[objectID] != null && this.nodes[objectID] !== undefined) {
			return this.nodes[objectID].getLeftNull();
		}
		return false; // TODO:  Error here?
	}

	getRightNull(objectID) {
		if (this.nodes[objectID] != null && this.nodes[objectID] !== undefined) {
			return this.nodes[objectID].getRightNull();
		}
		return false; // TODO:  Error here?
	}

	setEdgeColor(
		fromID,
		toID,
		color, // returns old color
	) {
		let oldColor = '#000000';
		if (this.edges[fromID] != null && this.edges[fromID] !== undefined) {
			const len = this.edges[fromID].length;
			for (let i = len - 1; i >= 0; i--) {
				if (
					this.edges[fromID][i] != null &&
					this.edges[fromID][i] !== undefined &&
					this.edges[fromID][i].toID === this.nodes[toID]
				) {
					oldColor = this.edges[fromID][i].color();
					this.edges[fromID][i].setColor(color);
				}
			}
		}
		return oldColor;
	}

	alignTop(id1, id2) {
		if (
			this.nodes[id1] == null ||
			this.nodes[id1] === undefined ||
			this.nodes[id2] == null ||
			this.nodes[id2] === undefined
		) {
			throw new Error(
				"Trying to align two nodes, one doesn't exist: " + String(id1) + ',' + String(id2),
			);
		}
		this.nodes[id1].alignTop(this.nodes[id2]);
	}

	alignLeft(id1, id2) {
		if (
			this.nodes[id1] == null ||
			this.nodes[id1] === undefined ||
			this.nodes[id2] == null ||
			this.nodes[id2] === undefined
		) {
			throw new Error(
				"Trying to align two nodes, one doesn't exist: " + String(id1) + ',' + String(id2),
			);
		}
		this.nodes[id1].alignLeft(this.nodes[id2]);
	}

	alignRight(id1, id2) {
		if (
			this.nodes[id1] == null ||
			this.nodes[id1] === undefined ||
			this.nodes[id2] == null ||
			this.nodes[id2] === undefined
		) {
			throw new Error(
				"Trying to align two nodes, one doesn't exist: " + String(id1) + ',' + String(id2),
			);
		}
		this.nodes[id1].alignRight(this.nodes[id2]);
	}

	getAlignRightPos(id1, id2) {
		if (
			this.nodes[id1] == null ||
			this.nodes[id1] === undefined ||
			this.nodes[id2] == null ||
			this.nodes[id2] === undefined
		) {
			throw new Error(
				"Trying to align two nodes, one doesn't exist: " + String(id1) + ',' + String(id2),
			);
		}
		return this.nodes[id1].getAlignRightPos(this.nodes[id2]);
	}

	getAlignLeftPos(id1, id2) {
		if (
			this.nodes[id1] == null ||
			this.nodes[id1] === undefined ||
			this.nodes[id2] == null ||
			this.nodes[id2] === undefined
		) {
			throw new Error(
				"Trying to align two nodes, one doesn't exist: " + String(id1) + ',' + String(id2),
			);
		}
		return this.nodes[id1].getAlignLeftPos(this.nodes[id2]);
	}

	alignBottom(id1, id2) {
		if (
			this.nodes[id1] == null ||
			this.nodes[id1] === undefined ||
			this.nodes[id2] == null ||
			this.nodes[id2] === undefined
		) {
			throw new Error(
				"Trying to align two nodes, one doesn't exist: " + String(id1) + ',' + String(id2),
			);
		}
		this.nodes[id1].alignBottom(this.nodes[id2]);
	}

	setAlwaysOnTop(nodeID, onTop) {
		if (this.nodes[nodeID] != null && this.nodes[nodeID] !== undefined) {
			const oldTop = this.nodes[nodeID].alwaysOnTop;
			this.nodes[nodeID].alwaysOnTop = onTop;
			return oldTop;
		} else {
			throw new Error("Trying to bring node that doesn't exist to top");
		}
	}

	setEdgeHighlight(fromID, toID, val, color) {
		let oldHighlight = false;
		if (this.edges[fromID] != null && this.edges[fromID] !== undefined) {
			const len = this.edges[fromID].length;
			for (let i = len - 1; i >= 0; i--) {
				if (
					this.edges[fromID][i] != null &&
					this.edges[fromID][i] !== undefined &&
					this.edges[fromID][i].toID === this.nodes[toID]
				) {
					oldHighlight = this.edges[fromID][i].highlighted;
					this.edges[fromID][i].setHighlight(val, color);
				}
			}
		}
		return oldHighlight;
	}

	setEdgeThickness(fromID, toID, val) {
		let oldThickness = 1;
		if (this.edges[fromID] != null && this.edges[fromID] !== undefined) {
			const len = this.edges[fromID].length;
			for (let i = len - 1; i >= 0; i--) {
				if (
					this.edges[fromID][i] != null &&
					this.edges[fromID][i] !== undefined &&
					this.edges[fromID][i].toID === this.nodes[toID]
				) {
					oldThickness = this.edges[fromID][i].thickness;
					this.edges[fromID][i].setThickness(val);
				}
			}
		}
		return oldThickness;
	}

	setRectangleEdgeThickness(nodeID, thicknessArray) {
		if (this.nodes[nodeID] != null && this.nodes[nodeID] !== undefined) {
			const oldEdgeThickness = this.nodes[nodeID].getEdgeThickness();
			this.nodes[nodeID].setEdgeThickness(thicknessArray);
			return oldEdgeThickness;
		} else {
			throw new Error("Trying to bring node that doesn't exist to top");
		}
	}

	addLabelObject(objectID, objectLabel, centering) {
		if (this.nodes[objectID] != null && this.nodes[objectID] !== undefined) {
			throw new Error('addLabelObject: object already exists!');
		}

		const newLabel = new AnimatedLabel(
			objectID,
			objectLabel,
			centering,
			this.getTextWidth(objectLabel),
		);
		this.nodes[objectID] = newLabel;
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
		foregroundColor,
	) {
		if (this.nodes[objectID] != null) {
			throw new Error('addLinkedListObject: object with same ID already exists!');
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
			foregroundColor,
		);
		this.nodes[objectID] = newNode;
	}

	addDoublyLinkedListObject(
		objectID,
		nodeLabel,
		width,
		height,
		linkPer,
		backgroundColor,
		foregroundColor,
	) {
		if (this.nodes[objectID] != null) {
			throw new Error('addDoublyLinkedListObject: object with same ID already exists!');
		}
		const newNode = new AnimatedDoublyLinkedListNode(
			objectID,
			nodeLabel,
			width,
			height,
			linkPer,
			backgroundColor,
			foregroundColor,
		);
		this.nodes[objectID] = newNode;
	}

	addCircularlyLinkedListObject(
		objectID,
		nodeLabel,
		width,
		height,
		linkPer,
		backgroundColor,
		foregroundColor,
	) {
		if (this.nodes[objectID] != null) {
			throw new Error('addCircularlyLinkedListObject: object with same ID already exists!');
		}
		const newNode = new AnimatedCircularlyLinkedListNode(
			objectID,
			nodeLabel,
			width,
			height,
			linkPer,
			backgroundColor,
			foregroundColor,
		);
		this.nodes[objectID] = newNode;
	}

	addSkipListObject(objectID, nodeLabel, width, height, backgroundColor, foregroundColor) {
		if (this.nodes[objectID] != null) {
			throw new Error('addSkipListObject: object with same ID already exists!');
		}
		const newNode = new AnimatedSkipListNode(
			objectID,
			nodeLabel,
			width,
			height,
			backgroundColor,
			foregroundColor,
		);
		this.nodes[objectID] = newNode;
	}

	getNumElements(objectID) {
		return this.nodes[objectID].getNumElements();
	}

	setNumElements(objectID, numElems) {
		this.nodes[objectID].setNumElements(numElems);
	}

	addBTreeNode(objectID, widthPerElem, height, numElems, backgroundColor, foregroundColor) {
		backgroundColor = backgroundColor === undefined ? '#FFFFFF' : backgroundColor;
		foregroundColor = foregroundColor === undefined ? '#FFFFFF' : foregroundColor;

		if (this.nodes[objectID] != null && this.nodes[objectID] !== undefined) {
			throw new Error('addBTreeNode: object with same ID already exists!');
		}

		const newNode = new AnimatedBTreeNode(
			objectID,
			widthPerElem,
			height,
			numElems,
			backgroundColor,
			foregroundColor,
		);
		this.nodes[objectID] = newNode;
	}

	addRectangleObject(
		objectID,
		nodeLabel,
		width,
		height,
		xJustify,
		yJustify,
		backgroundColor,
		foregroundColor,
	) {
		if (this.nodes[objectID] != null && this.nodes[objectID] !== undefined) {
			throw new Error('addRectangleObject: object with same ID already exists!');
		}
		const newNode = new AnimatedRectangle(
			objectID,
			nodeLabel,
			width,
			height,
			xJustify,
			yJustify,
			backgroundColor,
			foregroundColor,
		);
		this.nodes[objectID] = newNode;
	}

	setNodePosition(nodeID, newX, newY) {
		if (this.nodes[nodeID] == null || this.nodes[nodeID] === undefined) {
			// TODO:  Error here?
			return;
		}
		if (newX === undefined || newY === undefined) {
			return;
		}
		this.nodes[nodeID].x = newX;
		this.nodes[nodeID].y = newY;
		/* Don't need to dirty anything, since we repaint everything every frame
		 (TODO:  Revisit if we do conditional redraws) */
	}
}
