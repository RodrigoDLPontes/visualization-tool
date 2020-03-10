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

import Algorithm, { addControlToAlgorithmBar, addDivisorToAlgorithmBar, addLabelToAlgorithmBar } from './Algorithm.js';
import { act } from '../anim/AnimationMain';

const ARRAY_START_X = 100;
const ARRAY_START_Y = 30;

const MAX_LENGTH = 22;

const PATTERN_START_Y = 100;

const LAST_TABLE_START_Y = 200;

export default class BoyerMoore extends Algorithm {
	constructor(am, w, h) {
		super(am, w, h);
		this.addControls();
		this.nextIndex = 0;
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

		addDivisorToAlgorithmBar();

		// Clear button
		this.clearButton = addControlToAlgorithmBar('Button', 'Clear');
		this.clearButton.onclick = this.clearCallback.bind(this);
		this.controls.push(this.clearButton);
	}

	setup() {
		this.textRowID = [];
		this.comparisonMatrixID = [];
		this.patternTableLableID = this.nextIndex++;
		this.patternTableCharacterID = [];
		this.patternTableIndexID = [];
		this.lastTableLabelID = this.nextIndex++;
		this.lastTableCharacterID = [];
		this.lastTableValueID = [];

		this.animationManager.startNewAnimation();
		this.animationManager.skipForward();
		this.animationManager.clearHistory();
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

	findCallback() {
		if (
			this.textField.value !== '' &&
			this.patternField.value !== '' &&
			this.textField.value.length >= this.patternField.value.length
		) {
			this.implementAction(this.clear.bind(this));
			const text = this.textField.value;
			const pattern = this.patternField.value;
			this.textField.value = '';
			this.patternField.value = '';
			this.implementAction(this.find.bind(this), text, pattern);
		}
	}

	clearCallback() {
		this.implementAction(this.clear.bind(this));
	}

	find(text, pattern) {
		this.commands = [];

		this.textRowID = new Array(text.length);
		this.comparisonMatrixID = new Array(text.length);
		for (let i = 0; i < text.length; i++) {
			this.comparisonMatrixID[i] = new Array(text.length);
		}

		if (text.length <= 14) {
			this.cellSize = 30;
		} else if (text.length <= 17) {
			this.cellSize = 25;
		} else {
			this.cellSize = 20;
		}

		for (let i = 0; i < text.length; i++) {
			const xpos = i * this.cellSize + ARRAY_START_X;
			const ypos = ARRAY_START_Y;
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

		let xpos;
		let ypos;
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

		const lastTable = this.buildLastTable(text.length, pattern);

		const iPointerID = this.nextIndex++;
		const jPointerID = this.nextIndex++;
		this.cmd(
			act.createHighlightCircle,
			iPointerID,
			'#0000FF',
			ARRAY_START_X + (pattern.length - 1) * this.cellSize,
			ARRAY_START_Y,
			this.cellSize / 2
		);
		this.cmd(
			act.createHighlightCircle,
			jPointerID,
			'#0000FF',
			ARRAY_START_X + (pattern.length - 1) * this.cellSize,
			ARRAY_START_Y + this.cellSize,
			this.cellSize / 2
		);

		let i = 0;
		let j = pattern.length - 1;
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
			while (j >= 0 && pattern.charAt(j) === text.charAt(i + j)) {
				this.cmd(act.setBackgroundColor, this.comparisonMatrixID[row][i + j], '#2ECC71');
				j--;
				this.cmd(act.step);
				if (j >= 0) {
					const xpos = (i + j) * this.cellSize + ARRAY_START_X;
					this.cmd(act.move, iPointerID, xpos, ARRAY_START_Y);
					const ypos = (row + 1) * this.cellSize + ARRAY_START_Y;
					this.cmd(act.move, jPointerID, xpos, ypos);
					this.cmd(act.step);
				}
			}
			if (j === -1) {
				i++;
			} else {
				this.cmd(act.setBackgroundColor, this.comparisonMatrixID[row][i + j], '#E74C3C');
				let shift;
				if (text.charAt(i + j) in lastTable) {
					shift = lastTable[text.charAt(i + j)];
				} else {
					shift = -1;
				}
				if (shift < j) {
					i += j - shift;
				} else {
					i++;
				}
			}
			j = pattern.length - 1;
			row++;
			if (i <= text.length - pattern.length) {
				const xpos = (i + j) * this.cellSize + ARRAY_START_X;
				this.cmd(act.move, iPointerID, xpos, ARRAY_START_Y);
				const ypos = (row + 1) * this.cellSize + ARRAY_START_Y;
				this.cmd(act.move, jPointerID, xpos, ypos);
				this.cmd(act.step);
			}
		}

		this.cmd(act.delete, iPointerID);
		this.cmd(act.delete, jPointerID);
		return this.commands;
	}

	buildLastTable(textLength, pattern) {
		// Display labels
		const labelsX = ARRAY_START_X + textLength * this.cellSize + 10;
		this.cmd(act.createLabel, this.patternTableLableID, 'Pattern:', labelsX, PATTERN_START_Y, 0);
		this.cmd(
			act.createLabel,
			this.lastTableLabelID,
			'Last occurence table:',
			labelsX,
			LAST_TABLE_START_Y,
			0
		);

		// Display pattern table
		let patternTableStartX = ARRAY_START_X + textLength * this.cellSize + 80;
		this.patternTableCharacterID = new Array(pattern.length);
		this.patternTableIndexID = new Array(pattern.length);
		for (let i = 0; i < pattern.length; i++) {
			const xpos = patternTableStartX + i * this.cellSize;
			this.patternTableCharacterID[i] = this.nextIndex;
			this.cmd(
				act.createRectangle,
				this.nextIndex++,
				pattern.charAt(i),
				this.cellSize,
				this.cellSize,
				xpos,
				PATTERN_START_Y
			);
			this.patternTableIndexID[i] = this.nextIndex;
			this.cmd(act.createLabel, this.nextIndex++, i, xpos, PATTERN_START_Y + this.cellSize);
		}

		// Create empty last occurence table
		const characters = {}; // This is a HashMap (JavaScript is weird...)
		for (let i = 0; i < pattern.length; i++) {
			characters[pattern.charAt(i)] = null;
		}

		// Display empty last occurence table
		this.lastTableCharacterID = [];
		this.lastTableValueID = [];
		patternTableStartX = ARRAY_START_X + textLength * this.cellSize + 140;
		let j = 0;
		for (const character in characters) {
			const xpos = patternTableStartX + j * this.cellSize;
			this.lastTableCharacterID.push(this.nextIndex);
			this.cmd(
				act.createRectangle,
				this.nextIndex,
				character,
				this.cellSize,
				this.cellSize,
				xpos,
				LAST_TABLE_START_Y
			);
			this.cmd(act.setBackgroundColor, this.nextIndex++, '#D3D3D3');
			characters[character] = this.nextIndex;
			this.lastTableValueID.push(this.nextIndex);
			this.cmd(
				act.createRectangle,
				this.nextIndex++,
				'',
				this.cellSize,
				this.cellSize,
				xpos,
				LAST_TABLE_START_Y + this.cellSize
			);
			j++;
		}
		// Display "*" entry
		const xpos = patternTableStartX + j * this.cellSize;
		this.lastTableCharacterID.push(this.nextIndex);
		this.cmd(
			act.createRectangle,
			this.nextIndex,
			'*',
			this.cellSize,
			this.cellSize,
			xpos,
			LAST_TABLE_START_Y
		);
		this.cmd(act.setBackgroundColor, this.nextIndex++, '#D3D3D3');
		this.lastTableValueID.push(this.nextIndex);
		this.cmd(
			act.createRectangle,
			this.nextIndex++,
			'-1',
			this.cellSize,
			this.cellSize,
			xpos,
			LAST_TABLE_START_Y + this.cellSize
		);

		// Fill out last occurence table
		const lastTable = {};
		for (let i = 0; i < pattern.length; i++) {
			lastTable[pattern.charAt(i)] = i;
			this.cmd(act.setText, characters[pattern.charAt(i)], i);
		}
		return lastTable;
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
		if (this.patternTableCharacterID.length !== 0) {
			this.cmd(act.delete, this.patternTableLableID);
		}
		for (let i = 0; i < this.patternTableCharacterID.length; i++) {
			this.cmd(act.delete, this.patternTableCharacterID[i]);
			this.cmd(act.delete, this.patternTableIndexID[i]);
		}
		this.patternTableCharacterID = [];
		this.patternTableIndexID = [];
		if (this.lastTableCharacterID.length !== 0) {
			this.cmd(act.delete, this.lastTableLabelID);
		}
		for (let i = 0; i < this.lastTableCharacterID.length; i++) {
			this.cmd(act.delete, this.lastTableCharacterID[i]);
			this.cmd(act.delete, this.lastTableValueID[i]);
		}
		this.lastTableCharacterID = [];
		this.lastTableValueID = [];
		return this.commands;
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
