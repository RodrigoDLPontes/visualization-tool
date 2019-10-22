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

var ARRAY_START_X = 100;
var ARRAY_START_Y = 200;
var ARRAY_ELEM_WIDTH = 50;
var ARRAY_ELEM_HEIGHT = 50;

var ARRRAY_ELEMS_PER_LINE = 15;
var ARRAY_LINE_SPACING = 130;

var TOP_POS_X = 180;
var TOP_POS_Y = 100;
var TOP_LABEL_X = 130;
var TOP_LABEL_Y =  100;

var PUSH_LABEL_X = 50;
var PUSH_LABEL_Y = 30;
var PUSH_ELEMENT_X = 120;
var PUSH_ELEMENT_Y = 30;

var SIZE = 10;

function QuickSort(am, w, h)
{
    this.init(am, w, h);
}

QuickSort.prototype = new Algorithm();
QuickSort.prototype.constructor = QuickSort;
QuickSort.superclass = Algorithm.prototype;

QuickSort.prototype.init = function(am, w, h)
{
    // Call the unit function of our "superclass", which adds a couple of
    // listeners, and sets up the undo stack
    QuickSort.superclass.init.call(this, am, w, h);

    this.addControls();

    // Useful for memory management
    this.nextIndex = 0;

    // TODO:  Add any code necessary to set up your own algorithm.  Initialize data
    // structures, etc.
    this.setup();
}

QuickSort.prototype.addControls =  function()
{
    this.controls = [];

    addLabelToAlgorithmBar("Comma separated list (e.g. \"3,1,2\", max 18 elements)")

    // List text field
    this.listField = addControlToAlgorithmBar("Text", "");
    this.listField.onkeydown = this.returnSubmit(this.listField, this.sortCallback.bind(this), 60, false);
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

QuickSort.prototype.setup = function()
{
    this.arrayData = new Array();
    this.arrayID = new Array();
    this.iPointerID = 0;
    this.jPointerID = 0;
    this.pPointerID = 0;
}

QuickSort.prototype.reset = function()
{
    // Reset all of your data structures to *exactly* the state they have immediately after the init
    // function is called.  This method is called whenever an "undo" is performed.  Your data
    // structures are completely cleaned, and then all of the actions *up to but not including* the
    // last action are then redone.  If you implement all of your actions through the "implementAction"
    // method below, then all of this work is done for you in the Animation "superclass"

    // Reset the (very simple) memory manager
    this.nextIndex = 0;
}

QuickSort.prototype.sortCallback = function(event)
{
    if (this.listField.value != "")
    {
        this.implementAction(this.clear.bind(this), "");
        var list = this.listField.value;
        this.listField.value = "";
        this.implementAction(this.sort.bind(this), list);
    }
}

QuickSort.prototype.clearCallback = function(event)
{
    this.implementAction(this.clear.bind(this), "");
}

QuickSort.prototype.clear = function()
{
    this.commands = new Array();
    for(var i = 0; i < this.arrayID.length; i++) {
        this.cmd("Delete", this.arrayID[i]);
    }
    this.arrayData = new Array();
    this.arrayID = new Array();
    return this.commands;
}


QuickSort.prototype.sort = function(params)
{
    this.commands = new Array();

    this.arrayID = new Array();
    this.arrayData = params.split(",").map(Number).filter(x => x).slice(0, 18);

    for (var i = 0; i < this.arrayData.length; i++)
    {
        this.arrayData[i] = parseInt(this.arrayData[i]);
        this.arrayID[i] = this.nextIndex++;
        var xpos = i * ARRAY_ELEM_WIDTH + ARRAY_START_X;
        var ypos = ARRAY_START_Y;
        this.cmd("CreateRectangle", this.arrayID[i], this.arrayData[i], ARRAY_ELEM_WIDTH, ARRAY_ELEM_HEIGHT, xpos, ypos);
    }

    this.iPointerID = this.nextIndex++;
    this.jPointerID = this.nextIndex++;
    this.pPointerID = this.nextIndex++;
    this.helper(0, this.arrayData.length - 1);

    return this.commands;
}

QuickSort.prototype.helper = function(left, right)
{
    if (left > right) return;

    // Hightlight cells in the current sub-array
    for (var i = left; i <= right; i++)
    {
        this.cmd("SetBackgroundColor", this.arrayID[i], "#99CCFF");
    }
    this.cmd("Step");

    if (left == right)
    {
        this.cmd("SetBackgroundColor", this.arrayID[left], "#2ECC71");
        this.cmd("Step");
        return;
    }

    // Create pivot pointer and swap with left-most element
    // To make things more interesting (and clearer), we don't pick the left-most element as pivot
    var pivot = Math.floor(Math.random() * (right - left)) + left + 1;
    var pXPos = pivot * ARRAY_ELEM_WIDTH + ARRAY_START_X;
    this.cmd("CreateHighlightCircle", this.pPointerID, "#FFFF00", pXPos, ARRAY_START_Y);
    this.cmd("Step");
    this.swapPivot(pivot, left);

    // Partition
    var i = left + 1;
    var j = right;
    var iXPos = i * ARRAY_ELEM_WIDTH + ARRAY_START_X;
    var jXPos = j * ARRAY_ELEM_WIDTH + ARRAY_START_X;
    this.cmd("CreateHighlightCircle", this.iPointerID, "#0000FF", iXPos, ARRAY_START_Y);
    this.cmd("CreateHighlightCircle", this.jPointerID, "#0000FF", jXPos, ARRAY_START_Y);
    this.cmd("Step");
    while (i <= j) {
        while (i <= j && this.arrayData[left] >= this.arrayData[i]) {
            i++;
            this.movePointers(i, j);
        }
        if (i <= j)
        {
            this.cmd("SetForegroundColor", this.iPointerID, "#FF0000");
            this.cmd("Step");
        }
        while (i <= j && this.arrayData[left] <= this.arrayData[j]) {
            j--;
            this.movePointers(i, j);
        }
        if (i <= j)
        {
            this.cmd("SetForegroundColor", this.jPointerID, "#FF0000");
            this.cmd("Step");
        }
        if (i <= j) {
            this.swap(i, j);
            i++;
            j--;
            this.movePointers(i, j);
        }
    }

    // Delete i and j pointers
    this.cmd("Delete", this.iPointerID);
    this.cmd("Delete", this.jPointerID);
    this.cmd("Step");

    // Move pivot back and delete pivot pointer
    this.swapPivot(left, j);
    this.cmd("Delete", this.pPointerID);
    this.cmd("Step");

    // Un-hightlight cells in sub-array and set pivot cell to green
    for (var i = left; i <= right; i++)
    {
        this.cmd("SetBackgroundColor", this.arrayID[i], "#FFFFFF");
    }
    this.cmd("SetBackgroundColor", this.arrayID[j], "#2ECC71");
    this.cmd("Step");

    this.helper(left, j - 1);
    this.helper(j + 1, right);
}

QuickSort.prototype.movePointers = function(i, j)
{
    var iXPos = i * ARRAY_ELEM_WIDTH + ARRAY_START_X;
    this.cmd("Move", this.iPointerID, iXPos, ARRAY_START_Y);
    var jXPos = j * ARRAY_ELEM_WIDTH + ARRAY_START_X;
    this.cmd("Move", this.jPointerID, jXPos, ARRAY_START_Y);
    this.cmd("Step");
}

QuickSort.prototype.swapPivot = function(pivot, other)
{
    // Create temporary labels and remove text in array
    var lLabelID = this.nextIndex++;
    var lXPos = other * ARRAY_ELEM_WIDTH + ARRAY_START_X;
    this.cmd("CreateLabel", lLabelID, this.arrayData[other], lXPos, ARRAY_START_Y);
    var pLabelID = this.nextIndex++;
    var pXPos = pivot * ARRAY_ELEM_WIDTH + ARRAY_START_X;
    this.cmd("CreateLabel", pLabelID, this.arrayData[pivot], pXPos, ARRAY_START_Y);
    this.cmd("Settext", this.arrayID[other], "");
    this.cmd("Settext", this.arrayID[pivot], "");
    this.cmd("Step");
    // Move labels and pivot pointer
    this.cmd("Move", pLabelID, lXPos, ARRAY_START_Y);
    this.cmd("Move", this.pPointerID, lXPos, ARRAY_START_Y);
    this.cmd("Move", lLabelID, pXPos, ARRAY_START_Y);
    this.cmd("Step");
    // Set text in array, and delete temporary labels and pointer
    this.cmd("Settext", this.arrayID[other], this.arrayData[pivot]);
    this.cmd("Settext", this.arrayID[pivot], this.arrayData[other]);
    this.cmd("Delete", pLabelID);
    this.cmd("Delete", lLabelID);
    this.cmd("Step");
    // Swap data in backend array
    var temp = this.arrayData[pivot];
    this.arrayData[pivot] = this.arrayData[other];
    this.arrayData[other] = temp;
}

QuickSort.prototype.swap = function(i, j)
{
    // Create temporary labels and remove text in array
    var iLabelID = this.nextIndex++;
    var iXPos = i * ARRAY_ELEM_WIDTH + ARRAY_START_X;
    this.cmd("CreateLabel", iLabelID, this.arrayData[i], iXPos, ARRAY_START_Y);
    var jLabelID = this.nextIndex++;
    var jXPos = j * ARRAY_ELEM_WIDTH + ARRAY_START_X;
    this.cmd("CreateLabel", jLabelID, this.arrayData[j], jXPos, ARRAY_START_Y);
    this.cmd("Settext", this.arrayID[i], "");
    this.cmd("Settext", this.arrayID[j], "");
    this.cmd("Step");
    // Move labels
    this.cmd("Move", iLabelID, jXPos, ARRAY_START_Y);
    this.cmd("Move", jLabelID, iXPos, ARRAY_START_Y);
    this.cmd("Step");
    // Set text in array and delete temporary labels
    this.cmd("Settext", this.arrayID[i], this.arrayData[j]);
    this.cmd("Settext", this.arrayID[j], this.arrayData[i]);
    this.cmd("Delete", iLabelID);
    this.cmd("Delete", jLabelID);
    this.cmd("Step");
    // Swap data in backend array
    var temp = this.arrayData[i];
    this.arrayData[i] = this.arrayData[j];
    this.arrayData[j] = temp;
    // Reset pointer colors back to blue
    this.cmd("SetForegroundColor", this.iPointerID, "#0000FF");
    this.cmd("SetForegroundColor", this.jPointerID, "#0000FF");
    this.cmd("Step");
}

// Called by our superclass when we get an animation started event -- need to wait for the
// event to finish before we start doing anything
QuickSort.prototype.disableUI = function(event)
{
    for (var i = 0; i < this.controls.length; i++)
    {
        this.controls[i].disabled = true;
    }
}

// Called by our superclass when we get an animation completed event -- we can
/// now interact again.
QuickSort.prototype.enableUI = function(event)
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
    currentAlg = new QuickSort(animManag, canvas.width, canvas.height);

}
