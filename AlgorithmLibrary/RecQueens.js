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



function Queens(am, w, h)
{
	this.init(am, w, h);
	
}

Queens.prototype = new Recursive();
Queens.prototype.constructor = Queens;
Queens.superclass = Recursive.prototype;

Queens.CALC_QUEENS_ACTIVATION_FIELDS = ["  size  ", "  board  "];
Queens.QUEENS_ACTIVATION_FIELDS = ["  board  ", "  current  ", "  size  ", "  i  ", "  done  "];
Queens.CHECK_ACTIVATION_FIELDS = ["  board  ", "  current  ", "  i  "];

Queens.CODE = [["def ","calcQueens(size)",":"],
				["     board = ", "[-1] * size"],
				[ "    return  ","queens(board, 0, size)"],
				["  "],
				["def ","queens(board, current, size)",":"],
				["     if ", "(current == size):"],
				["          return true"],
				["     else:"],
				["          for i in range(size):"],
				["               board[current] = i"],
				["               if (","noConflicts(board, current)",":"],
				["                    done"," = ", "queens(board, current + 1, size)"],
				["                    if (done):"],
				["                         return true"],
			    ["          return false"],
				[" "],
				["def ","noConflicts(board, current)",":"],
				["      for i in range(current):"],
				["         if ","(board[i] == board[current])",":"],
				["             return false"],
				["         if ","(current - i == abs(board[current] = board[i]))",":"],
				["             return false"],
			    ["      return true"]];
				

Queens.RECURSIVE_DELTA_Y_CALC_QUEEN = Queens.CALC_QUEENS_ACTIVATION_FIELDS.length * Recursive.ACTIVATION_RECORD_HEIGHT;
Queens.RECURSIVE_DELTA_Y_QUEEN = Queens.QUEENS_ACTIVATION_FIELDS.length * Recursive.ACTIVATION_RECORD_HEIGHT;
Queens.RECURSIVE_DELTA_Y_CHECK = Queens.CHECK_ACTIVATION_FIELDS.length * Recursive.ACTIVATION_RECORD_HEIGHT;


Queens.ACTIVATION_RECORT_START_X = 450;
Queens.ACTIVATION_RECORT_START_Y = 20;

Queens.INTERNAL_BOARD_START_X = 600;
Queens.INTERNAL_BOARD_START_Y = 100;
Queens.INTERNAL_BOARD_WIDTH = 20;
Queens.INTERNAL_BOARD_HEIGHT = 20;

Queens.LOGICAL_BOARD_START_X = Queens.INTERNAL_BOARD_START_X;
Queens.LOGICAL_BOARD_START_Y = Queens.INTERNAL_BOARD_START_Y + Queens.INTERNAL_BOARD_HEIGHT * 1.5;
Queens.LOGICAL_BOARD_WIDTH = Queens.INTERNAL_BOARD_WIDTH;
Queens.LOGICAL_BOARD_HEIGHT = Queens.INTERNAL_BOARD_HEIGHT;
Queens.ACTIVATION_RECORD_SPACING = 400;


Queens.INDEX_COLOR = "#0000FF";

Queens.prototype.init = function(am, w, h)
{
	Queens.superclass.init.call(this, am, w, h);
	this.nextIndex = 0;
	this.addControls();
	this.code = Queens.CODE;
	
	
	this.addCodeToCanvas(this.code);
		
	this.animationManager.StartNewAnimation(this.commands);
	this.animationManager.skipForward();
	this.animationManager.clearHistory();
	this.initialIndex = this.nextIndex;
	this.oldIDs = [];
	this.commands = [];
}


Queens.prototype.addControls =  function()
{
	this.controls = [];
	addLabelToAlgorithmBar("Board size:  (1-8)");

	this.sizeField = addControlToAlgorithmBar("Text", "");
	this.sizeField.onkeydown = this.returnSubmit(this.sizeField,  this.queensCallback.bind(this), 2, true);
	this.controls.push(this.sizeField);

	this.queensButton = addControlToAlgorithmBar("Button", "Queens");
	this.queensButton.onclick = this.queensCallback.bind(this);
	this.controls.push(this.queensButton);
		
}
	


		
Queens.prototype.queensCallback = function(event)
{
	var queensValue;
	
	if (this.sizeField.value != "")
	{
		var queenSize =  parseInt(this.sizeField.value);
		queenSize = Math.min(queenSize, 8);
		this.sizeField.value = String(queenSize);
		this.implementAction(this.doQueens.bind(this),queenSize);
	}
}




Queens.prototype.doQueens = function(size)
{
	this.commands = [];
	
	this.clearOldIDs();
	
	
	this.boardData = new Array(size);
	this.boardInternalID = new Array(size);
	this.boardLogicalID = new Array(size);
	this.boardInternalIndexID = new Array(size);
	
	
	this.currentY = Queens.ACTIVATION_RECORT_START_Y;
	this.currentX = Queens.ACTIVATION_RECORT_START_X;
	this.activationLeft = true;
	
	
	this.cmd("SetForegroundColor", this.codeID[0][1], Recursive.CODE_HIGHLIGHT_COLOR);
	var activationRec = this.createActivation("calcQueens", Queens.CALC_QUEENS_ACTIVATION_FIELDS, this.currentX, this.currentY, this.activationLeft);
	this.currentY += Queens.RECURSIVE_DELTA_Y_CALC_QUEEN;

	this.cmd("SetText", activationRec.fieldIDs[0], size);
	this.cmd("Step");
	this.cmd("SetForegroundColor", this.codeID[0][1], Recursive.CODE_STANDARD_COLOR);
	this.cmd("SetForegroundColor", this.codeID[1][0], Recursive.CODE_HIGHLIGHT_COLOR);
	this.cmd("SetForegroundColor", this.codeID[1][1], Recursive.CODE_HIGHLIGHT_COLOR);
	
	
	for (var i = 0; i < size; i++)
	{
		this.boardInternalID[i] = this.nextIndex++;
		this.oldIDs.push(this.boardInternalID[i])
		this.cmd("CreateRectangle", this.boardInternalID[i],
				 "-1",
				 Queens.INTERNAL_BOARD_WIDTH, 
				 Queens.INTERNAL_BOARD_HEIGHT, 
				 Queens.INTERNAL_BOARD_START_X  + i * Queens.INTERNAL_BOARD_WIDTH,
				 Queens.INTERNAL_BOARD_START_Y);

		this.boardInternalIndexID[i] = this.nextIndex++;
		this.oldIDs.push(this.boardInternalIndexID[i]);
		this.cmd("CreateLabel", this.boardInternalIndexID[i], i,Queens.INTERNAL_BOARD_START_X  + i * Queens.INTERNAL_BOARD_WIDTH,
				 Queens.INTERNAL_BOARD_START_Y - Queens.INTERNAL_BOARD_HEIGHT);
		this.cmd("SetForegroundColor", this.boardInternalIndexID[i], Queens.INDEX_COLOR);
		
		this.boardLogicalID[i] = new Array(size);
		for (var j = 0; j < size; j++)
		{
			this.boardLogicalID[i][j] = this.nextIndex++;
			this.oldIDs.push(this.boardLogicalID[i][j]);
			
			this.cmd("CreateRectangle", this.boardLogicalID[i][j],
					 "",
					 Queens.LOGICAL_BOARD_WIDTH, 
					 Queens.LOGICAL_BOARD_HEIGHT, 
					 Queens.LOGICAL_BOARD_START_X  + j * Queens.LOGICAL_BOARD_WIDTH,
					 Queens.LOGICAL_BOARD_START_Y  + i * Queens.LOGICAL_BOARD_HEIGHT);
			
			
		}
	}
	this.cmd("Connect", activationRec.fieldIDs[1], this.boardInternalID[0]);
	this.cmd("Step");
	
	this.cmd("SetForegroundColor", this.codeID[1][0], Recursive.CODE_STANDARD_COLOR);
	this.cmd("SetForegroundColor", this.codeID[1][1], Recursive.CODE_STANDARD_COLOR);
	this.cmd("SetForegroundColor", this.codeID[1][1], Recursive.CODE_STANDARD_COLOR);
	this.cmd("SetForegroundColor", this.codeID[2][1], Recursive.CODE_HIGHLIGHT_COLOR);
	this.cmd("Step");
	this.cmd("SetForegroundColor", this.codeID[2][1], Recursive.CODE_STANDARD_COLOR);
	
	
	
	
	board = new Array(size);
	this.queens(board, 0, size);
	this.cmd("Step");
	this.cmd("Delete", this.nextIndex);
	this.deleteActivation(activationRec);

	
	return this.commands;
}


Queens.prototype.queens = function(board, current, size)
{
	var oldX  = this.currentX;
	var oldY = this.currentY;
	var oldLeft = this.activationLeft;
	var activationRec = this.createActivation("queens", Queens.QUEENS_ACTIVATION_FIELDS, this.currentX, this.currentY, this.activationLeft);
	this.cmd("SetForegroundColor", this.codeID[4][1], Recursive.CODE_HIGHLIGHT_COLOR);
	
	this.cmd("SetText", activationRec.fieldIDs[1], current);
	this.cmd("SetText", activationRec.fieldIDs[2], size);
	if (this.activationLeft)
	{
		this.cmd("Connect", activationRec.fieldIDs[0], this.boardInternalID[0]);
	}
	else
	{		
		this.cmd("Connect", activationRec.fieldIDs[0], this.boardInternalID[size-1]);		
	}
	this.cmd("Step");
	this.cmd("SetForegroundColor", this.codeID[4][1], Recursive.CODE_STANDARD_COLOR);
	
	this.cmd("SetForegroundColor", this.codeID[5][1], Recursive.CODE_HIGHLIGHT_COLOR);
	this.cmd("Step");
	this.cmd("SetForegroundColor", this.codeID[5][1], Recursive.CODE_STANDARD_COLOR);
	
	
	this.currentY += Queens.RECURSIVE_DELTA_Y_QUEEN;
	if (this.currentY + Queens.RECURSIVE_DELTA_Y_QUEEN > this.canvasHeight)
	{
		this.currentY =  Queens.ACTIVATION_RECORT_START_Y;
		this.currentX += Queens.ACTIVATION_RECORD_SPACING;
		this.activationLeft = false;
	}
	
	if (current == size)
	{
		this.cmd("SetForegroundColor", this.codeID[6][0], Recursive.CODE_HIGHLIGHT_COLOR);
		this.cmd("Step");
		this.cmd("SetForegroundColor", this.codeID[6][0], Recursive.CODE_STANDARD_COLOR);
		
		this.deleteActivation(activationRec);
		this.currentX = oldX;
		this.currentY = oldY;
		this.activationLeft = oldLeft;
		this.cmd("CreateLabel", this.nextIndex, "Return Value = true", this.currentX, this.currentY);
		this.cmd("SetForegroundColor", this.nextIndex, Recursive.CODE_HIGHLIGHT_COLOR);

		return true;
	}
	
	var i;
	for (i = 0; i < size; i++)
	{
		this.cmd("SetTextColor", this.codeID[8][0], Recursive.CODE_HIGHLIGHT_COLOR);
		board[current] = i;
		this.cmd("SetText", activationRec.fieldIDs[3], i);
		this.cmd("Step");
		this.cmd("SetTextColor", this.codeID[8][0], Recursive.CODE_STANDARD_COLOR);
		this.cmd("SetTextColor", this.codeID[9][0], Recursive.CODE_HIGHLIGHT_COLOR);
		
		
		this.cmd("SetText", this.boardLogicalID[i][current], "Q");
		this.cmd("SetText", this.boardInternalID[current], i);
		this.cmd("Step");
		this.cmd("SetTextColor", this.codeID[9][0], Recursive.CODE_STANDARD_COLOR);
		this.cmd("SetTextColor", this.codeID[10][1], Recursive.CODE_HIGHLIGHT_COLOR);
		this.cmd("Step");
		this.cmd("SetTextColor", this.codeID[10][1], Recursive.CODE_STANDARD_COLOR);
		
		var moveLegal = this.legal(board,current);
		this.cmd("SetTextColor", this.codeID[10][0], Recursive.CODE_HIGHLIGHT_COLOR);
		this.cmd("SetTextColor", this.codeID[10][1], Recursive.CODE_HIGHLIGHT_COLOR);
		this.cmd("Step");
		this.cmd("Delete",this.nextIndex);
		this.cmd("SetTextColor", this.codeID[10][0], Recursive.CODE_STANDARD_COLOR);
		this.cmd("SetTextColor", this.codeID[10][1], Recursive.CODE_STANDARD_COLOR);

		
		
		
		if (moveLegal)
		{
			this.cmd("SetTextColor", this.codeID[11][2], Recursive.CODE_HIGHLIGHT_COLOR);
			this.cmd("Step");
			this.cmd("SetTextColor", this.codeID[11][2], Recursive.CODE_STANDARD_COLOR);
			var done = this.queens(board, current+1, size);
			this.cmd("SetTextColor", this.codeID[11][0], Recursive.CODE_HIGHLIGHT_COLOR);
			this.cmd("SetTextColor", this.codeID[11][1], Recursive.CODE_HIGHLIGHT_COLOR);
			this.cmd("SetTextColor", this.codeID[11][2], Recursive.CODE_HIGHLIGHT_COLOR);
			this.cmd("SetText", activationRec.fieldIDs[4], done);
			this.cmd("Step");
			this.cmd("Delete", this.nextIndex);
			this.cmd("SetTextColor", this.codeID[11][0], Recursive.CODE_STANDARD_COLOR);
			this.cmd("SetTextColor", this.codeID[11][1], Recursive.CODE_STANDARD_COLOR);
			this.cmd("SetTextColor", this.codeID[11][2], Recursive.CODE_STANDARD_COLOR);
			this.cmd("SetTextColor", this.codeID[12][0], Recursive.CODE_HIGHLIGHT_COLOR);
			this.cmd("Step");
			this.cmd("SetTextColor", this.codeID[12][0], Recursive.CODE_STANDARD_COLOR);
			
			if (done)
			{
				this.cmd("SetTextColor", this.codeID[13][0], Recursive.CODE_HIGHLIGHT_COLOR);
				this.cmd("Step");
				this.cmd("SetTextColor", this.codeID[13][0], Recursive.CODE_STANDARD_COLOR);
				
				this.deleteActivation(activationRec);
				this.currentX = oldX;
				this.currentY = oldY;
				this.activationLeft = oldLeft;
				this.cmd("CreateLabel", this.nextIndex, "Return Value = true", this.currentX, this.currentY);
				this.cmd("SetForegroundColor", this.nextIndex, Recursive.CODE_HIGHLIGHT_COLOR);

				return true;						
			}
		}
		this.cmd("SetText", this.boardLogicalID[i][current], "");
		
			
	}
	this.cmd("SetTextColor", this.codeID[14][0], Recursive.CODE_HIGHLIGHT_COLOR);
	this.cmd("Step");
	this.cmd("SetTextColor", this.codeID[14][0], Recursive.CODE_STANDARD_COLOR);
	this.deleteActivation(activationRec);
	this.currentX = oldX;
	this.currentY = oldY;
	this.activationLeft = oldLeft;
	this.cmd("CreateLabel", this.nextIndex, "Return Value = false", this.currentX, this.currentY);
	this.cmd("SetForegroundColor", this.nextIndex, Recursive.CODE_HIGHLIGHT_COLOR);

	return false;
}


Queens.prototype.legal = function(board, current)
{
	var activationRec = this.createActivation("noConflicts", Queens.CHECK_ACTIVATION_FIELDS, this.currentX, this.currentY, this.activationLeft);
	this.cmd("SetText", activationRec.fieldIDs[1], current);
	if (this.activationLeft)
	{
		this.cmd("Connect", activationRec.fieldIDs[0], this.boardInternalID[0]);
	}
	else
	{		
		this.cmd("Connect", activationRec.fieldIDs[0], this.boardInternalID[this.boardInternalID.length - 1]);		
	}
	this.cmd("SetForegroundColor", this.codeID[16][1], Recursive.CODE_HIGHLIGHT_COLOR);
	this.cmd("Step");
	this.cmd("SetForegroundColor", this.codeID[16][1], Recursive.CODE_STANDARD_COLOR);
	
	
	var i;
	var OK = true;
	if (current == 0)
	{
		this.cmd("SetForegroundColor", this.codeID[17][0], Recursive.CODE_HIGHLIGHT_COLOR);
		this.cmd("Step")
		this.cmd("SetForegroundColor", this.codeID[17][0], Recursive.CODE_STANDARD_COLOR);		
	}
	for (i = 0; i < current; i++)
	{
		this.cmd("SetText", activationRec.fieldIDs[2], i);
		this.cmd("SetTextColor", activationRec.fieldIDs[2], Recursive.CODE_HIGHLIGHT_COLOR)
		this.cmd("SetForegroundColor", this.codeID[17][0], Recursive.CODE_HIGHLIGHT_COLOR);
		this.cmd("Step")
		this.cmd("SetForegroundColor", this.codeID[17][0], Recursive.CODE_STANDARD_COLOR);
		this.cmd("SetTextColor", activationRec.fieldIDs[2], Recursive.CODE_STANDARD_COLOR)
		this.cmd("SetForegroundColor", this.codeID[18][1], Recursive.CODE_HIGHLIGHT_COLOR);
		this.cmd("SetTextColor", this.boardLogicalID[board[current]][current], Recursive.CODE_HIGHLIGHT_COLOR);
		this.cmd("SetTextColor", this.boardLogicalID[board[i]][i], Recursive.CODE_HIGHLIGHT_COLOR);
		this.cmd("Step");
		this.cmd("SetTextColor", this.boardLogicalID[board[current]][current], Recursive.CODE_STANDARD_COLOR);
		this.cmd("SetTextColor", this.boardLogicalID[board[i]][i], Recursive.CODE_STANDARD_COLOR);
		this.cmd("SetForegroundColor", this.codeID[18][1], Recursive.CODE_STANDARD_COLOR);

		if (board[i] == board[current])
		{
			this.cmd("SetForegroundColor", this.codeID[19][0], Recursive.CODE_HIGHLIGHT_COLOR);
			this.cmd("Step");
			this.cmd("SetForegroundColor", this.codeID[19][0], Recursive.CODE_STANDARD_COLOR);
			OK = false;
			break;
		}
		this.cmd("SetTextColor", this.boardLogicalID[board[current]][current], Recursive.CODE_HIGHLIGHT_COLOR);
		this.cmd("SetTextColor", this.boardLogicalID[board[i]][i], Recursive.CODE_HIGHLIGHT_COLOR);

		this.cmd("SetForegroundColor", this.codeID[20][1], Recursive.CODE_HIGHLIGHT_COLOR);
		this.cmd("Step");
		this.cmd("SetTextColor", this.boardLogicalID[board[current]][current], Recursive.CODE_STANDARD_COLOR);
		this.cmd("SetTextColor", this.boardLogicalID[board[i]][i], Recursive.CODE_STANDARD_COLOR);
		this.cmd("SetForegroundColor", this.codeID[20][1], Recursive.CODE_STANDARD_COLOR);
		
		if (current - i == Math.abs(board[current] - board[i]))
		{
			this.cmd("SetForegroundColor", this.codeID[21][0], Recursive.CODE_HIGHLIGHT_COLOR);
			this.cmd("Step");
			this.cmd("SetForegroundColor", this.codeID[21][0], Recursive.CODE_STANDARD_COLOR);
			
			OK = false;
			break;
		}
		
	}
	if (OK)
	{
		this.cmd("SetForegroundColor", this.codeID[22][0], Recursive.CODE_HIGHLIGHT_COLOR);
		this.cmd("Step");
		this.cmd("SetForegroundColor", this.codeID[22][0], Recursive.CODE_STANDARD_COLOR);
	}
	this.cmd("CreateLabel", this.nextIndex, "Return Value = " + String(OK), this.currentX, this.currentY);
	this.cmd("SetForegroundColor", this.nextIndex, Recursive.CODE_HIGHLIGHT_COLOR);
	this.deleteActivation(activationRec);
	
	return OK;
}

var currentAlg;

function init()
{
	var animManag = initCanvas();
	currentAlg = new Queens(animManag, canvas.width, canvas.height);
}



