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

import Algorithm, { addControlToAlgorithmBar, addLabelToAlgorithmBar } from "./Algorithm.js";

const SKIP_LIST_START_X = 100;
const SKIP_LIST_START_Y = 400;
const SKIP_LIST_ELEM_SIZE = 40;

const SKIP_LIST_SPACING = 80;

// const TOP_POS_X = 180;
// const TOP_POS_Y = 100;
// const TOP_LABEL_X = 130;
// const TOP_LABEL_Y = 100;

// const TOP_ELEM_WIDTH = 30;
// const TOP_ELEM_HEIGHT = 30;

const VALUE_LABEL_X = 50;
const VALUE_LABEL_Y = 23;
const VALUE_STRING_X = 120;
const VALUE_STRING_Y = 23;

const CF_LABEL_X = 50;
const CF_LABEL_Y = 37;
const CF_STRING_X = 120;
const CF_STRING_Y = 37;

const NINF = "\u2212\u221E"; // Negative infinity
const PINF = "\u221E"; // Positive infinity

class SkipList extends Algorithm {
	constructor(am, w, h) {
		super(am, w, h);

		this.addControls();

		// Useful for memory management
		this.nextIndex = 0;

		this.setup();
	}

	addControls() {
		this.controls = [];

		addLabelToAlgorithmBar("Add");

		// Add's value text field
		this.addValueField = addControlToAlgorithmBar("Text", "");
		this.addValueField.onkeydown = this.returnSubmit(
			this.addValueField,
			this.addRandomlyCallback.bind(this),
			4,
			true
		);
		this.controls.push(this.addValueField);

		addLabelToAlgorithmBar("with");

		this.headsField = addControlToAlgorithmBar("Text", "");
		this.headsField.onkeydown = this.returnSubmit(
			this.headsField,
			this.addWithHeadsCallback.bind(this),
			4,
			true
		);
		this.controls.push(this.headsField);

		addLabelToAlgorithmBar("heads");

		// Add with heads button
		this.addWithHeadsButton = addControlToAlgorithmBar("Button", "Add with heads");
		this.addWithHeadsButton.onclick = this.addWithHeadsCallback.bind(this);
		this.controls.push(this.addWithHeadsButton);

		addLabelToAlgorithmBar("or");

		// Add randomly button
		this.addRandomlyButton = addControlToAlgorithmBar("Button", "Add randomly");
		this.addRandomlyButton.onclick = this.addRandomlyCallback.bind(this);
		this.controls.push(this.addRandomlyButton);

		// Remove's text field
		this.removeField = addControlToAlgorithmBar("Text", "");
		this.removeField.onkeydown = this.returnSubmit(
			this.removeField,
			this.removeCallback.bind(this),
			4,
			true
		);
		this.controls.push(this.removeField);

		// Remove button
		this.removeButton = addControlToAlgorithmBar("Button", "Remove");
		this.removeButton.onclick = this.removeCallback.bind(this);
		this.controls.push(this.removeButton);

		// Get's index text field
		this.getField = addControlToAlgorithmBar("Text", "");
		this.getField.onkeydown = this.returnSubmit(
			this.getField,
			this.getCallback.bind(this),
			4,
			true
		);
		this.controls.push(this.getField);

		// Get button
		this.getButton = addControlToAlgorithmBar("Button", "Get");
		this.getButton.onclick = this.getCallback.bind(this);
		this.controls.push(this.getButton);

		// Clear button
		this.clearButton = addControlToAlgorithmBar("Button", "Clear");
		this.clearButton.onclick = this.clearCallback.bind(this);
		this.controls.push(this.clearButton);
	}

	enableUI() {
		for (let i = 0; i < this.controls.length; i++) {
			this.controls[i].disabled = false;
		}
	}

	disableUI() {
		for (let i = 0; i < this.controls.length; i++) {
			this.controls[i].disabled = true;
		}
	}

	setup() {
		this.commands = new Array();

		this.nodeID = [[this.nextIndex++], [this.nextIndex++]];
		this.data = [[Number.NEGATIVE_INFINITY], [Number.POSITIVE_INFINITY]];
		this.size = 0;

		this.cmd(
			"CreateSkipList",
			this.nodeID[0][0],
			NINF,
			SKIP_LIST_ELEM_SIZE,
			SKIP_LIST_ELEM_SIZE,
			SKIP_LIST_START_X,
			SKIP_LIST_START_Y
		);
		this.cmd(
			"CreateSkipList",
			this.nodeID[1][0],
			PINF,
			SKIP_LIST_ELEM_SIZE,
			SKIP_LIST_ELEM_SIZE,
			SKIP_LIST_START_X + SKIP_LIST_SPACING,
			SKIP_LIST_START_Y
		);
		this.cmd("ConnectSkipList", this.nodeID[0][0], this.nodeID[1][0], 3);

		this.animationManager.StartNewAnimation(this.commands);
		this.animationManager.skipForward();
		this.animationManager.clearHistory();
	}

	reset() {
		this.nextIndex = 0;
		this.nodeID = [[this.nextIndex++], [this.nextIndex++]];
		this.data = [[Number.NEGATIVE_INFINITY], [Number.POSITIVE_INFINITY]];
		this.size = 0;
	}

	addRandomlyCallback() {
		if (this.addValueField.value != "") {
			const addVal = this.addValueField.value;
			this.addValueField.value = "";
			this.headsField.value = "";
			this.implementAction(this.add.bind(this), addVal);
		}
	}

	addWithHeadsCallback() {
		if (this.addValueField.value != "") {
			const addVal = this.addValueField.value;
			this.addValueField.value = "";
			const heads = this.headsField.value;
			this.headsField.value = "";
			this.implementAction(this.add.bind(this), addVal + "," + heads);
		}
	}

	removeCallback() {
		if (this.removeField.value != "") {
			const value = this.removeField.value;
			this.removeField.value = "";
			this.implementAction(this.remove.bind(this), value);
		}
	}

	getCallback() {
		if (this.getField.value != "") {
			const value = this.getField.value;
			this.getField.value = "";
			this.implementAction(this.get.bind(this), value);
		}
	}

	clearCallback() {
		this.implementAction(this.clearAll.bind(this), "");
	}

	add(params) {
		this.commands = new Array();

		const value = parseInt(params.split(",")[0]);

		let heads;
		if (params.split(",").length == 2) {
			heads = params.split(",")[1];
		} else {
			heads = Math.floor(Math.random() * (this.size + 1));
		}
		heads = Math.min(heads, 4);

		const valueLabelId = this.nextIndex++;
		const valueStringId = this.nextIndex++;

		const cfLabelId = this.nextIndex++;
		const cfStringId = this.nextIndex++;

		let headsString = "";
		for (let i = 0; i < heads; i++) {
			headsString += "H";
		}
		headsString += "T";

		this.cmd("CreateLabel", valueLabelId, "Value to add:", VALUE_LABEL_X, VALUE_LABEL_Y);
		this.cmd("CreateLabel", valueStringId, value, VALUE_STRING_X, VALUE_STRING_Y);
		this.cmd("CreateLabel", cfLabelId, "Coin Flipper:", CF_LABEL_X, CF_LABEL_Y);
		this.cmd("CreateLabel", cfStringId, headsString, CF_STRING_X, CF_STRING_Y);
		this.cmd("Step");

		// Add levels
		for (let row = this.nodeID[0].length; row <= heads; row++) {
			const rightPhantomsCol = this.nodeID.length - 1;
			this.data[0][row] = Number.NEGATIVE_INFINITY;
			this.nodeID[0][row] = this.nextIndex++;
			this.cmd(
				"CreateSkipList",
				this.nodeID[0][row],
				NINF,
				SKIP_LIST_ELEM_SIZE,
				SKIP_LIST_ELEM_SIZE,
				SKIP_LIST_START_X,
				SKIP_LIST_START_Y - SKIP_LIST_SPACING * row
			);
			this.data[rightPhantomsCol][row] = Number.POSITIVE_INFINITY;
			this.nodeID[rightPhantomsCol][row] = this.nextIndex++;
			this.cmd(
				"CreateSkipList",
				this.nodeID[rightPhantomsCol][row],
				PINF,
				SKIP_LIST_ELEM_SIZE,
				SKIP_LIST_ELEM_SIZE,
				SKIP_LIST_START_X + SKIP_LIST_SPACING * rightPhantomsCol,
				SKIP_LIST_START_Y - SKIP_LIST_SPACING * row
			);
			this.cmd("ConnectSkipList", this.nodeID[0][row], this.nodeID[rightPhantomsCol][row], 3);
			this.cmd("ConnectSkipList", this.nodeID[0][row - 1], this.nodeID[0][row], 0);
			this.cmd(
				"ConnectSkipList",
				this.nodeID[rightPhantomsCol][row - 1],
				this.nodeID[rightPhantomsCol][row],
				0
			);
			this.cmd("Step");
		}

		// Find column where new element will be inserted
		let newCol = 1;
		while (value > this.data[newCol][0]) {
			newCol++;
		}

		// Move IDs and data in next columns to the right
		for (let col = this.nodeID.length - 1; col >= newCol; col--) {
			this.nodeID[col + 1] = this.nodeID[col];
			this.data[col + 1] = this.data[col];
		}
		this.nodeID[newCol] = [];
		this.data[newCol] = [];

		// Traverse and add
		let col = 0;
		let row = this.nodeID[0].length - 1;

		const highlightID = this.nextIndex++;
		this.cmd(
			"CreateHighlightCircle",
			highlightID,
			"#FF0000",
			SKIP_LIST_START_X,
			SKIP_LIST_START_Y - SKIP_LIST_SPACING * row
		);
		this.cmd("SetHighlight", highlightID, 1);
		this.cmd("Step");

		let foundDuplicate = false;
		while (row >= 0) {
			// Move right until next element is greater or equal
			let nextCol = this.getNextCol(col, row);
			if (value == this.data[nextCol][row]) {
				foundDuplicate = true;
				break;
			}
			while (value > this.data[nextCol][row]) {
				this.cmd(
					"Move",
					highlightID,
					SKIP_LIST_START_X + SKIP_LIST_SPACING * nextCol,
					SKIP_LIST_START_Y - SKIP_LIST_SPACING * row
				);
				this.cmd("Step");
				col = nextCol;
				nextCol = this.getNextCol(col, row);
			}

			// Move highlight circle downward
			row--;
			if (row >= 0) {
				this.cmd(
					"Move",
					highlightID,
					SKIP_LIST_START_X + SKIP_LIST_SPACING * col,
					SKIP_LIST_START_Y - SKIP_LIST_SPACING * row
				);
				this.cmd("Step");
			}
		}

		// Add nodes bottom-up to the new column if no duplicate has been found
		if (!foundDuplicate) {
			this.shiftColumns(newCol);
			row++;
			// Having a highlight circle in the previous ID causes an object to look weird (this
			// seems to be an already existing bug) Creating a random object before it is a workaround
			this.cmd("CreateCircle", this.nextIndex++, "", -100, -100, 0);

			while (row <= heads) {
				this.data[newCol][row] = value;
				this.nodeID[newCol][row] = this.nextIndex++;
				this.cmd(
					"CreateSkipList",
					this.nodeID[newCol][row],
					value,
					SKIP_LIST_ELEM_SIZE,
					SKIP_LIST_ELEM_SIZE,
					SKIP_LIST_START_X + SKIP_LIST_SPACING * newCol,
					SKIP_LIST_START_Y - SKIP_LIST_SPACING * row
				);
				const prevCol = this.getPrevCol(newCol, row);
				const nextCol = this.getNextCol(newCol, row);
				this.cmd("Disconnect", this.nodeID[prevCol][row], this.nodeID[nextCol][row]);
				this.cmd("ConnectSkipList", this.nodeID[prevCol][row], this.nodeID[newCol][row], 3);
				this.cmd("ConnectSkipList", this.nodeID[newCol][row], this.nodeID[nextCol][row], 3);
				if (row != 0) {
					this.cmd(
						"ConnectSkipList",
						this.nodeID[newCol][row - 1],
						this.nodeID[newCol][row],
						0
					);
				}
				this.cmd("Step");

				this.cmd(
					"Move",
					highlightID,
					SKIP_LIST_START_X + SKIP_LIST_SPACING * newCol,
					SKIP_LIST_START_Y - SKIP_LIST_SPACING * row
				);
				this.cmd("Step");
				row++;
			}
		}

		this.cmd("Delete", valueLabelId);
		this.cmd("Delete", valueStringId);
		this.cmd("Delete", cfLabelId);
		this.cmd("Delete", cfStringId);
		this.cmd("Delete", highlightID);

		this.size++;

		return this.commands;
	}

	remove(params) {
		this.commands = new Array();

		const value = parseInt(params);

		const valueLabelId = this.nextIndex++;
		const valueStringId = this.nextIndex++;

		this.cmd("CreateLabel", valueLabelId, "Value to remove:", VALUE_LABEL_X, VALUE_LABEL_Y);
		this.cmd("CreateLabel", valueStringId, value, VALUE_STRING_X, VALUE_STRING_Y);
		this.cmd("Step");

		// Traverse and remove
		let col = 0;
		let row = this.nodeID[0].length - 1;
		let removedCol = -1;

		const highlightID = this.nextIndex++;
		this.cmd(
			"CreateHighlightCircle",
			highlightID,
			"#FF0000",
			SKIP_LIST_START_X,
			SKIP_LIST_START_Y - SKIP_LIST_SPACING * row
		);
		this.cmd("Step");

		while (row >= 0) {
			// Move right until next element is greater or equal
			let nextCol = this.getNextCol(col, row);
			while (value > this.data[nextCol][row]) {
				this.cmd(
					"Move",
					highlightID,
					SKIP_LIST_START_X + SKIP_LIST_SPACING * nextCol,
					SKIP_LIST_START_Y - SKIP_LIST_SPACING * row
				);
				this.cmd("Step");
				col = nextCol;
				nextCol = this.getNextCol(col, row);
			}

			if (value == this.data[nextCol][row]) {
				removedCol = nextCol;
				col = nextCol;
				this.cmd(
					"Move",
					highlightID,
					SKIP_LIST_START_X + SKIP_LIST_SPACING * col,
					SKIP_LIST_START_Y - SKIP_LIST_SPACING * row
				);
				this.cmd("Step");

				while (row >= 0) {
					nextCol = this.getNextCol(col, row);
					const prevCol = this.getPrevCol(col, row);
					this.cmd("Disconnect", this.nodeID[prevCol][row], this.nodeID[col][row]);
					this.cmd("Disconnect", this.nodeID[col][row], this.nodeID[nextCol][row]);
					if (this.nodeID[col][row + 1] != null) {
						this.cmd("Disconnect", this.nodeID[col][row + 1], this.nodeID[col][row]);
					}
					this.cmd(
						"ConnectSkipList",
						this.nodeID[prevCol][row],
						this.nodeID[nextCol][row],
						3
					);
					this.cmd("Delete", this.nodeID[col][row]);
					this.cmd("Step");

					row--;
					if (row != -1) {
						this.cmd(
							"Move",
							highlightID,
							SKIP_LIST_START_X + SKIP_LIST_SPACING * col,
							SKIP_LIST_START_Y - SKIP_LIST_SPACING * row
						);
						this.cmd("Step");
					}
				}
			} else {
				row--;
				if (row != -1) {
					this.cmd(
						"Move",
						highlightID,
						SKIP_LIST_START_X + SKIP_LIST_SPACING * col,
						SKIP_LIST_START_Y - SKIP_LIST_SPACING * row
					);
					this.cmd("Step");
				}
			}
		}

		this.cmd("Delete", valueLabelId);
		this.cmd("Delete", valueStringId);
		this.cmd("Delete", highlightID);

		if (removedCol != -1) {
			// Shift ID and data columns to the left (already erases last column)
			for (let col = removedCol; col < this.nodeID.length - 1; col++) {
				this.nodeID[col] = this.nodeID[col + 1];
				this.data[col] = this.data[col + 1];
			}
			this.nodeID.pop();
			this.data.pop();

			this.shiftColumns(removedCol);
		}

		// Remove empty rows
		// Find tallest column of actual values (not phantoms)
		let maxHeight = 1;
		for (let col = 1; col < this.nodeID.length - 1; col++) {
			maxHeight = Math.max(maxHeight, this.nodeID[col].length);
		}
		// Remove rows above tallest column (so empty rows)
		for (let row = this.nodeID[0].length - 1; row >= maxHeight; row--) {
			this.data[0].pop();
			const leftPhantomID = this.nodeID[0].pop();
			this.cmd("Delete", leftPhantomID);
			const rightPhantomsCol = this.nodeID.length - 1;
			this.data[rightPhantomsCol].pop();
			const rightPhantomID = this.nodeID[rightPhantomsCol].pop();
			this.cmd("Delete", rightPhantomID);
		}
		this.cmd("Step");

		this.size--;

		return this.commands;
	}

	get(params) {
		this.commands = new Array();

		const value = parseInt(params);

		let col = 0;
		let row = this.nodeID[0].length - 1;
		// let nextCol = this.getNextCol(col, row);

		const highlightID = this.nextIndex++;
		this.cmd(
			"CreateHighlightCircle",
			highlightID,
			"#FF0000",
			SKIP_LIST_START_X,
			SKIP_LIST_START_Y - SKIP_LIST_SPACING * row
		);
		this.cmd("SetHighlight", highlightID, 1);
		this.cmd("Step");

		while (row >= 0 && value != this.data[col][row]) {
			// Move right until next element is greater or equal
			let nextCol = this.getNextCol(col, row);
			while (value >= this.data[nextCol][row]) {
				this.cmd(
					"Move",
					highlightID,
					SKIP_LIST_START_X + SKIP_LIST_SPACING * nextCol,
					SKIP_LIST_START_Y - SKIP_LIST_SPACING * row
				);
				this.cmd("Step");
				col = nextCol;
				nextCol = this.getNextCol(col, row);
			}

			// Move highlight circle downward if data has not been found
			if (value != this.data[col][row]) {
				row--;
				this.cmd(
					"Move",
					highlightID,
					SKIP_LIST_START_X + SKIP_LIST_SPACING * col,
					SKIP_LIST_START_Y - SKIP_LIST_SPACING * row
				);
				this.cmd("Step");
			}
		}

		this.cmd("Delete", highlightID);

		return this.commands;
	}

	// Shifts columns on screen
	shiftColumns(col) {
		for (; col < this.nodeID.length; col++) {
			for (let row = 0; row < this.nodeID[col].length; row++) {
				if (this.nodeID[col][row] != null) {
					this.cmd(
						"Move",
						this.nodeID[col][row],
						SKIP_LIST_START_X + SKIP_LIST_SPACING * col,
						SKIP_LIST_START_Y - SKIP_LIST_SPACING * row
					);
				}
			}
		}
		this.cmd("Step");
	}

	// Gets the column of the next node ("right pointer")
	getNextCol(col, row) {
		col++;
		while (this.data[col][row] == null) {
			col++;
		}
		return col;
	}

	// Gets the column of the previous node ("left pointer")
	getPrevCol(col, row) {
		col--;
		while (this.data[col][row] == null) {
			col--;
		}
		return col;
	}

	clearAll() {
		this.commands = new Array();

		for (let col = 0; col < this.nodeID.length; col++) {
			for (let row = 0; row < this.nodeID[col].length; row++) {
				this.cmd("Delete", this.nodeID[col][row]);
			}
		}

		this.nodeID = [[this.nextIndex++], [this.nextIndex++]];
		this.data = [[Number.NEGATIVE_INFINITY], [Number.POSITIVE_INFINITY]];
		this.size = 0;

		this.cmd(
			"CreateSkipList",
			this.nodeID[0][0],
			NINF,
			SKIP_LIST_ELEM_SIZE,
			SKIP_LIST_ELEM_SIZE,
			SKIP_LIST_START_X,
			SKIP_LIST_START_Y
		);
		this.cmd(
			"CreateSkipList",
			this.nodeID[1][0],
			PINF,
			SKIP_LIST_ELEM_SIZE,
			SKIP_LIST_ELEM_SIZE,
			SKIP_LIST_START_X + SKIP_LIST_SPACING,
			SKIP_LIST_START_Y
		);
		this.cmd("ConnectSkipList", this.nodeID[0][0], this.nodeID[1][0], 3);
		this.cmd("Step");

		return this.commands;
	}
}

function init() {
    // eslint-disable-next-line no-undef
    const animManag = initCanvas();
    // eslint-disable-next-line no-undef, no-unused-vars
    const currentAlg = new SkipList(animManag, canvas.width, canvas.height);
}

window.onload = init;
