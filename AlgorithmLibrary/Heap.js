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


function Heap(am)
{
	this.init(am);

}

Heap.prototype = new Algorithm();
Heap.prototype.constructor = Heap;
Heap.superclass = Algorithm.prototype;



var ARRAY_SIZE  = 32;
var ARRAY_ELEM_WIDTH = 30;
var ARRAY_ELEM_HEIGHT = 25;
var ARRAY_INITIAL_X = 30;

var ARRAY_Y_POS = 50;
var ARRAY_LABEL_Y_POS = 70;


Heap.prototype.init = function(am)
{
	var sc = Heap.superclass;
	var fn = sc.init;
	fn.call(this,am);
	this.addControls();
	this.nextIndex = 0;
	this.HeapXPositions = [0, 450, 250, 650, 150, 350, 550, 750, 100, 200, 300, 400, 500, 600,
					  700, 800, 075, 125, 175, 225, 275, 325, 375, 425, 475, 525, 575, 
					  625, 675, 725, 775, 825];
	this.HeapYPositions = [0, 100, 170, 170, 240, 240, 240, 240, 310, 310, 310, 310, 310, 310,
					  310, 310, 380, 380, 380, 380, 380, 380, 380, 380, 380, 380, 380, 
					  380, 380, 380, 380, 380];
	this.commands = [];
	this.createArray();

	
	/*this.nextIndex = 0;
	this.this.commands = [];
	this.cmd("CreateLabel", 0, "", 20, 50, 0);
	this.animationManager.StartNewAnimation(this.this.commands);
	this.animationManager.skipForward();
	this.animationManager.clearHistory(); */
	
}

Heap.prototype.addControls =  function()
{
	this.insertField = addControlToAlgorithmBar("Text", "");
	this.insertField.onkeydown = this.returnSubmit(this.insertField,  this.insertCallback.bind(this), 4, true);
	this.insertButton = addControlToAlgorithmBar("Button", "Insert");
	this.insertButton.onclick = this.insertCallback.bind(this);
	this.removeSmallestButton = addControlToAlgorithmBar("Button", "Remove Smallest");
	this.removeSmallestButton.onclick = this.removeSmallestCallback.bind(this);
	this.clearHeapButton = addControlToAlgorithmBar("Button", "Clear Heap");
	this.clearHeapButton.onclick = this.clearCallback.bind(this);
	this.buildHeapButton = addControlToAlgorithmBar("Button", "BuildHeap");
	this.buildHeapButton.onclick = this.buildHeapCallback.bind(this);
}



Heap.prototype.createArray = function()
{
	this.arrayData = new Array(ARRAY_SIZE);
	this.arrayLabels = new Array(ARRAY_SIZE);
	this.arrayRects = new Array(ARRAY_SIZE);
	this.circleObjs = new Array(ARRAY_SIZE);
	this.ArrayXPositions = new Array(ARRAY_SIZE);
	this.currentHeapSize = 0;
	
	for (var i = 0; i < ARRAY_SIZE; i++)
	{
		this.ArrayXPositions[i] = ARRAY_INITIAL_X + i *ARRAY_ELEM_WIDTH;
		this.arrayLabels[i] = this.nextIndex++;
		this.arrayRects[i] = this.nextIndex++;
		this.circleObjs[i] = this.nextIndex++;
		this.cmd("CreateRectangle", this.arrayRects[i], "", ARRAY_ELEM_WIDTH, ARRAY_ELEM_HEIGHT, this.ArrayXPositions[i] , ARRAY_Y_POS)
		this.cmd("CreateLabel", this.arrayLabels[i], i,  this.ArrayXPositions[i], ARRAY_LABEL_Y_POS);
		this.cmd("SetForegroundColor", this.arrayLabels[i], "#0000FF");
	}
	this.cmd("SetText", this.arrayRects[0], "-INF");
	this.swapLabel1 = this.nextIndex++;
	this.swapLabel2 = this.nextIndex++;
	this.swapLabel3 = this.nextIndex++;
	this.swapLabel4 = this.nextIndex++;
	this.descriptLabel1 = this.nextIndex++;
	this.descriptLabel2 = this.nextIndex++;
	this.cmd("CreateLabel", this.descriptLabel1, "", 20, 10,  0);
	//this.cmd("CreateLabel", this.descriptLabel2, "", this.nextIndex, 40, 120, 0);
	this.animationManager.StartNewAnimation(this.commands);
	this.animationManager.skipForward();
	this.animationManager.clearHistory();
}


Heap.prototype.insertCallback = function(event)
{
	var insertedValue;
	
	insertedValue = this.normalizeNumber(this.insertField.value, 4);
	if (insertedValue != "")
	{
		this.insertField.value = "";
		this.implementAction(this.insertElement.bind(this),insertedValue);
	}
}

//TODO:  Make me undoable!!
Heap.prototype.clearCallback = function(event)
{
	this.commands = new Array();
	this.implementAction(this.clear.bind(this),"");
}

//TODO:  Make me undoable!!
Heap.prototype.clear = function()
{
	
	while (this.currentHeapSize > 0)
	{
		this.cmd("Delete", this.circleObjs[this.currentHeapSize]);
		this.cmd("SetText", this.arrayRects[this.currentHeapSize], "");
		this.currentHeapSize--;				
	}
	return this.commands;
}


Heap.prototype.reset = function()
{
	this.currentHeapSize = 0;
}

Heap.prototype.removeSmallestCallback = function(event)
{
	this.implementAction(this.removeSmallest.bind(this),"");
}


Heap.prototype.swap = function(index1, index2)
{
	this.cmd("SetText", this.arrayRects[index1], "");
	this.cmd("SetText", this.arrayRects[index2], "");
	this.cmd("SetText", this.circleObjs[index1], "");
	this.cmd("SetText", this.circleObjs[index2], "");
	this.cmd("CreateLabel", this.swapLabel1, this.arrayData[index1], this.ArrayXPositions[index1],ARRAY_Y_POS);
	this.cmd("CreateLabel", this.swapLabel2, this.arrayData[index2], this.ArrayXPositions[index2],ARRAY_Y_POS);
	this.cmd("CreateLabel", this.swapLabel3, this.arrayData[index1], this.HeapXPositions[index1],this.HeapYPositions[index1]);
	this.cmd("CreateLabel", this.swapLabel4, this.arrayData[index2], this.HeapXPositions[index2],this.HeapYPositions[index2]);
	this.cmd("Move", this.swapLabel1, this.ArrayXPositions[index2],ARRAY_Y_POS)
	this.cmd("Move", this.swapLabel2, this.ArrayXPositions[index1],ARRAY_Y_POS)
	this.cmd("Move", this.swapLabel3, this.HeapXPositions[index2],this.HeapYPositions[index2])
	this.cmd("Move", this.swapLabel4, this.HeapXPositions[index1],this.HeapYPositions[index1])
	var tmp = this.arrayData[index1];
	this.arrayData[index1] = this.arrayData[index2];
	this.arrayData[index2] = tmp;
	this.cmd("Step")
	this.cmd("SetText", this.arrayRects[index1], this.arrayData[index1]);
	this.cmd("SetText", this.arrayRects[index2], this.arrayData[index2]);
	this.cmd("SetText", this.circleObjs[index1], this.arrayData[index1]);
	this.cmd("SetText", this.circleObjs[index2], this.arrayData[index2]);
	this.cmd("Delete", this.swapLabel1);
	this.cmd("Delete", this.swapLabel2);
	this.cmd("Delete", this.swapLabel3);
	this.cmd("Delete", this.swapLabel4);			
	
	
}


Heap.prototype.setIndexHighlight = function(index, highlightVal)
{
	this.cmd("SetHighlight", this.circleObjs[index], highlightVal);
	this.cmd("SetHighlight", this.arrayRects[index], highlightVal);
}

Heap.prototype.pushDown = function(index)
{
	var smallestIndex;
	
	while(true)
	{
		if (index*2 > this.currentHeapSize)
		{
			return;
		}
		
		smallestIndex = 2*index;
		
		if (index*2 + 1 <= this.currentHeapSize)
		{
			this.setIndexHighlight(2*index, 1);
			this.setIndexHighlight(2*index + 1, 1);
			this.cmd("Step");
			this.setIndexHighlight(2*index, 0);
			this.setIndexHighlight(2*index + 1, 0);
			if (this.arrayData[2*index + 1] < this.arrayData[2*index])
			{
				smallestIndex = 2*index + 1;
			}
		}
		this.setIndexHighlight(index, 1);
		this.setIndexHighlight(smallestIndex, 1);
		this.cmd("Step");
		this.setIndexHighlight(index, 0);
		this.setIndexHighlight(smallestIndex, 0);
		
		if (this.arrayData[smallestIndex] < this.arrayData[index])
		{
			this.swap(smallestIndex, index);
			index = smallestIndex;
		}
		else
		{
			return;
		}
		
		
		
	}
}

Heap.prototype.removeSmallest = function(dummy)
{
	this.commands = new Array();
	this.cmd("SetText", this.descriptLabel1, "");
	
	if (this.currentHeapSize == 0)
	{
		this.cmd("SetText", this.descriptLabel1, "Heap is empty, cannot remove smallest element");
		return this.commands;
	}
	
	this.cmd("SetText", this.descriptLabel1, "Removing element:");			
	this.cmd("CreateLabel", this.descriptLabel2, this.arrayData[1],  this.HeapXPositions[1], this.HeapYPositions[1], 0);
	this.cmd("SetText", this.circleObjs[1], "");
	this.cmd("Move", this.descriptLabel2,  120, 40)
	this.cmd("Step");
	this.cmd("Delete", this.descriptLabel2);
	this.cmd("SetText", this.descriptLabel1, "Removing element: " + this.arrayData[1]);
	this.arrayData[1] = "";
	if (this.currentHeapSize > 1)
	{
		this.cmd("SetText", this.arrayRects[1], "");
		this.cmd("SetText", this.arrayRects[this.currentHeapSize], "");
		this.swap(1,this.currentHeapSize);
		this.cmd("Delete", this.circleObjs[this.currentHeapSize]);
		this.currentHeapSize--;
		this.pushDown(1);				
	} else {
                this.cmd("SetText", this.arrayRects[1], "");
		this.cmd("Delete", this.circleObjs[this.currentHeapSize]);
		this.currentHeapSize--;

        }
	return this.commands;
	
}

Heap.prototype.buildHeapCallback = function(event)
{
	this.implementAction(this.buildHeap.bind(this),"");			
}

Heap.prototype.buildHeap = function(ignored)
{
	this.commands = [];
	this.clear();
	for (var i = 1; i <ARRAY_SIZE; i++)
	{
		this.arrayData[i] = this.normalizeNumber(String(ARRAY_SIZE - i), 4);
		this.cmd("CreateCircle", this.circleObjs[i], this.arrayData[i], this.HeapXPositions[i], this.HeapYPositions[i]);
		this.cmd("SetText", this.arrayRects[i], this.arrayData[i]);
		if (i > 1)
		{
			this.cmd("Connect", this.circleObjs[Math.floor(i/2)], this.circleObjs[i]);
		}
		
	}
	this.cmd("Step");
	this.currentHeapSize = ARRAY_SIZE - 1;
	var nextElem = this.currentHeapSize;
	while(nextElem > 0)
	{
		this.pushDown(nextElem);
		nextElem = nextElem - 1;
	}
	return this.commands;
}

Heap.prototype.insertElement = function(insertedValue)
{
	this.commands = new Array();
	
	if (this.currentHeapSize >= ARRAY_SIZE - 1)
	{
		this.cmd("SetText", this.descriptLabel1, "Heap Full!");
		return this.commands;
	}
	
	this.cmd("SetText", this.descriptLabel1, "Inserting Element: " + insertedValue);	
	this.cmd("Step");
	this.cmd("SetText", this.descriptLabel1, "Inserting Element: ");
	this.currentHeapSize++;
	this.arrayData[this.currentHeapSize] = insertedValue;
	this.cmd("CreateCircle",this.circleObjs[this.currentHeapSize], "", this.HeapXPositions[this.currentHeapSize], this.HeapYPositions[this.currentHeapSize]);
	this.cmd("CreateLabel", this.descriptLabel2, insertedValue, 120, 45,  1);
	if (this.currentHeapSize > 1)
	{
		this.cmd("Connect", this.circleObjs[Math.floor(this.currentHeapSize / 2)], this.circleObjs[this.currentHeapSize]);				
	}
	
	this.cmd("Move", this.descriptLabel2, this.HeapXPositions[this.currentHeapSize], this.HeapYPositions[this.currentHeapSize]);
	this.cmd("Step");
	this.cmd("SetText", this.circleObjs[this.currentHeapSize], insertedValue);
	this.cmd("delete", this.descriptLabel2);
	this.cmd("SetText", this.arrayRects[this.currentHeapSize], insertedValue);
	
	var currentIndex = this.currentHeapSize;
	var parentIndex = Math.floor(currentIndex / 2);
	
	if (currentIndex > 1)
	{
		this.setIndexHighlight(currentIndex, 1);
		this.setIndexHighlight(parentIndex, 1);
		this.cmd("Step");
		this.setIndexHighlight(currentIndex, 0);
		this.setIndexHighlight(parentIndex, 0);
	}
	
	while (currentIndex > 1 && this.arrayData[currentIndex] < this.arrayData[parentIndex])
	{
		this.swap(currentIndex, parentIndex);
		currentIndex = parentIndex;
		parentIndex = Math.floor(parentIndex / 2);
		if (currentIndex > 1)
		{
			this.setIndexHighlight(currentIndex, 1);
			this.setIndexHighlight(parentIndex, 1);
			this.cmd("Step");
			this.setIndexHighlight(currentIndex, 0);
			this.setIndexHighlight(parentIndex, 0);
		}
	}
	this.cmd("SetText", this.descriptLabel1, "");	
	
	return this.commands;
}

Heap.prototype.disableUI = function(event)
{
	this.insertField.disabled = true;
	this.insertButton.disabled = true;
	this.removeSmallestButton.disabled = true;
	this.clearHeapButton.disabled = true;
	this.buildHeapButton.disabled = true;
}

Heap.prototype.enableUI = function(event)
{
	this.insertField.disabled = false;
	this.insertButton.disabled = false;
	this.removeSmallestButton.disabled = false;
	this.clearHeapButton.disabled = false;
	this.buildHeapButton.disabled = false;
}


var currentAlg;

function init()
{
	var animManag = initCanvas();
	currentAlg = new Heap(animManag, canvas.width, canvas.height);
}
