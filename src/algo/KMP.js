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

import Algorithm, { addControlToAlgorithmBar, addLabelToAlgorithmBar } from './Algorithm.js';
import { act } from '../anim/AnimationMain';

const ARRAY_START_X = 100;
const ARRAY_START_Y = 30;

const MAX_LENGTH = 22;

const FAILURE_TABLE_START_Y = 100;

export default class KMP extends Algorithm {
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

		addLabelToAlgorithmBar('Text');

		// Text text field
		this.textField = addControlToAlgorithmBar('Text', '');
		this.textField.onkeydown = this.returnSubmit(
			this.textField,
			this.findCallback.bind(this),
			MAX_LENGTH,
			false
		);
		this.controls.push(this.textField);

		addLabelToAlgorithmBar('Pattern');

		// Pattern text field
		this.patternField = addControlToAlgorithmBar('Text', '');
		this.patternField.onkeydown = this.returnSubmit(
			this.patternField,
			this.findCallback.bind(this),
			MAX_LENGTH,
			false
		);
		this.controls.push(this.patternField);

		// Find button
		this.findButton = addControlToAlgorithmBar('Button', 'Find');
		this.findButton.onclick = this.findCallback.bind(this);
		this.controls.push(this.findButton);

		// Clear button
		this.clearButton = addControlToAlgorithmBar('Button', 'Clear');
		this.clearButton.onclick = this.clearCallback.bind(this);
		this.controls.push(this.clearButton);
	}

	setup() {
		this.textRowID = [];
		this.comparisonMatrixID = [];
		this.failureTableLabelID = this.nextIndex++;
		this.failureTableCharacterID = [];
		this.failureTableValueID = [];
	}

	reset() {
		// Reset all of your data structures to *exactly* the state they have immediately after the init
		// function is called.  This method is called whenever an "undo" is performed.  Your data
		// structures are completely cleaned, and then all of the actions *up to but not including* the
		// last action are then redone.  If you implement all of your actions through the "implementAction"
		// method below, then all of this work is done for you in the Animation "superexport default class"

		// Reset the (very simple) memory manager
		this.nextIndex = 0;
	}

	findCallback() {
		if (
			this.textField.value !== '' &&
			this.patternField.value !== '' &&
			this.textField.value.length >= this.patternField.value.length
		) {
			this.implementAction(this.clear.bind(this), '');
			const text = this.textField.value;
			const pattern = this.patternField.value;
			this.textField.value = '';
			this.patternField.value = '';
			this.implementAction(this.find.bind(this), text + ',' + pattern);
		}
	}

	clearCallback() {
		this.implementAction(this.clear.bind(this), '');
	}

	find(params) {
		this.commands = [];

		const text = params.split(',')[0];
		const pattern = params.split(',')[1];

		if (text.length <= 14) {
			this.cellSize = 30;
		} else if (text.length <= 17) {
			this.cellSize = 25;
		} else {
			this.cellSize = 20;
		}

		this.textRowID = new Array(text.length);
		this.comparisonMatrixID = new Array(text.length);
		for (let i = 0; i < text.length; i++) {
			this.comparisonMatrixID[i] = new Array(text.length);
		}

		let xpos, ypos;
		for (let i = 0; i < text.length; i++) {
			xpos = i * this.cellSize + ARRAY_START_X;
			ypos = ARRAY_START_Y;
			this.textRowID[i] = this.nextIndex;
			this.cmd(
				act.createRectangle,
				this.nextIndex,
				text.charAt(i),
				this.cellSize,
				this.cellSize,
				xpos,
				ypos
			);
			this.cmd(act.setBackgroundColor, this.nextIndex++, '#D3D3D3');
		}

		for (let row = 0; row < text.length; row++) {
			for (let col = 0; col < text.length; col++) {
				xpos = col * this.cellSize + ARRAY_START_X;
				ypos = (row + 1) * this.cellSize + ARRAY_START_Y;
				this.comparisonMatrixID[row][col] = this.nextIndex;
				this.cmd(
					act.createRectangle,
					this.nextIndex++,
					'',
					this.cellSize,
					this.cellSize,
					xpos,
					ypos
				);
			}
		}

		const failureTable = this.buildFailureTable(text.length, pattern);

		const iPointerID = this.nextIndex++;
		const jPointerID = this.nextIndex++;
		this.cmd(
			act.createHighlightCircle,
			iPointerID,
			'#0000FF',
			ARRAY_START_X,
			ARRAY_START_Y,
			this.cellSize / 2
		);
		this.cmd(
			act.createHighlightCircle,
			jPointerID,
			'#0000FF',
			ARRAY_START_X,
			ARRAY_START_Y + this.cellSize,
			this.cellSize / 2
		);

		let i = 0;
		let j = 0;
		let row = 0;
		while (i <= text.length - pattern.length) {
			for (let k = i; k < i + pattern.length; k++) {
				this.cmd(
					act.setText,
					this.comparisonMatrixID[row][k],
					pattern.charAt(k - i),
					xpos,
					ypos
				);
			}
			this.cmd(act.step);
			while (j < pattern.length && pattern.charAt(j) === text.charAt(i + j)) {
				this.cmd(act.setBackgroundColor, this.comparisonMatrixID[row][i + j], '#2ECC71');
				j++;
				this.cmd(act.step);
				if (j < pattern.length) {
					xpos = (i + j) * this.cellSize + ARRAY_START_X;
					this.cmd(act.move, iPointerID, xpos, ARRAY_START_Y);
					ypos = (row + 1) * this.cellSize + ARRAY_START_Y;
					this.cmd(act.move, jPointerID, xpos, ypos);
					this.cmd(act.step);
				}
			}
			if (j === 0) {
				this.cmd(act.setBackgroundColor, this.comparisonMatrixID[row][i], '#E74C3C');
				i++;
			} else {
				if (j !== pattern.length) {
					this.cmd(act.setBackgroundColor, this.comparisonMatrixID[row][i + j], '#E74C3C');
				}
				const nextAlignment = failureTable[j - 1];
				i += j - nextAlignment;
				j = nextAlignment;
			}
			row++;
			if (i <= text.length - pattern.length) {
				xpos = (i + j) * this.cellSize + ARRAY_START_X;
				this.cmd(act.move, iPointerID, xpos, ARRAY_START_Y);
				ypos = (row + 1) * this.cellSize + ARRAY_START_Y;
				this.cmd(act.move, jPointerID, xpos, ypos);
				this.cmd(act.step);
			}
		}

		this.cmd(act.delete, iPointerID);
		this.cmd(act.delete, jPointerID);
		return this.commands;
	}

	buildFailureTable(textLength, pattern) {
		// Display label
		const labelX = ARRAY_START_X + textLength * this.cellSize + 10;
		this.cmd(
			act.createLabel,
			this.failureTableLabelID,
			'Failure table:',
			labelX,
			FAILURE_TABLE_START_Y,
			0
		);

		// Display empty failure table
		const tableStartX = ARRAY_START_X + textLength * this.cellSize + 100;
		this.failureTableCharacterID = new Array(pattern.length);
		this.failureTableValueID = new Array(pattern.length);
		for (let i = 0; i < pattern.length; i++) {
			const xpos = tableStartX + i * this.cellSize;
			this.failureTableCharacterID[i] = this.nextIndex++;
			this.cmd(
				act.createRectangle,
				this.failureTableCharacterID[i],
				pattern.charAt(i),
				this.cellSize,
				this.cellSize,
				xpos,
				FAILURE_TABLE_START_Y
			);
			this.cmd(act.setBackgroundColor, this.failureTableCharacterID[i], '#D3D3D3');
			this.failureTableValueID[i] = this.nextIndex++;
			this.cmd(
				act.createRectangle,
				this.failureTableValueID[i],
				'',
				this.cellSize,
				this.cellSize,
				xpos,
				FAILURE_TABLE_START_Y + this.cellSize
			);
		}
		this.cmd(act.step);

		// Display pointers and set first value to 0
		const iPointerID = this.nextIndex++;
		const jPointerID = this.nextIndex++;
		this.cmd(
			act.createHighlightCircle,
			iPointerID,
			'#0000FF',
			tableStartX,
			FAILURE_TABLE_START_Y,
			this.cellSize / 2
		);
		this.cmd(
			act.createHighlightCircle,
			jPointerID,
			'#FF0000',
			tableStartX + this.cellSize,
			FAILURE_TABLE_START_Y,
			this.cellSize / 2
		);
		this.cmd(act.setText, this.failureTableValueID[0], 0);
		this.cmd(act.step);

		const failureTable = [];
		failureTable[0] = 0;
		let i = 0;
		let j = 1;
		while (j < pattern.length) {
			if (pattern.charAt(i) === pattern.charAt(j)) {
				i++;
				failureTable[j] = i;
				this.cmd(act.setText, this.failureTableValueID[j], i);
				j++;
				if (j < pattern.length) {
					this.cmd(
						act.move,
						iPointerID,
						tableStartX + i * this.cellSize,
						FAILURE_TABLE_START_Y
					);
					this.cmd(
						act.move,
						jPointerID,
						tableStartX + j * this.cellSize,
						FAILURE_TABLE_START_Y
					);
				}
				this.cmd(act.step);
			} else {
				if (i === 0) {
					failureTable[j] = i;
					this.cmd(act.setText, this.failureTableValueID[j], i);
					j++;
					if (j < pattern.length) {
						this.cmd(
							act.move,
							jPointerID,
							tableStartX + j * this.cellSize,
							FAILURE_TABLE_START_Y
						);
					}
					this.cmd(act.step);
				} else {
					i = failureTable[i - 1];
					this.cmd(
						act.move,
						iPointerID,
						tableStartX + i * this.cellSize,
						FAILURE_TABLE_START_Y
					);
					this.cmd(act.step);
				}
			}
		}

		this.cmd(act.delete, iPointerID);
		this.cmd(act.delete, jPointerID);

		return failureTable;
	}

	clear() {
		this.commands = [];
		for (let i = 0; i < this.textRowID.length; i++) {
			this.cmd(act.delete, this.textRowID[i]);
		}
		this.textRowID = [];
		for (let i = 0; i < this.comparisonMatrixID.length; i++) {
			for (let j = 0; j < this.comparisonMatrixID.length; j++) {
				this.cmd(act.delete, this.comparisonMatrixID[i][j]);
			}
		}
		this.comparisonMatrixID = [];
		if (this.failureTableValueID.length !== 0) {
			this.cmd(act.delete, this.failureTableLabelID);
		}
		for (let i = 0; i < this.failureTableCharacterID.length; i++) {
			this.cmd(act.delete, this.failureTableCharacterID[i]);
			this.cmd(act.delete, this.failureTableValueID[i]);
		}
		this.failureTableCharacterID = [];
		this.failureTableValueID = [];
		return this.commands;
	}

	// Called by our superexport default class when we get an animation started event -- need to wait for the
	// event to finish before we start doing anything
	disableUI() {
		for (let i = 0; i < this.controls.length; i++) {
			this.controls[i].disabled = true;
		}
	}

	// Called by our superexport default class when we get an animation completed event -- we can
	/// now interact again.
	enableUI() {
		for (let i = 0; i < this.controls.length; i++) {
			this.controls[i].disabled = false;
		}
	}
}
