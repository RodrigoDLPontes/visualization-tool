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

export default class AnimatedLinkedListNode extends AnimatedObject {
	constructor(
		objectID,
		labels,
		w,
		h,
		linkPercent,
		vertical,
		linkPosEnd,
		backgroundColor,
		foregroundColor,
	) {
		super();

		this.objectID = objectID;

		this.w = w;
		this.h = h;

		this.backgroundColor = backgroundColor;
		this.foregroundColor = foregroundColor;
		this.highlighted = false;

		this.vertical = vertical;
		this.linkPosEnd = linkPosEnd;
		this.linkPercent = linkPercent;
		this.nullPointer = false;

		this.labels = labels;
		this.labelPosX = [0];
		this.labelPosY = [0];
		this.labelColors = [foregroundColor];
	}

	left() {
		if (this.vertical) {
			return this.x - this.w / 2.0;
		} else if (this.linkPosEnd) {
			return this.x - (this.w * (1 - this.linkPercent)) / 2;
		} else {
			return this.x - (this.w * (this.linkPercent + 1)) / 2;
		}
	}

	setNull(np) {
		if (this.nullPointer !== np) {
			this.nullPointer = np;
		}
	}

	getNull() {
		return this.nullPointer;
	}

	right() {
		if (this.vertical) {
			return this.x + this.w / 2.0;
		} else if (this.linkPosEnd) {
			return this.x + (this.w * (this.linkPercent + 1)) / 2;
		} else {
			return this.x + (this.w * (1 - this.linkPercent)) / 2;
		}
	}

	top() {
		if (!this.vertical) {
			return this.y - this.h / 2.0;
		} else if (this.linkPosEnd) {
			return this.y - (this.h * (1 - this.linkPercent)) / 2;
		} else {
			return this.y - (this.h * (1 + this.linkPercent)) / 2;
		}
	}

	bottom() {
		if (!this.vertical) {
			return this.y + this.h / 2.0;
		} else if (this.linkPosEnd) {
			return this.y + (this.h * (1 + this.linkPercent)) / 2;
		} else {
			return this.y + (this.h * (1 - this.linkPercent)) / 2;
		}
	}

	getTailPointerAttachPos(fromX, fromY, anchor) {
		if (this.vertical && this.linkPosEnd) {
			return [this.x, this.y + this.h / 2.0];
		} else if (this.vertical && !this.linkPosEnd) {
			return [this.x, this.y - this.h / 2.0];
		} else if (!this.vertical && this.linkPosEnd) {
			return [this.x + this.w / 2.0, this.y];
		} else {
			// !this.vertical && !this.linkPosEnd
			return [this.x - this.w / 2.0, this.y];
		}
	}

	getHeadPointerAttachPos(fromX, fromY) {
		return this.getClosestCardinalPoint(fromX, fromY);
	}

	setWidth(w) {
		this.w = w;
	}

	setHeight(h) {
		this.h = h;
	}

	getWidth() {
		return this.w;
	}

	getHeight() {
		return this.h;
	}

	draw(context) {
		context.lineWidth = 2;

		let startX;
		let startY;

		startX = this.left();
		startY = this.top();

		if (this.highlighted) {
			context.strokeStyle = '#ff0000';
			context.fillStyle = '#ff0000';

			context.beginPath();
			context.moveTo(startX - this.highlightDiff, startY - this.highlightDiff);
			context.lineTo(startX + this.w + this.highlightDiff, startY - this.highlightDiff);
			context.lineTo(
				startX + this.w + this.highlightDiff,
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
		context.lineTo(startX + this.w, startY);
		context.lineTo(startX + this.w, startY + this.h);
		context.lineTo(startX, startY + this.h);
		context.lineTo(startX, startY);
		context.closePath();
		context.stroke();
		context.fill();

		if (this.vertical) {
			startX = this.left();
			for (let i = 1; i < this.labels.length; i++) {
				startY = this.y + this.h * (1 - this.linkPercent) * (i / this.labels.length - 0.5);
				context.beginPath();
				context.moveTo(startX, startY);
				context.lineTo(startX + this.w, startY);
				context.closePath();
				context.stroke();
			}
		} else {
			startY = this.top();
			for (let i = 1; i < this.labels.length; i++) {
				startX = this.x + this.w * (1 - this.linkPercent) * (i / this.labels.length - 0.5);
				context.beginPath();
				context.moveTo(startX, startY);
				context.lineTo(startX, startY + this.h);
				context.closePath();
				context.stroke();
			}
		}

		context.lineWidth = 1;
		if (this.vertical && this.linkPosEnd) {
			startX = this.left();
			startY = this.bottom() - this.h * this.linkPercent;

			context.beginPath();
			context.moveTo(startX + this.w, startY);
			context.lineTo(startX, startY);
			if (this.nullPointer) {
				context.lineTo(this.startX + this.w, this.bottom());
			}
			context.closePath();
			context.stroke();
		} else if (this.vertical && !this.linkPosEnd) {
			startX = this.left();
			startY = this.top() + this.h * this.linkPercent;

			context.beginPath();
			context.moveTo(startX + this.w, startY);
			context.lineTo(startX, startY);
			if (this.nullPointer) {
				context.lineTo(startX + this.w, this.top());
			}
			context.closePath();
			context.stroke();
		} else if (!this.vertical && this.linkPosEnd) {
			startX = this.right() - this.w * this.linkPercent;
			startY = this.top();

			context.beginPath();
			context.moveTo(startX, startY + this.h);
			context.lineTo(startX, startY);
			if (this.nullPointer) {
				context.lineTo(this.right(), startY + this.h);
			}
			context.closePath();
			context.stroke();
		} else {
			// !vertical && !linkPosEnd
			startX = this.left() + this.w * this.linkPercent;
			startY = this.top();

			context.beginPath();
			context.moveTo(startX, startY + this.h);
			context.lineTo(startX, startY);
			if (this.nullPointer) {
				context.lineTo(this.left(), startY);
			}
			context.closePath();
			context.stroke();
		}

		context.textAlign = 'center';
		context.font = '12px Arial';
		context.textBaseline = 'middle';
		context.lineWidth = 2;

		if (this.vertical) {
			this.labelPosX[0] = this.x;
			this.labelPosY[0] =
				this.y + ((this.h * (1 - this.linkPercent)) / 2) * (1 / this.labels.length - 1);
			for (let i = 1; i < this.labels.length; i++) {
				this.labelPosX[i] = this.x;
				this.labelPosY[i] =
					this.labelPosY[i - 1] + (this.h * (1 - this.linkPercent)) / this.labels.length;
			}
		} else {
			this.labelPosY[0] = this.y;
			this.labelPosX[0] =
				this.x + ((this.w * (1 - this.linkPercent)) / 2) * (1 / this.labels.length - 1);
			for (let i = 1; i < this.labels.length; i++) {
				this.labelPosY[i] = this.y;
				this.labelPosX[i] =
					this.labelPosX[i - 1] + (this.w * (1 - this.linkPercent)) / this.labels.length;
			}
		}

		for (let i = 0; i < this.labels.length; i++) {
			context.fillStyle = this.labelColors[i];
			context.fillText(this.labels[i], this.labelPosX[i], this.labelPosY[i]);
		}
	}

	setTextColor(color, index) {
		this.labelColors[index] = color;
	}

	getTextColor(index) {
		return this.labelColors[index];
	}

	getText(index) {
		return this.labels[index];
	}

	setText(newText, index) {
		this.labels[index] = newText;
	}

	setHighlight(value) {
		if (value !== this.highlighted) {
			this.highlighted = value;
		}
	}

	createUndoDelete() {
		return new UndoDeleteLinkedList(
			this.objectID,
			this.labels,
			this.w,
			this.h,
			this.x,
			this.y,
			this.linkPercent,
			this.vertical,
			this.linkPosEnd,
			this.backgroundColor,
			this.foregroundColor,
			this.labelColors,
			this.layer,
			this.nullPointer,
			this.highlighted,
			this.highlightColor,
		);
	}
}

class UndoDeleteLinkedList extends UndoBlock {
	constructor(
		objectID,
		labels,
		w,
		h,
		x,
		y,
		linkPercent,
		vertical,
		linkPosEnd,
		backgroundColor,
		foregroundColor,
		labelColors,
		layer,
		nullPointer,
		highlighted,
		highlightColor,
	) {
		super();
		this.objectID = objectID;
		this.labels = labels;
		this.w = w;
		this.h = h;
		this.x = x;
		this.y = y;
		this.linkPercent = linkPercent;
		this.vertical = vertical;
		this.linkPosEnd = linkPosEnd;
		this.backgroundColor = backgroundColor;
		this.foregroundColor = foregroundColor;
		this.labelColors = labelColors;
		this.layer = layer;
		this.nullPointer = nullPointer;
		this.highlighted = highlighted;
		this.highlightColor = highlightColor;
	}

	undoInitialStep(world) {
		world.addLinkedListObject(
			this.objectID,
			this.labels,
			this.w,
			this.h,
			this.linkPercent,
			this.vertical,
			this.linkPosEnd,
			this.backgroundColor,
			this.foregroundColor,
		);
		world.setNodePosition(this.objectID, this.x, this.y);
		world.setLayer(this.objectID, this.layer);
		world.setNull(this.objectID, this.nullPointer);
		for (let i = 0; i < this.labels.length; i++) {
			world.setTextColor(this.objectID, this.labelColors[i], i);
		}
		world.setHighlight(this.objectID, this.highlighted, this.highlightColor);
	}
}
