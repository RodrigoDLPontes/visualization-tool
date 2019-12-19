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
	addRadioButtonGroupToAlgorithmBar,
} from './Algorithm.js';

const MAX_HASH_LENGTH = 10;

const HASH_NUMBER_START_X = 200;
const HASH_X_DIFF = 7;
const HASH_NUMBER_START_Y = 10;
const HASH_ADD_START_Y = 30;
const HASH_INPUT_START_X = 60;
const HASH_INPUT_X_DIFF = 7;
const HASH_INPUT_START_Y = 45;
const HASH_ADD_LINE_Y = 42;
const HASH_RESULT_Y = 50;
const ELF_HASH_SHIFT = 10;

const HASH_LABEL_X = 300;
const HASH_LABEL_Y = 30;
const HASH_LABEL_DELTA_X = 50;

const HIGHLIGHT_COLOR = '#0000FF';

export default class Hash extends Algorithm {
	constructor(am, w, h) {
		super(am, w, h);
		this.addControls();
		this.nextIndex = 0;
		this.hashingIntegers = true;
	}

	addControls() {
		this.insertField = addControlToAlgorithmBar('Text', '');
		this.insertField.size = MAX_HASH_LENGTH;
		this.insertField.onkeydown = this.returnSubmit(
			this.insertField,
			this.insertCallback.bind(this),
			MAX_HASH_LENGTH,
			true
		);
		this.insertButton = addControlToAlgorithmBar('Button', 'Insert');
		this.insertButton.onclick = this.insertCallback.bind(this);

		this.deleteField = addControlToAlgorithmBar('Text', '');
		this.deleteField.size = MAX_HASH_LENGTH;
		this.deleteField.onkeydown = this.returnSubmit(
			this.insertField,
			this.deleteCallback.bind(this),
			MAX_HASH_LENGTH,
			true
		);
		this.deleteButton = addControlToAlgorithmBar('Button', 'Delete');
		this.deleteButton.onclick = this.deleteCallback.bind(this);

		this.findField = addControlToAlgorithmBar('Text', '');
		this.findField.size = MAX_HASH_LENGTH;
		this.findField.onkeydown = this.returnSubmit(
			this.insertField,
			this.findCallback.bind(this),
			MAX_HASH_LENGTH,
			true
		);
		this.findButton = addControlToAlgorithmBar('Button', 'Find');
		this.findButton.onclick = this.findCallback.bind(this);

		const radioButtonList = addRadioButtonGroupToAlgorithmBar(
			['Hash Integer', 'Hash Strings'],
			'HashType'
		);
		this.hashIntegerButton = radioButtonList[0];
		this.hashIntegerButton.onclick = this.changeHashTypeCallback.bind(this, true);
		//  this.hashIntegerButton.onclick = this.hashIntegerCallback.bind(this);
		this.hashStringButton = radioButtonList[1];
		this.hashStringButton.onclick = this.changeHashTypeCallback.bind(this, false);

		//	this.hashStringButton.onclick = this.hashStringCallback.bind(this);
		this.hashIntegerButton.checked = true;
	}

	// Do this extra level of wrapping to get undo to work properly.
	// (also, so that we only implement the action if we are changing the
	// radio button)
	changeHashTypeCallback(newHashingIntegers) {
		if (this.hashingIntegers !== newHashingIntegers) {
			this.implementAction(this.changeHashType.bind(this), newHashingIntegers);
		}
	}

	changeHashType(newHashingIntegerValue) {
		this.hashingIntegers = newHashingIntegerValue;
		if (this.hashingIntegers) {
			this.hashIntegerButton.checked = true;
			this.insertField.onkeydown = this.returnSubmit(
				this.insertField,
				this.insertCallback.bind(this),
				MAX_HASH_LENGTH,
				true
			);
			this.deleteField.onkeydown = this.returnSubmit(
				this.insertField,
				this.deleteCallback.bind(this),
				MAX_HASH_LENGTH,
				true
			);
			this.findField.onkeydown = this.returnSubmit(
				this.insertField,
				this.findCallback.bind(this),
				MAX_HASH_LENGTH,
				true
			);
		} else {
			this.hashStringButton.checked = true;
			this.insertField.onkeydown = this.returnSubmit(
				this.insertField,
				this.insertCallback.bind(this),
				MAX_HASH_LENGTH,
				false
			);
			this.deleteField.onkeydown = this.returnSubmit(
				this.insertField,
				this.deleteCallback.bind(this),
				MAX_HASH_LENGTH,
				false
			);
			this.findField.onkeydown = this.returnSubmit(
				this.insertField,
				this.findCallback.bind(this),
				MAX_HASH_LENGTH,
				false
			);
		}
		return this.resetAll();
	}

	doHash(input) {
		if (this.hashingIntegers) {
			const labelID1 = this.nextIndex++;
			const labelID2 = this.nextIndex++;
			const highlightID = this.nextIndex++;
			const index = parseInt(input) % this.table_size;
			this.currHash = parseInt(input);

			this.cmd(
				'CreateLabel',
				labelID1,
				input + ' % ' + String(this.table_size) + ' = ',
				HASH_LABEL_X,
				HASH_LABEL_Y
			);
			this.cmd(
				'CreateLabel',
				labelID2,
				index,
				HASH_LABEL_X + HASH_LABEL_DELTA_X,
				HASH_LABEL_Y
			);
			this.cmd('Step');
			this.cmd(
				'CreateHighlightCircle',
				highlightID,
				HIGHLIGHT_COLOR,
				HASH_LABEL_X + HASH_LABEL_DELTA_X,
				HASH_LABEL_Y
			);
			this.cmd('Move', highlightID, this.indexXPos[index], this.indexYPos[index]);
			this.cmd('Step');
			this.cmd('Delete', labelID1);
			this.cmd('Delete', labelID2);
			this.cmd('Delete', highlightID);
			this.nextIndex -= 3;

			return index;
		} else {
			// const oldnextIndex = this.nextIndex;
			const label1 = this.nextIndex++;
			this.cmd('CreateLabel', label1, 'Hashing:', 10, 45, 0);
			const wordToHashID = new Array(input.length);
			const wordToHash = new Array(input.length);
			for (let i = 0; i < input.length; i++) {
				wordToHashID[i] = this.nextIndex++;
				wordToHash[i] = input.charAt(i);
				this.cmd(
					'CreateLabel',
					wordToHashID[i],
					wordToHash[i],
					HASH_INPUT_START_X + i * HASH_INPUT_X_DIFF,
					HASH_INPUT_START_Y,
					0
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
			this.cmd('Step');
			for (let i = wordToHash.length - 1; i >= 0; i--) {
				for (let j = 0; j < 32; j++) {
					this.cmd(
						'CreateLabel',
						digits[j],
						hashValue[j],
						HASH_NUMBER_START_X + j * HASH_X_DIFF,
						HASH_NUMBER_START_Y,
						0
					);
				}
				this.cmd('Delete', wordToHashID[i]);
				let nextChar = wordToHash[i].charCodeAt(0);
				for (let j = 7; j >= 0; j--) {
					nextByte[j] = nextChar % 2;
					nextChar = Math.floor(nextChar / 2);
					this.cmd(
						'CreateLabel',
						nextByteID[j],
						nextByte[j],
						HASH_INPUT_START_X + i * HASH_INPUT_X_DIFF,
						HASH_INPUT_START_Y,
						0
					);
					this.cmd(
						'Move',
						nextByteID[j],
						HASH_NUMBER_START_X + (j + 24) * HASH_X_DIFF,
						HASH_ADD_START_Y
					);
				}
				this.cmd('Step');
				this.cmd(
					'CreateRectangle',
					barID,
					'',
					32 * HASH_X_DIFF,
					0,
					HASH_NUMBER_START_X,
					HASH_ADD_LINE_Y,
					'left',
					'bottom'
				);
				this.cmd('CreateLabel', operatorID, '+', HASH_NUMBER_START_X, HASH_ADD_START_Y, 0);
				this.cmd('Step');

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
						'CreateLabel',
						resultDigits[j],
						hashValue[j],
						HASH_NUMBER_START_X + j * HASH_X_DIFF,
						HASH_RESULT_Y,
						0
					);
				}

				this.cmd('Step');
				for (let j = 0; j < 8; j++) {
					this.cmd('Delete', nextByteID[j]);
				}
				this.cmd('Delete', barID);
				this.cmd('Delete', operatorID);
				for (let j = 0; j < 32; j++) {
					this.cmd('Delete', digits[j]);
					this.cmd(
						'Move',
						resultDigits[j],
						HASH_NUMBER_START_X + j * HASH_X_DIFF,
						HASH_NUMBER_START_Y
					);
				}
				this.cmd('Step');
				if (i > 0) {
					for (let j = 0; j < 32; j++) {
						this.cmd(
							'Move',
							resultDigits[j],
							HASH_NUMBER_START_X + (j - 4) * HASH_X_DIFF,
							HASH_NUMBER_START_Y
						);
					}
					this.cmd('Step');
					for (let j = 0; j < 28; j++) {
						floatingVals[j] = hashValue[j];
						hashValue[j] = hashValue[j + 4];
					}

					for (let j = 0; j < 4; j++) {
						this.cmd(
							'Move',
							resultDigits[j],
							HASH_NUMBER_START_X + (j + ELF_HASH_SHIFT) * HASH_X_DIFF,
							HASH_ADD_START_Y
						);
						hashValue[j + 28] = 0;
						this.cmd(
							'CreateLabel',
							floatingDigits[j],
							0,
							HASH_NUMBER_START_X + (j + 28) * HASH_X_DIFF,
							HASH_NUMBER_START_Y,
							0
						);
						if (floatingVals[j]) {
							hashValue[j + ELF_HASH_SHIFT] = 1 - hashValue[j + ELF_HASH_SHIFT];
						}
					}
					this.cmd(
						'CreateRectangle',
						barID,
						'',
						32 * HASH_X_DIFF,
						0,
						HASH_NUMBER_START_X,
						HASH_ADD_LINE_Y,
						'left',
						'bottom'
					);
					this.cmd(
						'CreateLabel',
						operatorID,
						'XOR',
						HASH_NUMBER_START_X,
						HASH_ADD_START_Y,
						0
					);
					this.cmd('Step');
					for (let j = 0; j < 32; j++) {
						this.cmd(
							'CreateLabel',
							digits[j],
							hashValue[j],
							HASH_NUMBER_START_X + j * HASH_X_DIFF,
							HASH_RESULT_Y,
							0
						);
					}
					this.cmd('Step');

					this.cmd('Delete', operatorID);
					this.cmd('Delete', barID);
					for (let j = 0; j < 32; j++) {
						this.cmd('Delete', resultDigits[j]);
						this.cmd(
							'Move',
							digits[j],
							HASH_NUMBER_START_X + j * HASH_X_DIFF,
							HASH_NUMBER_START_Y
						);
					}
					for (let j = 0; j < 4; j++) {
						this.cmd('Delete', floatingDigits[j]);
					}
					this.cmd('Step');
					for (let j = 0; j < 32; j++) {
						this.cmd('Delete', digits[j]);
					}
				} else {
					for (let j = 0; j < 32; j++) {
						this.cmd('Delete', resultDigits[j]);
					}
				}
			}
			this.cmd('Delete', label1);
			for (let j = 0; j < 32; j++) {
				this.cmd(
					'CreateLabel',
					digits[j],
					hashValue[j],
					HASH_NUMBER_START_X + j * HASH_X_DIFF,
					HASH_NUMBER_START_Y,
					0
				);
			}
			this.currHash = 0;
			for (let j = 0; j < 32; j++) {
				this.currHash = this.currHash * 2 + hashValue[j];
			}
			this.cmd(
				'CreateLabel',
				label1,
				' = ' + String(this.currHash),
				HASH_NUMBER_START_X + 32 * HASH_X_DIFF,
				HASH_NUMBER_START_Y,
				0
			);
			this.cmd('Step');
			for (let j = 0; j < 32; j++) {
				this.cmd('Delete', digits[j]);
			}

			const label2 = this.nextIndex++;
			this.cmd(
				'SetText',
				label1,
				String(this.currHash) + ' % ' + String(this.table_size) + ' = '
			);
			const index = this.currHash % this.table_size;
			this.cmd(
				'CreateLabel',
				label2,
				index,
				HASH_NUMBER_START_X + 32 * HASH_X_DIFF + 105,
				HASH_NUMBER_START_Y,
				0
			);
			this.cmd('Step');
			const highlightID = this.nextIndex++;
			this.cmd(
				'CreateHighlightCircle',
				highlightID,
				HIGHLIGHT_COLOR,
				HASH_NUMBER_START_X + 30 * HASH_X_DIFF + 120,
				HASH_NUMBER_START_Y + 15
			);
			this.cmd('Move', highlightID, this.indexXPos[index], this.indexYPos[index]);
			this.cmd('Step');
			this.cmd('Delete', highlightID);
			this.cmd('Delete', label1);
			this.cmd('Delete', label2);
			//this.nextIndex = oldnextIndex;

			return index;
		}
	}

	resetAll() {
		this.insertField.value = '';
		this.deleteField.value = '';
		this.findField.value = '';
		return [];
	}

	insertCallback() {
		const insertedValue = this.insertField.value;
		if (insertedValue !== '') {
			this.insertField.value = '';
			this.implementAction(this.insertElement.bind(this), insertedValue);
		}
	}

	deleteCallback() {
		const deletedValue = this.deleteField.value;
		if (deletedValue !== '') {
			this.deleteField.value = '';
			this.implementAction(this.deleteElement.bind(this), deletedValue);
		}
	}

	findCallback() {
		const findValue = this.findField.value;
		if (findValue !== '') {
			this.findField.value = '';
			this.implementAction(this.findElement.bind(this), findValue);
		}
	}

	insertElement() {}

	deleteElement() {}

	findElement() {}

	// NEED TO OVERRIDE IN PARENT
	reset() {
		this.hashIntegerButton.checked = true;
	}

	disableUI() {
		this.insertField.disabled = true;
		this.insertButton.disabled = true;
		this.deleteField.disabled = true;
		this.deleteButton.disabled = true;
		this.findField.disabled = true;
		this.findButton.disabled = true;
	}

	enableUI() {
		this.insertField.disabled = false;
		this.insertButton.disabled = false;
		this.deleteField.disabled = false;
		this.deleteButton.disabled = false;
		this.findField.disabled = false;
		this.findButton.disabled = false;
	}
}

/* no init, this is only a base export default class! 
var currentAlg;
function init()
{
	var animManag = new AnimationManager();;
	currentAlg = new Hash(animManag, canvas.width, canvas.height);
}
*/
