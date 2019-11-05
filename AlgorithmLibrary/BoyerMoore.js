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

var PATTERN_START_Y = 100;

var LAST_TABLE_START_Y = 200;

function BoyerMoore(am, w, h)
{
    this.init(am, w, h);
}

BoyerMoore.prototype = new Algorithm();
BoyerMoore.prototype.constructor = BoyerMoore;
BoyerMoore.superclass = Algorithm.prototype;

BoyerMoore.prototype.init = function(am, w, h)
{
    // Call the unit function of our "superclass", which adds a couple of
    // listeners, and sets up the undo stack
    BoyerMoore.superclass.init.call(this, am, w, h);

    this.addControls();

    // Useful for memory management
    this.nextIndex = 0;

    // TODO:  Add any code necessary to set up your own algorithm.  Initialize data
    // structures, etc.
    this.setup();
}

BoyerMoore.prototype.addControls =  function()
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

BoyerMoore.prototype.setup = function()
{
    this.textRowID = new Array();
    this.comparisonMatrixID = new Array();
    this.patternTableLableID = this.nextIndex++;
    this.patternTableCharacterID = new Array();
    this.patternTableIndexID = new Array();
    this.lastTableLabelID = this.nextIndex++;
    this.lastTableCharacterID = new Array();
    this.lastTableValueID = new Array();
}

BoyerMoore.prototype.reset = function()
{
    // Reset all of your data structures to *exactly* the state they have immediately after the init
    // function is called.  This method is called whenever an "undo" is performed.  Your data
    // structures are completely cleaned, and then all of the actions *up to but not including* the
    // last action are then redone.  If you implement all of your actions through the "implementAction"
    // method below, then all of this work is done for you in the Animation "superclass"

    // Reset the (very simple) memory manager
    this.nextIndex = 0;
}

BoyerMoore.prototype.findCallback = function(event)
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

BoyerMoore.prototype.clearCallback = function(event)
{
    this.implementAction(this.clear.bind(this), "");
}

BoyerMoore.prototype.find = function(params)
{
    this.commands = new Array();

    var text = params.split(",")[0];
    var pattern = params.split(",")[1];

    this.textRowID = new Array(text.length);
    this.comparisonMatrixID = new Array(text.length);
    for (var i = 0; i < text.length; i++) {
        this.comparisonMatrixID[i] = new Array(text.length);
    }

    if(text.length <= 14) {
        this.cellSize = 30;
    } else if (text.length <= 17) {
        this.cellSize = 25;
    } else {
        this.cellSize = 20;
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

    var lastTable = this.buildLastTable(text.length, pattern);

    var iPointerID = this.nextIndex++;
    var jPointerID = this.nextIndex++;
    this.cmd("CreateHighlightCircle", iPointerID, "#0000FF", ARRAY_START_X + (pattern.length - 1) * this.cellSize, ARRAY_START_Y, this.cellSize / 2);
    this.cmd("CreateHighlightCircle", jPointerID, "#0000FF", ARRAY_START_X + (pattern.length - 1) * this.cellSize , ARRAY_START_Y + this.cellSize, this.cellSize / 2);

    var i = 0;
    var j = pattern.length - 1;
    var row = 0;
    while (i <= text.length - pattern.length)
    {
        for (var k = i; k < i + pattern.length; k++)
        {
            this.cmd("SetText", this.comparisonMatrixID[row][k], pattern.charAt(k - i), xpos, ypos);
        }
        this.cmd("Step");
        while (j >= 0 && pattern.charAt(j) == text.charAt(i + j))
        {
            this.cmd("SetBackgroundColor", this.comparisonMatrixID[row][i + j], "#2ECC71");
            j--;
            this.cmd("Step");
            if (j >= 0)
            {
                var xpos = (i + j) * this.cellSize + ARRAY_START_X;
                this.cmd("Move", iPointerID, xpos, ARRAY_START_Y);
                var ypos = (row + 1) * this.cellSize + ARRAY_START_Y;
                this.cmd("Move", jPointerID, xpos, ypos);
                this.cmd("Step");
            }
        }
        if (j == -1)
        {
            i++;
        }
        else
        {
            this.cmd("SetBackgroundColor", this.comparisonMatrixID[row][i + j], "#E74C3C");
            var shift;
            if (text.charAt(i + j) in lastTable)
            {
                shift = lastTable[text.charAt(i + j)];
            }
            else
            {
                shift = -1;
            }
            if (shift < j)
            {
                i += j - shift;
            }
            else
            {
                i++;
            }
        }
        j = pattern.length - 1;
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

BoyerMoore.prototype.buildLastTable = function(textLength, pattern)
{
    // Display labels
    var labelsX = ARRAY_START_X + textLength * this.cellSize + 10;
    this.cmd("CreateLabel", this.patternTableLableID, "Pattern:", labelsX, PATTERN_START_Y, 0);
    this.cmd("CreateLabel", this.lastTableLabelID, "Last occurence table:", labelsX, LAST_TABLE_START_Y, 0);

    // Display pattern table
    var patternTableStartX = ARRAY_START_X + textLength * this.cellSize + 80;
    this.patternTableCharacterID = new Array(pattern.length);
    this.patternTableIndexID = new Array(pattern.length);
    for (var i = 0; i < pattern.length; i++) {
        var xpos = patternTableStartX + i * this.cellSize;
        this.patternTableCharacterID[i] = this.nextIndex;
        this.cmd("CreateRectangle", this.nextIndex++, pattern.charAt(i), this.cellSize, this.cellSize, xpos, PATTERN_START_Y);
        this.patternTableIndexID[i] = this.nextIndex;
        this.cmd("CreateLabel", this.nextIndex++, i, xpos, PATTERN_START_Y + this.cellSize);
    }

    // Create empty last occurence table
    var characters = new Object(); // This is a HashMap (JavaScript is weird...)
    for (var i = 0; i < pattern.length; i++)
    {
        characters[pattern.charAt(i)] = null;
    }

    // Display empty last occurence table
    this.lastTableCharacterID = new Array();
    this.lastTableValueID = new Array();
    var patternTableStartX = ARRAY_START_X + textLength * this.cellSize + 140;
    var j = 0;
    for (var character in characters)
    {
        var xpos = patternTableStartX + j * this.cellSize;
        this.lastTableCharacterID.push(this.nextIndex);
        this.cmd("CreateRectangle", this.nextIndex, character, this.cellSize, this.cellSize, xpos, LAST_TABLE_START_Y);
        this.cmd("SetBackgroundColor", this.nextIndex++, "#D3D3D3");
        characters[character] = this.nextIndex;
        this.lastTableValueID.push(this.nextIndex);
        this.cmd("CreateRectangle", this.nextIndex++, "", this.cellSize, this.cellSize, xpos, LAST_TABLE_START_Y + this.cellSize);
        j++;
    }
    // Display "*" entry
    var xpos = patternTableStartX + j * this.cellSize;
    this.lastTableCharacterID.push(this.nextIndex);
    this.cmd("CreateRectangle", this.nextIndex, "*", this.cellSize, this.cellSize, xpos, LAST_TABLE_START_Y);
    this.cmd("SetBackgroundColor", this.nextIndex++, "#D3D3D3");
    this.lastTableValueID.push(this.nextIndex);
    this.cmd("CreateRectangle", this.nextIndex++, "-1", this.cellSize, this.cellSize, xpos, LAST_TABLE_START_Y + this.cellSize);

    // Fill out last occurence table
    var lastTable = new Object();
    for (var i = 0; i < pattern.length; i++)
    {
        lastTable[pattern.charAt(i)] = i;
        this.cmd("SetText", characters[pattern.charAt(i)], i);
    }
    return lastTable;
}

BoyerMoore.prototype.clear = function()
{
    this.commands = new Array();
    for(var i = 0; i < this.textRowID.length; i++)
    {
        this.cmd("Delete", this.textRowID[i]);
    }
    this.textRowID = new Array();
    for(var i = 0; i < this.comparisonMatrixID.length; i++)
    {
        for(var j = 0; j < this.comparisonMatrixID.length; j++)
        {
            this.cmd("Delete", this.comparisonMatrixID[i][j]);
        }
    }
    this.comparisonMatrixID = new Array();
    if(this.patternTableCharacterID.length != 0)
    {
        this.cmd("Delete", this.patternTableLableID);
    }
    for(var i = 0; i < this.patternTableCharacterID.length; i++)
    {
        this.cmd("Delete", this.patternTableCharacterID[i]);
        this.cmd("Delete", this.patternTableIndexID[i]);
    }
    this.patternTableCharacterID = new Array();
    this.patternTableIndexID = new Array();
    if(this.lastTableCharacterID.length != 0)
    {
        this.cmd("Delete", this.lastTableLabelID);
    }
    for(var i = 0; i < this.lastTableCharacterID.length; i++)
    {
        this.cmd("Delete", this.lastTableCharacterID[i]);
        this.cmd("Delete", this.lastTableValueID[i]);
    }
    this.lastTableCharacterID = new Array();
    this.lastTableValueID = new Array();
    return this.commands;
}

// Called by our superclass when we get an animation started event -- need to wait for the
// event to finish before we start doing anything
BoyerMoore.prototype.disableUI = function(event)
{
    for (var i = 0; i < this.controls.length; i++)
    {
        this.controls[i].disabled = true;
    }
}

// Called by our superclass when we get an animation completed event -- we can
/// now interact again.
BoyerMoore.prototype.enableUI = function(event)
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
    currentAlg = new BoyerMoore(animManag, canvas.width, canvas.height);
}
