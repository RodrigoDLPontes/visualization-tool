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
	addLabelToAlgorithmBar,
} from './Algorithm.js';
import { act } from '../anim/AnimationMain';

const ARRAY_START_X = 100;
const ARRAY_START_Y = 30;

const MAX_LENGTH = 22;

const PATTERN_START_Y = 80;

const FAILURE_TABLE_START_Y = 215;
const LAST_TABLE_START_Y = 140;

const COMP_COUNT_X = 575;
const COMP_COUNT_Y = 15;

const PERIOD_Y = 35;

const BM_CODE_Y = 195;

const GALIL_CODE_Y = 265;

let galilRuleEnabled = false;

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

		addLabelToAlgorithmBar('or');

		// Build Last Occurrence Table button
		this.blotButton = addControlToAlgorithmBar('Button', 'Build Last Occurrence Table');
		this.blotButton.onclick = this.buildLastOccurrenceTableCallback.bind(this);
		this.controls.push(this.blotButton);

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
		this.periodLabelID = this.nextIndex++;

		this.lastTableCode = [
			['procedure BoyerMooreLastTable(pattern):'],
			['     lastTable <- map from character to integer'],
			['     for i < 0, length of pattern'],
			['          lastTable[pattern[i]] <- i'],
			['     return lastTable'],
			['end procedure'],
		];

		this.failureTableCode = [
			['procedure KMPFailureTable(pattern):'],
			['     m <- length of pattern'],
			['     failureTable <- array of length m'],
			['     i <- 0, j <- 1'],
			['     failureTable[0] <- 0'],
			['     while j < m'],
			['          if pattern[i] = pattern[j]'],
			['               failureTable[j] <- i + 1'],
			['               i < i + 1, j <- j + 1'],
			['          else'],
			['               if i = 0'],
			['                    failureTable[j] <- 0'],
			['                    j <- j + 1'],
			['               else'],
			['                    i <- failureTable[i - 1]'],
			['     return failureTable'],
			['end procedure'],
		];

		this.BMCode = [
			['procedure BoyerMoore(text, pattern):'],
			['     initialize lastTable'],
			['     m <- length of pattern, n <- length of text'],
			['     i <- 0'],
			['     while i <= n - m'],
			['          j = m - 1'],
			['          while j >= 0 and text[i + j] = pattern[j]'],
			['               j -> j - 1'],
			['          if j = -1'],
			['               match found at i'],
			['               i <- i + 1'],
			['          else'],
			['               shift <- lastTable[text[i + j]]'],
			['               if shift < j'],
			['                    i <- i + (j - shift)'],
			['               else'],
			['                    i <- i + 1'],
			['end procedure'],
		];

		this.GalilCode = [
			['procedure BoyerMooreGalil(text, pattern):'],
			['     initialize lastTable, failureTable'],
			['     m <- length of pattern, n <- length of text'],
			['     k <- m - failureTable[m - 1]'],
			['     i <- 0, w <- 0'],
			['     while i <= n - m'],
			['          j = m - 1'],
			['          while j >= w and text[i + j] = pattern[j]'],
			['               j -> j - 1'],
			['          if j < w'],
			['               match found at i'],
			['               i <- i + k'],
			['               w <- m - k'],
			['          else'],
			['               shift <- lastTable[text[i + j]]'],
			['               if shift < j'],
			['                    i <- i + (j - shift)'],
			['               else'],
			['                    i <- i + 1'],
			['               w <- 0'],
			['end procedure'],
		];

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
		this.periodLabelID = this.nextIndex++;
		this.compCount = 0;
		this.period = 1;
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

	buildLastOccurrenceTableCallback() {
		if (this.patternField.value !== '') {
			this.implementAction(this.clear.bind(this));
			const pattern = this.patternField.value;
			this.patternField.value = '';
			this.implementAction(this.onlyBuildLastOccurrenceTable.bind(this), 0, pattern);
		}
	}

	clearCallback() {
		this.implementAction(this.clear.bind(this));
	}

	toggleGalilRule() {
		galilRuleEnabled = !galilRuleEnabled;
		//this.implementAction(this.clear.bind(this));
	}

	find(text, pattern) {
		console.log(this.codeID);
		if (this.codeID) {
			this.removeCode(this.codeID);
		}
		this.commands = [];

		const maxRows = this.getMaxRows(text, pattern);
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
				ypos,
			);
			this.cmd(act.setBackgroundColor, this.nextIndex++, '#D3D3D3');
		}

		let xpos;
		let ypos;
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
		if (galilRuleEnabled) {
			this.buildFailureTable(text.length, pattern);
			this.codeID = this.addCodeToCanvasBase(
				this.GalilCode,
				ARRAY_START_X + text.length * this.cellSize + 10,
				BM_CODE_Y,
			);
		} else {
			this.codeID = this.addCodeToCanvasBase(
				this.BMCode,
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
		let gr = galilRuleEnabled ? 1 : 0;
		this.highlight(gr + 4, 0);
		while (i <= text.length - pattern.length) {
			gr = galilRuleEnabled ? 1 : 0;
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
			this.highlight(gr + 5, 0);
			this.cmd(act.step);
			this.unhighlight(gr + 5, 0);
			this.highlight(gr + 6, 0);
			while (j >= l && pattern.charAt(j) === text.charAt(i + j)) {
				this.cmd(
					act.setText,
					this.comparisonCountID,
					'Comparison Count: ' + ++this.compCount,
				);
				this.cmd(act.setBackgroundColor, this.comparisonMatrixID[row][i + j], '#2ECC71');
				j--;
				this.highlight(gr + 7, 0);
				this.cmd(act.step);
				this.unhighlight(gr + 7, 0);
				if (j >= 0) {
					const xpos = (i + j) * this.cellSize + ARRAY_START_X;
					this.cmd(act.move, iPointerID, xpos, ARRAY_START_Y);
					const ypos = (row + 1) * this.cellSize + ARRAY_START_Y;
					this.cmd(act.move, jPointerID, xpos, ypos);
					this.cmd(act.step);
				}
			}
			this.unhighlight(gr + 6, 0);
			this.highlight(gr + 8, 0);
			this.cmd(act.step);
			this.unhighlight(gr + 8, 0);
			if (j < l) {
				this.highlight(gr + 9, 0);
				this.highlight(gr + 10, 0);
				if (galilRuleEnabled) {
					this.highlight(gr + 11, 0);
					i += this.period;
					l = pattern.length - this.period;
				} else {
					i++;
				}
				this.cmd(act.step);
				this.unhighlight(gr + 9, 0);
				this.unhighlight(gr + 10, 0);
				this.unhighlight(gr + 11, 0);
			} else {
				this.cmd(
					act.setText,
					this.comparisonCountID,
					'Comparison Count: ' + ++this.compCount,
				);
				if (l !== 0) {
					l = 0;
				}
				gr = galilRuleEnabled ? 2 : 0;
				this.highlight(11 + gr, 0);
				this.cmd(act.setBackgroundColor, this.comparisonMatrixID[row][i + j], '#E74C3C');
				let shift;
				this.cmd(act.step);
				this.unhighlight(11 + gr, 0);
				this.highlight(12 + gr, 0);
				if (text.charAt(i + j) in lastTable) {
					shift = lastTable[text.charAt(i + j)];
				} else {
					shift = -1;
				}
				this.cmd(act.step);
				this.unhighlight(12 + gr, 0);
				this.highlight(13 + gr, 0);
				this.cmd(act.step);
				this.unhighlight(13 + gr, 0);
				if (shift < j) {
					this.highlight(14 + gr, 0);
					i += j - shift;
				} else {
					this.highlight(15 + gr, 0);
					this.cmd(act.step);
					this.unhighlight(15 + gr, 0);
					this.highlight(16 + gr, 0);
					i++;
				}
				this.cmd(act.step);
				this.unhighlight(14 + gr, 0);
				this.unhighlight(16 + gr, 0);
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
		gr = galilRuleEnabled ? 1 : 0;
		this.unhighlight(gr + 4, 0);
		this.cmd(act.step);

		this.cmd(act.delete, iPointerID);
		this.cmd(act.delete, jPointerID);
		return this.commands;
	}

	getMaxRows(text, pattern) {
		if (galilRuleEnabled) {
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
				if (galilRuleEnabled) {
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

		this.codeID = this.addCodeToCanvasBase(this.lastTableCode, labelsX, BM_CODE_Y);

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
		this.highlight(2, 0);

		for (let i = 0; i < pattern.length; i++) {
			this.cmd(act.step);
			let xpos = patternTableStartX + i * this.cellSize;
			this.cmd(act.move, lotPointerID, xpos, PATTERN_START_Y);
			this.highlight(3, 0);
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
			this.unhighlight(3, 0);
			this.cmd(act.setHighlight, lastTable[pattern.charAt(i)][1], 0);
		}
		this.unhighlight(2, 0);

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
		this.highlight(4, 0);
		this.cmd(act.step);
		this.unhighlight(4, 0);

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

		this.codeID = this.addCodeToCanvasBase(this.failureTableCode, labelX, GALIL_CODE_Y);

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
		this.highlight(3, 0);
		this.highlight(4, 0);
		this.cmd(act.step);
		this.unhighlight(3, 0);
		this.unhighlight(4, 0);

		const failureTable = [];
		failureTable[0] = 0;
		let i = 0;
		let j = 1;
		this.highlight(5, 0);
		while (j < pattern.length) {
			this.cmd(act.setText, this.comparisonCountID, 'Comparison Count: ' + ++this.compCount);
			this.highlight(6, 0);
			this.cmd(act.step);
			this.unhighlight(6, 0);
			if (pattern.charAt(i) === pattern.charAt(j)) {
				this.highlight(7, 0);
				this.highlight(8, 0);
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
				this.unhighlight(7, 0);
				this.unhighlight(8, 0);
			} else {
				this.highlight(9, 0);
				this.cmd(act.step);
				this.unhighlight(9, 0);
				this.highlight(10, 0);
				this.cmd(act.step);
				this.unhighlight(10, 0);
				if (i === 0) {
					this.highlight(11, 0);
					this.highlight(12, 0);
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
					this.unhighlight(11, 0);
					this.unhighlight(12, 0);
				} else {
					this.highlight(13, 0);
					this.cmd(act.step);
					this.unhighlight(13, 0);
					this.highlight(14, 0);
					i = failureTable[i - 1];
					this.cmd(
						act.move,
						iPointerID,
						tableStartX + i * this.cellSize,
						FAILURE_TABLE_START_Y,
					);
					this.cmd(act.step);
					this.unhighlight(14, 0);
				}
			}
		}
		this.unhighlight(5, 0);
		this.highlight(15, 0);
		this.cmd(act.step);
		this.unhighlight(15, 0);
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

	clear() {
		this.commands = [];
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

		this.compCount = 0;
		this.cmd(act.setText, this.comparisonCountID, '');
		this.cmd(act.setText, this.periodLabelID, '');
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
