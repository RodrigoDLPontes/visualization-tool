// Copyright 2016 David Galles, University of San Francisco. All rights reserved.
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
// WARRANTIES, INCLUDING, BUT NOT LIIBTED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
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


// Constants.


Ternary.NODE_WIDTH = 30;

Ternary.LINK_COLOR = "#007700";
Ternary.HIGHLIGHT_CIRCLE_COLOR = "#007700";
Ternary.FOREGROUND_COLOR = "#007700";
Ternary.BACKGROUND_COLOR = "#CCFFCC";
Ternary.TRUE_COLOR = "#CCFFCC";
Ternary.PRINT_COLOR = Ternary.FOREGROUND_COLOR;
Ternary.FALSE_COLOR = "#FFFFFF"
Ternary.WIDTH_DELTA  = 50;
Ternary.HEIGHT_DELTA = 50;
Ternary.STARTING_Y = 80;
Ternary.LeftMargin = 300;
Ternary.NEW_NODE_Y = 100
Ternary.NEW_NODE_X = 50;
Ternary.FIRST_PRINT_POS_X  = 50;
Ternary.PRINT_VERTICAL_GAP  = 20;
Ternary.PRINT_HORIZONTAL_GAP = 50;
    


function Ternary(am, w, h)
{
	this.init(am, w, h);
}

Ternary.prototype = new Algorithm();
Ternary.prototype.constructor = Ternary;
Ternary.superclass = Algorithm.prototype;

Ternary.prototype.init = function(am, w, h)
{
	var sc = Ternary.superclass;
	this.startingX =  w / 2;
	this.first_print_pos_y  = h - 2 * Ternary.PRINT_VERTICAL_GAP;
	this.print_max  = w - 10;

	var fn = sc.init;
	fn.call(this,am);
	this.addControls();
	this.nextIndex = 0;
	this.commands = [];
	this.cmd("CreateLabel", 0, "", 20, 10, 0);
	this.cmd("CreateLabel", 1, "", 20, 10, 0);
	this.cmd("CreateLabel", 2, "", 20, 30, 0);
	this.nextIndex = 3;
	this.animationManager.StartNewAnimation(this.commands);
	this.animationManager.skipForward();
	this.animationManager.clearHistory();
}


Ternary.prototype.addControls =  function()
{
	this.insertField = addControlToAlgorithmBar("Text", "");
	this.insertField.onkeypress = this.returnSubmit(this.insertField,  this.insertCallback.bind(this), 12,false);
	this.insertButton = addControlToAlgorithmBar("Button", "Insert");
	this.insertButton.onclick = this.insertCallback.bind(this);
//	this.deleteField = addControlToAlgorithmBar("Text", "");
//	this.deleteField.onkeydown = this.returnSubmit(this.deleteField,  this.deleteCallback.bind(this), 12);
//	this.deleteButton = addControlToAlgorithmBar("Button", "Delete");
//	this.deleteButton.onclick = this.deleteCallback.bind(this);
	this.findField = addControlToAlgorithmBar("Text", "");
	this.findField.onkeydown = this.returnSubmit(this.findField,  this.findCallback.bind(this), 12);
	this.findButton = addControlToAlgorithmBar("Button", "Find");
	this.findButton.onclick = this.findCallback.bind(this);
//	this.printButton = addControlToAlgorithmBar("Button", "Print");
//	this.printButton.onclick = this.printCallback.bind(this);
}

Ternary.prototype.reset = function()
{
	this.nextIndex = 3;
	this.treeRoot = null;
}

Ternary.prototype.insertCallback = function(event)
{
	var insertedValue = this.insertField.value.toUpperCase()
        insertedValue = insertedValue.replace(/[^a-z]/gi,'');

	if (insertedValue != "")
	{
		// set text value
		this.insertField.value = "";
		this.implementAction(this.add.bind(this), insertedValue);
	}
}


Ternary.prototype.printCallback = function(event)
{
	this.implementAction(this.printTree.bind(this),"");						
}



Ternary.prototype.findCallback = function(event)
{
	var findValue = this.findField.value.toUpperCase()
        finndValue = findValue.replace(/[^a-z]/gi,'');
	this.findField.value = "";
	this.implementAction(this.findElement.bind(this),findValue);						
}

Ternary.prototype.findElement = function(word)
{
	this.commands = [];
	
	this.commands = new Array();	
	this.cmd("SetText", 0, "Finding: ");
	this.cmd("SetText", 1, "\"" + word  + "\"");
        this.cmd("AlignRight", 1, 0);
        this.cmd("Step");

	
	var node = this.doFind(this.root, word);
        if (node != null)
        {
             this.cmd("SetText", 0, "Found \""+word+"\"");
        }
        else
        {
             this.cmd("SetText", 0, "\""+word+"\" not Found");
        }

        this.cmd("SetText", 1, "");
        this.cmd("SetText", 2, "");
	
	return this.commands;
}


Ternary.prototype.doFind = function(tree, s)
{

    if (tree == null)
    {
	return null;
    }
    this.cmd("SetHighlight", tree.graphicID , 1);

    if (s.length == 0)
    {
        if (tree.isword == true)
        {
            this.cmd("SetText", 2, "Reached the end of the string \nCurrent node is True\nWord is in the tree");
            this.cmd("Step");
            this.cmd("SetHighlight", tree.graphicID , 0);
	    return tree
	}
	else
	{
            this.cmd("SetText", 2, "Reached the end of the string \nCurrent node is False\nWord is Not the tree");
            this.cmd("Step");
            this.cmd("SetHighlight", tree.graphicID , 0);
	    return null

	}
    }
    else 
    {
       this.cmd("SetHighlightIndex", 1, 1);
       var index = s.charCodeAt(0) - "A".charCodeAt(0);
       if (tree.children[index] == null)
       {
            this.cmd("SetText", 2, "Child " + s.charAt(0) + " does not exist\nWord is Not the tree");
            this.cmd("Step");
            this.cmd("SetHighlight", tree.graphicID , 0);
	    return null
        }
 	this.cmd("CreateHighlightCircle", this.highlightID, Ternary.HIGHLIGHT_CIRCLE_COLOR, tree.x, tree.y);
        this.cmd("SetWidth", this.highlightID, Ternary.NODE_WIDTH);
        this.cmd("SetText", 2, "Making recursive call to " + s.charAt(0) + " child, passing in " + s.substring(1));
        this.cmd("Step")
        this.cmd("SetHighlight", tree.graphicID , 0);
        this.cmd("SetHighlightIndex", 1, -1);
        this.cmd("SetText", 1, "\"" + s.substring(1) + "\"");

        this.cmd("Move", this.highlightID, tree.children[index].x, tree.children[index].y);
        this.cmd("Step")
 	this.cmd("Delete", this.highlightID);
	return this.doFind(tree.children[index], s.substring(1))
    }
}

Ternary.prototype.insertElement = function(insertedValue)
{
	this.cmd("SetText", 0, "");				
	return this.commands;
}


Ternary.prototype.insert = function(elem, tree)
{
	
}



Ternary.prototype.resizeTree = function()
{
	this.resizeWidths(this.root);
	if (this.root != null)
	{
	        var startingPoint = this.root.width / 2 + 1 + Ternary.LeftMargin;
		this.setNewPositions(this.root, startingPoint, Ternary.STARTING_Y);
		this.animateNewPositions(this.root);
		this.cmd("Step");
	}
	
}


Ternary.prototype.add = function(word) 
{
	this.commands = new Array();	
	this.cmd("SetText", 0, "Inserting; ");
	this.cmd("SetText", 1, "\"" + word  + "\"");
        this.cmd("AlignRight", 1, 0);
        this.cmd("Step");
        if (this.root == null)
        {
		this.cmd("CreateCircle", this.nextIndex, "", Ternary.NEW_NODE_X, Ternary.NEW_NODE_Y); 
		this.cmd("SetForegroundColor", this.nextIndex, Ternary.FOREGROUND_COLOR);
		this.cmd("SetBackgroundColor", this.nextIndex, Ternary.FALSE_COLOR);
                this.cmd("SetWidth", this.nextIndex, Ternary.NODE_WIDTH);
	        this.cmd("SetText", 2, "Creating a new root");
                this.root = new TernaryNode("", this.nextIndex, Ternary.NEW_NODE_X, Ternary.NEW_NODE_Y)
		this.cmd("Step");				
                this.resizeTree();
	        this.cmd("SetText", 2, "" );
                this.highlightID = this.nextIndex++;
                this.nextIndex += 1;
	        
        }
        this.addR(word.toUpperCase(), this.root);
	this.cmd("SetText", 0, "");
	this.cmd("SetText", 1, "");
	this.cmd("SetText", 2, "");

        return this.commands;
}


Ternary.prototype.addR = function(s, tree)
{
    this.cmd("SetHighlight", tree.graphicID , 1);

    if (s.length == 0)
    {
            this.cmd("SetText", 2, "Reached the end of the string \nSet current node to true");
            this.cmd("Step");
//            this.cmd("SetText", tree.graphicID, "T");
    	    this.cmd("SetBackgroundColor", tree.graphicID, Ternary.TRUE_COLOR);
            this.cmd("SetHighlight", tree.graphicID , 0);
	    tree.isword = true;
	    return;
    }
    else 
    {
       this.cmd("SetHighlightIndex", 1, 1);
       var index = s.charCodeAt(0) - "A".charCodeAt(0);
       if (tree.children[index] == null)
       {
           this.cmd("CreateCircle", this.nextIndex, s.charAt(0), Ternary.NEW_NODE_X, Ternary.NEW_NODE_Y); 
           this.cmd("SetForegroundColor", this.nextIndex, Ternary.FOREGROUND_COLOR);
           this.cmd("SetBackgroundColor", this.nextIndex, Ternary.FALSE_COLOR);
           this.cmd("SetWidth", this.nextIndex, Ternary.NODE_WIDTH);
           this.cmd("SetText", 2, "Child " + s.charAt(0) + " does not exist.  Creating ... ");
           tree.children[index] = new TernaryNode(s.charAt(0), this.nextIndex, Ternary.NEW_NODE_X, Ternary.NEW_NODE_Y)
	   tree.children[index].parent = tree;
           this.cmd("Connect", tree.graphicID, tree.children[index].graphicID, Ternary.FOREGROUND_COLOR, 0, false, s.charAt(0));

           this.cmd("Step");				
           this.resizeTree();
           this.cmd("SetText", 2, "" );
           this.nextIndex += 1;
           this.highlightID = this.nextIndex++;

        }
 	this.cmd("CreateHighlightCircle", this.highlightID, Ternary.HIGHLIGHT_CIRCLE_COLOR, tree.x, tree.y);
        this.cmd("SetWidth", this.highlightID, Ternary.NODE_WIDTH);
        this.cmd("SetText", 2, "Making recursive call to " + s.charAt(0) + " child, passing in \"" + s.substring(1) + "\"");
        this.cmd("Step")
        this.cmd("SetHighlight", tree.graphicID , 0);
        this.cmd("SetHighlightIndex", 1, -1);
        this.cmd("SetText", 1, "\"" + s.substring(1) + "\"");

        this.cmd("Move", this.highlightID, tree.children[index].x, tree.children[index].y);
        this.cmd("Step")
 	this.cmd("Delete", this.highlightID);
	this.addR(s.substring(1), tree.children[index])
    }
}
Ternary.prototype.setNewPositions = function(tree, xPosition, yPosition)
{
	if (tree != null)
	{
                tree.x = xPosition;
		tree.y = yPosition;
                var newX = xPosition - tree.width / 2;
                var newY = yPosition + Ternary.HEIGHT_DELTA;
                for (var i = 0; i < 26; i++)
                { 
                     if (tree.children[i] != null)
                     {
                           this.setNewPositions(tree.children[i], newX + tree.children[i].width / 2, newY);
                           newX = newX + tree.children[i].width;
                     }
                }
	}
	
}
Ternary.prototype.animateNewPositions = function(tree)
{
	if (tree != null)
	{
		this.cmd("Move", tree.graphicID, tree.x, tree.y);
                for (var i = 0; i < 26; i++)
                { 
                    this.animateNewPositions(tree.children[i])
                }
	}
}

Ternary.prototype.resizeWidths = function(tree) 
{
	if (tree == null)
	{
		return 0;
	}
        tree.leftWidth = (this.resizeWidths(tree.left));
        tree.centerWidth = (this.resizeWidths(tree.center));
        tree.rightWidth = (this.resizeWidths(tree.right));
        tree.width = Math.max(size, Ternary.NODE_WIDTH  + 4)
        return tree.width;
}




function TernaryNode(val, id, initialX, initialY)
{
    this.wordRemainder = val;
    this.x = initialX;
    this.y = initialY;
    this.graphicID = id;
    
    this.left = null;
    this.center = null;
    this.right = null;
    this.leftWidth =  0;
    this.centerWidth =  0;
    this.rightWwidth =  0;
    this.parent = null;
}

Ternary.prototype.disableUI = function(event)
{
	this.insertField.disabled = true;
	this.insertButton.disabled = true;
	this.deleteField.disabled = true;
	this.deleteButton.disabled = true;
	this.findField.disabled = true;
	this.findButton.disabled = true;
//	this.printButton.disabled = true;
}

Ternary.prototype.enableUI = function(event)
{
	this.insertField.disabled = false;
	this.insertButton.disabled = false;
	this.deleteField.disabled = false;
	this.deleteButton.disabled = false;
	this.findField.disabled = false;
	this.findButton.disabled = false;
//	this.printButton.disabled = false;
}


var currentAlg;

function init()
{
	var animManag = initCanvas();
	currentAlg = new Ternary(animManag, canvas.width, canvas.height);
	
}
