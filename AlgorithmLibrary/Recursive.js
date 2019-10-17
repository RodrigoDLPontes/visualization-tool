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



function Recursive(am, w, h)
{
	if (am != undefined)
		this.init(am, w, h);
	
}

Recursive.prototype = new Algorithm();
Recursive.prototype.constructor = Recursive;
Recursive.superclass = Algorithm.prototype;


Recursive.CODE_START_X = 10;
Recursive.CODE_START_Y = 10;
Recursive.CODE_LINE_HEIGHT = 14;

Recursive.RECURSIVE_START_X = 20;
Recursive.RECURSIVE_START_Y = 120;
Recursive.RECURSIVE_DELTA_Y = 14;
Recursive.RECURSIVE_DELTA_X = 15;
Recursive.CODE_HIGHLIGHT_COLOR = "#FF0000";
Recursive.CODE_STANDARD_COLOR = "#000000";

Recursive.TABLE_INDEX_COLOR = "#0000FF"
Recursive.CODE_RECURSIVE_1_COLOR = "#339933";
Recursive.CODE_RECURSIVE_2_COLOR = "#0099FF";

Recursive.ACTIVATION_RECORD_WIDTH = 100;
Recursive.ACTIVATION_RECORD_HEIGHT = 20;

Recursive.ACTIVATION_RECORD_SPACING = 2 * Recursive.ACTIVATION_RECORD_WIDTH + 10;


		

Recursive.SEPARATING_LINE_COLOR = "#0000FF"

Recursive.prototype.addCodeToCanvas  = function(code)
{
     this.codeID = this.addCodeToCanvasBase(code, Recursive.CODE_START_X, Recursive.CODE_START_Y, Recursive.CODE_LINE_HEIGHT, Recursive.CODE_STANDARD_COLOR);
/*	this.codeID = Array(this.code.length);
	var i, j;
	for (i = 0; i < code.length; i++)
	{
		this.codeID[i] = new Array(code[i].length);
		for (j = 0; j < code[i].length; j++)
		{
			this.codeID[i][j] = this.nextIndex++;
			this.cmd("CreateLabel", this.codeID[i][j], code[i][j], Recursive.CODE_START_X, Recursive.CODE_START_Y + i * Recursive.CODE_LINE_HEIGHT, 0);
			this.cmd("SetForegroundColor", this.codeID[i][j], Recursive.CODE_STANDARD_COLOR);
			if (j > 0)
			{
				this.cmd("AlignRight", this.codeID[i][j], this.codeID[i][j-1]);
			}
		}
		
		
	} */
	
}


Recursive.prototype.init = function(am, w, h)
{
	Recursive.superclass.init.call(this, am, w, h);
}
	

Recursive.prototype.clearOldIDs = function()
{
	for (var i = 0; i < this.oldIDs.length; i++)
	{
		this.cmd("Delete", this.oldIDs[i]);
	}
	this.oldIDs =[];
	this.nextIndex = this.initialIndex;
	
}


Recursive.prototype.reset = function()
{
	this.oldIDs =[];
	this.nextIndex = this.initialIndex;	
}

		


Recursive.prototype.enableUI = function(event)
{
	for (var i = 0; i < this.controls.length; i++)
	{
		this.controls[i].disabled = false;
	}
	
	
}
Recursive.prototype.disableUI = function(event)
{
	for (var i = 0; i < this.controls.length; i++)
	{
		this.controls[i].disabled = true;
	}
}



Recursive.prototype.deleteActivation = function(activationRec)
{
	var i;
	for (i = 0; i < activationRec.labelIDs.length; i++)
	{
		this.cmd("Delete", activationRec.labelIDs[i]);
		this.cmd("Delete", activationRec.fieldIDs[i]);
	}
	this.cmd("Delete", activationRec.separatingLineID);
	this.cmd("Delete", activationRec.nameID);
}


Recursive.prototype.createActivation = function(functionName, argList, x, y, labelsOnLeft)
{
	var activationRec = new ActivationRecord(argList);
	var i;
	activationRec.nameID = this.nextIndex++;
	labelsOnLeft = (labelsOnLeft == undefined) ? true : labelsOnLeft;
	for (i = 0; i < argList.length; i++)
	{
		var valueID = this.nextIndex++;
		activationRec.fieldIDs[i] = valueID;
		
		this.cmd("CreateRectangle", valueID,
				                    "",
								    Recursive.ACTIVATION_RECORD_WIDTH, 
								    Recursive.ACTIVATION_RECORD_HEIGHT, 
				                    x,
				                    y + i * Recursive.ACTIVATION_RECORD_HEIGHT);
		
		var labelID  = this.nextIndex++;
		activationRec.labelIDs[i] = labelID;
		this.cmd("CreateLabel", labelID, argList[i]);
		if (labelsOnLeft)
			this.cmd("AlignLeft", labelID, valueID);
		else
			this.cmd("AlignRight", labelID, valueID);
	}
	activationRec.separatingLineID = this.nextIndex++;
	this.cmd("CreateLabel", activationRec.nameID, "   " + functionName + "   ");
	this.cmd("SetForegroundColor", activationRec.nameID, Recursive.SEPARATING_LINE_COLOR);

	if (labelsOnLeft)
	{
		this.cmd("CreateRectangle", activationRec.separatingLineID,
				 "",
				 Recursive.ACTIVATION_RECORD_WIDTH * 2,
				 1,
				 x - Recursive.ACTIVATION_RECORD_WIDTH / 2,
				 y - Recursive.ACTIVATION_RECORD_HEIGHT / 2);
				this.cmd("AlignLeft", activationRec.nameID, activationRec.labelIDs[0]);
	}
	else
	{
		this.cmd("CreateRectangle", activationRec.separatingLineID,
				 "",
				 Recursive.ACTIVATION_RECORD_WIDTH * 2,
				 1,
				 x + Recursive.ACTIVATION_RECORD_WIDTH / 2,
				 y - Recursive.ACTIVATION_RECORD_HEIGHT / 2);
		this.cmd("AlignRight", activationRec.nameID, activationRec.labelIDs[0]);

	}
	this.cmd("SetForegroundColor", activationRec.separatingLineID, Recursive.SEPARATING_LINE_COLOR);
	return activationRec;
	
}



function ActivationRecord(fields)
{
	this.fields = fields;
	this.values = new Array(this.fields.length);
	var i;
	for (i = 0; i < this.fields.length; i++)
	{
		this.values[i] = "";
	}
	this.fieldIDs = new Array(this.fields.length);
	this.labelIDs = new Array(this.fields.length);	
}



