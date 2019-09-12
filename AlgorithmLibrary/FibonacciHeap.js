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


FibonacciHeap.LINK_COLOR = "#007700";
FibonacciHeap.FOREGROUND_COLOR = "#007700";
FibonacciHeap.BACKGROUND_COLOR = "#EEFFEE";
FibonacciHeap.INDEX_COLOR = "#0000FF";

FibonacciHeap.DEGREE_OFFSET_X = -20;
FibonacciHeap.DEGREE_OFFSET_Y = -20;

FibonacciHeap.DELETE_LAB_X = 30;
FibonacciHeap.DELETE_LAB_Y = 50;

FibonacciHeap.NODE_WIDTH = 60;
FibonacciHeap.NODE_HEIGHT = 70

FibonacciHeap.STARTING_X = 70;

FibonacciHeap.INSERT_X = 30;
FibonacciHeap.INSERT_Y = 25

FibonacciHeap.STARTING_Y = 100;
FibonacciHeap.MAX_DEGREE = 7;
FibonacciHeap.DEGREE_ARRAY_ELEM_WIDTH = 30;
FibonacciHeap.DEGREE_ARRAY_ELEM_HEIGHT = 30;
FibonacciHeap.DEGREE_ARRAY_START_X = 500;
FibonacciHeap.INDEGREE_ARRAY_START_Y = 50;

FibonacciHeap.TMP_PTR_Y = 60;

function FibonacciHeap(am, w, h)
{
	this.init(am, w, h);
	
}

FibonacciHeap.prototype = new Algorithm();
FibonacciHeap.prototype.constructor = FibonacciHeap;
FibonacciHeap.superclass = Algorithm.prototype;

		
		
FibonacciHeap.prototype.init = function(am, w, h)
{
	FibonacciHeap.superclass.init.call(this, am, w, h);
	this.addControls();
	this.treeRoot = null;
	this.currentLayer = 1;
	this.animationManager.setAllLayers([0,this.currentLayer]);
	this.minID = 0;
	this.nextIndex = 1;
}


FibonacciHeap.prototype.addControls =  function()
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
		
		
FibonacciHeap.prototype.representationChangedHandler = function(logicalRep, event) 
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

		
		
		
FibonacciHeap.prototype.setPositions = function(tree, xPosition, yPosition) 
{
	if (tree != null)
	{
		if (tree.degree == 0)
		{
			tree.x = xPosition;
			tree.y = yPosition;
			return this.setPositions(tree.rightSib, xPosition + FibonacciHeap.NODE_WIDTH, yPosition);
		}
		else if (tree.degree == 1)
		{
			tree.x = xPosition;
			tree.y = yPosition;
			this.setPositions(tree.leftChild, xPosition, yPosition + FibonacciHeap.NODE_HEIGHT);
			return this.setPositions(tree.rightSib, xPosition + FibonacciHeap.NODE_WIDTH, yPosition);					
		}
		else
		{
			var treeWidth = Math.pow(2, tree.degree - 1);
			tree.x = xPosition + (treeWidth - 1) * FibonacciHeap.NODE_WIDTH;
			tree.y = yPosition;
			this.setPositions(tree.leftChild, xPosition, yPosition + FibonacciHeap.NODE_HEIGHT);
			return this.setPositions(tree.rightSib, xPosition + treeWidth * FibonacciHeap.NODE_WIDTH, yPosition);
		}
	}
	return xPosition;
}
		
FibonacciHeap.prototype.moveTree = function(tree)
{
	if (tree != null)
	{
		this.cmd("Move", tree.graphicID, tree.x, tree.y);
		this.cmd("Move", tree.internalGraphicID, tree.x, tree.y);
		this.cmd("Move", tree.degreeID, tree.x  + FibonacciHeap.DEGREE_OFFSET_X, tree.y + FibonacciHeap.DEGREE_OFFSET_Y);
		
		this.moveTree(tree.leftChild);
		this.moveTree(tree.rightSib);
	}
}


FibonacciHeap.prototype.insertCallback = function(event)
{
	var insertedValue;
	
	insertedValue = this.normalizeNumber(this.insertField.value, 4);
	if (insertedValue != "")
	{
		this.insertField.value = "";
		this.implementAction(this.insertElement.bind(this),insertedValue);
	}
}
		
FibonacciHeap.prototype.clearCallback = function(event)
{
	this.implementAction(this.clear.bind(this),"");
}
		
FibonacciHeap.prototype.clear  = function()
{
	this.commands = new Array();
	
	
	this.deleteTree(this.treeRoot);
	
	this.cmd("Delete", this.minID);
	this.nextIndex = 1;
	this.treeRoot = null;
	this.minElement = null;
	return this.commands;
}


FibonacciHeap.prototype.deleteTree = function(tree)
{
	if (tree != null)
	{
		this.cmd("Delete", tree.graphicID);	
		this.cmd("Delete", tree.internalGraphicID);
		this.cmd("Delete", tree.degreeID);
		this.deleteTree(tree.leftChild);
		this.deleteTree(tree.rightSib);
	}
}
		
FibonacciHeap.prototype.reset = function()
{
	this.treeRoot = null;
	this.nextIndex = 1;
}
		
FibonacciHeap.prototype.removeSmallestCallback = function(event)
{
	this.implementAction(this.removeSmallest.bind(this),"");
}

		
		
FibonacciHeap.prototype.removeSmallest = function(dummy)
{
	this.commands = new Array();
	
	if (this.treeRoot != null)
	{
		var  tmp;
		var prev;
		
		
		
		if (this.minElement == this.treeRoot) {
			this.treeRoot = this.treeRoot.rightSib;
			prev = null;
		} 
		else 
		{
			for (prev = this.treeRoot; prev.rightSib != this.minElement; prev = prev.rightSib) ;
			prev.rightSib = prev.rightSib.rightSib;
			
		}
		var moveLabel = this.nextIndex++;
		this.cmd("SetText", this.minElement.graphicID, "");
		this.cmd("SetText", this.minElement.internalGraphicID, "");
		this.cmd("CreateLabel", moveLabel, this.minElement.data, this.minElement.x, this.minElement.y);
		this.cmd("Move", moveLabel, FibonacciHeap.DELETE_LAB_X, FibonacciHeap.DELETE_LAB_Y);
		this.cmd("Step");
		this.cmd("Delete", this.minID);
		var childList = this.minElement.leftChild;
		if (this.treeRoot == null)
		{
			this.cmd("Delete", this.minElement.graphicID);
			this.cmd("Delete", this.minElement.internalGraphicID);
			this.cmd("Delete", this.minElement.degreeID);
			this.treeRoot = childList;
			this.minElement = null;
			if (this.treeRoot != null)
			{
				for (tmp = this.treeRoot; tmp != null; tmp = tmp.rightSib)
				{
					if (this.minElement == null || this.minElement.data > tmp.data)
					{
						this.minElement = tmp;
						
					}
				}
				this.cmd("CreateLabel", this.minID, "Min element", this.minElement.x, FibonacciHeap.TMP_PTR_Y);
				this.cmd("Connect", this.minID, 
						 this.minElement.graphicID,
						 FibonacciHeap.FOREGROUND_COLOR,
						 0, // Curve
						 1, // Directed
						 ""); // Label
				this.cmd("Connect", this.minID, 
						 this.minElement.internalGraphicID,
						 FibonacciHeap.FOREGROUND_COLOR,
						 0, // Curve
						 1, // Directed
						 ""); // Label
				
			}
			
				this.SetAllTreePositions(this.treeRoot, []);
				this.MoveAllTrees(this.treeRoot, []);
			this.cmd("Delete", moveLabel);
				return this.commands;			
			
			
		}
		else if (childList == null)
		{
			if (prev != null && prev.rightSib != null)
			{
				this.cmd("Connect", prev.internalGraphicID, 
						 prev.rightSib.internalGraphicID,
						 FibonacciHeap.FOREGROUND_COLOR,
						 0.15, // Curve
						 1, // Directed
						 ""); // Label
				this.cmd("Connect", prev.rightSib.internalGraphicID, 
						 prev.internalGraphicID,
						 FibonacciHeap.FOREGROUND_COLOR,
						 0.15, // Curve
						 1, // Directed
						 ""); // Label
				
			}
		}
		else
		{
			var tmp;
			for (tmp = childList; tmp.rightSib != null; tmp = tmp.rightSib)
			{
				tmp.parent = null;
			}
			tmp.parent = null;

			// TODO:  Add in implementation links
			if (prev == null)
			{
				this.cmd("Connect", tmp.internalGraphicID, 
						 this.treeRoot.internalGraphicID,
						 FibonacciHeap.FOREGROUND_COLOR,
						 0.15, // Curve
						 1, // Directed
						 ""); // Label
				this.cmd("Connect", this.treeRoot.internalGraphicID, 
						tmp.internalGraphicID,
						 FibonacciHeap.FOREGROUND_COLOR,
						 0.15, // Curve
						 1, // Directed
						 ""); // Label
				
				tmp.rightSib = this.treeRoot;
				this.treeRoot = childList;				
			}
			else
			{
				this.cmd("Connect", prev.internalGraphicID, 
						 childList.internalGraphicID,
						 FibonacciHeap.FOREGROUND_COLOR,
						 0.15, // Curve
						 1, // Directed
						 ""); // Label
				this.cmd("Connect", childList.internalGraphicID, 
						 prev.internalGraphicID,
						 FibonacciHeap.FOREGROUND_COLOR,
						 0.15, // Curve
						 1, // Directed
						 ""); // Label
				
				if (prev.rightSib != null)
				{
					this.cmd("Connect", prev.rightSib.internalGraphicID, 
							 tmp.internalGraphicID,
							 FibonacciHeap.FOREGROUND_COLOR,
							 0.15, // Curve
							 1, // Directed
							 ""); // Label
					this.cmd("Connect", tmp.internalGraphicID, 
							 prev.rightSib.internalGraphicID,
							 FibonacciHeap.FOREGROUND_COLOR,
							 0.15, // Curve
							 1, // Directed
							 ""); // Label
				}
				tmp.rightSib = prev.rightSib;
				prev.rightSib = childList;				
			}			
		}
		this.cmd("Delete", this.minElement.graphicID);
		this.cmd("Delete", this.minElement.internalGraphicID);
		this.cmd("Delete", this.minElement.degreeID);
		
		this.SetAllTreePositions(this.treeRoot, []);
		this.MoveAllTrees(this.treeRoot, []);
		this.fixAfterRemoveMin();
		this.cmd("Delete", moveLabel);
	}
	return this.commands;
}
		
		
FibonacciHeap.prototype.insertElement = function(insertedValue)
{
	this.commands = new Array();
	
	var insertNode = new BinomialNode(insertedValue, this.nextIndex++,  FibonacciHeap.INSERT_X, FibonacciHeap.INSERT_Y);
	insertNode.internalGraphicID = this.nextIndex++;
	insertNode.degreeID= this.nextIndex++;
	this.cmd("CreateCircle", insertNode.graphicID, insertedValue, FibonacciHeap.INSERT_X, FibonacciHeap.INSERT_Y);
	this.cmd("SetForegroundColor", insertNode.graphicID, FibonacciHeap.FOREGROUND_COLOR);
	this.cmd("SetBackgroundColor", insertNode.graphicID, FibonacciHeap.BACKGROUND_COLOR);
	this.cmd("SetLayer", insertNode.graphicID, 1);
	this.cmd("CreateCircle", insertNode.internalGraphicID, insertedValue, FibonacciHeap.INSERT_X, FibonacciHeap.INSERT_Y);
	this.cmd("SetForegroundColor", insertNode.internalGraphicID, FibonacciHeap.FOREGROUND_COLOR);
	this.cmd("SetBackgroundColor", insertNode.internalGraphicID, FibonacciHeap.BACKGROUND_COLOR);
	this.cmd("SetLayer", insertNode.internalGraphicID, 2);
	this.cmd("CreateLabel", insertNode.degreeID, insertNode.degree, insertNode.x  + FibonacciHeap.DEGREE_OFFSET_X, insertNode.y + FibonacciHeap.DEGREE_OFFSET_Y);
	this.cmd("SetTextColor", insertNode.degreeID, "#0000FF");
	this.cmd("SetLayer", insertNode.degreeID, 2);
	this.cmd("Step");
	
	if (this.treeRoot == null)
	{
		this.treeRoot = insertNode;
		this.setPositions(this.treeRoot, FibonacciHeap.STARTING_X, FibonacciHeap.STARTING_Y);
		this.moveTree(this.treeRoot);
		this.cmd("CreateLabel", this.minID, "Min element", this.treeRoot.x, FibonacciHeap.TMP_PTR_Y);
		this.minElement = this.treeRoot;
		this.cmd("Connect", this.minID, 
				 this.minElement.graphicID,
				 FibonacciHeap.FOREGROUND_COLOR,
				 0, // Curve
				 1, // Directed
				 ""); // Label
		
		this.cmd("Connect", this.minID, 
				 this.minElement.internalGraphicID,
				 FibonacciHeap.FOREGROUND_COLOR,
				 0, // Curve
				 1, // Directed
				 ""); // Label
		
	}
	else
	{
		var  tmp;
		var prev;
		
		if (this.minElement == this.treeRoot) {
			insertNode.rightSib = this.treeRoot;
			this.treeRoot = insertNode;
			
			this.cmd("Connect", this.treeRoot.internalGraphicID, 
					 this.treeRoot.rightSib.internalGraphicID,
					 FibonacciHeap.FOREGROUND_COLOR,
					 0.15, // Curve
					 1, // Directed
					 ""); // Label
			
			this.cmd("Connect", this.treeRoot.rightSib.internalGraphicID, 
					 this.treeRoot.internalGraphicID,
					 FibonacciHeap.FOREGROUND_COLOR,
					 0.15, // Curve
					 1, // Directed
					 ""); // Label
			
			this.cmd("Step");
			this.setPositions(this.treeRoot, FibonacciHeap.STARTING_X, FibonacciHeap.STARTING_Y);
			if (this.minElement.data > insertNode.data)
			{
				this.cmd("Disconnect", this.minID, this.minElement.graphicID);
				this.cmd("Disconnect", this.minID, this.minElement.internalGraphicID);
				this.minElement = insertNode;
				this.cmd("Connect", this.minID, 
						 this.minElement.graphicID,
						 FibonacciHeap.FOREGROUND_COLOR,
						 0, // Curve
						 1, // Directed
						 ""); // Label
				
				this.cmd("Connect", this.minID, 
						 this.minElement.internalGraphicID,
						 FibonacciHeap.FOREGROUND_COLOR,
						 0, // Curve
						 1, // Directed
						 ""); // Label
				
			}
			this.cmd("Move", this.minID, this.minElement.x, FibonacciHeap.TMP_PTR_Y);
			this.moveTree(this.treeRoot);
			
		} 
		else 
		{
			for (prev = this.treeRoot; prev.rightSib != this.minElement; prev = prev.rightSib) ;
			
			
			this.cmd("Disconnect", prev.internalGraphicID, prev.rightSib.internalGraphicID);
			this.cmd("Disconnect", prev.rightSib.internalGraphicID, prev.internalGraphicID);
			
			insertNode.rightSib = prev.rightSib;
			prev.rightSib = insertNode;
			
			this.cmd("Connect", prev.internalGraphicID, 
					 prev.rightSib.internalGraphicID,
					 FibonacciHeap.FOREGROUND_COLOR,
					 0.15, // Curve
					 1, // Directed
					 ""); // Label
			
			this.cmd("Connect", prev.rightSib.internalGraphicID, 
					 prev.internalGraphicID,
					 FibonacciHeap.FOREGROUND_COLOR,
					 0.15, // Curve
					 1, // Directed
					 ""); // Label
			
			if (prev.rightSib.rightSib != null)
			{
				
				this.cmd("Connect", prev.rightSib.internalGraphicID, 
						 prev.rightSib.rightSib.internalGraphicID,
						 FibonacciHeap.FOREGROUND_COLOR,
						 0.15, // Curve
						 1, // Directed
						 ""); // Label
				
				this.cmd("Connect", prev.rightSib.rightSib.internalGraphicID, 
						 prev.rightSib.internalGraphicID,
						 FibonacciHeap.FOREGROUND_COLOR,
						 0.15, // Curve
						 1, // Directed
						 ""); // Label				
			}
			
			
			this.cmd("Step");
			this.setPositions(this.treeRoot, FibonacciHeap.STARTING_X, FibonacciHeap.STARTING_Y);
			if (this.minElement.data > insertNode.data)
			{
				this.cmd("Disconnect", this.minID, this.minElement.graphicID);
				this.cmd("Disconnect", this.minID, this.minElement.internalGraphicID);
				this.minElement = insertNode;
				this.cmd("Connect", this.minID, 
						 this.minElement.graphicID,
						 FibonacciHeap.FOREGROUND_COLOR,
						 0, // Curve
						 1, // Directed
						 ""); // Label
				
				this.cmd("Connect", this.minID, 
						 this.minElement.internalGraphicID,
						 FibonacciHeap.FOREGROUND_COLOR,
						 0, // Curve
						 1, // Directed
						 ""); // Label
			}
			this.cmd("Move", this.minID, this.minElement.x, FibonacciHeap.TMP_PTR_Y);
			
			this.moveTree(this.treeRoot);

		}
		
		
		
		
		
	}
	
	return this.commands;
}

		



FibonacciHeap.prototype.fixAfterRemoveMin = function()
{
	if (this.treeRoot == null)
		return;
	var degreeArray = new Array(FibonacciHeap.MAX_DEGREE);
	var degreeGraphic = new Array(FibonacciHeap.MAX_DEGREE);
	var indexID = new Array(FibonacciHeap.MAX_DEGREE);
	var tmpPtrID = this.nextIndex++;

	var i;
	for (i = 0 ; i <= FibonacciHeap.MAX_DEGREE; i++)
	{
		degreeArray[i] = null;
		degreeGraphic[i] = this.nextIndex++;
		indexID[i] = this.nextIndex++;
		this.cmd("CreateRectangle", 
				 degreeGraphic[i], 
				 " ", 
				 FibonacciHeap.DEGREE_ARRAY_ELEM_WIDTH, 
				 FibonacciHeap.DEGREE_ARRAY_ELEM_HEIGHT, 
				 FibonacciHeap.DEGREE_ARRAY_START_X + i * FibonacciHeap.DEGREE_ARRAY_ELEM_WIDTH, 
				 FibonacciHeap.INDEGREE_ARRAY_START_Y);
		this.cmd("SetNull", degreeGraphic[i], 1);
		this.cmd("CreateLabel", indexID[i], i,  FibonacciHeap.DEGREE_ARRAY_START_X + i * FibonacciHeap.DEGREE_ARRAY_ELEM_WIDTH, 
				 FibonacciHeap.INDEGREE_ARRAY_START_Y - FibonacciHeap.DEGREE_ARRAY_ELEM_HEIGHT);
		this.cmd("SetTextColod", indexID[i], FibonacciHeap.INDEX_COLOR);
	}
	var tmp = this.treeRoot;
	// When remving w/ 1 tree. this.treeRoot == null?
	this.cmd("CreateLabel", tmpPtrID, "NextElem", this.treeRoot.x, FibonacciHeap.TMP_PTR_Y);
	while (this.treeRoot != null)
	{
		tmp = this.treeRoot;
		this.cmd("Connect", tmpPtrID, 
				 tmp.graphicID,
				 FibonacciHeap.FOREGROUND_COLOR,
				 0, // Curve
				 1, // Directed
				 ""); // Label
		this.cmd("Connect", tmpPtrID, 
				 tmp.internalGraphicID,
				 FibonacciHeap.FOREGROUND_COLOR,
				 0, // Curve
				 1, // Directed
				 ""); // Label
		
		this.treeRoot = this.treeRoot.rightSib;
		if (tmp.rightSib != null)
		{
			this.cmd("Disconnect", tmp.internalGraphicID, tmp.rightSib.internalGraphicID);	
			this.cmd("Disconnect", tmp.rightSib.internalGraphicID, tmp.internalGraphicID);	
		}

		this.cmd("Step");
		tmp.rightSib = null;
		while(degreeArray[tmp.degree] != null)
		{
			this.cmd("SetEdgeHighlight", tmpPtrID, tmp.graphicID, 1);
			this.cmd("SetEdgeHighlight", tmpPtrID, tmp.internalGraphicID, 1);

			this.cmd("SetEdgeHighlight", degreeGraphic[tmp.degree], degreeArray[tmp.degree].graphicID, 1);
			this.cmd("SetEdgeHighlight", degreeGraphic[tmp.degree], degreeArray[tmp.degree].internalGraphicID, 1);
			this.cmd("Step");
			this.cmd("Disconnect", tmpPtrID, tmp.graphicID);
			this.cmd("Disconnect", tmpPtrID, tmp.internalGraphicID);

			
			
			this.cmd("Disconnect", degreeGraphic[tmp.degree], degreeArray[tmp.degree].graphicID);
			this.cmd("Disconnect", degreeGraphic[tmp.degree], degreeArray[tmp.degree].internalGraphicID);
			this.cmd("SetNull", degreeGraphic[tmp.degree], 1);
			var tmp2 =  degreeArray[tmp.degree];
			degreeArray[tmp.degree] = null
			tmp = this.combineTrees(tmp, tmp2);
			this.cmd("Connect", tmpPtrID, 
					 tmp.graphicID,
					 FibonacciHeap.FOREGROUND_COLOR,
					 0, // Curve
					 1, // Directed
					 ""); // Label
			this.cmd("Connect", tmpPtrID, 
					 tmp.internalGraphicID,
					 FibonacciHeap.FOREGROUND_COLOR,
					 0, // Curve
					 1, // Directed
					 ""); // Label
			this.SetAllTreePositions(this.treeRoot, degreeArray, tmp);
			this.cmd("Move", tmpPtrID, tmp.x, FibonacciHeap.TMP_PTR_Y);
			this.MoveAllTrees(this.treeRoot, degreeArray, tmp);
		}
		this.cmd("Disconnect",  tmpPtrID, tmp.graphicID);
		this.cmd("Disconnect",  tmpPtrID, tmp.internalGraphicID);

		degreeArray[tmp.degree] = tmp;
		this.cmd("SetNull", degreeGraphic[tmp.degree], 0);
		this.cmd("Connect", degreeGraphic[tmp.degree], 
				 tmp.graphicID,
				 FibonacciHeap.FOREGROUND_COLOR,
				 0, // Curve
				 1, // Directed
				 ""); // Label
		this.cmd("Connect", degreeGraphic[tmp.degree], 
				 tmp.internalGraphicID,
				 FibonacciHeap.FOREGROUND_COLOR,
				 0, // Curve
				 1, // Directed
				 ""); // Label
		this.cmd("Step");
		this.SetAllTreePositions(this.treeRoot, degreeArray);
		this.MoveAllTrees(this.treeRoot, degreeArray);
	}
	this.minElement = null;
	for (i = FibonacciHeap.MAX_DEGREE; i >= 0; i--)
	{
		if (degreeArray[i] != null)
		{
			degreeArray[i].rightSib = this.treeRoot;
			if (this.minElement == null || this.minElement.data > degreeArray[i].data)
			{
				this.minElement = degreeArray[i];				
			}
			this.treeRoot = degreeArray[i];
			if (this.treeRoot.rightSib != null)
			{
				this.cmd("Connect", this.treeRoot.internalGraphicID, 
						this.treeRoot.rightSib.internalGraphicID,
						 FibonacciHeap.FOREGROUND_COLOR,
						 0.15, // Curve
						 1, // Directed
						 ""); // Label
				this.cmd("Connect", this.treeRoot.rightSib.internalGraphicID, 
						 this.treeRoot.internalGraphicID,
						 FibonacciHeap.FOREGROUND_COLOR,
						 0.15, // Curve
						 1, // Directed
						 ""); // Label
			}			
		}
				
		this.cmd("Delete", degreeGraphic[i]);
		this.cmd("Delete", indexID[i]);
		
	}
	if (this.minElement != null)
	{
		this.cmd("CreateLabel", this.minID,"Min element",  this.minElement.x,FibonacciHeap.TMP_PTR_Y);
		this.cmd("Connect", this.minID, 
				 this.minElement.graphicID,
				 FibonacciHeap.FOREGROUND_COLOR,
				 0, // Curve
				 1, // Directed
				 ""); // Label
		this.cmd("Connect", this.minID, 
				 this.minElement.internalGraphicID,
				 FibonacciHeap.FOREGROUND_COLOR,
				 0, // Curve
				 1, // Directed
				 ""); // Label
	}
	this.cmd("Delete", tmpPtrID);

}

FibonacciHeap.prototype.MoveAllTrees = function(tree, treeList, tree2)
{
	if (tree2 != null && tree2 != undefined)
	{
		this.moveTree(tree2);
	}
	if (tree != null)
	{
		this.moveTree(tree);		
	}
	for (var i = 0; i < treeList.length; i++)
	{
		if (treeList[i] != null)
		{
			this.moveTree(treeList[i]);
		}
	}
	this.cmd("Step");	
	
	
}


FibonacciHeap.prototype.SetAllTreePositions = function(tree, treeList, tree2)
{
	var leftSize = FibonacciHeap.STARTING_X;
	if (tree2 != null && tree2 != undefined)
	{
		leftSize = this.setPositions(tree2, leftSize, FibonacciHeap.STARTING_Y); //  +FibonacciHeap.NODE_WIDTH;
	}
	if (tree != null)
	{
		leftSize = this.setPositions(tree, leftSize, FibonacciHeap.STARTING_Y); // + FibonacciHeap.NODE_WIDTH;

	}
	for (var i = 0; i < treeList.length; i++)
	{
			if (treeList[i] != null)
			{
				leftSize = this.setPositions(treeList[i], leftSize, FibonacciHeap.STARTING_Y); // + FibonacciHeap.NODE_WIDTH;
			}
	}
}

FibonacciHeap.prototype.combineTrees = function(tree1, tree2)
{
	if (tree2.data < tree1.data)
	{
		var tmp = tree2;
		tree2 = tree1;
		tree1 = tmp;
	}
	if (tree1.degree != tree2.degree)
	{
		return null;
	}
	tree2.rightSib = tree1.leftChild;
	tree2.parent =tree1;
	tree1.leftChild = tree2;
	tree1.degree++;
	
	if (tree1.leftChild.rightSib != null)
	{
		this.cmd("Disconnect", tree1.internalGraphicID, tree1.leftChild.rightSib.internalGraphicID);
		this.cmd("Connect", tree1.leftChild.internalGraphicID, 
				 tree1.leftChild.rightSib.internalGraphicID,
				 FibonacciHeap.FOREGROUND_COLOR,
				 0.3, // Curve
				 1, // Directed
				 ""); // Label
		this.cmd("Connect", tree1.leftChild.rightSib.internalGraphicID, 
				 tree1.leftChild.internalGraphicID,
				 FibonacciHeap.FOREGROUND_COLOR,
				 0.3, // Curve
				 1, // Directed
				 ""); // Label
	}
	
	this.cmd("Connect", tree1.internalGraphicID, 
			 tree1.leftChild.internalGraphicID,
			 FibonacciHeap.FOREGROUND_COLOR,
			 0.15, // Curve
			 1, // Directed
			 ""); // Label
	
	this.cmd("Connect", tree1.leftChild.internalGraphicID, 
			 tree1.internalGraphicID,
			 FibonacciHeap.FOREGROUND_COLOR,
			 0.0, // Curve
			 1, // Directed
			 ""); // Label
	
	this.cmd("SetText", tree1.degreeID, tree1.degree);
	this.cmd("Connect", tree1.graphicID, 
			 tree2.graphicID,
			 FibonacciHeap.FOREGROUND_COLOR,
			 0, // Curve
			 0, // Directed
			 ""); // Label
	// TODO:  Add all the internal links &etc

	return tree1;
	
}

FibonacciHeap.prototype.enableUI = function(event)
{
	for (var i = 0; i < this.controls.length; i++)
	{
		this.controls[i].disabled = false;
	}
	
	
}
FibonacciHeap.prototype.disableUI = function(event)
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
	currentAlg = new FibonacciHeap(animManag, canvas.width, canvas.height);
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


