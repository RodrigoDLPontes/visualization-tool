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

var lastSwapEnabled = true;

function BubbleSort(am, w, h)
{
    this.init(am, w, h);
}

BubbleSort.prototype = new Algorithm();
BubbleSort.prototype.constructor = BubbleSort;
BubbleSort.superclass = Algorithm.prototype;

BubbleSort.prototype.init = function(am, w, h)
{
    // Call the unit function of our "superclass", which adds a couple of
    // listeners, and sets up the undo stack
    BubbleSort.superclass.init.call(this, am, w, h);

    this.addControls();

    // Useful for memory management
    this.nextIndex = 0;

    // TODO:  Add any code necessary to set up your own algorithm.  Initialize data
    // structures, etc.
    this.setup();
}

BubbleSort.prototype.addControls =  function()
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

    // Last swap optimization toggle
    this.lastSwapCheckbox = addCheckboxToAlgorithmBar("Enable last swap optimization", true)
    this.lastSwapCheckbox.onclick = this.toggleLastSwap.bind(this);
    this.controls.push(this.lastSwapCheckbox);
}

BubbleSort.prototype.setup = function()
{
    this.arrayData = new Array();
    this.arrayID = new Array();
    this.iPointerID = this.nextIndex++;
    this.jPointerID = this.nextIndex++;
}

BubbleSort.prototype.reset = function()
{
    // Reset all of your data structures to *exactly* the state they have immediately after the init
    // function is called.  This method is called whenever an "undo" is performed.  Your data
    // structures are completely cleaned, and then all of the actions *up to but not including* the
    // last action are then redone.  If you implement all of your actions through the "implementAction"
    // method below, then all of this work is done for you in the Animation "superclass"

    // Reset the (very simple) memory manager
    this.nextIndex = 0;
}

BubbleSort.prototype.sortCallback = function(event)
{
    if (this.listField.value != "")
    {
        this.implementAction(this.clear.bind(this), "");
        var list = this.listField.value;
        this.listField.value = "";
        this.implementAction(this.sort.bind(this), list);
    }
}

BubbleSort.prototype.clearCallback = function(event)
{
    this.implementAction(this.clear.bind(this), "");
}

BubbleSort.prototype.toggleLastSwap = function(event)
{
    lastSwapEnabled = !lastSwapEnabled;
}

BubbleSort.prototype.clear = function()
{
    this.commands = new Array();
    for(var i = 0; i < this.arrayID.length; i++) {
        this.cmd("Delete", this.arrayID[i]);
    }
    this.arrayData = new Array();
    this.arrayID = new Array();
    return this.commands;
}


BubbleSort.prototype.sort = function(params)
{
    this.commands = new Array();

    this.arrayID = new Array();
    this.arrayData = params.split(",").map(Number).filter(x => x).slice(0, 18);
    var length = this.arrayData.length;

    for (var i = 0; i < length; i++)
    {
        this.arrayID[i] = this.nextIndex++;
        var xpos = i * ARRAY_ELEM_WIDTH + ARRAY_START_X;
        var ypos = ARRAY_START_Y;
        this.cmd("CreateRectangle", this.arrayID[i], this.arrayData[i], ARRAY_ELEM_WIDTH, ARRAY_ELEM_HEIGHT, xpos, ypos);
    }
    this.cmd("CreateHighlightCircle", this.iPointerID, "#0000FF", ARRAY_START_X, ARRAY_START_Y);
    this.cmd("SetHighlight", this.iPointerID, 1);
    this.cmd("CreateHighlightCircle", this.jPointerID, "#0000FF", ARRAY_START_X + ARRAY_ELEM_WIDTH, ARRAY_START_Y);
    this.cmd("SetHighlight", this.jPointerID, 1);
    this.cmd("Step");

    var sorted = true;
    var end = this.arrayData.length - 1;
    var lastSwapped = 0;
    do {
        sorted = true;
        for (var i = 0; i < end; i++) {
            this.movePointers(i, i + 1);
            if (this.arrayData[i] > this.arrayData[i + 1]) {
                this.swap(i, i + 1);
                sorted = false;
                lastSwapped = i;
            }
        }
        if (lastSwapEnabled) {
            end = lastSwapped;
        } else {
            end--;
        }
        if (!sorted) {
            for (var i = end + 1; i < this.arrayData.length; i++) {
                this.cmd("SetBackgroundColor", this.arrayID[i], "#2ECC71");
            }
            this.cmd("Step")
        }
    } while (!sorted);

    this.cmd("Delete", this.iPointerID);
    this.cmd("Delete", this.jPointerID);
    this.cmd("Step");

    for (var i = 0; i < this.arrayData.length; i++) {
        this.cmd("SetBackgroundColor", this.arrayID[i], "#2ECC71");
    }
    this.cmd("Step")

    return this.commands;
}

BubbleSort.prototype.movePointers = function(i, j) {
    var iXPos = i * ARRAY_ELEM_WIDTH + ARRAY_START_X;
    this.cmd("Move", this.iPointerID, iXPos, ARRAY_START_Y);
    var jXPos = j * ARRAY_ELEM_WIDTH + ARRAY_START_X;
    this.cmd("Move", this.jPointerID, jXPos, ARRAY_START_Y);
    this.cmd("Step");
}

BubbleSort.prototype.swap = function(i, j) {
    // Change pointer colors to red
    this.cmd("SetForegroundColor", this.iPointerID, "#FF0000");
    this.cmd("SetForegroundColor", this.jPointerID, "#FF0000");
    // Create temporary labels and remove text in array
    var iLabelID = this.nextIndex++;
    var iXPos = i * ARRAY_ELEM_WIDTH + ARRAY_START_X;
    this.cmd("CreateLabel", iLabelID, this.arrayData[i], iXPos, ARRAY_START_Y);
    var jLabelID = this.nextIndex++;
    var jXPos = j * ARRAY_ELEM_WIDTH + ARRAY_START_X;
    this.cmd("CreateLabel", jLabelID, this.arrayData[j], jXPos, ARRAY_START_Y);
    this.cmd("Settext", this.arrayID[i], "");
    this.cmd("Settext", this.arrayID[j], "");
    // Move labels
    this.cmd("Move", iLabelID, jXPos, ARRAY_START_Y);
    this.cmd("Move", jLabelID, iXPos, ARRAY_START_Y);
    this.cmd("Step");
    // Set text in array and delete temporary labels
    this.cmd("Settext", this.arrayID[i], this.arrayData[j]);
    this.cmd("Settext", this.arrayID[j], this.arrayData[i]);
    this.cmd("Delete", iLabelID);
    this.cmd("Delete", jLabelID);
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
BubbleSort.prototype.disableUI = function(event)
{
    for (var i = 0; i < this.controls.length; i++)
    {
        this.controls[i].disabled = true;
    }
}

// Called by our superclass when we get an animation completed event -- we can
/// now interact again.
BubbleSort.prototype.enableUI = function(event)
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
    currentAlg = new BubbleSort(animManag, canvas.width, canvas.height);

}
