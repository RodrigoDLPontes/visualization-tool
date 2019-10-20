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

var ARRAY_START_X = 120;
var ARRAY_START_Y = 50;
var ARRAY_LINE_SPACING = 80;
var ARRAY_ELEM_WIDTH = 50;
var ARRAY_ELEM_HEIGHT = 50;

var ARRRAY_ELEMS_PER_LINE = 15;

var TOP_POS_X = 180;
var TOP_POS_Y = 100;
var TOP_LABEL_X = 130;
var TOP_LABEL_Y =  100;

var PUSH_LABEL_X = 50;
var PUSH_LABEL_Y = 30;
var PUSH_ELEMENT_X = 120;
var PUSH_ELEMENT_Y = 30;

var SIZE = 10;

var LARGE_OFFSET = 15;
var SMALL_OFFSET = 7;

function MergeSort(am, w, h)
{
    this.init(am, w, h);
}

MergeSort.prototype = new Algorithm();
MergeSort.prototype.constructor = MergeSort;
MergeSort.superclass = Algorithm.prototype;

MergeSort.prototype.init = function(am, w, h)
{
    // Call the unit function of our "superclass", which adds a couple of
    // listeners, and sets up the undo stack
    MergeSort.superclass.init.call(this, am, w, h);

    this.addControls();

    // Useful for memory management
    this.nextIndex = 0;

    // TODO:  Add any code necessary to set up your own algorithm.  Initialize data
    // structures, etc.
    this.setup();
}

MergeSort.prototype.addControls =  function()
{
    this.controls = [];

    addLabelToAlgorithmBar("Comma separated list (e.g. \"3,1,2\")")

    // List text field
    this.listField = addControlToAlgorithmBar("Text", "");
    this.listField.onkeydown = this.returnSubmit(this.listField, this.sortCallback.bind(this), 80, false);
    this.controls.push(this.listField);

    // Sort button
    this.findButton = addControlToAlgorithmBar("Button", "Sort");
    this.findButton.onclick = this.sortCallback.bind(this);
    this.controls.push(this.findButton);

    // Clear button
    this.clearButton = addControlToAlgorithmBar("Button", "Clear");
    this.clearButton.onclick = this.clearCallback.bind(this);
    this.controls.push(this.clearButton);
}

MergeSort.prototype.setup = function()
{
    this.arrayData = new Array();
    this.arrayID = new Array();
    this.iPointerID = 0;
    this.jPointerID = 0;
    this.kPointerID = 0;
}

MergeSort.prototype.reset = function()
{
    // Reset all of your data structures to *exactly* the state they have immediately after the init
    // function is called.  This method is called whenever an "undo" is performed.  Your data
    // structures are completely cleaned, and then all of the actions *up to but not including* the
    // last action are then redone.  If you implement all of your actions through the "implementAction"
    // method below, then all of this work is done for you in the Animation "superclass"

    // Reset the (very simple) memory manager
    this.nextIndex = 0;
}

MergeSort.prototype.sortCallback = function(event)
{
    if (this.listField.value != "")
    {
        this.implementAction(this.clear.bind(this), "");
        var list = this.listField.value;
        this.listField.value = "";
        this.implementAction(this.sort.bind(this), list);
    }
}

MergeSort.prototype.clearCallback = function(event)
{
    this.implementAction(this.clear.bind(this), "");
}

MergeSort.prototype.clear = function()
{
    this.commands = new Array();
    for(var i = 0; i < this.arrayID.length; i++) {
        this.cmd("Delete", this.arrayID[i]);
    }
    this.arrayData = new Array();
    this.arrayID = new Array();
    return this.commands;
}


MergeSort.prototype.sort = function(params)
{
    this.commands = new Array();

    this.arrayID = new Array();
    this.arrayData = params.split(",");

    for (var i = 0; i < this.arrayData.length; i++)
    {
        this.arrayData[i] = parseInt(this.arrayData[i]);
        var xPos = i * ARRAY_ELEM_WIDTH + ARRAY_START_X;
        var yPos = ARRAY_START_Y;
        this.arrayID.push(this.nextIndex);
        this.cmd("CreateRectangle", this.nextIndex++, this.arrayData[i], ARRAY_ELEM_WIDTH, ARRAY_ELEM_HEIGHT, xPos, yPos);
    }
    this.cmd("Step");

    if(this.arrayData.length != 1) {
        var mid = Math.ceil((this.arrayData.length - 1) / 2);
        this.leftHelper(0, mid - 1, -LARGE_OFFSET, 0, 1);
        this.rightHelper(mid, this.arrayData.length - 1, LARGE_OFFSET, 0, 1);
        this.merge(0, this.arrayData.length - 1, mid, 0, 0, -LARGE_OFFSET, LARGE_OFFSET, this.arrayID);
    } else {
        this.cmd("SetBackgroundColor", this.arrayID[0], "#2ECC71");
        this.cmd("Step");
    }

    return this.commands;
}

MergeSort.prototype.leftHelper = function(left, right, offset, prevOffset, row)
{
    if(left > right) return;

    var tempArrayID = this.drawArrayAndCopy(left, right, offset, prevOffset, row);

    if(left != right) {
        var mid = Math.ceil((left + right) / 2);
        var extraOffset = row < 2 ? 2 * LARGE_OFFSET : 2 * SMALL_OFFSET;
        this.leftHelper(left, mid - 1, offset - extraOffset, offset, row + 1);
        this.leftHelper(mid, right, offset, offset, row + 1);
        this.merge(left, right, mid, row, offset, offset - extraOffset, offset, tempArrayID);
    } else {
        this.cmd("SetBackgroundColor", tempArrayID[left], "#2ECC71");
        this.cmd("Step");
    }
}

MergeSort.prototype.rightHelper = function(left, right, offset, prevOffset, row)
{
    if(left > right) return;

    var tempArrayID = this.drawArrayAndCopy(left, right, offset, prevOffset, row);

    if(left != right) {
        var mid = Math.ceil((left + right) / 2);
        var extraOffset = row < 2 ? 2 * LARGE_OFFSET : 2 * SMALL_OFFSET;
        this.rightHelper(left, mid - 1, offset, offset, row + 1);
        this.rightHelper(mid, right, offset + extraOffset, offset, row + 1);
        this.merge(left, right, mid, row, offset, offset, offset + extraOffset, tempArrayID);
    } else {
        this.cmd("SetBackgroundColor", tempArrayID[left], "#2ECC71");
        this.cmd("Step");
    }
}

MergeSort.prototype.drawArrayAndCopy = function(left, right, offset, prevOffset, row)
{
    var tempArrayID = new Array();

    // Display subarray
    for (var i = left; i <= right; i++)
    {
        var xPos = i * ARRAY_ELEM_WIDTH + ARRAY_START_X + offset;
        var yPos = ARRAY_START_Y + row * ARRAY_LINE_SPACING;
        tempArrayID[i] = this.nextIndex;
        this.arrayID.push(this.nextIndex);
        this.cmd("CreateRectangle", this.nextIndex++, "", ARRAY_ELEM_WIDTH, ARRAY_ELEM_HEIGHT, xPos, yPos);
    }
    this.cmd("Step");

    // Copy elements from big array to current subarray
    for (var i = left; i <= right; i++)
    {
        this.copyData(i, i, prevOffset, offset, row - 1, row, this.arrayData[i], tempArrayID[i], -1);
    }

    return tempArrayID;
}

MergeSort.prototype.merge = function(left, right, mid, row, currOffset, leftOffset, rightOffset, currArrayID)
{
    var tempArray = new Array(this.arrayData.length); // Temporary array to store data for sorting

    // Copy data to temporary array
    for(var i = left; i <= right; i++) {
        tempArray[i] = this.arrayData[i];
    }

    // Create pointers
    var bottomYPos = ARRAY_START_Y + (row + 1) * ARRAY_LINE_SPACING;
    var iPointerID = this.nextIndex++;
    var iXPos = left * ARRAY_ELEM_WIDTH + ARRAY_START_X + leftOffset;
    this.cmd("CreateHighlightCircle", iPointerID, "#0000FF", iXPos, bottomYPos);
    var jPointerID = this.nextIndex++;
    var jXPos = mid * ARRAY_ELEM_WIDTH + ARRAY_START_X + rightOffset;
    this.cmd("CreateHighlightCircle", jPointerID, "#0000FF", jXPos, bottomYPos);
    var kPointerID = this.nextIndex++;
    var kXPos = left * ARRAY_ELEM_WIDTH + ARRAY_START_X + currOffset;
    var topYPos = ARRAY_START_Y + row * ARRAY_LINE_SPACING;
    this.cmd("CreateHighlightCircle", kPointerID, "#0000FF", kXPos, topYPos);
    this.cmd("Step");

    // Merge data and animate
    var i = left;
    var j = mid;
    var k = left;
    while (i < mid && j <= right) {
        if (tempArray[i] <= tempArray[j]) {
            this.copyData(i, k, leftOffset, currOffset, row + 1, row, tempArray[i], currArrayID[k], iPointerID);
            this.arrayData[k] = tempArray[i];
            k++;
            this.movePointer(k, row, currOffset, kPointerID);
            i++;
            if (i < mid) {
                this.movePointer(i, row + 1, leftOffset, iPointerID);
            }
        } else {
            this.copyData(j, k, rightOffset, currOffset, row + 1, row, tempArray[j], currArrayID[k], jPointerID);
            this.arrayData[k] = tempArray[j];
            k++;
            this.movePointer(k, row, currOffset, kPointerID);
            j++;
            if (j <= right) {
                this.movePointer(j, row + 1, rightOffset, jPointerID);
            }
        }
        this.cmd("Step");
    }
    while (i < mid) {
        this.copyData(i, k, leftOffset, currOffset, row + 1, row, tempArray[i], currArrayID[k], iPointerID);
        this.arrayData[k++] = tempArray[i++];
        if(k <= right) {
            this.movePointer(i, row + 1, leftOffset, iPointerID);
            this.movePointer(k, row, currOffset, kPointerID);
        }
    }
    while (j <= right) {
        this.copyData(j, k, rightOffset, currOffset, row + 1, row, tempArray[j], currArrayID[k], jPointerID);
        this.arrayData[k++] = tempArray[j++];
        if(k <= right) {
            this.movePointer(j, row + 1, rightOffset, jPointerID);
            this.movePointer(k, row, currOffset, kPointerID);
        }
    }

    // Delete pointers
    this.cmd("Delete", iPointerID);
    this.cmd("Delete", jPointerID);
    this.cmd("Delete", kPointerID);
    this.cmd("Step");
}

MergeSort.prototype.copyData = function(fromIndex, toIndex, fromOffset, toOffset, fromRow, toRow, value, cellID, pointerID)
{
    if(pointerID != -1) {
        this.cmd("SetForegroundColor", pointerID, "#FF0000");
        this.cmd("Step");
    }
    var fromXPos = fromIndex * ARRAY_ELEM_WIDTH + ARRAY_START_X + fromOffset;
    var fromYPos = ARRAY_START_Y + fromRow * ARRAY_LINE_SPACING;
    labelID = this.nextIndex++;
    this.cmd("CreateLabel", labelID, value, fromXPos, fromYPos);
    var toXPos = toIndex * ARRAY_ELEM_WIDTH + ARRAY_START_X + toOffset;
    var toYPos = ARRAY_START_Y + toRow * ARRAY_LINE_SPACING;
    this.cmd("Move", labelID, toXPos, toYPos);
    this.cmd("Step");
    this.cmd("SetText", cellID, value);
    this.cmd("Delete", labelID);
    if(pointerID != -1) {
        this.cmd("SetBackgroundColor", cellID, "#2ECC71");
        this.cmd("SetForegroundColor", pointerID, "#0000FF");
        this.cmd("Step");
    }
}

MergeSort.prototype.movePointer = function(index, row, offset, pointerID)
{
    var xPos = index * ARRAY_ELEM_WIDTH + ARRAY_START_X + offset;
    var yPos = ARRAY_START_Y + row * ARRAY_LINE_SPACING;
    this.cmd("Move", pointerID, xPos, yPos);
}

// Called by our superclass when we get an animation started event -- need to wait for the
// event to finish before we start doing anything
MergeSort.prototype.disableUI = function(event)
{
    for (var i = 0; i < this.controls.length; i++)
    {
        this.controls[i].disabled = true;
    }
}

// Called by our superclass when we get an animation completed event -- we can
/// now interact again.
MergeSort.prototype.enableUI = function(event)
{
    for (var i = 0; i < this.controls.length; i++)
    {
        this.controls[i].disabled = false;
    }
}


var currentAlg;

function init()
{
    var animManag = initCanvas();
    currentAlg = new MergeSort(animManag, canvas.width, canvas.height);

}
