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


const ARRAY_START_X = 100;
const ARRAY_START_Y = 200;
const ARRAY_ELEM_WIDTH = 50;
const ARRAY_ELEM_HEIGHT = 50;

const ARRRAY_ELEMS_PER_LINE = 15;
const ARRAY_LINE_SPACING = 130;

const FRONT_POS_X = 180;
const FRONT_POS_Y = 100;
const FRONT_LABEL_X = 130;
const FRONT_LABEL_Y =  100;

const SIZE_POS_X = 280;
const SIZE_POS_Y = 100;
const SIZE_LABEL_X = 230;
const SIZE_LABEL_Y =  100;

const QUEUE_LABEL_X = 50;
const QUEUE_LABEL_Y = 30;
const QUEUE_ELEMENT_X = 120;
const QUEUE_ELEMENT_Y = 30;

const INDEX_COLOR = "#0000FF";

const SIZE = 15;

function DequeArray(am, w, h)
{
	this.init(am, w, h);
	
}

DequeArray.prototype = new Algorithm();
DequeArray.prototype.constructor = DequeArray;
DequeArray.superclass = Algorithm.prototype;


DequeArray.prototype.init = function(am, w, h)
{
	DequeArray.superclass.init.call(this, am, w, h);
	this.addControls();
	this.nextIndex = 0;
	this.commands = [];
	this.setup();
	this.initialIndex = this.nextIndex;
}


DequeArray.prototype.addControls =  function()
{
	this.controls = [];
	this.addField = addControlToAlgorithmBar("Text", "");
	// this.addField.onkeydown = this.returnSubmit(this.addField,  this.addLastCallback.bind(this), 6);
	this.addFirstButton = addControlToAlgorithmBar("Button", "Add First");
	this.addLastButton = addControlToAlgorithmBar("Button", "Add Last");
	this.addFirstButton.onclick = this.addFirstCallBack.bind(this);
	this.addLastButton.onclick = this.addLastCallback.bind(this);
	this.controls.push(this.addField);
	this.controls.push(this.addFirstButton);
	this.controls.push(this.addLastButton);

	this.removeFirstButton = addControlToAlgorithmBar("Button", "Remove First");
	this.removeFirstButton.onclick = this.removeFirstCallback.bind(this);
	this.controls.push(this.removeFirstButton);
	
	this.removeLastButton = addControlToAlgorithmBar("Button", "Remove Last");
	this.removeLastButton.onclick = this.removeLastCallback.bind(this);
	this.controls.push(this.removeLastButton);

	this.clearButton = addControlToAlgorithmBar("Button", "Clear Queue");
	this.clearButton.onclick = this.clearCallback.bind(this);
	this.controls.push(this.clearButton);
	
}

DequeArray.prototype.enableUI = function(event)
{
	for (var i = 0; i < this.controls.length; i++)
	{
		this.controls[i].disabled = false;
	}
	
	
}
DequeArray.prototype.disableUI = function(event)
{
	for (var i = 0; i < this.controls.length; i++)
	{
		this.controls[i].disabled = true;
	}
}


DequeArray.prototype.setup = function()
{

	this.nextIndex = 0;
	
	this.arrayID = new Array(SIZE);
	this.arrayLabelID = new Array(SIZE);
	for (var i = 0; i < SIZE; i++)
	{
		
		this.arrayID[i]= this.nextIndex++;
		this.arrayLabelID[i]= this.nextIndex++;
	}
	this.frontID = this.nextIndex++;
	frontLabelID = this.nextIndex++;
	this.sizeID = this.nextIndex++;
	sizeLabelID = this.nextIndex++;
	
	this.arrayData = new Array(SIZE);
	this.front = 0;
	this.size = 0;
	this.leftoverLabelID = this.nextIndex++;
	
	
	for (var i = 0; i < SIZE; i++)
	{
		var xpos = (i  % ARRRAY_ELEMS_PER_LINE) * ARRAY_ELEM_WIDTH + ARRAY_START_X;
		var ypos = Math.floor(i / ARRRAY_ELEMS_PER_LINE) * ARRAY_LINE_SPACING +  ARRAY_START_Y;
		this.cmd("CreateRectangle", this.arrayID[i],"", ARRAY_ELEM_WIDTH, ARRAY_ELEM_HEIGHT,xpos, ypos);
		this.cmd("CreateLabel",this.arrayLabelID[i],  i,  xpos, ypos + ARRAY_ELEM_HEIGHT);
		this.cmd("SetForegroundColor", this.arrayLabelID[i], INDEX_COLOR);
		
	}
	this.cmd("CreateLabel", frontLabelID, "Front", FRONT_LABEL_X, FRONT_LABEL_Y);
	this.cmd("CreateRectangle", this.frontID, 0, ARRAY_ELEM_WIDTH, ARRAY_ELEM_HEIGHT, FRONT_POS_X, FRONT_POS_Y);
	
	this.cmd("CreateLabel", sizeLabelID, "Size", SIZE_LABEL_X, SIZE_LABEL_Y);
	this.cmd("CreateRectangle", this.sizeID, 0, ARRAY_ELEM_WIDTH, ARRAY_ELEM_HEIGHT, SIZE_POS_X, SIZE_POS_Y);
	
	
	this.cmd("CreateLabel", this.leftoverLabelID, "", QUEUE_LABEL_X, QUEUE_LABEL_Y, false);
	

	this.initialIndex = this.nextIndex;

	this.highlight1ID = this.nextIndex++;
	this.highlight2ID = this.nextIndex++;

	this.animationManager.StartNewAnimation(this.commands);
	this.animationManager.skipForward();
	this.animationManager.clearHistory();
		
	
}
		
		
DequeArray.prototype.reset = function()
{
	this.top = 0;
	this.front = 0;
	this.size = 0;
	this.arrayData = [];
	this.nextIndex = this.initialIndex;
}
		
		
DequeArray.prototype.addLastCallback = function(event)
{
	if ((this.size + 1) % SIZE  != this.front && this.addField.value != "")
	{
		var pushVal = this.addField.value;
		this.addField.value = ""
		this.implementAction(this.addLast.bind(this), pushVal);
	}
}
		
		
DequeArray.prototype.removeFirstCallback = function(event)
{
	if (this.size != 0)
	{
		this.implementAction(this.removeFirst.bind(this), "");
	}
}

DequeArray.prototype.removeLastCallback = function(event)
{
	if (this.size != 0)
	{
		this.implementAction(this.removeLast.bind(this), "");
	}
}

DequeArray.prototype.addFirstCallBack = function(event)
{
	if ((this.front - 1 + SIZE) % SIZE != this.size && this.addField.value != "") {
		let pushVal = this.addField.value;
		this.addField.value = "";
		this.implementAction(this.addFirst.bind(this), pushVal);
	}
}
		

DequeArray.prototype.clearCallback = function(event)
{
	this.implementAction(this.clearAll.bind(this), "");
}

		

DequeArray.prototype.addLast = function(elemToaddLast)
{
	this.commands = new Array();
	
	var labaddLastID = this.nextIndex++;
	var labaddLastValID = this.nextIndex++;
	let addIndex = (this.front + this.size) % SIZE;

	this.arrayData[addIndex] = elemToaddLast;
	this.cmd("SetText", this.leftoverLabelID, "");
	
	this.cmd("CreateLabel", labaddLastID, "Enqueuing Value: ", QUEUE_LABEL_X, QUEUE_LABEL_Y);
	this.cmd("CreateLabel", labaddLastValID, elemToaddLast, QUEUE_ELEMENT_X, QUEUE_ELEMENT_Y);
	
	this.cmd("Step");			
	this.cmd("CreateHighlightCircle", this.highlight1ID, INDEX_COLOR,  SIZE_POS_X, SIZE_POS_Y);
	this.cmd("Step");
	
	var xpos = (addIndex  % ARRRAY_ELEMS_PER_LINE) * ARRAY_ELEM_WIDTH + ARRAY_START_X;
	var ypos = Math.floor(addIndex / ARRRAY_ELEMS_PER_LINE) * ARRAY_LINE_SPACING +  ARRAY_START_Y;
	
	this.cmd("Move", this.highlight1ID, xpos, ypos + ARRAY_ELEM_HEIGHT); 				
	this.cmd("Step");
	
	this.cmd("Move", labaddLastValID, xpos, ypos);
	this.cmd("Step");
	
	this.cmd("SetText", this.arrayID[addIndex], elemToaddLast);
	this.cmd("Delete", labaddLastValID);
	
	this.cmd("Delete", this.highlight1ID);
	
	this.cmd("SetHighlight", this.sizeID, 1);
	this.cmd("Step");
	this.size = this.size + 1;
	this.cmd("SetText", this.sizeID, this.size);
	this.cmd("Step");
	this.cmd("SetHighlight", this.sizeID, 0);
	this.cmd("Delete", labaddLastID);
	
	return this.commands;
}

DequeArray.prototype.addFirst = function(elemToAdd) {
	this.commands = new Array();


	const labelAddID = this.nextIndex++;

	const addIndex = (this.front - 1 + SIZE) % SIZE;
	
	const xpos = (addIndex  % ARRRAY_ELEMS_PER_LINE) * ARRAY_ELEM_WIDTH + ARRAY_START_X;
	const ypos = Math.floor(addIndex / ARRRAY_ELEMS_PER_LINE) * ARRAY_LINE_SPACING +  ARRAY_START_Y;
	
	this.arrayData[addIndex] = elemToAdd;

	this.cmd("CreateLabel", labelAddID, elemToAdd, QUEUE_ELEMENT_X, QUEUE_ELEMENT_Y);

	this.cmd("SetText", this.leftoverLabelID, "");
	this.cmd("SetPosition", this.leftoverLabelID, QUEUE_LABEL_X + 100, QUEUE_LABEL_Y);
	
	this.cmd("Step");			
	this.cmd("CreateHighlightCircle", this.highlight1ID, INDEX_COLOR,  FRONT_POS_X, FRONT_POS_Y);
	this.cmd("Step");
	this.cmd("SetText", this.leftoverLabelID, `Adding ${elemToAdd} at index (${this.front} - 1) % ${SIZE}`);

	this.cmd("Step");
	this.cmd("Move", this.highlight1ID, this.front * ARRAY_ELEM_WIDTH + ARRAY_START_X, ypos + ARRAY_ELEM_HEIGHT);
	this.cmd("Step");
	this.cmd("Move", this.highlight1ID, xpos, ypos + ARRAY_ELEM_HEIGHT);
	this.cmd("Step");
	this.cmd("Move", labelAddID, xpos, ypos);
	this.cmd("Step");
	
	this.cmd("SetText", this.arrayID[addIndex], elemToAdd);
	this.cmd("Step");
	this.cmd("SetHighlight", this.frontID, 1);
	this.cmd("Step");
	this.cmd("SetText", this.frontID, addIndex);
	this.cmd("Step");
	this.cmd("SetHighlight", this.frontID, 0);

	this.cmd("Step");
	this.cmd("SetHighlight", this.sizeID, 1);
	this.cmd("Step");
	this.cmd("SetText", this.sizeID, this.size + 1);
	this.cmd("Step");
	this.cmd("SetHighlight", this.sizeID, 0);

	this.cmd("Step");

	this.cmd("Delete", labelAddID);
	this.cmd("Delete", this.highlight1ID);
	this.cmd("SetText", this.leftoverLabelID, "");
	this.front = addIndex;
	this.size++;
	return this.commands;
}

DequeArray.prototype.removeFirst = function()
{
	this.commands = new Array();
	
	const labremoveFirstID = this.nextIndex++;
	const labremoveFirstValID = this.nextIndex++;
	
	this.cmd("SetText", this.leftoverLabelID, "");
	
	
	this.cmd("CreateLabel", labremoveFirstID, "removeFirstd Value: ", QUEUE_LABEL_X, QUEUE_LABEL_Y);
	
	this.cmd("CreateHighlightCircle", this.highlight1ID, INDEX_COLOR,  FRONT_POS_X, FRONT_POS_Y);
	this.cmd("Step");
	
	const xpos = (this.front  % ARRRAY_ELEMS_PER_LINE) * ARRAY_ELEM_WIDTH + ARRAY_START_X;
	const ypos = Math.floor(this.front / ARRRAY_ELEMS_PER_LINE) * ARRAY_LINE_SPACING +  ARRAY_START_Y;
	
	this.cmd("Move", this.highlight1ID, xpos, ypos + ARRAY_ELEM_HEIGHT);
	this.cmd("Step");		
	
	this.cmd("Delete", this.highlight1ID);
	
	
	const removeFirstdVal = this.arrayData[this.front]
	this.cmd("CreateLabel", labremoveFirstValID,removeFirstdVal, xpos, ypos);
	this.cmd("Settext", this.arrayID[this.front], "");
	this.cmd("Move", labremoveFirstValID,  QUEUE_ELEMENT_X, QUEUE_ELEMENT_Y);
	this.cmd("Step");
	
	this.cmd("SetHighlight", this.frontID, 1);
	this.cmd("Step");
	this.front = (this.front + 1 ) % SIZE;
	this.cmd("SetText", this.frontID, this.front)
	this.cmd("Step");
	this.cmd("SetHighlight", this.frontID, 0);
	
	this.cmd("SetText", this.leftoverLabelID, "removeFirstd Value: " + removeFirstdVal);
	

	this.cmd("Delete", labremoveFirstID)
	this.cmd("Delete", labremoveFirstValID);
	this.cmd("Step");

	this.cmd("SetHighlight", this.sizeID, 1);
	this.cmd("Step");
	this.size--;
	this.cmd("SetText", this.sizeID, this.size);
	
	this.cmd("Step");
	this.cmd("SetHighlight", this.sizeID, 0);
	this.cmd("Step");
	this.cmd("SetText", this.leftoverLabelID, "");
	
	this.adjustIfEmpty();
	
	return this.commands;
}

DequeArray.prototype.removeLast = function()
{
	this.commands = new Array();
	const remLabelID = this.nextIndex++;
	const remLabelValID = this.nextIndex++;

	const remIndex = (this.front + this.size - 1 + SIZE) % SIZE;
	
	this.cmd("SetText", this.leftoverLabelID, "");
	
	this.cmd("CreateLabel", remLabelID, "Removed Value: ", QUEUE_LABEL_X, QUEUE_LABEL_Y);
	
	this.cmd("CreateHighlightCircle", this.highlight1ID, INDEX_COLOR, FRONT_POS_X, FRONT_POS_Y);
	this.cmd("CreateHighlightCircle", this.highlight2ID, INDEX_COLOR, SIZE_POS_X, SIZE_POS_Y);

	this.cmd("Step");
	
	const xpos = (remIndex  % ARRRAY_ELEMS_PER_LINE) * ARRAY_ELEM_WIDTH + ARRAY_START_X;
	const ypos = Math.floor(remIndex / ARRRAY_ELEMS_PER_LINE) * ARRAY_LINE_SPACING +  ARRAY_START_Y;
	
	this.cmd("Move", this.highlight1ID, xpos, ypos + ARRAY_ELEM_HEIGHT);
	this.cmd("Move", this.highlight2ID, xpos, ypos + ARRAY_ELEM_HEIGHT);

	this.cmd("Step");		
	
	this.cmd("Delete", this.highlight1ID);
	this.cmd("Delete", this.highlight2ID);
	
	const removedVal = this.arrayData[remIndex];
	this.cmd("CreateLabel", remLabelValID, removedVal, xpos, ypos);
	this.cmd("Settext", this.arrayID[remIndex], "");
	this.cmd("Move", remLabelValID, QUEUE_ELEMENT_X, QUEUE_ELEMENT_Y);
	this.cmd("Step");
		
	this.cmd("SetText", this.leftoverLabelID, "Removed Value: " + removedVal);
	

	this.cmd("Delete", remLabelID)
	this.cmd("Delete", remLabelValID);
	this.cmd("Step");

	this.cmd("SetHighlight", this.sizeID, 1);
	this.cmd("Step");
	this.cmd("SetText", this.sizeID, this.size - 1);
	this.cmd("Step");
	this.cmd("SetHighlight", this.sizeID, 0);
	this.cmd("Step");

	this.cmd("SetText", this.leftoverLabelID, "");

	this.size--;

	this.adjustIfEmpty();

	return this.commands;
}

DequeArray.prototype.adjustIfEmpty = function() {
	if (this.size === 0) {
		this.cmd("SetText", this.leftoverLabelID, "size = 0, set front to 0");
		this.front = 0;

		this.cmd("Step");
		this.cmd("SetHighlight", this.frontID, 1);
		this.cmd("Step");
		this.cmd("SetText", this.frontID, 0);
		this.cmd("Step");
		this.cmd("SetHighlight", this.frontID, 0);
		this.cmd("SetText", this.leftoverLabelID, "");
	}
}


DequeArray.prototype.clearAll = function()
{
	this.commands = new Array();
	this.cmd("SetText", this.leftoverLabelID, "");
	
	for (var i = 0; i < SIZE; i++)
	{
		this.cmd("SetText", this.arrayID[i], "");
	}
	this.front = 0;
	this.size = 0;
	this.cmd("SetText", this.frontID, "0");
	this.cmd("SetText", this.sizeID, "0");
	return this.commands;
	
}


var currentAlg;

function init()
{
	var animManag = initCanvas();
	currentAlg = new DequeArray(animManag, canvas.width, canvas.height);
}
