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

import Algorithm, {
	addControlToAlgorithmBar,
	addDivisorToAlgorithmBar,
	addGroupToAlgorithmBar,
	addLabelToAlgorithmBar,
} from './Algorithm.js';
import { act } from '../anim/AnimationMain';

const MAX_HASH_LENGTH = 4;
const MAX_LOAD_LENGTH = 2;
const DEFAULT_LOAD_FACTOR = 0.67;

const HASH_NUMBER_START_X = 200;
const HASH_X_DIFF = 7;
const HASH_NUMBER_START_Y = 10;
const HASH_ADD_START_Y = 30;
const HASH_INPUT_START_X = 60;
const HASH_INPUT_X_DIFF = 7;
const HASH_INPUT_START_Y = 55;
const HASH_ADD_LINE_Y = 42;
const HASH_RESULT_Y = 50;
const ELF_HASH_SHIFT = 10;

const HASH_LABEL_X = 270;
const HASH_LABEL_Y = 46;
const HASH_LABEL_DELTA_X = 45;

const HIGHLIGHT_COLOR = '#0000FF';

export default class Hash extends Algorithm {
	constructor(am, w, h) {
		super(am, w, h);
		this.addControls();
		this.nextIndex = 0;
		this.hashType = 'integers';
	}

	addControls() {
		this.controls = [];

		const putVerticalGroup = addGroupToAlgorithmBar(false);
		const putTopHorizontalGroup = addGroupToAlgorithmBar(true, putVerticalGroup);
		const putBottomHorizontalGroup = addGroupToAlgorithmBar(true, putVerticalGroup);

		addLabelToAlgorithmBar(`Key: ${'\u00A0'.repeat(2)}`, putTopHorizontalGroup);
		this.keyField = addControlToAlgorithmBar('Text', '', putTopHorizontalGroup);
		this.keyField.size = MAX_HASH_LENGTH;
		this.keyField.onkeydown = this.returnSubmit(
			this.keyField,
			this.insertCallback.bind(this),
			MAX_HASH_LENGTH,
			false,
		);
		this.controls.push(this.keyField);

		addLabelToAlgorithmBar('Value: ', putBottomHorizontalGroup);
		this.valueField = addControlToAlgorithmBar('Text', '', putBottomHorizontalGroup);
		this.valueField.size = MAX_HASH_LENGTH;
		this.valueField.onkeydown = this.returnSubmit(
			this.valueField,
			this.insertCallback.bind(this),
			MAX_HASH_LENGTH,
			false,
		);
		this.controls.push(this.valueField);

		this.insertButton = addControlToAlgorithmBar('Button', 'Insert');
		this.insertButton.onclick = this.insertCallback.bind(this);
		this.controls.push(this.insertButton);

		addDivisorToAlgorithmBar();

		this.deleteField = addControlToAlgorithmBar('Text', '');
		this.deleteField.setAttribute('placeholder', 'Key');
		this.deleteField.size = MAX_HASH_LENGTH;
		this.deleteField.onkeydown = this.returnSubmit(
			this.keyField,
			this.deleteCallback.bind(this),
			MAX_HASH_LENGTH,
			false,
		);
		this.controls.push(this.deleteField);

		this.deleteButton = addControlToAlgorithmBar('Button', 'Delete');
		this.deleteButton.onclick = this.deleteCallback.bind(this);
		this.controls.push(this.deleteButton);

		addDivisorToAlgorithmBar();

		this.findField = addControlToAlgorithmBar('Text', '');
		this.findField.setAttribute('placeholder', 'Key');
		this.findField.size = MAX_HASH_LENGTH;
		this.findField.onkeydown = this.returnSubmit(
			this.keyField,
			this.findCallback.bind(this),
			MAX_HASH_LENGTH,
			false,
		);
		this.controls.push(this.findField);

		this.findButton = addControlToAlgorithmBar('Button', 'Find');
		this.findButton.onclick = this.findCallback.bind(this);
		this.controls.push(this.findButton);

		addDivisorToAlgorithmBar();

		const loadVerticalGroup = addGroupToAlgorithmBar(false);
		const loadVerticalTop = addGroupToAlgorithmBar(true, loadVerticalGroup);
		const loadPercentGroup = addGroupToAlgorithmBar(true, loadVerticalTop);
		const loadVerticalBottom = addGroupToAlgorithmBar(true, loadVerticalGroup);

		this.loadField = addControlToAlgorithmBar('Text', '', loadPercentGroup);
		this.loadField.setAttribute('placeholder', '67');
		this.loadFieldLabel = addLabelToAlgorithmBar('%', loadPercentGroup);

		this.loadField.size = MAX_LOAD_LENGTH;
		this.loadField.onkeydown = this.returnSubmit(
			this.loadField,
			this.loadFactorCallBack.bind(this),
			MAX_LOAD_LENGTH,
			true,
		);

		this.controls.push(this.loadField);

		this.loadButton = addControlToAlgorithmBar('Button', 'Load Factor', loadVerticalBottom);
		this.loadButton.onclick = this.loadFactorCallBack.bind(this);
		this.controls.push(this.loadButton);

		addDivisorToAlgorithmBar();

		this.rightVerticalGroup = addGroupToAlgorithmBar(false);
		this.rightVerticalTop = addGroupToAlgorithmBar(true, this.rightVerticalGroup);
		this.rightVerticalBottom = addGroupToAlgorithmBar(true, this.rightVerticalGroup);

		this.initialCapacityLabel = addLabelToAlgorithmBar(
			'Initial Capacity: ',
			this.rightVerticalTop,
		);
		this.initialCapacityField = addControlToAlgorithmBar('Text', '', this.rightVerticalTop);
		this.initialCapacityField.size = MAX_HASH_LENGTH;
		this.restartButton = addControlToAlgorithmBar(
			'Button',
			'Restart',
			this.rightVerticalBottom,
		);
		this.initialCapacityField.onkeydown = this.returnSubmit(
			this.initialCapacityField,
			null,
			2,
			true,
		);
		this.restartButton.onclick = this.clearCallback.bind(this);

		addDivisorToAlgorithmBar();

		this.dropDownParentGroup = addGroupToAlgorithmBar(false);
		this.dropDownLabelGroup = addGroupToAlgorithmBar(true, this.dropDownParentGroup);
		this.dropDownGroup = addGroupToAlgorithmBar(true, this.dropDownParentGroup);
	}

	checkHashType() {
		if (this.hashTypeDropDown.value === 'Integers') {
			this.implementAction(this.changeHashType.bind(this), 'integers');
		} else if (this.hashTypeDropDown.value === 'Strings') {
			this.implementAction(this.changeHashType.bind(this), 'strings');
		} else if (this.hashTypeDropDown.value === 'True') {
			this.implementAction(this.changeHashType.bind(this), 'true');
		}
	}

	// Do this extra level of wrapping to get undo to work properly.
	// (also, so that we only implement the action if we are changing the
	// radio button)

	changeHashType(newHashType) {
		if (this.hashType !== newHashType) {
			this.hashType = newHashType;
			this.keyField.onkeydown = this.returnSubmit(
				this.keyField,
				this.insertCallback.bind(this),
				MAX_HASH_LENGTH,
				false,
			);
			this.deleteField.onkeydown = this.returnSubmit(
				this.keyField,
				this.deleteCallback.bind(this),
				MAX_HASH_LENGTH,
				false,
			);
			this.findField.onkeydown = this.returnSubmit(
				this.keyField,
				this.findCallback.bind(this),
				MAX_HASH_LENGTH,
				false,
			);
			return this.resetAll();
		}
		return;
	}

	randomCallback() {
		const LOWER_BOUND = 0;
		const UPPER_BOUND = 16;
		const MAX_SIZE = 12;
		const MIN_SIZE = 2;
		const randomSize = Math.floor(Math.random() * (MAX_SIZE - MIN_SIZE + 1)) + MIN_SIZE;

		this.implementAction(this.clear.bind(this));

		for (let i = 0; i < randomSize; i++) {
			let key;
			let value;
			if (this.hashType === 'integers') {
				key = Math.floor(Math.random() * (UPPER_BOUND - LOWER_BOUND + 1)) + LOWER_BOUND;
				value = Math.floor(Math.random() * (UPPER_BOUND - LOWER_BOUND + 1)) + LOWER_BOUND;
			} else if (this.hashType === 'strings') {
				// generate a random string using letters A-Z
				const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
				const letter = letters.charAt(Math.floor(Math.random() * letters.length));
				key = letter;
				value = Math.floor(Math.random() * (UPPER_BOUND - LOWER_BOUND + 1)) + LOWER_BOUND;
			} else if (this.hashType === 'true') {
				// generate a random string using letters A-Z
				const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
				const letter = letters.charAt(Math.floor(Math.random() * letters.length));
				key = letter;
				value = Math.floor(Math.random() * (UPPER_BOUND - LOWER_BOUND + 1)) + LOWER_BOUND;
			}
			this.implementAction(this.insertElement.bind(this), key, value);
			this.animationManager.skipForward();
			this.animationManager.clearHistory();
		}
	}

	clearCallback() {
		this.implementAction(this.clear.bind(this));
	}

	doHash(input, resetHash) {
		const desiredMode = isNaN(parseInt(input)) ? 'strings' : 'integers';

		if (desiredMode !== this.hashType) {
			throw new Error(`That key is not a valid input for the hash type "${this.hashType}"`);
		}

		if (this.hashType === 'integers') {
			const labelID1 = this.nextIndex++;
			const labelID2 = this.nextIndex++;
			const highlightID = this.nextIndex++;
			const index = ((parseInt(input) % this.table_size) + this.table_size) % this.table_size;
			this.currHash = parseInt(input);

			this.cmd(
				act.createLabel,
				labelID1,
				input + ' % ' + String(this.table_size) + ' = ',
				HASH_LABEL_X,
				HASH_LABEL_Y,
			);
			this.cmd(
				act.createLabel,
				labelID2,
				index,
				HASH_LABEL_X + HASH_LABEL_DELTA_X,
				HASH_LABEL_Y,
			);
			this.cmd(act.step);
			this.cmd(
				act.createHighlightCircle,
				highlightID,
				HIGHLIGHT_COLOR,
				HASH_LABEL_X + HASH_LABEL_DELTA_X,
				HASH_LABEL_Y,
			);
			this.cmd(act.move, highlightID, this.indexXPos[index], this.indexYPos[index]);
			this.cmd(act.step);
			this.cmd(act.delete, labelID1);
			this.cmd(act.delete, labelID2);
			this.cmd(act.delete, highlightID);
			this.nextIndex -= 3;

			return index;
		} else if (this.hashType === 'strings') {
			const label1 = this.nextIndex++;
			this.cmd(act.createLabel, label1, 'Hashing:', 10, 55, 0);
			const wordToHashID = new Array(input.length);
			const wordToHash = new Array(input.length);
			for (let i = 0; i < input.length; i++) {
				wordToHashID[i] = this.nextIndex++;
				wordToHash[i] = input.charAt(i);
				this.cmd(
					act.createLabel,
					wordToHashID[i],
					wordToHash[i],
					HASH_INPUT_START_X + i * HASH_INPUT_X_DIFF,
					HASH_INPUT_START_Y,
					0,
				);
			}
			const digits = new Array(32);
			const hashValue = new Array(32);
			const nextByte = new Array(8);
			const nextByteID = new Array(8);
			const resultDigits = new Array(32);
			const floatingDigits = new Array(4);
			const floatingVals = new Array(4);

			const operatorID = this.nextIndex++;
			const barID = this.nextIndex++;
			for (let i = 0; i < 32; i++) {
				hashValue[i] = 0;
				digits[i] = this.nextIndex++;
				resultDigits[i] = this.nextIndex++;
			}
			for (let i = 0; i < 8; i++) {
				nextByteID[i] = this.nextIndex++;
			}
			for (let i = 0; i < 4; i++) {
				floatingDigits[i] = this.nextIndex++;
			}
			this.cmd(act.step);
			for (let i = wordToHash.length - 1; i >= 0; i--) {
				for (let j = 0; j < 32; j++) {
					this.cmd(
						act.createLabel,
						digits[j],
						hashValue[j],
						HASH_NUMBER_START_X + j * HASH_X_DIFF,
						HASH_NUMBER_START_Y,
						0,
					);
				}
				this.cmd(act.delete, wordToHashID[i]);
				let nextChar = wordToHash[i].charCodeAt(0);
				for (let j = 7; j >= 0; j--) {
					nextByte[j] = nextChar % 2;
					nextChar = Math.floor(nextChar / 2);
					this.cmd(
						act.createLabel,
						nextByteID[j],
						nextByte[j],
						HASH_INPUT_START_X + i * HASH_INPUT_X_DIFF,
						HASH_INPUT_START_Y,
						0,
					);
					this.cmd(
						act.move,
						nextByteID[j],
						HASH_NUMBER_START_X + (j + 24) * HASH_X_DIFF,
						HASH_ADD_START_Y,
					);
				}
				this.cmd(act.step);
				this.cmd(
					act.createRectangle,
					barID,
					'',
					32 * HASH_X_DIFF,
					0,
					HASH_NUMBER_START_X,
					HASH_ADD_LINE_Y,
					'left',
					'bottom',
				);
				this.cmd(
					act.createLabel,
					operatorID,
					'+',
					HASH_NUMBER_START_X,
					HASH_ADD_START_Y,
					0,
				);
				this.cmd(act.step);

				let carry = 0;
				for (let j = 7; j >= 0; j--) {
					hashValue[j + 24] = hashValue[j + 24] + nextByte[j] + carry;
					if (hashValue[j + 24] > 1) {
						hashValue[j + 24] = hashValue[j + 24] - 2;
						carry = 1;
					} else {
						carry = 0;
					}
				}
				for (let j = 23; j >= 0; j--) {
					hashValue[j] = hashValue[j] + carry;
					if (hashValue[j] > 1) {
						hashValue[j] = hashValue[j] - 2;
						carry = 1;
					} else {
						carry = 0;
					}
				}
				for (let j = 0; j < 32; j++) {
					this.cmd(
						act.createLabel,
						resultDigits[j],
						hashValue[j],
						HASH_NUMBER_START_X + j * HASH_X_DIFF,
						HASH_RESULT_Y,
						0,
					);
				}

				this.cmd(act.step);
				for (let j = 0; j < 8; j++) {
					this.cmd(act.delete, nextByteID[j]);
				}
				this.cmd(act.delete, barID);
				this.cmd(act.delete, operatorID);
				for (let j = 0; j < 32; j++) {
					this.cmd(act.delete, digits[j]);
					this.cmd(
						act.move,
						resultDigits[j],
						HASH_NUMBER_START_X + j * HASH_X_DIFF,
						HASH_NUMBER_START_Y,
					);
				}
				this.cmd(act.step);
				if (i > 0) {
					for (let j = 0; j < 32; j++) {
						this.cmd(
							act.move,
							resultDigits[j],
							HASH_NUMBER_START_X + (j - 4) * HASH_X_DIFF,
							HASH_NUMBER_START_Y,
						);
					}
					this.cmd(act.step);
					for (let j = 0; j < 28; j++) {
						floatingVals[j] = hashValue[j];
						hashValue[j] = hashValue[j + 4];
					}

					for (let j = 0; j < 4; j++) {
						this.cmd(
							act.move,
							resultDigits[j],
							HASH_NUMBER_START_X + (j + ELF_HASH_SHIFT) * HASH_X_DIFF,
							HASH_ADD_START_Y,
						);
						hashValue[j + 28] = 0;
						this.cmd(
							act.createLabel,
							floatingDigits[j],
							0,
							HASH_NUMBER_START_X + (j + 28) * HASH_X_DIFF,
							HASH_NUMBER_START_Y,
							0,
						);
						if (floatingVals[j]) {
							hashValue[j + ELF_HASH_SHIFT] = 1 - hashValue[j + ELF_HASH_SHIFT];
						}
					}
					this.cmd(
						act.createRectangle,
						barID,
						'',
						32 * HASH_X_DIFF,
						0,
						HASH_NUMBER_START_X,
						HASH_ADD_LINE_Y,
						'left',
						'bottom',
					);
					this.cmd(
						act.createLabel,
						operatorID,
						'XOR',
						HASH_NUMBER_START_X,
						HASH_ADD_START_Y,
						0,
					);
					this.cmd(act.step);
					for (let j = 0; j < 32; j++) {
						this.cmd(
							act.createLabel,
							digits[j],
							hashValue[j],
							HASH_NUMBER_START_X + j * HASH_X_DIFF,
							HASH_RESULT_Y,
							0,
						);
					}
					this.cmd(act.step);

					this.cmd(act.delete, operatorID);
					this.cmd(act.delete, barID);
					for (let j = 0; j < 32; j++) {
						this.cmd(act.delete, resultDigits[j]);
						this.cmd(
							act.move,
							digits[j],
							HASH_NUMBER_START_X + j * HASH_X_DIFF,
							HASH_NUMBER_START_Y,
						);
					}
					for (let j = 0; j < 4; j++) {
						this.cmd(act.delete, floatingDigits[j]);
					}
					this.cmd(act.step);
					for (let j = 0; j < 32; j++) {
						this.cmd(act.delete, digits[j]);
					}
				} else {
					for (let j = 0; j < 32; j++) {
						this.cmd(act.delete, resultDigits[j]);
					}
				}
			}
			this.cmd(act.delete, label1);
			for (let j = 0; j < 32; j++) {
				this.cmd(
					act.createLabel,
					digits[j],
					hashValue[j],
					HASH_NUMBER_START_X + j * HASH_X_DIFF,
					HASH_NUMBER_START_Y,
					0,
				);
			}
			this.currHash = 0;
			for (let j = 0; j < 32; j++) {
				this.currHash = this.currHash * 2 + hashValue[j];
			}
			this.cmd(
				act.createLabel,
				label1,
				' = ' + String(this.currHash),
				HASH_NUMBER_START_X + 32 * HASH_X_DIFF,
				HASH_NUMBER_START_Y,
				0,
			);
			this.cmd(act.step);
			for (let j = 0; j < 32; j++) {
				this.cmd(act.delete, digits[j]);
			}

			const label2 = this.nextIndex++;
			this.cmd(
				act.setText,
				label1,
				String(this.currHash) + ' % ' + String(this.table_size) + ' = ',
			);
			const index = this.currHash % this.table_size;
			this.cmd(
				act.createLabel,
				label2,
				index,
				HASH_NUMBER_START_X + 32 * HASH_X_DIFF + 105,
				HASH_NUMBER_START_Y,
				0,
			);
			this.cmd(act.step);
			const highlightID = this.nextIndex++;
			this.cmd(
				act.createHighlightCircle,
				highlightID,
				HIGHLIGHT_COLOR,
				HASH_NUMBER_START_X + 30 * HASH_X_DIFF + 120,
				HASH_NUMBER_START_Y + 15,
			);
			this.cmd(act.move, highlightID, this.indexXPos[index], this.indexYPos[index]);
			this.cmd(act.step);
			this.cmd(act.delete, highlightID);
			this.cmd(act.delete, label1);
			this.cmd(act.delete, label2);

			return index;
		} else if (this.hashType === 'true') {
			const labelID1 = this.nextIndex++;
			const labelID2 = this.nextIndex++;
			const labelID3 = this.nextIndex++;
			const highlightID = this.nextIndex++;
			const hash = this.trueHash(String(input));
			const index = hash % this.table_size;

			this.cmd(
				act.createLabel,
				labelID1,
				input + '.hashcode() % ' + String(this.table_size) + ' = ',
				HASH_LABEL_X,
				HASH_LABEL_Y,
			);
			this.cmd(
				act.createLabel,
				labelID2,
				String(hash) + ' % ' + String(this.table_size) + ' = ',
				HASH_LABEL_X,
				HASH_LABEL_Y + 25,
			);
			this.cmd(
				act.createLabel,
				labelID3,
				index,
				HASH_LABEL_X + HASH_LABEL_DELTA_X,
				HASH_LABEL_Y + 25,
			);
			this.cmd(act.step);
			this.cmd(
				act.createHighlightCircle,
				highlightID,
				HIGHLIGHT_COLOR,
				HASH_LABEL_X + HASH_LABEL_DELTA_X,
				HASH_LABEL_Y + 25,
			);
			this.cmd(act.move, highlightID, this.indexXPos[index], this.indexYPos[index]);
			this.cmd(act.step);
			this.cmd(act.delete, labelID1);
			this.cmd(act.delete, labelID2);
			this.cmd(act.delete, labelID3);
			this.cmd(act.delete, highlightID);
			this.nextIndex -= 4;

			return index;
		}
	}

	trueHash(key) {
		if (key === '0') {
			return 0;
		}
		let hash = 0;
		for (let i = 0; i < key.length; i++) {
			hash = (hash << 5) - hash + key.charCodeAt(i);
			hash ^= 11597109109121;
			hash &= 0xffff; // convert to 16 bits
		}
		return hash;
	}

	resetAll() {
		this.implementAction(this.changeLoadFactor.bind(this), DEFAULT_LOAD_FACTOR);
		this.keyField.value = '';
		this.valueField.value = '';
		this.deleteField.value = '';
		this.findField.value = '';
		this.loadField.value = '';
		return [];
	}

	insertCallback() {
		const insertedKey = this.keyField.value;
		const insertedValue = this.valueField.value;
		if (insertedKey !== '' && insertedValue !== '') {
			this.keyField.value = '';
			this.valueField.value = '';
			this.implementAction(this.insertElement.bind(this), insertedKey, insertedValue);
		} else {
			this.shake(this.insertButton);
		}
	}

	deleteCallback() {
		const deletedValue = this.deleteField.value;
		if (deletedValue !== '') {
			this.deleteField.value = '';
			this.implementAction(this.deleteElement.bind(this), deletedValue);
		} else {
			this.shake(this.deleteButton);
		}
	}

	findCallback() {
		const findValue = this.findField.value;
		if (findValue !== '') {
			this.findField.value = '';
			this.implementAction(this.findElement.bind(this), findValue);
		} else {
			this.shake(this.findButton);
		}
	}

	loadFactorCallBack() {
		const newLF =
			this.loadField.value && this.loadField.value > 0
				? parseInt(this.loadField.value) / 100
				: DEFAULT_LOAD_FACTOR;
		this.loadField.value = (newLF * 100).toFixed(0);
		this.implementAction(this.changeLoadFactor.bind(this), newLF);
	}

	reset() {
		this.hashType = 'integers';
	}

	disableUI() {
		for (let i = 0; i < this.controls.length; i++) {
			this.controls[i].disabled = true;
			this.restartButton.disabled = true;
		}
	}

	enableUI() {
		for (let i = 0; i < this.controls.length; i++) {
			this.controls[i].disabled = false;
			this.restartButton.disabled = false;
		}
	}
}
