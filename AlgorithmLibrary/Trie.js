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


Trie.NODE_WIDTH = 30;

Trie.LINK_COLOR = "#007700";
Trie.HIGHLIGHT_CIRCLE_COLOR = "#007700";
Trie.FOREGROUND_COLOR = "#007700";
Trie.BACKGROUND_COLOR = "#CCFFCC";
Trie.TRUE_COLOR = "#CCFFCC";
Trie.PRINT_COLOR = Trie.FOREGROUND_COLOR;
Trie.FALSE_COLOR = "#FFFFFF"
Trie.WIDTH_DELTA  = 50;
Trie.HEIGHT_DELTA = 50;
Trie.STARTING_Y = 80;
Trie.LeftMargin = 300;
Trie.NEW_NODE_Y = 100
Trie.NEW_NODE_X = 50;
Trie.FIRST_PRINT_POS_X  = 50;
Trie.PRINT_VERTICAL_GAP  = 20;
Trie.PRINT_HORIZONTAL_GAP = 50;
    


function Trie(am, w, h)
{
	this.init(am, w, h);
}

Trie.prototype = new Algorithm();
Trie.prototype.constructor = Trie;
Trie.superclass = Algorithm.prototype;

Trie.prototype.init = function(am, w, h)
{
	var sc = Trie.superclass;
	this.startingX =  w / 2;
	this.first_print_pos_y  = h - 2 * Trie.PRINT_VERTICAL_GAP;
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


Trie.prototype.addControls =  function()
{
	this.insertField = addControlToAlgorithmBar("Text", "");
	this.insertField.onkeypress = this.returnSubmit(this.insertField,  this.insertCallback.bind(this), 12,false);
	this.insertButton = addControlToAlgorithmBar("Button", "Insert");
	this.insertButton.onclick = this.insertCallback.bind(this);
	this.deleteField = addControlToAlgorithmBar("Text", "");
	this.deleteField.onkeydown = this.returnSubmit(this.deleteField,  this.deleteCallback.bind(this), 12);
	this.deleteButton = addControlToAlgorithmBar("Button", "Delete");
	this.deleteButton.onclick = this.deleteCallback.bind(this);
	this.findField = addControlToAlgorithmBar("Text", "");
	this.findField.onkeydown = this.returnSubmit(this.findField,  this.findCallback.bind(this), 12);
	this.findButton = addControlToAlgorithmBar("Button", "Find");
	this.findButton.onclick = this.findCallback.bind(this);
	this.printButton = addControlToAlgorithmBar("Button", "Print");
	this.printButton.onclick = this.printCallback.bind(this);
}

Trie.prototype.reset = function()
{
	this.nextIndex = 3;
	this.root = null;
}

Trie.prototype.insertCallback = function(event)
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

Trie.prototype.deleteCallback = function(event)
{
	var deletedValue = this.deleteField.value.toUpperCase();
        deletedValue = deletedValue.replace(/[^a-z]/gi,'');
	if (deletedValue != "")
	{
		this.deleteField.value = "";
		this.implementAction(this.deleteElement.bind(this),deletedValue);		
	}

}


Trie.prototype.printCallback = function(event)
{
	this.implementAction(this.printTree.bind(this),"");						
}



Trie.prototype.findCallback = function(event)
{
	var findValue = this.findField.value.toUpperCase()
        finndValue = findValue.replace(/[^a-z]/gi,'');
	this.findField.value = "";
	this.implementAction(this.findElement.bind(this),findValue);						
}



Trie.prototype.printTree = function(unused)
{

	this.commands = [];
    
	if (this.root != null)
	{
		this.highlightID = this.nextIndex++;
	        this.printLabel1 = this.nextIndex++;
	        this.printLabel2 = this.nextIndex++;
		var firstLabel = this.nextIndex++;
	        this.cmd("CreateLabel", firstLabel, "Output: ", Trie.FIRST_PRINT_POS_X, this.first_print_pos_y);
		this.cmd("CreateHighlightCircle", this.highlightID, Trie.HIGHLIGHT_CIRCLE_COLOR, this.root.x, this.root.y);
                this.cmd("SetWidth", this.highlightID, Trie.NODE_WIDTH);
	        this.cmd("CreateLabel", this.printLabel1, "Current String: ", 20, 10, 0);
	        this.cmd("CreateLabel", this.printLabel2, "", 20, 10, 0);
	        this.cmd("AlignRight", this.printLabel2, this.printLabel1);
		this.xPosOfNextLabel = Trie.FIRST_PRINT_POS_X;
		this.yPosOfNextLabel = this.first_print_pos_y;
		this.printTreeRec(this.root, "");

		this.cmd("Delete",  this.highlightID);
		this.cmd("Delete",  this.printLabel1);
		this.cmd("Delete",  this.printLabel2);
		this.cmd("Step")
		
		for (var i = firstLabel; i < this.nextIndex; i++)
		{
			this.cmd("Delete", i);
		}
		this.nextIndex = this.highlightID;  /// Reuse objects.  Not necessary.
	}
	return this.commands;

}



Trie.prototype.printTreeRec = function(tree, stringSoFar)
{
    if (tree.wordRemainder != "")
    {
    }
    if (tree.isword)
    {
	var nextLabelID = this.nextIndex++;
        this.cmd("CreateLabel", nextLabelID, stringSoFar + "  ", 20, 10, 0);
	this.cmd("SetForegroundColor", nextLabelID, Trie.PRINT_COLOR); 
	this.cmd("AlignRight", nextLabelID, this.printLabel1, Trie.PRINT_COLOR); 
	this.cmd("MoveToAlignRight", nextLabelID, nextLabelID - 1);
	this.cmd("Step");
	
	this.xPosOfNextLabel +=  Trie.PRINT_HORIZONTAL_GAP;
	if (this.xPosOfNextLabel > this.print_max)
	{
		this.xPosOfNextLabel = Trie.FIRST_PRINT_POS_X;
		this.yPosOfNextLabel += Trie.PRINT_VERTICAL_GAP;
	}
	

    }
    for (var i = 0; i < 26; i++)
    {
	if (tree.children[i] != null)
	{

	var stringSoFar2 = stringSoFar + tree.children[i].wordRemainder;
	var nextLabelID = this.nextIndex++;
	var fromx =  (tree.children[i].x + tree.x) / 2 + Trie.NODE_WIDTH / 2;
	var fromy =  (tree.children[i].y + tree.y) / 2;
        this.cmd("CreateLabel", nextLabelID, tree.children[i].wordRemainder,fromx, fromy, 0);
	this.cmd("MoveToAlignRight", nextLabelID, this.printLabel2);
	this.cmd("Move", this.highlightID, tree.children[i].x, tree.children[i].y);
	this.cmd("Step");
	this.cmd("Delete", nextLabelID);
	this.nextIndex--;
	this.cmd("SetText", this.printLabel2, stringSoFar2);

	this.printTreeRec(tree.children[i], stringSoFar2);
	this.cmd("Move", this.highlightID, tree.x, tree.y);
	this.cmd("SetText", this.printLabel2, stringSoFar);
	this.cmd("Step");
	    
	}
	
	
    }
}



Trie.prototype.findElement = function(word)
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


Trie.prototype.doFind = function(tree, s)
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
 	this.cmd("CreateHighlightCircle", this.highlightID, Trie.HIGHLIGHT_CIRCLE_COLOR, tree.x, tree.y);
        this.cmd("SetWidth", this.highlightID, Trie.NODE_WIDTH);
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

Trie.prototype.insertElement = function(insertedValue)
{
	this.cmd("SetText", 0, "");				
	return this.commands;
}


Trie.prototype.insert = function(elem, tree)
{
	
}

Trie.prototype.deleteElement = function(word)
{
	this.commands = [];
	this.cmd("SetText", 0, "Deleting: ");
	this.cmd("SetText", 1, "\"" + word  + "\"");
        this.cmd("AlignRight", 1, 0);
        this.cmd("Step");

	
	var node = this.doFind(this.root, word);
        if (node != null)
        {
  	    this.cmd("SetHighlight", node.graphicID , 1);
            this.cmd("SetText", 2, "Found \""+word+"\", setting value in tree to False");
	    this.cmd("step")
	    this.cmd("SetBackgroundColor", node.graphicID, Trie.FALSE_COLOR);
            node.isword = false
     	    this.cmd("SetHighlight", node.graphicID , 0);
	    this.cleanupAfterDelete(node)
	    this.resizeTree()
        }
        else
        {
             this.cmd("SetText", 2, "\""+word+"\" not in tree, nothing to delete");
	    this.cmd("step")
             this.cmd("SetHighlightIndex", 1,  -1)
        }



	this.cmd("SetText", 0, "");
	this.cmd("SetText", 1, "");
	this.cmd("SetText", 2, "");
	return this.commands;						
}



Trie.prototype.numChildren = function(tree)
{
    if (tree == null)
    {
        return 0;
    }
    var children = 0
    for (var i = 0; i < 26; i++)
    {
        if (tree.children[i] != null)
        {
            children++;
        }
    }
    return children;

}

Trie.prototype.cleanupAfterDelete = function(tree)
{
    var children = this.numChildren(tree)

    if (children == 0 && !tree.isword)
    {
         this.cmd("SetText", 2, "Deletion left us with a \"False\" leaf\nRemoving false leaf");
   	 this.cmd("SetHighlight" ,tree.graphicID , 1);
         this.cmd("Step");
   	 this.cmd("SetHighlight", tree.graphicID , 0);
         if (tree.parent != null)
         {
              var index = 0
              while (tree.parent.children[index] != tree)
              {
                  index++;
              }
              this.cmd("Disconnect", tree.parent.graphicID, tree.graphicID);
       	      this.cmd("Delete", tree.graphicID , 0);
              tree.parent.children[index] = null;
              this.cleanupAfterDelete(tree.parent);
         }
         else
         {
       	      this.cmd("Delete", tree.graphicID , 0);
              this.root = null;
         }
    }
}

Trie.prototype.resizeTree = function()
{
	this.resizeWidths(this.root);
	if (this.root != null)
	{
	        var startingPoint = this.root.width / 2 + 1 + Trie.LeftMargin;
		this.setNewPositions(this.root, startingPoint, Trie.STARTING_Y);
		this.animateNewPositions(this.root);
		this.cmd("Step");
	}
	
}


Trie.prototype.add = function(word) 
{
	this.commands = new Array();	
	this.cmd("SetText", 0, "Inserting; ");
	this.cmd("SetText", 1, "\"" + word  + "\"");
        this.cmd("AlignRight", 1, 0);
        this.cmd("Step");
        if (this.root == null)
        {
		this.cmd("CreateCircle", this.nextIndex, "", Trie.NEW_NODE_X, Trie.NEW_NODE_Y); 
		this.cmd("SetForegroundColor", this.nextIndex, Trie.FOREGROUND_COLOR);
		this.cmd("SetBackgroundColor", this.nextIndex, Trie.FALSE_COLOR);
                this.cmd("SetWidth", this.nextIndex, Trie.NODE_WIDTH);
	        this.cmd("SetText", 2, "Creating a new root");
                this.root = new TrieNode("", this.nextIndex, Trie.NEW_NODE_X, Trie.NEW_NODE_Y)
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


Trie.prototype.addR = function(s, tree)
{
    this.cmd("SetHighlight", tree.graphicID , 1);

    if (s.length == 0)
    {
            this.cmd("SetText", 2, "Reached the end of the string \nSet current node to true");
            this.cmd("Step");
//            this.cmd("SetText", tree.graphicID, "T");
    	    this.cmd("SetBackgroundColor", tree.graphicID, Trie.TRUE_COLOR);
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
           this.cmd("CreateCircle", this.nextIndex, s.charAt(0), Trie.NEW_NODE_X, Trie.NEW_NODE_Y); 
           this.cmd("SetForegroundColor", this.nextIndex, Trie.FOREGROUND_COLOR);
           this.cmd("SetBackgroundColor", this.nextIndex, Trie.FALSE_COLOR);
           this.cmd("SetWidth", this.nextIndex, Trie.NODE_WIDTH);
           this.cmd("SetText", 2, "Child " + s.charAt(0) + " does not exist.  Creating ... ");
           tree.children[index] = new TrieNode(s.charAt(0), this.nextIndex, Trie.NEW_NODE_X, Trie.NEW_NODE_Y)
	   tree.children[index].parent = tree;
           this.cmd("Connect", tree.graphicID, tree.children[index].graphicID, Trie.FOREGROUND_COLOR, 0, false, s.charAt(0));

           this.cmd("Step");				
           this.resizeTree();
           this.cmd("SetText", 2, "" );
           this.nextIndex += 1;
           this.highlightID = this.nextIndex++;

        }
 	this.cmd("CreateHighlightCircle", this.highlightID, Trie.HIGHLIGHT_CIRCLE_COLOR, tree.x, tree.y);
        this.cmd("SetWidth", this.highlightID, Trie.NODE_WIDTH);
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
Trie.prototype.setNewPositions = function(tree, xPosition, yPosition)
{
	if (tree != null)
	{
                tree.x = xPosition;
		tree.y = yPosition;
                var newX = xPosition - tree.width / 2;
                var newY = yPosition + Trie.HEIGHT_DELTA;
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
Trie.prototype.animateNewPositions = function(tree)
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

Trie.prototype.resizeWidths = function(tree) 
{
	if (tree == null)
	{
		return 0;
	}
        var size = 0;
	for (var i = 0; i < 26; i++)
	{
            tree.childWidths[i] = this.resizeWidths(tree.children[i]);
            size += tree.childWidths[i]
	}
        tree.width = Math.max(size, Trie.NODE_WIDTH  + 4)
        return tree.width;
}




function TrieNode(val, id, initialX, initialY)
{
	this.wordRemainder = val;
	this.x = initialX;
	this.y = initialY;
	this.graphicID = id;
        this.children = new Array(26);
        this.childWidths = new Array(26);
        for (var i = 0; i < 26; i++)
	{
            this.children[i] = null;
            this.childWidths[i] =0;
	}
        this.width = 0;
	this.parent = null;
}

Trie.prototype.disableUI = function(event)
{
	this.insertField.disabled = true;
	this.insertButton.disabled = true;
	this.deleteField.disabled = true;
	this.deleteButton.disabled = true;
	this.findField.disabled = true;
	this.findButton.disabled = true;
	this.printButton.disabled = true;
}

Trie.prototype.enableUI = function(event)
{
	this.insertField.disabled = false;
	this.insertButton.disabled = false;
	this.deleteField.disabled = false;
	this.deleteButton.disabled = false;
	this.findField.disabled = false;
	this.findButton.disabled = false;
        this.printButton.disabled = false;
}


var currentAlg;

function init()
{
	var animManag = initCanvas();
	currentAlg = new Trie(animManag, canvas.width, canvas.height);
	
}
