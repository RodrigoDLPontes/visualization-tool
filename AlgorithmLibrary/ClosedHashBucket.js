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


function ClosedHashBucket(am, w, h)
{
	this.init(am, w, h);

}

var ARRAY_ELEM_WIDTH = 90;
var ARRAY_ELEM_HEIGHT = 30;
var ARRAY_ELEM_START_X = 50;
var ARRAY_ELEM_START_Y = 100;
var ARRAY_VERTICAL_SEPARATION = 100;

var CLOSED_HASH_TABLE_SIZE  = 29;


var BUCKET_SIZE = 3;
var NUM_BUCKETS = 11;
var CLOSED_HASH_TABLE_SIZE  = 40;


var ARRAY_Y_POS = 350;


var INDEX_COLOR = "#0000FF";




var MAX_DATA_VALUE = 999;

var HASH_TABLE_SIZE  = 13;

var ARRAY_Y_POS = 350;


var INDEX_COLOR = "#0000FF";



ClosedHashBucket.prototype = new Hash();
ClosedHashBucket.prototype.constructor = ClosedHashBucket;
ClosedHashBucket.superclass = Hash.prototype;


ClosedHashBucket.prototype.init = function(am, w, h)
{
	var sc = ClosedHashBucket.superclass;
	var fn = sc.init;
	fn.call(this,am, w, h);
	
	this.elements_per_row = Math.floor(w / ARRAY_ELEM_WIDTH) ;

	
	//Change me!
	this.nextIndex = 0;
	//this.POINTER_ARRAY_ELEM_Y = h - POINTER_ARRAY_ELEM_WIDTH;
	this.setup();
}

ClosedHashBucket.prototype.addControls = function()
{
	ClosedHashBucket.superclass.addControls.call(this);


	
	// Add new controls

}





ClosedHashBucket.prototype.insertElement = function(elem)
{
	this.commands = new Array();
	this.cmd("SetText", this.ExplainLabel, "Inserting element: " + String(elem));
	var index = this.doHash(elem);
	
	var foundIndex = -1;
	for (var candidateIndex = index * BUCKET_SIZE; candidateIndex < index * BUCKET_SIZE + BUCKET_SIZE; candidateIndex++)
	{
		this.cmd("SetHighlight", this.hashTableVisual[candidateIndex], 1);
		this.cmd("Step");
		this.cmd("SetHighlight", this.hashTableVisual[candidateIndex], 0);
		if (this.empty[candidateIndex])
		{
			foundIndex = candidateIndex;
			break;
		}	
	}
	if (foundIndex == -1)
	{
		for (candidateIndex = BUCKET_SIZE * NUM_BUCKETS; candidateIndex < CLOSED_HASH_TABLE_SIZE; candidateIndex++)
		{
			this.cmd("SetHighlight", this.hashTableVisual[candidateIndex], 1);
			this.cmd("Step");
			this.cmd("SetHighlight", this.hashTableVisual[candidateIndex], 0);
			
			if (this.empty[candidateIndex])
			{
				foundIndex = candidateIndex;
				break;
			}					
			
		}
	}
	
	if (foundIndex != -1)
	{
		var labID = this.nextIndex++;
		this.cmd("CreateLabel", labID, elem, 20, 25);
		this.cmd("Move", labID, this.indexXPos2[foundIndex], this.indexYPos2[foundIndex] - ARRAY_ELEM_HEIGHT);
		this.cmd("Step");
		this.cmd("Delete", labID);
		this.cmd("SetText", this.hashTableVisual[foundIndex], elem);
		this.hashTableValues[foundIndex] = elem;
		this.empty[foundIndex] = false;
		this.deleted[foundIndex] = false;
	}
	
	
	this.cmd("SetText", this.ExplainLabel, "");
	
	return this.commands;
	
}




ClosedHashBucket.prototype.getElemIndex  = function(elem) 
{
	var foundIndex = -1;
	var initialIndex = this.doHash(elem);
	
	for (var candidateIndex = initialIndex * BUCKET_SIZE; candidateIndex < initialIndex* BUCKET_SIZE + BUCKET_SIZE; candidateIndex++)
	{
		this.cmd("SetHighlight", this.hashTableVisual[candidateIndex], 1);
		this.cmd("Step");
		this.cmd("SetHighlight", this.hashTableVisual[candidateIndex], 0);
		if (!this.empty[candidateIndex] && this.hashTableValues[candidateIndex] == elem)
		{
			return candidateIndex;		
		}
		else if (this.empty[candidateIndex] && !this.deleted[candidateIndex])
		{
			return -1;
		}
	}
	// Can only get this far if we didn't find the element we are looking for,
	//  *and* the bucekt was full -- look at overflow bucket.
	for (candidateIndex = BUCKET_SIZE * NUM_BUCKETS; candidateIndex < CLOSED_HASH_TABLE_SIZE; candidateIndex++)
	{
		this.cmd("SetHighlight", this.hashTableVisual[candidateIndex], 1);
		this.cmd("Step");
		this.cmd("SetHighlight", this.hashTableVisual[candidateIndex], 0);
		
		if (!this.empty[candidateIndex] && this.hashTableValues[candidateIndex] == elem)
		{
			return candidateIndex;		
		}
		else if (this.empty[candidateIndex] && !this.deleted[candidateIndex])
		{
			return -1;
		}
	}
	return -1;			
}


ClosedHashBucket.prototype.deleteElement = function(elem)
{
	this.commands = new Array();
	this.cmd("SetText", this.ExplainLabel, "Deleting element: " + elem);
	var index = this.getElemIndex(elem);
	
	if (index == -1)
	{
		this.cmd("SetText", this.ExplainLabel, "Deleting element: " + elem + "  Element not in table");				
	}
	else
	{
		this.cmd("SetText", this.ExplainLabel, "Deleting element: " + elem + "  Element this.deleted");
		this.empty[index] = true;
		this.deleted[index] = true;
		this.cmd("SetText", this.hashTableVisual[index], "<deleted>");
	}
	
	return this.commands;
	
}
ClosedHashBucket.prototype.findElement = function(elem)
{
	this.commands = new Array();
	this.cmd("SetText", this.ExplainLabel, "Finding Element: " + elem);
	var index = this.getElemIndex(elem);
	if (index == -1)
	{
		this.cmd("SetText", this.ExplainLabel, "Element " + elem + " not found");
	}
	else
	{
		this.cmd("SetText", this.ExplainLabel, "Element " + elem + " found");
	}
	return this.commands;
}




ClosedHashBucket.prototype.setup = function()
{
	this.table_size = NUM_BUCKETS;
	this.hashTableVisual = new Array(CLOSED_HASH_TABLE_SIZE);
	this.hashTableIndices = new Array(CLOSED_HASH_TABLE_SIZE);
	this.hashTableValues = new Array(CLOSED_HASH_TABLE_SIZE);
	
	this.indexXPos = new Array(NUM_BUCKETS);
	this.indexYPos = new Array(NUM_BUCKETS);
	
	this.indexXPos2 = new Array(CLOSED_HASH_TABLE_SIZE);
	this.indexYPos2 = new Array(CLOSED_HASH_TABLE_SIZE);
	
	
	this.empty = new Array(CLOSED_HASH_TABLE_SIZE);
	this.deleted = new Array(CLOSED_HASH_TABLE_SIZE);
	
	this.ExplainLabel = this.nextIndex++;
	
	this.commands = [];
	
	for (var i = 0; i < CLOSED_HASH_TABLE_SIZE; i++)
	{
		var nextID  = this.nextIndex++;
		this.empty[i] = true;
		this.deleted[i] = false;
		
		var nextXPos =  ARRAY_ELEM_START_X + (i % this.elements_per_row) * ARRAY_ELEM_WIDTH;
		var nextYPos =  ARRAY_ELEM_START_Y + Math.floor(i / this.elements_per_row) * ARRAY_VERTICAL_SEPARATION;
		this.cmd("CreateRectangle", nextID, "", ARRAY_ELEM_WIDTH, ARRAY_ELEM_HEIGHT,nextXPos, nextYPos)
		this.hashTableVisual[i] = nextID;
		nextID = this.nextIndex++;
		this.hashTableIndices[i] = nextID;
		this.indexXPos2[i] = nextXPos;
		this.indexYPos2[i] = nextYPos + ARRAY_ELEM_HEIGHT
		
		this.cmd("CreateLabel", nextID, i,this.indexXPos2[i],this.indexYPos2[i]);
		this.cmd("SetForegroundColor", nextID, INDEX_COLOR);
	}
	
	for (i = 0; i <= NUM_BUCKETS; i++)
	{
		nextID = this.nextIndex++;
		nextXPos =  ARRAY_ELEM_START_X + (i * 3 % this.elements_per_row) * ARRAY_ELEM_WIDTH - ARRAY_ELEM_WIDTH / 2;
		nextYPos =  ARRAY_ELEM_START_Y + Math.floor((i * 3) / this.elements_per_row) * ARRAY_VERTICAL_SEPARATION + ARRAY_ELEM_HEIGHT;
		this.cmd("CreateRectangle", nextID, "", 0, ARRAY_ELEM_HEIGHT * 2,nextXPos, nextYPos)
		nextID = this.nextIndex++;
		if (i == NUM_BUCKETS)
		{
			this.cmd("CreateLabel", nextID, "Overflow", nextXPos + 3, nextYPos + ARRAY_ELEM_HEIGHT / 2 , 0);
		}
		else
		{
			this.indexXPos[i] =  nextXPos + 5;
			this.indexYPos[i] = nextYPos + ARRAY_ELEM_HEIGHT / 2;
			this.cmd("CreateLabel", nextID, i, this.indexXPos[i],this.indexYPos[i], 0);					
		}
	}
	
	this.cmd("CreateLabel", this.ExplainLabel, "", 10, 25, 0);
	this.animationManager.StartNewAnimation(this.commands);
	this.animationManager.skipForward();
	this.animationManager.clearHistory();
	this.resetIndex  = this.nextIndex;
}







ClosedHashBucket.prototype.resetAll = function()
{
	this.commands = ClosedHashBucket.superclass.resetAll.call(this);
	
	for (var i = 0; i < CLOSED_HASH_TABLE_SIZE; i++)
	{
		this.empty[i] = true;
		this.deleted[i] = false;
		this.cmd("SetText", this.hashTableVisual[i], "");		
	}
	return this.commands;
	// Clear array, etc
}



// NEED TO OVERRIDE IN PARENT
ClosedHashBucket.prototype.reset = function()
{
	for (var i = 0; i < CLOSED_HASH_TABLE_SIZE; i++)
	{
		this.empty[i]= true;
		this.deleted[i] = false;				
	}
	this.nextIndex = this.resetIndex ;
	ClosedHashBucket.superclass.reset.call(this);

}




ClosedHashBucket.prototype.disableUI = function(event)
{
	ClosedHashBucket.superclass.disableUI.call(this);
}

ClosedHashBucket.prototype.enableUI = function(event)
{
	ClosedHashBucket.superclass.enableUI.call(this);

}




var currentAlg;

function init()
{
	var animManag = initCanvas();
	currentAlg = new ClosedHashBucket(animManag, canvas.width, canvas.height);
}
