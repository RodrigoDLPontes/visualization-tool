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


var LINK_COLOR = "#007700";
var HIGHLIGHT_CIRCLE_COLOR = "#007700";
var MERGE_SEPARATING_LINE_COLOR = "#0000FF";
var FOREGROUND_COLOR = "#007700";
var BACKGROUND_COLOR = "#EEFFEE";
var DEGREE_OFFSET_X = -20;
var DEGREE_OFFSET_Y = -20;

var DELETE_LAB_X = 30;
var DELETE_LAB_Y = 50;


var NODE_WIDTH = 60;
var NODE_HEIGHT = 70

var STARTING_X = 70;
var STARTING_Y = 80;

var INSERT_X = 30;
var INSERT_Y = 25


function BinomialQueue(am, w, h)
{
	this.init(am, w, h);
	
}

BinomialQueue.prototype = new Algorithm();
BinomialQueue.prototype.constructor = BinomialQueue;
BinomialQueue.superclass = Algorithm.prototype;

		
		
BinomialQueue.prototype.init = function(am, w, h)
{
	BinomialQueue.superclass.init.call(this, am, w, h);
	this.addControls();
	this.treeRoot = null;
	this.currentLayer = 1;
	this.animationManager.setAllLayers([0,this.currentLayer]);
	this.nextIndex = 0;
}


BinomialQueue.prototype.addControls =  function()
{
	this.controls = [];
	this.insertField = addControlToAlgorithmBar("Text", "");
	this.insertField.onkeydown = this.returnSubmit(this.insertField,  this.insertCallback.bind(this), 4);
	this.controls.push(this.insertField);

	this.insertButton = addControlToAlgorithmBar("Button", "Insert");
	this.insertButton.onclick = this.insertCallback.bind(this);
	this.controls.push(this.insertButton);

	this.removeSmallestButton = addControlToAlgorithmBar("Button", "Remove Smallest");
	this.removeSmallestButton.onclick = this.removeSmallestCallback.bind(this);
	this.controls.push(this.removeSmallestButton);

	this.clearHeapButton = addControlToAlgorithmBar("Button", "Clear Heap");
	this.clearHeapButton.onclick = this.clearCallback.bind(this);
	this.controls.push(this.clearHeapButton);
	
	var radioButtonList = addRadioButtonGroupToAlgorithmBar(["Logical Representation", 
															 "Internal Representation", 
															 ], 
															"BQueueRep");
	
	radioButtonList[0].onclick = this.representationChangedHandler.bind(this, true);
	radioButtonList[1].onclick = this.representationChangedHandler.bind(this, false);
	radioButtonList[0].checked = true;
	
}
		
		
BinomialQueue.prototype.representationChangedHandler = function(logicalRep, event) 
{
	if (logicalRep)
	{
		this.animationManager.setAllLayers([0,1]);
		this.currentLayer = 1;
	}
	else 
	{
		this.animationManager.setAllLayers([0,2]);
		this.currentLayer = 2;
	}
}

		
		
		
BinomialQueue.prototype.setPositions = function(tree, xPosition, yPosition) 
{
	if (tree != null)
	{
		if (tree.degree == 0)
		{
			tree.x = xPosition;
			tree.y = yPosition;
			return this.setPositions(tree.rightSib, xPosition + NODE_WIDTH, yPosition);
		}
		else if (tree.degree == 1)
		{
			tree.x = xPosition;
			tree.y = yPosition;
			this.setPositions(tree.leftChild, xPosition, yPosition + NODE_HEIGHT);
			return this.setPositions(tree.rightSib, xPosition + NODE_WIDTH, yPosition);					
		}
		else
		{
			var treeWidth = Math.pow(2, tree.degree - 1);
			tree.x = xPosition + (treeWidth - 1) * NODE_WIDTH;
			tree.y = yPosition;
			this.setPositions(tree.leftChild, xPosition, yPosition + NODE_HEIGHT);
			return this.setPositions(tree.rightSib, xPosition + treeWidth * NODE_WIDTH, yPosition);
		}
	}
	return xPosition;
}
		
BinomialQueue.prototype.moveTree = function(tree)
{
	if (tree != null)
	{
		this.cmd("Move", tree.graphicID, tree.x, tree.y);
		this.cmd("Move", tree.internalGraphicID, tree.x, tree.y);
		this.cmd("Move", tree.degreeID, tree.x  + DEGREE_OFFSET_X, tree.y + DEGREE_OFFSET_Y);
		
		this.moveTree(tree.leftChild);
		this.moveTree(tree.rightSib);
	}
}


BinomialQueue.prototype.insertCallback = function(event)
{
	var insertedValue;
	
	insertedValue = this.normalizeNumber(this.insertField.value, 4);
	if (insertedValue != "")
	{
		this.insertField.value = "";
		this.implementAction(this.insertElement.bind(this),insertedValue);
	}
}
		
BinomialQueue.prototype.clearCallback = function(event)
{
	this.clear();
}
		
BinomialQueue.prototype.clear  = function()
{
	this.commands = new Array();
	
	this.animationManager.StartNewAnimation(this.commands);
	this.animationManager.skipForward();
	this.animationManager.clearHistory();
	this.actionHistory = new Array();
}

		
BinomialQueue.prototype.reset = function()
{
	this.treeRoot = null;
	this.nextIndex = 0;
}
		
BinomialQueue.prototype.removeSmallestCallback = function(event)
{
	this.implementAction(this.removeSmallest.bind(this),"");
}

		
		
BinomialQueue.prototype.removeSmallest = function(dummy)
{
	this.commands = new Array();
	
	if (this.treeRoot != null)
	{
		var  tmp;
		var prev;
		var smallest = this.treeRoot;
		
		this.cmd("SetHighlight", smallest.graphicID, 1);
		this.cmd("SetHighlight", smallest.internalGraphicID, 1);
		
		for (tmp = this.treeRoot.rightSib; tmp != null; tmp = tmp.rightSib) 
		{
			this.cmd("SetHighlight", tmp.graphicID, 1);
			this.cmd("SetHighlight", tmp.internalGraphicID, 1);
			this.cmd("Step");
			if (tmp.data < smallest.data) 
			{
				this.cmd("SetHighlight", smallest.graphicID, 0);
				this.cmd("SetHighlight", smallest.internalGraphicID, 0);
				smallest = tmp;
			} 
			else 
			{
				this.cmd("SetHighlight", tmp.graphicID, 0);
				this.cmd("SetHighlight", tmp.internalGraphicID, 0);
			}
		}
		
		if (smallest == this.treeRoot) {
			this.treeRoot = this.treeRoot.rightSib;
			prev = null;
		} 
		else 
		{
			for (prev = this.treeRoot; prev.rightSib != smallest; prev = prev.rightSib) ;
			prev.rightSib = prev.rightSib.rightSib;
			
		}
		var moveLabel = this.nextIndex++;
		this.cmd("SetText", smallest.graphicID, "");
		this.cmd("SetText", smallest.internalGraphicID, "");
		this.cmd("CreateLabel", moveLabel, smallest.data, smallest.x, smallest.y);
		this.cmd("Move", moveLabel, DELETE_LAB_X, DELETE_LAB_Y);
		this.cmd("Step");
		if (prev != null && prev.rightSib != null)
		{
			this.cmd("Connect", prev.internalGraphicID, 
					 prev.rightSib.internalGraphicID,
					 FOREGROUND_COLOR,
					 0, // Curve
					 1, // Directed
					 ""); // Label
			
		}
		this.cmd("Delete", smallest.graphicID);
		this.cmd("Delete", smallest.internalGraphicID);
		this.cmd("Delete", smallest.degreeID);
		
		this.secondaryTreeRoot = this.reverse(smallest.leftChild);
		for (tmp = this.secondaryTreeRoot; tmp != null; tmp = tmp.rightSib)
			tmp.parent = null;
		this.merge();
		this.cmd("Delete", moveLabel);
	}
	return this.commands;
}

BinomialQueue.prototype.reverse = function(tree)
{
	var newTree = null;
	var tmp;
	while (tree != null) 
	{
		if (tree.rightSib != null)
		{
			this.cmd("Disconnect", tree.internalGraphicID, tree.rightSib.internalGraphicID);
			this.cmd("Connect", tree.rightSib.internalGraphicID, 
					 tree.internalGraphicID,
					 FOREGROUND_COLOR,
					 0, // Curve
					 1, // Directed
					 ""); // Label
		}
		tmp = tree;
		tree = tree.rightSib;
		tmp.rightSib = newTree;
		tmp.parent=null;
		newTree = tmp;
	}
	return newTree;
}
		
		
BinomialQueue.prototype.insertElement = function(insertedValue)
{
	this.commands = new Array();
	
	var insertNode = new BinomialNode(insertedValue, this.nextIndex++,  INSERT_X, INSERT_Y);
	insertNode.internalGraphicID = this.nextIndex++;
	insertNode.degreeID= this.nextIndex++;
	this.cmd("CreateCircle", insertNode.graphicID, insertedValue, INSERT_X, INSERT_Y);
	this.cmd("SetForegroundColor", insertNode.graphicID, FOREGROUND_COLOR);
	this.cmd("SetBackgroundColor", insertNode.graphicID, BACKGROUND_COLOR);
	this.cmd("SetLayer", insertNode.graphicID, 1);
	this.cmd("CreateCircle", insertNode.internalGraphicID, insertedValue, INSERT_X, INSERT_Y);
	this.cmd("SetForegroundColor", insertNode.internalGraphicID, FOREGROUND_COLOR);
	this.cmd("SetBackgroundColor", insertNode.internalGraphicID, BACKGROUND_COLOR);
	this.cmd("SetLayer", insertNode.internalGraphicID, 2);
	this.cmd("CreateLabel", insertNode.degreeID, insertNode.degree, insertNode.x  + DEGREE_OFFSET_X, insertNode.y + DEGREE_OFFSET_Y);
	this.cmd("SetTextColor", insertNode.degreeID, "#0000FF");
	this.cmd("SetLayer", insertNode.degreeID, 2);
	this.cmd("Step");
	
	if (this.treeRoot == null)
	{
		this.treeRoot = insertNode;
		this.setPositions(this.treeRoot, STARTING_X, STARTING_Y);
		this.moveTree(this.treeRoot);
	}
	else
	{
		this.secondaryTreeRoot = insertNode;
		this.merge();				
	}
	
	return this.commands;
}

		
BinomialQueue.prototype.merge = function()
{
	if (this.treeRoot != null)
	{
		var leftSize = this.setPositions(this.treeRoot, STARTING_X, STARTING_Y);
		this.setPositions(this.secondaryTreeRoot, leftSize + NODE_WIDTH, STARTING_Y);
		this.moveTree(this.secondaryTreeRoot);
		this.moveTree(this.treeRoot);
		var lineID = this.nextIndex++;
		this.cmd("CreateRectangle", lineID, "", 0, 200, leftSize, 50,"left","top");
		this.cmd("SetForegroundColor", lineID, MERGE_SEPARATING_LINE_COLOR);
		this.cmd("SetLayer", lineID, 0);
		this.cmd("Step");
	}
	else
	{
		this.treeRoot = this.secondaryTreeRoot;
		this.secondaryTreeRoot = null;
		this.setPositions(this.treeRoot,  NODE_WIDTH, STARTING_Y);
		this.moveTree(this.treeRoot);
		return;
	}
	while (this.secondaryTreeRoot != null)
	{
		var tmp  = this.secondaryTreeRoot;
		this.secondaryTreeRoot = this.secondaryTreeRoot.rightSib;
		if (this.secondaryTreeRoot != null)
		{
			this.cmd("Disconnect", tmp.internalGraphicID, this.secondaryTreeRoot.internalGraphicID);
		}
		if (tmp.degree <= this.treeRoot.degree)
		{
			tmp.rightSib = this.treeRoot;
			this.treeRoot = tmp;
			this.cmd("Connect", this.treeRoot.internalGraphicID, 
					 this.treeRoot.rightSib.internalGraphicID,
					 FOREGROUND_COLOR,
					 0, // Curve
					 1, // Directed
					 ""); // Label
		}
		else
		{
			var tmp2  = this.treeRoot;
			while (tmp2.rightSib != null && tmp2.rightSib.degree < tmp.degree)
			{
				tmp2 = tmp2. rightSib;
			}
			if (tmp2.rightSib != null)
			{
				this.cmd("Disconnect", tmp2.internalGraphicID, tmp2.rightSib.internalGraphicID);
				this.cmd("Connect", tmp.internalGraphicID, 
						 tmp2.rightSib.internalGraphicID,
						 FOREGROUND_COLOR,
						 0, // Curve
						 1, // Directed
						 ""); // Label
			}
			tmp.rightSib= tmp2.rightSib;
			tmp2.rightSib = tmp;
			this.cmd("Connect", tmp2.internalGraphicID, 
					 tmp.internalGraphicID,
					 FOREGROUND_COLOR,
					 0, // Curve
					 1, // Directed
					 ""); // Label
		}
		leftSize = this.setPositions(this.treeRoot, STARTING_X, STARTING_Y);
		this.setPositions(this.secondaryTreeRoot, leftSize + NODE_WIDTH, STARTING_Y);
		this.moveTree(this.secondaryTreeRoot);
		this.moveTree(this.treeRoot);
		this.cmd("Move", lineID, leftSize, 50);
		this.cmd("Step");
	}
	this.cmd("Delete", lineID);
	this.combineNodes();
}


BinomialQueue.prototype.combineNodes = function()
{
	var tmp;
	var tmp2;
	while ((this.treeRoot != null && this.treeRoot.rightSib != null && this.treeRoot.degree == this.treeRoot.rightSib.degree) &&
		   (this.treeRoot.rightSib.rightSib == null || this.treeRoot.rightSib.degree != this.treeRoot.rightSib.rightSib.degree))
	{
		this.cmd("Disconnect", this.treeRoot.internalGraphicID, this.treeRoot.rightSib.internalGraphicID);
		if (this.treeRoot.rightSib.rightSib != null)
		{
			this.cmd("Disconnect", this.treeRoot.rightSib.internalGraphicID, this.treeRoot.rightSib.rightSib.internalGraphicID);					
		}
		if (this.treeRoot.data < this.treeRoot.rightSib.data) 
		{
			tmp = this.treeRoot.rightSib;
			this.treeRoot.rightSib = tmp.rightSib;
			tmp.rightSib = this.treeRoot.leftChild;
			this.treeRoot.leftChild = tmp;
			tmp.parent = this.treeRoot;
		} 
		else 
		{
			tmp = this.treeRoot;
			this.treeRoot = this.treeRoot.rightSib;
			tmp.rightSib = this.treeRoot.leftChild;
			this.treeRoot.leftChild = tmp;
			tmp.parent = this.treeRoot;
		}
		this.cmd("Connect", this.treeRoot.graphicID, 
				 this.treeRoot.leftChild.graphicID,
				 FOREGROUND_COLOR,
				 0, // Curve
				 0, // Directed
				 ""); // Label
		
		
		this.cmd("Connect", this.treeRoot.internalGraphicID, 
				 this.treeRoot.leftChild.internalGraphicID,
				 FOREGROUND_COLOR,
				 0.15, // Curve
				 1, // Directed
				 ""); // Label
		
		this.cmd("Connect",  this.treeRoot.leftChild.internalGraphicID, 
				 this.treeRoot.internalGraphicID,
				 FOREGROUND_COLOR,
				 0, // Curve
				 1, // Directed
				 ""); // Label					
		if (this.treeRoot.leftChild.rightSib != null)
		{
			this.cmd("Disconnect", this.treeRoot.internalGraphicID, this.treeRoot.leftChild.rightSib.internalGraphicID);
			this.cmd("Connect", this.treeRoot.leftChild.internalGraphicID, 
					 this.treeRoot.leftChild.rightSib.internalGraphicID,
					 FOREGROUND_COLOR,
					 0, // Curve
					 1, // Directed
					 ""); // Label
		}
		if (this.treeRoot.rightSib != null)
		{
			this.cmd("Connect", this.treeRoot.internalGraphicID, 
					 this.treeRoot.rightSib.internalGraphicID,
					 FOREGROUND_COLOR,
					 0, // Curve
					 1, // Directed
					 ""); // Label
		}
		
		this.treeRoot.degree++;
		
		this.cmd("SetText", this.treeRoot.degreeID, this.treeRoot.degree);
		
		
		this.setPositions(this.treeRoot, STARTING_X, STARTING_Y);
		this.moveTree(this.treeRoot);	
		this.cmd("Step");
	}
	
	tmp2 = this.treeRoot;
	while (tmp2 != null && tmp2.rightSib != null && tmp2.rightSib.rightSib != null) 
	{
		if (tmp2.rightSib.degree != tmp2.rightSib.rightSib.degree) 
		{
			tmp2 = tmp2.rightSib;
		} else if ((tmp2.rightSib.rightSib.rightSib != null) &&
				   (tmp2.rightSib.rightSib.degree == tmp2.rightSib.rightSib.rightSib.degree)) 
		{
			tmp2 = tmp2.rightSib;
		} 
		else 
		{
			this.cmd("Disconnect", tmp2.rightSib.internalGraphicID,  tmp2.rightSib.rightSib.internalGraphicID);
			this.cmd("Disconnect", tmp2.internalGraphicID,  tmp2.rightSib.internalGraphicID);
			if (tmp2.rightSib.rightSib.rightSib != null)
			{
				this.cmd("Disconnect", tmp2.rightSib.rightSib.internalGraphicID,  tmp2.rightSib.rightSib.rightSib.internalGraphicID);
			}
			
			var tempRoot;
			if (tmp2.rightSib.data < tmp2.rightSib.rightSib.data) 
			{
				tmp = tmp2.rightSib.rightSib;
				tmp2.rightSib.rightSib = tmp.rightSib;
				
				tmp.rightSib = tmp2.rightSib.leftChild;
				tmp2.rightSib.leftChild = tmp;
				tmp.parent = tmp2.rightSib;
				tmp2.rightSib.degree++;
				this.cmd("SetText", tmp2.rightSib.degreeID, tmp2.rightSib.degree);
				tempRoot = tmp2.rightSib;
				
			}
			else
			{
				tmp = tmp2.rightSib;
				tmp2.rightSib = tmp2.rightSib.rightSib;
				tmp.rightSib = tmp2.rightSib.leftChild;
				tmp2.rightSib.leftChild = tmp;
				tmp.parent = tmp2.rightSib;
				tmp2.rightSib.degree++;
				this.cmd("SetText", tmp2.rightSib.degreeID, tmp2.rightSib.degree);
				tempRoot = tmp2.rightSib;
			}
			this.cmd("Connect", tempRoot.graphicID, 
					 tempRoot.leftChild.graphicID,
					 FOREGROUND_COLOR,
					 0, // Curve
					 0, // Directed
					 ""); // Label
			
			this.cmd("Connect", tempRoot.internalGraphicID, 
					 tempRoot.leftChild.internalGraphicID,
					 FOREGROUND_COLOR,
					 0.15, // Curve
					 1, // Directed
					 ""); // Label
			
			this.cmd("Connect",  tempRoot.leftChild.internalGraphicID, 
					 tempRoot.internalGraphicID,
					 FOREGROUND_COLOR,
					 0, // Curve
					 1, // Directed
					 ""); // Label
			
			this.cmd("Connect",  tmp2.internalGraphicID, 
					 tempRoot.internalGraphicID,
					 FOREGROUND_COLOR,
					 0, // Curve
					 1, // Directed
					 ""); // Label
			
			if (tempRoot.leftChild.rightSib != null)
			{
				this.cmd("Disconnect",tempRoot.internalGraphicID, tempRoot.leftChild.rightSib.internalGraphicID);
				this.cmd("Connect",tempRoot.leftChild.internalGraphicID, 
						 tempRoot.leftChild.rightSib.internalGraphicID,
						 FOREGROUND_COLOR,
						 0, // Curve
						 1, // Directed
						 ""); // Label);
			}
			if (tempRoot.rightSib != null)
			{
				this.cmd("Connect",tempRoot.internalGraphicID, 
						 tempRoot.rightSib.internalGraphicID,
						 FOREGROUND_COLOR,
						 0, // Curve
						 1, // Directed
						 ""); // Label);					
			}
			
			
			
			
			this.setPositions(this.treeRoot, STARTING_X, STARTING_Y);
			this.moveTree(this.treeRoot);	
			this.cmd("Step");
		}
	}
}


BinomialQueue.prototype.enableUI = function(event)
{
	for (var i = 0; i < this.controls.length; i++)
	{
		this.controls[i].disabled = false;
	}
	
	
}
BinomialQueue.prototype.disableUI = function(event)
{
	for (var i = 0; i < this.controls.length; i++)
	{
		this.controls[i].disabled = true;
	}
}



var currentAlg;

function init()
{
	var animManag = initCanvas();
	currentAlg = new BinomialQueue(animManag, canvas.width, canvas.height);
}



		
function BinomialNode(val, id, initialX, initialY)		
{
	this.data = val;
	this.x = initialX;
	this.y = initialY;
	this.graphicID = id;
	this.degree = 0;
	this.leftChild = null;
	this.rightSib = null;
	this.parent = null;
	this.internalGraphicID = -1;
	this.degreeID = -1;
}


