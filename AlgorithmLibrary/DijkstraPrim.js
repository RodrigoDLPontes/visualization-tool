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


var TABLE_ENTRY_WIDTH = 50;
var TABLE_ENTRY_HEIGHT = 25;
var TABLE_START_X = 50;
var TABLE_START_Y = 80;

var MESSAGE_LABEL_1_X = 20;
var MESSAGE_LABEL_1_Y = 10;



var HIGHLIGHT_CIRCLE_COLOR = "#000000";



function DijkstraPrim(am, runningDijkstra, w, h)
{
	this.init(am, runningDijkstra, w, h);

}

DijkstraPrim.prototype = new Graph();
DijkstraPrim.prototype.constructor = DijkstraPrim;
DijkstraPrim.superclass = Graph.prototype;

DijkstraPrim.prototype.addControls =  function()
{
	addLabelToAlgorithmBar("Start Vertex: ");
	this.startField = addControlToAlgorithmBar("Text", "");
	this.startField.onkeydown = this.returnSubmit(this.startField,  this.startCallback.bind(this), 1, false);
	this.startField.size = 2
	if (this.runningDijkstra)
	{
		this.startButton = addControlToAlgorithmBar("Button", "Run Dijkstra");

	}
	else
	{
		this.startButton = addControlToAlgorithmBar("Button", "Run Prim");

	}
	this.startButton.onclick = this.startCallback.bind(this);
	DijkstraPrim.superclass.addControls.call(this, this.runningDijkstra);
}


DijkstraPrim.prototype.init = function(am, runningDijkstra, w, h)
{
	this.runningDijkstra = runningDijkstra;
	this.showEdgeCosts = true;
	DijkstraPrim.superclass.init.call(this, am, w, h, false, false); // TODO:  add no edge label flag to this?
	// Setup called in base class init function
}


DijkstraPrim.prototype.setup = function()
{
	this.message1ID = this.nextIndex++;
	DijkstraPrim.superclass.setup.call(this);

	this.commands = new Array();
	this.cmd("CreateLabel", this.message1ID, "", MESSAGE_LABEL_1_X, MESSAGE_LABEL_1_Y, 0);


	this.vertexID = new Array(this.size);
	this.knownID = new Array(this.size);
	this.distanceID = new Array(this.size);
	this.pathID = new Array(this.size);
	this.known = new Array(this.size);
	this.distance = new Array(this.size);
	this.path = new Array(this.size);

	this.messageID = null;

	for (var i = 0; i < this.size; i++)
	{
		this.vertexID[i] = this.nextIndex++;
		this.knownID[i] = this.nextIndex++;
		this.distanceID[i] = this.nextIndex++;
		this.pathID[i] = this.nextIndex++;
		this.cmd("CreateRectangle", this.vertexID[i], String.fromCharCode(65 + i), TABLE_ENTRY_WIDTH, TABLE_ENTRY_HEIGHT, TABLE_START_X, TABLE_START_Y + i*TABLE_ENTRY_HEIGHT);
		this.cmd("CreateRectangle", this.knownID[i], "", TABLE_ENTRY_WIDTH, TABLE_ENTRY_HEIGHT, TABLE_START_X + TABLE_ENTRY_WIDTH, TABLE_START_Y + i*TABLE_ENTRY_HEIGHT);
		this.cmd("CreateRectangle", this.distanceID[i], "", TABLE_ENTRY_WIDTH, TABLE_ENTRY_HEIGHT, TABLE_START_X + 2 * TABLE_ENTRY_WIDTH, TABLE_START_Y + i*TABLE_ENTRY_HEIGHT);
		this.cmd("CreateRectangle", this.pathID[i], "", TABLE_ENTRY_WIDTH, TABLE_ENTRY_HEIGHT, TABLE_START_X+ 3 * TABLE_ENTRY_WIDTH, TABLE_START_Y + i*TABLE_ENTRY_HEIGHT);
		this.cmd("SetTextColor",  this.vertexID[i], VERTEX_INDEX_COLOR);

	}
	this.cmd("CreateLabel", this.nextIndex++, "Vertex", TABLE_START_X, TABLE_START_Y  - TABLE_ENTRY_HEIGHT);
	this.cmd("CreateLabel", this.nextIndex++, "Visited", TABLE_START_X + TABLE_ENTRY_WIDTH, TABLE_START_Y  - TABLE_ENTRY_HEIGHT);
	this.cmd("CreateLabel", this.nextIndex++, "Cost", TABLE_START_X + 2 * TABLE_ENTRY_WIDTH, TABLE_START_Y  - TABLE_ENTRY_HEIGHT);
	this.cmd("CreateLabel", this.nextIndex++, "Path", TABLE_START_X + 3 * TABLE_ENTRY_WIDTH, TABLE_START_Y  - TABLE_ENTRY_HEIGHT);

	this.animationManager.setAllLayers([0, this.currentLayer]);
	this.animationManager.StartNewAnimation(this.commands);
	this.animationManager.skipForward();
	this.animationManager.clearHistory();
	this.comparisonMessageID = this.nextIndex++;
}



DijkstraPrim.prototype.findCheapestUnknown = function()
{
    var bestIndex = -1;
    this.cmd("SetText", this.message1ID,"Finding Cheapest Uknown Vertex");

	for (var i = 0; i < this.size; i++)
	{
	    if (!this.known[i])
	    {
		this.cmd("SetHighlight", this.distanceID[i], 1);
	    }

		if (!this.known[i] && this.distance[i] != -1 && (bestIndex == -1 ||
											   (this.distance[i] < this.distance[bestIndex])))
		{
			bestIndex = i;
		}
	}
	if (bestIndex == -1)
	{
		var x = 3;
		x = x + 2;
	}
    this.cmd("Step");
    for (var i = 0; i < this.size; i++)
    {
	    if (!this.known[i])
	    {
		this.cmd("SetHighlight", this.distanceID[i], 0);
	    }

    }
	return bestIndex;
}


DijkstraPrim.prototype.doDijkstraPrim = function(startVertex)
{
	this.commands = new Array();

	if (!this.runningDijkstra)
	{
		this.recolorGraph();
	}

	var current = startVertex;

	for (var i = 0; i < this.size; i++)
	{
		this.known[i] = false;
		this.distance[i] = -1;
		this.path[i] = -1;
		this.cmd("SetText", this.knownID[i], "F");
		this.cmd("SetText", this.distanceID[i], "INF");
		this.cmd("SetText", this.pathID[i], "-1");
		this.cmd("SetTextColor", this.knownID[i], "#000000");

	}
	if (this.messageID != null)
	{
		for (i = 0; i < this.messageID.length; i++)
		{
			this.cmd("Delete", this.messageID[i]);
		}
	}
	this.messageID = new Array();

	this.distance[current] = 0;
	this.cmd("SetText", this.distanceID[current], 0);

	for (i = 0; i < this.size; i++)
	{
		current = this.findCheapestUnknown();
		if (current < 0)
		{
			break;
		}
		this.cmd("SetText",this.message1ID, "Cheapest Unknown Vertex: " + String.fromCharCode(65 + current)); // Gotta love Auto Conversion
		this.cmd("SetHighlight", this.distanceID[current], 1);

		this.cmd("SetHighlight", this.circleID[current], 1);
	        this.cmd("Step");
		this.cmd("SetHighlight", this.distanceID[current], 0);
	        this.cmd("SetText", this.message1ID,"Setting known field to True");
		this.cmd("SetHighlight", this.knownID[current], 1);
		this.known[current] = true;
		this.cmd("SetText", this.knownID[current], "T");
		this.cmd("SetTextColor", this.knownID[current], "#AAAAAA");
	        this.cmd("Step");
		this.cmd("SetHighlight", this.knownID[current], 0);
		this.cmd("SetText",this.message1ID, "Updating neighbors of vertex " + String.fromCharCode(65 + current)); // Gotta love Auto Conversion
		for (var neighbor = 0; neighbor < this.size; neighbor++)
		{
			if (this.adj_matrix[current][neighbor] >= 0)
			{
				this.highlightEdge(current, neighbor, 1);
				if (this.known[neighbor])
				{

					this.cmd("CreateLabel",  this.comparisonMessageID,"Vertex " + String.fromCharCode(65 + neighbor) + " known",
						TABLE_START_X + 5 * TABLE_ENTRY_WIDTH,TABLE_START_Y + neighbor*TABLE_ENTRY_HEIGHT);
					this.cmd("SetHighlight", this.knownID[neighbor], 1);
				}
				else
				{	this.cmd("SetHighlight", this.distanceID[current], 1);
					this.cmd("SetHighlight", this.distanceID[neighbor], 1);
					var distString = String(this.distance[neighbor]);
					if (this.distance[neighbor] < 0)
					{
						distString = "INF";
					}

					if (this.runningDijkstra)
					{
						if (this.distance[neighbor] < 0 || this.distance[neighbor] > this.distance[current] + this.adj_matrix[current][neighbor])
						{
							this.cmd("CreateLabel", this.comparisonMessageID, distString + " > " + String(this.distance[current]) + " + " + String(this.adj_matrix[current][neighbor]),
								TABLE_START_X + 4.3 * TABLE_ENTRY_WIDTH,TABLE_START_Y + neighbor*TABLE_ENTRY_HEIGHT);
						}
						else
						{
							this.cmd("CreateLabel",  this.comparisonMessageID,"!(" + String(this.distance[neighbor])  + " > " + String(this.distance[current]) + " + " + String(this.adj_matrix[current][neighbor]) + ")",
								TABLE_START_X + 4.3 * TABLE_ENTRY_WIDTH,TABLE_START_Y + neighbor*TABLE_ENTRY_HEIGHT);
						}

					}
					else
					{
						if (this.distance[neighbor] < 0 || this.distance[neighbor] > this.adj_matrix[current][neighbor])
						{
							this.cmd("CreateLabel", this.comparisonMessageID, distString + " > " + String(this.adj_matrix[current][neighbor]),
								TABLE_START_X + 4.3 * TABLE_ENTRY_WIDTH,TABLE_START_Y + neighbor*TABLE_ENTRY_HEIGHT);
						}
						else
						{
							this.cmd("CreateLabel",  this.comparisonMessageID,"!(" + String(this.distance[neighbor])  + " > " + String(this.adj_matrix[current][neighbor]) + ")",
								TABLE_START_X + 4.3 * TABLE_ENTRY_WIDTH,TABLE_START_Y + neighbor*TABLE_ENTRY_HEIGHT);
						}


					}


				}

				this.cmd("Step");
				this.cmd("Delete", this.comparisonMessageID);
				this.highlightEdge(current, neighbor, 0);
				if (this.known[neighbor])
				{
					this.cmd("SetHighlight", this.knownID[neighbor], 0);

				}
				else
				{
					this.cmd("SetHighlight", this.distanceID[current], 0);
					this.cmd("SetHighlight", this.distanceID[neighbor], 0);
					var compare;
					if (this.runningDijkstra)
					{
						compare = this.distance[current] + this.adj_matrix[current][neighbor];
					}
					else
					{
						compare = this.adj_matrix[current][neighbor];
					}
					if (this.distance[neighbor] < 0 || this.distance[neighbor] > compare)
					{
						this.distance[neighbor] =  compare;
						this.path[neighbor] = current;
						this.cmd("SetText", this.distanceID[neighbor],this.distance[neighbor] );
						this.cmd("SetText", this.pathID[neighbor],this.path[neighbor]);
					}
				}

			}
		}
		this.cmd("SetHighlight", this.circleID[current], 0);

	}
	// Running Dijkstra's algorithm, create the paths
	if (this.runningDijkstra)
	{
		this.cmd("SetText",this.message1ID, "Finding Paths in Table");
		this.createPaths();
	}
	// Running Prim's algorithm, highlight the tree
	else
	{
		this.cmd("SetText",this.message1ID, "Creating tree from table");
		this.highlightTree();
	}

       this.cmd("SetText",this.message1ID, "");
	return this.commands
}

DijkstraPrim.prototype.createPaths = function()
{
	for (var vertex = 0; vertex < this.size; vertex++)
	{
		var nextLabelID = this.nextIndex++;
		if (this.distance[vertex] < 0)
		{
			this.cmd("CreateLabel", nextLabelID, "No Path",  TABLE_START_X + 4.3 * TABLE_ENTRY_WIDTH,TABLE_START_Y + vertex*TABLE_ENTRY_HEIGHT);
			this.messageID.push(nextLabelID);
		}
		else
		{
			this.cmd("CreateLabel", nextLabelID, String.fromCharCode(65 + vertex),  TABLE_START_X + 4.3 * TABLE_ENTRY_WIDTH,TABLE_START_Y + vertex*TABLE_ENTRY_HEIGHT);
			this.messageID.push(nextLabelID);
			var pathList = [nextLabelID];
			var nextInPath = vertex;
			while (nextInPath >= 0)
			{
				this.cmd("SetHighlight", this.pathID[nextInPath], 1);
				this.cmd("Step");
				if (this.path[nextInPath] != -1)
				{
					nextLabelID = this.nextIndex++;
					this.cmd("CreateLabel", nextLabelID, String.fromCharCode(65 + this.path[nextInPath]),  TABLE_START_X + 3 * TABLE_ENTRY_WIDTH,TABLE_START_Y + nextInPath*TABLE_ENTRY_HEIGHT);
					this.cmd("Move", nextLabelID,  TABLE_START_X + 4.3 * TABLE_ENTRY_WIDTH,TABLE_START_Y + vertex*TABLE_ENTRY_HEIGHT);
					this.messageID.push(nextLabelID);
					for (var i = pathList.length - 1; i >= 0; i--)
					{
						this.cmd("Move", pathList[i], TABLE_START_X + 4.3 * TABLE_ENTRY_WIDTH + (pathList.length - i) * 17,TABLE_START_Y + vertex*TABLE_ENTRY_HEIGHT)

					}
					this.cmd("Step");
					pathList.push(nextLabelID);
				}
				this.cmd("SetHighlight", this.pathID[nextInPath], 0);
				nextInPath = this.path[nextInPath];

			}
		}
	}
}

DijkstraPrim.prototype.highlightTree = function()
{
	for (var vertex = 0; vertex < this.size; vertex++)
	{
		if (this.path[vertex] >= 0)
		{
			this.cmd("SetHighlight", this.vertexID[vertex], 1)
			this.cmd("SetHighlight", this.pathID[vertex], 1);
			this.highlightEdge(vertex, this.path[vertex], 1)
			this.highlightEdge(this.path[vertex], vertex, 1)
			this.cmd("Step");
			this.cmd("SetHighlight", this.vertexID[vertex], 0)
			this.cmd("SetHighlight", this.pathID[vertex], 0);
			this.highlightEdge(vertex, this.path[vertex], 0)
			this.highlightEdge(this.path[vertex], vertex, 0)
			this.setEdgeColor(vertex, this.path[vertex], "#FF0000");
			this.setEdgeColor(this.path[vertex], vertex,"#FF0000");
		}
	}
}

DijkstraPrim.prototype.reset = function()
{
	this.messageID = new Array();
}

DijkstraPrim.prototype.startCallback = function(event)
{
	var startValue;

	if (this.startField.value != "")
	{
		startvalue = this.startField.value;
		this.startField.value = "";
		startvalue = startvalue.toUpperCase().charCodeAt(0) - 65;
		if (startvalue < this.size)
			this.implementAction(this.doDijkstraPrim.bind(this),startvalue);
	}
}


DijkstraPrim.prototype.enableUI = function(event)
{
	this.startField.disabled = false;
	this.startButton.disabled = false;
	this.startButton


	DijkstraPrim.superclass.enableUI.call(this,event);
}
DijkstraPrim.prototype.disableUI = function(event)
{

	this.startField.disabled = true;
	this.startButton.disabled = true;

	DijkstraPrim.superclass.disableUI.call(this, event);
}


var currentAlg;

function init(runDijkstra)
{
	var animManag = initCanvas();
	currentAlg = new DijkstraPrim(animManag, runDijkstra, canvas.width, canvas.height);
}
