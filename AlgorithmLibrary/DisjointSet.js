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
// FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL David Galles OR
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


var ARRAY_START_X = 50;
var ARRAY_WIDTH = 30;
var ARRAY_HEIGHT = 30;

var TREE_START_X = 50;
var TREE_ELEM_WIDTH = 50;
var TREE_ELEM_HEIGHT = 50; 

var SIZE = 16;

var LINK_COLOR = "#007700"
var HIGHLIGHT_CIRCLE_COLOR = "#007700";
var FOREGROUND_COLOR = "#007700";
var BACKGROUND_COLOR = "#EEFFEE";
var PRINT_COLOR = FOREGROUND_COLOR;

function DisjointSet(am, w, h)
{
	this.array_start_y = h - 2 * ARRAY_HEIGHT;
	this.tree_start_y = this.array_start_y - 50;
	this.init(am);
	
}

DisjointSet.prototype = new Algorithm();
DisjointSet.prototype.constructor = DisjointSet;
DisjointSet.superclass = Algorithm.prototype;

DisjointSet.prototype.init = function(am, w, h)
{
	var sc = DisjointSet.superclass.init.call(this, am, w, h);
	this.addControls();

	this.commands = [];
	this.nextIndex = 0;
	this.highlight1ID = this.nextIndex++;
	this.highlight2ID = this.nextIndex++;
	
	this.arrayID = new Array(SIZE);
	this.arrayLabelID = new Array(SIZE);
	this.treeID = new Array(SIZE);
	this.setData = new Array(SIZE);
	this.treeY = new Array(SIZE);
	this.treeIndexToLocation = new Array(SIZE);
	this.locationToTreeIndex = new Array(SIZE);
	this.heights = new Array(SIZE);
	for (var i = 0; i < SIZE; i++)
	{
		this.treeIndexToLocation[i] = i;
		this.locationToTreeIndex[i] = i;
		this.arrayID[i]= this.nextIndex++;
		this.arrayLabelID[i]= this.nextIndex++;
		this.treeID[i] = this.nextIndex++;
		this.setData[i] = -1;
		this.treeY[i] =  this.tree_start_y;
		this.heights[i] = 0;
	}
	
	this.pathCompression = false;
	this.unionByRank = false;
	this.rankAsHeight = false;
	this.setup();	
}

DisjointSet.prototype.addControls =  function()
{
	this.controls = [];
	
	
	this.findField = addControlToAlgorithmBar("Text", "");
	this.findField.onkeydown = this.returnSubmit(this.findField,  this.findCallback.bind(this), 4, true);
	this.controls.push(this.findField);

	var findButton = addControlToAlgorithmBar("Button", "Find");
	findButton.onclick = this.findCallback.bind(this);
	
	this.controls.push(findButton);


	this.unionField1 = addControlToAlgorithmBar("Text", "");
	this.unionField1.onkeydown = this.returnSubmit(this.unionField1,  this.unionCallback.bind(this), 4, true);
	
	this.controls.push(this.unionField1);

	
	this.unionField2 = addControlToAlgorithmBar("Text", "");
	this.unionField2.onkeydown = this.returnSubmit(this.unionField2,  this.unionCallback.bind(this), 4, true);
	
	this.unionButton = addControlToAlgorithmBar("Button", "Union");
	this.unionButton.onclick = this.unionCallback.bind(this);

	this.controls.push(this.unionField2);
	
	this.pathCompressionBox = addCheckboxToAlgorithmBar("Path Compression");
	this.pathCompressionBox.onclick = this.pathCompressionChangeCallback.bind(this);

	this.controls.push(this.pathCompressionBox);

	this.unionByRankBox = addCheckboxToAlgorithmBar("Union By Rank");
	this.unionByRankBox.onclick = this.unionByRankChangeCallback.bind(this);
	
	this.controls.push(this.unionByRankBox);
	
	var radioButtonList = addRadioButtonGroupToAlgorithmBar(["Rank = # of nodes", 
															 "Rank = estimated height", 
															 ], 
															"RankType");
	this.rankNumberOfNodesButton = radioButtonList[0];
	this.rankNumberOfNodesButton.onclick = this.rankTypeChangedCallback.bind(this, false);
	this.controls.push(this.rankNumberOfNodesButton);

	
	this.rankEstimatedHeightButton = radioButtonList[1];
	this.rankEstimatedHeightButton.onclick = this.rankTypeChangedCallback.bind(this, true);
	this.controls.push(this.rankEstimatedHeightButton);
	
	this.rankNumberOfNodesButton.checked = !this.rankAsHeight;
	this.rankEstimatedHeightButton.checked = this.rankAsHeight;

}




			
				
DisjointSet.prototype.setup = function()
{
	this.commands = new Array();

	for (var i = 0; i < SIZE; i++)
	{
		this.cmd("CreateRectangle", this.arrayID[i], this.setData[i], ARRAY_WIDTH, ARRAY_HEIGHT, ARRAY_START_X + i *ARRAY_WIDTH, this.array_start_y);
		this.cmd("CreateLabel",this.arrayLabelID[i],  i,  ARRAY_START_X + i *ARRAY_WIDTH, this.array_start_y + ARRAY_HEIGHT);
		this.cmd("SetForegroundColor", this.arrayLabelID[i], "#0000FF");

		this.cmd("CreateCircle", this.treeID[i], i,  TREE_START_X + this.treeIndexToLocation[i] * TREE_ELEM_WIDTH, this.treeY[i]);
		this.cmd("SetForegroundColor",  this.treeID[i], FOREGROUND_COLOR);
		this.cmd("SetBackgroundColor",  this.treeID[i], BACKGROUND_COLOR);
		
	}
	
	
	animationManager.StartNewAnimation(this.commands);
	animationManager.skipForward();
	animationManager.clearHistory();		
	
}


DisjointSet.prototype.reset = function()
{
	for (var i = 0; i < SIZE; i++)
	{
		this.setData[i] = -1;
	}
	this.pathCompression = false;
	this.unionByRank = false;
	this.rankAsHeight = false;
	this.pathCompressionBox.selected = this.pathCompression;
	this.unionByRankBox.selected = this.unionByRank;
	this.rankNumberOfNodesButton.checked = !this.rankAsHeight;
	this.rankEstimatedHeightButton.checked = this.rankAsHeight;

}


DisjointSet.prototype.enableUI = function(event)
{
	for (var i = 0; i < this.controls.length; i++)
	{
		this.controls[i].disabled = false;
	}
	
	
}
DisjointSet.prototype.disableUI = function(event)
{
	for (var i = 0; i < this.controls.length; i++)
	{
		this.controls[i].disabled = true;
	}
}




DisjointSet.prototype.rankTypeChangedCallback = function(rankAsHeight, event) 
{
	if (this.rankAsHeight != rankAsHeight)
	{
			this.implementAction(this.changeRankType.bind(this),  rankAsHeight);
	}
}



DisjointSet.prototype.pathCompressionChangeCallback = function(event)
{
	if (this.pathCompression != this.pathCompressionBox.checked)
	{
		this.implementAction(this.changePathCompression.bind(this), this.pathCompressionBox.checked);
	}
}

DisjointSet.prototype.unionByRankChangeCallback = function(event)
{
	if (this.unionByRank != this.unionByRankBox.checked)
	{
		this.implementAction(this.changeUnionByRank.bind(this), this.unionByRankBox.checked);
	}
}

DisjointSet.prototype.changeRankType = function(newValue)
{
	this.commands = new Array();
	this.rankAsHeight = newValue		
	if (this.rankNumberOfNodesButton.checked == this.rankAsHeight)
	{
		this.rankNumberOfNodesButton.checked = !this.rankAsHeight;
	}
	if (this.rankEstimatedHeightButton.checked != this.rankAsHeight)
	{
		this.rankEstimatedHeightButton.checked = this.rankAsHeight;
	}
	// When we change union by rank, we can either create a blank slate using clearAll,
	// or we can rebuild the root values to what they shoue be given the current state of
	// the tree.  
	// clearAll();
	this.rebuildRootValues();
	return this.commands;			

	
}


DisjointSet.prototype.changeUnionByRank = function(newValue)
{
	this.commands = new Array();
	this.unionByRank = newValue;
	if (this.unionByRankBox.selected != this.unionByRank)
	{
		this.unionByRankBox.selected = this.unionByRank;
	}
	// When we change union by rank, we can either create a blank slate using clearAll,
	// or we can rebuild the root values to what they shoue be given the current state of
	// the tree.  
	// clearAll();
	this.rebuildRootValues();
	return this.commands;			

}


DisjointSet.prototype.changePathCompression = function(newValue)
{
	this.commands = new Array();
	this.cmd("Step");
	this.pathCompression = newValue;
	if (this.pathCompressionBox.selected != this.pathCompression)
	{
		this.pathCompressionBox.selected = this.pathCompression;
	}
        this.rebuildRootValues();
	// clearAll();
	return this.commands;			

}

DisjointSet.prototype.findCallback = function(event)
{
	var findValue;
	
	findValue = this.findField.value;
	if (findValue != "" && parseInt(findValue) < SIZE)
	{
		this.findField.value.value = "";
		this.implementAction(this.findElement.bind(this), findValue);
	}
}

DisjointSet.prototype.clearCallback = function(event)
{
	this.implementAction(this.clearData.bind(this), "");
}

DisjointSet.prototype.clearData = function(ignored)
{
	this.commands = new Array();
	clearAll();
	return this.commands;			
}


DisjointSet.prototype.getSizes = function()
{
	var sizes = new Array(SIZE);
	
	for (var i = 0; i < SIZE; i++)
	{
		sizes[i] = 1;				
	}
	var changed = true;
	while (changed)
	{
		changed = false;
		for (i = 0; i < SIZE; i++)
		{
			if (sizes[i] > 0 && this.setData[i] >= 0)
			{
				sizes[this.setData[i]] += sizes[i];
				sizes[i] = 0;
				changed = true;
			}					
		}				
	}
	return sizes;
}

DisjointSet.prototype.rebuildRootValues = function()
{
	var changed = false;
	
	if (this.unionByRank)
	{
		if (!this.rankAsHeight)
		{
			var sizes = this.getSizes();
		}
		for (var i = 0; i < SIZE; i++)
		{
			if (this.setData[i] < 0)
			{
				if (this.rankAsHeight)
				{						
					this.setData[i] = 0 - this.heights[i] - 1;
				}
				else
				{
					this.setData[i] = - sizes[i];
				}
			}
		}
	}
	else
	{
		for (i = 0; i < SIZE; i++)
		{
			if (this.setData[i] < 0)
			{
				this.setData[i] = -1;
			}
		}
	}
	for (i = 0; i < SIZE; i++)
	{
		this.cmd("SetText", this.arrayID[i], this.setData[i]);
	}
	
}

DisjointSet.prototype.unionCallback = function(event)
{
	var union1;
	var union2;
	
	union1 = this.unionField1.value;
	union2 = this.unionField2.value;
	
	
	if ( union1 != "" && parseInt(union1) < SIZE && 
		 union2 != "" && parseInt(union2) < SIZE)
	{
		this.unionField1.value = "";
		this.unionField2.value = "";
		this.implementAction(this.doUnion.bind(this), union1 + ";" + union2);		
	}
}


DisjointSet.prototype.clearAll = function()
{
	for (var i = 0; i < SIZE; i++)
	{
		if (this.setData[i] >= 0)
		{
			this.cmd("Disconnect", this.treeID[i], this.treeID[this.setData[i]]);
		}
		this.setData[i] = -1;
		this.cmd("SetText", this.arrayID[i], this.setData[i]);
		this.treeIndexToLocation[i] = i;
		this.locationToTreeIndex[i] = i;
		this.treeY[i] =  this.tree_start_y;
		this.cmd("SetPosition", this.treeID[i], TREE_START_X + this.treeIndexToLocation[i] * TREE_ELEM_WIDTH, this.treeY[i]);				
	}
	
	
}

		
DisjointSet.prototype.findElement = function(findValue)
{
	this.commands = new Array();
	

	var found = this.doFind(parseInt(findValue));
	
	if (this.pathCompression)
	{
		var changed = this.adjustHeights();
		if (changed)
		{
			this.animateNewPositions();
		}
	}
	return this.commands;
}
		
		
		
DisjointSet.prototype.doFind = function(elem)
{
	this.cmd("SetHighlight", this.treeID[elem], 1);
	this.cmd("SetHighlight", this.arrayID[elem], 1);
	this.cmd("Step");
	this.cmd("SetHighlight", this.treeID[elem], 0);
	this.cmd("SetHighlight", this.arrayID[elem], 0);
	if (this.setData[elem] >= 0)
	{
		var treeRoot = this.doFind(this.setData[elem]);
		if (this.pathCompression)
		{
			if (this.setData[elem] != treeRoot)
			{
				this.cmd("Disconnect", this.treeID[elem], this.treeID[this.setData[elem]]);
				this.setData[elem] = treeRoot;
				this.cmd("SetText", this.arrayID[elem], this.setData[elem]);
				this.cmd("Connect", this.treeID[elem],
							   this.treeID[treeRoot],
							   FOREGROUND_COLOR, 
							   0, // Curve
							   1, // Directed
							   ""); // Label
			}
		}				
		return treeRoot;
	}
	else
	{
		return elem;
	}
	
}
		
		
DisjointSet.prototype.findRoot = function (elem)
{
	while (this.setData[elem] >= 0)
		elem = this.setData[elem];
	return elem;			
}
		
		
		
// After linking two trees, move them next to each other.			
DisjointSet.prototype.adjustXPos = function(pos1, pos2)
{

	var left1 = this.treeIndexToLocation[pos1];
	while (left1 > 0 && this.findRoot(this.locationToTreeIndex[left1 - 1]) == pos1)
	{
		left1--;
	}
	var right1 = this.treeIndexToLocation[pos1];
	while (right1 < SIZE - 1 && this.findRoot(this.locationToTreeIndex[right1 + 1]) == pos1)
	{
		right1++;
	}
	var left2 = this.treeIndexToLocation[pos2];
	while (left2 > 0 && this.findRoot(this.locationToTreeIndex[left2-1]) == pos2)
	{
		left2--;
	}
	var right2 = this.treeIndexToLocation[pos2];
	while (right2 < SIZE - 1 && this.findRoot(this.locationToTreeIndex[right2 + 1]) == pos2)
	{
		right2++;
	}
	if (right1 == left2-1)
	{
		return false;
	}
	
	var tmpLocationToTreeIndex = new Array(SIZE);
	var nextInsertIndex = 0;
	for (var i = 0; i <= right1; i++)
	{
		tmpLocationToTreeIndex[nextInsertIndex++] = this.locationToTreeIndex[i];
	}
	for (i = left2; i <= right2; i++)
	{
		tmpLocationToTreeIndex[nextInsertIndex++] = this.locationToTreeIndex[i];
	}
	for (i = right1+1; i < left2; i++)
	{
		tmpLocationToTreeIndex[nextInsertIndex++] = this.locationToTreeIndex[i];				
	}
	for (i = right2+1; i < SIZE; i++)
	{
		tmpLocationToTreeIndex[nextInsertIndex++] = this.locationToTreeIndex[i];
	}
	for (i = 0; i < SIZE; i++)
	{
		this.locationToTreeIndex[i] = tmpLocationToTreeIndex[i];
	}
	for (i = 0; i < SIZE; i++)
	{
		this.treeIndexToLocation[this.locationToTreeIndex[i]] = i;
	}
	return true;
}

DisjointSet.prototype.doUnion = function(value)
{
	this.commands = new Array();
	var args = value.split(";");
	var arg1 = this.doFind(parseInt(args[0]));

	this.cmd("CreateHighlightCircle", this.highlight1ID, HIGHLIGHT_CIRCLE_COLOR, TREE_START_X + this.treeIndexToLocation[arg1] * TREE_ELEM_WIDTH, this.treeY[arg1]);

	
	var arg2 = this.doFind(parseInt(args[1]));
	this.cmd("CreateHighlightCircle", this.highlight2ID, HIGHLIGHT_CIRCLE_COLOR, TREE_START_X + this.treeIndexToLocation[arg2] * TREE_ELEM_WIDTH, this.treeY[arg2]);
	
	
	if (arg1 == arg2)
	{
		this.cmd("Delete", this.highlight1ID);
		this.cmd("Delete", this.highlight2ID);
		return this.commands;
	}
	
	var changed;
	
	if (this.treeIndexToLocation[arg1] < this.treeIndexToLocation[arg2])
	{
		changed = this.adjustXPos(arg1, arg2) || changed
	}
	else
	{
		changed = this.adjustXPos(arg2, arg1) || changed
	}
	
	
	if (this.unionByRank && this.setData[arg1] < this.setData[arg2])
	{
		var tmp = arg1;
		arg1 = arg2;
		arg2 = tmp;
	}

	if (this.unionByRank && this.rankAsHeight)
	{
		if (this.setData[arg2] == this.setData[arg1])
		{
			this.setData[arg2] -= 1;
		}
	}
	else if (this.unionByRank)
	{
		this.setData[arg2] = this.setData[arg2] + this.setData[arg1];				
	}
	
	this.setData[arg1] = arg2;
	
	this.cmd("SetText", this.arrayID[arg1], this.setData[arg1]);
	this.cmd("SetText", this.arrayID[arg2], this.setData[arg2]);
	
	this.cmd("Connect", this.treeID[arg1],
				   this.treeID[arg2],
				   FOREGROUND_COLOR, 
					   0, // Curve
					   1, // Directed
					   ""); // Label
	
	if (this.adjustHeights())
	{
		changed = true;
	}
			
	if (changed)
	{
		this.cmd("Step");
		this.cmd("Delete", this.highlight1ID);
		this.cmd("Delete", this.highlight2ID);
		this.animateNewPositions();
	}
	else
	{
		this.cmd("Delete", this.highlight1ID);
		this.cmd("Delete", this.highlight2ID);		
	}
	
	return this.commands;
}


DisjointSet.prototype.adjustHeights = function() 
{
	var changed = false;
	for (var i = 0; i < SIZE; i++)
	{
		this.heights[i] = 0;
	}
	
	for (var j = 0; j < SIZE; j++)
	{
		for (i = 0; i < SIZE; i++)
		{
			if (this.setData[i] >= 0)
			{
				this.heights[this.setData[i]] = Math.max(this.heights[this.setData[i]], this.heights[i] + 1);
			}
			
		}
	}
	for (j = 0; j < SIZE; j++)
	{
		for (i = 0; i < SIZE; i++)
		{
			if (this.setData[i] >= 0)
			{
				this.heights[i] = this.heights[this.setData[i]] - 1;
			}
			
		}
	}
	for (i = 0; i < SIZE; i++)
	{
		var newY = this.tree_start_y - this.heights[i] * TREE_ELEM_HEIGHT;
		if (this.treeY[i] != newY)
		{
			this.treeY[i] = newY;
			changed = true;
		}
	}
	return changed;
}

	
DisjointSet.prototype.animateNewPositions = function()
{
	for (var i = 0; i < SIZE; i++)
	{
		this.cmd("Move", this.treeID[i], TREE_START_X + this.treeIndexToLocation[i] * TREE_ELEM_WIDTH, this.treeY[i]);
	}
}



var currentAlg;

function init()
{
	var animManag = initCanvas();
	currentAlg = new DisjointSet(animManag, canvas.width, canvas.height);
}

