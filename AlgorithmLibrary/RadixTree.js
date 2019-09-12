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


RadixTree.NODE_WIDTH = 60;

RadixTree.LINK_COLOR = "#007700";
RadixTree.HIGHLIGHT_CIRCLE_COLOR = "#007700";
RadixTree.FOREGROUND_COLOR = "#007700";
RadixTree.BACKGROUND_COLOR = "#CCFFCC";
RadixTree.PRINT_COLOR = RadixTree.FOREGROUND_COLOR;
RadixTree.FALSE_COLOR = "#FFFFFF"
RadixTree.WIDTH_DELTA  = 50;
RadixTree.HEIGHT_DELTA = 80;
RadixTree.STARTING_Y = 80;
RadixTree.LeftMargin = 300;
RadixTree.NEW_NODE_Y = 100
RadixTree.NEW_NODE_X = 50;
RadixTree.FIRST_PRINT_POS_X  = 50;
RadixTree.PRINT_VERTICAL_GAP  = 20;
RadixTree.PRINT_HORIZONTAL_GAP = 50;
    


function RadixTree(am, w, h)
{
	this.init(am, w, h);
}

RadixTree.prototype = new Algorithm();
RadixTree.prototype.constructor = RadixTree;
RadixTree.superclass = Algorithm.prototype;

RadixTree.prototype.init = function(am, w, h)
{
	var sc = RadixTree.superclass;
	this.startingX =  w / 2;
	this.first_print_pos_y  = h - 2 * RadixTree.PRINT_VERTICAL_GAP;
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



RadixTree.prototype.findIndexDifference = function(s1, s2, id, wordIndex)
{
    var index = 0;
    this.cmd("SetText", 2, "Comparing next letter in search term \n to next letter in prefix of current node");
    
    while  (index < s1.length && index < s2.length)
    {
          this.cmd("SetHighlightIndex", 1, index);
          this.cmd("SetHighlightIndex", id, index);
	  this.cmd("Step");
          this.cmd("SetHighlightIndex", 1, -1);
          this.cmd("SetHighlightIndex", id, -1);

         if (s1.charAt(index) == s2.charAt(index))
         {
             index++;
         }
	 else
         {
               break;
         }
    }
    return index;
}


RadixTree.prototype.addControls =  function()
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

RadixTree.prototype.reset = function()
{
	this.nextIndex = 3;
	this.root = null;
}

RadixTree.prototype.insertCallback = function(event)
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

RadixTree.prototype.deleteCallback = function(event)
{
	var deletedValue = this.deleteField.value.toUpperCase();
        deletedValue = deletedValue.replace(/[^a-z]/gi,'');
	if (deletedValue != "")
	{
		this.deleteField.value = "";
		this.implementAction(this.deleteElement.bind(this),deletedValue);		
	}
}


RadixTree.prototype.printCallback = function(event)
{
	this.implementAction(this.printTree.bind(this),"");						
}



RadixTree.prototype.printTree = function(unused)
{

	this.commands = [];
    
	if (this.root != null)
	{
		this.highlightID = this.nextIndex++;
	        this.printLabel1 = this.nextIndex++;
	        this.printLabel2 = this.nextIndex++;
		var firstLabel = this.nextIndex++;
	        this.cmd("CreateLabel", firstLabel, "Output: ", RadixTree.FIRST_PRINT_POS_X, this.first_print_pos_y);
		this.cmd("CreateHighlightCircle", this.highlightID, RadixTree.HIGHLIGHT_CIRCLE_COLOR, this.root.x, this.root.y);
                this.cmd("SetWidth", this.highlightID, RadixTree.NODE_WIDTH);
	        this.cmd("CreateLabel", this.printLabel1, "Current String: ", 20, 10, 0);
	        this.cmd("CreateLabel", this.printLabel2, "", 20, 10, 0);
	        this.cmd("AlignRight", this.printLabel2, this.printLabel1);
		this.xPosOfNextLabel = RadixTree.FIRST_PRINT_POS_X;
		this.yPosOfNextLabel = this.first_print_pos_y;
		this.printTreeRec(this.root, "");

//	        this.cmd("SetText", this.printLabel1, "About to delete");
//		this.cmd("Step")

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




RadixTree.prototype.printTreeRec = function(tree, stringSoFar)
{
    if (tree.wordRemainder != "")
    {
	stringSoFar = stringSoFar + tree.wordRemainder;
	var nextLabelID = this.nextIndex++;
        this.cmd("CreateLabel", nextLabelID, tree.wordRemainder, tree.x, tree.y, 0);
	this.cmd("MoveToAlignRight", nextLabelID, this.printLabel2);
	this.cmd("Step");
	this.cmd("Delete", nextLabelID);
	this.nextIndex--;
	this.cmd("SetText", this.printLabel2, stringSoFar);
    }
    if (tree.isword)
    {
	var nextLabelID = this.nextIndex++;
        this.cmd("CreateLabel", nextLabelID, stringSoFar + "  ", 20, 10, 0);
	this.cmd("SetForegroundColor", nextLabelID, RadixTree.PRINT_COLOR); 
	this.cmd("AlignRight", nextLabelID, this.printLabel1, RadixTree.PRINT_COLOR); 
	this.cmd("MoveToAlignRight", nextLabelID, nextLabelID - 1);
	this.cmd("Step");
	
	this.xPosOfNextLabel +=  RadixTree.PRINT_HORIZONTAL_GAP;
	if (this.xPosOfNextLabel > this.print_max)
	{
		this.xPosOfNextLabel = RadixTree.FIRST_PRINT_POS_X;
		this.yPosOfNextLabel += RadixTree.PRINT_VERTICAL_GAP;
	}
	

    }
    for (var i = 0; i < 26; i++)
    {
	if (tree.children[i] != null)
	{
	this.cmd("Move", this.highlightID, tree.children[i].x, tree.children[i].y);
	this.cmd("Step");
	this.printTreeRec(tree.children[i], stringSoFar);
	this.cmd("Move", this.highlightID, tree.x, tree.y);
	this.cmd("SetText", this.printLabel2, stringSoFar);
	this.cmd("Step");
	    
	}
	
	
    }
}

RadixTree.prototype.findCallback = function(event)
{
	var findValue;

	var findValue = this.insertField.value.toUpperCase()
        findValue = findValue.replace(/[^a-z]/gi,'');
	this.findField.value = "";

	this.implementAction(this.findElement.bind(this),findValue);						
}

RadixTree.prototype.findElement = function(findValue)
{
	this.commands = [];
	this.cmd("SetText", 0, "Seaching for: ");
	this.cmd("SetText", 1, findValue);
        this.cmd("AlignRight", 1, 0);
        this.cmd("Step");
        this.highlightID = this.nextIndex++;
	

	var res = this.doFind(this.root, findValue);
	if (res)
        {
   	    this.cmd("SetText", 0, "String " + findValue + " found");
        }
        else
        {
   	    this.cmd("SetText", 0, "String " + findValue + " not found");
        }
        this.cmd("SetText", 1, "");
        this.cmd("SetText", 2, "");
              
	
	return this.commands;
}


RadixTree.prototype.doFind = function(tree, value)
{
    if (tree == null)
    {
         this.cmd("SetText", 2, "Empty tree found.   String not in the tree");
         this.cmd("step");
         return null;
    }

   this.cmd("SetHighlight", tree.graphicID , 1);

    var remain = tree.wordRemainder
 
    var indexDifference = this.findIndexDifference(value, remain, tree.graphicID, 0);

    if (indexDifference == remain.length)
    {
            this.cmd("SetText", 2, "Reached the end of the prefix stored at this node");
            this.cmd("Step");

            if (value.length > indexDifference)
            { 
		this.cmd("SetText", 2, "Recusively search remaining string  \nin the '" +value.charAt(indexDifference) +  "' child");
                this.cmd("Step");
                this.cmd("SetHighlight", tree.graphicID , 0);
		this.cmd("SetText", 1, value.substring(indexDifference));

                var index = value.charCodeAt(indexDifference) - "A".charCodeAt(0);
		var noChild = tree.children[index] == null;


		if (noChild)
                {
 		      this.cmd("SetText", 2, "Child '" +value.charAt(indexDifference) +  "' does not exit.  \nString is not in the tree.");
                      this.cmd("Step");
                      return null;
                 
                }  else {


		this.cmd("CreateHighlightCircle", this.highlightID, RadixTree.HIGHLIGHT_CIRCLE_COLOR, tree.x, tree.y);
                this.cmd("SetWidth", this.highlightID, RadixTree.NODE_WIDTH);

		this.cmd("Step")
   	        this.cmd("Move", this.highlightID, tree.children[index].x, tree.children[index].y);
		this.cmd("Step")

		this.cmd("Delete",  this.highlightID);

                }
		
		
                return  this.doFind(tree.children[index], value.substring(indexDifference));
            }

            this.cmd("SetText", 2, "Reached the end of the string.  Check if current node is \"True\"")
            this.cmd("Step");
            this.cmd("SetText", 2, "")
           
            if (tree.isword)
            {
                this.cmd("SetText", 2, "Node is \"True\", string is in tree")
                this.cmd("Step");
                this.cmd("SetText", 2, "")
                this.cmd("SetHighlight", tree.graphicID , 0);
                return tree;

            }
            else
            {
                this.cmd("SetText", 2, "Node is \"False\", string is not in tree")
                this.cmd("Step");
                this.cmd("SetText", 2, "")
                this.cmd("SetHighlight", tree.graphicID , 0);
                return null;

            }
    }
    else
    {
          this.cmd("SetText", 2, "Reached end of search string, \nStill characters remaining at node\nString not in tree")
          this.cmd("Step");
          this.cmd("SetHighlight", tree.graphicID , 0);
          this.cmd("SetText", 2, "")
          return null;

        
    }

}


RadixTree.prototype.deleteElement = function(deletedValue)
{
	this.commands = [];
	this.cmd("SetText", 0, "Deleting: ");
	this.cmd("SetText", 1, deletedValue);
        this.cmd("AlignRight", 1, 0);
     
        var node = this.doFind(this.root, deletedValue);

        if (node == null)
        {
	    this.cmd("SetText", 2, "String not in the tree, nothing to delete");
            this.cmd("Step");
	    this.cmd("SetText", 0, "");
	    this.cmd("SetText", 1, "");
	    this.cmd("SetText", 2, "");
        }
        else 
        {
	    node.isword = false;
	    this.cmd("SetText", 2, "Found string to delete, setting node to \"False\"")
            this.cmd("Step");
	    this.cmd("SetBackgroundColor", node.graphicID, RadixTree.FALSE_COLOR);
            this.cmd("Step");
	    this.cleanupAfterDelete(node)
	    this.cmd("SetText", 0, "");
	    this.cmd("SetText", 1, "");
	    this.cmd("SetText", 2, "");
        }

	return this.commands;						
}



RadixTree.prototype.numChildren = function(tree)
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


RadixTree.prototype.isLeaf = function(tree)
{
    if (tree == null)
    {
        return false;
    }
    for (var i = 0; i < 26; i++)
    {
        if (tree.children[i] != null)
        {
            return false;
        }
    }
    return true;
}


RadixTree.prototype.getParentIndex = function(tree)
{
     if (tree.parent == null)
     {
        return -1;
     }
     var par = tree.parent;
     for (var i = 0; i < 26; i++)
     {
        if (par.children[i] == tree)
        {
            return i;
        }
     }
     return -1;
}

RadixTree.prototype.cleanupAfterDelete = function(tree)
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
    else if (children == 1 && !tree.isword)
    {
        var childIndex = -1;
        for (var i = 0; i < 26; i++)
        {
            if (tree.children[i] != null) 
            {
		childIndex = i;
                break;
            }
	}
        this.cmd("SetText", 2, "Deletion left us with a \"False\" node\nContaining one child.  Combining ...");
        this.cmd("SetHighlight" ,tree.graphicID , 1);
        this.cmd("Step");
	this.cmd("SetHighlight", tree.graphicID , 0);
	
	var child = tree.children[childIndex];
        child.wordRemainder = tree.wordRemainder + child.wordRemainder;
        this.cmd("SetText", child.graphicID, child.wordRemainder);
	this.cmd("Disconnect", tree.graphicID , child.graphicID);
	
        if (tree.parent == null)
        {
            child.parent = null
	    this.root = child;
	    this.cmd("Delete",  tree.graphicID);
        }
	else
	{
	    var parIndex = this.getParentIndex(tree);
	    this.cmd("Disconnect",  tree.parent.graphicID, tree.graphicID);
	    tree.parent.children[parIndex] = child;
            child.parent = tree.parent
	    this.cmd("Connect", tree.parent.graphicID, child.graphicID, RadixTree.FOREGROUND_COLOR, 0, false, child.wordRemainder.charAt(0));
	    this.cmd("Delete",  tree.graphicID);
         
	}
	this.resizeTree();
	
    }


}



RadixTree.prototype.treeDelete = function(tree, valueToDelete)
{
	
}

RadixTree.prototype.resizeTree = function()
{
	this.resizeWidths(this.root);
	if (this.root != null)
	{
	        var startingPoint = this.root.width / 2 + 1 + RadixTree.LeftMargin;
		this.setNewPositions(this.root, startingPoint, RadixTree.STARTING_Y);
		this.animateNewPositions(this.root);
		this.cmd("Step");
	}
	
}


RadixTree.prototype.add = function(word) 
{
	this.commands = new Array();	
	this.cmd("SetText", 0, "Inserting; ");
	this.cmd("SetText", 1, word);
        this.cmd("AlignRight", 1, 0);
        this.cmd("Step");
        this.highlightID = this.nextIndex++;
        this.root = this.addR(word.toUpperCase(), this.root, RadixTree.LEFT_MARGIN + RadixTree.NODE_WIDTH / 2 + 1, RadixTree.STARTING_Y, 0);
        this.resizeTree();
	this.cmd("SetText", 0, "");
	this.cmd("SetText", 1, "");
       
        return this.commands;
}


RadixTree.prototype.addR = function(s, rt, startX, startY, wordIndex)  
{
    if (rt == null) 
        {
		this.cmd("CreateCircle", this.nextIndex, s, RadixTree.NEW_NODE_X, RadixTree.NEW_NODE_Y); 
		this.cmd("SetForegroundColor", this.nextIndex, RadixTree.FOREGROUND_COLOR);
		this.cmd("SetBackgroundColor", this.nextIndex, RadixTree.BACKGROUND_COLOR);
                this.cmd("SetWidth", this.nextIndex, RadixTree.NODE_WIDTH);
	        this.cmd("SetText", 2, "Reached an empty tree.  Creating a node containing " + s);
		this.cmd("Step");				
	        this.cmd("SetText", 2, "" );
                rt = new RadixNode(s, this.nextIndex, startX, startY)
		this.nextIndex += 1;
                rt.isword = true;
               return rt;
        }

	this.cmd("SetHighlight", rt.graphicID , 1);




        var indexDifference = this.findIndexDifference(s, rt.wordRemainder, rt.graphicID, wordIndex);
                
// 	this.cmd("CreateHighlightCircle", this.highlightID, BST.HIGHLIGHT_CIRCLE_COLOR, tree.x, tree.y);
//	this.cmd("Move", this.highlightID, tree.left.x, tree.left.y);
//        this.cmd("Step");



        if (indexDifference == rt.wordRemainder.length)
        {
       
            this.cmd("SetText", 2, "Reached the end of the prefix stored at this node");
            this.cmd("Step");

            if (s.length > indexDifference)
            { 
		this.cmd("SetText", 2, "Recusively insert remaining string  \ninto the '" +s.charAt(indexDifference) +  "' child");
                this.cmd("Step");
                this.cmd("SetHighlight", rt.graphicID , 0);
		this.cmd("SetText", 1, s.substring(indexDifference));



		// TODO: HIGHLIGHT CIRCLE!

                var index = s.charCodeAt(indexDifference) - "A".charCodeAt(0);
		var noChild = rt.children[index] == null;


		if (noChild)
                {
 		      this.cmd("SetText", 2, "Child '" +s.charAt(indexDifference) +  "' does not exit.  Creating ...");
                      this.cmd("Step");
                 
                }  else {


		this.cmd("CreateHighlightCircle", this.highlightID, RadixTree.HIGHLIGHT_CIRCLE_COLOR, rt.x, rt.y);
                this.cmd("SetWidth", this.highlightID, RadixTree.NODE_WIDTH);

		this.cmd("Step")
   	        this.cmd("Move", this.highlightID, rt.children[index].x, rt.children[index].y);
		this.cmd("Step")

		this.cmd("Delete",  this.highlightID);
		    // DO HIGHILIGHT CIRCLE THING HERE
                }
		
		
		var connect = rt.children[index] == null;
                rt.children[index] = this.addR(s.substring(indexDifference), rt.children[index], rt.x, rt.y, wordIndex+indexDifference);
		rt.children[index].parent = rt;
                if (connect)
		{
		    this.cmd("Connect", rt.graphicID, rt.children[index].graphicID, RadixTree.FOREGROUND_COLOR, 0, false, s.charAt(indexDifference));
                }
                return rt;
            }
            this.cmd("SetText", 2, "Reached the end of the string.  Set Current node to \"True\"")
            this.cmd("Step");
            this.cmd("SetText", 2, "")

            this.cmd("SetBackgroundColor", rt.graphicID, RadixTree.BACKGROUND_COLOR);
            this.cmd("Step");
            this.cmd("SetHighlight", rt.graphicID , 0);

            rt.isword = true;
            return rt;    
        }

        var firstRemainder = rt.wordRemainder.substring(0, indexDifference);
        var secondRemainder = rt.wordRemainder.substring(indexDifference);

        this.cmd("SetText", 2, "Reached a mismatch in prefix. \nCreate a new node with common prefix")

        this.cmd("CreateCircle", this.nextIndex, firstRemainder,  RadixTree.NEW_NODE_X, RadixTree.NEW_NODE_Y);
	this.cmd("SetForegroundColor", this.nextIndex, RadixTree.FOREGROUND_COLOR);
 	this.cmd("SetBackgroundColor", this.nextIndex, RadixTree.FALSE_COLOR);
        this.cmd("SetWidth", this.nextIndex, RadixTree.NODE_WIDTH);
        this.cmd("Step")

        var newNode = new RadixNode(firstRemainder, this.nextIndex, 0, 0);
	this.nextIndex += 1;

        newNode.wordRemainder = firstRemainder;
        
        var index = rt.wordRemainder.charCodeAt(indexDifference) - "A".charCodeAt(0);
        newNode.parent = rt.parent;
        newNode.children[index] = rt;
        if (rt.parent != null)
        {
	    
            this.cmd("Disconnect", rt.parent.graphicID, rt.graphicID);
   	    this.cmd("Connect", rt.parent.graphicID, newNode.graphicID, RadixTree.FOREGROUND_COLOR, 0, false, newNode.wordRemainder.charAt(0));
            var childIndex = newNode.wordRemainder.charCodeAt(0) - 'A'.charCodeAt(0);
            rt.parent.children[childIndex] = newNode;
            rt.parent = newNode;

        }
        else
        {
	    this.root = newNode;
        }
        this.cmd("SetHighlight", rt.graphicID, 0);

        rt.parent = newNode;

        this.cmd("SetText", 2, "Connect new node to the old, and reset prefix stored at previous node");

	this.cmd("Connect", newNode.graphicID, newNode.children[index].graphicID, RadixTree.FOREGROUND_COLOR, 0, false, rt.wordRemainder.charAt(indexDifference));
        rt.wordRemainder = secondRemainder;       
         this.cmd("SetText", rt.graphicID, rt.wordRemainder);
        this.cmd("Step");



        this.resizeTree();

        if (indexDifference == s.length)
        {
            newNode.isword = true;
	    this.cmd("SetBackgroundColor", newNode.graphicID, RadixTree.BACKGROUND_COLOR);
        }
        else
        {
	    this.cmd("SetBackgroundColor", newNode.graphicID, RadixTree.FALSE_COLOR);
            index = s.charCodeAt(indexDifference) - "A".charCodeAt(0)
             this.cmd("SetText", 1, s.substring(indexDifference));

            newNode.children[index] = this.addR(s.substring(indexDifference), null, rt.x, rt.y, indexDifference+wordIndex);
	    newNode.children[index].parent = newNode;
	    this.cmd("Connect", newNode.graphicID, newNode.children[index].graphicID, RadixTree.FOREGROUND_COLOR, 0, false, s.charAt(indexDifference));

        }      
        return newNode;
    }

RadixTree.prototype.setNewPositions = function(tree, xPosition, yPosition)
{
	if (tree != null)
	{
                tree.x = xPosition;
		tree.y = yPosition;
                var newX = xPosition - tree.width / 2;
                var newY = yPosition + RadixTree.HEIGHT_DELTA;
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
RadixTree.prototype.animateNewPositions = function(tree)
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

RadixTree.prototype.resizeWidths = function(tree) 
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
        tree.width = Math.max(size, RadixTree.NODE_WIDTH  + 4)
        return tree.width;
}




function RadixNode(val, id, initialX, initialY)
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
        this.isword = false;
}

RadixTree.prototype.disableUI = function(event)
{
	this.insertField.disabled = true;
	this.insertButton.disabled = true;
	this.deleteField.disabled = true;
	this.deleteButton.disabled = true;
	this.findField.disabled = true;
	this.findButton.disabled = true;
	this.printButton.disabled = true;
}

RadixTree.prototype.enableUI = function(event)
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
	currentAlg = new RadixTree(animManag, canvas.width, canvas.height);
	
}
