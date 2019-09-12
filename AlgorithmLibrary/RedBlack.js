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

function RedBlack(am, w, h)
{
	this.init(am, w, h);

}

RedBlack.prototype = new Algorithm();
RedBlack.prototype.constructor = RedBlack;
RedBlack.superclass = Algorithm.prototype;

RedBlack.prototype.init = function(am, w, h)
{
	var sc = RedBlack.superclass;
	var fn = sc.init;
	fn.call(this,am);
	this.addControls();
	this.nextIndex = 1;
	this.commands = [];
	this.startingX = w / 2;
	this.print_max  = w - PRINT_HORIZONTAL_GAP;
	this.first_print_pos_y  = h - 2 * PRINT_VERTICAL_GAP;


	this.cmd("CreateLabel", 0, "", EXPLANITORY_TEXT_X, EXPLANITORY_TEXT_Y, 0);
	this.animationManager.StartNewAnimation(this.commands);
	this.animationManager.skipForward();
	this.animationManager.clearHistory();
	
}

RedBlack.prototype.addControls =  function()
{
	this.insertField = addControlToAlgorithmBar("Text", "");
	this.insertField.onkeydown = this.returnSubmit(this.insertField,  this.insertCallback.bind(this), 4);
	this.insertButton = addControlToAlgorithmBar("Button", "Insert");
	this.insertButton.onclick = this.insertCallback.bind(this);
	this.deleteField = addControlToAlgorithmBar("Text", "");
	this.deleteField.onkeydown = this.returnSubmit(this.deleteField,  this.deleteCallback.bind(this), 4);
	this.deleteButton = addControlToAlgorithmBar("Button", "Delete");
	this.deleteButton.onclick = this.deleteCallback.bind(this);
	this.findField = addControlToAlgorithmBar("Text", "");
	this.findField.onkeydown = this.returnSubmit(this.findField,  this.findCallback.bind(this), 4);
	this.findButton = addControlToAlgorithmBar("Button", "Find");
	this.findButton.onclick = this.findCallback.bind(this);
	this.printButton = addControlToAlgorithmBar("Button", "Print");
	this.printButton.onclick = this.printCallback.bind(this);
	
	this.showNullLeaves = addCheckboxToAlgorithmBar("Show Null Leaves");
	this.showNullLeaves.onclick = this.showNullLeavesCallback.bind(this);
	this.showNullLeaves.checked = false;;

}

RedBlack.prototype.reset = function()
{
	this.nextIndex = 1;
	this.treeRoot = null;
}

var FIRST_PRINT_POS_X = 50;
var PRINT_VERTICAL_GAP = 20;
var PRINT_HORIZONTAL_GAP = 50;


var FOREGROUND_RED = "#AA0000";
var BACKGROUND_RED = "#FFAAAA";

var FOREGROUND_BLACK =  "#000000"
var BACKGROUND_BLACK = "#AAAAAA";
var BACKGROUND_DOUBLE_BLACK = "#777777";


// var HIGHLIGHT_LABEL_COLOR = RED
// var HIGHLIGHT_LINK_COLOR = RED


var HIGHLIGHT_LABEL_COLOR = "#FF0000"
var HIGHLIGHT_LINK_COLOR = "#FF0000"

var BLUE = "#0000FF";

var LINK_COLOR = "#000000"
var BACKGROUND_COLOR = BACKGROUND_BLACK;
var HIGHLIGHT_COLOR = "#007700";
var FOREGROUND_COLOR = FOREGROUND_BLACK;
var PRINT_COLOR = FOREGROUND_COLOR

var widthDelta  = 50;
var heightDelta = 50;
var startingY = 50;


var FIRST_PRINT_POS_X  = 40;
var PRINT_VERTICAL_GAP  = 20;
var PRINT_HORIZONTAL_GAP = 50;
var EXPLANITORY_TEXT_X = 10;
var EXPLANITORY_TEXT_Y = 10;

RedBlack.prototype.insertCallback = function(event)
{
	var insertedValue = this.insertField.value;
	// Get text value
	insertedValue = this.normalizeNumber(insertedValue, 4);
	if (insertedValue != "")
	{
		// set text value
		this.insertField.value = "";
		this.implementAction(this.insertElement.bind(this), insertedValue);
	}
}

RedBlack.prototype.deleteCallback = function(event)
{
	var deletedValue = this.deleteField.value;
	if (deletedValue != "")
	{
		deletedValue = this.normalizeNumber(deletedValue, 4);
		this.deleteField.value = "";
		this.implementAction(this.deleteElement.bind(this),deletedValue);		
	}
}


RedBlack.prototype.findCallback = function(event)
{
	var findValue = this.findField.value;
	if (findValue != "")
	{
		findValue = this.normalizeNumber(findValue, 4);
		this.findField.value = "";
		this.implementAction(this.findElement.bind(this),findValue);		
	}
}

RedBlack.prototype.printCallback = function(event)
{
	this.implementAction(this.printTree.bind(this),"");						
}

RedBlack.prototype.showNullLeavesCallback = function(event)
{
	if (this.showNullLeaves.checked)
	{
		this.animationManager.setAllLayers([0,1]);		
	}
	else
	{
		this.animationManager.setAllLayers([0]);
	}
}
		 
		
RedBlack.prototype.printTree = function(unused)
{
	this.commands = [];
	
	if (this.treeRoot != null)
	{
		this.highlightID = this.nextIndex++;
		var firstLabel = this.nextIndex;
		this.cmd("CreateHighlightCircle", this.highlightID, HIGHLIGHT_COLOR, this.treeRoot.x, this.treeRoot.y);
		this.xPosOfNextLabel = FIRST_PRINT_POS_X;
		this.yPosOfNextLabel = this.first_print_pos_y;
		this.printTreeRec(this.treeRoot);
		this.cmd("Delete",this.highlightID);
		this.cmd("Step");
		for (var i = firstLabel; i < this.nextIndex; i++)
			this.cmd("Delete", i);
		this.nextIndex = this.highlightID;  /// Reuse objects.  Not necessary.
	}
	return this.commands;
}

RedBlack.prototype.printTreeRec = function(tree) 
{
	this.cmd("Step");
	if (tree.left != null && !tree.left.phantomLeaf)
	{
		this.cmd("Move", this.highlightID, tree.left.x, tree.left.y);
		this.printTreeRec(tree.left);
		this.cmd("Move", this.highlightID, tree.x, tree.y);				
		this.cmd("Step");
	}
	var nextLabelID = this.nextIndex++;
	this.cmd("CreateLabel", nextLabelID, tree.data, tree.x, tree.y);
	this.cmd("SetForegroundColor", nextLabelID, PRINT_COLOR);
	this.cmd("Move", nextLabelID, this.xPosOfNextLabel, this.yPosOfNextLabel);
	this.cmd("Step");
	
	this.xPosOfNextLabel +=  PRINT_HORIZONTAL_GAP;
	if (this.xPosOfNextLabel > this.print_max)
	{
		this.xPosOfNextLabel = FIRST_PRINT_POS_X;
		this.yPosOfNextLabel += PRINT_VERTICAL_GAP;
		
	}
	if (tree.right != null && !tree.right.phantomLeaf)
	{
		this.cmd("Move", this.highlightID, tree.right.x, tree.right.y);
		this.printTreeRec(tree.right);
		this.cmd("Move", this.highlightID, tree.x, tree.y);	
		this.cmd("Step");
	}
	return;
}


RedBlack.prototype.findElement = function(findValue)
{
	this.commands = [];
	
	this.highlightID = this.nextIndex++;
	
	this.doFind(this.treeRoot, findValue);
	
	
	return this.commands;
}


RedBlack.prototype.doFind = function(tree, value)
{
	this.cmd("SetText", 0, "Searchiing for "+value);
	if (tree != null && !tree.phantomLeaf)
	{
		this.cmd("SetHighlight", tree.graphicID, 1);
		if (tree.data == value)
		{
			this.cmd("SetText", 0, "Searching for "+value+" : " + value + " = " + value + " (Element found!)");
			this.cmd("Step");
			this.cmd("SetText", 0, "Found:"+value);
			this.cmd("SetHighlight", tree.graphicID, 0);
		}
		else
		{
			if (tree.data > value)
			{
				this.cmd("SetText", 0, "Searching for "+value+" : " + value + " < " + tree.data + " (look to left subtree)");
				this.cmd("Step");
				this.cmd("SetHighlight", tree.graphicID, 0);
				if (tree.left!= null)
				{
					this.cmd("CreateHighlightCircle", this.highlightID, HIGHLIGHT_COLOR, tree.x, tree.y);
					this.cmd("Move", this.highlightID, tree.left.x, tree.left.y);
					this.cmd("Step");
					this.cmd("Delete", this.highlightID);
				}
				this.doFind(tree.left, value);
			}
			else
			{
				this.cmd("SetText", 0, " Searching for "+value+" : " + value + " > " + tree.data + " (look to right subtree)");					
				this.cmd("Step");
				this.cmd("SetHighlight", tree.graphicID, 0);
				if (tree.right!= null)
				{
					this.cmd("CreateHighlightCircle", this.highlightID, HIGHLIGHT_COLOR, tree.x, tree.y);
					this.cmd("Move", this.highlightID, tree.right.x, tree.right.y);
					this.cmd("Step");
					this.cmd("Delete", this.highlightID);				
				}
				this.doFind(tree.right, value);						
			}
			
		}
		
	}
	else
	{
		this.cmd("SetText", 0, " Searching for "+value+" : " + "< Empty Tree > (Element not found)");				
		this.cmd("Step");					
		this.cmd("SetText", 0, " Searching for "+value+" : " + " (Element not found)");					
	}
}





RedBlack.prototype.findUncle = function(tree)
{
	if (tree.parent == null)
	{
		return null;
	}
	var par  = tree.parent;
	if (par.parent == null)
	{
		return null;
	}
	var grandPar   = par.parent;
	
	if (grandPar.left == par)
	{
		return grandPar.right;
	}
	else
	{
		return grandPar.left;
	}				
}



RedBlack.prototype.blackLevel = function(tree)
{
	if (tree == null)
	{
		return 1;
	}
	else
	{
		return tree.blackLevel;
	}
}


RedBlack.prototype.attachLeftNullLeaf = function(node)
{
	// Add phantom left leaf
	var treeNodeID = this.nextIndex++;
	this.cmd("CreateCircle", treeNodeID, "NULL\nLEAF",  node.x, node.y);
	this.cmd("SetForegroundColor", treeNodeID, FOREGROUND_BLACK);
	this.cmd("SetBackgroundColor", treeNodeID, BACKGROUND_BLACK);
	node.left = new RedBlackNode("", treeNodeID, this.startingX, startingY);
	node.left.phantomLeaf = true;
	this.cmd("SetLayer", treeNodeID, 1);
	node.left.blackLevel = 1;
	this.cmd("Connect",node.graphicID, treeNodeID, LINK_COLOR);
}	

RedBlack.prototype.attachRightNullLeaf = function(node)
{
	// Add phantom right leaf
	treeNodeID = this.nextIndex++;
	this.cmd("CreateCircle", treeNodeID, "NULL\nLEAF",  node.x, node.y);
	this.cmd("SetForegroundColor", treeNodeID, FOREGROUND_BLACK);
	this.cmd("SetBackgroundColor", treeNodeID, BACKGROUND_BLACK);
	node.right = new RedBlackNode("", treeNodeID, this.startingX, startingY);
	this.cmd("SetLayer", treeNodeID, 1);
	
	node.right.phantomLeaf = true;
	node.right.blackLevel = 1;
	this.cmd("Connect", node.graphicID, treeNodeID, LINK_COLOR);
	
}
RedBlack.prototype.attachNullLeaves = function(node)
{
	this.attachLeftNullLeaf(node);
	this.attachRightNullLeaf(node);
}

RedBlack.prototype.insertElement = function(insertedValue)
{
	this.commands = new Array();	
	this.cmd("SetText", 0, " Inserting "+insertedValue);
	this.highlightID = this.nextIndex++;
	var treeNodeID;
	if (this.treeRoot == null)
	{
		treeNodeID = this.nextIndex++;
		this.cmd("CreateCircle", treeNodeID, insertedValue,  this.startingX, startingY);
		this.cmd("SetForegroundColor", treeNodeID, FOREGROUND_BLACK);
		this.cmd("SetBackgroundColor", treeNodeID, BACKGROUND_BLACK);
		this.treeRoot = new RedBlackNode(insertedValue, treeNodeID, this.startingX, startingY);
		this.treeRoot.blackLevel = 1;
		
		this.attachNullLeaves(this.treeRoot);
		this.resizeTree();
		
	}
	else
	{
		treeNodeID = this.nextIndex++;
		
		this.cmd("CreateCircle", treeNodeID, insertedValue, 30, startingY);
		this.cmd("SetForegroundColor", treeNodeID, FOREGROUND_RED);
		this.cmd("SetBackgroundColor", treeNodeID, BACKGROUND_RED);
		this.cmd("Step");				
		var insertElem = new RedBlackNode(insertedValue, treeNodeID, 100, 100)
		
		this.cmd("SetHighlight", insertElem.graphicID, 1);
		insertElem.height = 1;
		this.insert(insertElem, this.treeRoot);
		//				resizeTree();				
	}
	this.cmd("SetText", 0, " ");				
	return this.commands;
}


RedBlack.prototype.singleRotateRight = function(tree)
{
	var B = tree;
	var t3 = B.right;
	var A = tree.left;
	var t1 = A.left;
	var t2 = A.right;
	
	this.cmd("SetText", 0, "Single Rotate Right");
	this.cmd("SetEdgeHighlight", B.graphicID, A.graphicID, 1);
	this.cmd("Step");
	
	// TODO:  Change link color
	
	if (t2 != null)
	{
		this.cmd("Disconnect", A.graphicID, t2.graphicID); 
		this.cmd("Connect", B.graphicID, t2.graphicID, LINK_COLOR);
		t2.parent = B;
	}
	this.cmd("Disconnect", B.graphicID, A.graphicID);
	this.cmd("Connect", A.graphicID, B.graphicID, LINK_COLOR);
	
	A.parent = B.parent;
	if (this.treeRoot == B)
	{
		this.treeRoot = A;
	}
	else
	{
		this.cmd("Disconnect", B.parent.graphicID, B.graphicID, LINK_COLOR);
		this.cmd("Connect", B.parent.graphicID, A.graphicID, LINK_COLOR)
		if (B.isLeftChild())
		{
			B.parent.left = A;
		}
		else
		{
			B.parent.right = A;
		}
	}
	A.right = B;
	B.parent = A;
	B.left = t2;
	this.resetHeight(B);
	this.resetHeight(A);
	this.resizeTree();			
	return A;
}



RedBlack.prototype.singleRotateLeft = function(tree) 
{
	var A = tree;
	var B = tree.right;
	var t1 = A.left;
	var t2 = B.left;
	var t3 = B.right;
	
	this.cmd("SetText", 0, "Single Rotate Left");
	this.cmd("SetEdgeHighlight", A.graphicID, B.graphicID, 1);
	this.cmd("Step");
	
	if (t2 != null)
	{
		this.cmd("Disconnect", B.graphicID, t2.graphicID);																		  
		this.cmd("Connect", A.graphicID, t2.graphicID, LINK_COLOR);
		t2.parent = A;
	}
	this.cmd("Disconnect", A.graphicID, B.graphicID);
	this.cmd("Connect", B.graphicID, A.graphicID, LINK_COLOR);
	B.parent = A.parent;
	if (this.treeRoot == A)
	{
		this.treeRoot = B;
	}
	else
	{
		this.cmd("Disconnect", A.parent.graphicID, A.graphicID, LINK_COLOR);
		this.cmd("Connect", A.parent.graphicID, B.graphicID, LINK_COLOR)
		
		if (A.isLeftChild())
		{
			A.parent.left = B;
		}
		else
		{
			A.parent.right = B;
		}
	}
	B.left = A;
	A.parent = B;
	A.right = t2;
	this.resetHeight(A);
	this.resetHeight(B);
	
	this.resizeTree();
	return B;
}




RedBlack.prototype.getHeight = function(tree) 
{
	if (tree == null)
	{
		return 0;
	}
	return tree.height;
}

RedBlack.prototype.resetHeight = function(tree)
{
	if (tree != null)
	{
		var newHeight = Math.max(this.getHeight(tree.left), this.getHeight(tree.right)) + 1;
		if (tree.height != newHeight)
		{
			tree.height = Math.max(this.getHeight(tree.left), this.getHeight(tree.right)) + 1
		}
	}
}

RedBlack.prototype.insert = function(elem, tree)
{
	this.cmd("SetHighlight", tree.graphicID, 1);
	this.cmd("SetHighlight", elem.graphicID, 1);
	
	if (elem.data < tree.data)
	{
		this.cmd("SetText", 0, elem.data + " < " + tree.data + ".  Looking at left subtree");				
	}
	else
	{
		this.cmd("SetText",  0, elem.data + " >= " + tree.data + ".  Looking at right subtree");				
	}
	this.cmd("Step");
	this.cmd("SetHighlight", tree.graphicID , 0);
	this.cmd("SetHighlight", elem.graphicID, 0);
	
	if (elem.data < tree.data)
	{
		if (tree.left == null || tree.left.phantomLeaf)
		{
			this.cmd("SetText", 0, "Found null tree (or phantom leaf), inserting element");				
			if (tree.left != null)
			{
				this.cmd("Delete", tree.left.graphicID);
			}
			this.cmd("SetHighlight", elem.graphicID, 0);
			tree.left=elem;
			elem.parent = tree;
			this.cmd("Connect", tree.graphicID, elem.graphicID, LINK_COLOR);
			
			this.attachNullLeaves(elem);
			this.resizeTree();
			
			
			
			
			this.resizeTree();
			
			this.fixDoubleRed(elem);
			
		}
		else
		{
			this.cmd("CreateHighlightCircle", this.highlightID, HIGHLIGHT_COLOR, tree.x, tree.y);
			this.cmd("Move", this.highlightID, tree.left.x, tree.left.y);
			this.cmd("Step");
			this.cmd("Delete", this.highlightID);
			this.insert(elem, tree.left);
			
		}
	}
	else
	{
		if (tree.right == null  || tree.right.phantomLeaf)
		{
			this.cmd("SetText",  0, "Found null tree (or phantom leaf), inserting element");
			if (tree.right != null)
			{
				this.cmd("Delete", tree.right.graphicID);
			}
			
			this.cmd("SetHighlight", elem.graphicID, 0);
			tree.right=elem;
			elem.parent = tree;
			this.cmd("Connect", tree.graphicID, elem.graphicID, LINK_COLOR);
			elem.x = tree.x + widthDelta/2;
			elem.y = tree.y + heightDelta
			this.cmd("Move", elem.graphicID, elem.x, elem.y);
			
			
			this.attachNullLeaves(elem);
			this.resizeTree();
			
			
			this.resizeTree();
			this.fixDoubleRed(elem);
		}
		else
		{
			this.cmd("CreateHighlightCircle", this.highlightID, HIGHLIGHT_COLOR, tree.x, tree.y);
			this.cmd("Move", this.highlightID, tree.right.x, tree.right.y);
			this.cmd("Step");
			this.cmd("Delete", this.highlightID);
			this.insert(elem, tree.right);
		}
	}
	
	
}


RedBlack.prototype.fixDoubleRed = function(tree)
{
	if (tree.parent != null)
	{
		if (tree.parent.blackLevel > 0)
		{
			return;
		}
		if (tree.parent.parent == null)
		{
			this.cmd("SetText", 0, "Tree root is red, color it black.");
			this.cmd("Step");
			tree.parent.blackLevel = 1;
			this.cmd("SetForegroundColor", tree.parent.graphicID, FOREGROUND_BLACK);
			this.cmd("SetBackgroundColor", tree.parent.graphicID, BACKGROUND_BLACK);
			return;
		}
		var uncle = this.findUncle(tree);
		if (this.blackLevel(uncle) == 0)
		{
			this.cmd("SetText", 0, "Node and parent are both red.  Uncle of node is red -- push blackness down from grandparent");
			this.cmd("Step");
			
			this.cmd("SetForegroundColor", uncle.graphicID, FOREGROUND_BLACK);
			this.cmd("SetBackgroundColor",uncle.graphicID, BACKGROUND_BLACK);
			uncle.blackLevel = 1;
			
			tree.parent.blackLevel = 1;
			this.cmd("SetForegroundColor", tree.parent.graphicID, FOREGROUND_BLACK);
			this.cmd("SetBackgroundColor",tree.parent.graphicID, BACKGROUND_BLACK);
			
			tree.parent.parent.blackLevel = 0;
			this.cmd("SetForegroundColor", tree.parent.parent.graphicID, FOREGROUND_RED);
			this.cmd("SetBackgroundColor",tree.parent.parent.graphicID, BACKGROUND_RED);
			this.cmd("Step");
			this.fixDoubleRed(tree.parent.parent);
		}
		else
		{
			if (tree.isLeftChild() &&  !tree.parent.isLeftChild())
			{
				this.cmd("SetText", 0, "Node and parent are both red.  Node is left child, parent is right child -- rotate");
				this.cmd("Step");
				
				this.singleRotateRight(tree.parent);
				tree=tree.right;
				
			}
			else if (!tree.isLeftChild() && tree.parent.isLeftChild())
			{
				this.cmd("SetText", 0, "Node and parent are both red.  Node is right child, parent is left child -- rotate");
				this.cmd("Step");
				
				this.singleRotateLeft(tree.parent);
				tree=tree.left;
			}
			
			if (tree.isLeftChild())
			{
				this.cmd("SetText", 0, "Node and parent are both red.  Node is left child, parent is left child\nCan fix extra redness with a single rotation");
				this.cmd("Step");
				
				this.singleRotateRight(tree.parent.parent);
				tree.parent.blackLevel = 1;
				this.cmd("SetForegroundColor", tree.parent.graphicID, FOREGROUND_BLACK);
				this.cmd("SetBackgroundColor",tree.parent.graphicID, BACKGROUND_BLACK);
				
				tree.parent.right.blackLevel = 0;
				this.cmd("SetForegroundColor", tree.parent.right.graphicID, FOREGROUND_RED);
				this.cmd("SetBackgroundColor",tree.parent.right.graphicID, BACKGROUND_RED);						
				
				
			}
			else
			{
				this.cmd("SetText", 0, "Node and parent are both red.  Node is right child, parent is right child\nCan fix extra redness with a single rotation");
				this.cmd("Step");
				
				this.singleRotateLeft(tree.parent.parent);
				tree.parent.blackLevel = 1;
				this.cmd("SetForegroundColor", tree.parent.graphicID, FOREGROUND_BLACK);
				this.cmd("SetBackgroundColor",tree.parent.graphicID, BACKGROUND_BLACK);
				
				tree.parent.left.blackLevel = 0;
				this.cmd("SetForegroundColor", tree.parent.left.graphicID, FOREGROUND_RED);
				this.cmd("SetBackgroundColor",tree.parent.left.graphicID, BACKGROUND_RED);				
				
			}					
		}
		
	}
	else
	{
		if (tree.blackLevel == 0)
		{
			this.cmd("SetText", 0, "Root of the tree is red.  Color it black");
			this.cmd("Step");
			
			tree.blackLevel = 1;
			this.cmd("SetForegroundColor", tree.graphicID, FOREGROUND_BLACK);
			this.cmd("SetBackgroundColor", tree.graphicID, BACKGROUND_BLACK);
		}
	}
	
}

RedBlack.prototype.deleteElement = function(deletedValue)
{
	this.commands = new Array();
	this.cmd("SetText", 0, "Deleting "+deletedValue);
	this.cmd("Step");
	this.cmd("SetText", 0, " ");
	this.highlightID = this.nextIndex++;
	this.treeDelete(this.treeRoot, deletedValue);
	this.cmd("SetText", 0, " ");			
	// Do delete
	return this.commands;						
}


RedBlack.prototype.fixLeftNull = function(tree)
{
	var treeNodeID = this.nextIndex++;
	var nullLeaf;
	this.cmd("SetText", 0, "Coloring 'Null Leaf' double black");
	
	this.cmd("CreateCircle", treeNodeID, "NULL\nLEAF",  tree.x, tree.y);
	this.cmd("SetForegroundColor", treeNodeID, FOREGROUND_BLACK);
	this.cmd("SetBackgroundColor", treeNodeID, BACKGROUND_DOUBLE_BLACK);
	nullLeaf = new RedBlackNode("NULL\nLEAF", treeNodeID, tree.x, tree.x);
	nullLeaf.blackLevel = 2;
	nullLeaf.parent = tree;
	nullLeaf.phantomLeaf = true;
	tree.left = nullLeaf;
	this.cmd("Connect", tree.graphicID, nullLeaf.graphicID, LINK_COLOR);
	
	this.resizeTree();				
	this.fixExtraBlackChild(tree, true);
	this.cmd("SetLayer", nullLeaf.graphicID, 1);
	nullLeaf.blackLevel = 1;
	this.fixNodeColor(nullLeaf);
}


RedBlack.prototype.fixRightNull = function(tree)
{
	var treeNodeID = this.nextIndex++;
	var nullLeaf;
	this.cmd("SetText", 0, "Coloring 'Null Leaf' double black");
	
	this.cmd("CreateCircle", treeNodeID, "NULL\nLEAF",  tree.x, tree.y);
	this.cmd("SetForegroundColor", treeNodeID, FOREGROUND_BLACK);
	this.cmd("SetBackgroundColor", treeNodeID, BACKGROUND_DOUBLE_BLACK);
	nullLeaf = new RedBlackNode("NULL\nLEAF", treeNodeID, tree.x, tree.x);
	nullLeaf.parent = tree;
	nullLeaf.phantomLeaf = true;
	nullLeaf.blackLevel = 2;
	tree.right = nullLeaf;
	this.cmd("Connect", tree.graphicID, nullLeaf.graphicID, LINK_COLOR);
	
	this.resizeTree();				
	
	this.fixExtraBlackChild(tree, false);
	
	this.cmd("SetLayer", nullLeaf.graphicID, 1);
	nullLeaf.blackLevel = 1;
	this.fixNodeColor(nullLeaf);
	
}


RedBlack.prototype.fixExtraBlackChild = function(parNode, isLeftChild)
{
	var sibling;
	var doubleBlackNode;
	if (isLeftChild)
	{
		sibling = parNode.right;
		doubleBlackNode = parNode.left;
	}
	else
	{
		sibling = parNode.left;				
		doubleBlackNode = parNode.right;
	}
	if (this.blackLevel(sibling) > 0 && this.blackLevel(sibling.left) > 0 && this.blackLevel(sibling.right) > 0)
	{
		this.cmd("SetText", 0, "Double black node has black sibling and 2 black nephews.  Push up black level");
		this.cmd("Step");
		sibling.blackLevel = 0;
		this.fixNodeColor(sibling);
		if (doubleBlackNode != null)
		{
			doubleBlackNode.blackLevel = 1;
			this.fixNodeColor(doubleBlackNode);
			
		}
		if (parNode.blackLevel == 0)
		{
			parNode.blackLevel = 1;
			this.fixNodeColor(parNode);
		}
		else
		{
			parNode.blackLevel = 2;
			this.fixNodeColor(parNode);
			this.cmd("SetText", 0, "Pushing up black level created another double black node.  Repeating ...");
			this.cmd("Step");
			this.fixExtraBlack(parNode);
		}				
	}
	else if (this.blackLevel(sibling) == 0)
	{
		this.cmd("SetText", 0, "Double black node has red sibling.  Rotate tree to make sibling black ...");
		this.cmd("Step");
		if (isLeftChild)
		{
			var newPar = this.singleRotateLeft(parNode);
			newPar.blackLevel = 1;
			this.fixNodeColor(newPar);
			newPar.left.blackLevel = 0;
			this.fixNodeColor(newPar.left);
			this.cmd("Step"); // TODO:  REMOVE
			this.fixExtraBlack(newPar.left.left);
			
		}
		else
		{
			newPar  = this.singleRotateRight(parNode);
			newPar.blackLevel = 1;
			this.fixNodeColor(newPar);
			newPar.right.blackLevel = 0;
			this.fixNodeColor(newPar.right);
			this.cmd("Step"); // TODO:  REMOVE

			this.fixExtraBlack(newPar.right.right);
		}
	}
	else if (isLeftChild && this.blackLevel(sibling.right) > 0)
	{
		this.cmd("SetText", 0, "Double black node has black sibling, but double black node is a left child, \nand the right nephew is black.  Rotate tree to make opposite nephew red ...");
		this.cmd("Step");
		
		var newSib = this.singleRotateRight(sibling);
		newSib.blackLevel = 1;
		this.fixNodeColor(newSib);
		newSib.right.blackLevel = 0;
		this.fixNodeColor(newSib.right);
		this.cmd("Step");
		this.fixExtraBlackChild(parNode, isLeftChild);
	}
	else if (!isLeftChild && this.blackLevel(sibling.left) > 0)
	{
		this.cmd("SetText", 0, "Double black node has black sibling, but double black node is a right child, \nand the left nephew is black.  Rotate tree to make opposite nephew red ...");
		this.cmd("Step");
		newSib = this.singleRotateLeft(sibling);
		newSib.blackLevel = 1;
		this.fixNodeColor(newSib);
		newSib.left.blackLevel = 0;
		this.fixNodeColor(newSib.left);
		this.cmd("Step");
		this.fixExtraBlackChild(parNode, isLeftChild);
	}
	else if (isLeftChild)
	{
		this.cmd("SetText", 0, "Double black node has black sibling, is a left child, and its right nephew is red.\nOne rotation can fix double-blackness.");
		this.cmd("Step");
		
		var oldParBlackLevel  = parNode.blackLevel;
		newPar = this.singleRotateLeft(parNode);
		if (oldParBlackLevel == 0)
		{
			newPar.blackLevel = 0;
			this.fixNodeColor(newPar);
			newPar.left.blackLevel = 1;
			this.fixNodeColor(newPar.left);
		}
		newPar.right.blackLevel = 1;
		this.fixNodeColor(newPar.right);
		if (newPar.left.left != null)
		{
			newPar.left.left.blackLevel = 1;
			this.fixNodeColor(newPar.left.left);
		}
	}
	else
	{
		this.cmd("SetText", 0, "Double black node has black sibling, is a right child, and its left nephew is red.\nOne rotation can fix double-blackness.");
		this.cmd("Step");
		
		oldParBlackLevel  = parNode.blackLevel;
		newPar = this.singleRotateRight(parNode);
		if (oldParBlackLevel == 0)
		{
			newPar.blackLevel = 0;
			this.fixNodeColor(newPar);
			newPar.right.blackLevel = 1;
			this.fixNodeColor(newPar.right);
		}
		newPar.left.blackLevel = 1;
		this.fixNodeColor(newPar.left);
		if (newPar.right.right != null)
		{
			newPar.right.right.blackLevel = 1;
			this.fixNodeColor(newPar.right.right);
		}
	}
}


RedBlack.prototype.fixExtraBlack = function(tree)
{
	if (tree.blackLevel > 1)
	{
		if (tree.parent == null)
		{
			this.cmd("SetText", 0, "Double black node is root.  Make it single black.");
			this.cmd("Step");
			
			tree.blackLevel = 1;
			this.cmd("SetBackgroundColor", tree.graphicID, BACKGROUND_BLACK);
		}
		else if (tree.parent.left == tree)
		{
			this.fixExtraBlackChild(tree.parent, true);
		}
		else
		{
			this.fixExtraBlackChild(tree.parent, false);					
		}
		
	}
	else 
	{
		// No extra blackness
	}
}



RedBlack.prototype.treeDelete = function(tree, valueToDelete)
{
	var leftchild = false;
	if (tree != null && !tree.phantomLeaf)
	{
		if (tree.parent != null)
		{
			leftchild = tree.parent.left == tree;
		}
		this.cmd("SetHighlight", tree.graphicID, 1);
		if (valueToDelete < tree.data)
		{	
			this.cmd("SetText", 0, valueToDelete + " < " + tree.data + ".  Looking at left subtree");				
		}
		else if (valueToDelete > tree.data)
		{
			this.cmd("SetText", 0, valueToDelete + " > " + tree.data + ".  Looking at right subtree");				
		}
		else
		{
			this.cmd("SetText", 0, valueToDelete + " == " + tree.data + ".  Found node to delete");									
		}
		this.cmd("Step");
		this.cmd("SetHighlight", tree.graphicID, 0);
		
		if (valueToDelete == tree.data)
		{
			var needFix = tree.blackLevel > 0;
			if (((tree.left == null) || tree.left.phantomLeaf)  && ((tree.right == null) || tree.right.phantomLeaf))
			{
				this.cmd("SetText",  0, "Node to delete is a leaf.  Delete it.");
				this.cmd("Delete", tree.graphicID);
				
				if (tree.left != null)
				{
					this.cmd("Delete", tree.left.graphicID);
				}
				if (tree.right != null)
				{
					this.cmd("Delete", tree.right.graphicID);
				}
				
				
				if (leftchild && tree.parent != null)
				{
					tree.parent.left = null;
					this.resizeTree();				
					
					if (needFix)
					{
						this.fixLeftNull(tree.parent);
					}
					else
					{
						
						this.attachLeftNullLeaf(tree.parent);
						this.resizeTree();
					}
				}
				else if (tree.parent != null)
				{
					tree.parent.right = null;
					this.resizeTree();		
					if (needFix)
					{
						this.fixRightNull(tree.parent);
					}
					else
					{
						this.attachRightNullLeaf(tree.parent);
						this.resizeTree();
					}
				}
				else
				{
					this.treeRoot = null;
				}
				
			}
			else if (tree.left == null || tree.left.phantomLeaf)
			{
				this.cmd("SetText", 0, "Node to delete has no left child.  \nSet parent of deleted node to right child of deleted node.");									
				if (tree.left != null)
				{
					this.cmd("Delete", tree.left.graphicID);
					tree.left = null;
				}
				
				if (tree.parent != null)
				{
					this.cmd("Disconnect", tree.parent.graphicID, tree.graphicID);
					this.cmd("Connect", tree.parent.graphicID, tree.right.graphicID, LINK_COLOR);
					this.cmd("Step");
					this.cmd("Delete", tree.graphicID);
					if (leftchild)
					{
						tree.parent.left = tree.right;
						if (needFix)
						{
							this.cmd("SetText", 0, "Back node removed.  Increasing child's blackness level");
							tree.parent.left.blackLevel++;
							this.fixNodeColor(tree.parent.left);
							this.fixExtraBlack(tree.parent.left);
						}
					}
					else
					{
						tree.parent.right = tree.right;
						if (needFix)
						{
							tree.parent.right.blackLevel++;
							this.cmd("SetText", 0, "Back node removed.  Increasing child's blackness level");
							this.fixNodeColor(tree.parent.right);
							this.fixExtraBlack(tree.parent.right);
						}
						
					}
					tree.right.parent = tree.parent;
				}
				else
				{
					this.cmd("Delete", tree.graphicID);
					this.treeRoot = tree.right;
					this.treeRoot.parent = null;
					if (this.treeRoot.blackLevel == 0)
					{
						this.treeRoot.blackLevel = 1;
						this.cmd("SetForegroundColor", this.treeRoot.graphicID, FOREGROUND_BLACK);
						this.cmd("SetBackgroundColor", this.treeRoot.graphicID, BACKGROUND_BLACK);		
					}
				}
				this.resizeTree();
			}
			else if (tree.right == null || tree.right.phantomLeaf)
			{
				this.cmd("SetText",  0,"Node to delete has no right child.  \nSet parent of deleted node to left child of deleted node.");
				if (tree.right != null)
				{
					this.cmd("Delete", tree.right.graphicID);
					tree.right = null;					
				}
				if (tree.parent != null)
				{
					this.cmd("Disconnect", tree.parent.graphicID, tree.graphicID);
					this.cmd("Connect", tree.parent.graphicID, tree.left.graphicID, LINK_COLOR);
					this.cmd("Step");
					this.cmd("Delete", tree.graphicID);
					if (leftchild)
					{
						tree.parent.left = tree.left;
						if (needFix)
						{
							tree.parent.left.blackLevel++;
							this.fixNodeColor(tree.parent.left);
							this.fixExtraBlack(tree.parent.left);
							this.resizeTree();
						}
						else
						{
							this.cmd("SetText", 0, "Deleted node was red.  No tree rotations required.");									
							this.resizeTree();
								
						}
					}
					else
					{
						tree.parent.right = tree.left;
						if (needFix)
						{
							tree.parent.right.blackLevel++;
							this.fixNodeColor(tree.parent.right);
							this.fixExtraBlack(tree.parent.left);
							this.resizeTree();
						}
						else
						{
							this.cmd("SetText", 0, "Deleted node was red.  No tree rotations required.");									
							this.resizeTree();								
						}
					}
					tree.left.parent = tree.parent;
				}
				else
				{
					this.cmd("Delete" , tree.graphicID);
					this.treeRoot = tree.left;
					this.treeRoot.parent = null;
					if (this.treeRoot.blackLevel == 0)
					{
						this.treeRoot.blackLevel = 1;
						this.fixNodeColor(this.treeRoot);
					}
				}
			}
			else // tree.left != null && tree.right != null
			{
				this.cmd("SetText", 0, "Node to delete has two childern.  \nFind largest node in left subtree.");									
				
				this.highlightID = this.nextIndex;
				this.nextIndex += 1;
				this.cmd("CreateHighlightCircle", this.highlightID, HIGHLIGHT_COLOR, tree.x, tree.y);
				var tmp = tree;
				tmp = tree.left;
				this.cmd("Move", this.highlightID, tmp.x, tmp.y);
				this.cmd("Step");																									
				while (tmp.right != null && !tmp.right.phantomLeaf)
				{
					tmp = tmp.right;
					this.cmd("Move", this.highlightID, tmp.x, tmp.y);
					this.cmd("Step");																									
				}
				if (tmp.right != null)
				{
					this.cmd("Delete", tmp.right.graphicID);
					tmp.right = null;
				}
				this.cmd("SetText", tree.graphicID, " ");
				var labelID = this.nextIndex;
				this.nextIndex += 1;
				this.cmd("CreateLabel", labelID, tmp.data, tmp.x, tmp.y);
				this.cmd("SetForegroundColor", labelID, BLUE);
				tree.data = tmp.data;
				this.cmd("Move", labelID, tree.x, tree.y);
				this.cmd("SetText", 0, "Copy largest value of left subtree into node to delete.");									
				
				this.cmd("Step");
				this.cmd("SetHighlight", tree.graphicID, 0);
				this.cmd("Delete", labelID);
				this.cmd("SetText", tree.graphicID, tree.data);
				this.cmd("Delete", this.highlightID);							
				this.cmd("SetText", 0, "Remove node whose value we copied.");									
				
				needFix = tmp.blackLevel > 0;
				
				
				if (tmp.left == null)
				{
					this.cmd("Delete", tmp.graphicID);
					if (tmp.parent != tree)
					{
						tmp.parent.right = null;
						this.resizeTree();
						if (needFix)
						{
							this.fixRightNull(tmp.parent);
						}
						else
						{
							this.cmd("SetText", 0, "Deleted node was red.  No tree rotations required.");									
							this.cmd("Step");									
						}
					}
					else
					{
						tree.left = null;
						this.resizeTree();
						if (needFix)
						{
							this.fixLeftNull(tmp.parent);
						}
						else
						{
							this.cmd("SetText", 0, "Deleted node was red.  No tree rotations required.");									
							this.cmd("Step");									
						}
					}
				}
				else
				{
					this.cmd("Disconnect", tmp.parent.graphicID, tmp.graphicID);
					this.cmd("Connect", tmp.parent.graphicID, tmp.left.graphicID, LINK_COLOR);
					this.cmd("Step");
					this.cmd("Delete", tmp.graphicID);
					
					if (tmp.parent != tree)
					{
						tmp.parent.right = tmp.left; 
						tmp.left.parent = tmp.parent;
						this.resizeTree();
						
						if (needFix)
						{
							this.cmd("SetText", 0, "Coloring child of deleted node black");
							this.cmd("Step");
							tmp.left.blackLevel++;
							if (tmp.left.phantomLeaf)
							{
								this.cmd("SetLayer", tmp.left.graphicID, 0);
							}
							this.fixNodeColor(tmp.left);
							this.fixExtraBlack(tmp.left);
							if (tmp.left.phantomLeaf)
							{
								this.cmd("SetLayer", tmp.left.graphicID, 1);
							}
							
						}
						else
						{
							this.cmd("SetText", 0, "Deleted node was red.  No tree rotations required.");									
							this.cmd("Step");									
						}
					}
					else
					{
						tree.left = tmp.left;
						tmp.left.parent = tree;
						this.resizeTree();
						if (needFix)
						{
							this.cmd("SetText", 0, "Coloring child of deleted node black");
							this.cmd("Step");
							tmp.left.blackLevel++;
							if (tmp.left.phantomLeaf)
							{
								this.cmd("SetLayer", tmp.left.graphicID, 0);
							}
							
							this.fixNodeColor(tmp.left);
							this.fixExtraBlack(tmp.left);
							if (tmp.left.phantomLeaf)
							{
								this.cmd("SetLayer", tmp.left.graphicID, 1);
							}
							
						}
						else
						{
							this.cmd("SetText", 0, "Deleted node was red.  No tree rotations required.");									
							this.cmd("Step");									
						}
					}
				}
				tmp = tmp.parent;
				
			}
		}
		else if (valueToDelete < tree.data)
		{
			if (tree.left != null)
			{
				this.cmd("CreateHighlightCircle", this.highlightID, HIGHLIGHT_COLOR, tree.x, tree.y);
				this.cmd("Move", this.highlightID, tree.left.x, tree.left.y);
				this.cmd("Step");
				this.cmd("Delete", this.highlightID);
			}
			this.treeDelete(tree.left, valueToDelete);
		}
		else
		{
			if (tree.right != null)
			{
				this.cmd("CreateHighlightCircle", this.highlightID, HIGHLIGHT_COLOR, tree.x, tree.y);
				this.cmd("Move", this.highlightID, tree.right.x, tree.right.y);
				this.cmd("Step");
				this.cmd("Delete", this.highlightID);
			}
			this.treeDelete(tree.right, valueToDelete);					
		}
	}
	else
	{
		this.cmd("SetText", 0, "Elemet "+valueToDelete+" not found, could not delete");
	}
	
}


RedBlack.prototype.fixNodeColor = function(tree)
{
	if (tree.blackLevel == 0)
	{
		this.cmd("SetForegroundColor", tree.graphicID, FOREGROUND_RED);
		this.cmd("SetBackgroundColor", tree.graphicID, BACKGROUND_RED);									
	}
	else
	{
		this.cmd("SetForegroundColor", tree.graphicID, FOREGROUND_BLACK);
		if (tree.blackLevel > 1)
		{
			this.cmd("SetBackgroundColor",tree.graphicID, BACKGROUND_DOUBLE_BLACK);			
		}
		else
		{
			this.cmd("SetBackgroundColor",tree.graphicID, BACKGROUND_BLACK);
		}
	}
}




RedBlack.prototype.resizeTree = function()
{
	var startingPoint  = this.startingX;
	this.resizeWidths(this.treeRoot);
	if (this.treeRoot != null)
	{
		if (this.treeRoot.leftWidth > startingPoint)
		{
			startingPoint = this.treeRoot.leftWidth;
		}
		else if (this.treeRoot.rightWidth > startingPoint)
		{
			startingPoint = Math.max(this.treeRoot.leftWidth, 2 * startingPoint - this.treeRoot.rightWidth);
		}
		this.setNewPositions(this.treeRoot, startingPoint, startingY, 0);
		this.animateNewPositions(this.treeRoot);
		this.cmd("Step");
	}
	
}

RedBlack.prototype.setNewPositions = function(tree, xPosition, yPosition, side)
{
	if (tree != null)
	{
		tree.y = yPosition;
		if (side == -1)
		{
			xPosition = xPosition - tree.rightWidth;
			tree.heightLabelX = xPosition - 20;
		}
		else if (side == 1)
		{
			xPosition = xPosition + tree.leftWidth;
			tree.heightLabelX = xPosition + 20;
		}
		else
		{
			tree.heightLabelX = xPosition - 20;
		}
		tree.x = xPosition;
		tree.heightLabelY = tree.y - 20;
		this.setNewPositions(tree.left, xPosition, yPosition + heightDelta, -1)
		this.setNewPositions(tree.right, xPosition, yPosition + heightDelta, 1)
	}
	
}
RedBlack.prototype.animateNewPositions = function(tree)
{
	if (tree != null)
	{
		this.cmd("Move", tree.graphicID, tree.x, tree.y);
		this.animateNewPositions(tree.left);
		this.animateNewPositions(tree.right);
	}
}

RedBlack.prototype.resizeWidths = function(tree) 
{
	if (tree == null)
	{
		return 0;
	}
	tree.leftWidth = Math.max(this.resizeWidths(tree.left), widthDelta / 2);
	tree.rightWidth = Math.max(this.resizeWidths(tree.right), widthDelta / 2);
	return tree.leftWidth + tree.rightWidth;
}


RedBlack.prototype.disableUI = function(event)
{
	this.insertField.disabled = true;
	this.insertButton.disabled = true;
	this.deleteField.disabled = true;
	this.deleteButton.disabled = true;
	this.findField.disabled = true;
	this.findButton.disabled = true;
	this.printButton.disabled = true;
}

RedBlack.prototype.enableUI = function(event)
{
	this.insertField.disabled = false;
	this.insertButton.disabled = false;
	this.deleteField.disabled = false;
	this.deleteButton.disabled = false;
	this.findField.disabled = false;
	this.findButton.disabled = false;
	this.printButton.disabled = false;
}


/////////////////////////////////////////////////////////
// Red black node
////////////////////////////////////////////////////////


function RedBlackNode(val, id, initialX, initialY)
{
	this.data = val;
	this.x = initialX;
	this.y = initialY;
	this.blackLevel = 0;
	this.phantomLeaf = false;
	this.graphicID = id;
	this.left = null;
	this.right = null;
	this.parent = null;
	this.height = 0;
	this.leftWidth = 0;
	this.rightWidth = 0;
}

RedBlackNode.prototype.isLeftChild = function()
{
	if (this.parent == null)
	{
		return true;
	}
	return this.parent.left == this;
}



/////////////////////////////////////////////////////////
// Setup stuff
////////////////////////////////////////////////////////


var currentAlg;

function init()
{
	var animManag = initCanvas();
	currentAlg = new RedBlack(animManag, canvas.width, canvas.height);
}