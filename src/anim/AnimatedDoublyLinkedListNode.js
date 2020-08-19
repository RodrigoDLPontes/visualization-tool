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

export default class AnimatedDoublyLinkedListNode extends AnimatedObject {
	constructor(objectID, label, w, h, linkPercent, backgroundColor, foregroundColor) {
		super();

		this.objectID = objectID;

		this.w = w;
		this.h = h;

		this.backgroundColor = backgroundColor;
		this.foregroundColor = foregroundColor;
		this.highlighted = false;

		this.linkPercent = linkPercent;
		this.prevNullPointer = false;
		this.nextNullPointer = false;

		this.label = label;
		this.labelPosX = 0;
		this.labelPosY = 0;
		this.labelColor = foregroundColor;
	}

	setPrevNull(np) {
		if (this.prevNullPointer !== np) {
			this.prevNullPointer = np;
		}
	}

	setNextNull(np) {
		if (this.nextNullPointer !== np) {
			this.nextNullPointer = np;
		}
	}

	getLeftNull() {
		return this.prevNullPointer;
	}

	getRightNull() {
		return this.nextNullPointer;
	}

	left() {
		return this.x - (this.w * (1 - this.linkPercent)) / 2;
	}

	right() {
		return this.x + (this.w * (this.linkPercent + 1)) / 2;
	}

	top() {
		return this.y - this.h / 2.0;
	}

	bottom() {
		return this.y + this.h / 2.0;
	}

	resetTextPosition() {
		this.labelPosY = this.y;
		this.labelPosX = this.left() + this.w * (this.linkPercent * 2);
	}

	getTailPointerAttachPos(fromX, fromY, anchor) {
		if (anchor === 0) {
			return [this.x + this.w / 2.0, this.y - this.h * 0.2];
		} else {
			return [this.left() + (this.w * this.linkPercent) / 2, this.y + this.h * 0.2];
		}
	}

	getHeadPointerAttachPos(fromX, fromY) {
		const closest = this.getClosestCardinalPoint(fromX, fromY);
		if (closest[1] === this.y) {
			if (closest[0] === this.left()) {
				return [closest[0], this.y - this.h * 0.2];
			} else {
				return [closest[0], this.y + this.h * 0.2];
			}
		} else {
			return [closest[0], closest[1]];
		}
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
		context.lineWidth = 2;

		let startX;
		let startY;

		startX = this.left();
		startY = this.top();

		// Highlighted edges
		if (this.highlighted) {
			context.strokeStyle = '#FF0000';
			context.fillStyle = '#FF0000';

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

		// Node edges
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

		context.lineWidth = 1;
		// Left inner line between node and pointer area
		startX = this.left() + this.w * this.linkPercent;
		startY = this.top();

		context.beginPath();
		context.moveTo(startX, startY + this.h);
		context.lineTo(startX, startY);
		if (this.prevNullPointer) {
			// Left null marker
			context.moveTo(this.left(), startY);
			context.lineTo(this.left() + this.w * this.linkPercent, startY + this.h);
		}
		context.closePath();
		context.stroke();

		// Right inner line between node and pointer area
		startX = this.right() - this.w * this.linkPercent;
		startY = this.top();

		context.beginPath();
		context.moveTo(startX, startY + this.h);
		context.lineTo(startX, startY);
		if (this.nextNullPointer) {
			// Right null marker
			context.moveTo(this.right() - this.w * this.linkPercent, startY);
			context.lineTo(this.right(), startY + this.h);
		}
		context.closePath();
		context.stroke();

		// Label
		context.textAlign = 'center';
		context.font = '12px Arial';
		context.textBaseline = 'middle';
		context.lineWidth = 2;
		this.resetTextPosition();
		context.fillStyle = this.labelColor;
		context.fillText(this.label, this.labelPosX, this.labelPosY);
	}

	setTextColor(color) {
		this.labelColors = color;
	}

	getTextColor() {
		return this.labelColors;
	}

	getText() {
		return this.label;
	}

	setText(newText) {
		this.label = newText;
		this.resetTextPosition();
	}

	setHighlight(value) {
		if (value !== this.highlighted) {
			this.highlighted = value;
		}
	}

	createUndoDelete() {
		return new UndoDeleteDoublyLinkedList(
			this.objectID,
			this.label,
			this.w,
			this.h,
			this.x,
			this.y,
			this.linkPercent,
			this.backgroundColor,
			this.foregroundColor,
			this.labelColor,
			this.layer,
			this.prevNullPointer,
			this.nextNullPointer,
			this.highlighted,
			this.highlightColor,
		);
	}
}

class UndoDeleteDoublyLinkedList extends UndoBlock {
	constructor(
		objectID,
		label,
		w,
		h,
		x,
		y,
		linkPercent,
		backgroundColor,
		foregroundColor,
		labelColor,
		layer,
		pnp,
		nnp,
		highlighted,
		highlightColor,
	) {
		super();
		this.objectID = objectID;
		this.label = label;
		this.w = w;
		this.h = h;
		this.x = x;
		this.y = y;
		this.linkPercent = linkPercent;
		this.backgroundColor = backgroundColor;
		this.foregroundColor = foregroundColor;
		this.labelColors = labelColor;
		this.layer = layer;
		this.prevNullPointer = pnp;
		this.nextNullPointer = nnp;
		this.highlighted = highlighted;
		this.highlightColor = highlightColor;
	}

	undoInitialStep(world) {
		world.addDoublyLinkedListObject(
			this.objectID,
			this.label,
			this.w,
			this.h,
			this.linkPercent,
			this.backgroundColor,
			this.foregroundColor,
		);
		world.setNodePosition(this.objectID, this.x, this.y);
		world.setLayer(this.objectID, this.layer);
		world.setPrevNull(this.objectID, this.prevNullPointer);
		world.setNextNull(this.objectID, this.nextNullPointer);
		world.setTextColor(this.objectID, this.labelColor);
		world.setHighlight(this.objectID, this.highlighted, this.highlightColor);
	}
}
