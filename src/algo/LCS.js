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

import Algorithm, { addControlToAlgorithmBar, addLabelToAlgorithmBar } from './Algorithm.js';
import { act } from '../anim/AnimationMain';

const INFO_MSG_X = 20;
const INFO_MSG_Y = 400;

const TABLE_ELEM_WIDTH = 40;
const TABLE_ELEM_HEIGHT = 30;

const TABLE_START_X = 500;
const TABLE_START_Y = 80;

const CODE_START_X = 20;
const CODE_START_Y = 20;
const CODE_LINE_HEIGHT = 14;

const CODE_HIGHLIGHT_COLOR = '#FF0000';
const CODE_STANDARD_COLOR = '#000000';
const LCS_CELL_COLOR = '#99CCFF';
const MAX_SEQUENCE_LENGTH = 13;

const SEQUENCE_START_X = 20;
const SEQUENCE_START_Y = 450;
const SEQUENCE_DELTA_X = 10;

export default class LCS extends Algorithm {
	constructor(am, w, h) {
		super(am, w, h);

		this.addControls();
		this.nextIndex = 0;
		this.setup();
	}

	addControls() {
		this.controls = [];
		addLabelToAlgorithmBar('S1:');
		this.S1Field = addControlToAlgorithmBar('Text', '');
		this.S1Field.onkeydown = this.returnSubmit(
			this.S1Field,
			this.runCallback.bind(this),
			MAX_SEQUENCE_LENGTH,
			false,
		);
		this.controls.push(this.S1Field);

		addLabelToAlgorithmBar('S2:');
		this.S2Field = addControlToAlgorithmBar('Text', '');
		this.S2Field.onkeydown = this.returnSubmit(
			this.S2Field,
			this.runCallback.bind(this),
			MAX_SEQUENCE_LENGTH,
			false,
		);
		this.controls.push(this.S2Field);

		this.tableButton = addControlToAlgorithmBar('Button', 'Run');
		this.tableButton.onclick = this.runCallback.bind(this);
		this.controls.push(this.tableButton);
	}

	setup() {
		this.infoLabelID = this.nextIndex++;
		this.cmd(act.createLabel, this.infoLabelID, '', INFO_MSG_X, INFO_MSG_Y, 0);

		this.code = [
			['procedure ', 'LCS(S1, S2, matrix)'],
			['     matrix <- create new 2D array of length S1.length by S2.length'],
			['     for y <- 1, to S1.length, loop'],
			['          for x <- 1 to S2.length, loop'],
			['               if ', '(S1[y] == S2[x])'],
			['                    matrix[y][x] = 1 + ', 'matrix[y - 1][x - 1]'],
			['               else'],
			[
				'                    matrix[y][x] = max(',
				'matrix[y - 1][x]',
				',',
				' matrix[y][x - 1]',
				')',
			],
			['          end for'],
			['     end for'],
			['     currY <- S1.length'],
			['     currX <- S2.length'],
			['     list <- create new List()'],
			['     while currY > 0 and currX > 0, loop:'],
			[['          if '], ['matrix[currY - 1][currX] == matrix[currY][currX - 1] ']],
			[['           and '], ['matrix[currY][currX] != matrix [currY - 1][currX - 1]']],
			['               list.addFront(S1[currY])'],
			['               currX--'],
			['               currY--'],
			['          else'],
			[['               if '], ['matrix[currY - 1][currX] > matrix[currY][currX - 1]']],
			['                    currX--'],
			['               else'],
			['                    currY--'],
			['     end while'],
			['end procedure']
		];

		this.codeID = Array(this.code.length);
		let i, j;
		for (i = 0; i < this.code.length; i++) {
			this.codeID[i] = new Array(this.code[i].length);
			for (j = 0; j < this.code[i].length; j++) {
				this.codeID[i][j] = this.nextIndex++;
				this.cmd(
					act.createLabel,
					this.codeID[i][j],
					this.code[i][j],
					CODE_START_X,
					CODE_START_Y + i * CODE_LINE_HEIGHT,
					0,
				);
				this.cmd(act.setForegroundColor, this.codeID[i][j], CODE_STANDARD_COLOR);
				if (j > 0) {
					this.cmd(act.alignRight, this.codeID[i][j], this.codeID[i][j - 1]);
				}
			}
		}

		this.animationManager.startNewAnimation(this.commands);
		this.animationManager.skipForward();
		this.animationManager.clearHistory();
		this.initialIndex = this.nextIndex;
		this.oldIDs = [];
		this.commands = [];
	}

	reset() {
		this.oldIDs = [];
		this.nextIndex = this.initialIndex;
	}

	runCallback() {
		const string1 = this.S1Field.value;
		const string2 = this.S2Field.value;
		if (string1 !== '' && string2 !== '') {
			this.S1Field.value = '';
			this.S2Field.value = '';
			this.implementAction(this.run.bind(this), string1, string2);
		}
	}

	run(str1, str2) {
		this.commands = [];
		this.clearOldIDs();

		this.buildTable(str1, str2);

		const moveID = this.nextIndex++;
		const x = str1.length;
		const y = str2.length;
		let i, j;

		for (i = 0; i <= x; i++) {
			this.cmd(act.setText, this.tableID[i][0], '0');
			this.tableVals[i][0] = 0;
		}
		for (i = 0; i <= y; i++) {
			this.cmd(act.setText, this.tableID[0][i], '0');
			this.tableVals[0][i] = 0;
		}
		this.cmd(act.step);
		for (j = 0; j < y; j++) {
			for (i = 0; i < x; i++) {
				this.cmd(act.setHighlight, this.tableID[i + 1][j + 1], 1);
				this.cmd(act.setHighlight, this.S1TableID[i], 1);
				this.cmd(act.setHighlight, this.S2TableID[j], 1);
				this.highlight(4, 1);
				// this.cmd(act.setForegroundColor, this.codeID[4][1], CODE_HIGHLIGHT_COLOR);
				this.cmd(
					act.setText,
					this.infoLabelID,
					'Comparing ' + str1.charAt(i) + ' and ' + str2.charAt(j),
				);
				this.cmd(act.step);
				this.cmd(act.setHighlight, this.S1TableID[i], 0);
				this.cmd(act.setHighlight, this.S2TableID[j], 0);
				this.unhighlight(4, 1);
				// this.cmd(act.setForegroundColor, this.codeID[4][1], CODE_STANDARD_COLOR);
				if (str1.charAt(i) === str2.charAt(j)) {
					// this.cmd(act.setForegroundColor, this.codeID[5][0], CODE_HIGHLIGHT_COLOR);
					// this.cmd(act.setForegroundColor, this.codeID[5][1], CODE_HIGHLIGHT_COLOR);
					this.highlight(5, 0);
					this.highlight(5, 1);
					this.cmd(act.setHighlight, this.tableID[i + 1 - 1][j + 1 - 1], 1);
					this.cmd(act.setText, this.infoLabelID, 'Match, increment from the diagonal');
					this.cmd(act.step);
					this.cmd(
						act.createLabel,
						moveID,
						this.tableVals[i][j] + 1,
						this.tableXPos[i][j],
						this.tableYPos[i][j],
					);
					this.cmd(act.bringToTop, moveID, 1);
					this.cmd(
						act.move,
						moveID,
						this.tableXPos[i + 1][j + 1],
						this.tableYPos[i + 1][j + 1],
					);
					this.cmd(act.step);
					this.cmd(act.delete, moveID);
					this.unhighlight(5, 0);
					this.unhighlight(5, 1);
					this.cmd(act.setHighlight, this.tableID[i + 1 - 1][j + 1 - 1], 0);
					this.tableVals[i + 1][j + 1] = this.tableVals[i][j] + 1;
					this.cmd(act.setText, this.tableID[i + 1][j + 1], this.tableVals[i + 1][j + 1]);
				} else {
					this.highlight(7, 0);
					this.highlight(7, 1);
					this.highlight(7, 2);
					this.highlight(7, 3);
					this.highlight(7, 4);
					this.cmd(act.setHighlight, this.tableID[i][j + 1], 1);
					this.cmd(act.setHighlight, this.tableID[i + 1][j], 1);
					this.cmd(
						act.setText,
						this.infoLabelID,
						'Mismatch, copy greatest value from left or above',
					);
					this.cmd(act.step);

					this.unhighlight(7, 0);
					this.unhighlight(7, 2);
					this.unhighlight(7, 4);
				
					if (this.tableVals[i][j + 1] > this.tableVals[i + 1][j]) {
						this.cmd(act.setHighlight, this.tableID[i + 1][j], 0);
						this.unhighlight(7, 1);
						
						this.tableVals[i + 1][j + 1] = this.tableVals[i][j + 1];
						this.cmd(
							act.createLabel,
							moveID,
							this.tableVals[i][j + 1],
							this.tableXPos[i][j + 1],
							this.tableYPos[i][j + 1],
						);
					} else {
						this.unhighlight(7, 3);
						this.cmd(act.setHighlight, this.tableID[i][j + 1], 0);
						this.tableVals[i + 1][j + 1] = this.tableVals[i + 1][j];
						this.cmd(
							act.createLabel,
							moveID,
							this.tableVals[i + 1][j],
							this.tableXPos[i + 1][j],
							this.tableYPos[i + 1][j],
						);
					}
					this.cmd(act.bringToTop, moveID, 1);
					this.cmd(
						act.move,
						moveID,
						this.tableXPos[i + 1][j + 1],
						this.tableYPos[i + 1][j + 1],
					);
					this.cmd(act.step);
					this.cmd(act.setText, this.tableID[i + 1][j + 1], this.tableVals[i + 1][j + 1]);
					this.cmd(act.delete, moveID);
					if (this.tableVals[i][j + 1] > this.tableVals[i + 1][j]) {
						this.unhighlight(7, 3);
						this.cmd(act.setHighlight, this.tableID[i][j + 1], 0);
					} else {
						this.unhighlight(7, 1);
						this.cmd(act.setHighlight, this.tableID[i + 1][j], 0);
					}
				}
				this.cmd(act.setHighlight, this.tableID[i + 1][j + 1], 0);
			}
		}

		this.highlight(9, 0);
		this.highlight(10, 0);
		this.highlight(11, 0);
		this.highlight(12, 0);

		this.cmd(act.setText, this.infoLabelID, 'Finished building table, can now find LCS');
		this.cmd(act.step);

		this.buildLCSFromTable(str1, str2);

		this.unhighlight(24, 0);
		this.highlight(25, 0);
		this.cmd(act.setText, this.infoLabelID, 'Done');
		this.cmd(act.step);
		this.unhighlight(25, 0);

		return this.commands;
	}

	buildTable(str1, str2) {
		const x = str1.length;
		const y = str2.length;
		this.tableID = new Array(x + 1);
		this.tableVals = new Array(x + 1);
		this.tableXPos = new Array(x + 1);
		this.tableYPos = new Array(x + 1);

		let i, j;

		this.S1TableID = new Array(x);
		for (i = 0; i <= x; i++) {
			if (i > 0) {
				this.S1TableID[i - 1] = this.nextIndex++;
				this.cmd(
					act.createLabel,
					this.S1TableID[i - 1],
					str1.charAt(i - 1),
					TABLE_START_X + i * TABLE_ELEM_WIDTH,
					TABLE_START_Y - 2 * TABLE_ELEM_HEIGHT,
				);
				this.oldIDs.push(this.S1TableID[i - 1]);
			}
			const index = this.nextIndex++;
			this.oldIDs.push(index);
			this.cmd(
				act.createLabel,
				index,
				i - 1 === -1 ? '\u2205' : i - 1,
				TABLE_START_X + i * TABLE_ELEM_WIDTH,
				TABLE_START_Y - 1 * TABLE_ELEM_HEIGHT,
			);
			this.cmd(act.setForegroundColor, index, '#0000FF');
		}

		this.S2TableID = new Array(y);
		for (i = 0; i <= y; i++) {
			if (i > 0) {
				this.S2TableID[i - 1] = this.nextIndex++;
				this.cmd(
					act.createLabel,
					this.S2TableID[i - 1],
					str2.charAt(i - 1),
					TABLE_START_X - 2 * TABLE_ELEM_WIDTH,
					TABLE_START_Y + i * TABLE_ELEM_HEIGHT,
				);
				this.oldIDs.push(this.S2TableID[i - 1]);
			}
			const index = this.nextIndex++;
			this.oldIDs.push(index);
			this.cmd(
				act.createLabel,
				index,
				i - 1 === -1 ? '\u2205' : i - 1,
				TABLE_START_X - 1 * TABLE_ELEM_WIDTH,
				TABLE_START_Y + i * TABLE_ELEM_HEIGHT,
			);
			this.cmd(act.setForegroundColor, index, '#0000FF');
		}

		for (i = 0; i <= x; i++) {
			this.tableID[i] = new Array(y + 1);
			this.tableVals[i] = new Array(y + 1);
			this.tableXPos[i] = new Array(y + 1);
			this.tableYPos[i] = new Array(y + 1);

			for (j = 0; j <= y; j++) {
				this.tableID[i][j] = this.nextIndex++;
				this.tableVals[i][j] = -1;
				this.oldIDs.push(this.tableID[i][j]);

				this.tableXPos[i][j] = TABLE_START_X + i * TABLE_ELEM_WIDTH;
				this.tableYPos[i][j] = TABLE_START_Y + j * TABLE_ELEM_HEIGHT;

				this.cmd(
					act.createRectangle,
					this.tableID[i][j],
					'',
					TABLE_ELEM_WIDTH,
					TABLE_ELEM_HEIGHT,
					this.tableXPos[i][j],
					this.tableYPos[i][j],
				);
			}
		}
	}

	clearOldIDs() {
		for (let i = 0; i < this.oldIDs.length; i++) {
			this.cmd(act.delete, this.oldIDs[i]);
		}
		this.oldIDs = [];
		this.nextIndex = this.initialIndex;
	}

	buildLCSFromTable(str1, str2) {
		let currX = this.tableVals.length - 1;
		let currY = this.tableVals[0].length - 1;

		const sequence = [];

		const header = this.nextIndex++;
		this.oldIDs.push(header);
		this.cmd(
			act.createLabel,
			header,
			'Longest Common Subsequence:',
			SEQUENCE_START_X,
			SEQUENCE_START_Y - 25,
			0,
		);
		this.cmd(act.setForegroundColor, header, '#003300');

		for (let i = 1; i <= str1.length; i++) {
			for (let j = 1; j <= str2.length; j++) {
				const topThick = this.tableVals[i][j] !== this.tableVals[i][j - 1];
				const leftThick = this.tableVals[i][j] !== this.tableVals[i - 1][j];
				if (topThick || leftThick) {
					this.cmd(act.setRectangleEdgeThickness, this.tableID[i][j], [
						topThick,
						false,
						false,
						leftThick,
					]);
				}
			}
		}
		this.cmd(act.step);
		this.unhighlight(9, 0);
		this.unhighlight(10, 0);
		this.unhighlight(11, 0);
		this.unhighlight(12, 0);

		while (currX > 0 && currY > 0) {
			this.cmd(act.setBackgroundColor, this.tableID[currX][currY], LCS_CELL_COLOR);
			this.cmd(act.step);

			this.unhighlight(14, 1);
			this.unhighlight(15, 1);
			for (let i = 16; i < 24; i++) {
				this.unhighlight(i, 0);
			}

			this.highlight(14, 1);
			this.cmd(act.setHighlight, this.tableID[currX - 1][currY], 1);
			this.cmd(act.setHighlight, this.tableID[currX][currY - 1], 1);
			this.cmd(act.step);
			
			this.unhighlight(14, 1);
			this.cmd(act.setHighlight, this.tableID[currX - 1][currY], 0);
			this.cmd(act.setHighlight, this.tableID[currX][currY - 1], 0);

			if (this.tableVals[currX - 1][currY] === this.tableVals[currX][currY - 1]) {
				this.highlight(15, 1);
				this.cmd(act.setHighlight, this.tableID[currX][currY], 1);
				this.cmd(act.setHighlight, this.tableID[currX - 1][currY - 1], 1);
				this.cmd(act.step);
				
				this.unhighlight(15, 1);

				this.cmd(act.setHighlight, this.tableID[currX][currY], 0);
				this.cmd(act.setHighlight, this.tableID[currX - 1][currY - 1], 0);
			}

			if (
				this.tableVals[currX - 1][currY] === this.tableVals[currX][currY - 1] &&
				this.tableVals[currX - 1][currY] !== this.tableVals[currX][currY]
			) {
				this.cmd(act.setHighlight, this.S1TableID[currX - 1], 1);
				this.cmd(act.setHighlight, this.S2TableID[currY - 1], 1);
				this.cmd(
					act.setText,
					this.infoLabelID,
					'Hit a corner, move diagonally and add current character to LCS',
				);
				this.cmd(act.step);

				this.cmd(act.setHighlight, this.S1TableID[currX - 1], 0);
				this.cmd(act.setHighlight, this.S2TableID[currY - 1], 0);
			} else {
				if (this.tableVals[currX - 1][currY] > this.tableVals[currX][currY - 1]) {
					this.highlight(20, 1);
					this.cmd(act.setHighlight, this.tableID[currX - 1][currY], 1);
					this.cmd(act.setHighlight, this.tableID[currX][currY - 1], 1);
					this.cmd(act.step);

					this.unhighlight(20, 1);
					this.cmd(act.setHighlight, this.tableID[currX - 1][currY], 0);
					this.cmd(act.setHighlight, this.tableID[currX][currY - 1], 0);
					this.highlight(21, 0);

					this.cmd(act.setText, this.infoLabelID, 'Move left');
				} else {
					this.highlight(23, 0);

					this.cmd(act.setText, this.infoLabelID, 'Move up');
				}
			}

			if (
				this.tableVals[currX - 1][currY] === this.tableVals[currX][currY - 1] &&
				this.tableVals[currX - 1][currY] !== this.tableVals[currX][currY]
			) {
				const nextSequenceID = this.nextIndex++;
				this.oldIDs.push(nextSequenceID);
				sequence.push(nextSequenceID);
				this.cmd(
					act.createLabel,
					nextSequenceID,
					str1.charAt(currX - 1),
					SEQUENCE_START_X + (sequence.length - 1) * SEQUENCE_DELTA_X + 4,
					SEQUENCE_START_Y,
				);
				this.cmd(act.setForegroundColor, nextSequenceID, '#0000FF');

				for (let i = sequence.length - 1; i >= 0; i--) {
					this.cmd(
						act.move,
						sequence[i],
						SEQUENCE_START_X + (sequence.length - 1 - i) * SEQUENCE_DELTA_X + 4,
						SEQUENCE_START_Y,
					);
				}

				this.highlight(16, 0);
				this.highlight(17, 0);
				this.highlight(18, 0);

				currX = currX - 1;
				currY = currY - 1;
			} else {
				if (this.tableVals[currX - 1][currY] > this.tableVals[currX][currY - 1]) {
					currX = currX - 1;
					this.highlight(21, 0);
				} else {
					currY = currY - 1;
					this.highlight(23, 0);
				}
			}
		}
		for (let i = 16; i < 24; i++) {
			this.unhighlight(i, 0);
		}
		this.highlight(24, 0);
		this.cmd(act.step);
	}

	highlight(ind1, ind2) {
		this.cmd(act.setForegroundColor, this.codeID[ind1][ind2], CODE_HIGHLIGHT_COLOR);
	}

	unhighlight(ind1, ind2) {
		this.cmd(act.setForegroundColor, this.codeID[ind1][ind2], CODE_STANDARD_COLOR);
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
}
