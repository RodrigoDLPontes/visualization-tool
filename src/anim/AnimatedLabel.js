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

export default class AnimatedLabel extends AnimatedObject {
	constructor(id, val, center, initialWidth) {
		super();
		this.centering = center;
		this.label = val;
		this.highlighted = false;
		this.objectID = id;
		this.alpha = 1.0;
		this.addedToScene = true;
		this.labelColor = '#000000';
		this.textWidth = 0;
		if (initialWidth != null) {
			this.textWidth = initialWidth;
		}

		this.leftWidth = -1;
		this.centerWidth = -1;
		this.highlightIndex = -1;
		this.alwaysOnTop = true;
	}

	centered() {
		return this.centering;
	}

	draw(ctx) {
		if (!this.addedToScene) {
			return;
		}

		ctx.globalAlpha = this.alpha;
		ctx.font = '10px sans-serif';

		let startingXForHighlight = this.x;

		if (this.highlightIndex >= this.label.length) {
			this.highlightIndex = -1;
		}
		if (this.highlightIndexDirty && this.highlightIndex !== -1) {
			this.leftWidth = ctx.measureText(this.label.substring(0, this.highlightIndex)).width;
			this.centerWidth = ctx.measureText(
				this.label.substring(this.highlightIndex, this.highlightIndex + 1)
			).width;
			this.highlightIndexDirty = false;
		}

		if (this.centering) {
			if (this.highlightIndex !== -1) {
				startingXForHighlight = this.x - this.width / 2;
				ctx.textAlign = 'left';
				ctx.textBaseline = 'middle';
			} else {
				ctx.textAlign = 'center';
				ctx.textBaseline = 'middle';
			}
		} else {
			ctx.textAlign = 'left';
			ctx.textBaseline = 'top';
		}
		if (this.highlighted) {
			ctx.strokeStyle = '#ffaaaa';
			ctx.fillStyle = '#ff0000';
			ctx.lineWidth = this.highlightDiff;
			ctx.strokeText(this.label, this.x, this.y);
			//ctx.fillText(this.label, this.x, this.y);
		}
		ctx.strokeStyle = this.labelColor;
		ctx.fillStyle = this.labelColor;
		ctx.lineWidth = 1;
		const strList = this.label.split('\n');
		if (strList.length === 1) {
			if (this.highlightIndex === -1) {
				ctx.fillText(this.label, this.x, this.y);
			} else {
				const leftStr = this.label.substring(0, this.highlightIndex);
				const highlightStr = this.label.substring(
					this.highlightIndex,
					this.highlightIndex + 1
				);
				const rightStr = this.label.substring(this.highlightIndex + 1);
				ctx.fillText(leftStr, startingXForHighlight, this.y);
				ctx.strokeStyle = '#FF0000';
				ctx.fillStyle = '#FF0000';
				ctx.fillText(highlightStr, startingXForHighlight + this.leftWidth, this.y);

				ctx.strokeStyle = this.labelColor;
				ctx.fillStyle = this.labelColor;
				ctx.fillText(
					rightStr,
					startingXForHighlight + this.leftWidth + this.centerWidth,
					this.y
				);
			}
			//this.textWidth = ctx.measureText(this.label).width;
		} else {
			const offset = this.centering ? (1.0 - strList.length) / 2.0 : 0;
			for (let i = 0; i < strList.length; i++) {
				ctx.fillText(strList[i], this.x, this.y + offset + i * 12);
				//this.textWidth = Math.max(this.textWidth, ctx.measureText(strList[i]).width);
			}
		}
		ctx.closePath();
	}

	getAlignLeftPos(otherObject) {
		if (this.centering) {
			return [otherObject.left() - this.textWidth / 2, (this.y = otherObject.centerY())];
		} else {
			return [otherObject.left() - this.textWidth, otherObject.centerY() - 5];
		}
	}

	alignLeft(otherObject) {
		if (this.centering) {
			this.y = otherObject.centerY();
			this.x = otherObject.left() - this.textWidth / 2;
		} else {
			this.y = otherObject.centerY() - 5;
			this.x = otherObject.left() - this.textWidth;
		}
	}

	alignRight(otherObject) {
		if (this.centering) {
			this.y = otherObject.centerY();
			this.x = otherObject.right() + this.textWidth / 2;
		} else {
			this.y = otherObject.centerY() - 5;
			this.x = otherObject.right();
		}
	}

	getAlignRightPos(otherObject) {
		if (this.centering) {
			return [otherObject.right() + this.textWidth / 2, otherObject.centerY()];
		} else {
			return [otherObject.right(), otherObject.centerY() - 5];
		}
	}

	alignTop(otherObject) {
		if (this.centering) {
			this.y = otherObject.top() - 5;
			this.x = otherObject.centerX();
		} else {
			this.y = otherObject.top() - 10;
			this.x = otherObject.centerX() - this.textWidth / 2;
		}
	}

	getAlignTopPos(otherObject) {
		if (this.centering) {
			return [otherObject.centerX(), otherObject.top() - 5];
		} else {
			return [otherObject.centerX() - this.textWidth / 2, otherObject.top() - 10];
		}
	}

	alignBottom(otherObject) {
		if (this.centering) {
			this.y = otherObject.bottom() + 5;
			this.x = otherObject.centerX();
		} else {
			this.y = otherObject.bottom();
			this.x = otherObject.centerX() - this.textWidth / 2;
		}
	}

	getAlignBottomPos(otherObject) {
		if (this.centering) {
			return [otherObject.centerX(), otherObject.bottom() + 5];
		} else {
			return [otherObject.centerX() - this.textWidth / 2, otherObject.bottom()];
		}
	}

	getWidth() {
		return this.textWidth;
	}

	getHeight() {
		return 10; // HACK!  HACK!  HACK!  HACK!
	}

	setHighlight(value) {
		this.highlighted = value;
	}

	createUndoDelete() {
		return new UndoDeleteLabel(
			this.objectID,
			this.label,
			this.x,
			this.y,
			this.centering,
			this.labelColor,
			this.layer,
			this.highlightIndex
		);
	}

	centerX() {
		if (this.centering) {
			return this.x;
		} else {
			return this.x + this.textWidth;
		}
	}

	centerY() {
		if (this.centering) {
			return this.y;
		} else {
			return this.y + 5; //
		}
	}

	top() {
		if (this.centering) {
			return this.y - 5; //TODO: Un-Hardwire
		} else {
			return this.y;
		}
	}

	bottom() {
		if (this.centering) {
			return this.y + 5; // TODO: + height / 2;
		} else {
			return this.y + 10; // TODO: + hieght;
		}
	}

	right() {
		if (this.centering) {
			return this.x + this.textWidth / 2; // TODO: + width / 2;
		} else {
			return this.x + this.textWidth; // TODO: + width;
		}
	}

	left() {
		if (this.centering) {
			return this.x - this.textWidth / 2;
		} else {
			return this.x; // TODO:  - a little?
		}
	}

	setHighlightIndex(hlIndex) {
		// Only allow highlight index for labels that don't have End-Of-Line
		if (this.label.indexOf('\n') === -1 && this.label.length > hlIndex) {
			this.highlightIndex = hlIndex;
			this.highlightIndexDirty = true;
		} else {
			this.highlightIndex = -1;
		}
	}

	getTailPointerAttachPos(fromX, fromY) {
		return this.getClosestCardinalPoint(fromX, fromY);
	}

	getHeadPointerAttachPos(fromX, fromY) {
		return this.getClosestCardinalPoint(fromX, fromY);
	}

	setText(newText, textIndex, initialWidth) {
		this.label = newText;
		if (initialWidth != null) {
			this.textWidth = initialWidth;
		}
	}
}

class UndoDeleteLabel extends UndoBlock {
	constructor(id, lab, x, y, centered, color, l, hli) {
		super();
		this.objectID = id;
		this.posX = x;
		this.posY = y;
		this.nodeLabel = lab;
		this.labCentered = centered;
		this.labelColor = color;
		this.layer = l;
		this.highlightIndex = hli;
		this.dirty = true;
	}

	undoInitialStep(world) {
		world.addLabelObject(this.objectID, this.nodeLabel, this.labCentered);
		world.setNodePosition(this.objectID, this.posX, this.posY);
		world.setForegroundColor(this.objectID, this.labelColor);
		world.setLayer(this.objectID, this.layer);
	}
}
