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

const MAX_ARRAY_SIZE = 15;

const INFO_MSG_X = 20;
const INFO_MSG_Y = 150;
const CODE_START_X = 25;
const CODE_START_Y = 35;
const CODE_LINE_HEIGHT = 14;
const CODE_HIGHLIGHT_COLOR = '#FF0000';
const CODE_STANDARD_COLOR = '#000000';

const ARRAY_ELEM_WIDTH = 50;
const ARRAY_ELEM_HEIGHT = 50;
const ARRAY_INITIAL_X = 400;
const ARRAY_INITIAL_Y = 50;

const HEAP_ARRAY_ELEM_WIDTH = 40;
const HEAP_ARRAY_ELEM_HEIGHT = 30;
const HEAP_INITIAL_X = 400;
const HEAP_INITIAL_Y = 150;
const HEAP_LABEL_Y_POS = 180;

const HEAP_X_POSITIONS = [
	0,
	450,
	250,
	650,
	150,
	350,
	550,
	750,
	100,
	200,
	300,
	400,
	500,
	600,
	700,
	800,
	75,
	125,
	175,
	225,
	275,
	325,
	375,
	425,
	475,
	525,
	575,
	625,
	675,
	725,
	775,
	825,
];

const HEAP_Y_POSITIONS = [
	0,
	250,
	320,
	320,
	390,
	390,
	390,
	390,
	460,
	460,
	460,
	460,
	460,
	460,
	460,
	460,
	530,
	530,
	530,
	530,
	530,
	530,
	530,
	530,
	530,
	530,
	530,
	530,
	530,
	530,
	530,
	530,
];

export default class HeapSort extends Algorithm {
    constructor(am, w, h) {
        super(am, w, h);
        this.addControls();
        this.nextIndex = 0;
        this.setup();
    }

    addControls() {
        this.controls = [];

		const verticalGroup = addGroupToAlgorithmBar(false);

        addLabelToAlgorithmBar(
			'Comma seperated list (e.g. "3,1,2"). Max 15 elements & no elements > 999',
			verticalGroup
		);

		const horizontalGroup = addGroupToAlgorithmBar(true, verticalGroup);

        // List text field
		this.listField = addControlToAlgorithmBar('Text', '', horizontalGroup);
		this.listField.onkeydown = this.returnSubmit(
			this.listField,
			this.sortCallback.bind(this),
			60,
			false,
		);
		this.controls.push(this.listField);

		// Sort button
		this.sortButton = addControlToAlgorithmBar('Button', 'Sort', horizontalGroup);
		this.sortButton.onclick = this.sortCallback.bind(this);
		this.controls.push(this.sortButton);

		addDivisorToAlgorithmBar();

		// Clear button
		this.clearButton = addControlToAlgorithmBar('Button', 'Clear');
		this.clearButton.onclick = this.clearCallback.bind(this);
		this.controls.push(this.clearButton);
    }

    setup() {
        this.commands = [];

        this.arrayData = [];
        this.arrayID = [];
        this.heapArrayData = [];
        this.heapArrayID = [];
        this.heapArrayLabelID = [];
        this.heapTreeObj = [];

        this.infoLabelID = this.nextIndex++;

        this.infoLabelID = this.nextIndex++;
		this.cmd(act.createLabel, this.infoLabelID, '', INFO_MSG_X, INFO_MSG_Y, 0);

		this.code = [
			['procedure heapSort(array)'],
			['     heap <- create new PriorityQueue(array)'],
			['     for i <- 0, array.length - 1, loop:'],
			['          add ', 'heap.remove()', ' to data[i]'],
			['     end for'],
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
    }

    sort(list) {
        this.commands = [];

		this.highlight(0, 0);

        this.arrayData = list
			.map(Number)
			.filter(x => !Number.isNaN(x))
			.slice(0, MAX_ARRAY_SIZE);
        const length = this.arrayData.length;
		const displayDataTemp = new Array(length);
		const elemCounts = new Map();
		const letterMap = new Map();

		for (let i = 0; i < length; i++) {
			const count = elemCounts.has(this.arrayData[i]) ? elemCounts.get(this.arrayData[i]) : 0;
			if (count > 0) {
				letterMap.set(this.arrayData[i], 'a');
			}
			elemCounts.set(this.arrayData[i], count + 1);
		}

        for (let i = 0; i < length; i++) {
			this.arrayID[i] = this.nextIndex++;
			const xpos = i * ARRAY_ELEM_WIDTH + ARRAY_INITIAL_X;
			const ypos = ARRAY_INITIAL_Y;

			let displayData = this.arrayData[i].toString();
			if (letterMap.has(this.arrayData[i])) {
				const currChar = letterMap.get(this.arrayData[i]);
				displayData += currChar;
				letterMap.set(this.arrayData[i], String.fromCharCode(currChar.charCodeAt(0) + 1));
			}
			displayDataTemp[i] = displayData;
			this.cmd(
				act.createRectangle,
				this.arrayID[i],
				displayData,
				ARRAY_ELEM_WIDTH,
				ARRAY_ELEM_HEIGHT,
				xpos,
				ypos,
			);
		}
        this.arrayData = displayDataTemp;
        this.cmd(act.step);
		this.unhighlight(0, 0);

        //Create a new heap
		this.highlight(1, 0);
        this.createHeap(this.arrayData);
        this.cmd(act.step);

		this.cmd(act.setText, this.infoLabelID, 'Buildheap the new array');
        //Buildheap the new heap
		let nextElem = Math.floor(this.currentHeapSize / 2);
		while (nextElem > 0) {
			this.pushDown(nextElem);
			nextElem = nextElem - 1;
		}
        this.cmd(act.step);

		this.unhighlight(1, 0);
		this.cmd(act.setText, this.infoLabelID, '');
		

        //Remove all of the elements from the heap
        while (this.currentHeapSize > 0) {
			this.highlight(2, 0);
			this.cmd(act.step);
			this.unhighlight(2, 0);
            this.remove();
		}

		this.highlight(4, 0);
		this.cmd(act.setText, this.infoLabelID, '');
		this.cmd(act.step);

        for (let i = 0; i < length + 1; i++) {
            this.cmd(act.delete, this.heapArrayID[i]);
            this.cmd(act.delete, this.heapArrayLabelID[i]);
        }
		this.unhighlight(4, 0);
		this.highlight(5, 0);
		this.cmd(act.step);
	
		this.unhighlight(5, 0);

        return this.commands;
    }

    createHeap(arrayData) {
        const length = arrayData.length + 1;

		this.cmd(act.setText, this.infoLabelID, 'Array-backed heap created');

        this.heapArrayXPositions = new Array(length);
        this.heapArrayData = arrayData.slice();
        this.heapArrayData.unshift(null);
        this.currentHeapSize = length - 1;

        for (let i = 0; i < length; i++) {
            //Create heap array
			this.heapArrayXPositions[i] = HEAP_INITIAL_X + i * HEAP_ARRAY_ELEM_WIDTH;
			this.heapArrayID[i] = this.nextIndex++;
            this.heapArrayLabelID[i] = this.nextIndex++;
			this.heapTreeObj[i] = this.nextIndex++;
			this.cmd(
				act.createRectangle,
				this.heapArrayID[i],
				this.heapArrayData[i],
				HEAP_ARRAY_ELEM_WIDTH,
				HEAP_ARRAY_ELEM_HEIGHT,
				this.heapArrayXPositions[i],
				HEAP_INITIAL_Y,
			);
			this.cmd(
				act.createLabel,
				this.heapArrayLabelID[i],
				i,
				this.heapArrayXPositions[i],
                HEAP_LABEL_Y_POS,
			);
			this.cmd(act.setForegroundColor, this.heapArrayLabelID[i], '#0000FF');

            //Create heap tree
            if (i > 0) {
                this.cmd(
                    act.createCircle,
                    this.heapTreeObj[i],
                    this.heapArrayData[i],
                    HEAP_X_POSITIONS[i],
                    HEAP_Y_POSITIONS[i],
                );
                this.cmd(act.setText, this.heapArrayID[i], this.heapArrayData[i]);
                if (i > 1) {
                    this.cmd(act.connect, this.heapTreeObj[Math.floor(i / 2)], this.heapTreeObj[i]);
                }
            }
		}

        return this.commands;
    }

	remove() {
        const index = this.arrayData.length - this.currentHeapSize;
        const remData = this.heapArrayData[1];
        const removedElementID = this.nextIndex; //no ++ since 'removedElementID' is deleted before any other elements are created

		this.cmd(act.setText, this.infoLabelID, '');

		this.highlight(3, 0);
		this.highlight(3, 1);
		this.highlight(3, 2);

		this.cmd(act.setText, this.heapArrayID[1], '');

        this.cmd(
			act.createLabel,
			removedElementID,
			remData,
			HEAP_X_POSITIONS[1],
			HEAP_Y_POSITIONS[1],
			0,
		);
        this.cmd(act.setText, this.heapTreeObj[1], '');
		this.cmd(act.setText, this.arrayID[index], '');
        this.cmd(
            act.move,
            removedElementID,
            index * ARRAY_ELEM_WIDTH + ARRAY_INITIAL_X - 5,
            ARRAY_INITIAL_Y - 5
        );
        this.cmd(act.step);

		this.arrayData[index] = remData;
        this.cmd(act.setText, this.arrayID[index], remData);
        this.cmd(act.delete, removedElementID);
		this.cmd(act.step);

		this.heapArrayData[1] = '';
		
		this.unhighlight(3, 0);
		this.unhighlight(3, 2);
		this.cmd(act.setText, this.infoLabelID, 'Downheap to maintain order');

		if (this.currentHeapSize > 1) {
			this.cmd(act.setHighlight, this.heapArrayID[1], 1);
			this.cmd(act.setHighlight, this.heapArrayID[this.currentHeapSize], 1);
			this.cmd(act.setHighlight, this.heapTreeObj[1], 1);
			this.cmd(act.setHighlight, this.heapTreeObj[this.currentHeapSize], 1);
			this.cmd(act.step);
			
			this.cmd(act.setHighlight, this.heapArrayID[1], 0);
			this.cmd(act.setHighlight, this.heapArrayID[this.currentHeapSize], 0);
			this.cmd(act.setHighlight, this.heapTreeObj[1], 0);
			this.cmd(act.setHighlight, this.heapTreeObj[this.currentHeapSize], 0);
			this.swap(1, this.currentHeapSize);
			
			this.cmd(act.delete, this.heapTreeObj[this.currentHeapSize]);
			this.cmd(act.step);

			this.currentHeapSize--;
            if (this.currentHeapSize > 0) { this.pushDown(1); }
		} else {
			this.cmd(act.setText, this.heapArrayID[1], '');
			this.cmd(act.delete, this.heapTreeObj[this.currentHeapSize]);
			this.cmd(act.step);
			this.currentHeapSize--;
		}
		this.unhighlight(3, 1);
		this.cmd(act.step);

		return this.commands;
	}

    pushDown(index) {
		let childIndex; // Used to keep track of smallest (in MinHeap) or largest (in MaxHeap) child

		while (index * 2 <= this.currentHeapSize) {
			childIndex = 2 * index;

			if (index * 2 + 1 <= this.currentHeapSize) {
				this.setIndexHighlight(2 * index, 1);
				this.setIndexHighlight(2 * index + 1, 1);
				this.cmd(act.step);
				this.setIndexHighlight(2 * index, 0);
				this.setIndexHighlight(2 * index + 1, 0);
				if (this.downheapCheckRightChild(index)) {
					childIndex = 2 * index + 1;
				}
			}

			this.setIndexHighlight(index, 1);
			this.setIndexHighlight(childIndex, 1);
			this.cmd(act.step);
			this.setIndexHighlight(index, 0);
			this.setIndexHighlight(childIndex, 0);

			if (this.downheapCompare(childIndex, index)) {
				this.swap(childIndex, index);
				index = childIndex;
			} else {
				return;
			}
		}
	}

	downheapCheckRightChild(index) {
		// Checks if the right child is smaller than left child
		return this.compareWithLetters(this.heapArrayData[2 * index + 1], this.heapArrayData[2 * index]);
	}

	downheapCompare(childIndex, index) {
		// Checks if smallest child is smaller than parent
		return this.compareWithLetters(this.heapArrayData[childIndex], this.heapArrayData[index]);
	}

	compareWithLetters(num1, num2) {
		return parseInt(num1) < parseInt(num2);
	}

    swap(index1, index2) {
        const swapLabel1 = this.nextIndex++;
        const swapLabel2 = this.nextIndex++;
        const swapLabel3 = this.nextIndex++;
        const swapLabel4 = this.nextIndex++;
		this.cmd(act.setText, this.heapArrayID[index1], '');
		this.cmd(act.setText, this.heapArrayID[index2], '');
		this.cmd(act.setText, this.heapTreeObj[index1], '');
		this.cmd(act.setText, this.heapTreeObj[index2], '');
		this.cmd(
			act.createLabel,
			swapLabel1,
			this.heapArrayData[index1],
			this.heapArrayXPositions[index1],
			HEAP_INITIAL_Y,
		);
		this.cmd(
			act.createLabel,
			swapLabel2,
			this.heapArrayData[index2],
			this.heapArrayXPositions[index2],
			HEAP_INITIAL_Y,
		);
		this.cmd(
			act.createLabel,
			swapLabel3,
			this.heapArrayData[index1],
			HEAP_X_POSITIONS[index1],
			HEAP_Y_POSITIONS[index1],
		);
		this.cmd(
			act.createLabel,
			swapLabel4,
			this.heapArrayData[index2],
			HEAP_X_POSITIONS[index2],
			HEAP_Y_POSITIONS[index2],
		);
		this.cmd(act.move, swapLabel1, this.heapArrayXPositions[index2], HEAP_INITIAL_Y);
		this.cmd(act.move, swapLabel2, this.heapArrayXPositions[index1], HEAP_INITIAL_Y);
		this.cmd(act.move, swapLabel3, HEAP_X_POSITIONS[index2], HEAP_Y_POSITIONS[index2]);
		this.cmd(act.move, swapLabel4, HEAP_X_POSITIONS[index1], HEAP_Y_POSITIONS[index1]);
		const tmp = this.heapArrayData[index1];
		this.heapArrayData[index1] = this.heapArrayData[index2];
		this.heapArrayData[index2] = tmp;
		this.cmd(act.step);
		this.cmd(act.setText, this.heapArrayID[index1], this.heapArrayData[index1]);
		this.cmd(act.setText, this.heapArrayID[index2], this.heapArrayData[index2]);
		this.cmd(act.setText, this.heapTreeObj[index1], this.heapArrayData[index1]);
		this.cmd(act.setText, this.heapTreeObj[index2], this.heapArrayData[index2]);
		this.cmd(act.delete, swapLabel1);
		this.cmd(act.delete, swapLabel2);
		this.cmd(act.delete, swapLabel3);
		this.cmd(act.delete, swapLabel4);
        this.nextIndex -= 4;
	}

    setIndexHighlight(index, highlightVal) {
		this.cmd(act.setHighlight, this.heapTreeObj[index], highlightVal);
		this.cmd(act.setHighlight, this.heapArrayID[index], highlightVal);
	}

    clear() {
        this.commands = [];

        for (let i = 0; i < this.arrayID.length; i++) {
			this.cmd(act.delete, this.arrayID[i]);
		}

        this.arrayData = [];
        this.arrayID = [];
        this.heapArrayData = [];
        this.heapArrayID = [];
        this.heapArrayLabelID = [];

        return this.commands;
    }

    reset() {
        this.currentHeapSize = 0;
    }

    sortCallback() {
		const list = this.listField.value.split(',').filter(x => x !== '');
        if (
			this.listField.value !== ''
			&& list.length <= MAX_ARRAY_SIZE
			&& list.map(Number).filter(x => x > 999 || Number.isNaN(x)).length <= 0
			) {
            this.implementAction(this.clear.bind(this));
            this.listField.value = '';
            this.implementAction(this.sort.bind(this), list);
        }
    }

    clearCallback() {
        this.implementAction(this.clear.bind(this));
    }

	highlight(ind1, ind2) {
		this.cmd(act.setForegroundColor, this.codeID[ind1][ind2], CODE_HIGHLIGHT_COLOR);
	}

	unhighlight(ind1, ind2) {
		this.cmd(act.setForegroundColor, this.codeID[ind1][ind2], CODE_STANDARD_COLOR);
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