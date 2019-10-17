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



function Reverse(am, w, h)
{
	this.init(am, w, h);
	
}

Reverse.prototype = new Recursive();
Reverse.prototype.constructor = Reverse;
Reverse.superclass = Recursive.prototype;

Reverse.ACTIVATION_FIELDS = ["word ", "subProblem ", "subSolution ", "solution "];

Reverse.CODE = [["def ","reverse(word)",":"], 
				["     if ","(word == \"\"): "],
				["          return word"],
				["     else:"],
				["          subProblem = ", "word[1:]"],
				["          subSolution = ", "reverse(subProblem)"],
				["          solution = ", "subSolution + word[0]"],
				["          return = ", "solution"]];


Reverse.RECURSIVE_DELTA_Y = Reverse.ACTIVATION_FIELDS.length * Recursive.ACTIVATION_RECORD_HEIGHT;


Reverse.ACTIVATION_RECORT_START_X = 375;
Reverse.ACTIVATION_RECORT_START_Y = 20;



Reverse.prototype.init = function(am, w, h)
{
	Reverse.superclass.init.call(this, am, w, h);
	this.nextIndex = 0;
	this.addControls();
	this.code = Reverse.CODE;
	
	
	this.addCodeToCanvas(this.code);
		
	this.animationManager.StartNewAnimation(this.commands);
	this.animationManager.skipForward();
	this.animationManager.clearHistory();
	this.initialIndex = this.nextIndex;
	this.oldIDs = [];
	this.commands = [];
}


Reverse.prototype.addControls =  function()
{
	this.controls = [];
	this.reverseField = addControlToAlgorithmBar("Text", "");
	this.reverseField.onkeydown = this.returnSubmit(this.reverseField,  this.reverseCallback.bind(this), 10, false);
	this.controls.push(this.reverseField);

	this.reverseButton = addControlToAlgorithmBar("Button", "Reverse");
	this.reverseButton.onclick = this.reverseCallback.bind(this);
	this.controls.push(this.reverseButton);
		
}
	


		
Reverse.prototype.reverseCallback = function(event)
{
	var factValue;
	
	if (this.reverseField.value != "")
	{
		var revValue =this.reverseField.value;
		this.implementAction(this.doReverse.bind(this),revValue);
	}
}




Reverse.prototype.doReverse = function(value)
{
	this.commands = [];
	
	this.clearOldIDs();
	
	this.currentY = Reverse.ACTIVATION_RECORT_START_Y;
	this.currentX = Reverse.ACTIVATION_RECORT_START_X;
	
	var final = this.reverse(value);
	var resultID = this.nextIndex++;
	this.oldIDs.push(resultID);
	this.cmd("CreateLabel", resultID, "reverse(" + String(value) + ") = " + String(final),  
			 Recursive.CODE_START_X, Recursive.CODE_START_Y + (this.code.length + 1) * Recursive.CODE_LINE_HEIGHT, 0);
	return this.commands;
}


Reverse.prototype.reverse = function(value)
{
	
	var activationRec = this.createActivation("reverse     ", Reverse.ACTIVATION_FIELDS, this.currentX, this.currentY);
	this.cmd("SetText", activationRec.fieldIDs[0], value);
//	this.cmd("CreateLabel", ID, "", 10, this.currentY, 0);
	var oldX  = this.currentX;
	var oldY = this.currentY;
	this.currentY += Reverse.RECURSIVE_DELTA_Y;
	if (this.currentY + Recursive.RECURSIVE_DELTA_Y > this.canvasHeight)
	{
		this.currentY =  Reverse.ACTIVATION_RECORT_START_Y;
		this.currentX += Recursive.ACTIVATION_RECORD_SPACING;
	}
	this.cmd("SetForegroundColor", this.codeID[0][1], Recursive.CODE_HIGHLIGHT_COLOR);
	this.cmd("Step");
	this.cmd("SetForegroundColor", this.codeID[0][1], Recursive.CODE_STANDARD_COLOR);
	this.cmd("SetForegroundColor", this.codeID[1][1], Recursive.CODE_HIGHLIGHT_COLOR);
	this.cmd("Step");
	this.cmd("SetForegroundColor", this.codeID[1][1], Recursive.CODE_STANDARD_COLOR);
	if (value  != "")
	{
		this.cmd("SetForegroundColor", this.codeID[4][0], Recursive.CODE_HIGHLIGHT_COLOR);
		this.cmd("SetForegroundColor", this.codeID[4][1], Recursive.CODE_HIGHLIGHT_COLOR);
		var subProblem = value.substr(1);
		this.cmd("SetText", activationRec.fieldIDs[1], subProblem);
		this.cmd("Step");
		this.cmd("SetForegroundColor", this.codeID[4][0], Recursive.CODE_STANDARD_COLOR);
		this.cmd("SetForegroundColor", this.codeID[4][1], Recursive.CODE_STANDARD_COLOR);
		this.cmd("SetForegroundColor", this.codeID[5][1], Recursive.CODE_HIGHLIGHT_COLOR);
		this.cmd("Step");
		this.cmd("SetForegroundColor", this.codeID[5][1], Recursive.CODE_STANDARD_COLOR);
		
		
		
		var subSolution = this.reverse(subProblem);

		this.cmd("SetForegroundColor", this.codeID[5][0], Recursive.CODE_HIGHLIGHT_COLOR);
		this.cmd("SetForegroundColor", this.codeID[5][1], Recursive.CODE_HIGHLIGHT_COLOR);
		this.cmd("SetText", activationRec.fieldIDs[2], subSolution);
		this.cmd("Step");
		this.cmd("SetForegroundColor", this.codeID[5][0], Recursive.CODE_STANDARD_COLOR);
		this.cmd("SetForegroundColor", this.codeID[5][1], Recursive.CODE_STANDARD_COLOR);
			
		this.cmd("SetForegroundColor", this.codeID[6][0], Recursive.CODE_HIGHLIGHT_COLOR);
		this.cmd("SetForegroundColor", this.codeID[6][1], Recursive.CODE_HIGHLIGHT_COLOR);
		var solution = subSolution + value[0];
		this.cmd("SetText", activationRec.fieldIDs[3], solution);
		this.cmd("Step");
		this.cmd("SetForegroundColor", this.codeID[6][0], Recursive.CODE_STANDARD_COLOR);
		this.cmd("SetForegroundColor", this.codeID[6][1], Recursive.CODE_STANDARD_COLOR);

		this.cmd("SetForegroundColor", this.codeID[7][0], Recursive.CODE_HIGHLIGHT_COLOR);
		this.cmd("SetForegroundColor", this.codeID[7][1], Recursive.CODE_HIGHLIGHT_COLOR);

		this.cmd("Step");
		this.deleteActivation(activationRec);
		this.currentY = oldY;
		this.currentX = oldX;
		this.cmd("CreateLabel", this.nextIndex, "Return Value = \"" + solution + "\"", oldX, oldY);
		this.cmd("SetForegroundColor", this.nextIndex, Recursive.CODE_HIGHLIGHT_COLOR);
		this.cmd("Step");
		this.cmd("SetForegroundColor", this.codeID[7][0], Recursive.CODE_STANDARD_COLOR);
		this.cmd("SetForegroundColor", this.codeID[7][1], Recursive.CODE_STANDARD_COLOR);
		this.cmd("Delete",this.nextIndex);
		
		
		
//		this.cmd("SetForegroundColor", this.codeID[4][3], Recursive.CODE_HIGHLIGHT_COLOR);
//		this.cmd("Step");

		return solution;
	}
	else
	{
		this.cmd("SetForegroundColor", this.codeID[2][0], Recursive.CODE_HIGHLIGHT_COLOR);
		this.cmd("Step");
		this.cmd("SetForegroundColor", this.codeID[2][0], Recursive.CODE_STANDARD_COLOR);
		
		
		this.currentY = oldY;
		this.currentX = oldX;
		this.deleteActivation(activationRec);
		this.cmd("CreateLabel", this.nextIndex, "Return Value = \"\"", oldX, oldY);
		this.cmd("SetForegroundColor", this.nextIndex, Recursive.CODE_HIGHLIGHT_COLOR);
		this.cmd("Step");
		this.cmd("Delete",this.nextIndex);
		
		return "";
	}
	
	
	
}
var currentAlg;

function init()
{
	var animManag = initCanvas();
	currentAlg = new Reverse(animManag, canvas.width, canvas.height);
}



