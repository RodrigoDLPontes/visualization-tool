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


var AUX_ARRAY_WIDTH = 25;
var AUX_ARRAY_HEIGHT = 25;
var AUX_ARRAY_START_Y = 100;

var VISITED_START_X = 475;
var PARENT_START_X = 400;


var D_X_POS_SMALL = [760, 685, 915, 610, 910, 685, 915, 760];
var F_X_POS_SMALL = [760, 685, 915, 610, 910, 685, 915, 760];



var D_Y_POS_SMALL = [18, 118, 118, 218, 218, 318, 318, 418];
var F_Y_POS_SMALL = [32, 132, 132, 232, 232, 332, 332, 432];

var D_X_POS_LARGE = [560, 660, 760, 860,
									610, 710, 810,
									560, 660, 760, 860,
									610, 710, 810,
									560, 660, 760, 860];

var F_X_POS_LARGE = [560, 660, 760, 860,
									610, 710, 810,
									560, 660, 760, 860,
									610, 710, 810,
									560, 660, 760, 860];



var D_Y_POS_LARGE = [037, 037, 037, 037,
									137, 137, 137,
									237, 237, 237, 237, 
									337, 337, 337, 
									437,  437, 437, 437];

var F_Y_POS_LARGE = [62, 62, 62, 62,
									162, 162, 162,
									262, 262, 262, 262, 
									362, 362, 362, 
									462,  462, 462, 462];


var HIGHLIGHT_CIRCLE_COLOR = "#000000";
var DFS_TREE_COLOR = "#0000FF";


function ConnectedComponent(am, w, h)
{
	this.init(am, w, h);
	
}

ConnectedComponent.prototype = new Graph();
ConnectedComponent.prototype.constructor = ConnectedComponent;
ConnectedComponent.superclass = Graph.prototype;

ConnectedComponent.prototype.addControls =  function()
{		
	this.startButton = addControlToAlgorithmBar("Button", "Run Connected Component");
	this.startButton.onclick = this.startCallback.bind(this);
	ConnectedComponent.superclass.addControls.call(this, false);
}	


ConnectedComponent.prototype.init = function(am, w, h)
{
	this.showEdgeCosts = false;
	ConnectedComponent.superclass.init.call(this, am, w, h, true, false); // TODO:  add no edge label flag to this?
	// Setup called in base class init function
}

		
ConnectedComponent.prototype.setup = function() 
{
	ConnectedComponent.superclass.setup.call(this); 
	this.animationManager.setAllLayers([0, this.currentLayer]);
	this.messageID = new Array();
	this.commands = new Array();
	this.animationManager.clearHistory();
	this.messageID = new Array();
	this.commands = new Array();
	
	this.highlightCircleL = this.nextIndex++;
	this.highlightCircleAL = this.nextIndex++;
	this.highlightCircleAM= this.nextIndex++
	this.initialIndex = this.nextIndex;
	
	this.old_adj_matrix = new Array(this.size);
	this.old_adj_list_list = new Array(this.size);
	this.old_adj_list_index = new Array(this.size);
	this.old_adj_list_edges = new Array(this.size);
	for (var i = 0; i < this.size; i++)
	{
		this.old_adj_matrix[i] = new Array(this.size);
		this.old_adj_list_index[i] = this.adj_list_index[i];
		this.old_adj_list_list[i] = this.adj_list_list[i];
		this.old_adj_list_edges[i] = new Array(this.size);
		for (var j = 0; j < this.size; j++)
		{
			this.old_adj_matrix[i][j] = this.adj_matrix[i][j];	
			if (this.adj_matrix[i][j] > 0)
			{
				this.old_adj_list_edges[i][j] = this.adj_list_edges[i][j];
			}	
			
		}
	}
}
		
		
ConnectedComponent.prototype.startCallback = function(event)
{
			this.implementAction(this.doCC.bind(this),"");
}


ConnectedComponent.prototype.transpose = function()
{
	for (var i = 0; i < this.size; i++)
	{
		for (var j = i+1; j <this.size; j++)
		{
			var tmp = this.adj_matrix[i][j];
			this.adj_matrix[i][j] = this.adj_matrix[j][i];
			this.adj_matrix[j][i] = tmp;
		}
	}
}

ConnectedComponent.prototype.doCC = function(ignored)
{
		
	this.visited = new Array(this.size);
	this.commands = new Array();
	var i;
	if (this.messageID != null)
	{
		for (i = 0; i < this.messageID.length; i++)
		{
			this.cmd("Delete", this.messageID[i], 1);
		}
	}
	this.rebuildEdges();
	this.messageID = new Array();
	
	this.d_timesID_L = new Array(this.size);
	this.f_timesID_L = new Array(this.size);
	this.d_timesID_AL = new Array(this.size);
	this.f_timesID_AL = new Array(this.size);
	this.d_times = new Array(this.size);
	this.f_times = new Array(this.size);
	this.currentTime = 1
	for (i = 0; i < this.size; i++)
	{
		this.d_timesID_L[i] = this.nextIndex++;
		this.f_timesID_L[i] = this.nextIndex++;
		this.d_timesID_AL[i] = this.nextIndex++;
		this.f_timesID_AL[i] = this.nextIndex++;
	}
	
	this.messageY = 30;
	var vertex;
	for (vertex = 0; vertex < this.size; vertex++)
	{
		if (!this.visited[vertex])
		{
			this.cmd("CreateHighlightCircle", this.highlightCircleL, HIGHLIGHT_CIRCLE_COLOR, this.x_pos_logical[vertex], this.y_pos_logical[vertex]);
			this.cmd("SetLayer", this.highlightCircleL, 1);
			this.cmd("CreateHighlightCircle", this.highlightCircleAL, HIGHLIGHT_CIRCLE_COLOR,this.adj_list_x_start - this.adj_list_width, this.adj_list_y_start + vertex*this.adj_list_height);
			this.cmd("SetLayer", this.highlightCircleAL, 2);
			
			this.cmd("CreateHighlightCircle", this.highlightCircleAM, HIGHLIGHT_CIRCLE_COLOR,this.adj_matrix_x_start  - this.adj_matrix_width, this.adj_matrix_y_start + vertex*this.adj_matrix_height);
			this.cmd("SetLayer", this.highlightCircleAM, 3);
			
			if (vertex > 0)
			{
				var breakID = this.nextIndex++;
				this.messageID.push(breakID);
				this.cmd("CreateRectangle", breakID, "", 200, 0, 10, this.messageY,"left","bottom");
				this.messageY = this.messageY + 20;			
			}
			this.dfsVisit(vertex, 10, false);
			this.cmd("Delete", this.highlightCircleL, 2);
			this.cmd("Delete", this.highlightCircleAL, 3);
			this.cmd("Delete", this.highlightCircleAM, 4);
		}
	}
	this.clearEdges();
	this.removeAdjList();
	this.transpose();
	this.buildEdges();
	this.buildAdjList();
	this.currentTime = 1
	
	for (i=0; i < this.size; i++)
	{
		for (j = 0; j < this.size; j++)
		{
			if (this.adj_matrix[i][j] >= 0)
			{
				this.cmd("SetText", this.adj_matrixID[i][j], "1");
			}
			else
			{
				this.cmd("SetText", this.adj_matrixID[i][j], "");						
			}
		}
	}
	
	
	for (vertex = 0; vertex < this.size; vertex++)
	{
		this.visited[vertex] = false;
		this.cmd("Delete", this.d_timesID_L[vertex], 5);
		this.cmd("Delete", this.f_timesID_L[vertex], 6);
		this.cmd("Delete", this.d_timesID_AL[vertex], 7);
		this.cmd("Delete", this.f_timesID_AL[vertex], 8);
	}
	
	var sortedVertex = new Array(this.size);
	var sortedID = new Array(this.size);
	for (vertex = 0; vertex < this.size; vertex++)
	{
		sortedVertex[vertex] = vertex;
		sortedID[vertex] = this.nextIndex++;
		this.cmd("CreateLabel", sortedID[vertex], "Vertex: " + String(vertex)+ " f = " + String(this.f_times[vertex]), 400, 110 + vertex*20, 0);
	}
	this.cmd("Step");
	
	for (i = 1; i < this.size; i++)
	{
		var j = i;
		var tmpTime = this.f_times[i];
		var tmpIndex = sortedVertex[i];
		var tmpID = sortedID[i];
		while (j > 0 && this.f_times[j-1] < tmpTime)
		{
			this.f_times[j] = this.f_times[j-1];
			sortedVertex[j] = sortedVertex[j-1];
			sortedID[j] = sortedID[j-1];
			j--;
		}
		this.f_times[j] = tmpTime;
		sortedVertex[j] = tmpIndex;
		sortedID[j] = tmpID;
	}
	for (vertex = 0; vertex < this.size; vertex++)
	{
		this.cmd("Move", sortedID[vertex],  400, 110 + vertex*20);
	}
	
	for (i = 0; i < this.messageID.length; i++)
	{
		this.cmd("Delete", this.messageID[i], 9);
	}
	
	this.messageID = new Array();
	this.messageY = 30;
	
	var ccNum = 1;
	for (i  = 0; i < this.size; i++)
	{
		vertex = sortedVertex[i];
		if (!this.visited[vertex])
		{
			
			var breakID1 = this.nextIndex++;
			this.messageID.push(breakID1);
			var breakID2 = this.nextIndex++;
			this.messageID.push(breakID2);
			this.cmd("CreateRectangle", breakID1, "", 200, 0, 50, this.messageY + 8,"left","center");
			this.cmd("CreateLabel", breakID2, "CC #" + String(ccNum++), 10, this.messageY, 0);
			this.cmd("SetForegroundColor",breakID1 ,"#004B00");
			this.cmd("SetForegroundColor",breakID2 ,"#004B00");
			this.messageY = this.messageY + 20;			
			
			this.cmd("CreateHighlightCircle", this.highlightCircleL, HIGHLIGHT_CIRCLE_COLOR, this.x_pos_logical[vertex], this.y_pos_logical[vertex]);
			this.cmd("SetLayer", this.highlightCircleL, 1);
			this.cmd("CreateHighlightCircle", this.highlightCircleAL, HIGHLIGHT_CIRCLE_COLOR,this.adj_list_x_start - this.adj_list_width, this.adj_list_y_start + vertex*this.adj_list_height);
			this.cmd("SetLayer", this.highlightCircleAL, 2);
			
			this.cmd("CreateHighlightCircle", this.highlightCircleAM, HIGHLIGHT_CIRCLE_COLOR,this.adj_matrix_x_start  - this.adj_matrix_width, this.adj_matrix_y_start + vertex*this.adj_matrix_height);
			this.cmd("SetLayer", this.highlightCircleAM, 3);

			
			
			
			
			this.dfsVisit(vertex, 75, true);
			this.cmd("Delete", this.highlightCircleL, 10);
			this.cmd("Delete", this.highlightCircleAL, 11);
			this.cmd("Delete", this.highlightCircleAM, 12);
		}
		this.cmd("Delete", sortedID[i], 13);
	}
	
	for (vertex = 0; vertex < this.size; vertex++)
	{
		this.cmd("Delete", this.d_timesID_L[vertex], 14);
		this.cmd("Delete", this.f_timesID_L[vertex], 15);
		this.cmd("Delete", this.d_timesID_AL[vertex], 16);
		this.cmd("Delete", this.f_timesID_AL[vertex], 17);
	}
	
	return this.commands
	
}


ConnectedComponent.prototype.setup_large = function()
{
	this.d_x_pos = D_X_POS_LARGE;
	this.d_y_pos = D_Y_POS_LARGE;
	this.f_x_pos = F_X_POS_LARGE;
	this.f_y_pos = F_Y_POS_LARGE;
	
	ConnectedComponent.superclass.setup_large.call(this); 
}		
ConnectedComponent.prototype.setup_small = function()
{
	
	this.d_x_pos = D_X_POS_SMALL;
	this.d_y_pos = D_Y_POS_SMALL;
	this.f_x_pos = F_X_POS_SMALL;
	this.f_y_pos = F_Y_POS_SMALL;

	ConnectedComponent.superclass.setup_small.call(this); 
}

ConnectedComponent.prototype.dfsVisit = function(startVertex, messageX, printCCNum)
{
	if (printCCNum)
	{
		var ccNumberID = this.nextIndex++;
		this.messageID.push(ccNumberID);
		this.cmd("CreateLabel",ccNumberID, "Vertex " +  String(startVertex), 5, this.messageY, 0);
		this.cmd("SetForegroundColor", ccNumberID, "#0000FF");
	}
	var nextMessage = this.nextIndex++;
	this.messageID.push(nextMessage);
	this.cmd("CreateLabel",nextMessage, "DFS(" +  String(startVertex) +  ")", messageX, this.messageY, 0);
	
	this.messageY = this.messageY + 20;
	if (!this.visited[startVertex])
	{
		this.d_times[startVertex] = this.currentTime++;
		this.cmd("CreateLabel", this.d_timesID_L[startVertex], "d = " + String(this.d_times[startVertex]), this.d_x_pos[startVertex], this.d_y_pos[startVertex]);				
		this.cmd("CreateLabel", this.d_timesID_AL[startVertex], "d = " + String(this.d_times[startVertex]), this.adj_list_x_start - 2*this.adj_list_width, this.adj_list_y_start + startVertex*this.adj_list_height - 1/4*this.adj_list_height);
		this.cmd("SetLayer",  this.d_timesID_L[startVertex], 1);
		this.cmd("SetLayer",  this.d_timesID_AL[startVertex], 2);
		
		this.visited[startVertex] = true;
		this.cmd("Step");
		for (var neighbor = 0; neighbor < this.size; neighbor++)
		{
			if (this.adj_matrix[startVertex][neighbor] > 0)
			{
				this.highlightEdge(startVertex, neighbor, 1);
				if (this.visited[neighbor])
				{
					nextMessage = this.nextIndex;
					this.cmd("CreateLabel", nextMessage, "Vertex " + String(neighbor) + " already this.visited.", messageX, this.messageY, 0);
				}
				this.cmd("Step");
				this.highlightEdge(startVertex, neighbor, 0);
				if (this.visited[neighbor])
				{
					this.cmd("Delete", nextMessage, "DNM");
				}
				
				if (!this.visited[neighbor])
				{
					this.cmd("Disconnect", this.circleID[startVertex], this.circleID[neighbor]);
					this.cmd("Connect", this.circleID[startVertex], this.circleID[neighbor], DFS_TREE_COLOR, this.curve[startVertex][neighbor], 1, "");
					this.cmd("Move", this.highlightCircleL, this.x_pos_logical[neighbor], this.y_pos_logical[neighbor]);
					this.cmd("Move", this.highlightCircleAL, this.adj_list_x_start - this.adj_list_width, this.adj_list_y_start + neighbor*this.adj_list_height);
					this.cmd("Move", this.highlightCircleAM, this.adj_matrix_x_start - this.adj_matrix_width, this.adj_matrix_y_start + neighbor*this.adj_matrix_height);
					
					this.cmd("Step");
					this.dfsVisit(neighbor, messageX + 10, printCCNum);							
					nextMessage = this.nextIndex;
					this.cmd("CreateLabel", nextMessage, "Returning from recursive call: DFS(" + String(neighbor) + ")", messageX + 20, this.messageY, 0);
					
					this.cmd("Move", this.highlightCircleAL, this.adj_list_x_start - this.adj_list_width, this.adj_list_y_start + startVertex*this.adj_list_height);
					this.cmd("Move", this.highlightCircleL, this.x_pos_logical[startVertex], this.y_pos_logical[startVertex]);
					this.cmd("Move", this.highlightCircleAM, this.adj_matrix_x_start - this.adj_matrix_width, this.adj_matrix_y_start + startVertex*this.adj_matrix_height);
					this.cmd("Step");
					this.cmd("Delete", nextMessage, 18);
				}
				this.cmd("Step");
				
				
				
			}
			
		}
		this.f_times[startVertex] = this.currentTime++;
		this.cmd("CreateLabel", this.f_timesID_L[startVertex],"f = " + String(this.f_times[startVertex]), this.f_x_pos[startVertex], this.f_y_pos[startVertex]);
		this.cmd("CreateLabel", this.f_timesID_AL[startVertex], "f = " + String(this.f_times[startVertex]), this.adj_list_x_start - 2*this.adj_list_width, this.adj_list_y_start + startVertex*this.adj_list_height + 1/4*this.adj_list_height);
		
		this.cmd("SetLayer",  this.f_timesID_L[startVertex], 1);
		this.cmd("SetLayer",  this.f_timesID_AL[startVertex], 2);
		
		
		
	}
	
}


ConnectedComponent.prototype.reset = function()
{
	// TODO:  Fix undo messing with setup vars.
	this.messageID = new Array();
	this.nextIndex = this.initialIndex;
	for (var i = 0; i < this.size; i++)
	{
		this.adj_list_list[i] = this.old_adj_list_list[i];
		this.adj_list_index[i] = this.old_adj_list_index[i];

		for (var j = 0; j < this.size; j++)
		{
			this.adj_matrix[i][j] = this.old_adj_matrix[i][j];	
			if (this.adj_matrix[i][j] > 0)
			{
				this.adj_list_edges[i][j] = this.old_adj_list_edges[i][j];
			}	
		}
	}

}



ConnectedComponent.prototype.enableUI = function(event)
{			
	this.startButton.disabled = false;
	
	ConnectedComponent.superclass.enableUI.call(this,event);
}
ConnectedComponent.prototype.disableUI = function(event)
{
	
	this.startButton.disabled = true;
	
	ConnectedComponent.superclass.disableUI.call(this, event);
}


var currentAlg;

function init()
{
	var animManag = initCanvas();
	currentAlg = new ConnectedComponent(animManag, canvas.width, canvas.height);
}
