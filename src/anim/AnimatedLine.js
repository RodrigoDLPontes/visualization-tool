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

// This class handles links between vertices in graphs, pointers in linked lists, and so on.

const LINE_MAX_HEIGHT_DIFF = 5;
const LINE_MIN_HEIGHT_DIFF = 3;
const LINE_RANGE = LINE_MAX_HEIGHT_DIFF - LINE_MIN_HEIGHT_DIFF + 1;

export default class AnimatedLine {
	constructor(fromID, toID, color, curve, directed, edgeLabel, anchorPoint, thickness) {
		this.fromID = fromID;
		this.toID = toID;

		this.foregroundColor = color;
		this.edgeLabel = edgeLabel;
		this.highlighted = false;
		this.highlightDiff = 0;

		this.dirty = false;
		this.directed = directed;
		this.anchorPoint = anchorPoint;

		this.alpha = 1.0;
		this.thickness = thickness;
		this.arrowHeight = 8;
		this.arrowWidth = 4;
		this.curve = curve;
	}

	color() {
		return this.foregroundColor;
	}

	setColor(newColor) {
		this.foregroundColor = newColor;
		this.dirty = true;
	}

	setHighlight(highlightVal, color) {
		this.highlighted = highlightVal;
		this.highlightColor = color || '#FF0000';
	}

	setThickness(thickness) {
		this.thickness = thickness;
	}

	pulseHighlight(frameNum) {
		if (this.highlighted) {
			const frameMod = frameNum / 14.0;
			const delta = Math.abs((frameMod % (2 * LINE_RANGE - 2)) - LINE_RANGE + 1);
			this.highlightDiff = delta + this.thickness + LINE_MIN_HEIGHT_DIFF;
			this.dirty = true;
		}
	}

	hasNode(n) {
		return this.fromID === n || this.toID === n;
	}

	sign(n) {
		if (n > 0) {
			return 1;
		} else {
			return -1;
		}
	}

	drawArrow(thickness, color, context) {
		context.strokeStyle = color;
		context.fillStyle = color;
		context.lineWidth = thickness;

		const fromPos = this.fromID.getTailPointerAttachPos(
			this.toID.x,
			this.toID.y,
			this.anchorPoint,
		);
		const toPos = this.toID.getHeadPointerAttachPos(this.fromID.x, this.fromID.y);

		const deltaX = toPos[0] - fromPos[0];
		const deltaY = toPos[1] - fromPos[1];
		const midX = deltaX / 2.0 + fromPos[0];
		const midY = deltaY / 2.0 + fromPos[1];
		const controlX = midX - deltaY * this.curve;

		const controlY = midY + deltaX * this.curve;

		context.beginPath();
		context.moveTo(fromPos[0], fromPos[1]);
		context.quadraticCurveTo(controlX, controlY, toPos[0], toPos[1]);
		context.stroke();

		// Position of the edge label:  First, we will place it right along the
		// middle of the curve (or the middle of the line, for curve == 0)
		let labelPosX = 0.25 * fromPos[0] + 0.5 * controlX + 0.25 * toPos[0];
		let labelPosY = 0.25 * fromPos[1] + 0.5 * controlY + 0.25 * toPos[1];

		// Next, we push the edge position label out just a little in the direction of
		// the curve, so that the label doesn't intersect the cuve (as long as the label
		// is only a few characters, that is)
		const midLen = Math.sqrt(deltaY * deltaY + deltaX * deltaX);
		if (midLen !== 0) {
			labelPosX += ((-deltaY * this.sign(this.curve)) / midLen) * 10;
			labelPosY += ((deltaX * this.sign(this.curve)) / midLen) * 10;
		}

		context.textAlign = 'center';
		context.font = '12px Arial';
		context.textBaseline = 'middle';
		context.fillText(this.edgeLabel, labelPosX, labelPosY);

		if (this.directed) {
			let xVec = controlX - toPos[0];
			let yVec = controlY - toPos[1];
			const len = Math.sqrt(xVec * xVec + yVec * yVec);

			if (len > 0) {
				xVec = xVec / len;
				yVec = yVec / len;

				context.beginPath();
				context.moveTo(toPos[0], toPos[1]);
				context.lineTo(
					toPos[0] + xVec * this.arrowHeight - yVec * this.arrowWidth,
					toPos[1] + yVec * this.arrowHeight + xVec * this.arrowWidth,
				);
				context.lineTo(
					toPos[0] + xVec * this.arrowHeight + yVec * this.arrowWidth,
					toPos[1] + yVec * this.arrowHeight - xVec * this.arrowWidth,
				);
				context.lineTo(toPos[0], toPos[1]);
				context.closePath();
				context.stroke();
				context.fill();
			}
		}
	}

	draw(context) {
		context.globalAlpha = this.alpha;

		if (this.highlighted) this.drawArrow(this.highlightDiff, this.highlightColor, context);
		this.drawArrow(this.thickness, this.foregroundColor, context);
	}

	createUndoConnect() {
		return new UndoConnect(
			this.fromID.objectID,
			this.toID.objectID,
			true,
			this.foregroundColor,
			this.curve,
			this.directed,
			this.edgeLabel,
			this.anchorPoint,
			this.thickness,
			this.highlighted,
		);
	}
}

export class UndoConnect {
	constructor(
		fromID,
		toID,
		createConnection,
		color,
		curve,
		directed,
		edgeLabel,
		anchorPoint,
		thickness,
		highlighted,
	) {
		this.fromID = fromID;
		this.toID = toID;
		this.createConnection = createConnection;
		this.color = color;
		this.curve = curve;
		this.directed = directed;
		this.edgeLabel = edgeLabel;
		this.anchorPoint = anchorPoint;
		this.thickness = thickness;
		this.highlighted = highlighted;
	}

	undoInitialStep(world) {
		if (this.createConnection) {
			world.connectEdge(
				this.fromID,
				this.toID,
				this.color,
				this.curve,
				this.directed,
				this.edgeLabel,
				this.anchorPoint,
				this.thickness,
			);
			world.setEdgeHighlight(this.fromID, this.toID, this.highlighted);
		} else {
			world.disconnect(this.fromID, this.toID);
		}
	}

	addUndoAnimation() {
		return false;
	}
}
