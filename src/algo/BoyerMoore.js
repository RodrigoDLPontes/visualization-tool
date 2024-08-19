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
	addCheckboxToAlgorithmBar,
	addControlToAlgorithmBar,
	addDivisorToAlgorithmBar,
	addDropDownGroupToAlgorithmBar,
	addLabelToAlgorithmBar,
} from './Algorithm.js';
import { act } from '../anim/AnimationMain';
import pseudocodeText from '../pseudocode.json';

const INFO_MSG_X = 25;
const INFO_MSG_Y = 15;

const ARRAY_START_X = 100;
const ARRAY_START_Y = 60;

const MAX_LENGTH = 22;

const PATTERN_START_Y = 80;

const FAILURE_TABLE_START_Y = 215;
const LAST_TABLE_START_Y = 140;

const COMP_COUNT_X = 575;
const COMP_COUNT_Y = 15;

const PERIOD_Y = 35;

const BM_CODE_Y = 205;

const GALIL_CODE_Y = 275;

export default class BoyerMoore extends Algorithm {
	constructor(am, w, h) {
		super(am, w, h);
		this.addControls();
		this.nextIndex = 0;
		this.setup();
	}

	addControls() {
		this.controls = [];

		addLabelToAlgorithmBar('Text:');

		// Text text field
		this.textField = addControlToAlgorithmBar('Text', '');
		this.textField.onkeydown = this.returnSubmit(
			this.textField,
			this.findCallback.bind(this),
			MAX_LENGTH,
			false,
		);
		this.controls.push(this.textField);

		addLabelToAlgorithmBar('Pattern:');

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

		addLabelToAlgorithmBar('or');

		// Build Last Occurrence Table button
		this.blotButton = addControlToAlgorithmBar('Button', 'Build Last Occurrence Table');
		this.blotButton.onclick = this.buildLastOccurrenceTableCallback.bind(this);
		this.controls.push(this.blotButton);

		addDivisorToAlgorithmBar();

		// Examples dropdown
		this.exampleDropdown = addDropDownGroupToAlgorithmBar(
			[
				['', 'Select Example'],
				['Random', 'Random'],
				['aaaa in aaaaaaaaaaaaa', 'aaaa in aaaaaaaaaaaaa'],
				['aaab in aaaaaaaaaaaaa', 'aaab in aaaaaaaaaaaaa'],
				['baaa in aaaaaaaaaaaaa', 'baaa in aaaaaaaaaaaaa'],
				['aaaa in aaabaaabaaaba', 'aaaa in aaabaaabaaaba'],
				['aaab in aaabaaabaaaba', 'aaab in aaabaaabaaaba'],
				['baaa in aaabaaabaaaba', 'baaa in aaabaaabaaaba'],
				['abab in abacabacababa', 'abab in abacabacababa'],
				['lack in sphinxofblackquartz', 'lack in sphinxofblackquartz'],
			],
			'Example'
		);
		this.exampleDropdown.onclick = this.exampleCallback.bind(this);
		this.controls.push(this.exampleDropdown);

		addDivisorToAlgorithmBar();

		// Clear button
		this.clearButton = addControlToAlgorithmBar('Button', 'Clear');
		this.clearButton.onclick = this.clearCallback.bind(this);
		this.controls.push(this.clearButton);

		addDivisorToAlgorithmBar();

		// Galil Rule button
		this.galilButton = addCheckboxToAlgorithmBar('Galil Rule Optimization', false);
		this.galilButton.onclick = this.toggleGalilRule.bind(this);
		this.controls.push(this.galilButton);
	}

	setup() {
		this.commands = [];
		this.textRowID = [];
		this.rowCountID = [];
		this.comparisonMatrixID = [];
		this.patternTableLabelID = this.nextIndex++;
		this.patternTableCharacterID = [];
		this.patternTableIndexID = [];
		this.lastTableLabelID = this.nextIndex++;
		this.lastTableCharacterID = [];
		this.lastTableValueID = [];
		this.codeID = [];
		this.galilRuleEnabled = false;
		// this.failureTableLabelID = this.nextIndex++;
		// this.failureTableCharacterID = [];
		// this.failureTableValueID = [];

		this.comparisonCountID = this.nextIndex++;
		this.periodLabelID = this.nextIndex++;

		this.infoLabelID = this.nextIndex++;
		this.cmd(act.createLabel, this.infoLabelID, '', INFO_MSG_X, INFO_MSG_Y, 0);

		this.compCount = 0;
		this.cmd(act.createLabel, this.comparisonCountID, '', COMP_COUNT_X, COMP_COUNT_Y, 0);

		this.period = 1;
		this.cmd(act.createLabel, this.periodLabelID, '', COMP_COUNT_X, PERIOD_Y, 0);

		this.animationManager.startNewAnimation(this.commands);
		this.animationManager.skipForward();
		this.animationManager.clearHistory();
	}

	reset() {
		this.nextIndex = 0;
		this.textRowID = [];
		this.rowCountID = [];
		this.comparisonMatrixID = [];
		this.patternTableLabelID = this.nextIndex++;
		this.patternTableCharacterID = [];
		this.patternTableIndexID = [];
		this.lastTableLabelID = this.nextIndex++;
		this.lastTableCharacterID = [];
		this.lastTableValueID = [];
		this.codeID = [];
		// this.failureTableLabelID = this.nextIndex++;
		// this.failureTableCharacterID = [];
		// this.failureTableValueID = [];
		this.comparisonCountID = this.nextIndex++;
		this.infoLabelID = this.nextIndex++;
		this.periodLabelID = this.nextIndex++;
		this.compCount = 0;
		this.period = 1;
	}

	findCallback() {
		this.implementAction(this.clear.bind(this), true);
		const text = this.textField.value;
		const pattern = this.patternField.value;
		this.implementAction(this.find.bind(this), text, pattern);
	}

	exampleCallback() {
		const selection = this.exampleDropdown.value
		if (!selection) {
			return;
		}

		let textValue;
		let patternValue;
		
		if (selection === 'Random') {
			patternValue = this.generateRandomString(3, 'abc');
			textValue = this.generateRandomString(15, 'abc', patternValue);
		} else {
			const values = selection.split(' in ');
			textValue = values[1];
			patternValue = values[0];
		}

		this.textField.value = textValue;
		this.patternField.value = patternValue;
		this.exampleDropdown.value = '';
	}

	// Create a random text or pattern string provided length, character set, and optionally force-include given string
	generateRandomString(length, characters, mustInclude) {
		let result = '';
		if (mustInclude) {
			const randomPosition = Math.floor(Math.random() * (length - mustInclude.length + 1));
			for (let i = 0; i < length; i++) {
				if (i >= randomPosition && i < randomPosition + mustInclude.length) {
					result += mustInclude[i - randomPosition];
				} else {
					const randomIndex = Math.floor(Math.random() * characters.length);
					result += characters[randomIndex];
				}
			}
		} else {
			for (let i = 0; i < length; i++) {
				const randomIndex = Math.floor(Math.random() * characters.length);
				result += characters[randomIndex];
			}
		}
		return result;
	}

	buildLastOccurrenceTableCallback() {
		this.implementAction(this.clear.bind(this), true);
		const pattern = this.patternField.value;
		this.implementAction(this.onlyBuildLastOccurrenceTable.bind(this), 0, pattern);
	}

	clearCallback() {
		this.implementAction(this.clear.bind(this));
	}

	toggleGalilRule() {
		this.galilRuleEnabled = !this.galilRuleEnabled;
		//this.implementAction(this.clear.bind(this));
	}

	find(text, pattern) {
		if (this.codeID) {
			this.removeCode(this.codeID);
		}
		this.commands = [];

		// User input validation
		if (!text || !pattern) {
			this.shake(this.findButton);
			this.cmd(act.setText, this.infoLabelID, 'Text and pattern must not be empty');
			return this.commands;
		} else if (text.length < pattern.length) {
			this.cmd(
				act.setText,
				this.infoLabelID,
				'Pattern is longer than text, no matches exist',
			);
			return this.commands;
		}

		const maxRows = this.getMaxRows(text, pattern);
		if (maxRows <= 14) {
			this.cellSize = 30;
		} else if (maxRows <= 17) {
			this.cellSize = 25;
		} else {
			this.cellSize = 20;
		}

		this.textRowID = new Array(text.length);
		this.rowCountID = new Array(maxRows);
		this.comparisonMatrixID = new Array(maxRows);
		for (let i = 0; i < maxRows; i++) {
			this.comparisonMatrixID[i] = new Array(text.length);
		}

		let xpos, ypos;

		for (let i = 0; i < text.length; i++) {
			xpos = i * this.cellSize + ARRAY_START_X;
			ypos = ARRAY_START_Y - 25;
			this.textRowID[i] = this.nextIndex;
			this.cmd(act.createLabel, this.nextIndex++, i, xpos, ypos);
		}

		for (let i = 1; i <= maxRows; i++) {
			xpos = ARRAY_START_X - 50;
			ypos = i * this.cellSize + ARRAY_START_Y;
			this.rowCountID[i] = this.nextIndex;
			this.cmd(act.createLabel, this.nextIndex++, `Row ${i}`, xpos, ypos);
		}

		for (let i = 0; i < text.length; i++) {
			xpos = i * this.cellSize + ARRAY_START_X;
			ypos = ARRAY_START_Y;
			this.textRowID[i + text.length] = this.nextIndex;
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

		const lastTable = this.buildLastTable(text.length, pattern);
		this.removeCode(this.codeID);
		if (this.galilRuleEnabled) {
			this.buildFailureTable(text.length, pattern);
			this.codeID = this.addCodeToCanvasBaseAll(
				pseudocodeText.BoyerMoore,
				'galil',
				ARRAY_START_X + text.length * this.cellSize + 10,
				BM_CODE_Y,
				14,
			);
		} else {
			this.codeID = this.addCodeToCanvasBaseAll(
				pseudocodeText.BoyerMoore,
				'find',
				ARRAY_START_X + text.length * this.cellSize + 10,
				BM_CODE_Y,
			);
		}

		const iPointerID = this.nextIndex++;
		const jPointerID = this.nextIndex++;
		this.cmd(
			act.createHighlightCircle,
			iPointerID,
			'#0000FF',
			ARRAY_START_X + (pattern.length - 1) * this.cellSize,
			ARRAY_START_Y,
			this.cellSize / 2,
		);
		this.cmd(
			act.createHighlightCircle,
			jPointerID,
			'#0000FF',
			ARRAY_START_X + (pattern.length - 1) * this.cellSize,
			ARRAY_START_Y + this.cellSize,
			this.cellSize / 2,
		);

		let i = 0;
		let j = pattern.length - 1;
		let row = 0;
		let l = 0;
		let gr = this.galilRuleEnabled ? 1 : 0;
		this.highlight(gr + 4, 0, this.codeID);
		while (i <= text.length - pattern.length) {
			gr = this.galilRuleEnabled ? 1 : 0;
			for (let k = i; k < i + pattern.length; k++) {
				this.cmd(
					act.setText,
					this.comparisonMatrixID[row][k],
					pattern.charAt(k - i),
					xpos,
					ypos,
				);
				if (k - i < l) {
					this.cmd(act.setBackgroundColor, this.comparisonMatrixID[row][k], '#FFFF4D');
				}
			}
			this.highlight(gr + 5, 0, this.codeID);
			this.cmd(act.step);
			this.unhighlight(gr + 5, 0, this.codeID);
			this.highlight(gr + 6, 0, this.codeID);
			while (j >= l && pattern.charAt(j) === text.charAt(i + j)) {
				this.cmd(
					act.setText,
					this.comparisonCountID,
					'Comparison Count: ' + ++this.compCount,
				);
				this.cmd(act.setBackgroundColor, this.comparisonMatrixID[row][i + j], '#2ECC71');
				j--;
				this.highlight(gr + 7, 0, this.codeID);
				this.cmd(act.step);
				this.unhighlight(gr + 7, 0, this.codeID);
				if (j >= 0) {
					const xpos = (i + j) * this.cellSize + ARRAY_START_X;
					this.cmd(act.move, iPointerID, xpos, ARRAY_START_Y);
					const ypos = (row + 1) * this.cellSize + ARRAY_START_Y;
					this.cmd(act.move, jPointerID, xpos, ypos);
					this.cmd(act.step);
				}
			}
			this.unhighlight(gr + 6, 0, this.codeID);
			this.highlight(gr + 9, 0, this.codeID);
			this.cmd(act.step);
			this.unhighlight(gr + 9, 0, this.codeID);
			if (j < l) {
				this.highlight(gr + 10, 0, this.codeID);
				this.highlight(gr + 11, 0, this.codeID);
				if (this.galilRuleEnabled) {
					this.highlight(gr + 12, 0, this.codeID);
					i += this.period;
					l = pattern.length - this.period;
				} else {
					i++;
				}
				this.cmd(act.step);
				this.unhighlight(gr + 10, 0, this.codeID);
				this.unhighlight(gr + 11, 0, this.codeID);
				this.unhighlight(gr + 12, 0, this.codeID);
			} else {
				this.cmd(
					act.setText,
					this.comparisonCountID,
					'Comparison Count: ' + ++this.compCount,
				);
				if (l !== 0) {
					l = 0;
				}
				gr = this.galilRuleEnabled ? 2 : 0;
				this.highlight(12 + gr, 0, this.codeID);
				this.cmd(act.setBackgroundColor, this.comparisonMatrixID[row][i + j], '#E74C3C');
				let shift;
				this.cmd(act.step);
				this.unhighlight(12 + gr, 0, this.codeID);
				this.highlight(13 + gr, 0, this.codeID);
				if (text.charAt(i + j) in lastTable) {
					shift = lastTable[text.charAt(i + j)];
				} else {
					shift = -1;
				}
				this.cmd(act.step);
				this.unhighlight(13 + gr, 0, this.codeID);
				this.highlight(14 + gr, 0, this.codeID);
				this.cmd(act.step);
				this.unhighlight(14 + gr, 0, this.codeID);
				if (shift < j) {
					this.highlight(15 + gr, 0, this.codeID);
					i += j - shift;
				} else {
					this.highlight(16 + gr, 0, this.codeID);
					this.cmd(act.step);
					this.unhighlight(16 + gr, 0, this.codeID);
					this.highlight(17 + gr, 0, this.codeID);
					i++;
				}
				this.cmd(act.step);
				this.unhighlight(15 + gr, 0, this.codeID);
				this.unhighlight(17 + gr, 0, this.codeID);
				this.highlight(19 + gr, 0, this.codeID);
				this.cmd(act.step);
				this.unhighlight(19 + gr, 0, this.codeID);
			}
			j = pattern.length - 1;
			row++;
			if (i <= text.length - pattern.length) {
				const xpos = (i + j) * this.cellSize + ARRAY_START_X;
				this.cmd(act.move, iPointerID, xpos, ARRAY_START_Y);
				const ypos = (row + 1) * this.cellSize + ARRAY_START_Y;
				this.cmd(act.move, jPointerID, xpos, ypos);
			}
		}
		gr = this.galilRuleEnabled ? 1 : 0;
		this.unhighlight(gr + 4, 0, this.codeID);
		this.cmd(act.step);

		this.cmd(act.delete, iPointerID);
		this.cmd(act.delete, jPointerID);
		return this.commands;
	}

	getMaxRows(text, pattern) {
		if (this.galilRuleEnabled) {
			const failureTable = [];
			failureTable[0] = 0;
			let i = 0;
			let j = 1;
			while (j < pattern.length) {
				if (pattern.charAt(i) === pattern.charAt(j)) {
					i++;
					failureTable[j] = i;
					j++;
				} else {
					if (i === 0) {
						failureTable[j] = i;
						j++;
					} else {
						i = failureTable[i - 1];
					}
				}
			}
			this.period = pattern.length - failureTable[pattern.length - 1];
		}
		const lastTable = {};
		for (let i = 0; i < pattern.length; i++) {
			lastTable[pattern.charAt(i)] = i;
		}
		let i = 0;
		let j = pattern.length - 1;
		let maxRows = 0;
		let l = 0;
		while (i <= text.length - pattern.length) {
			while (j >= l && pattern.charAt(j) === text.charAt(i + j)) {
				j--;
			}
			if (j < l) {
				if (this.galilRuleEnabled) {
					i += this.period;
					l = pattern.length - this.period;
				} else {
					i++;
				}
			} else {
				if (l !== 0) {
					l = 0;
				}
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
			maxRows++;
		}
		return maxRows;
	}

	onlyBuildLastOccurrenceTable(textLength, pattern) {
		this.commands = [];

		// User input validation
		if (!pattern) {
			this.shake(this.blotButton);
			this.cmd(act.setText, this.infoLabelID, 'Pattern must not be empty');
			return this.commands;
		}

		this.cellSize = 30;
		this.buildLastTable(textLength, pattern);
		return this.commands;
	}

	buildLastTable(textLength, pattern) {
		// Display labels
		const labelsX = ARRAY_START_X + textLength * this.cellSize + 10;
		this.cmd(
			act.createLabel,
			this.patternTableLabelID,
			'Pattern:',
			labelsX,
			PATTERN_START_Y - 5,
			0,
		);
		this.cmd(
			act.createLabel,
			this.lastTableLabelID,
			'Last occurence table:',
			labelsX,
			LAST_TABLE_START_Y + 10,
			0,
		);
		this.cmd(act.move, this.comparisonCountID, labelsX, COMP_COUNT_Y);
		this.cmd(act.setText, this.comparisonCountID, 'Comparison Count: ' + this.compCount);

		this.codeID = this.addCodeToCanvasBaseAll(
			pseudocodeText.BoyerMoore,
			'lastTable',
			labelsX,
			BM_CODE_Y,
		);

		// Display pattern table
		const patternTableStartX = ARRAY_START_X + textLength * this.cellSize + 80;
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
				PATTERN_START_Y,
			);
			this.patternTableIndexID[i] = this.nextIndex;
			this.cmd(act.createLabel, this.nextIndex++, i, xpos, PATTERN_START_Y + this.cellSize);
		}

		// Create and display last occurrence table
		const lastTable = {};
		const lotStartX = ARRAY_START_X + textLength * this.cellSize + 155;
		this.lastTableCharacterID = [];
		this.lastTableValueID = [];
		let j = 0;

		const lotPointerID = this.nextIndex++;
		this.cmd(
			act.createHighlightCircle,
			lotPointerID,
			'#0000FF',
			patternTableStartX,
			PATTERN_START_Y,
			this.cellSize / 2,
		);
		this.cmd(act.setHighlight, lotPointerID, 1);
		this.highlight(2, 0, this.codeID);

		for (let i = 0; i < pattern.length; i++) {
			this.cmd(act.step);
			let xpos = patternTableStartX + i * this.cellSize;
			this.cmd(act.move, lotPointerID, xpos, PATTERN_START_Y);
			this.highlight(3, 0, this.codeID);
			if (lastTable[pattern.charAt(i)]) {
				this.cmd(act.setText, lastTable[pattern.charAt(i)][1], i);
				this.cmd(act.setHighlight, lastTable[pattern.charAt(i)][1], 1);
				lastTable[pattern.charAt(i)][0] = i;
			} else {
				xpos = lotStartX + j * this.cellSize;
				this.lastTableCharacterID.push(this.nextIndex);
				this.cmd(
					act.createRectangle,
					this.nextIndex,
					pattern.charAt(i),
					this.cellSize,
					this.cellSize,
					xpos,
					LAST_TABLE_START_Y,
				);
				this.cmd(act.setBackgroundColor, this.nextIndex++, '#D3D3D3');
				this.lastTableValueID.push(this.nextIndex);
				this.cmd(
					act.createRectangle,
					this.nextIndex,
					i,
					this.cellSize,
					this.cellSize,
					xpos,
					LAST_TABLE_START_Y + this.cellSize,
				);
				this.cmd(act.setHighlight, this.nextIndex, 1);
				j++;
				lastTable[pattern.charAt(i)] = [i, this.nextIndex++];
			}
			this.cmd(act.step);
			this.unhighlight(3, 0, this.codeID);
			this.cmd(act.setHighlight, lastTable[pattern.charAt(i)][1], 0);
		}
		this.unhighlight(2, 0, this.codeID);

		// Display '*' entry
		this.cmd(act.delete, lotPointerID);
		const xpos = lotStartX + j * this.cellSize;
		this.lastTableCharacterID.push(this.nextIndex);
		this.cmd(
			act.createRectangle,
			this.nextIndex,
			'*',
			this.cellSize,
			this.cellSize,
			xpos,
			LAST_TABLE_START_Y,
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
			LAST_TABLE_START_Y + this.cellSize,
		);
		this.highlight(5, 0, this.codeID);
		this.cmd(act.step);
		this.unhighlight(5, 0, this.codeID);

		Object.keys(lastTable).map(char => (lastTable[char] = lastTable[char][0])); // Return only indices
		return lastTable;
	}

	buildFailureTable(textLength, pattern) {
		const startIndex = this.nextIndex;
		this.failureTableLabelID = this.nextIndex++;
		this.failureTableCharacterID = [];
		this.failureTableValueID = [];
		// Display label
		const labelX = ARRAY_START_X + textLength * this.cellSize + 10;
		this.cmd(
			act.createLabel,
			this.failureTableLabelID,
			'Failure table:',
			labelX,
			FAILURE_TABLE_START_Y + 10,
			0,
		);

		this.cmd(act.move, this.periodLabelID, labelX, PERIOD_Y);
		this.cmd(
			act.setText,
			this.periodLabelID,
			'Period = pattern.length - FT[pattern.length - 1]',
		);

		this.codeID = this.addCodeToCanvasBaseAll(
			pseudocodeText.KMP,
			'failureTable',
			labelX,
			GALIL_CODE_Y,
			14,
		);

		// Display empty failure table
		const tableStartX = ARRAY_START_X + textLength * this.cellSize + 110;
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
				FAILURE_TABLE_START_Y,
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
				FAILURE_TABLE_START_Y + this.cellSize,
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
			this.cellSize / 2,
		);
		this.cmd(
			act.createHighlightCircle,
			jPointerID,
			'#FF0000',
			tableStartX + this.cellSize,
			FAILURE_TABLE_START_Y,
			this.cellSize / 2,
		);
		this.cmd(act.setText, this.failureTableValueID[0], 0);
		this.highlight(3, 0, this.codeID);
		this.highlight(4, 0, this.codeID);
		this.cmd(act.step);
		this.unhighlight(3, 0, this.codeID);
		this.unhighlight(4, 0, this.codeID);

		const failureTable = [];
		failureTable[0] = 0;
		let i = 0;
		let j = 1;
		this.highlight(5, 0, this.codeID);
		while (j < pattern.length) {
			this.cmd(act.setText, this.comparisonCountID, 'Comparison Count: ' + ++this.compCount);
			this.highlight(6, 0, this.codeID);
			this.cmd(act.step);
			this.unhighlight(6, 0, this.codeID);
			if (pattern.charAt(i) === pattern.charAt(j)) {
				this.highlight(7, 0, this.codeID);
				this.highlight(8, 0, this.codeID);
				i++;
				failureTable[j] = i;
				this.cmd(act.setText, this.failureTableValueID[j], i);
				j++;
				if (j < pattern.length) {
					this.cmd(
						act.move,
						iPointerID,
						tableStartX + i * this.cellSize,
						FAILURE_TABLE_START_Y,
					);
					this.cmd(
						act.move,
						jPointerID,
						tableStartX + j * this.cellSize,
						FAILURE_TABLE_START_Y,
					);
				}
				this.cmd(act.step);
				this.unhighlight(7, 0, this.codeID);
				this.unhighlight(8, 0, this.codeID);
			} else {
				this.highlight(9, 0, this.codeID);
				this.cmd(act.step);
				this.unhighlight(9, 0, this.codeID);
				this.highlight(10, 0, this.codeID);
				this.cmd(act.step);
				this.unhighlight(10, 0, this.codeID);
				if (i === 0) {
					this.highlight(11, 0, this.codeID);
					this.highlight(12, 0, this.codeID);
					failureTable[j] = i;
					this.cmd(act.setText, this.failureTableValueID[j], i);
					j++;
					if (j < pattern.length) {
						this.cmd(
							act.move,
							jPointerID,
							tableStartX + j * this.cellSize,
							FAILURE_TABLE_START_Y,
						);
					}
					this.cmd(act.step);
					this.unhighlight(11, 0, this.codeID);
					this.unhighlight(12, 0, this.codeID);
				} else {
					this.highlight(14, 0, this.codeID);
					this.cmd(act.step);
					this.unhighlight(14, 0, this.codeID);
					this.highlight(15, 0, this.codeID);
					i = failureTable[i - 1];
					this.cmd(
						act.move,
						iPointerID,
						tableStartX + i * this.cellSize,
						FAILURE_TABLE_START_Y,
					);
					this.cmd(act.step);
					this.unhighlight(15, 0, this.codeID);
				}
			}
		}
		this.unhighlight(5, 0, this.codeID);
		this.highlight(18, 0, this.codeID);
		this.cmd(act.step);
		this.unhighlight(18, 0, this.codeID);
		this.cmd(
			act.setText,
			this.periodLabelID,
			'Period = ' + pattern.length + ' - ' + failureTable[pattern.length - 1],
		);
		const ftPeriodLabel = this.nextIndex++;
		this.cmd(
			act.createHighlightCircle,
			ftPeriodLabel,
			'#FF0000',
			tableStartX + this.cellSize * (pattern.length - 1),
			FAILURE_TABLE_START_Y + this.cellSize,
			this.cellSize / 2,
		);
		this.cmd(act.step);

		this.period = pattern.length - failureTable[pattern.length - 1];
		this.cmd(act.setText, this.periodLabelID, 'Period = ' + this.period);
		this.cmd(act.delete, ftPeriodLabel);

		if (this.failureTableValueID.length !== 0) {
			this.cmd(act.delete, this.failureTableLabelID);
		}

		for (let i = 0; i < this.failureTableCharacterID.length; i++) {
			this.cmd(act.delete, this.failureTableCharacterID[i]);
			this.cmd(act.delete, this.failureTableValueID[i]);
		}

		this.cmd(act.delete, iPointerID);
		this.cmd(act.delete, jPointerID);
		this.removeCode(this.codeID);

		this.nextIndex = startIndex;

		return failureTable;
	}

	clear(keepInput) {
		this.commands = [];
		for (let i = 0; i < this.textRowID.length; i++) {
			this.cmd(act.delete, this.textRowID[i]);
		}
		this.textRowID = [];
		for (let i = 1; i < this.rowCountID.length; i++) {
			this.cmd(act.delete, this.rowCountID[i]);
		}
		this.rowCountID = [];
		for (let i = 0; i < this.comparisonMatrixID.length; i++) {
			for (let j = 0; j < this.comparisonMatrixID[i].length; j++) {
				this.cmd(act.delete, this.comparisonMatrixID[i][j]);
			}
		}
		this.comparisonMatrixID = [];
		if (this.patternTableCharacterID.length !== 0) {
			this.cmd(act.delete, this.patternTableLabelID);
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

		this.removeCode(this.codeID);

		// if (this.failureTableValueID.length !== 0) {
		// 	this.cmd(act.delete, this.failureTableLabelID);
		// }

		// for (let i = 0; i < this.failureTableCharacterID.length; i++) {
		// 	this.cmd(act.delete, this.failureTableCharacterID[i]);
		// 	this.cmd(act.delete, this.failureTableValueID[i]);
		// }

		if (!keepInput) {
			this.textField.value = '';
			this.patternField.value = '';
		}

		this.compCount = 0;
		this.cmd(act.setText, this.comparisonCountID, '');
		this.cmd(act.setText, this.periodLabelID, '');
		this.cmd(act.setText, this.infoLabelID, '');
		this.lastTableCharacterID = [];
		this.lastTableValueID = [];
		this.failureTableCharacterID = [];
		this.failureTableValueID = [];
		this.codeID = [];
		this.period = 1;
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
