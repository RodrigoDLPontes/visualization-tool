// Copyright 2011 David Galles, University of San Francisco. All rights reserved.a
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

// Values for xJust / yJust:  "center", "left", "right", "top", "bottom"

import AnimatedObject from './AnimatedObject.js';
import { UndoBlock } from './UndoFunctions.js';

export default class AnimatedRectangle extends AnimatedObject {
	constructor(objectID, label, w, h, xJustify, yJustify, backgroundColor, foregroundColor) {
		super();

		this.objectID = objectID;

		this.w = w;
		this.h = h;
		this.xJustify = xJustify;
		this.yJustify = yJustify;

		this.backgroundColor = backgroundColor;
		this.foregroundColor = foregroundColor;
		this.textColor = foregroundColor;
		this.highlighted = false;
		this.thicknessArray = [false, false, false, false];

		this.label = label;

		this.nullPointer = false;
	}

	setNull(np) {
		this.nullPointer = np;
	}

	getNull() {
		return this.nullPointer;
	}

	left() {
		if (this.xJustify === 'left') {
			return this.x;
		} else if (this.xJustify === 'center') {
			return this.x - this.w / 2.0;
		} else {
			// right
			return this.x - this.w;
		}
	}

	centerX() {
		if (this.xJustify === 'center') {
			return this.x;
		} else if (this.xJustify === 'left') {
			return this.x + this.w / 2.0;
		} else {
			// right
			return this.x - this.w / 2.0;
		}
	}

	centerY() {
		if (this.yJustify === 'center') {
			return this.y;
		} else if (this.yJustify === 'top') {
			return this.y + this.h / 2.0;
		} else {
			// bottom
			return this.y - this.w / 2.0;
		}
	}

	top() {
		if (this.yJustify === 'top') {
			return this.y;
		} else if (this.yJustify === 'center') {
			return this.y - this.h / 2.0;
		} else {
			// bottom
			return this.y - this.h;
		}
	}

	bottom() {
		if (this.yJustify === 'top') {
			return this.y + this.h;
		} else if (this.yJustify === 'center') {
			return this.y + this.h / 2.0;
		} else {
			// bottom
			return this.y;
		}
	}

	right() {
		if (this.xJustify === 'left') {
			return this.x + this.w;
		} else if (this.xJustify === 'center') {
			return this.x + this.w / 2.0;
		} else {
			// right
			return this.x;
		}
	}

	getHeadPointerAttachPos(fromX, fromY) {
		return this.getClosestCardinalPoint(fromX, fromY);
	}

	getTailPointerAttachPos(fromX, fromY, anchor) {
		switch (anchor) {
			case 0: // Default
				return this.getClosestCardinalPoint(fromX, fromY);
			case 1: // Top
				return [this.x, this.top()];
			case 2: // Bottom
				return [this.x, this.bottom()];
			case 3: // Left
				return [this.left(), this.y];
			case 4: // Right
				return [this.right(), this.y];
			default:
				return null;
		}
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
		if (!this.addedToScene) return;

		context.globalAlpha = this.alpha;
		context.lineWidth = 2;

		let startX;
		let startY;

		if (this.xJustify === 'left') {
			startX = this.x;
		} else if (this.xJustify === 'center') {
			startX = this.x - this.w / 2.0;
		} else if (this.xJustify === 'right') {
			startX = this.x - this.w;
		}
		if (this.yJustify === 'top') {
			startY = this.y;
		} else if (this.yJustify === 'center') {
			startY = this.y - this.h / 2.0;
		} else if (this.yJustify === 'bottom') {
			startY = this.y - this.h;
		}

		context.lineWidth = 2;

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

		// Thick edges
		// Top edge
		if (this.thicknessArray[0]) {
			context.lineWidth = 3;
			context.beginPath();
			context.moveTo(startX, startY);
			context.lineTo(startX + this.w, startY);
			context.stroke();
			context.closePath();
		}
		// Right edge
		if (this.thicknessArray[1]) {
			context.lineWidth = 3;
			context.beginPath();
			context.moveTo(startX + this.w, startY);
			context.lineTo(startX + this.w, startY + this.h);
			context.stroke();
			context.closePath();
		}
		// Bottom edge
		if (this.thicknessArray[2]) {
			context.lineWidth = 3;
			context.beginPath();
			context.moveTo(startX + this.w, startY + this.h);
			context.lineTo(startX, startY + this.h);
			context.stroke();
			context.closePath();
		}
		// Left edge
		if (this.thicknessArray[3]) {
			context.lineWidth = 3;
			context.beginPath();
			context.moveTo(startX, startY + this.h);
			context.lineTo(startX, startY);
			context.stroke();
			context.closePath();
		}

		context.lineWidth = 1.2;
		if (this.nullPointer) {
			context.beginPath();
			context.moveTo(startX, startY);
			context.lineTo(startX + this.w, startY + this.h);
			context.closePath();
			context.stroke();
		}

		context.fillStyle = this.textColor;
		context.textAlign = 'center';
		context.font = '12px Arial';
		context.textBaseline = 'middle';
		context.lineWidth = 2;
		context.fillText(this.label, this.x, this.y);
	}

	setText(newText) {
		this.label = newText;
	}

	setTextColor(color) {
		this.textColor = color;
	}

	getTextColor() {
		return this.textColor;
	}

	setHighlight(value) {
		this.highlighted = value;
	}

	setEdgeThickness(thicknessArray) {
		this.thicknessArray = thicknessArray;
	}

	getEdgeThickness() {
		return this.thicknessArray;
	}

	createUndoDelete() {
		return new UndoDeleteRectangle(
			this.objectID,
			this.label,
			this.x,
			this.y,
			this.w,
			this.h,
			this.xJustify,
			this.yJustify,
			this.backgroundColor,
			this.foregroundColor,
			this.layer,
			this.highlighted,
			this.highlightColor,
		);
	}
}

class UndoDeleteRectangle extends UndoBlock {
	constructor(
		objectID,
		label,
		x,
		y,
		w,
		h,
		xJustify,
		yJustify,
		backgroundColor,
		foregroundColor,
		layer,
		highlighted,
		highlightColor,
	) {
		super();
		this.objectID = objectID;
		this.label = label;
		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h;
		this.xJustify = xJustify;
		this.yJustify = yJustify;
		this.backgroundColor = backgroundColor;
		this.foregroundColor = foregroundColor;
		this.layer = layer;
		this.highlighted = highlighted;
		this.highlightColor = highlightColor;
	}

	undoInitialStep(world) {
		world.addRectangleObject(
			this.objectID,
			this.label,
			this.w,
			this.h,
			this.xJustify,
			this.yJustify,
			this.backgroundColor,
			this.foregroundColor,
		);
		world.setNodePosition(this.objectID, this.x, this.y);
		world.setLayer(this.objectID, this.layer);
		world.setHighlight(this.objectID, this.highlighted, this.highlightColor);
	}
}
