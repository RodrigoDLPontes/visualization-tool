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



function DPChange(am, w, h)
{
	this.init(am, w, h);
	
}

DPChange.prototype = new Algorithm();
DPChange.prototype.constructor = DPChange;
DPChange.superclass = Algorithm.prototype;

DPChange.TABLE_ELEM_WIDTH = 30;
DPChange.TABLE_ELEM_HEIGHT = 30;

DPChange.TABLE_START_X = 500;
DPChange.TABLE_START_Y = 50;
DPChange.TABLE_DIFF_X = 70;

DPChange.CODE_START_X = 10;
DPChange.CODE_START_Y = 10;
DPChange.CODE_LINE_HEIGHT = 14;


DPChange.GREEDY_START_X = 100;
DPChange.GREEDY_START_Y = 150;
DPChange.RECURSIVE_START_X = 220;
DPChange.RECURSIVE_START_Y = 10;
DPChange.RECURSIVE_DELTA_Y = 14;
DPChange.RECURSIVE_DELTA_X = 8;
DPChange.CODE_HIGHLIGHT_COLOR = "#FF0000";
DPChange.CODE_STANDARD_COLOR = "#000000";

DPChange.TABLE_INDEX_COLOR = "#0000FF"
DPChange.CODE_RECURSIVE_1_COLOR = "#339933";
DPChange.CODE_RECURSIVE_2_COLOR = "#0099FF";

DPChange.DPCode = [["def ","change(n, coinArray)",":"], 
				 ["     if ","(n == 0) "],
				 ["          return 0"],
				 ["     best = -1"],
				 ["     for coin in coinArray:"],
				 ["         if ","(coin <= n)",":"],
				 ["             nextTry = ","change(n - coin, coinArray)"],
				 ["         if (", "best < 0",  " or ",  "best > nextTry + 1", ")"],
				 ["             best = nextTry + 1"],
				 ["     return best"]];


DPChange.GREEDYCode = [["def ","changeGreedy(n, coinArray)",":"],
					   ["    coinsRequired = 0"],
					   ["    for coin in reversed(coinArray): "],
					   ["       while ", "(n <= coin)"],
					   ["          n = n - coin"],
					   ["          coinsRequired = coinsRequired + 1"],
					   ["    return coinsRequired"]];


DPChange.COINS = [[1, 5, 10, 25],
				  [1, 4, 6, 10]];


DPChange.MAX_VALUE = 30;

DPChange.MESSAGE_ID = 0;


DPChange.prototype.setCode = function(codeArray)
{
	this.code = codeArray;
	this.codeID = Array(this.code.length);
	var i, j;
	for (i = 0; i < this.code.length; i++)
	{
		this.codeID[i] = new Array(this.code[i].length);
		for (j = 0; j < this.code[i].length; j++)
		{
			this.codeID[i][j] = this.nextIndex++;
			this.cmd("CreateLabel", this.codeID[i][j], this.code[i][j], DPChange.CODE_START_X, DPChange.CODE_START_Y + i * DPChange.CODE_LINE_HEIGHT, 0);
			this.cmd("SetForegroundColor", this.codeID[i][j], DPChange.CODE_STANDARD_COLOR);
			if (j > 0)
			{
				this.cmd("AlignRight", this.codeID[i][j], this.codeID[i][j-1]);
			}
		}
	}	
}


DPChange.prototype.deleteCode = function()
{
	var i,j
	for (i = 0; i < this.codeID.length; i++)
	{
		for (j = 0; j < this.codeID[i].length; j++)
		{
			this.cmd("Delete", this.codeID[i][j]);			
		}
	}
	this.codeID = [];
}

DPChange.prototype.setCodeAlpha = function(codeArray, alpha)
{
	var i, j
	for (i = 0; i < codeArray.length; i++)
	{
		var foo = 3;
		foo = codeArray[i];
		for (j = 0; j < codeArray[i].length; j++)
		{
			this.cmd("SetAlpha", codeArray[i][j], alpha);			
		}
	}
}



DPChange.prototype.init = function(am, w, h)
{
	DPChange.superclass.init.call(this, am, w, h);
	this.nextIndex = 0;
	this.addControls();
	// HACK!!
	this.setCode(DPChange.GREEDYCode);
	this.greedyCodeID = this.codeID;
	this.setCodeAlpha(this.greedyCodeID, 0);
	///
	this.setCode(DPChange.DPCode);
	this.usingDPCode = true;
	
		
	this.animationManager.StartNewAnimation(this.commands);
	this.animationManager.skipForward();
	this.animationManager.clearHistory();
	this.initialIndex = this.nextIndex;
	this.oldIDs = [];
	this.commands = [];
}


DPChange.prototype.addControls =  function()
{
	this.controls = [];
	this.fibField = addControlToAlgorithmBar("Text", "");
	this.fibField.onkeydown = this.returnSubmit(this.fibField,  this.emptyCallback.bind(this), 2, true);
	this.controls.push(this.fibField);

	this.recursiveButton = addControlToAlgorithmBar("Button", "Change Recursive");
	this.recursiveButton.onclick = this.recursiveCallback.bind(this);
	this.controls.push(this.recursiveButton);

	this.tableButton = addControlToAlgorithmBar("Button", "Change Table");
	this.tableButton.onclick = this.tableCallback.bind(this);
	this.controls.push(this.tableButton);

	this.memoizedButton = addControlToAlgorithmBar("Button", "Change Memoized");
	this.memoizedButton.onclick = this.memoizedCallback.bind(this);
	this.controls.push(this.memoizedButton);

	
	this.greedyButton = addControlToAlgorithmBar("Button", "Change Greedy");
	this.greedyButton.onclick = this.greedyCallback.bind(this);
	this.controls.push(this.greedyButton);
	
	
	
	
	var coinLabels = [];
	var i, j;
	for (i = 0; i < DPChange.COINS.length; i++)
	{
		var nextLabel = "Coins: [" + DPChange.COINS[i][0];
		for (j = 1; j < DPChange.COINS[i].length; j++)
		{
			nextLabel = nextLabel + ", " + DPChange.COINS[i][j];
		}
		nextLabel = nextLabel + "]";
		coinLabels.push(nextLabel);
	}
	
	this.coinTypeButtons = addRadioButtonGroupToAlgorithmBar(coinLabels, "CoinType");
		
	for (i = 0; i < this.coinTypeButtons.length; i++)
	{
		this.coinTypeButtons[i].onclick = this.coinTypeChangedCallback.bind(this, i);
		this.controls.push(this.coinTypeButtons[i]);
	}
	
	this.coinTypeButtons[0].checked = true;	
	this.coinIndex = 0;
}
	


DPChange.prototype.coinTypeChangedCallback = function(coinIndex)
{
	this.implementAction(this.coinTypeChanged.bind(this), coinIndex);
}


DPChange.prototype.coinTypeChanged = function(coinIndex)
{
	this.commands = [];
	this.coinIndex = coinIndex;
	this.coinTypeButtons[coinIndex].checked = true;
	this.clearOldIDs();

	return this.commands;
}





DPChange.prototype.greedyCallback = function(value)
{
	
	if (this.fibField.value != "")
	{
		this.implementAction(this.implementGreedy.bind(this),parseInt(this.fibField.value));
	}
	else
	{
		this.implementAction(this.helpMessage.bind(this), "");	
	}
}


DPChange.prototype.implementGreedy = function(value)
{
	this.commands = [];
	this.clearOldIDs();
	var initialValue = value;
	if (this.usingDPCode)
	{
		this.setCodeAlpha(this.greedyCodeID, 1);
		this.setCodeAlpha(this.codeID, 0);
		this.usingDPCode = false;
	}
	
	var currX = DPChange.GREEDY_START_X;
	var currY = DPChange.GREEDY_START_Y + 2.5 * DPChange.TABLE_ELEM_HEIGHT;
	
	var messageID = this.nextIndex++;
	this.oldIDs.push(messageID);
	
	var valueRemainingID = this.nextIndex++;
	this.oldIDs.push(valueRemainingID);
	
	this.cmd("CreateRectangle", valueRemainingID, value,  DPChange.TABLE_ELEM_WIDTH,
			 DPChange.TABLE_ELEM_HEIGHT,
			  DPChange.GREEDY_START_X, DPChange.GREEDY_START_Y);
	
	var tempLabel = this.nextIndex++;
	this.oldIDs.push(tempLabel);
	this.cmd("CreateLabel", tempLabel, "Amount remaining:",0, 0);
	this.cmd("AlignLeft", tempLabel, valueRemainingID);
	
	var requiredCoinsID = this.nextIndex++;
	this.oldIDs.push(requiredCoinsID);
	
	this.cmd("CreateRectangle", requiredCoinsID, value,  DPChange.TABLE_ELEM_WIDTH,
			 DPChange.TABLE_ELEM_HEIGHT,
			 DPChange.GREEDY_START_X, DPChange.GREEDY_START_Y + DPChange.TABLE_ELEM_HEIGHT);
	
	tempLabel = this.nextIndex++;
	this.oldIDs.push(tempLabel);
	this.cmd("CreateLabel", tempLabel, "Required Coins:",0, 0);
	this.cmd("AlignLeft", tempLabel, requiredCoinsID);
	
	
	var requiredCoins = 0;
	var i;
	for (i = DPChange.COINS[this.coinIndex].length - 1; i >=0; i--)
	{
		while (value >= DPChange.COINS[this.coinIndex][i])
		{
			requiredCoins = requiredCoins + 1;
			value = value - DPChange.COINS[this.coinIndex][i];
			this.cmd("SetText", valueRemainingID, value);
			this.cmd("SetText", requiredCoinsID, requiredCoins);
			var moveIndex = this.nextIndex++;
			this.oldIDs.push(moveIndex);
			this.cmd("CreateLabel", moveIndex, DPChange.COINS[this.coinIndex][i], DPChange.GREEDY_START_X, DPChange.GREEDY_START_Y);
			this.cmd("Move", moveIndex, currX, currY);
			currX += DPChange.TABLE_ELEM_WIDTH;
			this.cmd("Step");
		}
		
	}
	
	this.cmd("CreateLabel", messageID,
			 "changeGreedy(" + String(initialValue)+ ", [" +String(DPChange.COINS[this.coinIndex]) +"])	= " + String(requiredCoins),
			 DPChange.RECURSIVE_START_X, DPChange.RECURSIVE_START_Y, 0);
	
	return this.commands;
}




DPChange.prototype.buildTable  = function(maxVal)
{
	
	this.tableID = new Array(2);
	this.tableVals = new Array(2);
	this.tableXPos = new Array(2);
	this.tableYPos = new Array(2);
	var i;
	for (i = 0; i < 2; i++)
	{
		this.tableID[i] = new Array(maxVal + 1);		
		this.tableVals[i] = new Array(maxVal + 1);
		this.tableXPos[i] = new Array(maxVal + 1);
		this.tableYPos[i] = new Array(maxVal + 1);
	}
	
	var j;
	var indexID;
	var xPos;
	var yPos;
	var	table_rows = Math.floor((this.canvasHeight - DPChange.TABLE_ELEM_HEIGHT - DPChange.TABLE_START_Y) / DPChange.TABLE_ELEM_HEIGHT);
	var table_cols = Math.ceil((maxVal + 1) / table_rows);
	
	var header1ID = this.nextIndex++;
	this.oldIDs.push(header1ID);
	
	this.cmd("CreateLabel", header1ID, "# of Coins Required", DPChange.TABLE_START_X, DPChange.TABLE_START_Y - 30);

	
	var header2ID = this.nextIndex++;
	this.oldIDs.push(header2ID);
	
	this.cmd("CreateLabel", header2ID, "Coins to Use", DPChange.TABLE_START_X + table_cols*DPChange.TABLE_DIFF_X + 1.5*DPChange.TABLE_DIFF_X, DPChange.TABLE_START_Y - 30);
	
	
	
	for (i = 0; i <= maxVal; i++)
	{
		yPos = i % table_rows *  DPChange.TABLE_ELEM_HEIGHT + DPChange.TABLE_START_Y;
		xPos = Math.floor(i / table_rows) * DPChange.TABLE_DIFF_X + DPChange.TABLE_START_X;

		for (j = 0; j < 2; j++)
		{
		
			this.tableID[j][i] = this.nextIndex++;
			this.tableVals[j][i] = -1;
			this.oldIDs.push(this.tableID[j][i]);
			
			
			this.tableXPos[j][i] = xPos;
			this.tableYPos[j][i] = yPos;
			
			this.cmd("CreateRectangle", this.tableID[j][i], 
					 "", 
					 DPChange.TABLE_ELEM_WIDTH,
					 DPChange.TABLE_ELEM_HEIGHT,
					 xPos,
					 yPos);
			indexID = this.nextIndex++;
			this.oldIDs.push(indexID);
			this.cmd("CreateLabel", indexID, i, xPos - DPChange.TABLE_ELEM_WIDTH,  yPos);
			this.cmd("SetForegroundColor", indexID, DPChange.TABLE_INDEX_COLOR);
			
			xPos = xPos + table_cols * DPChange.TABLE_DIFF_X + 1.5*DPChange.TABLE_DIFF_X;
		}
		
		
		
	}	
}

DPChange.prototype.clearOldIDs = function()
{
	for (var i = 0; i < this.oldIDs.length; i++)
	{
		this.cmd("Delete", this.oldIDs[i]);
	}
	this.oldIDs =[];
	this.nextIndex = this.initialIndex;
	
}


DPChange.prototype.reset = function()
{
	this.oldIDs =[];
	this.coinIndex = 0;
	this.usingDPCode = true;
	this.coinTypeButtons[0].checked = true;
	this.nextIndex = this.initialIndex;	
}



DPChange.prototype.emptyCallback = function(event)
{
	this.implementAction(this.helpMessage.bind(this), "");
	// TODO:  Put up a message to push the appropriate button?

}

DPChange.prototype.displayCoinsUsed = function()
{
	var currValue = this.tableVals[1].length - 1;
	var currX = 30;
	var currY = 200;
	
	var moveID;
	moveID = this.nextIndex++;
	
	while (currValue > 0)
	{
		moveID = this.nextIndex++;
		this.oldIDs.push(moveID);
		this.cmd("CreateLabel", moveID, this.tableVals[1][currValue], this.tableXPos[1][currValue], this.tableYPos[1][currValue]);
		this.cmd("Move", moveID, currX, currY);
		this.cmd("Step");
		currX += 20;
		currValue = currValue - this.tableVals[1][currValue];
	}
}
		
DPChange.prototype.recursiveCallback = function(event)
{
	var fibValue;
	
	if (this.fibField.value != "")
	{
		var fibValue = Math.min(parseInt(this.fibField.value), DPChange.MAX_VALUE - 5);
		this.fibField.value = String(fibValue);
		this.implementAction(this.recursiveChange.bind(this),fibValue);
	}
	else
	{
		this.implementAction(this.helpMessage.bind(this), "");	
	}
}


DPChange.prototype.tableCallback = function(event)
{
	var fibValue;
	
	if (this.fibField.value != "")
	{
		var fibValue = Math.min(parseInt(this.fibField.value), DPChange.MAX_VALUE);
		this.fibField.value = String(fibValue);
		this.implementAction(this.tableChange.bind(this),fibValue);
	}
	else
	{
		this.implementAction(this.helpMessage.bind(this), "");	
	}
		
}


DPChange.prototype.memoizedCallback = function(event)
{
	var fibValue;
	
	if (this.fibField.value != "")
	{
		var changeVal = Math.min(parseInt(this.fibField.value), DPChange.MAX_VALUE);
		this.fibField.value = String(changeVal);
		this.implementAction(this.memoizedChange.bind(this),changeVal);
	}
	else
	{
		this.implementAction(this.helpMessage.bind(this), "");	
	}
}

DPChange.prototype.helpMessage = function(value)
{
	this.commands = [];
	
	this.clearOldIDs();
	
	var messageID = this.nextIndex++;
	this.oldIDs.push(messageID);
	this.cmd("CreateLabel", messageID,
			 "Enter a value between 0 and " + String(DPChange.MAX_VALUE) + " in the text field.\n" +
			 "Then press the Change Recursive, Change Table, Change Memoized, or Change Greedy button",
			 DPChange.RECURSIVE_START_X, DPChange.RECURSIVE_START_Y, 0);
	return this.commands;
	
	
}


DPChange.prototype.recursiveChange = function(value)
{
	this.commands = [];
	
	this.clearOldIDs();
	if (!this.usingDPCode)
	{
		this.setCodeAlpha(this.greedyCodeID, 0);
		this.setCodeAlpha(this.codeID, 1);
		this.usingDPCode = true;
	}
	
	this.currentY = DPChange.RECURSIVE_START_Y;
	
	var functionCallID = this.nextIndex++;
	this.oldIDs.push(functionCallID);
	var final = this.change(value, DPChange.RECURSIVE_START_X, functionCallID);
	this.cmd("SetText", functionCallID,  "change(" + String(value)+ ", [" +String(DPChange.COINS[this.coinIndex]) +"])	= " + String(final[0]));
	return this.commands;
}


DPChange.prototype.change = function(value, xPos, ID)
{
	var coins = DPChange.COINS[this.coinIndex];
	this.cmd("CreateLabel", ID, "change(" + String(value)+ ", [" +String(coins) +"])", xPos, this.currentY, 0);
	this.currentY += DPChange.RECURSIVE_DELTA_Y;
	this.cmd("SetForegroundColor", this.codeID[0][1], DPChange.CODE_HIGHLIGHT_COLOR);
	this.cmd("Step");	
	this.cmd("SetForegroundColor", this.codeID[0][1], DPChange.CODE_STANDARD_COLOR);
	this.cmd("SetForegroundColor", this.codeID[1][1], DPChange.CODE_HIGHLIGHT_COLOR);
	this.cmd("Step");
	this.cmd("SetForegroundColor", this.codeID[1][1], DPChange.CODE_STANDARD_COLOR);
	// return 1;
	if (value > 0)
	{
		this.cmd("SetForegroundColor", this.codeID[3][0], DPChange.CODE_HIGHLIGHT_COLOR);
		this.cmd("Step");
		this.cmd("SetForegroundColor", this.codeID[3][0], DPChange.CODE_STANDARD_COLOR);
		this.cmd("SetForegroundColor", this.codeID[4][0], DPChange.CODE_HIGHLIGHT_COLOR);
		this.cmd("Step");
		this.cmd("SetForegroundColor", this.codeID[4][0], DPChange.CODE_STANDARD_COLOR);

		var i;
		var best = -1;
		var nextID  = this.nextIndex++;
		var nextID2 = this.nextIndex++;
		var recID = nextID;
		var bestList;
		for (i = 0; i < coins.length; i++)
		{
			this.cmd("SetForegroundColor", this.codeID[5][1], DPChange.CODE_HIGHLIGHT_COLOR);
			this.cmd("Step");
			this.cmd("SetForegroundColor", this.codeID[5][1], DPChange.CODE_STANDARD_COLOR);
			if (value >= coins[i])
			{
				this.cmd("SetForegroundColor", this.codeID[6][1], DPChange.CODE_HIGHLIGHT_COLOR);
				this.cmd("Step");
				this.cmd("SetForegroundColor", this.codeID[6][1], DPChange.CODE_STANDARD_COLOR);
				var nextTry  = this.change(value - coins[i], xPos + DPChange.RECURSIVE_DELTA_X, recID);
				// TODO:  SOMEHTING ELSE HERE
				if (best == -1)
				{
					this.cmd("SetForegroundColor", this.codeID[7][1], DPChange.CODE_HIGHLIGHT_COLOR);
					this.cmd("Step");
					this.cmd("SetForegroundColor", this.codeID[7][1], DPChange.CODE_STANDARD_COLOR);
					best = nextTry[0] + 1;
					bestList = nextTry[1];
					bestList.push(coins[i]);
					this.currentY += DPChange.RECURSIVE_DELTA_Y;
					recID = nextID2;
				}
				else if (best > nextTry[0] + 1)
				{
					this.cmd("SetForegroundColor", this.codeID[7][2], DPChange.CODE_HIGHLIGHT_COLOR);
					this.cmd("Step");
					this.cmd("SetForegroundColor", this.codeID[7][2], DPChange.CODE_STANDARD_COLOR);
					best = nextTry[0] + 1;
					bestList = nextTry[1];
					bestList.push(coins[i]);;
					this.cmd("Delete", recID);
					this.cmd("SetText", nextID, String(best) + "       ([" + String(bestList) + "])");
					this.cmd("SetPosition", nextID, xPos + DPChange.RECURSIVE_DELTA_X, this.currentY);					
					this.cmd("Move", nextID, xPos + DPChange.RECURSIVE_DELTA_X, this.currentY - DPChange.RECURSIVE_DELTA_Y);
					this.cmd("Step");
				}
				else
				{
					this.cmd("Delete", recID);
				}
			}
			else
			{
				break;
			}
		}
		this.cmd("Delete", nextID);
		this.cmd("SetText", ID, String(best) + "       ([" + String(bestList) + "])");
		this.cmd("SetPosition", ID, xPos + DPChange.RECURSIVE_DELTA_X, this.currentY);				
		this.cmd("Move", ID, xPos, this.currentY - 2 * DPChange.RECURSIVE_DELTA_Y);
				
		
		this.currentY  = this.currentY -  2 * DPChange.RECURSIVE_DELTA_Y;
	
		this.cmd("SetForegroundColor", this.codeID[9][0], DPChange.CODE_HIGHLIGHT_COLOR);
		this.cmd("Step");
		this.cmd("SetForegroundColor", this.codeID[9][0], DPChange.CODE_STANDARD_COLOR);
		this.cmd("Step");
		return [best, bestList];
	}
	else
	{
		this.cmd("SetText", ID, "0");
		this.cmd("SetForegroundColor", this.codeID[2][0], DPChange.CODE_HIGHLIGHT_COLOR);
		this.cmd("Step");
		this.cmd("SetForegroundColor", this.codeID[2][0], DPChange.CODE_STANDARD_COLOR);
		
		this.currentY -=  DPChange.RECURSIVE_DELTA_Y;
		return [0, []];
	}
	
	
	
}




DPChange.prototype.tableChange = function(value)
{
	this.commands = [];
	this.clearOldIDs();
	if (!this.usingDPCode)
	{
		this.setCodeAlpha(this.greedyCodeID, 0);
		this.setCodeAlpha(this.codeID, 1);
		this.usingDPCode = true;
	}
	
	this.buildTable(value);
	coins = DPChange.COINS[this.coinIndex];
	var i;
	for (i = 0; i <= value && i <= 0; i++)
	{
		this.cmd("SetForegroundColor", this.codeID[1][1], DPChange.CODE_HIGHLIGHT_COLOR);
		this.cmd("SetForegroundColor", this.codeID[2][0], DPChange.CODE_HIGHLIGHT_COLOR);
		this.cmd("SetHighlight", this.tableID[0][i], 1);
		this.cmd("SetText", this.tableID[0][i], 0);
		this.tableVals[0][i] = 0;
		this.cmd("Step");
		this.cmd("SetForegroundColor", this.codeID[1][1], DPChange.CODE_STANDARD_COLOR);
		this.cmd("SetForegroundColor", this.codeID[2][0], DPChange.CODE_STANDARD_COLOR);
		this.cmd("SetHighlight", this.tableID[0][i], 0);		
	}
	for (i = 1; i <= value; i++)
	{
		this.tableVals[0][i] = -1;
		var j;
		for (j = 0; j < coins.length; j++)
		{
			if (coins[j] <= i)
			{
				this.cmd("SetHighlight", this.tableID[0][i-coins[j]], 1);
				this.cmd("SetHighlight", this.tableID[0][i], 1);
				this.cmd("Step");
				if (this.tableVals[0][i] == -1 || this.tableVals[0][i] > this.tableVals[0][i - coins[j]] + 1)
				{
					this.tableVals[0][i] = this.tableVals[0][i- coins[j]] + 1;
					this.cmd("SetText", this.tableID[0][i], this.tableVals[0][i]);
					this.cmd("SetHighlight", this.tableID[1][i], 1);
					this.cmd("SetText", this.tableID[1][i], coins[j]);
					this.tableVals[1][i] = coins[j];
					this.cmd("Step")
					this.cmd("SetHighlight", this.tableID[1][i], 0);
				}
				this.cmd("SetHighlight", this.tableID[0][i-coins[j]], 0);
				this.cmd("SetHighlight", this.tableID[0][i], 0);
			}
		}
	}
	
	var finalID = this.nextIndex++;
	this.oldIDs.push(finalID);
	this.cmd("CreateLabel", finalID, this.tableVals[0][value], this.tableXPos[0][value] - 5, this.tableYPos[0][value] - 5, 0);
	this.cmd("Move", finalID, DPChange.RECURSIVE_START_X, DPChange.RECURSIVE_START_Y);
	this.cmd("Step");
	this.cmd("SetText", finalID, "change(" + String(value) + ") = " + String(this.tableVals[0][value]));
								
	this.displayCoinsUsed();
	
	return this.commands;
	
	
}



DPChange.prototype.fibMem = function(value, xPos, ID)
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
	this.currentY += DPChange.RECURSIVE_DELTA_Y;
	this.cmd("SetForegroundColor", this.codeID[0][1], DPChange.CODE_HIGHLIGHT_COLOR);
	this.cmd("Step");
	this.cmd("SetForegroundColor", this.codeID[0][1], DPChange.CODE_STANDARD_COLOR);
	this.cmd("SetForegroundColor", this.codeID[1][1], DPChange.CODE_HIGHLIGHT_COLOR);
	this.cmd("Step");
	this.cmd("SetForegroundColor", this.codeID[1][1], DPChange.CODE_STANDARD_COLOR);
	if (value > 1)
	{
		var firstID = this.nextIndex++;
		var secondID = this.nextIndex++;
		this.cmd("SetForegroundColor", this.codeID[4][1], DPChange.CODE_HIGHLIGHT_COLOR);
		this.cmd("Step");
		this.cmd("SetForegroundColor", this.codeID[4][1], DPChange.CODE_STANDARD_COLOR);
		var firstValue = this.fibMem(value-1, xPos + DPChange.RECURSIVE_DELTA_X, firstID);
		this.currentY += DPChange.RECURSIVE_DELTA_Y;
		this.cmd("SetForegroundColor", this.codeID[4][3], DPChange.CODE_HIGHLIGHT_COLOR);
		this.cmd("Step");
		this.cmd("SetForegroundColor", this.codeID[4][3], DPChange.CODE_STANDARD_COLOR);
		var secondValue = this.fibMem(value-2, xPos + DPChange.RECURSIVE_DELTA_X, secondID);
		
		
		this.cmd("SetForegroundColor", this.codeID[4][1], DPChange.CODE_RECURSIVE_1_COLOR);
		this.cmd("SetForegroundColor", firstID, DPChange.CODE_RECURSIVE_1_COLOR);
		this.cmd("SetForegroundColor", this.codeID[4][2], DPChange.CODE_HIGHLIGHT_COLOR);
		this.cmd("SetForegroundColor", this.codeID[4][3], DPChange.CODE_RECURSIVE_2_COLOR);
		this.cmd("SetForegroundColor", secondID, DPChange.CODE_RECURSIVE_2_COLOR);
		this.cmd("Step");
		this.cmd("SetForegroundColor", this.codeID[4][1], DPChange.CODE_STANDARD_COLOR);
		this.cmd("SetForegroundColor", this.codeID[4][2], DPChange.CODE_STANDARD_COLOR);
		this.cmd("SetForegroundColor", this.codeID[4][3], DPChange.CODE_STANDARD_COLOR);
		
		
		
		this.cmd("Delete", firstID);
		this.cmd("Delete", secondID);
		this.cmd("SetText", ID, firstValue + secondValue);
		this.cmd("Step");
		this.tableVals[value] = firstValue + secondValue;
		this.currentY  = this.currentY - 2 * DPChange.RECURSIVE_DELTA_Y;
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
		this.cmd("SetForegroundColor", this.codeID[2][0], DPChange.CODE_HIGHLIGHT_COLOR);
		this.cmd("Step");
		this.cmd("SetForegroundColor", this.codeID[2][0], DPChange.CODE_STANDARD_COLOR);
		this.tableVals[value] = 1;
		this.cmd("CreateLabel", this.nextIndex, this.tableVals[value], xPos + 5, this.currentY + 5);
		this.cmd("Move", this.nextIndex, this.tableXPos[value], this.tableYPos[value], this.currentY);
		this.cmd("Step");
		this.cmd("Delete", this.nextIndex);
		this.cmd("SetText", this.tableID[value], this.tableVals[value]);
		
		this.currentY -= DPChange.RECURSIVE_DELTA_Y;
		return 1;
	}
	
}

DPChange.prototype.memoizedChange = function(value)
{
	this.commands = [];

	if (!this.usingDPCode)
	{
		this.setCodeAlpha(this.greedyCodeID, 0);
		this.setCodeAlpha(this.codeID, 1);
		this.usingDPCode = true;
	}
		
	
	this.clearOldIDs();
	this.buildTable(value);

	this.currentY = DPChange.RECURSIVE_START_Y;
	
	var functionCallID = this.nextIndex++;
	this.oldIDs.push(functionCallID);
	var final = this.changeMem(value, DPChange.RECURSIVE_START_X, functionCallID);
	this.cmd("SetText", functionCallID,  "change(" + String(value)+ ", [" +String(DPChange.COINS[this.coinIndex]) +"])	= " + String(final[0]));
	return this.commands;
	
	this.currentY = DPChange.RECURSIVE_START_Y;
	
	return this.commands;
}



DPChange.prototype.changeMem = function(value, xPos, ID)
{
	var coins = DPChange.COINS[this.coinIndex];
	this.cmd("CreateLabel", ID, "change(" + String(value)+ ", [" +String(coins) +"])", xPos, this.currentY, 0);
	this.cmd("SetForegroundColor", this.codeID[0][1], DPChange.CODE_HIGHLIGHT_COLOR);
	this.cmd("SetHighlight", this.tableID[0][value], 1);
	this.cmd("Step");	
	if (this.tableVals[0][value] >= 0)
	{
		this.cmd("Delete", ID);
		this.cmd("CreateLabel", ID, this.tableVals[0][value], this.tableXPos[0][value] - 5, this.tableYPos[0][value] - 5, 0);
		this.cmd("Move", ID, xPos, this.currentY);
		this.cmd("Step")
		this.cmd("SetHighlight", this.tableID[0][value], 0);
		this.cmd("SetForegroundColor", this.codeID[0][1], DPChange.CODE_STANDARD_COLOR);
		return [this.tableVals[0][value], []];
	}
	this.cmd("SetHighlight", this.tableID[0][value], 0);
	this.currentY += DPChange.RECURSIVE_DELTA_Y;
	
	
	
	this.cmd("SetForegroundColor", this.codeID[0][1], DPChange.CODE_STANDARD_COLOR);
	this.cmd("SetForegroundColor", this.codeID[1][1], DPChange.CODE_HIGHLIGHT_COLOR);
	this.cmd("Step");
	this.cmd("SetForegroundColor", this.codeID[1][1], DPChange.CODE_STANDARD_COLOR);
	// return 1;
	if (value > 0)
	{
		this.cmd("SetForegroundColor", this.codeID[3][0], DPChange.CODE_HIGHLIGHT_COLOR);
		this.cmd("Step");
		this.cmd("SetForegroundColor", this.codeID[3][0], DPChange.CODE_STANDARD_COLOR);
		this.cmd("SetForegroundColor", this.codeID[4][0], DPChange.CODE_HIGHLIGHT_COLOR);
		this.cmd("Step");
		this.cmd("SetForegroundColor", this.codeID[4][0], DPChange.CODE_STANDARD_COLOR);
		
		var i;
		var best = -1;
		var nextID  = this.nextIndex++;
		var nextID2 = this.nextIndex++;
		var recID = nextID;
		var bestList;
		for (i = 0; i < coins.length; i++)
		{
			this.cmd("SetForegroundColor", this.codeID[5][1], DPChange.CODE_HIGHLIGHT_COLOR);
			this.cmd("Step");
			this.cmd("SetForegroundColor", this.codeID[5][1], DPChange.CODE_STANDARD_COLOR);
			if (value >= coins[i])
			{
				this.cmd("SetForegroundColor", this.codeID[6][1], DPChange.CODE_HIGHLIGHT_COLOR);
				this.cmd("Step");
				this.cmd("SetForegroundColor", this.codeID[6][1], DPChange.CODE_STANDARD_COLOR);
				var nextTry  = this.changeMem(value - coins[i], xPos + DPChange.RECURSIVE_DELTA_X, recID);
				// TODO:  SOMEHTING ELSE HERE
				if (best == -1)
				{
					this.cmd("SetForegroundColor", this.codeID[7][1], DPChange.CODE_HIGHLIGHT_COLOR);
					this.cmd("Step");
					this.cmd("SetForegroundColor", this.codeID[7][1], DPChange.CODE_STANDARD_COLOR);
					best = nextTry[0] + 1;
					bestList = nextTry[1];
					bestList.push(coins[i]);;
					this.currentY += DPChange.RECURSIVE_DELTA_Y;
					recID = nextID2;
				}
				else if (best > nextTry[0] + 1)
				{
					this.cmd("SetForegroundColor", this.codeID[7][2], DPChange.CODE_HIGHLIGHT_COLOR);
					this.cmd("Step");
					this.cmd("SetForegroundColor", this.codeID[7][2], DPChange.CODE_STANDARD_COLOR);
					best = nextTry[0] + 1;
					bestList = nextTry[1];
					bestList.push(coins[i]);;
					this.cmd("Delete", recID);
					this.cmd("SetText", nextID, String(best));
					this.cmd("SetPosition", nextID, xPos + DPChange.RECURSIVE_DELTA_X, this.currentY);					
					this.cmd("Move", nextID, xPos + DPChange.RECURSIVE_DELTA_X, this.currentY - DPChange.RECURSIVE_DELTA_Y);
					this.cmd("Step");
				}
				else
				{
					this.cmd("Step");
					this.cmd("Delete", recID);
				}
			}
			else
			{
				break;
			}
		}
		this.cmd("Delete", nextID);
		this.cmd("SetText", ID, String(best));
		this.cmd("SetText", this.tableID[0][value], best);
		this.cmd("SetText", this.tableID[1][value], bestList[0]);
		this.tableVals[0][value] = best;
		this.tableVals[1][value] = bestList[0];

		this.cmd("SetPosition", ID, xPos + DPChange.RECURSIVE_DELTA_X, this.currentY);				
		this.cmd("Move", ID, xPos, this.currentY - 2 * DPChange.RECURSIVE_DELTA_Y);
		
		
		this.currentY  = this.currentY -  2 * DPChange.RECURSIVE_DELTA_Y;
		
		this.cmd("SetForegroundColor", this.codeID[9][0], DPChange.CODE_HIGHLIGHT_COLOR);
		this.cmd("Step");
		this.cmd("SetForegroundColor", this.codeID[9][0], DPChange.CODE_STANDARD_COLOR);
		this.cmd("Step");
		return [best, bestList];
	}
	else
	{
		this.cmd("SetText", ID, "0");
		this.cmd("SetForegroundColor", this.codeID[2][0], DPChange.CODE_HIGHLIGHT_COLOR);
		this.cmd("Step");
		this.cmd("SetForegroundColor", this.codeID[2][0], DPChange.CODE_STANDARD_COLOR);
		this.cmd("SetText", this.tableID[0][value], 0);

		this.currentY -=  DPChange.RECURSIVE_DELTA_Y;
		return [0, []];
	}
	
	
	
}



DPChange.prototype.enableUI = function(event)
{
	for (var i = 0; i < this.controls.length; i++)
	{
		this.controls[i].disabled = false;
	}
	
	
}
DPChange.prototype.disableUI = function(event)
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
	currentAlg = new DPChange(animManag, canvas.width, canvas.height);
}



