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
// THIS SOFTWARE IS PROVIDED BY David Galles ``AS IS'' AND ANY EXPRESS OR IMPLIED
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



function Floyd(am, w, h)
{
	this.init(am, w, h);
}


Floyd.SMALL_COST_TABLE_WIDTH = 30;
Floyd.SMALL_COST_TABLE_HEIGHT = 30;
Floyd.SMALL_COST_TABLE_START_X = 40;
Floyd.SMALL_COST_TABLE_START_Y = 70;

Floyd.SMALL_PATH_TABLE_WIDTH = 30;
Floyd.SMALL_PATH_TABLE_HEIGHT = 30;
Floyd.SMALL_PATH_TABLE_START_X = 330;
Floyd.SMALL_PATH_TABLE_START_Y = 70;


Floyd.SMALL_NODE_1_X_POS = 50;
Floyd.SMALL_NODE_1_Y_POS = 400;
Floyd.SMALL_NODE_2_X_POS = 150;
Floyd.SMALL_NODE_2_Y_POS = 350;
Floyd.SMALL_NODE_3_X_POS = 250;
Floyd.SMALL_NODE_3_Y_POS = 400;

Floyd.SMALL_MESSAGE_X = 400;
Floyd.SMALL_MESSAGE_Y = 350;

Floyd.LARGE_COST_TABLE_WIDTH = 20;
Floyd.LARGE_COST_TABLE_HEIGHT = 20;
Floyd.LARGE_COST_TABLE_START_X = 40;
Floyd.LARGE_COST_TABLE_START_Y = 50;

Floyd.LARGE_PATH_TABLE_WIDTH = 20;
Floyd.LARGE_PATH_TABLE_HEIGHT = 20;
Floyd.LARGE_PATH_TABLE_START_X = 500;
Floyd.LARGE_PATH_TABLE_START_Y = 50;

Floyd.LARGE_NODE_1_X_POS = 50;
Floyd.LARGE_NODE_1_Y_POS = 500;
Floyd.LARGE_NODE_2_X_POS = 150;
Floyd.LARGE_NODE_2_Y_POS = 450;
Floyd.LARGE_NODE_3_X_POS = 250;
Floyd.LARGE_NODE_3_Y_POS = 500;

Floyd.LARGE_MESSAGE_X = 300;
Floyd.LARGE_MESSAGE_Y = 450;

Floyd.prototype = new Graph();
Floyd.prototype.constructor = Floyd;
Floyd.superclass = Graph.prototype;

Floyd.prototype.addControls =  function()
{		
	
	this.startButton = addControlToAlgorithmBar("Button", "Run Floyd-Warshall");
	this.startButton.onclick = this.startCallback.bind(this);

	Floyd.superclass.addControls.call(this);
	this.smallGraphButton.onclick = this.smallGraphCallback.bind(this);
	this.largeGraphButton.onclick = this.largeGraphCallback.bind(this);	
}	


Floyd.prototype.init = function(am, w, h)
{
	this.showEdgeCosts = true;
	Floyd.superclass.init.call(this, am, w, h, true, false); // TODO:  add no edge label flag to this?
	// Setup called in base class init function
}

Floyd.prototype.reset = function()
{
	for (var i = 0; i < this.size; i++)
	{
		for (var j = 0; j < this.size; j++)
		{
			this.costTable[i][j] = this.adj_matrix[i][j];
			if (this.costTable[i][j] >= 0)
			{
				this.pathTable[i][j] = i;
			}
			else
			{
				this.pathTable[i][j] = -1
			}			
			
		}
		
	}
	
}


Floyd.prototype.smallGraphCallback = function (event)
{
	if (this.size != SMALL_SIZE)
	{
		this.animationManager.resetAll();
		this.animationManager.setAllLayers([0,this.currentLayer]);
		this.logicalButton.disabled = false;
		this.adjacencyListButton.disabled = false;
		this.adjacencyMatrixButton.disabled = false;
		this.setup_small();		
	}
}

Graph.prototype.largeGraphCallback = function (event)
{
	if (this.size != LARGE_SIZE)
	{
		this.animationManager.resetAll();
		//this.animationManager.setAllLayers([0]);
		this.logicalButton.disabled = true;
		this.adjacencyListButton.disabled = true;
		this.adjacencyMatrixButton.disabled = true;
		this.setup_large();		
	}	
}




Floyd.prototype.getCostLabel = function(value, alwaysUseINF)
{
	alwaysUseINF = alwaysUseINF == undefined ? false : alwaysUseINF;
	if (value >= 0)
	{
		return String(value);
	}
	else if (this.size == SMALL_SIZE || alwaysUseINF)
	{
		return "INF";
	}
	else
	{
		return ""
	}			
}

Floyd.prototype.setup_small = function()
{
	this.cost_table_width = Floyd.SMALL_COST_TABLE_WIDTH;
	this.cost_table_height = Floyd.SMALL_COST_TABLE_HEIGHT;
	this.cost_table_start_x = Floyd.SMALL_COST_TABLE_START_X;
	this.cost_table_start_y = Floyd.SMALL_COST_TABLE_START_Y;
	
	this.path_table_width = Floyd.SMALL_PATH_TABLE_WIDTH;
	this.path_table_height = Floyd.SMALL_PATH_TABLE_HEIGHT;
	this.path_table_start_x = Floyd.SMALL_PATH_TABLE_START_X;
	this.path_table_start_y = Floyd.SMALL_PATH_TABLE_START_Y;
	
	this.node_1_x_pos = Floyd.SMALL_NODE_1_X_POS;
	this.node_1_y_pos = Floyd.SMALL_NODE_1_Y_POS;
	this.node_2_x_pos = Floyd.SMALL_NODE_2_X_POS;
	this.node_2_y_pos = Floyd.SMALL_NODE_2_Y_POS;
	this.node_3_x_pos = Floyd.SMALL_NODE_3_X_POS;
	this.node_3_y_pos = Floyd.SMALL_NODE_3_Y_POS;
	
	this.message_x = Floyd.SMALL_MESSAGE_X;
	this.message_y = Floyd.SMALL_MESSAGE_Y;
	Floyd.superclass.setup_small.call(this);
}

Floyd.prototype.setup_large = function()
{
	this.cost_table_width = Floyd.LARGE_COST_TABLE_WIDTH;
	this.cost_table_height = Floyd.LARGE_COST_TABLE_HEIGHT;
	this.cost_table_start_x = Floyd.LARGE_COST_TABLE_START_X;
	this.cost_table_start_y = Floyd.LARGE_COST_TABLE_START_Y;
	
	this.path_table_width = Floyd.LARGE_PATH_TABLE_WIDTH;
	this.path_table_height = Floyd.LARGE_PATH_TABLE_HEIGHT;
	this.path_table_start_x = Floyd.LARGE_PATH_TABLE_START_X;
	this.path_table_start_y = Floyd.LARGE_PATH_TABLE_START_Y;
	
	this.node_1_x_pos = Floyd.LARGE_NODE_1_X_POS;
	this.node_1_y_pos = Floyd.LARGE_NODE_1_Y_POS;
	this.node_2_x_pos = Floyd.LARGE_NODE_2_X_POS;
	this.node_2_y_pos = Floyd.LARGE_NODE_2_Y_POS;
	this.node_3_x_pos = Floyd.LARGE_NODE_3_X_POS;
	this.node_3_y_pos = Floyd.LARGE_NODE_3_Y_POS;
	
	this.message_x = Floyd.LARGE_MESSAGE_X;
	this.message_y = Floyd.LARGE_MESSAGE_Y;
	
	Floyd.superclass.setup_large.call(this);
}


Floyd.prototype.setup = function()
{
	Floyd.superclass.setup.call(this);
	this.commands = new Array();
	
	this.costTable = new Array(this.size);
	this.pathTable = new Array(this.size);
	this.costTableID = new Array(this.size);
	this.pathTableID = new Array(this.size);
	this.pathIndexXID = new Array(this.size);
	this.pathIndexYID = new Array(this.size);
	this.costIndexXID = new Array(this.size);
	this.costIndexYID = new Array(this.size);
	
	this.node1ID = this.nextIndex++;
	this.node2ID = this.nextIndex++;
	this.node3ID = this.nextIndex++;
	
	var i;
	for (i = 0; i < this.size; i++)
	{
		this.costTable[i] = new Array(this.size);
		this.pathTable[i] = new Array(this.size);
		this.costTableID[i] = new Array(this.size);
		this.pathTableID[i] = new Array(this.size);
		
	}
	
	var costTableHeader = this.nextIndex++;
	var pathTableHeader = this.nextIndex++;
	
	this.cmd("CreateLabel", costTableHeader, "Cost Table", this.cost_table_start_x, this.cost_table_start_y - 2*this.cost_table_height, 0);
	this.cmd("CreateLabel", pathTableHeader, "Path Table", this.path_table_start_x, this.path_table_start_y - 2*this.path_table_height, 0);
	
	for (i= 0; i < this.size; i++)
	{
		this.pathIndexXID[i] = this.nextIndex++;
		this.pathIndexYID[i] = this.nextIndex++;
		this.costIndexXID[i] = this.nextIndex++;
		this.costIndexYID[i] = this.nextIndex++;
		this.cmd("CreateLabel", this.pathIndexXID[i], i, this.path_table_start_x + i * this.path_table_width, this.path_table_start_y - this.path_table_height);
		this.cmd("SetTextColor", this.pathIndexXID[i], "#0000FF");
		this.cmd("CreateLabel", this.pathIndexYID[i], i, this.path_table_start_x   - this.path_table_width, this.path_table_start_y + i * this.path_table_height);
		this.cmd("SetTextColor", this.pathIndexYID[i], "#0000FF");
		
		this.cmd("CreateLabel", this.costIndexXID[i], i, this.cost_table_start_x + i * this.cost_table_width, this.cost_table_start_y - this.cost_table_height);
		this.cmd("SetTextColor", this.costIndexXID[i], "#0000FF");
		this.cmd("CreateLabel", this.costIndexYID[i], i, this.cost_table_start_x - this.cost_table_width, this.cost_table_start_y + i * this.cost_table_height);
		this.cmd("SetTextColor", this.costIndexYID[i], "#0000FF");
		for (var j = 0; j < this.size; j++)
		{
			this.costTable[i][j] = this.adj_matrix[i][j];
			if (this.costTable[i][j] >= 0)
			{
				this.pathTable[i][j] = i;
			}
			else
			{
				this.pathTable[i][j] = -1
			}
			this.costTableID[i][j] = this.nextIndex++;
			this.pathTableID[i][j] = this.nextIndex++;
			this.cmd("CreateRectangle", this.costTableID[i][j], this.getCostLabel(this.costTable[i][j], true), this.cost_table_width, this.cost_table_height, this.cost_table_start_x + j* this.cost_table_width, this.cost_table_start_y + i*this.cost_table_height);
			this.cmd("CreateRectangle", this.pathTableID[i][j], this.pathTable[i][j], this.path_table_width, this.path_table_height, this.path_table_start_x + j* this.path_table_width, this.path_table_start_y + i*this.path_table_height);
		}
	}
	this.animationManager.StartNewAnimation(this.commands);
	this.animationManager.skipForward();
	this.animationManager.clearHistory();
	if (this.size == LARGE_SIZE)
	{
		this.animationManager.setAllLayers([0]);
	}
	
}

Floyd.prototype.startCallback = function(event)
{	
	this.implementAction(this.doFloydWarshall.bind(this),"");
}


Floyd.prototype.doFloydWarshall = function(ignored)
{
	this.commands = new Array();
	
	var oldIndex= this.nextIndex;
	var messageID  = this.nextIndex++;
	var moveLabel1ID = this.nextIndex++;
	var moveLabel2ID = this.nextIndex++;
	
	this.cmd("CreateCircle", this.node1ID, "", this.node_1_x_pos, this.node_1_y_pos);
	this.cmd("CreateCircle", this.node2ID, "", this.node_2_x_pos, this.node_2_y_pos);
	this.cmd("CreateCircle", this.node3ID, "", this.node_3_x_pos, this.node_3_y_pos);
	this.cmd("CreateLabel", messageID, "",  this.message_x, this.message_y, 0); 
	
	for (var k = 0; k < this.size; k++)
	{
		for (var i = 0; i < this.size; i++)
		{
			for (var j = 0; j < this.size; j++)
			{
				if (i != j && j != k && i != k)
				{
					this.cmd("SetText", this.node1ID, i);
					this.cmd("SetText", this.node2ID, k);
					this.cmd("SetText", this.node3ID, j);
					this.cmd("Connect",this.node1ID, this.node2ID, "#009999", -0.1, 1, this.getCostLabel(this.costTable[i][k], true))
					this.cmd("Connect",this.node2ID, this.node3ID, "#9900CC", -0.1, 1, this.getCostLabel(this.costTable[k][j], true))
					this.cmd("Connect",this.node1ID, this.node3ID, "#CC0000", 0, 1, this.getCostLabel(this.costTable[i][j], true))
					this.cmd("SetHighlight", this.costTableID[i][k], 1);
					this.cmd("SetHighlight", this.costTableID[k][j], 1);
					this.cmd("SetHighlight", this.costTableID[i][j], 1);
					this.cmd("SetTextColor", this.costTableID[i][k], "#009999");
					this.cmd("SetTextColor", this.costTableID[k][j], "#9900CC");
					this.cmd("SetTextColor", this.costTableID[i][j], "#CC0000");
					if (this.costTable[i][k] >= 0 && this.costTable[k][j] >= 0)
					{
						if (this.costTable[i][j] < 0 || this.costTable[i][k] + this.costTable[k][j] < this.costTable[i][j])
						{							
							this.cmd("SetText", messageID, this.getCostLabel(this.costTable[i][k], true) + " + " +  this.getCostLabel(this.costTable[k][j], true) + " < " + this.getCostLabel(this.costTable[i][j], true));
							this.cmd("Step");
							this.costTable[i][j] = this.costTable[i][k] + this.costTable[k][j];
							this.cmd("SetText", this.pathTableID[i][j], "");
							this.cmd("SetText", this.costTableID[i][j], "");
							this.cmd("CreateLabel", moveLabel1ID, this.pathTable[k][j],  this.path_table_start_x + j* this.path_table_width, this.path_table_start_y + k*this.path_table_height);
							this.cmd("Move", moveLabel1ID, this.path_table_start_x + j* this.path_table_width, this.path_table_start_y + i*this.path_table_height)						
							this.cmd("CreateLabel", moveLabel2ID,this.costTable[i][j],  this.message_x, this.message_y);
							this.cmd("SetHighlight", moveLabel2ID, 1);
							this.cmd("Move", moveLabel2ID, this.cost_table_start_x + j* this.cost_table_width, this.cost_table_start_y + i*this.cost_table_height)						
							this.pathTable[i][j] = this.pathTable[k][j];
							this.cmd("Step");
							this.cmd("SetText", this.costTableID[i][j], this.costTable[i][j]);
							this.cmd("SetText", this.pathTableID[i][j], this.pathTable[i][j]);
							this.cmd("Delete", moveLabel1ID);
							this.cmd("Delete", moveLabel2ID);
						}
						else
						{
							this.cmd("SetText", messageID, "!("+this.getCostLabel(this.costTable[i][k], true) + " + " + this.getCostLabel(this.costTable[k][j], true) + " < " + this.getCostLabel(this.costTable[i][j], true) + ")");
							this.cmd("Step");
							
						}
						
					}
					else
					{
						this.cmd("SetText", messageID, "!("+this.getCostLabel(this.costTable[i][k], true) + " + " + this.getCostLabel(this.costTable[k][j], true) + " < " + this.getCostLabel(this.costTable[i][j], true) + ")");								
						this.cmd("Step");
					}
					this.cmd("SetTextColor", this.costTableID[i][k], "#000000");
					this.cmd("SetTextColor", this.costTableID[k][j], "#000000");
					this.cmd("SetTextColor", this.costTableID[i][j], "#000000");
					this.cmd("Disconnect",this.node1ID, this.node2ID)
					this.cmd("Disconnect",this.node2ID, this.node3ID)
					this.cmd("Disconnect",this.node1ID, this.node3ID)
					this.cmd("SetHighlight", this.costTableID[i][k], 0);
					this.cmd("SetHighlight", this.costTableID[k][j], 0);
					this.cmd("SetHighlight", this.costTableID[i][j], 0);
				}
			}
			
			
		}
	}
	this.cmd("Delete", this.node1ID);
	this.cmd("Delete", this.node2ID);
	this.cmd("Delete", this.node3ID);
	this.cmd("Delete", messageID);
	this.nextIndex = oldIndex;
	
	
	
	return this.commands
}


Floyd.prototype.enableUI = function(event)
{			
	this.startButton.disabled = false;
	Floyd.superclass.enableUI.call(this,event);
}
Floyd.prototype.disableUI = function(event)
{
	this.startButton.disabled = true;	
	Floyd.superclass.disableUI.call(this, event);
}


var currentAlg;

function init()
{
	var animManag = initCanvas();
	currentAlg = new Floyd(animManag, canvas.width, canvas.height);
}
