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
// THIS SOFTWARE IS PROVIDED BY David Galles ``AS IS'' AND ANY EXPRESS OR IMPLIED
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

import Algorithm, { addControlToAlgorithmBar, addLabelToAlgorithmBar } from "./Algorithm.js";

const INFO_LABEL_X = 75;
const INFO_LABEL_Y = 20;

const ARRAY_START_X = 100;
const ARRAY_START_Y = 70;

const ARRAY_ELEM_WIDTH = 50;
const ARRAY_ELEM_HEIGHT = 50;

const BUCKETS_START_X = 100;
const BUCKETS_START_Y = 140;

const BUCKET_ELEM_WIDTH = 50;
const BUCKET_ELEM_HEIGHT = 20;
const BUCKET_ELEM_SPACING = 15;

class LSDRadix extends Algorithm {
	constructor(am, w, h) {
		super(am, w, h);

		this.addControls();

		// Useful for memory management
		this.nextIndex = 0;

		// TODO:  Add any code necessary to set up your own algorithm.  Initialize data
		// structures, etc.
		this.setup();
	}

	addControls() {
		this.controls = [];

		addLabelToAlgorithmBar('Comma separated list (e.g. "3,1,2", max 9 elements)');

		// List text field
		this.listField = addControlToAlgorithmBar("Text", "");
		this.listField.onkeydown = this.returnSubmit(
			this.listField,
			this.sortCallback.bind(this),
			60,
			false
		);
		this.controls.push(this.listField);

		// Sort button
		this.findButton = addControlToAlgorithmBar("Button", "Sort");
		this.findButton.onclick = this.sortCallback.bind(this);
		this.controls.push(this.findButton);

		// Clear button
		this.clearButton = addControlToAlgorithmBar("Button", "Clear");
		this.clearButton.onclick = this.clearCallback.bind(this);
		this.controls.push(this.clearButton);
	}

	setup() {
		this.arrayData = new Array();
		this.arrayID = new Array();
		this.arrayDisplay = new Array();
		this.bucketsData = new Array();
		this.bucketsID = new Array();
		this.bucketsDisplay = new Array();
		this.iPointerID = this.nextIndex++;
		this.jPointerID = this.nextIndex++;
		this.infoLabelID = this.nextIndex++;
	}

	reset() {
		// Reset all of your data structures to *exactly* the state they have immediately after the init
		// function is called.  This method is called whenever an "undo" is performed.  Your data
		// structures are completely cleaned, and then all of the actions *up to but not including* the
		// last action are then redone.  If you implement all of your actions through the "implementAction"
		// method below, then all of this work is done for you in the Animation "superclass"

		// Reset the (very simple) memory manager
		this.nextIndex = 0;
	}

	sortCallback() {
		if (this.listField.value != "") {
			this.implementAction(this.clear.bind(this), "");
			const list = this.listField.value;
			this.listField.value = "";
			this.implementAction(this.sort.bind(this), list);
		}
	}

	clearCallback() {
		this.implementAction(this.clear.bind(this), "");
	}

	clear() {
		this.commands = new Array();
		for (let i = 0; i < this.arrayID.length; i++) {
			this.cmd("Delete", this.arrayID[i]);
		}
		this.arrayData = new Array();
		this.arrayID = new Array();
		this.arrayDisplay = new Array();
		this.bucketsData = new Array();
		this.bucketsID = new Array();
		this.bucketsDisplay = new Array();
		return this.commands;
	}

	sort(params) {
		this.commands = new Array();

		this.arrayID = new Array();
		this.arrayData = params
			.split(",")
			.map(Number)
			.filter(x => x)
			.slice(0, 9);
		const length = this.arrayData.length;
		const elemCounts = new Map();
		const letterMap = new Map();

		for (let i = 0; i < length; i++) {
			const count = elemCounts.has(this.arrayData[i]) ? elemCounts.get(this.arrayData[i]) : 0;
			if (count > 0) {
				letterMap.set(this.arrayData[i], "A");
			}
			elemCounts.set(this.arrayData[i], count + 1);
		}

		for (let i = 0; i < length; i++) {
			this.arrayID[i] = this.nextIndex++;
			const xpos = i * ARRAY_ELEM_WIDTH + ARRAY_START_X;
			const ypos = ARRAY_START_Y;

			let arrayDisplay = this.arrayData[i].toString();
			if (letterMap.has(this.arrayData[i])) {
				const currChar = letterMap.get(this.arrayData[i]);
				arrayDisplay += currChar;
				letterMap.set(this.arrayData[i], String.fromCharCode(currChar.charCodeAt(0) + 1));
			}
			this.arrayDisplay[i] = arrayDisplay;
			this.cmd(
				"CreateRectangle",
				this.arrayID[i],
				arrayDisplay,
				ARRAY_ELEM_WIDTH,
				ARRAY_ELEM_HEIGHT,
				xpos,
				ypos
			);
		}

		this.bucketsData = new Array();
		this.bucketsID = new Array();

		for (let i = 0; i < 10; i++) {
			this.bucketsData[i] = [];
			this.bucketsID[i] = [];
			this.bucketsDisplay[i] = [];
			this.bucketsID[i].push(this.nextIndex++);
			const xpos = i * ARRAY_ELEM_WIDTH + BUCKETS_START_X;
			const ypos = BUCKETS_START_Y;
			this.cmd(
				"CreateRectangle",
				this.bucketsID[i],
				i,
				BUCKET_ELEM_WIDTH,
				BUCKET_ELEM_HEIGHT,
				xpos,
				ypos
			);
			this.cmd("SetBackgroundColor", this.bucketsID[i], "#D3D3D3");
		}

		this.cmd(
			"CreateLabel",
			this.infoLabelID,
			"Searching for number with greatest magnitude",
			INFO_LABEL_X,
			INFO_LABEL_Y,
			0
		);
		this.cmd("CreateHighlightCircle", this.iPointerID, "#FF0000", ARRAY_START_X, ARRAY_START_Y);
		this.cmd("SetHighlight", this.iPointerID, 1);
		this.cmd(
			"CreateHighlightCircle",
			this.jPointerID,
			"#0000FF",
			ARRAY_START_X + ARRAY_ELEM_WIDTH,
			ARRAY_START_Y
		);
		this.cmd("SetHighlight", this.jPointerID, 1);
		this.cmd("SetBackgroundColor", this.arrayID[0], "#FFFF00");
		this.cmd("Step");

		let greatest = 0;
		for (let i = 1; i < this.arrayData.length; i++) {
			this.movePointers(greatest, i);
			if (this.arrayData[i] > this.arrayData[greatest]) {
				this.cmd("SetBackgroundColor", this.arrayID[greatest], "#FFFFFF");
				this.cmd("Step");
				greatest = i;
				this.movePointers(greatest, i);
				this.cmd("SetBackgroundColor", this.arrayID[greatest], "#FFFF00");
				this.cmd("Step");
			}
		}

		this.cmd("Delete", this.iPointerID);
		this.cmd("Delete", this.jPointerID);
		this.cmd("Step");

		let digits = Math.floor(Math.log10(this.arrayData[greatest])) + 1;
		digits = digits || 1; // If greatest is 0, above returns NaN, so set to 1 if that happens

		const longData = this.arrayData[greatest];
		this.cmd(
			"SetText",
			this.infoLabelID,
			longData + " has greatest magnitude, number of digits is " + digits
		);
		this.cmd("Step");

		this.cmd("SetBackgroundColor", this.arrayID[greatest], "#FFFFFF");

		for (let i = 0; i < digits; i++) {
			this.cmd("SetText", this.infoLabelID, "Getting digits at position " + (i + 1));
			this.cmd(
				"CreateHighlightCircle",
				this.iPointerID,
				"#0000FF",
				ARRAY_START_X,
				ARRAY_START_Y
			);
			this.cmd("SetHighlight", this.iPointerID, 1);
			for (let j = 0; j < this.arrayData.length; j++) {
				this.cmd(
					"Move",
					this.iPointerID,
					ARRAY_START_X + j * ARRAY_ELEM_WIDTH,
					ARRAY_START_Y
				);
				this.cmd("Step");
				const id = this.nextIndex++;
				const data = this.arrayData[j];
				const display = this.arrayDisplay[j];
				const digit = this.nthDigit(data, i);
				this.bucketsID[digit].push(id);
				this.bucketsData[digit].push(data);
				this.bucketsDisplay[digit].push(display);
				const len = this.bucketsData[digit].length;
				this.cmd(
					"CreateRectangle",
					id,
					display,
					BUCKET_ELEM_WIDTH,
					BUCKET_ELEM_HEIGHT,
					BUCKETS_START_X + digit * BUCKET_ELEM_WIDTH,
					BUCKETS_START_Y + len * BUCKET_ELEM_HEIGHT + len * BUCKET_ELEM_SPACING
				);
				this.cmd(
					"Connect",
					this.bucketsID[digit][this.bucketsID[digit].length - 2],
					id,
					0,
					0,
					1,
					"",
					2
				);
				this.cmd("Step");
			}
			this.cmd("Delete", this.iPointerID);
			this.cmd("Step");
			let index = 0;
			for (let j = 0; j < 10; j++) {
				const idBucket = this.bucketsID[j];
				const dataBucket = this.bucketsData[j];
				const displayBucket = this.bucketsDisplay[j];
				while (dataBucket.length) {
					const labelID = this.nextIndex++;
					const nodeID = idBucket.splice(1, 1)[0];
					const data = dataBucket.shift();
					const display = displayBucket.shift();
					this.cmd(
						"CreateLabel",
						labelID,
						display,
						BUCKETS_START_X + j * BUCKET_ELEM_WIDTH,
						BUCKETS_START_Y + BUCKET_ELEM_HEIGHT + BUCKET_ELEM_SPACING
					);
					this.cmd(
						"Move",
						labelID,
						ARRAY_START_X + index * ARRAY_ELEM_WIDTH,
						ARRAY_START_Y
					);
					this.cmd("Step");
					this.cmd("SetText", this.arrayID[index], display);
					this.cmd("Delete", labelID);
					this.cmd("Step");
					this.cmd("Delete", nodeID);
					if (dataBucket.length) {
						this.cmd("Connect", idBucket[0], idBucket[1]);
						for (let k = 1; k < idBucket.length; k++) {
							this.cmd(
								"Move",
								idBucket[k],
								BUCKETS_START_X + j * BUCKET_ELEM_WIDTH,
								BUCKETS_START_Y + k * BUCKET_ELEM_HEIGHT + k * BUCKET_ELEM_SPACING
							);
						}
						this.cmd("Step");
					}
					this.arrayData[index] = data;
					this.arrayDisplay[index] = display;
					index++;
				}
			}
		}

		this.cmd("Delete", this.infoLabelID);

		return this.commands;
	}

	movePointers(i, j) {
		const iXPos = i * ARRAY_ELEM_WIDTH + ARRAY_START_X;
		const iYPos = ARRAY_START_Y;
		this.cmd("Move", this.iPointerID, iXPos, iYPos);
		const jXPos = j * ARRAY_ELEM_WIDTH + ARRAY_START_X;
		const jYPos = ARRAY_START_Y;
		this.cmd("Move", this.jPointerID, jXPos, jYPos);
		this.cmd("Step");
	}

	swap(i, j) {
		const iLabelID = this.nextIndex++;
		const iXPos = i * ARRAY_ELEM_WIDTH + ARRAY_START_X;
		const iYPos = ARRAY_START_Y;
		this.cmd("CreateLabel", iLabelID, this.displayData[i], iXPos, iYPos);
		const jLabelID = this.nextIndex++;
		const jXPos = j * ARRAY_ELEM_WIDTH + ARRAY_START_X;
		const jYPos = ARRAY_START_Y;
		this.cmd("CreateLabel", jLabelID, this.displayData[j], jXPos, jYPos);
		this.cmd("Settext", this.arrayID[i], "");
		this.cmd("Settext", this.arrayID[j], "");
		this.cmd("Move", iLabelID, jXPos, jYPos);
		this.cmd("Move", jLabelID, iXPos, iYPos);
		this.cmd("Step");
		this.cmd("Settext", this.arrayID[i], this.displayData[j]);
		this.cmd("Settext", this.arrayID[j], this.displayData[i]);
		this.cmd("Delete", iLabelID);
		this.cmd("Delete", jLabelID);
		// Swap data in backend array
		let temp = this.arrayData[i];
		this.arrayData[i] = this.arrayData[j];
		this.arrayData[j] = temp;
		// Swap data in display array
		temp = this.displayData[i];
		this.displayData[i] = this.displayData[j];
		this.displayData[j] = temp;
	}

	nthDigit(data, digit) {
		data = Math.floor(data / Math.pow(10, digit));
		data %= 10;
		return data;
	}

	// Called by our superclass when we get an animation started event -- need to wait for the
	// event to finish before we start doing anything
	disableUI() {
		for (let i = 0; i < this.controls.length; i++) {
			this.controls[i].disabled = true;
		}
	}

	// Called by our superclass when we get an animation completed event -- we can
	/// now interact again.
	enableUI() {
		for (let i = 0; i < this.controls.length; i++) {
			this.controls[i].disabled = false;
		}
	}
}

function init() {
	// eslint-disable-next-line no-undef
	const animManag = initCanvas();
	// eslint-disable-next-line no-undef, no-unused-vars
	const currentAlg = new LSDRadix(animManag, canvas.width, canvas.height);
}

window.onload = init;
