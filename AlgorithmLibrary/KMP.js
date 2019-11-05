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
var ARRAY_START_Y = 30;

var MAX_LENGTH = 22;

var FAILURE_TABLE_START_Y = 100;

function KMP(am, w, h)
{
    this.init(am, w, h);
}

KMP.prototype = new Algorithm();
KMP.prototype.constructor = KMP;
KMP.superclass = Algorithm.prototype;

KMP.prototype.init = function(am, w, h)
{
    // Call the unit function of our "superclass", which adds a couple of
    // listeners, and sets up the undo stack
    KMP.superclass.init.call(this, am, w, h);

    this.addControls();

    // Useful for memory management
    this.nextIndex = 0;

    // TODO:  Add any code necessary to set up your own algorithm.  Initialize data
    // structures, etc.
    this.setup();
}

KMP.prototype.addControls =  function()
{
    this.controls = [];

    addLabelToAlgorithmBar("Text")

    // Text text field
    this.textField = addControlToAlgorithmBar("Text", "");
    this.textField.onkeydown = this.returnSubmit(this.textField, this.findCallback.bind(this), MAX_LENGTH, false);
    this.controls.push(this.textField);

    addLabelToAlgorithmBar("Pattern")

    // Pattern text field
    this.patternField = addControlToAlgorithmBar("Text", "");
    this.patternField.onkeydown = this.returnSubmit(this.patternField, this.findCallback.bind(this), MAX_LENGTH, false);
    this.controls.push(this.patternField);

    // Find button
    this.findButton = addControlToAlgorithmBar("Button", "Find");
    this.findButton.onclick = this.findCallback.bind(this);
    this.controls.push(this.findButton);

    // Clear button
    this.clearButton = addControlToAlgorithmBar("Button", "Clear");
    this.clearButton.onclick = this.clearCallback.bind(this);
    this.controls.push(this.clearButton);
}

KMP.prototype.setup = function()
{
    this.textRowID = new Array();
    this.comparisonMatrixID = new Array();
    this.failureTableLabelID = this.nextIndex++;
    this.failureTableCharacterID = new Array();
    this.failureTableValueID = new Array();
}

KMP.prototype.reset = function()
{
    // Reset all of your data structures to *exactly* the state they have immediately after the init
    // function is called.  This method is called whenever an "undo" is performed.  Your data
    // structures are completely cleaned, and then all of the actions *up to but not including* the
    // last action are then redone.  If you implement all of your actions through the "implementAction"
    // method below, then all of this work is done for you in the Animation "superclass"

    // Reset the (very simple) memory manager
    this.nextIndex = 0;
}

KMP.prototype.findCallback = function(event)
{
    if (this.textField.value != "" && this.patternField.value != ""
        && this.textField.value.length >= this.patternField.value.length)
    {
        this.implementAction(this.clear.bind(this), "");
        var text = this.textField.value;
        var pattern = this.patternField.value;
        this.textField.value = ""
        this.patternField.value = ""
        this.implementAction(this.find.bind(this), text + "," + pattern);
    }
}

KMP.prototype.clearCallback = function(event)
{
    this.implementAction(this.clear.bind(this), "");
}

KMP.prototype.find = function(params)
{
    this.commands = new Array();

    var text = params.split(",")[0];
    var pattern = params.split(",")[1];

    if(text.length <= 14) {
        this.cellSize = 30;
    } else if (text.length <= 17) {
        this.cellSize = 25;
    } else {
        this.cellSize = 20;
    }

    this.textRowID = new Array(text.length);
    this.comparisonMatrixID = new Array(text.length);
    for (var i = 0; i < text.length; i++) {
        this.comparisonMatrixID[i] = new Array(text.length);
    }

    for (var i = 0; i < text.length; i++)
    {
        var xpos = i * this.cellSize + ARRAY_START_X;
        var ypos = ARRAY_START_Y;
        this.textRowID[i] = this.nextIndex;
        this.cmd("CreateRectangle", this.nextIndex, text.charAt(i), this.cellSize, this.cellSize, xpos, ypos);
        this.cmd("SetBackgroundColor", this.nextIndex++, "#D3D3D3");
    }

    for (var row = 0; row < text.length; row++)
    {
        for (var col = 0; col < text.length; col++)
        {
            var xpos = col * this.cellSize + ARRAY_START_X;
            var ypos = (row + 1) * this.cellSize + ARRAY_START_Y;
            this.comparisonMatrixID[row][col] = this.nextIndex;
            this.cmd("CreateRectangle", this.nextIndex++, "", this.cellSize, this.cellSize, xpos, ypos);
        }
    }

    var failureTable = this.buildFailureTable(text.length, pattern);

    var iPointerID = this.nextIndex++;
    var jPointerID = this.nextIndex++;
    this.cmd("CreateHighlightCircle", iPointerID, "#0000FF", ARRAY_START_X, ARRAY_START_Y, this.cellSize / 2);
    this.cmd("CreateHighlightCircle", jPointerID, "#0000FF", ARRAY_START_X , ARRAY_START_Y + this.cellSize, this.cellSize / 2);

    var i = 0;
    var j = 0;
    var row = 0;
    while (i <= text.length - pattern.length)
    {
        for (var k = i; k < i + pattern.length; k++)
        {
            this.cmd("SetText", this.comparisonMatrixID[row][k], pattern.charAt(k - i), xpos, ypos);
        }
        this.cmd("Step");
        while (j < pattern.length && pattern.charAt(j) == text.charAt(i + j))
        {
            this.cmd("SetBackgroundColor", this.comparisonMatrixID[row][i + j], "#2ECC71");
            j++;
            this.cmd("Step");
            if (j < pattern.length)
            {
                var xpos = (i + j) * this.cellSize + ARRAY_START_X;
                this.cmd("Move", iPointerID, xpos, ARRAY_START_Y);
                var ypos = (row + 1) * this.cellSize + ARRAY_START_Y;
                this.cmd("Move", jPointerID, xpos, ypos);
                this.cmd("Step");
            }
        }
        if (j == 0)
        {
            this.cmd("SetBackgroundColor", this.comparisonMatrixID[row][i], "#E74C3C");
            i++;
        }
        else
        {
            if (j != pattern.length) {
                this.cmd("SetBackgroundColor", this.comparisonMatrixID[row][i + j], "#E74C3C");
            }
            var nextAlignment = failureTable[j - 1];
            i += j - nextAlignment;
            j = nextAlignment;
        }
        row++;
        if (i <= text.length - pattern.length)
        {
            var xpos = (i + j) * this.cellSize + ARRAY_START_X;
            this.cmd("Move", iPointerID, xpos, ARRAY_START_Y);
            var ypos = (row + 1) * this.cellSize + ARRAY_START_Y;
            this.cmd("Move", jPointerID, xpos, ypos);
            this.cmd("Step");
        }
    }

    this.cmd("Delete", iPointerID);
    this.cmd("Delete", jPointerID);
    return this.commands;
}

KMP.prototype.buildFailureTable = function(textLength, pattern)
{
    // Display label
    var labelX = ARRAY_START_X + textLength * this.cellSize + 10;
    this.cmd("CreateLabel", this.failureTableLabelID, "Failure table:", labelX, FAILURE_TABLE_START_Y, 0);

    // Display empty failure table
    var tableStartX = ARRAY_START_X + textLength * this.cellSize + 100;
    this.failureTableCharacterID = new Array(pattern.length);
    this.failureTableValueID = new Array(pattern.length);
    for (var i = 0; i < pattern.length; i++) {
        var xpos = tableStartX + i * this.cellSize;
        this.failureTableCharacterID[i] = this.nextIndex++;
        this.cmd("CreateRectangle", this.failureTableCharacterID[i], pattern.charAt(i), this.cellSize, this.cellSize, xpos, FAILURE_TABLE_START_Y);
        this.cmd("SetBackgroundColor", this.failureTableCharacterID[i], "#D3D3D3");
        this.failureTableValueID[i] = this.nextIndex++;
        this.cmd("CreateRectangle", this.failureTableValueID[i], "", this.cellSize, this.cellSize, xpos, FAILURE_TABLE_START_Y + this.cellSize);
    }
    this.cmd("Step");

    // Display pointers and set first value to 0
    var iPointerID = this.nextIndex++;
    var jPointerID = this.nextIndex++;
    this.cmd("CreateHighlightCircle", iPointerID, "#0000FF", tableStartX, FAILURE_TABLE_START_Y, this.cellSize / 2);
    this.cmd("CreateHighlightCircle", jPointerID, "#FF0000", tableStartX + this.cellSize, FAILURE_TABLE_START_Y, this.cellSize / 2);
    this.cmd("SetText", this.failureTableValueID[0], 0);
    this.cmd("Step");

    var failureTable = new Array();
    failureTable[0] = 0;
    var i = 0;
    var j = 1;
    while (j < pattern.length) {
        if (pattern.charAt(i) == pattern.charAt(j)) {
            i++;
            failureTable[j] = i;
            this.cmd("SetText", this.failureTableValueID[j], i);
            j++;
            if(j < pattern.length)
            {
                this.cmd("Move", iPointerID, tableStartX + i * this.cellSize, FAILURE_TABLE_START_Y);
                this.cmd("Move", jPointerID, tableStartX + j * this.cellSize, FAILURE_TABLE_START_Y);
            }
            this.cmd("Step");
        } else {
            if (i == 0) {
                failureTable[j] = i;
                this.cmd("SetText", this.failureTableValueID[j], i);
                j++;
                if(j < pattern.length)
                {
                    this.cmd("Move", jPointerID, tableStartX + j * this.cellSize, FAILURE_TABLE_START_Y);
                }
                this.cmd("Step");
            } else {
                i = failureTable[i - 1];
                this.cmd("Move", iPointerID, tableStartX + i * this.cellSize, FAILURE_TABLE_START_Y);
                this.cmd("Step");
            }
        }
    }

    this.cmd("Delete", iPointerID);
    this.cmd("Delete", jPointerID);

    return failureTable;
}

KMP.prototype.clear = function()
{
    this.commands = new Array();
    for (var i = 0; i < this.textRowID.length; i++)
    {
        this.cmd("Delete", this.textRowID[i]);
    }
    this.textRowID = new Array();
    for (var i = 0; i < this.comparisonMatrixID.length; i++)
    {
        for (var j = 0; j < this.comparisonMatrixID.length; j++)
        {
            this.cmd("Delete", this.comparisonMatrixID[i][j]);
        }
    }
    this.comparisonMatrixID = new Array();
    if(this.failureTableValueID.length != 0)
    {
        this.cmd("Delete", this.failureTableLabelID);
    }
    for (var i = 0; i < this.failureTableCharacterID.length; i++)
    {
        this.cmd("Delete", this.failureTableCharacterID[i]);
        this.cmd("Delete", this.failureTableValueID[i]);
    }
    this.failureTableCharacterID = new Array();
    this.failureTableValueID = new Array();
    return this.commands;
}

// Called by our superclass when we get an animation started event -- need to wait for the
// event to finish before we start doing anything
KMP.prototype.disableUI = function(event)
{
    for (var i = 0; i < this.controls.length; i++)
    {
        this.controls[i].disabled = true;
    }
}

// Called by our superclass when we get an animation completed event -- we can
/// now interact again.
KMP.prototype.enableUI = function(event)
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
    currentAlg = new KMP(animManag, canvas.width, canvas.height);
}
