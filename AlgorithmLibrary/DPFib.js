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



function DPFib(am, w, h)
{
	this.init(am, w, h);
	
}

DPFib.prototype = new Algorithm();
DPFib.prototype.constructor = DPFib;
DPFib.superclass = Algorithm.prototype;

DPFib.TABLE_ELEM_WIDTH = 40;
DPFib.TABLE_ELEM_HEIGHT = 30;

DPFib.TABLE_START_X = 500;
DPFib.TABLE_START_Y = 40;
DPFib.TABLE_DIFF_X = 100;

DPFib.CODE_START_X = 10;
DPFib.CODE_START_Y = 10;
DPFib.CODE_LINE_HEIGHT = 14;

DPFib.RECURSIVE_START_X = 20;
DPFib.RECURSIVE_START_Y = 120;
DPFib.RECURSIVE_DELTA_Y = 14;
DPFib.RECURSIVE_DELTA_X = 15;
DPFib.CODE_HIGHLIGHT_COLOR = "#FF0000";
DPFib.CODE_STANDARD_COLOR = "#000000";

DPFib.TABLE_INDEX_COLOR = "#0000FF"
DPFib.CODE_RECURSIVE_1_COLOR = "#339933";
DPFib.CODE_RECURSIVE_2_COLOR = "#0099FF";



DPFib.MAX_VALUE = 20;

DPFib.MESSAGE_ID = 0;
		
DPFib.prototype.init = function(am, w, h)
{
	DPFib.superclass.init.call(this, am, w, h);
	this.nextIndex = 0;
	this.addControls();
	this.code = [["def ","fib(n)",":"], 
				 ["     if ","(n <= 1) "],
				 ["          return 1"],
				 ["     else"],
				 ["          return ", "fib(n-1)", " + ", "fib(n-2)"]];
	
	this.codeID = Array(this.code.length);
	var i, j;
	for (i = 0; i < this.code.length; i++)
	{
		this.codeID[i] = new Array(this.code[i].length);
		for (j = 0; j < this.code[i].length; j++)
		{
			this.codeID[i][j] = this.nextIndex++;
			this.cmd("CreateLabel", this.codeID[i][j], this.code[i][j], DPFib.CODE_START_X, DPFib.CODE_START_Y + i * DPFib.CODE_LINE_HEIGHT, 0);
			this.cmd("SetForegroundColor", this.codeID[i][j], DPFib.CODE_STANDARD_COLOR);
			if (j > 0)
			{
				this.cmd("AlignRight", this.codeID[i][j], this.codeID[i][j-1]);
			}
		}
		
		
	}
		
	this.animationManager.StartNewAnimation(this.commands);
	this.animationManager.skipForward();
	this.animationManager.clearHistory();
	this.initialIndex = this.nextIndex;
	this.oldIDs = [];
	this.commands = [];
}


DPFib.prototype.addControls =  function()
{
	this.controls = [];
	this.fibField = addControlToAlgorithmBar("Text", "");
	this.fibField.onkeydown = this.returnSubmit(this.fibField,  this.emptyCallback.bind(this), 2, true);
	this.controls.push(this.fibField);

	this.recursiveButton = addControlToAlgorithmBar("Button", "Fibonacci Recursive");
	this.recursiveButton.onclick = this.recursiveCallback.bind(this);
	this.controls.push(this.recursiveButton);

	this.tableButton = addControlToAlgorithmBar("Button", "Fibonacci Table");
	this.tableButton.onclick = this.tableCallback.bind(this);
	this.controls.push(this.tableButton);

	this.memoizedButton = addControlToAlgorithmBar("Button", "Fibonacci Memoized");
	this.memoizedButton.onclick = this.memoizedCallback.bind(this);
	this.controls.push(this.memoizedButton);
		
}
	


DPFib.prototype.buildTable  = function(maxVal)
{
	this.tableID = new Array(maxVal + 1);
	this.tableVals = new Array(maxVal + 1);
	this.tableXPos = new Array(maxVal + 1);
	this.tableYPos = new Array(maxVal + 1);
	var i;
	var indexID;
	var xPos;
	var yPos;
	var	table_rows = Math.floor((this.canvasHeight - DPFib.TABLE_ELEM_HEIGHT - DPFib.TABLE_START_Y) / DPFib.TABLE_ELEM_HEIGHT);
	
	for (i = 0; i <= maxVal; i++)
	{
		this.tableID[i] = this.nextIndex++;
		this.tableVals[i] = -1;
		this.oldIDs.push(this.tableID[i]);
		
		yPos = i % table_rows *  DPFib.TABLE_ELEM_HEIGHT + DPFib.TABLE_START_Y;
		xPos = Math.floor(i / table_rows) * DPFib.TABLE_DIFF_X + DPFib.TABLE_START_X;
		
		this.tableXPos[i] = xPos;
		this.tableYPos[i] = yPos;
		
		this.cmd("CreateRectangle", this.tableID[i], 
				                    "", 
				                   DPFib.TABLE_ELEM_WIDTH,
				                   DPFib.TABLE_ELEM_HEIGHT,
								   xPos,
				                   yPos);
		indexID = this.nextIndex++;
		this.oldIDs.push(indexID);
		this.cmd("CreateLabel", indexID, i, xPos - DPFib.TABLE_ELEM_WIDTH,  yPos);
		this.cmd("SetForegroundColor", indexID, DPFib.TABLE_INDEX_COLOR);
	}	
}

DPFib.prototype.clearOldIDs = function()
{
	for (var i = 0; i < this.oldIDs.length; i++)
	{
		this.cmd("Delete", this.oldIDs[i]);
	}
	this.oldIDs =[];
	this.nextIndex = this.initialIndex;
	
}


DPFib.prototype.reset = function()
{
	this.oldIDs =[];
	this.nextIndex = this.initialIndex;	
}



DPFib.prototype.emptyCallback = function(event)
{
	this.implementAction(this.helpMessage.bind(this), "");
	// TODO:  Put up a message to push the appropriate button?

}
		
DPFib.prototype.recursiveCallback = function(event)
{
	var fibValue;
	
	if (this.fibField.value != "")
	{
		var fibValue = Math.min(parseInt(this.fibField.value), DPFib.MAX_VALUE);
		this.fibField.value = String(fibValue);
		this.implementAction(this.recursiveFib.bind(this),fibValue);
	}
	else
	{
		this.implementAction(this.helpMessage.bind(this), "");	
	}
}


DPFib.prototype.tableCallback = function(event)
{
	var fibValue;
	
	if (this.fibField.value != "")
	{
		var fibValue = Math.min(parseInt(this.fibField.value), DPFib.MAX_VALUE);
		this.fibField.value = String(fibValue);
		this.implementAction(this.tableFib.bind(this),fibValue);
	}
	else
	{
		this.implementAction(this.helpMessage.bind(this), "");	
	}
		
}


DPFib.prototype.memoizedCallback = function(event)
{
	var fibValue;
	
	if (this.fibField.value != "")
	{
		var fibValue = Math.min(parseInt(this.fibField.value), DPFib.MAX_VALUE);
		this.fibField.value = String(fibValue);
		this.implementAction(this.memoizedFib.bind(this),fibValue);
	}
	else
	{
		this.implementAction(this.helpMessage.bind(this), "");	
	}
}

DPFib.prototype.helpMessage = function(value)
{
	this.commands = [];
	
	this.clearOldIDs();
	
	var messageID = this.nextIndex++;
	this.oldIDs.push(messageID);
	this.cmd("CreateLabel", messageID,
			 "Enter a value betweeen 0 and " + String(DPFib.MAX_VALUE) + " in the text field.\n" +
			 "Then press the Fibonacci Recursive, Fibonacci Table, or Fibonacci Memoized button",
			 DPFib.RECURSIVE_START_X, DPFib.RECURSIVE_START_Y, 0);
	return this.commands;
	
	
}


DPFib.prototype.recursiveFib = function(value)
{
	this.commands = [];
	
	this.clearOldIDs();
	
	this.currentY = DPFib.RECURSIVE_START_Y;
	
	var functionCallID = this.nextIndex++;
	this.oldIDs.push(functionCallID);
	var final = this.fib(value, DPFib.RECURSIVE_START_X, functionCallID);
	this.cmd("SetText", functionCallID, "fib(" + String(value) + ") = " + String(final));
	return this.commands;
}


DPFib.prototype.fib = function(value, xPos, ID)
{
	this.cmd("CreateLabel", ID, "fib(" + String(value)+")", xPos, this.currentY, 0);
	this.currentY += DPFib.RECURSIVE_DELTA_Y;
	this.cmd("SetForegroundColor", this.codeID[0][1], DPFib.CODE_HIGHLIGHT_COLOR);
	this.cmd("Step");
	this.cmd("SetForegroundColor", this.codeID[0][1], DPFib.CODE_STANDARD_COLOR);
	this.cmd("SetForegroundColor", this.codeID[1][1], DPFib.CODE_HIGHLIGHT_COLOR);
	this.cmd("Step");
	this.cmd("SetForegroundColor", this.codeID[1][1], DPFib.CODE_STANDARD_COLOR);
	if (value > 1)
	{
		var firstID = this.nextIndex++;
		var secondID = this.nextIndex++;
		this.cmd("SetForegroundColor", this.codeID[4][1], DPFib.CODE_HIGHLIGHT_COLOR);
		this.cmd("Step");
		this.cmd("SetForegroundColor", this.codeID[4][1], DPFib.CODE_STANDARD_COLOR);
		var firstValue = this.fib(value-1, xPos + DPFib.RECURSIVE_DELTA_X, firstID);
		this.currentY += DPFib.RECURSIVE_DELTA_Y;
		this.cmd("SetForegroundColor", this.codeID[4][3], DPFib.CODE_HIGHLIGHT_COLOR);
		this.cmd("Step");
		this.cmd("SetForegroundColor", this.codeID[4][3], DPFib.CODE_STANDARD_COLOR);
		var secondValue = this.fib(value-2, xPos + DPFib.RECURSIVE_DELTA_X, secondID);

		
		this.cmd("SetForegroundColor", this.codeID[4][1], DPFib.CODE_RECURSIVE_1_COLOR);
		this.cmd("SetForegroundColor", firstID, DPFib.CODE_RECURSIVE_1_COLOR);
		this.cmd("SetForegroundColor", this.codeID[4][2], DPFib.CODE_HIGHLIGHT_COLOR);
		this.cmd("SetForegroundColor", this.codeID[4][3], DPFib.CODE_RECURSIVE_2_COLOR);
		this.cmd("SetForegroundColor", secondID, DPFib.CODE_RECURSIVE_2_COLOR);
		this.cmd("Step");
		this.cmd("SetForegroundColor", this.codeID[4][1], DPFib.CODE_STANDARD_COLOR);
		this.cmd("SetForegroundColor", this.codeID[4][2], DPFib.CODE_STANDARD_COLOR);
		this.cmd("SetForegroundColor", this.codeID[4][3], DPFib.CODE_STANDARD_COLOR);
		
		
		
		this.cmd("Delete", firstID);
		this.cmd("Delete", secondID);
		this.cmd("SetText", ID, firstValue + secondValue);
		this.cmd("Step");
		this.currentY  = this.currentY - 2 * DPFib.RECURSIVE_DELTA_Y;
		return firstValue + secondValue;
	}
	else
	{
		this.cmd("SetText", ID, "1");
		this.cmd("SetForegroundColor", this.codeID[2][0], DPFib.CODE_HIGHLIGHT_COLOR);
		this.cmd("Step");
		this.cmd("SetForegroundColor", this.codeID[2][0], DPFib.CODE_STANDARD_COLOR);
		
		this.currentY -= DPFib.RECURSIVE_DELTA_Y;
		return 1;
	}
	
	
	
}




DPFib.prototype.tableFib = function(value)
{
	this.commands = [];
	this.clearOldIDs();
	this.buildTable(value);
	var i;
	for (i = 0; i <= value && i <= 1; i++)
	{
		this.cmd("SetForegroundColor", this.codeID[1][1], DPFib.CODE_HIGHLIGHT_COLOR);
		this.cmd("SetForegroundColor", this.codeID[2][0], DPFib.CODE_HIGHLIGHT_COLOR);
		this.cmd("SetHighlight", this.tableID[i], 1);
		this.cmd("SetText", this.tableID[i], 1);
		this.tableVals[i] = 1;
		this.cmd("Step");
		this.cmd("SetForegroundColor", this.codeID[1][1], DPFib.CODE_STANDARD_COLOR);
		this.cmd("SetForegroundColor", this.codeID[2][0], DPFib.CODE_STANDARD_COLOR);
		this.cmd("SetHighlight", this.tableID[i], 0);		
	}
	for (i = 2; i <= value; i++)
	{
		this.cmd("SetHighlight", this.tableID[i-1], 1)
		this.cmd("SetHighlight", this.tableID[i-2], 1)
		this.cmd("SetForegroundColor", this.codeID[4][1], DPFib.CODE_HIGHLIGHT_COLOR);
		this.cmd("SetForegroundColor", this.codeID[4][2], DPFib.CODE_HIGHLIGHT_COLOR);
		this.cmd("SetForegroundColor", this.codeID[4][3], DPFib.CODE_HIGHLIGHT_COLOR);
		this.cmd("Step");
		this.tableVals[i] = this.tableVals[i-1] + this.tableVals[i-2];
		this.cmd("SetText", this.tableID[i], this.tableVals[i]);
		this.cmd("SetTextColor", this.tableID[i], DPFib.CODE_HIGHLIGHT_COLOR);
		this.cmd("Step");
		this.cmd("SetForegroundColor", this.codeID[4][1], DPFib.CODE_STANDARD_COLOR);
		this.cmd("SetForegroundColor", this.codeID[4][2], DPFib.CODE_STANDARD_COLOR);
		this.cmd("SetForegroundColor", this.codeID[4][3], DPFib.CODE_STANDARD_COLOR);
		this.cmd("SetTextColor", this.tableID[i], DPFib.CODE_STANDARD_COLOR);
		this.cmd("SetHighlight", this.tableID[i-1], 0)
		this.cmd("SetHighlight", this.tableID[i-2], 0)
		
		
	}
	
	var finalID = this.nextIndex++;
	this.oldIDs.push(finalID);
	this.cmd("CreateLabel", finalID, this.tableVals[value], this.tableXPos[value] - 5, this.tableYPos[value] - 5, 0);
	this.cmd("Move", finalID, DPFib.RECURSIVE_START_X, DPFib.RECURSIVE_START_Y);
	this.cmd("Step");
	this.cmd("SetText", finalID, "fib(" + String(value) + ") = " + String(this.tableVals[value]));
												  
	return this.commands;
	
	
}



DPFib.prototype.fibMem = function(value, xPos, ID)
{
	this.cmd("CreateLabel", ID, "fib(" + String(value)+")", xPos, this.currentY, 0);
	this.cmd("SetHighlight", this.tableID[value], 1);
	// TODO: Add an extra pause here?
	this.cmd("Step");
	if (this.tableVals[value] >= 0)
	{
		this.cmd("Delete", ID, "fib(" + String(value)+")", xPos, this.currentY, 0);
		this.cmd("CreateLabel", ID, this.tableVals[value], this.tableXPos[value] - 5, this.tableYPos[value] - 5, 0);
		this.cmd("Move", ID, xPos, this.currentY);
		this.cmd("Step")
		this.cmd("SetHighlight", this.tableID[value], 0);
		return this.tableVals[value];
	}
	this.cmd("SetHighlight", this.tableID[value], 0);
	this.currentY += DPFib.RECURSIVE_DELTA_Y;
	this.cmd("SetForegroundColor", this.codeID[0][1], DPFib.CODE_HIGHLIGHT_COLOR);
	this.cmd("Step");
	this.cmd("SetForegroundColor", this.codeID[0][1], DPFib.CODE_STANDARD_COLOR);
	this.cmd("SetForegroundColor", this.codeID[1][1], DPFib.CODE_HIGHLIGHT_COLOR);
	this.cmd("Step");
	this.cmd("SetForegroundColor", this.codeID[1][1], DPFib.CODE_STANDARD_COLOR);
	if (value > 1)
	{
		var firstID = this.nextIndex++;
		var secondID = this.nextIndex++;
		this.cmd("SetForegroundColor", this.codeID[4][1], DPFib.CODE_HIGHLIGHT_COLOR);
		this.cmd("Step");
		this.cmd("SetForegroundColor", this.codeID[4][1], DPFib.CODE_STANDARD_COLOR);
		var firstValue = this.fibMem(value-1, xPos + DPFib.RECURSIVE_DELTA_X, firstID);
		this.currentY += DPFib.RECURSIVE_DELTA_Y;
		this.cmd("SetForegroundColor", this.codeID[4][3], DPFib.CODE_HIGHLIGHT_COLOR);
		this.cmd("Step");
		this.cmd("SetForegroundColor", this.codeID[4][3], DPFib.CODE_STANDARD_COLOR);
		var secondValue = this.fibMem(value-2, xPos + DPFib.RECURSIVE_DELTA_X, secondID);
		
		
		this.cmd("SetForegroundColor", this.codeID[4][1], DPFib.CODE_RECURSIVE_1_COLOR);
		this.cmd("SetForegroundColor", firstID, DPFib.CODE_RECURSIVE_1_COLOR);
		this.cmd("SetForegroundColor", this.codeID[4][2], DPFib.CODE_HIGHLIGHT_COLOR);
		this.cmd("SetForegroundColor", this.codeID[4][3], DPFib.CODE_RECURSIVE_2_COLOR);
		this.cmd("SetForegroundColor", secondID, DPFib.CODE_RECURSIVE_2_COLOR);
		this.cmd("Step");
		this.cmd("SetForegroundColor", this.codeID[4][1], DPFib.CODE_STANDARD_COLOR);
		this.cmd("SetForegroundColor", this.codeID[4][2], DPFib.CODE_STANDARD_COLOR);
		this.cmd("SetForegroundColor", this.codeID[4][3], DPFib.CODE_STANDARD_COLOR);
		
		
		
		this.cmd("Delete", firstID);
		this.cmd("Delete", secondID);
		this.cmd("SetText", ID, firstValue + secondValue);
		this.cmd("Step");
		this.tableVals[value] = firstValue + secondValue;
		this.currentY  = this.currentY - 2 * DPFib.RECURSIVE_DELTA_Y;
		this.cmd("CreateLabel", this.nextIndex, this.tableVals[value], xPos+5, this.currentY + 5);
		this.cmd("Move", this.nextIndex, this.tableXPos[value], this.tableYPos[value], this.currentY);
		this.cmd("Step");
		this.cmd("Delete", this.nextIndex);
		this.cmd("SetText", this.tableID[value], this.tableVals[value]);
		return firstValue + secondValue;
	}
	else
	{
		this.cmd("SetText", ID, "1");
		this.cmd("SetForegroundColor", this.codeID[2][0], DPFib.CODE_HIGHLIGHT_COLOR);
		this.cmd("Step");
		this.cmd("SetForegroundColor", this.codeID[2][0], DPFib.CODE_STANDARD_COLOR);
		this.tableVals[value] = 1;
		this.cmd("CreateLabel", this.nextIndex, this.tableVals[value], xPos + 5, this.currentY + 5);
		this.cmd("Move", this.nextIndex, this.tableXPos[value], this.tableYPos[value], this.currentY);
		this.cmd("Step");
		this.cmd("Delete", this.nextIndex);
		this.cmd("SetText", this.tableID[value], this.tableVals[value]);
		
		this.currentY -= DPFib.RECURSIVE_DELTA_Y;
		return 1;
	}
	
}

DPFib.prototype.memoizedFib = function(value)
{
	this.commands = [];
	
	this.clearOldIDs();
	this.buildTable(value);
	
	this.currentY = DPFib.RECURSIVE_START_Y;
	
	var functionCallID = this.nextIndex++;
	this.oldIDs.push(functionCallID);
	var final = this.fibMem(value, DPFib.RECURSIVE_START_X, functionCallID);
	
	this.cmd("SetText", functionCallID, "fib(" + String(value) + ") = " + String(final));
	return this.commands;
}

DPFib.prototype.enableUI = function(event)
{
	for (var i = 0; i < this.controls.length; i++)
	{
		this.controls[i].disabled = false;
	}
	
	
}
DPFib.prototype.disableUI = function(event)
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
	currentAlg = new DPFib(animManag, canvas.width, canvas.height);
}



