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

const ARRAY_START_X = 100;
const ARRAY_START_Y = 200;
const ARRAY_ELEM_WIDTH = 50;
const ARRAY_ELEM_HEIGHT = 50;

// const ARRRAY_ELEMS_PER_LINE = 15;
// const ARRAY_LINE_SPACING = 130;

// const TOP_POS_X = 180;
// const TOP_POS_Y = 100;
// const TOP_LABEL_X = 130;
// const TOP_LABEL_Y = 100;

// const PUSH_LABEL_X = 50;
// const PUSH_LABEL_Y = 30;
// const PUSH_ELEMENT_X = 120;
// const PUSH_ELEMENT_Y = 30;

// const SIZE = 10;

export default class InsertionSort extends Algorithm {
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

		addLabelToAlgorithmBar('Comma seperated list (e.g. "3,1,2", max 18 elements)');

		// List text field
		this.listField = addControlToAlgorithmBar('Text', '');
		this.listField.onkeydown = this.returnSubmit(
			this.listField,
			this.sortCallback.bind(this),
			60,
			false
		);
		this.controls.push(this.listField);

		// Sort button
		this.findButton = addControlToAlgorithmBar('Button', 'Sort');
		this.findButton.onclick = this.sortCallback.bind(this);
		this.controls.push(this.findButton);

		// Clear button
		this.clearButton = addControlToAlgorithmBar('Button', 'Clear');
		this.clearButton.onclick = this.clearCallback.bind(this);
		this.controls.push(this.clearButton);
	}

	setup() {
		this.arrayData = [];
		this.arrayID = [];
		this.displayData = [];
		this.iPointerID = this.nextIndex++;
		this.jPointerID = this.nextIndex++;
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

	sortCallback() {
		if (this.listField.value !== '') {
			this.implementAction(this.clear.bind(this), '');
			const list = this.listField.value;
			this.listField.value = '';
			this.implementAction(this.sort.bind(this), list);
		}
	}

	clearCallback() {
		this.implementAction(this.clear.bind(this), '');
	}

	clear() {
		this.commands = [];
		for (let i = 0; i < this.arrayID.length; i++) {
			this.cmd('Delete', this.arrayID[i]);
		}
		this.arrayData = [];
		this.arrayID = [];
		this.displayData = [];
		return this.commands;
	}

	sort(params) {
		this.commands = [];

		this.arrayID = [];
		this.arrayData = params
			.split(',')
			.map(Number)
			.filter(x => x)
			.slice(0, 18);
		this.displayData = new Array(this.arrayData.length);
		const length = this.arrayData.length;
		const elemCounts = new Map();
		const letterMap = new Map();

		for (let i = 0; i < length; i++) {
			const count = elemCounts.has(this.arrayData[i]) ? elemCounts.get(this.arrayData[i]) : 0;
			if (count > 0) {
				letterMap.set(this.arrayData[i], 'A');
			}
			elemCounts.set(this.arrayData[i], count + 1);
		}

		for (let i = 0; i < length; i++) {
			this.arrayID[i] = this.nextIndex++;
			const xpos = i * ARRAY_ELEM_WIDTH + ARRAY_START_X;
			const ypos = ARRAY_START_Y;

			let displayData = this.arrayData[i].toString();
			if (letterMap.has(this.arrayData[i])) {
				const currChar = letterMap.get(this.arrayData[i]);
				displayData += currChar;
				letterMap.set(this.arrayData[i], String.fromCharCode(currChar.charCodeAt(0) + 1));
			}
			this.displayData[i] = displayData;
			this.cmd(
				'CreateRectangle',
				this.arrayID[i],
				displayData,
				ARRAY_ELEM_WIDTH,
				ARRAY_ELEM_HEIGHT,
				xpos,
				ypos
			);
		}
		this.cmd('CreateHighlightCircle', this.iPointerID, '#0000FF', ARRAY_START_X, ARRAY_START_Y);
		this.cmd('SetHighlight', this.iPointerID, 1);
		this.cmd(
			'CreateHighlightCircle',
			this.jPointerID,
			'#0000FF',
			ARRAY_START_X + ARRAY_ELEM_WIDTH,
			ARRAY_START_Y
		);
		this.cmd('SetHighlight', this.jPointerID, 1);
		this.cmd('Step');

		for (let i = 1; i < this.arrayData.length; i++) {
			for (let j = i; j >= 1; j--) {
				this.movePointers(j - 1, j);
				if (this.arrayData[j] < this.arrayData[j - 1]) {
					this.swap(j, j - 1);
				} else {
					break;
				}
			}
			if (i === 1) this.cmd('SetBackgroundColor', this.arrayID[0], '#2ECC71');
			this.cmd('SetBackgroundColor', this.arrayID[i], '#2ECC71');
			this.cmd('Step');
		}

		this.cmd('Delete', this.iPointerID);
		this.cmd('Delete', this.jPointerID);
		this.cmd('Step');

		return this.commands;
	}

	movePointers(i, j) {
		const iXPos = i * ARRAY_ELEM_WIDTH + ARRAY_START_X;
		const iYPos = ARRAY_START_Y;
		this.cmd('Move', this.iPointerID, iXPos, iYPos);
		const jXPos = j * ARRAY_ELEM_WIDTH + ARRAY_START_X;
		const jYPos = ARRAY_START_Y;
		this.cmd('Move', this.jPointerID, jXPos, jYPos);
		this.cmd('Step');
	}

	swap(i, j) {
		this.cmd('SetForegroundColor', this.iPointerID, '#FF0000');
		this.cmd('SetForegroundColor', this.jPointerID, '#FF0000');
		const iLabelID = this.nextIndex++;
		const iXPos = i * ARRAY_ELEM_WIDTH + ARRAY_START_X;
		const iYPos = ARRAY_START_Y;
		this.cmd('CreateLabel', iLabelID, this.displayData[i], iXPos, iYPos);
		const jLabelID = this.nextIndex++;
		const jXPos = j * ARRAY_ELEM_WIDTH + ARRAY_START_X;
		const jYPos = ARRAY_START_Y;
		this.cmd('CreateLabel', jLabelID, this.displayData[j], jXPos, jYPos);
		this.cmd('Settext', this.arrayID[i], '');
		this.cmd('Settext', this.arrayID[j], '');
		this.cmd('Move', iLabelID, jXPos, jYPos);
		this.cmd('Move', jLabelID, iXPos, iYPos);
		this.cmd('Step');
		this.cmd('Settext', this.arrayID[i], this.displayData[j]);
		this.cmd('Settext', this.arrayID[j], this.displayData[i]);
		this.cmd('Delete', iLabelID);
		this.cmd('Delete', jLabelID);

		// Swap data in backend array
		let temp = this.arrayData[i];
		this.arrayData[i] = this.arrayData[j];
		this.arrayData[j] = temp;

		// Swap data in display array
		temp = this.displayData[i];
		this.displayData[i] = this.displayData[j];
		this.displayData[j] = temp;

		this.cmd('SetForegroundColor', this.iPointerID, '#0000FF');
		this.cmd('SetForegroundColor', this.jPointerID, '#0000FF');
		this.cmd('Step');
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
