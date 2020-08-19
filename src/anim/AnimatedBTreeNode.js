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

import AnimatedObject from './AnimatedObject.js';
import { UndoBlock } from './UndoFunctions.js';

const MIN_WIDTH = 10;
const EDGE_POINTER_DISPLACEMENT = 5;

export default class AnimatedBTreeNode extends AnimatedObject {
	constructor(objectID, widthPerElement, h, numLabels, backgroundColor, foregroundColor) {
		super();

		this.objectID = objectID;

		this.backgroundColor = backgroundColor;
		this.foregroundColor = foregroundColor;

		this.widthPerElement = widthPerElement;
		this.h = h;
		this.numLabels = numLabels;
		this.labels = [];
		this.labelColors = [];
		for (let i = 0; i < this.numLabels; i++) {
			this.labelColors[i] = this.foregroundColor;
		}
	}

	getNumElements() {
		return this.numLabels;
	}

	getWidth() {
		if (this.numLabels > 0) {
			return this.widthPerElement * this.numLabels;
		} else {
			return MIN_WIDTH;
		}
	}

	setNumElements(newNumElements) {
		if (this.numLabels < newNumElements) {
			for (let i = this.numLabels; i < newNumElements; i++) {
				this.labels[i] = '';
				this.labelColors[i] = this.foregroundColor;
			}
			this.numLabels = newNumElements;
		} else if (this.numLabels > newNumElements) {
			for (let i = newNumElements; i < this.numLabels; i++) {
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
		return this.y - this.h / 2.0;
	}

	bottom() {
		return this.y + this.h / 2.0;
	}

	draw(context) {
		let startX;

		startX = this.left();
		if (isNaN(startX)) {
			startX = 0;
		}
		const startY = this.top();

		if (this.highlighted) {
			context.strokeStyle = '#FF0000';
			context.fillStyle = '#FF0000';

			context.beginPath();
			context.moveTo(startX - this.highlightDiff, startY - this.highlightDiff);
			context.lineTo(
				startX + this.getWidth() + this.highlightDiff,
				startY - this.highlightDiff,
			);
			context.lineTo(
				startX + this.getWidth() + this.highlightDiff,
				startY + this.h + this.highlightDiff,
			);
			context.lineTo(startX - this.highlightDiff, startY + this.h + this.highlightDiff);
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
		context.lineTo(startX + this.getWidth(), startY + this.h);
		context.lineTo(startX, startY + this.h);
		context.lineTo(startX, startY);
		context.closePath();
		context.stroke();
		context.fill();

		context.textAlign = 'center';
		context.textBaseline = 'middle';

		for (let i = 0; i < this.numLabels; i++) {
			const labelX =
				this.x -
				(this.widthPerElement * this.numLabels) / 2 +
				this.widthPerElement / 2 +
				i * this.widthPerElement;
			const labelY = this.y;

			context.fillStyle = this.labelColors[i];
			context.fillText(this.labels[i], labelX, labelY);
		}
	}

	getHeight() {
		return this.h;
	}

	setForegroundColor(newColor) {
		this.foregroundColor = newColor;
		for (let i = 0; i < this.numLabels; i++) {
			this.labelColor[i] = newColor;
		}
	}

	getTailPointerAttachPos(fromX, fromY, anchor) {
		if (anchor === 0) {
			return [this.left() + EDGE_POINTER_DISPLACEMENT, this.y];
		} else if (anchor === this.numLabels) {
			return [this.right() - EDGE_POINTER_DISPLACEMENT, this.y];
		} else {
			return [this.left() + anchor * this.widthPerElement, this.y];
		}
	}

	getHeadPointerAttachPos(fromX, fromY) {
		if (fromY < this.y - this.h / 2) {
			return [this.x, this.y - this.h / 2];
		} else if (this.fromY > this.y + this.h / 2) {
			return [this.x, this.y + this.h / 2];
		} else if (fromX < this.x - this.getWidth() / 2) {
			return [this.x - this.getWidth() / 2, this.y];
		} else {
			return [this.x + this.getWidth() / 2, this.y];
		}
	}

	getTextColor(textIndex) {
		textIndex = textIndex || 0;
		return this.labelColors[textIndex];
	}

	getText(index) {
		index = index || 0;
		return this.labels[index];
	}

	setTextColor(color, textIndex) {
		textIndex = textIndex || 0;
		this.labelColors[textIndex] = color;
	}

	setText(newText, textIndex) {
		textIndex = textIndex || 0;
		this.labels[textIndex] = newText;
	}

	createUndoDelete() {
		return new UndoDeleteBTreeNode(
			this.objectID,
			this.numLabels,
			this.labels,
			this.x,
			this.y,
			this.widthPerElement,
			this.h,
			this.labelColors,
			this.backgroundColor,
			this.foregroundColor,
			this.layer,
			this.highlighted,
			this.highlightColor,
		);
	}
}

class UndoDeleteBTreeNode extends UndoBlock {
	constructor(
		objectID,
		numLabels,
		labels,
		x,
		y,
		widthPerElement,
		h,
		labelColors,
		backgroundColor,
		foregroundColor,
		layer,
		highlighted,
		highlightColor,
	) {
		super();
		this.objectID = objectID;
		this.numLabels = numLabels;
		this.labels = labels;
		this.x = x;
		this.y = y;
		this.widthPerElement = widthPerElement;
		this.h = h;
		this.labelColors = labelColors;
		this.backgroundColor = backgroundColor;
		this.foregroundColor = foregroundColor;
		this.layer = layer;
		this.highlighted = highlighted;
		this.highlightColor = highlightColor;
	}

	undoInitialStep(world) {
		world.addBTreeNode(
			this.objectID,
			this.widthPerElement,
			this.h,
			this.numLabels,
			this.backgroundColor,
			this.foregroundColor,
		);
		world.setNodePosition(this.objectID, this.x, this.y);
		for (let i = 0; i < this.numLabels; i++) {
			world.setText(this.objectID, this.labels[i], i);
			world.setTextColor(this.objectID, this.labelColors[i], i);
		}
		world.setLayer(this.objectID, this.layer);
		world.setHighlight(this.objectID, this.highlighted, this.highlightColor);
	}
}
