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

export default class AnimatedCircularlyLinkedList extends AnimatedObject {
	constructor(id, val, wth, hgt, linkPer, numLab, fillColor, edgeColor) {
		super();
		this.w = wth;
		this.h = hgt;
		this.backgroundColor = fillColor;
		this.foregroundColor = edgeColor;

		this.linkPercent = linkPer;

		this.numLabels = numLab;

		this.labels = [];
		this.labelPosX = [];
		this.labelPosY = [];
		this.labelColors = [];
		this.nullPointer = false;

		this.currentHeightDif = 6;
		this.maxHeightDiff = 5;
		this.minHeightDiff = 3;

		for (let i = 0; i < this.numLabels; i++) {
			this.labels[i] = "";
			this.labelPosX[i] = 0;
			this.labelPosY[i] = 0;
			this.labelColors[i] = this.foregroundColor;
		}

		this.labels[0] = val;
		this.highlighted = false;
		this.objectID = id;
	}

	setNull(np) {
		if (this.nullPointer !== np) {
			this.nullPointer = np;
		}
	}

	getNull() {
		return this.nullPointer;
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

	// TODO: Should we move this to the draw function, and save the
	//       space of the arrays?  Bit of a leftover from the Flash code,
	//       which did drawing differently
	resetTextPosition() {
		this.labelPosY[0] = this.y;
		this.labelPosX[0] =
			this.x + ((this.w * (1 - this.linkPercent)) / 2) * (1 / this.numLabels - 1);
		for (let i = 1; i < this.numLabels; i++) {
			this.labelPosY[i] = this.y;
			this.labelPosX[i] =
				this.labelPosX[i - 1] + (this.w * (1 - this.linkPercent)) / this.numLabels;
		}
	}

	getTailPointerAttachPos() {
		return [this.x + this.w / 2.0, this.y];
	}

	getHeadPointerAttachPos(fromX, fromY) {
		if (fromX < this.x) {
			return this.getClosestCardinalPoint(fromX, fromY); // Normal anchor
		} else {
			return [this.x, this.bottom()]; // Curved pointer coming from the right, connect to bottom
		}
	}

	setWidth(wdth) {
		this.w = wdth;
		this.resetTextPosition();
	}

	setHeight(hght) {
		this.h = hght;
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

		let i;
		startY = this.top();
		for (i = 1; i < this.numLabels; i++) {
			startX = this.x + this.w * (1 - this.linkPercent) * (i / this.numLabels - 1 / 2);
			context.beginPath();
			context.moveTo(startX, startY);
			context.lineTo(startX, startY + this.h);
			context.closePath();
			context.stroke();
		}

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

		context.textAlign = "center";
		context.font = "10px sans-serif";
		context.textBaseline = "middle";
		context.lineWidth = 1;

		this.resetTextPosition();
		for (i = 0; i < this.numLabels; i++) {
			context.fillStyle = this.labelColors[i];
			context.fillText(this.labels[i], this.labelPosX[i], this.labelPosY[i]);
		}
	}

	setTextColor(color, textIndex) {
		this.labelColors[textIndex] = color;
	}

	getTextColor(textIndex) {
		return this.labelColors[textIndex];
	}

	getText(index) {
		return this.labels[index];
	}

	setText(newText, textIndex) {
		this.labels[textIndex] = newText;
		this.resetTextPosition();
	}

	createUndoDelete() {
		return new UndoDeleteLinkedList(
			this.objectID,
			this.numLabels,
			this.labels,
			this.x,
			this.y,
			this.w,
			this.h,
			this.linkPercent,
			this.linkPositionEnd,
			this.vertical,
			this.labelColors,
			this.backgroundColor,
			this.foregroundColor,
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
	constructor(id, numlab, lab, x, y, w, h, linkper, labColors, bgColor, fgColor, l, np) {
		super();
		this.objectID = id;
		this.posX = x;
		this.posY = y;
		this.width = w;
		this.height = h;
		this.backgroundColor = bgColor;
		this.foregroundColor = fgColor;
		this.labels = lab;
		this.linkPercent = linkper;
		this.labelColors = labColors;
		this.layer = l;
		this.numLabels = numlab;
		this.nullPointer = np;
	}

	undoInitialStep(world) {
		world.addLinkedListObject(
			this.objectID,
			this.labels[0],
			this.width,
			this.height,
			this.linkPercent,
			this.numLabels,
			this.backgroundColor,
			this.foregroundColor
		);
		world.setNodePosition(this.objectID, this.posX, this.posY);
		world.setLayer(this.objectID, this.layer);
		world.setNull(this.objectID, this.nullPointer);
		for (let i = 0; i < this.numLabels; i++) {
			world.setText(this.objectID, this.labels[i], i);
			world.setTextColor(this.objectID, this.labelColors[i], i);
		}
	}
}
