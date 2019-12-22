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

export default class AnimatedLinkedListNode extends AnimatedObject {
	constructor(objectID, label, w, h, linkPercent, vertical, linkPosEnd, backgroundColor, foregroundColor) {
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

		this.label = label;
		this.labelPosX = 0;
		this.labelPosY = 0;
		this.labelColor = foregroundColor;
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

	resetTextPosition() {
		this.labelPosX = this.x;
		this.labelPosY = this.y;
	}

	getTailPointerAttachPos(fromX, fromY, anchor) {
		if (this.vertical && this.linkPosEnd) {
			return [this.x, this.y + this.h / 2.0];
		} else if (this.vertical && !this.linkPosEnd) {
			return [this.x, this.y - this.h / 2.0];
		} else if (!this.vertical && this.linkPosEnd) {
			return [this.x + this.w / 2.0, this.y];
		} else { // !this.vertical && !this.linkPosEnd
			return [this.x - this.w / 2.0, this.y];
		}
	}

	getHeadPointerAttachPos(fromX, fromY) {
		return this.getClosestCardinalPoint(fromX, fromY);
	}

	setWidth(w) {
		this.w = w;
		this.resetTextPosition();
	}

	setHeight(h) {
		this.h = h;
		this.resetTextPosition();
	}

	getWidth() {
		return this.w;
	}

	getHeight() {
		return this.h;
	}

	draw(context) {
		let startX;
		let startY;

		startX = this.left();
		startY = this.top();

		if (this.highlighted) {
			context.strokeStyle = "#ff0000";
			context.fillStyle = "#ff0000";

			context.beginPath();
			context.moveTo(startX - this.highlightDiff, startY - this.highlightDiff);
			context.lineTo(startX + this.w + this.highlightDiff, startY - this.highlightDiff);
			context.lineTo(
				startX + this.w + this.highlightDiff,
				startY + this.h + this.highlightDiff
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
		} else {
			startY = this.top();
		}

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
		} else { // !vertical && !linkPosEnd
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

		context.textAlign = "center";
		context.font = "10px sans-serif";
		context.textBaseline = "middle";
		context.lineWidth = 1;

		this.resetTextPosition();
		context.fillStyle = this.labelColor;
		context.fillText(this.label, this.labelPosX, this.labelPosY);
	}

	setTextColor(color) {
		this.labelColor = color;
	}

	getTextColor() {
		return this.labelColor;
	}

	getText() {
		return this.label;
	}

	setText(newText) {
		this.label = newText;
		this.resetTextPosition();
	}

	createUndoDelete() {
		return new UndoDeleteLinkedList(
			this.objectID,
			this.label,
			this.w,
			this.h,
			this.x,
			this.y,
			this.linkPercent,
			this.vertical,
			this.linkPosEnd,
			this.backgroundColor,
			this.foregroundColor,
			this.labelColor,
			this.layer,
			this.nullPointer
		);
	}

	setHighlight(value) {
		if (value !== this.highlighted) {
			this.highlighted = value;
		}
	}
}

class UndoDeleteLinkedList extends UndoBlock {
	constructor(
		objectID,
		label,
		w,
		h,
		x,
		y,
		linkPercent,
		vertical,
		linkPosEnd,
		backgroundColor,
		foregroundColor,
		labelColor,
		layer,
		nullPointer
	) {
		super();
		this.objectID = objectID;
		this.label = label;
		this.w = w;
		this.h = h;
		this.x = x;
		this.y = y;
		this.linkPercent = linkPercent;
		this.vertical = vertical;
		this.linkPosEnd = linkPosEnd;
		this.backgroundColor = backgroundColor;
		this.foregroundColor = foregroundColor;
		this.labelColor = labelColor;
		this.layer = layer;
		this.nullPointer = nullPointer;
	}

	undoInitialStep(world) {
		world.addLinkedListObject(
			this.objectID,
			this.label,
			this.w,
			this.h,
			this.linkPercent,
			this.vertical,
			this.linkPosEnd,
			this.backgroundColor,
			this.foregroundColor
		);
		world.setNodePosition(this.objectID, this.x, this.y);
		world.setLayer(this.objectID, this.layer);
		world.setNull(this.objectID, this.nullPointer);
		world.setTextColor(this.objectID, this.labelColor);
	}
}
