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

import Algorithm, { addControlToAlgorithmBar } from "./Algorithm.js";

const LINKED_LIST_START_X = 100;
const LINKED_LIST_START_Y = 200;
const LINKED_LIST_ELEM_WIDTH = 70;
const LINKED_LIST_ELEM_HEIGHT = 30;

const LINKED_LIST_INSERT_X = 250;
const LINKED_LIST_INSERT_Y = 50;

const LINKED_LIST_ELEMS_PER_LINE = 8;
const LINKED_LIST_ELEM_SPACING = 100;
const LINKED_LIST_LINE_SPACING = 100;

const TOP_POS_X = 180;
const TOP_POS_Y = 100;
const TOP_LABEL_X = 130;
const TOP_LABEL_Y = 100;

const TOP_ELEM_WIDTH = 30;
const TOP_ELEM_HEIGHT = 30;

const PUSH_LABEL_X = 50;
const PUSH_LABEL_Y = 30;
const PUSH_ELEMENT_X = 120;
const PUSH_ELEMENT_Y = 30;

const SIZE = 32;

class StackLL extends Algorithm {
	constructor(am, w, h) {
		super(am, w, h);

		this.addControls();
		this.nextIndex = 0;
		this.commands = [];
		this.setup();
		this.initialIndex = this.nextIndex;
	}

	addControls() {
		this.controls = [];
		this.pushField = addControlToAlgorithmBar("Text", "");
		this.pushField.onkeydown = this.returnSubmit(
			this.pushField,
			this.pushCallback.bind(this),
			6
		);
		this.pushButton = addControlToAlgorithmBar("Button", "Push");
		this.pushButton.onclick = this.pushCallback.bind(this);
		this.controls.push(this.pushField);
		this.controls.push(this.pushButton);

		this.popButton = addControlToAlgorithmBar("Button", "Pop");
		this.popButton.onclick = this.popCallback.bind(this);
		this.controls.push(this.popButton);

		this.clearButton = addControlToAlgorithmBar("Button", "Clear Stack");
		this.clearButton.onclick = this.clearCallback.bind(this);
		this.controls.push(this.clearButton);
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

	setup() {
		this.linkedListElemID = new Array(SIZE);
		for (let i = 0; i < SIZE; i++) {
			this.linkedListElemID[i] = this.nextIndex++;
		}
		this.topID = this.nextIndex++;
		this.topLabelID = this.nextIndex++;

		this.arrayData = new Array(SIZE);
		this.top = 0;
		this.leftoverLabelID = this.nextIndex++;

		this.cmd("CreateLabel", this.topLabelID, "Top", TOP_LABEL_X, TOP_LABEL_Y);
		this.cmd(
			"CreateRectangle",
			this.topID,
			"",
			TOP_ELEM_WIDTH,
			TOP_ELEM_HEIGHT,
			TOP_POS_X,
			TOP_POS_Y
		);
		this.cmd("SetNull", this.topID, 1);

		this.cmd("CreateLabel", this.leftoverLabelID, "", PUSH_LABEL_X, PUSH_LABEL_Y);

		this.animationManager.StartNewAnimation(this.commands);
		this.animationManager.skipForward();
		this.animationManager.clearHistory();
	}

	resetLinkedListPositions() {
		for (let i = this.top - 1; i >= 0; i--) {
			const nextX =
				((this.top - 1 - i) % LINKED_LIST_ELEMS_PER_LINE) * LINKED_LIST_ELEM_SPACING +
				LINKED_LIST_START_X;
			const nextY =
				Math.floor((this.top - 1 - i) / LINKED_LIST_ELEMS_PER_LINE) *
					LINKED_LIST_LINE_SPACING +
				LINKED_LIST_START_Y;
			this.cmd("Move", this.linkedListElemID[i], nextX, nextY);
		}
	}

	reset() {
		this.top = 0;
		this.nextIndex = this.initialIndex;
	}

	pushCallback() {
		if (this.top < SIZE && this.pushField.value != "") {
			const pushVal = this.pushField.value;
			this.pushField.value = "";
			this.implementAction(this.push.bind(this), pushVal);
		}
	}

	popCallback() {
		if (this.top > 0) {
			this.implementAction(this.pop.bind(this), "");
		}
	}

	clearCallback() {
		this.implementAction(this.clearAll.bind(this), "");
	}

	push(elemToPush) {
		this.commands = new Array();

		const labPushID = this.nextIndex++;
		const labPushValID = this.nextIndex++;
		this.arrayData[this.top] = elemToPush;

		this.cmd("SetText", this.leftoverLabelID, "");

		this.cmd(
			"CreateLinkedList",
			this.linkedListElemID[this.top],
			"",
			LINKED_LIST_ELEM_WIDTH,
			LINKED_LIST_ELEM_HEIGHT,
			LINKED_LIST_INSERT_X,
			LINKED_LIST_INSERT_Y,
			0.25,
			0,
			1,
			1
		);

		this.cmd("CreateLabel", labPushID, "Pushing Value: ", PUSH_LABEL_X, PUSH_LABEL_Y);
		this.cmd("CreateLabel", labPushValID, elemToPush, PUSH_ELEMENT_X, PUSH_ELEMENT_Y);

		this.cmd("Step");

		this.cmd("Move", labPushValID, LINKED_LIST_INSERT_X, LINKED_LIST_INSERT_Y);

		this.cmd("Step");
		this.cmd("SetText", this.linkedListElemID[this.top], elemToPush);
		this.cmd("Delete", labPushValID);

		if (this.top == 0) {
			this.cmd("SetNull", this.topID, 0);
			this.cmd("SetNull", this.linkedListElemID[this.top], 1);
		} else {
			this.cmd(
				"Connect",
				this.linkedListElemID[this.top],
				this.linkedListElemID[this.top - 1]
			);
			this.cmd("Step");
			this.cmd("Disconnect", this.topID, this.linkedListElemID[this.top - 1]);
		}
		this.cmd("Connect", this.topID, this.linkedListElemID[this.top]);

		this.cmd("Step");
		this.top = this.top + 1;
		this.resetLinkedListPositions();
		this.cmd("Delete", labPushID);
		this.cmd("Step");

		return this.commands;
	}

	pop() {
		this.commands = new Array();

		const labPopID = this.nextIndex++;
		const labPopValID = this.nextIndex++;

		this.cmd("SetText", this.leftoverLabelID, "");

		this.cmd("CreateLabel", labPopID, "Popped Value: ", PUSH_LABEL_X, PUSH_LABEL_Y);
		this.cmd(
			"CreateLabel",
			labPopValID,
			this.arrayData[this.top - 1],
			LINKED_LIST_START_X,
			LINKED_LIST_START_Y
		);

		this.cmd("Move", labPopValID, PUSH_ELEMENT_X, PUSH_ELEMENT_Y);
		this.cmd("Step");
		this.cmd("Disconnect", this.topID, this.linkedListElemID[this.top - 1]);

		if (this.top == 1) {
			this.cmd("SetNull", this.topID, 1);
		} else {
			this.cmd("Connect", this.topID, this.linkedListElemID[this.top - 2]);
		}
		this.cmd("Step");
		this.cmd("Delete", this.linkedListElemID[this.top - 1]);
		this.top = this.top - 1;
		this.resetLinkedListPositions();

		this.cmd("Delete", labPopValID);
		this.cmd("Delete", labPopID);
		this.cmd("SetText", this.leftoverLabelID, "Popped Value: " + this.arrayData[this.top]);

		return this.commands;
	}

	clearAll() {
		this.commands = new Array();
		for (let i = 0; i < this.top; i++) {
			this.cmd("Delete", this.linkedListElemID[i]);
		}
		this.top = 0;
		this.cmd("SetNull", this.topID, 1);
		return this.commands;
	}
}

function init() {
	// eslint-disable-next-line no-undef
	const animManag = initCanvas();
	// eslint-disable-next-line no-undef, no-unused-vars
	const currentAlg = new StackLL(animManag, canvas.width, canvas.height);
}

window.onload = init;
