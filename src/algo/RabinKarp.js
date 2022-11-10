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

import Algorithm, {
	addControlToAlgorithmBar,
	addDivisorToAlgorithmBar,
	addLabelToAlgorithmBar,
} from './Algorithm.js';
import { act } from '../anim/AnimationMain';

const ARRAY_START_X = 100;
const ARRAY_START_Y = 30;

const MAX_LENGTH = 22;

// const LOWER_A_CHAR_CODE = 97;

const BASE_LABEL_Y = 45;
const CHARACTER_VALUES_LABEL_Y = 60;
const TEXT_HASH_LABEL_START_Y = 100;
const PATTERN_HASH_LABEL_START_Y = 115;

const COMP_COUNT_X = 575;
const COMP_COUNT_Y = 30;

const CODE_Y = 180;

export default class RabinKarp extends Algorithm {
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
			false,
		);
		this.controls.push(this.textField);

		addLabelToAlgorithmBar('Pattern');

		// Pattern text field
		this.patternField = addControlToAlgorithmBar('Text', '');
		this.patternField.onkeydown = this.returnSubmit(
			this.patternField,
			this.findCallback.bind(this),
			MAX_LENGTH,
			false,
		);
		this.controls.push(this.patternField);

		// Find button
		this.findButton = addControlToAlgorithmBar('Button', 'Find');
		this.findButton.onclick = this.findCallback.bind(this);
		this.controls.push(this.findButton);

		//Base value text field
		this.baseField = addControlToAlgorithmBar('Base', '');
		this.baseField.onkeydown = this.returnSubmit(
			this.baseField,
			this.findCallback.bind(this),
			4,
			true,
		);
		this.controls.push(this.baseField);

		// Base button
		this.baseButton = addControlToAlgorithmBar('Button', 'Change Base');
		this.baseButton.onclick = this.baseCallback.bind(this);
		this.controls.push(this.baseButton);

		addDivisorToAlgorithmBar();

		// Clear button
		this.clearButton = addControlToAlgorithmBar('Button', 'Clear');
		this.clearButton.onclick = this.clearCallback.bind(this);
		this.controls.push(this.clearButton);
	}

	setup() {
		this.commands = [];
		this.textRowID = [];
		this.comparisonMatrixID = [];
		this.baseLabelID = this.nextIndex++;
		this.characterValuesLabelID = this.nextIndex++;
		this.textHashLabelID = this.nextIndex++;
		this.textHashCalculationID = this.nextIndex++;
		this.patternHashLabelID = this.nextIndex++;
		this.patternHashCalculationID = this.nextIndex++;

		this.baseValue = 1;

		this.comparisonCountID = this.nextIndex++;

		this.compCount = 0;
		this.cmd(act.createLabel, this.comparisonCountID, '', COMP_COUNT_X, COMP_COUNT_Y, 0);

		this.code = [
			['procedure RabinKarp(text, pattern)'],
			['     m <- length of pattern, n <- length of text'],
			['     patternHash ← rolling hash of pattern'],
			['     textHash ← rolling hash of first m characters of text'],
			['     i <- 0'],
			['     while i <= n - m'],
			['          if patternHash = textHash'],
			['               j <- 0'],
			['               while j < m and text[i + j] = pattern[j]'],
			['                    j <- j + 1'],
			['               if j = m'],
			['                    match found at i'],
			['          i <- i + 1'],
			['          if i <= n - m'],
			['               textHash <- new hash of text, from i to i + m'],
			['end procedure'],
		];
		this.codeID = [];

		this.animationManager.startNewAnimation(this.commands);
		this.animationManager.skipForward();
		this.animationManager.clearHistory();
	}

	reset() {
		this.nextIndex = 0;
		this.textRowID = [];
		this.comparisonMatrixID = [];
		this.baseLabelID = this.nextIndex++;
		this.characterValuesLabelID = this.nextIndex++;
		this.textHashLabelID = this.nextIndex++;
		this.textHashCalculationID = this.nextIndex++;
		this.patternHashLabelID = this.nextIndex++;
		this.patternHashCalculationID = this.nextIndex++;
		this.comparisonCountID = this.nextIndex++;
		this.compCount = 0;
		this.codeID = [];
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

	baseCallback() {
		const val = parseInt(this.baseField.value);
		if (this.baseField.value !== '' && val !== 0) {
			this.baseField.value = '';
			this.baseValue = val;
		}
	}

	clearCallback() {
		this.implementAction(this.clear.bind(this));
	}

	find(text, pattern) {
		this.commands = [];

		// Filter non-letters from string and make lower case
		text = text.replace(/[^a-zA-Z]/g, '').toLowerCase();
		pattern = pattern.replace(/[^a-zA-Z]/g, '').toLowerCase();

		const maxRows = text.length - pattern.length + 1;
		if (maxRows <= 14) {
			this.cellSize = 30;
		} else if (maxRows <= 17) {
			this.cellSize = 25;
		} else {
			this.cellSize = 20;
		}

		this.textRowID = new Array(text.length);
		this.comparisonMatrixID = new Array(maxRows);
		for (let i = 0; i < maxRows; i++) {
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
				ypos,
			);
			this.cmd(act.setBackgroundColor, this.nextIndex++, '#D3D3D3');
		}

		for (let row = 0; row < maxRows; row++) {
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
					ypos,
				);
			}
		}

		const labelsX = ARRAY_START_X + text.length * this.cellSize + 10;
		this.cmd(
			act.createLabel,
			this.baseLabelID,
			`Base constant = ${this.baseValue}`,
			labelsX,
			BASE_LABEL_Y,
			0,
		);
		this.cmd(
			act.createLabel,
			this.characterValuesLabelID,
			'Character values: a = 0, b = 1, ..., z = 25',
			labelsX,
			CHARACTER_VALUES_LABEL_Y,
			0,
		);
		this.cmd(
			act.createLabel,
			this.textHashLabelID,
			'Text hash:',
			labelsX,
			TEXT_HASH_LABEL_START_Y,
			0,
		);
		this.cmd(
			act.createLabel,
			this.patternHashLabelID,
			'Pattern hash:',
			labelsX,
			PATTERN_HASH_LABEL_START_Y,
			0,
		);
		this.cmd(act.move, this.comparisonCountID, labelsX, COMP_COUNT_Y);
		this.cmd(act.setText, this.comparisonCountID, 'Comparison Count: ' + this.compCount);

		this.codeID = this.addCodeToCanvasBase(this.code, labelsX, CODE_Y);

		let textCalculation = '';
		let textHash = 0;
		let patternCalculation = '';
		let patternHash = 0;
		const base = Math.pow(this.baseValue, pattern.length - 1);
		let runningBase = base;
		for (let i = 0; i < pattern.length; i++) {
			textHash += (text.charCodeAt(i) - 97) * runningBase;
			textCalculation += `(${text.charAt(i)} * ${runningBase}) + `;
			patternHash += (pattern.charCodeAt(i) - 97) * runningBase;
			patternCalculation += `(${pattern.charAt(i)} * ${runningBase}) + `;
			runningBase /= this.baseValue;
		}
		textCalculation =
			textCalculation.substring(0, textCalculation.length - 2) + ' = ' + textHash;
		patternCalculation =
			patternCalculation.substring(0, patternCalculation.length - 2) + ' = ' + patternHash;
		const calculationsX = ARRAY_START_X + text.length * this.cellSize + 100;
		this.cmd(
			act.createLabel,
			this.textHashCalculationID,
			textCalculation,
			calculationsX,
			TEXT_HASH_LABEL_START_Y,
			0,
		);
		this.cmd(
			act.createLabel,
			this.patternHashCalculationID,
			patternCalculation,
			calculationsX,
			PATTERN_HASH_LABEL_START_Y,
			0,
		);

		const iPointerID = this.nextIndex++;
		const jPointerID = this.nextIndex++;

		this.highlight(2, 0);
		this.cmd(act.step);
		this.unhighlight(2, 0);
		this.highlight(3, 0);
		this.cmd(act.step);
		this.unhighlight(3, 0);

		this.highlight(5, 0);
		let row = 0;
		for (let i = 0; i <= text.length - pattern.length; i++) {
			for (let k = i; k < i + pattern.length; k++) {
				this.cmd(
					act.setText,
					this.comparisonMatrixID[row][k],
					pattern.charAt(k - i),
					xpos,
					ypos,
				);
			}
			this.cmd(act.step);
			this.highlight(6, 0);
			this.cmd(act.step);
			if (patternHash === textHash) {
				this.unhighlight(6, 0);
				this.highlight(7, 0);
				xpos = i * this.cellSize + ARRAY_START_X;
				this.cmd(act.createHighlightCircle, iPointerID, '#0000FF', xpos, ARRAY_START_Y);
				ypos = (row + 1) * this.cellSize + ARRAY_START_Y;
				this.cmd(act.createHighlightCircle, jPointerID, '#0000FF', xpos, ypos);
				this.cmd(act.step);
				this.unhighlight(7, 0);
				this.highlight(8, 0);
				this.cmd(act.step);
				let j = 0;
				while (j < pattern.length && pattern.charAt(j) === text.charAt(i + j)) {
					this.cmd(
						act.setText,
						this.comparisonCountID,
						'Comparison Count: ' + ++this.compCount,
					);
					this.cmd(
						act.setBackgroundColor,
						this.comparisonMatrixID[row][i + j],
						'#2ECC71',
					);
					j++;
					this.highlight(9, 0);
					if (j !== pattern.length) {
						xpos = (i + j) * this.cellSize + ARRAY_START_X;
						this.cmd(act.move, iPointerID, xpos, ARRAY_START_Y);
						ypos = (row + 1) * this.cellSize + ARRAY_START_Y;
						this.cmd(act.move, jPointerID, xpos, ypos);
					}
					this.cmd(act.step);
					this.unhighlight(9, 0);
				}
				this.unhighlight(8, 0);
				this.highlight(10, 0);
				this.cmd(act.step);
				this.unhighlight(10, 0);
				if (j !== pattern.length) {
					this.cmd(
						act.setText,
						this.comparisonCountID,
						'Comparison Count: ' + ++this.compCount,
					);
					this.cmd(
						act.setBackgroundColor,
						this.comparisonMatrixID[row][i + j],
						'#E74C3C',
					);
				} else {
					this.highlight(11, 0);
					this.cmd(act.step);
					this.unhighlight(11, 0);
				}
				this.cmd(act.delete, iPointerID);
				this.cmd(act.delete, jPointerID);
				this.cmd(act.step);
			} else {
				for (let k = i; k < i + pattern.length; k++) {
					this.cmd(act.setBackgroundColor, this.comparisonMatrixID[row][k], '#FFFF4D');
				}
				this.unhighlight(6, 0);
				this.cmd(act.step);
			}
			this.highlight(12, 0);
			this.cmd(act.step);
			this.unhighlight(12, 0);
			this.highlight(13, 0);
			this.cmd(act.step);
			this.unhighlight(13, 0);
			if (i < text.length - pattern.length) {
				this.highlight(14, 0);
				textHash =
					this.baseValue * (textHash - base * (text.charCodeAt(i) - 97)) +
					(text.charCodeAt(i + pattern.length) - 97);
				textCalculation = '';
				runningBase = base;
				for (let k = 0; k < pattern.length; k++) {
					textCalculation += `(${text.charAt(k + i + 1)} * ${runningBase}) + `; //text.charAt(k + i + 1) + ' + ';
					runningBase /= this.baseValue;
				}
				textCalculation =
					textCalculation.substring(0, textCalculation.length - 2) + ' = ' + textHash;
				this.cmd(act.setText, this.textHashCalculationID, textCalculation);
				this.cmd(act.step);
				this.unhighlight(14, 0);
			}
			row++;
		}
		this.unhighlight(5, 0);

		return this.commands;
	}

	clear() {
		this.commands = [];
		if (this.textRowID.length !== 0) {
			this.cmd(act.delete, this.baseLabelID);
			this.cmd(act.delete, this.characterValuesLabelID);
			this.cmd(act.delete, this.textHashLabelID);
			this.cmd(act.delete, this.textHashCalculationID);
			this.cmd(act.delete, this.patternHashLabelID);
			this.cmd(act.delete, this.patternHashCalculationID);
		}
		for (let i = 0; i < this.textRowID.length; i++) {
			this.cmd(act.delete, this.textRowID[i]);
		}
		this.textRowID = [];
		for (let i = 0; i < this.comparisonMatrixID.length; i++) {
			for (let j = 0; j < this.comparisonMatrixID[i].length; j++) {
				this.cmd(act.delete, this.comparisonMatrixID[i][j]);
			}
		}
		this.comparisonMatrixID = [];
		this.compCount = 0;
		this.cmd(act.setText, this.comparisonCountID, '');
		this.removeCode(this.codeID);
		this.codeID = [];

		return this.commands;
	}

	disableUI() {
		for (let i = 0; i < this.controls.length; i++) {
			this.controls[i].disabled = true;
		}
	}

	enableUI() {
		for (let i = 0; i < this.controls.length; i++) {
			this.controls[i].disabled = false;
		}
	}
}
