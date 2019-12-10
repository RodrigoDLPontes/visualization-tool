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

// This class is somewhat poorly named -- it handles links between vertices in graphs,
//  pointers in linked lists, and so on.

const LINE_maxHeightDiff = 5;
const LINE_minHeightDiff = 3;
const LINE_range = LINE_maxHeightDiff - LINE_minHeightDiff + 1;
// const LINE_highlightDiff = 3;

export default class Line {
	constructor(n1, n2, color, cv, d, weight, anchorIndex) {
		this.arrowHeight = 8;
		this.arrowWidth = 4;

		this.Node1 = n1;
		this.Node2 = n2;
		this.Dirty = false;
		this.directed = d;
		this.edgeColor = color;
		this.edgeLabel = weight;
		this.highlighted = false;
		this.addedToScene = true;
		this.anchorPoint = anchorIndex;
		this.highlightDiff = 0;
		this.curve = cv;

		this.alpha = 1.0;
	}

	color() {
		return this.edgeColor;
	}

	setColor(newColor) {
		this.edgeColor = newColor;
		this.Dirty = true;
	}

	setHighlight(highlightVal) {
		this.highlighted = highlightVal;
	}

	pulseHighlight(frameNum) {
		if (this.highlighted) {
			const frameMod = frameNum / 14.0;
			const delta = Math.abs((frameMod % (2 * LINE_range - 2)) - LINE_range + 1);
			this.highlightDiff = delta + LINE_minHeightDiff;
			this.Dirty = true;
		}
	}

	hasNode(n) {
		return this.Node1 === n || this.Node2 === n;
	}

	createUndoDisconnect() {
		return new UndoConnect(
			this.Node1.objectID,
			this.Node2.objectID,
			true,
			this.edgeColor,
			this.directed,
			this.curve,
			this.edgeLabel,
			this.anchorPoint
		);
	}

	sign(n) {
		if (n > 0) {
			return 1;
		} else {
			return -1;
		}
	}

	drawArrow(pensize, color, context) {
		context.strokeStyle = color;
		context.fillStyle = color;
		context.lineWidth = pensize;

		const fromPos = this.Node1.getTailPointerAttachPos(
			this.Node2.x,
			this.Node2.y,
			this.anchorPoint
		);
		const toPos = this.Node2.getHeadPointerAttachPos(this.Node1.x, this.Node1.y);

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
		//context.closePath();

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
		context.font = '10px sans-serif';
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
					toPos[1] + yVec * this.arrowHeight + xVec * this.arrowWidth
				);
				context.lineTo(
					toPos[0] + xVec * this.arrowHeight + yVec * this.arrowWidth,
					toPos[1] + yVec * this.arrowHeight - xVec * this.arrowWidth
				);
				context.lineTo(toPos[0], toPos[1]);
				context.closePath();
				context.stroke();
				context.fill();
			}
		}
	}

	draw(ctx) {
		if (!this.addedToScene) {
			return;
		}
		ctx.globalAlpha = this.alpha;

		if (this.highlighted) this.drawArrow(this.highlightDiff, '#FF0000', ctx);
		this.drawArrow(1, this.edgeColor, ctx);
	}
}

export class UndoConnect {
	constructor(from, to, createConnection, edgeColor, isDirected, cv, lab, anch) {
		this.fromID = from;
		this.toID = to;
		this.connect = createConnection;
		this.color = edgeColor;
		this.directed = isDirected;
		this.curve = cv;
		this.edgeLabel = lab;
		this.anchorPoint = anch;
	}

	undoInitialStep(world) {
		if (this.connect) {
			world.connectEdge(
				this.fromID,
				this.toID,
				this.color,
				this.curve,
				this.directed,
				this.edgeLabel,
				this.anchorPoint
			);
		} else {
			world.disconnect(this.fromID, this.toID);
		}
	}

	addUndoAnimation() {
		return false;
	}
}
