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

import AnimatedObject from "./AnimatedObject.js";
import { UndoBlock } from "./UndoFunctions.js";

export default class AnimatedBTreeNode extends AnimatedObject {
	constructor(id, widthPerElem, h, numElems, fillColor, edgeColor) {
		super();
		fillColor = fillColor == null ? "#FFFFFF" : fillColor;
		edgeColor = edgeColor == null ? "#000000" : edgeColor;
		this.objectID = id;

		this.backgroundColor = fillColor;
		this.foregroundColor = edgeColor;

		this.widthPerElement = widthPerElem;
		this.nodeHeight = h;
		this.numLabels = numElems;
		this.labels = new Array(this.numLabels);
		this.labelColors = new Array(this.numLabels);
		for (let i = 0; i < this.numLabels; i++) {
			this.labelColors[i] = this.foregroundColor;
		}

		this.MIN_WIDTH = 10;
		this.EDGE_POINTER_DISPLACEMENT = 5;
	}

	getNumElements() {
		return this.numLabels;
	}

	getWidth() {
		if (this.numLabels > 0) {
			return this.widthPerElement * this.numLabels;
		} else {
			return this.MIN_WIDTH;
		}
	}

	setNumElements(newNumElements) {
		let i;
		if (this.numLabels < newNumElements) {
			for (i = this.numLabels; i < newNumElements; i++) {
				this.labels[i] = "";
				this.labelColors[i] = this.foregroundColor;
			}
			this.numLabels = newNumElements;
		} else if (this.numLabels > newNumElements) {
			for (i = newNumElements; i < this.numLabels; i++) {
				this.labels[i] = null;
			}
			this.numLabels = newNumElements;
		}
	}

	left() {
		return this.x - this.getWidth() / 2.0;
	}

	right() {
		return this.x + this.getWidth() / 2.0;
	}

	top() {
		return this.y - this.nodeHeight / 2.0;
	}

	bottom() {
		return this.y + this.nodeHeight / 2.0;
	}

	draw(context) {
		let startX;

		startX = this.left();
		if (isNaN(startX)) {
			startX = 0;
		}
		const startY = this.top();

		if (this.highlighted) {
			context.strokeStyle = "#ff0000";
			context.fillStyle = "#ff0000";

			context.beginPath();
			context.moveTo(startX - this.highlightDiff, startY - this.highlightDiff);
			context.lineTo(
				startX + this.getWidth() + this.highlightDiff,
				startY - this.highlightDiff
			);
			context.lineTo(
				startX + this.getWidth() + this.highlightDiff,
				startY + this.nodeHeight + this.highlightDiff
			);
			context.lineTo(
				startX - this.highlightDiff,
				startY + this.nodeHeight + this.highlightDiff
			);
			context.lineTo(startX - this.highlightDiff, startY - this.highlightDiff);
			context.closePath();
			context.stroke();
			context.fill();
		}

		context.strokeStyle = this.foregroundColor;
		context.fillStyle = this.backgroundColor;

		context.beginPath();
		context.moveTo(startX, startY);
		context.lineTo(startX + this.getWidth(), startY);
		context.lineTo(startX + this.getWidth(), startY + this.nodeHeight);
		context.lineTo(startX, startY + this.nodeHeight);
		context.lineTo(startX, startY);
		context.closePath();
		context.stroke();
		context.fill();

		context.textAlign = "center";
		context.textBaseline = "middle";

		for (let i = 0; i < this.numLabels; i++) {
			const labelx =
				this.x -
				(this.widthPerElement * this.numLabels) / 2 +
				this.widthPerElement / 2 +
				i * this.widthPerElement;
			const labely = this.y;

			context.fillStyle = this.labelColors[i];
			context.fillText(this.labels[i], labelx, labely);
		}
	}

	getHeight() {
		return this.nodeHeight;
	}

	setForegroundColor(newColor) {
		this.foregroundColor = newColor;
		for (let i = 0; i < this.numLabels; i++) {
			this.labelColor[i] = newColor;
		}
	}

	// TODO:  Kill the magic numbers here
	getTailPointerAttachPos(fromX, fromY, anchor) {
		if (anchor === 0) {
			return [this.left() + AnimatedBTreeNode.EDGE_POINTER_DISPLACEMENT, this.y];
		} else if (anchor === this.numLabels) {
			return [this.right() - AnimatedBTreeNode.EDGE_POINTER_DISPLACEMENT, this.y];
		} else {
			return [this.left() + anchor * this.widthPerElement, this.y];
		}
	}

	getHeadPointerAttachPos(fromX, fromY) {
		if (fromY < this.y - this.nodeHeight / 2) {
			return [this.x, this.y - this.nodeHeight / 2];
		} else if (this.fromY > this.y + this.nodeHeight / 2) {
			return [this.x, this.y + this.nodeHeight / 2];
		} else if (fromX < this.x - this.getWidth() / 2) {
			return [this.x - this.getWidth() / 2, this.y];
		} else {
			return [this.x + this.getWidth() / 2, this.y];
		}
	}

	createUndoDelete() {
		return new UndoDeleteBTreeNode(
			this.objectID,
			this.numLabels,
			this.labels,
			this.x,
			this.y,
			this.widthPerElement,
			this.nodeHeight,
			this.labelColors,
			this.backgroundColor,
			this.foregroundColor,
			this.layer,
			this.highlighted
		);
	}

	getTextColor(textIndex) {
		textIndex = textIndex == null ? 0 : textIndex;
		return this.labelColors[textIndex];
	}

	getText(index) {
		index = index == null ? 0 : index;
		return this.labels[index];
	}

	setTextColor(color, textIndex) {
		textIndex = textIndex == null ? 0 : textIndex;
		this.labelColors[textIndex] = color;
	}

	setText(newText, textIndex) {
		textIndex = textIndex == null ? 0 : textIndex;
		this.labels[textIndex] = newText;
	}
}

class UndoDeleteBTreeNode extends UndoBlock {
	constructor(
		id,
		numLab,
		labelText,
		x,
		y,
		wPerElement,
		nHeight,
		lColors,
		bgColor,
		fgColor,
		l,
		highlighted
	) {
		super();
		this.objectID = id;
		this.posX = x;
		this.posY = y;
		this.widthPerElem = wPerElement;
		this.nodeHeight = nHeight;
		this.backgroundColor = bgColor;
		this.foregroundColor = fgColor;
		this.numElems = numLab;
		this.labels = labelText;

		this.labelColors = lColors;
		this.layer = l;
		this.highlighted = highlighted;
	}

	undoInitialStep(world) {
		world.addBTreeNode(
			this.objectID,
			this.widthPerElem,
			this.nodeHeight,
			this.numElems,
			this.backgroundColor,
			this.foregroundColor
		);
		world.setNodePosition(this.objectID, this.posX, this.posY);
		for (let i = 0; i < this.numElems; i++) {
			world.setText(this.objectID, this.labels[i], i);
			world.setTextColor(this.objectID, this.labelColors[i], i);
		}
		world.setHighlight(this.objectID, this.highlighted);
		world.setLayer(this.objectID, this.layer);
	}
}
