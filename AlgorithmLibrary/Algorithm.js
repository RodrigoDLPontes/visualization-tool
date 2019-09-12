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

function addLabelToAlgorithmBar(labelName)
{
    var element = document.createTextNode(labelName);
	
	var tableEntry = document.createElement("td");	
	tableEntry.appendChild(element);
	
	
    var controlBar = document.getElementById("AlgorithmSpecificControls");
	
    //Append the element in page (in span).
    controlBar.appendChild(tableEntry);
	return element;
}

// TODO:  Make this stackable like radio butons
//        (keep backwards compatible, thought)
function addCheckboxToAlgorithmBar(boxLabel)
{	
	var element = document.createElement("input");

    element.setAttribute("type", "checkbox");
    element.setAttribute("value", boxLabel);
	
    var label = document.createTextNode(boxLabel);
	
	var tableEntry = document.createElement("td");	
	tableEntry.appendChild(element);
	tableEntry.appendChild(label);
	
    var controlBar = document.getElementById("AlgorithmSpecificControls");
	
    //Append the element in page (in span).
    controlBar.appendChild(tableEntry);
	return element;
}

function addRadioButtonGroupToAlgorithmBar(buttonNames, groupName)
{
	var buttonList = [];
	var newTable = document.createElement("table");
		
	for (var i = 0; i < buttonNames.length; i++)
	{
		var midLevel = document.createElement("tr");
		var bottomLevel = document.createElement("td");
		
		var button = document.createElement("input");
		button.setAttribute("type", "radio");
		button.setAttribute("name", groupName);
		button.setAttribute("value", buttonNames[i]);
		bottomLevel.appendChild(button);
		midLevel.appendChild(bottomLevel);
		var txtNode = document.createTextNode(" " + buttonNames[i]); 
		bottomLevel.appendChild(txtNode);
		newTable.appendChild(midLevel);	
		buttonList.push(button);
	}
	
	var topLevelTableEntry = document.createElement("td");
	topLevelTableEntry.appendChild(newTable);
	
	var controlBar = document.getElementById("AlgorithmSpecificControls");
	controlBar.appendChild(topLevelTableEntry);
	
	return buttonList
}


function addControlToAlgorithmBar(type, name) {
	
    var element = document.createElement("input");
	
    element.setAttribute("type", type);
    element.setAttribute("value", name);
//    element.setAttribute("name", name);
	
	
	var tableEntry = document.createElement("td");
	
	tableEntry.appendChild(element);
	
	
    var controlBar = document.getElementById("AlgorithmSpecificControls");
	
    //Append the element in page (in span).
    controlBar.appendChild(tableEntry);
	return element;
	
}




function Algorithm(am)
{
	
}



Algorithm.prototype.setCodeAlpha = function(code, newAlpha)
{
   var i,j;
   for (i = 0; i < code.length; i++)
       for (j = 0; j < code[i].length; j++) {
          this.cmd("SetAlpha", code[i][j], newAlpha);
       }
}


Algorithm.prototype.addCodeToCanvasBase  = function(code, start_x, start_y, line_height, standard_color, layer)
{
        layer = typeof layer !== 'undefined' ? layer : 0;
	var codeID = Array(code.length);
	var i, j;
	for (i = 0; i < code.length; i++)
	{
		codeID[i] = new Array(code[i].length);
		for (j = 0; j < code[i].length; j++)
		{
			codeID[i][j] = this.nextIndex++;
			this.cmd("CreateLabel", codeID[i][j], code[i][j], start_x, start_y + i * line_height, 0);
			this.cmd("SetForegroundColor", codeID[i][j], standard_color);
			this.cmd("SetLayer", codeID[i][j], layer);
			if (j > 0)
			{
				this.cmd("AlignRight", codeID[i][j], codeID[i][j-1]);
			}
		}
		
		
	}
	return codeID;
}


Algorithm.prototype.init = function(am, w, h)
{
	this.animationManager = am;
	am.addListener("AnimationStarted", this, this.disableUI);
	am.addListener("AnimationEnded", this, this.enableUI);
	am.addListener("AnimationUndo", this, this.undo);
	this.canvasWidth = w;
	this.canvasHeight = h;
	
	this.actionHistory = [];
	this.recordAnimation = true;
	this.commands = []
}


// Overload in subclass
Algorithm.prototype.sizeChanged = function(newWidth, newHeight)
{
	
}


		
Algorithm.prototype.implementAction = function(funct, val)
{
	var nxt = [funct, val];			
	this.actionHistory.push(nxt);
	var retVal = funct(val);
	this.animationManager.StartNewAnimation(retVal);			
}
		
		
Algorithm.prototype.isAllDigits = function(str)
{
	for (var i = str.length - 1; i >= 0; i--)
	{
		if (str.charAt(i) < "0" || str.charAt(i) > "9")
		{
			return false;

		}
	}
	return true;
}
		
		
Algorithm.prototype.normalizeNumber = function(input, maxLen)
{
	if (!this.isAllDigits(input) || input == "")
	{
		return input;
	}
	else
	{
		return ("OOO0000" +input).substr(-maxLen, maxLen);
	}
}
		
Algorithm.prototype.disableUI = function(event)
{
	// to be overridden in base class
}

Algorithm.prototype.enableUI = function(event)
{
	// to be overridden in base class
}



function controlKey(keyASCII)
{
		return keyASCII == 8 || keyASCII == 9 || keyASCII == 37 || keyASCII == 38 ||
	keyASCII == 39 || keyASCII == 40 || keyASCII == 46;
}



Algorithm.prototype.returnSubmitFloat = function(field, funct, maxsize)
{
	if (maxsize != undefined)
	{
		field.size = maxsize;
	}
	return function(event)
	{
		var keyASCII = 0;
		if(window.event) // IE
		{
			keyASCII = event.keyCode
		}
		else if (event.which) // Netscape/Firefox/Opera
		{
			keyASCII = event.which
		} 
		// Submit on return
		if (keyASCII == 13)
		{
			funct();
		}
		// Control keys (arrows, del, etc) are always OK
		else if (controlKey(keyASCII))
		{
			return;
		}
		// - (minus sign) only OK at beginning of number
		//  (For now we will allow anywhere -- hard to see where the beginning of the
		//   number is ...)
		//else if (keyASCII == 109 && field.value.length  == 0)
		else if (keyASCII == 109)
		{
			return;
		}
		// Digis are OK if we have enough space
		else if ((maxsize != undefined || field.value.length < maxsize) &&
				 (keyASCII >= 48 && keyASCII <= 57))
		{
			return;
		}
		// . (Decimal point) is OK if we haven't had one yet, and there is space
		else if ((maxsize != undefined || field.value.length < maxsize) &&
				 (keyASCII == 190) && field.value.indexOf(".") == -1)
				 
		{
			return;
		}
		// Nothing else is OK
		else 		
		{
			return false;
		}
		
	}
}


Algorithm.prototype.returnSubmit = function(field, funct, maxsize, intOnly)
{
	if (maxsize != undefined)
	{
	    field.size = maxsize;
	}
	return function(event)
	{
		var keyASCII = 0;
		if(window.event) // IE
		{
			keyASCII = event.keyCode
		}
		else if (event.which) // Netscape/Firefox/Opera
		{
			keyASCII = event.which
		} 

		if (keyASCII == 13 && funct !== null)
		{
			funct();
		}
                else if (keyASCII == 190 || keyASCII == 59 || keyASCII == 173 || keyASCII == 189)
		{ 
			return false;	
		    
		}
		else if ((maxsize != undefined && field.value.length >= maxsize) ||
				 intOnly && (keyASCII < 48 || keyASCII > 57))
		{
			if (!controlKey(keyASCII))
				return false;
		}
		
	}
	
}

Algorithm.prototype.addReturnSubmit = function(field, action)
{
	field.onkeydown = this.returnSubmit(field, action, 4, false);	
}

Algorithm.prototype.reset = function()
{
	// to be overriden in base class
	// (Throw exception here?)
}
		
Algorithm.prototype.undo = function(event)
{
	// Remvoe the last action (the one that we are going to undo)
	this.actionHistory.pop();
	// Clear out our data structure.  Be sure to implement reset in
	//   every AlgorithmAnimation subclass!
	this.reset();
	//  Redo all actions from the beginning, throwing out the animation
	//  commands (the animation manager will update the animation on its own).
	//  Note that if you do something non-deterministic, you might cause problems!
	//  Be sure if you do anything non-deterministic (that is, calls to a random
	//  number generator) you clear out the undo stack here and in the animation
	//  manager.
	//
	//  If this seems horribly inefficient -- it is! However, it seems to work well
	//  in practice, and you get undo for free for all algorithms, which is a non-trivial
	//  gain.
	var len = this.actionHistory.length;
	this.recordAnimation = false;
	for (var i = 0; i < len; i++)
	{
		this.actionHistory[i][0](this.actionHistory[i][1]);
	}
	this.recordAnimation = true;
}


Algorithm.prototype.clearHistory = function()
{
	this.actionHistory = [];
}
		
		// Helper method to add text input with nice border.
		//  AS3 probably has a built-in way to do this.   Replace when found.
		

		// Helper method to create a command string from a bunch of arguments
Algorithm.prototype.cmd = function()
{
	if (this.recordAnimation)
	{
		var command = arguments[0];
		for(i = 1; i < arguments.length; i++)
		{
			command = command + "<;>" + String(arguments[i]);
		}
		this.commands.push(command);
	}
	
}
