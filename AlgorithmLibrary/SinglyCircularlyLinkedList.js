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
var LINKED_LIST_ELEM_WIDTH = 70;
var LINKED_LIST_ELEM_HEIGHT = 30;


var LINKED_LIST_INSERT_X = 200;
var LINKED_LIST_INSERT_Y = 50;

var LINKED_LIST_ELEMS_PER_LINE = 8;
var LINKED_LIST_ELEM_SPACING = 100;
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

function CircularlySinglyLinkedList(am, w, h)
{
    this.init(am, w, h);
}

CircularlySinglyLinkedList.prototype = new Algorithm();
CircularlySinglyLinkedList.prototype.constructor = CircularlySinglyLinkedList;
CircularlySinglyLinkedList.superclass = Algorithm.prototype;

CircularlySinglyLinkedList.prototype.init = function(am, w, h)
{
    // Call the unit function of our "superclass", which adds a couple of
    // listeners, and sets up the undo stack
    CircularlySinglyLinkedList.superclass.init.call(this, am, w, h);

    this.addControls();

    // Useful for memory management
    this.nextIndex = 0;

    this.setup();

    this.initialIndex = this.nextIndex;
}


CircularlySinglyLinkedList.prototype.addControls =  function()
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
    this.getField = addControlToAlgorithmBar("Text", "");
    this.getField.onkeydown = this.returnSubmit(this.getField, this.getCallback.bind(this), 4, true);
    this.controls.push(this.getField);

    // Get button
    this.getButton = addControlToAlgorithmBar("Button", "Get");
    this.getButton.onclick = this.getCallback.bind(this);
    this.controls.push(this.getButton);

    // Clear button
    this.clearButton = addControlToAlgorithmBar("Button", "Clear");
    this.clearButton.onclick = this.clearCallback.bind(this);
    this.controls.push(this.clearButton);
}

CircularlySinglyLinkedList.prototype.enableUI = function(event)
{
    for (var i = 0; i < this.controls.length; i++)
    {
        this.controls[i].disabled = false;
    }
}

CircularlySinglyLinkedList.prototype.disableUI = function(event)
{
    for (var i = 0; i < this.controls.length; i++)
    {
        this.controls[i].disabled = true;
    }
}


CircularlySinglyLinkedList.prototype.setup = function()
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

CircularlySinglyLinkedList.prototype.reset = function()
{
    this.size = 0;
    this.nextIndex = this.initialIndex;
}

CircularlySinglyLinkedList.prototype.addIndexCallback = function(event)
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

CircularlySinglyLinkedList.prototype.addFrontCallback = function(event)
{
    if (this.addValueField.value != "")
    {
        var addVal = this.addValueField.value;
        this.addValueField.value = ""
        this.implementAction(this.add.bind(this), addVal + "," + 0);
    }
}

CircularlySinglyLinkedList.prototype.addBackCallback = function(event)
{
    if (this.addValueField.value != "")
    {
        var addVal = this.addValueField.value;
        this.addValueField.value = ""
        this.implementAction(this.add.bind(this), addVal + "," + this.size);
    }
}

CircularlySinglyLinkedList.prototype.removeIndexCallback = function(event)
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

CircularlySinglyLinkedList.prototype.removeFrontCallback = function(event)
{
    if (this.size > 0)
    {
        this.implementAction(this.remove.bind(this), 0);
    }
}

CircularlySinglyLinkedList.prototype.removeBackCallback = function(event)
{
    if (this.size > 0)
    {
        this.implementAction(this.remove.bind(this), this.size - 1);
    }
}

CircularlySinglyLinkedList.prototype.getCallback = function(event)
{
    if (this.getField.value != "" && this.getField.value > 0 && this.getField.value < this.size)
    {
        this.implementAction(this.get.bind(this), "");
    }
}

CircularlySinglyLinkedList.prototype.clearCallback = function(event)
{
    this.implementAction(this.clearAll.bind(this), "");
}



CircularlySinglyLinkedList.prototype.add = function(params)
{
    this.commands = new Array();

    var elemToAdd = parseInt(params.split(",")[0]);
    var index = parseInt(params.split(",")[1]);
    var labPushID = this.nextIndex++;
    var labPushValID = this.nextIndex++;

    // Order of data should behave as normal
    for (var i = this.size - 1; i >= index; i--)
    {
        this.arrayData[i + 1] = this.arrayData[i];
    }
    this.arrayData[index] = elemToAdd;

    // Adding to the front or back using O(1) trick, so new node will be added to index 1
    if(this.size != 0 && (index == 0 || index == this.size))
    {
        // Move over all node IDs but the first
        for (var i = this.size - 1; i >= 1; i--)
        {
            this.linkedListElemID[i + 1] = this.linkedListElemID[i];
        }
        // Place new node's ID at index 1
        this.linkedListElemID[1] = this.nextIndex++;
    }
    // Adding first node or to the middle, so new node will be placed normally
    else
    {
        for (var i = this.size - 1; i >= index; i--)
        {
            this.linkedListElemID[i + 1] = this.linkedListElemID[i];
        }
        this.linkedListElemID[index] = this.nextIndex++;
    }

    this.cmd("SetText", this.leftoverLabelID, "");

    if(this.size != 0 && (index == 0 || index == this.size))
    {
        this.cmd("CreateCircularlyLinkedList", this.linkedListElemID[1], "", LINKED_LIST_ELEM_WIDTH, LINKED_LIST_ELEM_HEIGHT,
            LINKED_LIST_INSERT_X, LINKED_LIST_INSERT_Y, 0.25, 1);
    }
    else
    {
        this.cmd("CreateCircularlyLinkedList", this.linkedListElemID[index], "", LINKED_LIST_ELEM_WIDTH, LINKED_LIST_ELEM_HEIGHT,
            LINKED_LIST_INSERT_X, LINKED_LIST_INSERT_Y, 0.25, 1);
    }
    this.cmd("CreateLabel", labPushID, "Adding Value: ", PUSH_LABEL_X, PUSH_LABEL_Y);
    this.cmd("CreateLabel", labPushValID, elemToAdd, PUSH_ELEMENT_X, PUSH_ELEMENT_Y);
    this.cmd("Step");

    if (this.size == 0)
    {
        this.cmd("Move", labPushValID, LINKED_LIST_INSERT_X, LINKED_LIST_INSERT_Y);
        this.cmd("Step");

        this.cmd("SetText", this.linkedListElemID[0], elemToAdd);
        this.cmd("Delete", labPushValID);
        this.cmd("ConnectCurve",  this.linkedListElemID[0], this.linkedListElemID[0], -0.5);
        this.cmd("Step");

        this.size = this.size + 1;
        this.resetNodePositions();
    }
    else
    {
        if (index == 0 || index == this.size)
        {
            // Move label from first node to new node
            var labCopiedValID = this.nextIndex++;
            var copiedData = index == 0 ? this.arrayData[1] : this.arrayData[0];
            this.cmd("CreateLabel", labCopiedValID, copiedData, LINKED_LIST_START_X, LINKED_LIST_START_Y);
            this.cmd("Move", labCopiedValID, LINKED_LIST_INSERT_X, LINKED_LIST_INSERT_Y);
            this.cmd("Step");

            this.cmd("SetText", this.linkedListElemID[1], copiedData);
            this.cmd("Delete", labCopiedValID);
            this.cmd("Step");

            // Move label for new data to the first node
            this.cmd("Move", labPushValID, LINKED_LIST_START_X, LINKED_LIST_START_Y);
            this.cmd("Step");

            this.cmd("SetText", this.linkedListElemID[0], elemToAdd);
            this.cmd("Delete", labPushValID);
            this.cmd("Step");

            // Change pointers
            if (this.size == 1)
            {
                // Case where we're adding the second node
                this.cmd("Disconnect",  this.linkedListElemID[0], this.linkedListElemID[0]); // Disconnect head node from itself
                this.cmd("Connect",  this.linkedListElemID[0], this.linkedListElemID[1]); // Connect head node to new node
                this.cmd("ConnectCurve",  this.linkedListElemID[1], this.linkedListElemID[0], -0.5); // Connect new node to head node
            }
            else
            {
                // Other cases
                this.cmd("Disconnect",  this.linkedListElemID[0], this.linkedListElemID[2]); // Disconnect head from old second node
                this.cmd("Connect",  this.linkedListElemID[0], this.linkedListElemID[1]); // Connect head node to new node
                this.cmd("Connect",  this.linkedListElemID[1], this.linkedListElemID[2]); // Connect new node to old second node
            }
            this.cmd("Step");

            this.size = this.size + 1;
            this.resetNodePositions();
            this.cmd("Step");

            // If adding to the back, "move head over" (rotate elements backwards)
            if(index == this.size - 1) // We increment size above, so subtract one to check if adding to back
            {
                var firstNodeID = this.linkedListElemID[0];
                for(var i = 0; i < this.size - 1; i++)
                {
                    this.linkedListElemID[i] = this.linkedListElemID[i + 1];
                }
                this.linkedListElemID[this.size - 1] = firstNodeID;

                var lastX = (this.size - 1) % LINKED_LIST_ELEMS_PER_LINE * LINKED_LIST_ELEM_SPACING + LINKED_LIST_START_X;
                var lastY = Math.floor((this.size - 1) / LINKED_LIST_ELEMS_PER_LINE) * LINKED_LIST_LINE_SPACING + LINKED_LIST_START_Y;
                this.cmd("Move", this.linkedListElemID[i], (LINKED_LIST_START_X + lastX) / 2, lastY + LINKED_LIST_ELEM_HEIGHT * 3);
                this.cmd("Step");

                for (var i = 0; i < this.size - 1; i++)
                {
                    var nextX = i % LINKED_LIST_ELEMS_PER_LINE * LINKED_LIST_ELEM_SPACING + LINKED_LIST_START_X;
                    var nextY = Math.floor(i / LINKED_LIST_ELEMS_PER_LINE) * LINKED_LIST_LINE_SPACING + LINKED_LIST_START_Y;
                    this.cmd("Move", this.linkedListElemID[i], nextX, nextY);
                }

                this.cmd("Disconnect",  this.linkedListElemID[this.size - 2], this.linkedListElemID[this.size - 1]); // Disconnect curved pointer
                this.cmd("Connect",  this.linkedListElemID[this.size - 2], this.linkedListElemID[this.size - 1]); // Connect with normal pointer
                this.cmd("Disconnect",  this.linkedListElemID[this.size - 1], this.linkedListElemID[0]); // Disconnect normal pointer
                this.cmd("ConnectCurve",  this.linkedListElemID[this.size - 1], this.linkedListElemID[0], -0.5); // Connect with curved pointer
                this.cmd("Move", this.linkedListElemID[i], lastX, lastY);
                this.cmd("Step");
            }
        }
        else
        {
            this.cmd("Move", labPushValID, LINKED_LIST_INSERT_X, LINKED_LIST_INSERT_Y);
            this.cmd("Step");

            this.cmd("SetText", this.linkedListElemID[index], elemToAdd);
            this.cmd("Delete", labPushValID);
            this.cmd("Step");

            this.cmd("Disconnect", this.linkedListElemID[index - 1], this.linkedListElemID[index + 1]);
            this.cmd("Connect",  this.linkedListElemID[index - 1], this.linkedListElemID[index]);
            this.cmd("Connect",  this.linkedListElemID[index], this.linkedListElemID[index + 1]);

            this.size = this.size + 1;
            this.resetNodePositions();
        }
    }

    this.cmd("Delete", labPushID);
    this.cmd("Step");

    return this.commands;
}

CircularlySinglyLinkedList.prototype.remove = function(index)
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
            // O(1) remove from front trick
            var labCopiedValID = this.nextIndex++;
            var secondNodeX = LINKED_LIST_START_X + LINKED_LIST_ELEM_SPACING;
            var secondNodeY = LINKED_LIST_START_Y;
            this.cmd("CreateLabel", labCopiedValID, this.arrayData[1], secondNodeX, secondNodeY);
            this.cmd("Move", labCopiedValID, LINKED_LIST_START_X, LINKED_LIST_START_Y);
            this.cmd("Step");

            this.cmd("SetText", this.linkedListElemID[0], this.arrayData[1]);
            this.cmd("Delete", labCopiedValID);
            this.cmd("Step");

            this.cmd("Move", this.linkedListElemID[1], secondNodeX, secondNodeY - LINKED_LIST_ELEM_HEIGHT * 2);
            this.cmd("Step");

            this.cmd("Disconnect", this.linkedListElemID[0], this.linkedListElemID[1]);
            if (this.size == 2)
            {
                // Only one node will remain, connect it to itself
                this.cmd("ConnectCurve", this.linkedListElemID[0], this.linkedListElemID[0], -0.5);
            }
            else
            {
                // Normal remove
                this.cmd("Connect", this.linkedListElemID[0], this.linkedListElemID[2]);
            }
        }
        else if (index == this.size - 1)
        {
            this.cmd("Disconnect", this.linkedListElemID[index - 1], this.linkedListElemID[index]);
            if (this.size == 2)
            {
                // Only one node will remain, connect it to itself
                this.cmd("ConnectCurve", this.linkedListElemID[0], this.linkedListElemID[0], -0.5);
            }
            else
            {
                // Normal remove
                this.cmd("ConnectCurve", this.linkedListElemID[index - 1], this.linkedListElemID[0], -0.5);
            }
        }
        else
        {
            var xPos = index % LINKED_LIST_ELEMS_PER_LINE * LINKED_LIST_ELEM_SPACING + LINKED_LIST_START_X;
            var yPos = LINKED_LIST_START_Y - LINKED_LIST_ELEM_HEIGHT * 2;
            this.cmd("Move", this.linkedListElemID[index], xPos, yPos);
            this.cmd("Step");

            this.cmd("Disconnect", this.linkedListElemID[index - 1], this.linkedListElemID[index]);
            this.cmd("Connect", this.linkedListElemID[index - 1], this.linkedListElemID[index + 1]);
        }
    }
    this.cmd("Step");

    if(index == 0)
    {
        this.cmd("Delete", this.linkedListElemID[1]);
        for (var i = 1; i < this.size; i++)
        {
            this.linkedListElemID[i] = this.linkedListElemID[i + 1];
        }
    }
    else
    {
        this.cmd("Delete", this.linkedListElemID[index]);
        for (var i = index; i < this.size; i++)
        {
            this.linkedListElemID[i] = this.linkedListElemID[i + 1];
        }
    }

    for (var i = index; i < this.size; i++)
    {
        this.arrayData[i] = this.arrayData[i + 1];
    }
    this.size = this.size - 1;
    this.resetNodePositions();

    this.cmd("Delete", labPopValID)
    this.cmd("Delete", labPopID);
    this.cmd("SetText", this.leftoverLabelID, "Removed Value: " + this.arrayData[index]);
    this.cmd("Step");

    return this.commands;
}

CircularlySinglyLinkedList.prototype.resetNodePositions = function()
{
    for (var i = 0; i < this.size; i++)
    {
        var nextX = i % LINKED_LIST_ELEMS_PER_LINE * LINKED_LIST_ELEM_SPACING + LINKED_LIST_START_X;
        var nextY = Math.floor(i / LINKED_LIST_ELEMS_PER_LINE) * LINKED_LIST_LINE_SPACING + LINKED_LIST_START_Y;
        this.cmd("Move", this.linkedListElemID[i], nextX, nextY);
    }
}

CircularlySinglyLinkedList.prototype.clearAll = function()
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
    currentAlg = new CircularlySinglyLinkedList(animManag, canvas.width, canvas.height);
}
