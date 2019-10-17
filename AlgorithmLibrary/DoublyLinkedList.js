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

var LINKED_LIST_START_X = 100;
var LINKED_LIST_START_Y = 200;
var LINKED_LIST_ELEM_WIDTH = 100;
var LINKED_LIST_ELEM_HEIGHT = 30;


var LINKED_LIST_INSERT_X = 200;
var LINKED_LIST_INSERT_Y = 50;

var LINKED_LIST_ELEMS_PER_LINE = 8;
var LINKED_LIST_ELEM_SPACING = 150;
var LINKED_LIST_LINE_SPACING = 100;

var TOP_POS_X = 180;
var TOP_POS_Y = 100;
var TOP_LABEL_X = 130;
var TOP_LABEL_Y =  100;

var TOP_ELEM_WIDTH = 30;
var TOP_ELEM_HEIGHT = 30;

var PUSH_LABEL_X = 50;
var PUSH_LABEL_Y = 30;
var PUSH_ELEMENT_X = 120;
var PUSH_ELEMENT_Y = 30;

var SIZE = 32;

function DoublyLinkedList(am, w, h)
{
    this.init(am, w, h);
}

DoublyLinkedList.prototype = new Algorithm();
DoublyLinkedList.prototype.constructor = DoublyLinkedList;
DoublyLinkedList.superclass = Algorithm.prototype;

DoublyLinkedList.prototype.init = function(am, w, h)
{
    // Call the unit function of our "superclass", which adds a couple of
    // listeners, and sets up the undo stack
    DoublyLinkedList.superclass.init.call(this, am, w, h);

    this.addControls();

    // Useful for memory management
    this.nextIndex = 0;

    this.setup();

    this.initialIndex = this.nextIndex;
}


DoublyLinkedList.prototype.addControls =  function()
{
    this.controls = [];

    addLabelToAlgorithmBar("Value")

    // Add's value text field
    this.addValueField = addControlToAlgorithmBar("Text", "");
    this.addValueField.onkeydown = this.returnSubmit(this.addValueField, this.addIndexCallback.bind(this), 4, true);
    this.controls.push(this.addValueField);

    addLabelToAlgorithmBar("at index")

    // Add's index text field
    this.addIndexField = addControlToAlgorithmBar("Text", "");
    this.addIndexField.onkeydown = this.returnSubmit(this.addIndexField, this.addIndexCallback.bind(this), 4, true);
    this.controls.push(this.addIndexField);

    // Add at index button
    this.addIndexButton = addControlToAlgorithmBar("Button", "Add at Index");
    this.addIndexButton.onclick = this.addIndexCallback.bind(this);
    this.controls.push(this.addIndexButton);

    addLabelToAlgorithmBar("or")

    // Add to front button
    this.addFrontButton = addControlToAlgorithmBar("Button", "Add to Front");
    this.addFrontButton.onclick = this.addFrontCallback.bind(this);
    this.controls.push(this.addFrontButton);

    // Add to back button
    this.addBackButton = addControlToAlgorithmBar("Button", "Add to Back");
    this.addBackButton.onclick = this.addBackCallback.bind(this);
    this.controls.push(this.addBackButton);

    // Remove's index text field
    this.removeField = addControlToAlgorithmBar("Text", "");
    this.removeField.onkeydown = this.returnSubmit(this.removeField, this.removeIndexCallback.bind(this), 4, true);
    this.controls.push(this.removeField);

    // Remove from index button
    this.removeIndexButton = addControlToAlgorithmBar("Button", "Remove from Index");
    this.removeIndexButton.onclick = this.removeIndexCallback.bind(this);
    this.controls.push(this.removeIndexButton);

    addLabelToAlgorithmBar("or")

    // Remove from front button
    this.removeFrontButton = addControlToAlgorithmBar("Button", "Remove from Front");
    this.removeFrontButton.onclick = this.removeFrontCallback.bind(this);
    this.controls.push(this.removeFrontButton);

    // Remove from back button
    this.removeBackButton = addControlToAlgorithmBar("Button", "Remove from Back");
    this.removeBackButton.onclick = this.removeBackCallback.bind(this);
    this.controls.push(this.removeBackButton);

    // Get's index text field
    // this.getField = addControlToAlgorithmBar("Text", "");
    // this.getField.onkeydown = this.returnSubmit(this.getField, this.getCallback.bind(this), 4, true);
    // this.controls.push(this.getField);

    // Get button
    // this.getButton = addControlToAlgorithmBar("Button", "Get");
    // this.getButton.onclick = this.getCallback.bind(this);
    // this.controls.push(this.getButton);

    // Clear button
    this.clearButton = addControlToAlgorithmBar("Button", "Clear");
    this.clearButton.onclick = this.clearCallback.bind(this);
    this.controls.push(this.clearButton);
}

DoublyLinkedList.prototype.enableUI = function(event)
{
    for (var i = 0; i < this.controls.length; i++)
    {
        this.controls[i].disabled = false;
    }
}

DoublyLinkedList.prototype.disableUI = function(event)
{
    for (var i = 0; i < this.controls.length; i++)
    {
        this.controls[i].disabled = true;
    }
}


DoublyLinkedList.prototype.setup = function()
{
    this.linkedListElemID = new Array(SIZE);

    this.arrayData = new Array(SIZE);
    this.size = 0;
    this.leftoverLabelID = this.nextIndex++;

    this.cmd("CreateLabel", this.leftoverLabelID, "", PUSH_LABEL_X, PUSH_LABEL_Y);

    this.animationManager.StartNewAnimation(this.commands);
    this.animationManager.skipForward();
    this.animationManager.clearHistory();
}

DoublyLinkedList.prototype.reset = function()
{
    this.size = 0;
    this.nextIndex = this.initialIndex;
}

DoublyLinkedList.prototype.addIndexCallback = function(event)
{
    if (this.addValueField.value != "" && this.addIndexField.value != "")
    {
        var addVal = this.addValueField.value;
        var index = this.addIndexField.value;
        if (index >= 0 && index <= this.size)
        {
            this.addValueField.value = ""
            this.addIndexField.value = ""
            this.implementAction(this.add.bind(this), addVal + "," + index);
        }
    }
}

DoublyLinkedList.prototype.addFrontCallback = function(event)
{
    if (this.addValueField.value != "")
    {
        var addVal = this.addValueField.value;
        this.addValueField.value = ""
        this.implementAction(this.add.bind(this), addVal + "," + 0);
    }
}

DoublyLinkedList.prototype.addBackCallback = function(event)
{
    if (this.addValueField.value != "")
    {
        var addVal = this.addValueField.value;
        this.addValueField.value = ""
        this.implementAction(this.add.bind(this), addVal + "," + this.size);
    }
}

DoublyLinkedList.prototype.removeIndexCallback = function(event)
{
    if (this.removeField.value != "")
    {
        var index = this.removeField.value
        if (index >= 0 && index < this.size)
        {
            this.removeField.value = ""
            this.implementAction(this.remove.bind(this), index);
        }
    }
}

DoublyLinkedList.prototype.removeFrontCallback = function(event)
{
    if (this.size > 0)
    {
        this.implementAction(this.remove.bind(this), 0);
    }
}

DoublyLinkedList.prototype.removeBackCallback = function(event)
{
    if (this.size > 0)
    {
        this.implementAction(this.remove.bind(this), this.size - 1);
    }
}

// DoublyLinkedList.prototype.getCallback = function(event)
// {
//     if (this.getField.value != "" && this.getField.value > 0 && this.getField.value < this.size)
//     {
//         this.implementAction(this.get.bind(this), "");
//     }
// }

DoublyLinkedList.prototype.clearCallback = function(event)
{
    this.implementAction(this.clearAll.bind(this), "");
}



DoublyLinkedList.prototype.add = function(params)
{
    this.commands = new Array();

    var elemToAdd = parseInt(params.split(",")[0]);
    var index = parseInt(params.split(",")[1]);
    var labPushID = this.nextIndex++;
    var labPushValID = this.nextIndex++;

    for (var i = this.size - 1; i >= index; i--)
    {
        this.arrayData[i + 1] = this.arrayData[i];
        this.linkedListElemID[i + 1] = this.linkedListElemID[i];
    }
    this.arrayData[index] = elemToAdd;
    this.linkedListElemID[index] = this.nextIndex++;

    this.cmd("SetText", this.leftoverLabelID, "");

    this.cmd("CreateDoublyLinkedList", this.linkedListElemID[index], "", LINKED_LIST_ELEM_WIDTH, LINKED_LIST_ELEM_HEIGHT,
        LINKED_LIST_INSERT_X, LINKED_LIST_INSERT_Y, 0.25, 1);

    this.cmd("CreateLabel", labPushID, "Adding Value: ", PUSH_LABEL_X, PUSH_LABEL_Y);
    this.cmd("CreateLabel", labPushValID, elemToAdd, PUSH_ELEMENT_X, PUSH_ELEMENT_Y);

    this.cmd("Step");

    this.cmd("Move", labPushValID, LINKED_LIST_INSERT_X, LINKED_LIST_INSERT_Y);

    this.cmd("Step");
    this.cmd("SetText", this.linkedListElemID[index], elemToAdd);
    this.cmd("Delete", labPushValID);

    if (index == 0)
    {
        this.cmd("SetPrevNull", this.linkedListElemID[index], 1);
    }

    if (index == this.size)
    {
        this.cmd("SetNextNull", this.linkedListElemID[index], 1);
    }

    if (this.size != 0)
    {
        if (index == 0)
        {
            this.cmd("SetPrevNull", this.linkedListElemID[index + 1], 0);
            this.cmd("ConnectNext",  this.linkedListElemID[index], this.linkedListElemID[index + 1]);
            this.cmd("ConnectPrev",  this.linkedListElemID[index + 1], this.linkedListElemID[index]);
        }
        else if (index == this.size)
        {
            this.cmd("SetNextNull", this.linkedListElemID[index - 1], 0);
            this.cmd("ConnectNext",  this.linkedListElemID[index - 1], this.linkedListElemID[index]);
            this.cmd("ConnectPrev",  this.linkedListElemID[index], this.linkedListElemID[index - 1]);
        }
        else
        {
            this.cmd("Disconnect", this.linkedListElemID[index - 1], this.linkedListElemID[index + 1]);
            this.cmd("Disconnect", this.linkedListElemID[index + 1], this.linkedListElemID[index - 1]);
            this.cmd("ConnectNext",  this.linkedListElemID[index - 1], this.linkedListElemID[index]);
            this.cmd("ConnectPrev",  this.linkedListElemID[index], this.linkedListElemID[index - 1]);
            this.cmd("ConnectNext",  this.linkedListElemID[index], this.linkedListElemID[index + 1]);
            this.cmd("ConnectPrev",  this.linkedListElemID[index + 1], this.linkedListElemID[index]);
        }
    }

    this.cmd("Step");
    this.size = this.size + 1;
    this.resetNodePositions();
    this.cmd("Delete", labPushID);
    this.cmd("Step");

    return this.commands;
}

DoublyLinkedList.prototype.remove = function(index)
{
    this.commands = new Array();

    index = parseInt(index);
    var labPopID = this.nextIndex++;
    var labPopValID = this.nextIndex++;

    this.cmd("SetText", this.leftoverLabelID, "");

    var nodePosX = LINKED_LIST_START_X + LINKED_LIST_ELEM_SPACING * index;
    var nodePosY = LINKED_LIST_START_Y;
    this.cmd("CreateLabel", labPopID, "Removing Value: ", PUSH_LABEL_X, PUSH_LABEL_Y);
    this.cmd("CreateLabel", labPopValID, this.arrayData[index], nodePosX, nodePosY);
    this.cmd("Move", labPopValID,  PUSH_ELEMENT_X, PUSH_ELEMENT_Y);
    this.cmd("Step");

    if (this.size != 1)
    {
        if (index == 0)
        {
            this.cmd("Disconnect", this.linkedListElemID[index + 1], this.linkedListElemID[index]);
            this.cmd("SetPrevNull", this.linkedListElemID[index + 1], 1);
        }
        else if (index == this.size - 1)
        {
            this.cmd("Disconnect", this.linkedListElemID[index - 1], this.linkedListElemID[index]);
            this.cmd("SetNextNull", this.linkedListElemID[index - 1], 1);
        }
        else
        {
            var xPos = index % LINKED_LIST_ELEMS_PER_LINE * LINKED_LIST_ELEM_SPACING + LINKED_LIST_START_X;
            var yPos = LINKED_LIST_START_Y - LINKED_LIST_ELEM_HEIGHT * 2;
            this.cmd("Move", this.linkedListElemID[index], xPos, yPos);
            this.cmd("Step");
            this.cmd("Disconnect", this.linkedListElemID[index - 1], this.linkedListElemID[index]);
            this.cmd("Disconnect", this.linkedListElemID[index + 1], this.linkedListElemID[index]);
            this.cmd("ConnectNext", this.linkedListElemID[index - 1], this.linkedListElemID[index + 1]);
            this.cmd("ConnectPrev", this.linkedListElemID[index + 1], this.linkedListElemID[index - 1]);
        }
    }
    this.cmd("Step");
    this.cmd("Delete", this.linkedListElemID[index]);

    for (var i = index; i < this.size; i++)
    {
        this.arrayData[i] = this.arrayData[i + 1];
        this.linkedListElemID[i] = this.linkedListElemID[i + 1];
    }
    this.size = this.size - 1;
    this.resetNodePositions();

    this.cmd("Delete", labPopValID)
    this.cmd("Delete", labPopID);

    return this.commands;
}

DoublyLinkedList.prototype.resetNodePositions = function()
{
    for (var i = 0; i < this.size; i++)
    {
        var nextX = i % LINKED_LIST_ELEMS_PER_LINE * LINKED_LIST_ELEM_SPACING + LINKED_LIST_START_X;
        var nextY = Math.floor(i / LINKED_LIST_ELEMS_PER_LINE) * LINKED_LIST_LINE_SPACING + LINKED_LIST_START_Y;
        this.cmd("Move", this.linkedListElemID[i], nextX, nextY);
    }
}

DoublyLinkedList.prototype.clearAll = function()
{
    this.commands = new Array();
    for (var i = 0; i < this.size; i++)
    {
        this.cmd("Delete", this.linkedListElemID[i]);
    }
    this.size = 0;
    return this.commands;
}


var currentAlg;

function init()
{
    var animManag = initCanvas();
    currentAlg = new DoublyLinkedList(animManag, canvas.width, canvas.height);
}
