// Copyright 2015 David Galles, University of San Francisco. All rights reserved.
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

Search.CODE_START_X = 10;
Search.CODE_START_Y = 10;
Search.CODE_LINE_HEIGHT = 14;


Search.CODE_HIGHLIGHT_COLOR = "#FF0000";
Search.CODE_STANDARD_COLOR = "#000000";

var SMALL_SIZE = 0;
var LARGE_SIZE = 1;

var EXTRA_FIELD_WIDTH = 50;
var EXTRA_FIELD_HEIGHT = 50;

var SEARCH_FOR_X = 450;  
var SEARCH_FOR_Y = 30;


var RESULT_X = 550;  
var RESULT_Y = 30;


var INDEX_X = 450;  
var INDEX_Y = 130;


var HIGHLIGHT_CIRCLE_SIZE_SMALL = 20;
var HIGHLIGHT_CIRCLE_SIZE_LARGE = 10;
var HIGHLIGHT_CIRCLE_SIZE = HIGHLIGHT_CIRCLE_SIZE_SMALL;


var LOW_CIRCLE_COLOR = "#1010FF";
var LOW_BACKGROUND_COLOR = "#F0F0FF";
var MID_CIRCLE_COLOR = "#118C4E";
var MID_BACKGROUND_COLOR = "#F0FFF0";
var HIGH_CIRCLE_COLOR = "#FF9009";
var HIGH_BACKGROUND_COLOR = "#FFFFF0";

var LOW_POS_X = 350;
var LOW_POS_Y = 130;


var MID_POS_X = 450;
var MID_POS_Y = 130;

var HIGH_POS_X = 550;
var HIGH_POS_Y = 130;



var ARRAY_START_X_SMALL = 100;
var ARRAY_START_X_LARGE = 100;
var ARRAY_START_X = ARRAY_START_X_SMALL;
var ARRAY_START_Y_SMALL = 240;
var ARRAY_START_Y_LARGE = 200;
var ARRAY_START_Y = ARRAY_START_Y_SMALL;
var ARRAY_ELEM_WIDTH_SMALL = 50;
var ARRAY_ELEM_WIDTH_LARGE = 25;
var ARRAY_ELEM_WIDTH = ARRAY_ELEM_WIDTH_SMALL;

var ARRAY_ELEM_HEIGHT_SMALL = 50;
var ARRAY_ELEM_HEIGHT_LARGE = 20;
var ARRAY_ELEM_HEIGHT = ARRAY_ELEM_HEIGHT_SMALL;

var ARRAY_ELEMS_PER_LINE_SMALL = 16;
var ARRAY_ELEMS_PER_LINE_LARGE = 30;
var ARRAY_ELEMS_PER_LINE = ARRAY_ELEMS_PER_LINE_SMALL;


var ARRAY_LINE_SPACING_LARGE = 40;
var ARRAY_LINE_SPACING_SMALL = 130;
var ARRAY_LINE_SPACING = ARRAY_LINE_SPACING_SMALL;

var SIZE_SMALL = 32;
var SIZE_LARGE = 180;
var SIZE = SIZE_SMALL;

function Search(am, w, h)
{
    this.init(am, w, h);
    
}

Search.prototype = new Algorithm();
Search.prototype.constructor = Search;
Search.superclass = Algorithm.prototype;


Search.LINEAR_CODE = [ ["def ", "linearSearch(listData, value)"],
                       ["    index = 0"],
                       ["    while (","index < len(listData)", " and ", "listData[index] < value","):"],
                       ["        index++;"],
                       ["    if (", "index >= len(listData", " or ", "listData[index] != value", "):"],
                       ["        return -1"],
                       ["    return index"]];
Search.BINARY_CODE = [ ["def ", "binarySearch(listData, value)"],
                       ["    low = 0"],
                       ["    high = len(listData) - 1"],
                       ["    while (","low <= high",")"],
                       ["        mid = (low + high) / 2"] ,
                       ["        if (","listData[mid] == value","):"], 
                       ["            return mid"], 
                       ["        elif (","listData[mid] < value",")"], 
                       ["            low = mid + 1"],
                       ["        else:"],
                       ["            high = mid - 1"],
                       ["    return -1"]]



Search.prototype.init = function(am, w, h)
{
    Search.superclass.init.call(this, am, w, h);
    this.addControls();
    this.nextIndex = 0;
    this.commands = [];
    this.setup();
    this.initialIndex = this.nextIndex;
}


Search.prototype.addControls =  function()
{
    this.controls = [];
    this.searchField = addControlToAlgorithmBar("Text", "");
    this.searchField.onkeydown = this.returnSubmit(this.searchField,  null,  6, true);
    this.linearSearchButton = addControlToAlgorithmBar("Button", "Linear Search");
    this.linearSearchButton.onclick = this.linearSearchCallback.bind(this);
    this.controls.push(this.searchField);
    this.controls.push(this.linearSearchButton);


    this.binarySearchButton = addControlToAlgorithmBar("Button", "Binary Search");
    this.binarySearchButton.onclick = this.binarySearchCallback.bind(this);
    this.controls.push(this.binarySearchButton);
    

	var radioButtonList = addRadioButtonGroupToAlgorithmBar(["Small", "Large"], "List Size");
	this.smallListButton = radioButtonList[0];
	this.smallListButton.onclick = this.smallListCallback.bind(this);
	this.largeListButton = radioButtonList[1];
	this.largeListButton.onclick = this.largeListCallback.bind(this);
	this.smallListButton.checked = true;
    
}



Search.prototype.smallListCallback = function (event)
{
	if (this.size != SMALL_SIZE)
	{
		this.animationManager.resetAll();
		this.setup_small();		
	}
}


Search.prototype.largeListCallback = function (event)
{
	if (this.size != LARGE_SIZE)
	{
		this.animationManager.resetAll();
		this.setup_large();		
	}
}



Search.prototype.enableUI = function(event)
{
    for (var i = 0; i < this.controls.length; i++)
    {
	this.controls[i].disabled = false;
    }
    
    
}
Search.prototype.disableUI = function(event)
{
    for (var i = 0; i < this.controls.length; i++)
    {
	this.controls[i].disabled = true;
    }
}



Search.prototype.getIndexX = function(index) {
    var xpos = (index  % ARRAY_ELEMS_PER_LINE) * ARRAY_ELEM_WIDTH + ARRAY_START_X;
    return xpos;
}


Search.prototype.getIndexY = function(index) {
    if (index == -1) {
       index = 0;
    }
    var ypos = Math.floor(index / ARRAY_ELEMS_PER_LINE) * ARRAY_LINE_SPACING +  ARRAY_START_Y +  ARRAY_ELEM_HEIGHT;
     return ypos;
}

Search.prototype.setup = function()
{
    this.nextIndex = 0;

    this.values = new Array(SIZE);
    this.arrayData = new Array(SIZE);
    this.arrayID = new Array(SIZE);
    this.arrayLabelID = new Array(SIZE);
    for (var i = 0; i < SIZE; i++)
    {
	this.arrayData[i] = Math.floor(1+Math.random()*999);
	this.arrayID[i]= this.nextIndex++;
	this.arrayLabelID[i]= this.nextIndex++;
    }

    for (var i = 1; i < SIZE; i++) {
        var nxt = this.arrayData[i];
        var j = i
        while (j > 0 && this.arrayData[j-1] > nxt) {
            this.arrayData[j] = this.arrayData[j-1];
            j  = j - 1;
        }
        this.arrayData[j] = nxt;
    }

    this.leftoverLabelID = this.nextIndex++;
    this.commands = new Array();

    
    for (var i = 0; i < SIZE; i++)
    {
	var xLabelpos = this.getIndexX(i);
	var yLabelpos = this.getIndexY(i);
	this.cmd("CreateRectangle", this.arrayID[i],this.arrayData[i], ARRAY_ELEM_WIDTH, ARRAY_ELEM_HEIGHT,xLabelpos, yLabelpos - ARRAY_ELEM_HEIGHT);
	this.cmd("CreateLabel",this.arrayLabelID[i],  i,  xLabelpos, yLabelpos);
	this.cmd("SetForegroundColor", this.arrayLabelID[i], "#0000FF");
	
    }

    this.movingLabelID = this.nextIndex++;
    this.cmd("CreateLabel",this.movingLabelID,  "", 0, 0);

   //	this.cmd("CreateLabel", this.leftoverLabelID, "", PUSH_LABEL_X, PUSH_LABEL_Y);


    this.searchForBoxID = this.nextIndex++;
    this.searchForBoxLabel = this.nextIndex++;
    this.cmd("CreateRectangle",  this.searchForBoxID, "", EXTRA_FIELD_WIDTH, EXTRA_FIELD_HEIGHT,SEARCH_FOR_X, SEARCH_FOR_Y);
    this.cmd("CreateLabel",  this.searchForBoxLabel,  "Seaching For  ", SEARCH_FOR_X, SEARCH_FOR_Y);
    this.cmd("AlignLeft",   this.searchForBoxLabel, this.searchForBoxID);

    this.resultBoxID = this.nextIndex++;
    this.resultBoxLabel = this.nextIndex++;
    this.resultString = this.nextIndex++;
    this.cmd("CreateRectangle",  this.resultBoxID, "", EXTRA_FIELD_WIDTH, EXTRA_FIELD_HEIGHT,RESULT_X, RESULT_Y);
    this.cmd("CreateLabel",  this.resultBoxLabel,  "Result  ", RESULT_X, RESULT_Y);
    this.cmd("CreateLabel",  this.resultString,  "", RESULT_X, RESULT_Y);
    this.cmd("AlignLeft",   this.resultBoxLabel, this.resultBoxID);
    this.cmd("AlignRight",   this.resultString, this.resultBoxID);
    this.cmd("SetTextColor", this.resultString, "#FF0000");



    this.indexBoxID = this.nextIndex++;
    this.indexBoxLabel = this.nextIndex++;
    this.cmd("CreateRectangle",  this.indexBoxID, "", EXTRA_FIELD_WIDTH, EXTRA_FIELD_HEIGHT,INDEX_X, INDEX_Y);
    this.cmd("CreateLabel",  this.indexBoxLabel,  "index  ", INDEX_X, INDEX_Y);
    this.cmd("AlignLeft",   this.indexBoxLabel, this.indexBoxID);



    this.midBoxID = this.nextIndex++;
    this.midBoxLabel = this.nextIndex++;
    this.cmd("CreateRectangle",  this.midBoxID, "", EXTRA_FIELD_WIDTH, EXTRA_FIELD_HEIGHT,MID_POS_X, MID_POS_Y);
    this.cmd("CreateLabel",  this.midBoxLabel,  "mid  ", MID_POS_X, MID_POS_Y);
    this.cmd("AlignLeft",   this.midBoxLabel, this.midBoxID);
    this.cmd("SetForegroundColor", this.midBoxID, MID_CIRCLE_COLOR);
    this.cmd("SetTextColor", this.midBoxID, MID_CIRCLE_COLOR);
    this.cmd("SetBackgroundColor", this.midBoxID, MID_BACKGROUND_COLOR);

    this.midCircleID = this.nextIndex++;
    this.cmd("CreateHighlightCircle", this.midCircleID, MID_CIRCLE_COLOR, 0, 0, HIGHLIGHT_CIRCLE_SIZE);


    this.lowBoxID = this.nextIndex++;
    this.lowBoxLabel = this.nextIndex++;
    this.cmd("CreateRectangle",  this.lowBoxID, "", EXTRA_FIELD_WIDTH, EXTRA_FIELD_HEIGHT,LOW_POS_X, LOW_POS_Y);
    this.cmd("CreateLabel",  this.lowBoxLabel,  "low  ", LOW_POS_X, LOW_POS_Y);
    this.cmd("AlignLeft",   this.lowBoxLabel, this.lowBoxID);
    this.cmd("SetForegroundColor", this.lowBoxID, LOW_CIRCLE_COLOR);
    this.cmd("SetTextColor", this.lowBoxID, LOW_CIRCLE_COLOR);
    this.cmd("SetBackgroundColor", this.lowBoxID, LOW_BACKGROUND_COLOR);

    this.lowCircleID = this.nextIndex++;
    this.cmd("CreateHighlightCircle", this.lowCircleID, LOW_CIRCLE_COLOR, 0,0,HIGHLIGHT_CIRCLE_SIZE);



    this.highBoxID = this.nextIndex++;
    this.highBoxLabel = this.nextIndex++;
    this.cmd("CreateRectangle",  this.highBoxID, "", EXTRA_FIELD_WIDTH, EXTRA_FIELD_HEIGHT,HIGH_POS_X, HIGH_POS_Y);
    this.cmd("CreateLabel",  this.highBoxLabel,  "high  ", HIGH_POS_X, HIGH_POS_Y);
    this.cmd("AlignLeft",   this.highBoxLabel, this.highBoxID);
    this.cmd("SetForegroundColor", this.highBoxID, HIGH_CIRCLE_COLOR);
    this.cmd("SetTextColor", this.highBoxID, HIGH_CIRCLE_COLOR);
    this.cmd("SetBackgroundColor", this.highBoxID, HIGH_BACKGROUND_COLOR);


    this.highCircleID = this.nextIndex++;
    this.cmd("CreateHighlightCircle", this.highCircleID, HIGH_CIRCLE_COLOR, 0 , 0, HIGHLIGHT_CIRCLE_SIZE);


    this.cmd("SetALpha", this.lowBoxID, 0);
    this.cmd("SetALpha", this.lowBoxLabel, 0);
    this.cmd("SetALpha", this.midBoxID, 0);
    this.cmd("SetALpha", this.midBoxLabel, 0);
    this.cmd("SetALpha", this.highBoxID, 0);
    this.cmd("SetALpha", this.highBoxLabel, 0);

    this.cmd("SetALpha", this.midCircleID, 0);
    this.cmd("SetALpha", this.lowCircleID, 0);
    this.cmd("SetALpha", this.highCircleID, 0);

    this.cmd("SetALpha", this.indexBoxID, 0);
    this.cmd("SetALpha", this.indexBoxLabel, 0);
    
    this.highlight1ID = this.nextIndex++;
    this.highlight2ID = this.nextIndex++;

    this.binaryCodeID = this.addCodeToCanvasBase(Search.BINARY_CODE, Search.CODE_START_X, Search.CODE_START_Y, Search.CODE_LINE_HEIGHT, Search.CODE_STANDARD_COLOR);

    this.linearCodeID = this.addCodeToCanvasBase(Search.LINEAR_CODE, Search.CODE_START_X, Search.CODE_START_Y, Search.CODE_LINE_HEIGHT, Search.CODE_STANDARD_COLOR);

    this.setCodeAlpha(this.binaryCodeID, 0);
    this.setCodeAlpha(this.linearCodeID, 0);

    this.animationManager.StartNewAnimation(this.commands);
    this.animationManager.skipForward();
    this.animationManager.clearHistory();
}

Search.prototype.setup_small = function() {

   HIGHLIGHT_CIRCLE_SIZE = HIGHLIGHT_CIRCLE_SIZE_SMALL;
   ARRAY_START_X = ARRAY_START_X_SMALL;
   ARRAY_START_Y = ARRAY_START_Y_SMALL;
   ARRAY_ELEM_WIDTH = ARRAY_ELEM_WIDTH_SMALL;
   ARRAY_ELEM_HEIGHT = ARRAY_ELEM_HEIGHT_SMALL;
   ARRAY_ELEMS_PER_LINE = ARRAY_ELEMS_PER_LINE_SMALL;
   ARRAY_LINE_SPACING = ARRAY_LINE_SPACING_SMALL;
   SIZE = SIZE_SMALL;
   this.size = SMALL_SIZE;
   this.setup();

}


Search.prototype.setup_large  = function() {

   HIGHLIGHT_CIRCLE_SIZE = HIGHLIGHT_CIRCLE_SIZE_LARGE;
   ARRAY_START_X = ARRAY_START_X_LARGE;
   ARRAY_START_Y = ARRAY_START_Y_LARGE;
   ARRAY_ELEM_WIDTH = ARRAY_ELEM_WIDTH_LARGE;
   ARRAY_ELEM_HEIGHT = ARRAY_ELEM_HEIGHT_LARGE;
   ARRAY_ELEMS_PER_LINE = ARRAY_ELEMS_PER_LINE_LARGE;
   ARRAY_LINE_SPACING = ARRAY_LINE_SPACING_LARGE;
   SIZE = SIZE_LARGE;
   this.size = LARGE_SIZE;
   this.setup()

}




Search.prototype.linearSearchCallback = function(event)
{
    var searchVal = this.searchField.value;
    this.implementAction(this.linearSearch.bind(this), searchVal);
}


Search.prototype.binarySearchCallback = function(event)
{

    var searchVal = this.searchField.value;
    this.implementAction(this.binarySearch.bind(this), searchVal);

}



Search.prototype.binarySearch = function(searchVal)
{
    this.commands = new Array();
    this.setCodeAlpha(this.binaryCodeID, 1);
    this.setCodeAlpha(this.linearCodeID, 0);

    this.cmd("SetALpha", this.lowBoxID, 1);
    this.cmd("SetALpha", this.lowBoxLabel, 1);
    this.cmd("SetALpha", this.midBoxID, 1);
    this.cmd("SetALpha", this.midBoxLabel, 1);
    this.cmd("SetALpha", this.highBoxID, 1);
    this.cmd("SetALpha", this.highBoxLabel, 1);

    this.cmd("SetAlpha", this.lowCircleID, 1);
    this.cmd("SetAlpha", this.midCircleID, 1);
    this.cmd("SetAlpha", this.highCircleID, 1);
    this.cmd("SetPosition", this.lowCircleID, LOW_POS_X, LOW_POS_Y);
    this.cmd("SetPosition", this.midCircleID, MID_POS_X, MID_POS_Y);
    this.cmd("SetPosition", this.highCircleID, HIGH_POS_X, HIGH_POS_Y);
    this.cmd("SetAlpha", this.indexBoxID, 0);
    this.cmd("SetAlpha", this.indexBoxLabel, 0);

    this.cmd("SetText", this.resultString, "");
    this.cmd("SetText", this.resultBoxID, "");
    this.cmd("SetText", this.movingLabelID, "");


    var low = 0;
    var high = SIZE- 1;
    this.cmd("Move", this.lowCircleID, this.getIndexX(0), this.getIndexY(0));
    this.cmd("SetText", this.searchForBoxID, searchVal);
    this.cmd("SetForegroundColor", this.binaryCodeID[1][0], Search.CODE_HIGHLIGHT_COLOR);
    this.cmd("SetHighlight", this.lowBoxID, 1)
    this.cmd("SetText", this.lowBoxID, 0)
    this.cmd("step");
    this.cmd("SetForegroundColor", this.binaryCodeID[1][0], Search.CODE_STANDARD_COLOR);
    this.cmd("SetHighlight", this.lowBoxID, 0)
    this.cmd("SetForegroundColor", this.binaryCodeID[2][0], Search.CODE_HIGHLIGHT_COLOR);
    this.cmd("SetHighlight", this.highBoxID, 1)
    this.cmd("SetText", this.highBoxID, SIZE-1)
    this.cmd("Move", this.highCircleID, this.getIndexX(SIZE-1), this.getIndexY(SIZE-1));
    this.cmd("step");
    this.cmd("SetForegroundColor", this.binaryCodeID[2][0], Search.CODE_STANDARD_COLOR);
    this.cmd("SetHighlight", this.highBoxID, 0)
    var keepGoing = true;

    while (keepGoing)  {
	this.cmd("SetHighlight", this.highBoxID, 1)
	this.cmd("SetHighlight", this.lowBoxID, 1)
	this.cmd("SetForegroundColor", this.binaryCodeID[3][1], Search.CODE_HIGHLIGHT_COLOR);
	this.cmd("step");
	this.cmd("SetHighlight", this.highBoxID, 0)
	this.cmd("SetHighlight", this.lowBoxID, 0)
	this.cmd("SetForegroundColor", this.binaryCodeID[3][1], Search.CODE_STANDARD_COLOR);
	if (low > high)
	{
            keepGoing = false;
	} else {
	    var mid = Math.floor((high + low) / 2);
            this.cmd("SetForegroundColor", this.binaryCodeID[4][0], Search.CODE_HIGHLIGHT_COLOR);
	    this.cmd("SetHighlight", this.highBoxID, 1)
	    this.cmd("SetHighlight", this.lowBoxID, 1)
	    this.cmd("SetHighlight", this.midBoxID, 1)
	    this.cmd("SetText", this.midBoxID, mid)
            this.cmd("Move", this.midCircleID, this.getIndexX(mid), this.getIndexY(mid));

            this.cmd("step");
            this.cmd("SetForegroundColor", this.binaryCodeID[4][0], Search.CODE_STANDARD_COLOR);
	    this.cmd("SetHighlight", this.midBoxID, 0)
	    this.cmd("SetHighlight", this.highBoxID, 0)
	    this.cmd("SetHighlight", this.lowBoxID, 0)
	    this.cmd("SetHighlight", this.searchForBoxID, 1)
            this.cmd("SetHighlight", this.arrayID[mid],1);
            this.cmd("SetForegroundColor", this.binaryCodeID[5][1], Search.CODE_HIGHLIGHT_COLOR);
            this.cmd("step");
	    this.cmd("SetHighlight", this.searchForBoxID, 0)
            this.cmd("SetHighlight", this.arrayID[mid],0);
            this.cmd("SetForegroundColor", this.binaryCodeID[5][1], Search.CODE_STANDARD_COLOR);
            if (this.arrayData[mid] == searchVal) {
// HIGHLIGHT CODE!
		keepGoing = false;

            }
            else {

		this.cmd("SetForegroundColor", this.binaryCodeID[7][1], Search.CODE_HIGHLIGHT_COLOR);
		this.cmd("SetHighlight", this.searchForBoxID, 1)
		this.cmd("SetHighlight", this.arrayID[mid],1);
		this.cmd("step")
		this.cmd("SetForegroundColor", this.binaryCodeID[7][1], Search.CODE_STANDARD_COLOR);
		this.cmd("SetHighlight", this.searchForBoxID, 0)
		this.cmd("SetHighlight", this.arrayID[mid],0);
		if (this.arrayData[mid]  < searchVal) {
                    this.cmd("SetForegroundColor", this.binaryCodeID[8][0], Search.CODE_HIGHLIGHT_COLOR);
                    this.cmd("SetHighlight", this.lowID,1);
                    this.cmd("SetText", this.lowBoxID,mid+1);
                    this.cmd("Move", this.lowCircleID, this.getIndexX(mid+1), this.getIndexY(mid+1));

                    low = mid + 1;
                    for (var i = 0; i < low; i++) {
                        this.cmd("SetAlpha", this.arrayID[i],0.2);
                    }
                    this.cmd("Step");
                    this.cmd("SetForegroundColor", this.binaryCodeID[8][0], Search.CODE_STANDARD_COLOR);
                    this.cmd("SetHighlight", this.lowBoxID,0);
		}  else {
                    this.cmd("SetForegroundColor", this.binaryCodeID[10][0], Search.CODE_HIGHLIGHT_COLOR);
                    this.cmd("SetHighlight", this.highBoxID,1);
                    high  = mid - 1;
                    this.cmd("SetText", this.highBoxID,high);
                    this.cmd("Move", this.highCircleID, this.getIndexX(high), this.getIndexY(high));

                    for (var i = high + 1; i < SIZE; i++) {
                        this.cmd("SetAlpha", this.arrayID[i],0.2);
                    }
                    this.cmd("Step");

                    this.cmd("SetForegroundColor", this.binaryCodeID[10][0], Search.CODE_STANDARD_COLOR);
                    this.cmd("SetHighlight", this.midBoxID,0);


		}
	    }

	}

    }
    if (high < low) {
        this.cmd("SetText", this.resultString, "   Element Not found");
        this.cmd("SetText", this.resultBoxID, -1);
        this.cmd("AlignRight",   this.resultString, this.resultBoxID);
        this.cmd("SetForegroundColor", this.binaryCodeID[11][0], Search.CODE_HIGHLIGHT_COLOR);
        this.cmd("Step")
        this.cmd("SetForegroundColor", this.binaryCodeID[11][0], Search.CODE_STANDARD_COLOR);

    }  else {
        this.cmd("SetText", this.resultString, "   Element found");
        this.cmd("SetText", this.movingLabelID, mid);
        this.cmd("SetPosition", this.movingLabelID, this.getIndexX(mid), this.getIndexY(mid));

        this.cmd("Move", this.movingLabelID, RESULT_X, RESULT_Y);

        this.cmd("AlignRight",   this.resultString, this.resultBoxID);
        this.cmd("SetForegroundColor", this.binaryCodeID[6][0], Search.CODE_HIGHLIGHT_COLOR);
        this.cmd("Step")
        this.cmd("SetForegroundColor", this.binaryCodeID[6][0], Search.CODE_STANDARD_COLOR);

    }
	
    for (var i = 0; i < SIZE; i++) {
        this.cmd("SetAlpha", this.arrayID[i],1);
    }
    return this.commands;




}


Search.prototype.linearSearch = function(searchVal)
{
    this.commands = new Array();
    this.setCodeAlpha(this.binaryCodeID, 0);
    this.setCodeAlpha(this.linearCodeID, 1);

    this.cmd("SetALpha", this.lowBoxID, 0);
    this.cmd("SetALpha", this.lowBoxLabel, 0);
    this.cmd("SetALpha", this.midBoxID, 0);
    this.cmd("SetALpha", this.midBoxLabel, 0);
    this.cmd("SetALpha", this.highBoxID, 0);
    this.cmd("SetALpha", this.highBoxLabel, 0);


    this.cmd("SetAlpha", this.lowCircleID, 1);
    this.cmd("SetAlpha", this.midCircleID, 0);
    this.cmd("SetAlpha", this.highCircleID, 0);

    this.cmd("SetPosition", this.lowCircleID, INDEX_X, INDEX_Y);

    this.cmd("SetALpha", this.indexBoxID, 1);
    this.cmd("SetALpha", this.indexBoxLabel, 1);

    this.cmd("SetText", this.resultString, "");
    this.cmd("SetText", this.resultBoxID, "");
    this.cmd("SetText", this.movingLabelID, "");



    var goOn = true;
    var nextSearch = 0;
    this.cmd("SetText", this.searchForBoxID, searchVal);
    this.cmd("SetForegroundColor", this.linearCodeID[1][0], Search.CODE_HIGHLIGHT_COLOR);
    this.cmd("SetHighlight", this.indexBoxID,1);
    this.cmd("SetText", this.indexBoxID, "0");
    this.cmd("Move", this.lowCircleID, this.getIndexX(0), this.getIndexY(0));

    this.cmd("Step");
    this.cmd("SetForegroundColor", this.linearCodeID[1][0], Search.CODE_STANDARD_COLOR);
    this.cmd("SetHighlight", this.indexBoxID,0);

    
    var foundIndex = 0
    while (goOn) {
        if (foundIndex == SIZE) {
    	    this.cmd("SetForegroundColor", this.linearCodeID[2][1], Search.CODE_HIGHLIGHT_COLOR);
            this.cmd("Step");
    	    this.cmd("SetForegroundColor", this.linearCodeID[2][1], Search.CODE_STANDARD_COLOR);
            goOn = false;

        } else {
            this.cmd("SetHighlight", this.arrayID[foundIndex],1);
            this.cmd("SetHighlight", this.searchForBoxID,1);
    	    this.cmd("SetForegroundColor", this.linearCodeID[2][3], Search.CODE_HIGHLIGHT_COLOR);
	    this.cmd("Step")
    	    this.cmd("SetForegroundColor", this.linearCodeID[2][3], Search.CODE_STANDARD_COLOR);
            this.cmd("SetHighlight", this.arrayID[foundIndex],0);
            this.cmd("SetHighlight", this.searchForBoxID,0);
            goOn =  this.arrayData[foundIndex] < searchVal
            if (goOn)
            {
                foundIndex++;

                this.cmd("SetForegroundColor", this.linearCodeID[3][0], Search.CODE_HIGHLIGHT_COLOR);
                this.cmd("SetHighlight", this.indexBoxID,1);
                this.cmd("SetText", this.indexBoxID, foundIndex);
                  this.cmd("Move", this.lowCircleID, this.getIndexX(foundIndex), this.getIndexY(foundIndex));

                this.cmd("Step");
                this.cmd("SetForegroundColor", this.linearCodeID[3][0], Search.CODE_STANDARD_COLOR);
                this.cmd("SetHighlight", this.indexBoxID,0);
            }
        }
    }
    if (foundIndex ==SIZE)
    {
        this.cmd("SetForegroundColor", this.linearCodeID[4][1], Search.CODE_HIGHLIGHT_COLOR);
        this.cmd("Step");
        this.cmd("SetForegroundColor", this.linearCodeID[4][1], Search.CODE_STANDARD_COLOR);
        this.cmd("SetForegroundColor", this.linearCodeID[5][0], Search.CODE_HIGHLIGHT_COLOR);
        this.cmd("Step");
        this.cmd("SetForegroundColor", this.linearCodeID[5][0], Search.CODE_STANDARD_COLOR);

	
    }

    else if (this.arrayData[foundIndex] == searchVal)
    {
        this.cmd("SetForegroundColor", this.linearCodeID[4][1], Search.CODE_HIGHLIGHT_COLOR);
        this.cmd("SetForegroundColor", this.linearCodeID[4][2], Search.CODE_HIGHLIGHT_COLOR);
        this.cmd("SetForegroundColor", this.linearCodeID[4][3], Search.CODE_HIGHLIGHT_COLOR);
        this.cmd("SetHighlight", this.arrayID[foundIndex],1);
        this.cmd("SetHighlight", this.searchForBoxID,1);
        this.cmd("Step");

        this.cmd("SetHighlight", this.arrayID[foundIndex],0);
        this.cmd("SetHighlight", this.searchForBoxID,0);



        this.cmd("SetForegroundColor", this.linearCodeID[4][1], Search.CODE_STANDARD_COLOR);
        this.cmd("SetForegroundColor", this.linearCodeID[4][2], Search.CODE_STANDARD_COLOR);
        this.cmd("SetForegroundColor", this.linearCodeID[4][3], Search.CODE_STANDARD_COLOR);
        this.cmd("SetForegroundColor", this.linearCodeID[6][0], Search.CODE_HIGHLIGHT_COLOR);
        this.cmd("SetText", this.resultString, "   Element found");
        this.cmd("SetText", this.movingLabelID, foundIndex);
        this.cmd("SetPosition", this.movingLabelID, this.getIndexX(foundIndex), this.getIndexY(foundIndex));

        this.cmd("Move", this.movingLabelID, RESULT_X, RESULT_Y);

        this.cmd("AlignRight",   this.resultString, this.resultBoxID);
        this.cmd("Step");
        this.cmd("SetForegroundColor", this.linearCodeID[6][0], Search.CODE_STANDARD_COLOR);



    }
    else 
    {
        this.cmd("SetHighlight", this.arrayID[foundIndex],1);
        this.cmd("SetHighlight", this.searchForBoxID,1);
        this.cmd("SetForegroundColor", this.linearCodeID[4][3], Search.CODE_HIGHLIGHT_COLOR);
        this.cmd("Step");
        this.cmd("SetHighlight", this.arrayID[foundIndex],0);
        this.cmd("SetHighlight", this.searchForBoxID,0);
        this.cmd("SetForegroundColor", this.linearCodeID[4][3], Search.CODE_STANDARD_COLOR);
        this.cmd("SetForegroundColor", this.linearCodeID[5][0], Search.CODE_HIGHLIGHT_COLOR);
        this.cmd("SetText", this.resultString, "   Element Not found");
        this.cmd("SetText", this.resultBoxID, -1);
        this.cmd("AlignRight",   this.resultString, this.resultBoxID);

        this.cmd("Step");
        this.cmd("SetForegroundColor", this.linearCodeID[5][0], Search.CODE_STANDARD_COLOR);



    }
    return this.commands;


}






var currentAlg;

function init()
{
    var animManag = initCanvas();
    currentAlg = new Search(animManag, canvas.width, canvas.height);
}
