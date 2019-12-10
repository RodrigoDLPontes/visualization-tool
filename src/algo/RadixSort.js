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

import Algorithm, { addControlToAlgorithmBar } from './Algorithm.js';

const ARRAY_ELEM_WIDTH = 30;
const ARRAY_ELEM_HEIGHT = 30;
const ARRAY_ELEM_START_X = 20;

const ARRAY_SIZE = 30;
const COUNTER_ARRAY_SIZE = 10;

const COUNTER_ARRAY_ELEM_WIDTH = 30;
const COUNTER_ARRAY_ELEM_HEIGHT = 30;
//var COUNTER_ARRAY_ELEM_START_X = 20;
const COUNTER_ARRAY_ELEM_START_X =
	(ARRAY_ELEM_WIDTH * ARRAY_SIZE - COUNTER_ARRAY_ELEM_WIDTH * COUNTER_ARRAY_SIZE) / 2 +
	ARRAY_ELEM_START_X;
const NUM_DIGITS = 3;

const MAX_DATA_VALUE = 999;

export default class RadixSort extends Algorithm {
	constructor(am, w, h) {
		super(am, w, h);

		this.ARRAY_ELEM_Y = 3 * COUNTER_ARRAY_ELEM_HEIGHT;
		this.COUNTER_ARRAY_ELEM_Y = Math.floor(h / 2);
		this.SWAP_ARRAY_ELEM_Y = h - 3 * COUNTER_ARRAY_ELEM_HEIGHT;

		this.addControls();
		this.nextIndex = 0;
		this.setup();
	}

	sizeChanged(newWidth, newHeight) {
		this.ARRAY_ELEM_Y = 3 * COUNTER_ARRAY_ELEM_HEIGHT;
		this.COUNTER_ARRAY_ELEM_Y = Math.floor(newHeight / 2);
		this.SWAP_ARRAY_ELEM_Y = newHeight - 3 * COUNTER_ARRAY_ELEM_HEIGHT;
		this.setup();
	}

	addControls() {
		this.resetButton = addControlToAlgorithmBar('Button', 'Randomize List');
		this.resetButton.onclick = this.resetCallback.bind(this);

		this.radixSortButton = addControlToAlgorithmBar('Button', 'Radix Sort');
		this.radixSortButton.onclick = this.radixSortCallback.bind(this);
	}

	setup() {
		this.arrayData = new Array(ARRAY_SIZE);
		this.arrayRects = new Array(ARRAY_SIZE);
		this.arrayIndices = new Array(ARRAY_SIZE);

		this.counterData = new Array(COUNTER_ARRAY_SIZE);
		this.counterRects = new Array(COUNTER_ARRAY_SIZE);
		this.counterIndices = new Array(COUNTER_ARRAY_SIZE);

		this.swapData = new Array(ARRAY_SIZE);
		this.swapRects = new Array(ARRAY_SIZE);
		this.swapIndices = new Array(ARRAY_SIZE);

		this.commands = [];

		for (let i = 0; i < ARRAY_SIZE; i++) {
			let nextID = this.nextIndex++;
			this.arrayData[i] = Math.floor(Math.random() * MAX_DATA_VALUE);
			this.cmd(
				'CreateRectangle',
				nextID,
				this.arrayData[i],
				ARRAY_ELEM_WIDTH,
				ARRAY_ELEM_HEIGHT,
				ARRAY_ELEM_START_X + i * ARRAY_ELEM_WIDTH,
				this.ARRAY_ELEM_Y
			);
			this.arrayRects[i] = nextID;
			nextID = this.nextIndex++;
			this.arrayIndices[i] = nextID;
			this.cmd(
				'CreateLabel',
				nextID,
				i,
				ARRAY_ELEM_START_X + i * ARRAY_ELEM_WIDTH,
				this.ARRAY_ELEM_Y + ARRAY_ELEM_HEIGHT
			);
			this.cmd('SetForegroundColor', nextID, '#0000FF');

			nextID = this.nextIndex++;
			this.cmd(
				'CreateRectangle',
				nextID,
				'',
				ARRAY_ELEM_WIDTH,
				ARRAY_ELEM_HEIGHT,
				ARRAY_ELEM_START_X + i * ARRAY_ELEM_WIDTH,
				this.SWAP_ARRAY_ELEM_Y
			);
			this.swapRects[i] = nextID;
			nextID = this.nextIndex++;
			this.swapIndices[i] = nextID;
			this.cmd(
				'CreateLabel',
				nextID,
				i,
				ARRAY_ELEM_START_X + i * ARRAY_ELEM_WIDTH,
				this.SWAP_ARRAY_ELEM_Y + ARRAY_ELEM_HEIGHT
			);
			this.cmd('SetForegroundColor', nextID, '#0000FF');
		}
		for (let i = COUNTER_ARRAY_SIZE - 1; i >= 0; i--) {
			let nextID = this.nextIndex++;
			this.cmd(
				'CreateRectangle',
				nextID,
				'',
				COUNTER_ARRAY_ELEM_WIDTH,
				COUNTER_ARRAY_ELEM_HEIGHT,
				COUNTER_ARRAY_ELEM_START_X + i * COUNTER_ARRAY_ELEM_WIDTH,
				this.COUNTER_ARRAY_ELEM_Y
			);
			this.counterRects[i] = nextID;
			nextID = this.nextIndex++;
			this.counterIndices[i] = nextID;
			this.cmd(
				'CreateLabel',
				nextID,
				i,
				COUNTER_ARRAY_ELEM_START_X + i * COUNTER_ARRAY_ELEM_WIDTH,
				this.COUNTER_ARRAY_ELEM_Y + COUNTER_ARRAY_ELEM_HEIGHT
			);
			this.cmd('SetForegroundColor', nextID, '#0000FF');
		}
		this.animationManager.StartNewAnimation(this.commands);
		this.animationManager.skipForward();
		this.animationManager.clearHistory();
	}

	resetAll() {
		this.animationManager.resetAll();
		this.nextIndex = 0;
	}

	radixSortCallback() {
		this.commands = [];
		const animatedCircleID = this.nextIndex++;
		const animatedCircleID2 = this.nextIndex++;
		const animatedCircleID3 = this.nextIndex++;
		const animatedCircleID4 = this.nextIndex++;

		const digits = new Array(NUM_DIGITS);
		for (let k = 0; k < NUM_DIGITS; k++) {
			digits[k] = this.nextIndex++;
		}

		for (let radix = 0; radix < NUM_DIGITS; radix++) {
			for (let i = 0; i < COUNTER_ARRAY_SIZE; i++) {
				this.counterData[i] = 0;
				this.cmd('SetText', this.counterRects[i], 0);
			}
			for (let i = 0; i < ARRAY_SIZE; i++) {
				this.cmd(
					'CreateHighlightCircle',
					animatedCircleID,
					'#0000FF',
					ARRAY_ELEM_START_X + i * ARRAY_ELEM_WIDTH,
					this.ARRAY_ELEM_Y
				);
				this.cmd(
					'CreateHighlightCircle',
					animatedCircleID2,
					'#0000FF',
					ARRAY_ELEM_START_X + i * ARRAY_ELEM_WIDTH,
					this.ARRAY_ELEM_Y
				);

				this.cmd('SetText', this.arrayRects[i], '');

				for (let k = 0; k < NUM_DIGITS; k++) {
					const digitXPos =
						ARRAY_ELEM_START_X +
						i * ARRAY_ELEM_WIDTH -
						ARRAY_ELEM_WIDTH / 2 +
						(NUM_DIGITS - k) * (ARRAY_ELEM_WIDTH / NUM_DIGITS - 3);
					const digitYPos = this.ARRAY_ELEM_Y;
					this.cmd(
						'CreateLabel',
						digits[k],
						Math.floor(this.arrayData[i] / Math.pow(10, k)) % 10,
						digitXPos,
						digitYPos
					);
					if (k !== radix) {
						this.cmd('SetAlpha', digits[k], 0.2);
					}
					//						else
					//						{
					//							this.cmd("SetAlpha", digits[k], 0.2);
					//						}
				}

				const index = Math.floor(this.arrayData[i] / Math.pow(10, radix)) % 10;
				this.cmd(
					'Move',
					animatedCircleID,
					COUNTER_ARRAY_ELEM_START_X + index * COUNTER_ARRAY_ELEM_WIDTH,
					this.COUNTER_ARRAY_ELEM_Y + COUNTER_ARRAY_ELEM_HEIGHT
				);
				this.cmd('Step');
				this.counterData[index]++;
				this.cmd('SetText', this.counterRects[index], this.counterData[index]);
				this.cmd('Step');
				// this.cmd("SetAlpha", this.arrayRects[i], 0.2);
				this.cmd('Delete', animatedCircleID);
				this.cmd('Delete', animatedCircleID2);
				this.cmd('SetText', this.arrayRects[i], this.arrayData[i]);
				for (let k = 0; k < NUM_DIGITS; k++) {
					this.cmd('Delete', digits[k]);
				}
			}
			for (let i = 1; i < COUNTER_ARRAY_SIZE; i++) {
				this.cmd('SetHighlight', this.counterRects[i - 1], 1);
				this.cmd('SetHighlight', this.counterRects[i], 1);
				this.cmd('Step');
				this.counterData[i] = this.counterData[i] + this.counterData[i - 1];
				this.cmd('SetText', this.counterRects[i], this.counterData[i]);
				this.cmd('Step');
				this.cmd('SetHighlight', this.counterRects[i - 1], 0);
				this.cmd('SetHighlight', this.counterRects[i], 0);
			}
			//				for (i=ARRAY_SIZE - 1; i >= 0; i--)
			//				{
			//					this.cmd("SetAlpha", this.arrayRects[i], 1.0);
			//				}
			for (let i = ARRAY_SIZE - 1; i >= 0; i--) {
				this.cmd(
					'CreateHighlightCircle',
					animatedCircleID,
					'#0000FF',
					ARRAY_ELEM_START_X + i * ARRAY_ELEM_WIDTH,
					this.ARRAY_ELEM_Y
				);
				this.cmd(
					'CreateHighlightCircle',
					animatedCircleID2,
					'#0000FF',
					ARRAY_ELEM_START_X + i * ARRAY_ELEM_WIDTH,
					this.ARRAY_ELEM_Y
				);

				this.cmd('SetText', this.arrayRects[i], '');

				for (let k = 0; k < NUM_DIGITS; k++) {
					digits[k] = this.nextIndex++;
					const digitXPos =
						ARRAY_ELEM_START_X +
						i * ARRAY_ELEM_WIDTH -
						ARRAY_ELEM_WIDTH / 2 +
						(NUM_DIGITS - k) * (ARRAY_ELEM_WIDTH / NUM_DIGITS - 3);
					const digitYPos = this.ARRAY_ELEM_Y;
					this.cmd(
						'CreateLabel',
						digits[k],
						Math.floor(this.arrayData[i] / Math.pow(10, k)) % 10,
						digitXPos,
						digitYPos
					);
					if (k !== radix) {
						this.cmd('SetAlpha', digits[k], 0.2);
					}
				}

				const index = Math.floor(this.arrayData[i] / Math.pow(10, radix)) % 10;
				this.cmd(
					'Move',
					animatedCircleID2,
					COUNTER_ARRAY_ELEM_START_X + index * COUNTER_ARRAY_ELEM_WIDTH,
					this.COUNTER_ARRAY_ELEM_Y + COUNTER_ARRAY_ELEM_HEIGHT
				);
				this.cmd('Step');

				const insertIndex = --this.counterData[index];
				this.cmd('SetText', this.counterRects[index], this.counterData[index]);
				this.cmd('Step');

				this.cmd(
					'CreateHighlightCircle',
					animatedCircleID3,
					'#AAAAFF',
					COUNTER_ARRAY_ELEM_START_X + index * COUNTER_ARRAY_ELEM_WIDTH,
					this.COUNTER_ARRAY_ELEM_Y
				);
				this.cmd(
					'CreateHighlightCircle',
					animatedCircleID4,
					'#AAAAFF',
					COUNTER_ARRAY_ELEM_START_X + index * COUNTER_ARRAY_ELEM_WIDTH,
					this.COUNTER_ARRAY_ELEM_Y
				);

				this.cmd(
					'Move',
					animatedCircleID4,
					ARRAY_ELEM_START_X + insertIndex * ARRAY_ELEM_WIDTH,
					this.SWAP_ARRAY_ELEM_Y + COUNTER_ARRAY_ELEM_HEIGHT
				);
				this.cmd('Step');

				const moveLabel = this.nextIndex++;
				this.cmd('SetText', this.arrayRects[i], '');
				this.cmd(
					'CreateLabel',
					moveLabel,
					this.arrayData[i],
					ARRAY_ELEM_START_X + i * ARRAY_ELEM_WIDTH,
					this.ARRAY_ELEM_Y
				);
				this.cmd(
					'Move',
					moveLabel,
					ARRAY_ELEM_START_X + insertIndex * ARRAY_ELEM_WIDTH,
					this.SWAP_ARRAY_ELEM_Y
				);
				this.swapData[insertIndex] = this.arrayData[i];

				for (let k = 0; k < NUM_DIGITS; k++) {
					this.cmd('Delete', digits[k]);
				}
				this.cmd('Step');
				this.cmd('Delete', moveLabel);
				this.nextIndex--; // Reuse index from moveLabel, now that it has been removed.
				this.cmd('SetText', this.swapRects[insertIndex], this.swapData[insertIndex]);
				this.cmd('Delete', animatedCircleID);
				this.cmd('Delete', animatedCircleID2);
				this.cmd('Delete', animatedCircleID3);
				this.cmd('Delete', animatedCircleID4);
			}
			for (let i = 0; i < ARRAY_SIZE; i++) {
				this.cmd('SetText', this.arrayRects[i], '');
			}

			for (let i = 0; i < COUNTER_ARRAY_SIZE; i++) {
				this.cmd('SetAlpha', this.counterRects[i], 0.05);
				this.cmd('SetAlpha', this.counterIndices[i], 0.05);
			}

			this.cmd('Step');
			const startLab = this.nextIndex;
			for (let i = 0; i < ARRAY_SIZE; i++) {
				this.cmd(
					'CreateLabel',
					startLab + i,
					this.swapData[i],
					ARRAY_ELEM_START_X + i * ARRAY_ELEM_WIDTH,
					this.SWAP_ARRAY_ELEM_Y
				);
				this.cmd(
					'Move',
					startLab + i,
					ARRAY_ELEM_START_X + i * ARRAY_ELEM_WIDTH,
					this.ARRAY_ELEM_Y
				);
				this.cmd('SetText', this.swapRects[i], '');
			}
			this.cmd('Step');
			for (let i = 0; i < ARRAY_SIZE; i++) {
				this.arrayData[i] = this.swapData[i];
				this.cmd('SetText', this.arrayRects[i], this.arrayData[i]);
				this.cmd('Delete', startLab + i);
			}
			for (let i = 0; i < COUNTER_ARRAY_SIZE; i++) {
				this.cmd('SetAlpha', this.counterRects[i], 1);
				this.cmd('SetAlpha', this.counterIndices[i], 1);
			}
		}
		this.animationManager.StartNewAnimation(this.commands);
	}

	randomizeArray() {
		this.commands = [];
		for (let i = 0; i < ARRAY_SIZE; i++) {
			this.arrayData[i] = Math.floor(1 + Math.random() * MAX_DATA_VALUE);
			this.cmd('SetText', this.arrayRects[i], this.arrayData[i]);
		}

		for (let i = 0; i < COUNTER_ARRAY_SIZE; i++) {
			this.cmd('SetText', this.counterRects[i], '');
		}

		this.animationManager.StartNewAnimation(this.commands);
		this.animationManager.skipForward();
		this.animationManager.clearHistory();
	}

	// We want to (mostly) ignore resets, since we are disallowing undoing
	reset() {
		this.commands = [];
	}

	resetCallback() {
		this.randomizeArray();
	}

	disableUI() {
		this.resetButton.disabled = true;
		this.radixSortButton.disabled = true;
	}

	enableUI() {
		this.resetButton.disabled = false;
		this.radixSortButton.disabled = false;
	}
}
