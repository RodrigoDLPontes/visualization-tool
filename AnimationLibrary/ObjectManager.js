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


// Object Manager
//
// Manage all of our animated objects.  Control any animated object should occur through
// this interface (not language enforced, because enforcing such things in Javascript is
// problematic.)
//
// This class is only accessed through:
//
//  AnimationMain
//  Undo objects (which are themselves controlled by AnimationMain


// TODO:
//       1.  Add proper throws for all error conditions (perhaps guarded by
//           an assert-like structure that can be turned off for production?)
//       2.  Refactor this code so that it uses the same object syntax (with
//           prototypes) as te rest of the code.  (low priority)
function ObjectManager()
{
	this.Nodes = [];
	this.Edges = [];
	this.BackEdges = [];
	this.activeLayers = [];
	this.activeLayers[0] = true;
	this.ctx = document.getElementById('canvas').getContext('2d');
	this.framenum = 0;
	this.width = 0;
	this.height = 0;
	this.statusReport = new AnimatedLabel(-1, "XXX", false, 30);
	this.statusReport.x = 30;

	this.draw = function()
	{
		this.framenum++;
		if (this.framenum > 1000)
			this.framenum = 0;

		this.ctx.clearRect(0,0,this.width,this.height); // clear canvas
		this.statusReport.y = this.height - 15;

		var i;
		var j;
		for (i = 0; i < this.Nodes.length; i++)
		{
			if (this.Nodes[i] != null && !this.Nodes[i].highlighted && this.Nodes[i].addedToScene && !this.Nodes[i].alwaysOnTop)
			{
				this.Nodes[i].draw(this.ctx);
			}
		}
		for (i = 0; i < this.Nodes.length; i++)
		{
			if (this.Nodes[i] != null && (this.Nodes[i].highlighted && !this.Nodes[i].alwaysOnTop) && this.Nodes[i].addedToScene)
			{
				this.Nodes[i].pulseHighlight(this.framenum);
				this.Nodes[i].draw(this.ctx);
			}
		}

		for (i = 0; i < this.Nodes.length; i++)
		{
			if (this.Nodes[i] != null && this.Nodes[i].alwaysOnTop && this.Nodes[i].addedToScene)
			{
				this.Nodes[i].pulseHighlight(this.framenum);
				this.Nodes[i].draw(this.ctx);
			}
		}


		for (i = 0; i < this.Edges.length; i++)
		{
			if (this.Edges[i] != null)
			{
				for (j = 0; j < this.Edges[i].length; j++)
				{
					if (this.Edges[i][j].addedToScene)
					{
						this.Edges[i][j].pulseHighlight(this.framenum);
						this.Edges[i][j].draw(this.ctx);
					}

				}

			}
		}
		this.statusReport.draw(this.ctx);

	}

	this.update = function ()
	{


	}


	this.setLayers = function(shown,layers)
	{
		for (var i = 0; i < layers.length; i++)
		{
			this.activeLayers[layers[i]] = shown;
		}
		this.resetLayers();

	}


	this.addHighlightCircleObject = function(objectID, objectColor, radius)
	{
		if (this.Nodes[objectID] != null && this.Nodes[objectID] != undefined)
		{
  	            throw "addHighlightCircleObject:Object with same ID (" + String(objectID) + ") already Exists!"
		}
		var newNode = new HighlightCircle(objectID, objectColor, radius)
		this.Nodes[objectID] = newNode;
	}

	this.setEdgeAlpha = function(fromID, toID, alphaVal)
	{
		var oldAlpha = 1.0;
		if (this.Edges[fromID] != null &&
			this.Edges[fromID] != undefined)
		{
			var len = this.Edges[fromID].length;
			for (var i = len - 1; i >= 0; i--)
			{
				if (this.Edges[fromID][i] != null &&
					this.Edges[fromID][i] != undefined &&
					this.Edges[fromID][i].Node2 == this.Nodes[toID])
				{
					oldAlpha = this.Edges[fromID][i].alpha
					this.Edges[fromID][i].alpha = alphaVal;
				}
			}
		}
		return oldAlpha;

	}

	this.setAlpha = function(nodeID, alphaVal)
	{
		if (this.Nodes[nodeID] != null && this.Nodes[nodeID] != undefined)
		{
			this.Nodes[nodeID].setAlpha(alphaVal);
		}
	}

	this.getAlpha = function(nodeID)
	{
		if (this.Nodes[nodeID] != null && this.Nodes[nodeID] != undefined)
		{
			return this.Nodes[nodeID].getAlpha();
		}
		else
		{
			return -1;
		}
	}

	this.getTextColor = function(nodeID, index)
	{
		if (this.Nodes[nodeID] != null && this.Nodes[nodeID] != undefined)
		{
			return this.Nodes[nodeID].getTextColor(index);
		}
		else
		{
			return "#000000";
		}

	}

	this.setTextColor = function(nodeID, color, index)
	{
		if (this.Nodes[nodeID] != null && this.Nodes[nodeID] != undefined)
		{
			this.Nodes[nodeID].setTextColor(color, index);
		}
	}


	this.setHighlightIndex = function(nodeID, index)
	{
		if (this.Nodes[nodeID] != null && this.Nodes[nodeID] != undefined)
		{
			this.Nodes[nodeID].setHighlightIndex(index);
		}
	}





	this.setAllLayers = function(layers)
	{
		this.activeLayers = [];
		for(var i = 0; i < layers.length; i++)
		{
			this.activeLayers[layers[i]] = true;
		}
		this.resetLayers();
	}

	this.resetLayers = function()
	{
		var i
		for (i = 0; i <this.Nodes.length; i++)
		{
			if (this.Nodes[i] != null && this.Nodes[i] != undefined)
			{
				this.Nodes[i].addedToScene = this.activeLayers[this.Nodes[i].layer] == true;
			}
		}
		for (i = this.Edges.length - 1; i >= 0; i--)
		{
		    if (this.Edges[i] != null && this.Edges[i] != undefined)
			{
				for (var j = 0; j < this.Edges[i].length; j++)
				{
					if (this.Edges[i][j] != null && this.Edges[i][j] != undefined)
					{
							this.Edges[i][j].addedToScene =
								this.activeLayers[this.Edges[i][j].Node1.layer] == true &&
								this.activeLayers[this.Edges[i][j].Node2.layer] == true;
					}

				}

			}

		}

	}



	this.setLayer = function(objectID, layer)
	{
		if (this.Nodes[objectID] != null && this.Nodes[objectID] != undefined)
		{
			this.Nodes[objectID].layer = layer;
			if (this.activeLayers[layer])
			{
				this.Nodes[objectID].addedToScene = true;
			}
			else
			{
				this.Nodes[objectID].addedToScene = false;
			}
			if (this.Edges[objectID] != null && this.Edges[objectID] != undefined)
			{
				for (var i = 0; i < this.Edges[objectID].length; i++)
				{
					var nextEdge = this.Edges[objectID][i];
					if (nextEdge != null && nextEdge != undefined)
					{
						nextEdge.addedToScene = ((nextEdge.Node1.addedToScene) &&
												(nextEdge.Node2.addedToScene));

					}
				}
			}
			if (this.BackEdges[objectID] != null && this.BackEdges[objectID] != undefined)
			{
				for (var i = 0; i < this.BackEdges[objectID].length; i++)
				{
					var nextEdge = this.BackEdges[objectID][i];
					if (nextEdge != null && nextEdge != undefined)
					{
						nextEdge.addedToScene = ((nextEdge.Node1.addedToScene) &&
												 (nextEdge.Node2.addedToScene));

					}
				}
			}
		}
	}

	this.clearAllObjects = function()
	{
		this.Nodes = [];
		this.Edges = [];
		this.BackEdges = [];
	}


	this.setForegroundColor = function(objectID, color)
	{
		if (this.Nodes[objectID] != null && this.Nodes[objectID] != undefined)
		{
			this.Nodes[objectID].setForegroundColor(color);

		}
	}

	this.setBackgroundColor = function(objectID, color)
	{
		if (this.Nodes[objectID] != null)
		{
			this.Nodes[objectID].setBackgroundColor(color);

		}
	}

	this.setHighlight = function(nodeID, val)
	{
		if (this.Nodes[nodeID] == null  || this.Nodes[nodeID] == undefined)
		{
			// TODO:  Error here?
			return;
		}
		this.Nodes[nodeID].setHighlight(val);
	}


	this.getHighlight = function(nodeID)
	{
		if (this.Nodes[nodeID] == null  || this.Nodes[nodeID] == undefined)
		{
			// TODO:  Error here?
			return false;
		}
		return this.Nodes[nodeID].getHighlight();
	}


	this.getHighlightIndex = function(nodeID)
	{
		if (this.Nodes[nodeID] == null  || this.Nodes[nodeID] == undefined)
		{
			// TODO:  Error here?
			return false;
		}
		return this.Nodes[nodeID].getHighlightIndex();
	}

	this.setWidth = function(nodeID, val)
	{
		if (this.Nodes[nodeID] == null  || this.Nodes[nodeID] == undefined)
		{
			// TODO:  Error here?
			return;
		}
		this.Nodes[nodeID].setWidth(val);
	}

	this.setHeight = function(nodeID, val)
	{
		if (this.Nodes[nodeID] == null  || this.Nodes[nodeID] == undefined)
		{
			// TODO:  Error here?
			return;
		}
		this.Nodes[nodeID].setHeight(val);
	}


	this.getHeight = function(nodeID)
	{
		if (this.Nodes[nodeID] == null  || this.Nodes[nodeID] == undefined)
		{
			// TODO:  Error here?
			return -1;
		}
		return this.Nodes[nodeID].getHeight();
	}

	this.getWidth = function(nodeID)
	{
		if (this.Nodes[nodeID] == null  || this.Nodes[nodeID] == undefined)
		{
			// TODO:  Error here?
			return -1;
		}
		return this.Nodes[nodeID].getWidth();
	}

	this.backgroundColor = function(objectID)
	{
		if (this.Nodes[objectID] != null)
		{
			return this.Nodes[objectID].backgroundColor;
		}
		else
		{
			return '#000000';
		}
	}

	this.foregroundColor = function(objectID)
	{
		if (this.Nodes[objectID] != null)
		{
			return this.Nodes[objectID].foregroundColor;
		}
		else
		{
			return '#000000';
		}
	}


	this.disconnect = function(objectIDfrom,objectIDto)
	{
		var undo = null;
		var i;
		if (this.Edges[objectIDfrom] != null)
		{
			var len = this.Edges[objectIDfrom].length;
			for (i = len - 1; i >= 0; i--)
			{
				if (this.Edges[objectIDfrom][i] != null && this.Edges[objectIDfrom][i].Node2 == this.Nodes[objectIDto])
				{
					var deleted = this.Edges[objectIDfrom][i];
					undo = deleted.createUndoDisconnect();
					this.Edges[objectIDfrom][i] = this.Edges[objectIDfrom][len - 1];
					len -= 1;
					this.Edges[objectIDfrom].pop();
				}
			}
		}
		if (this.BackEdges[objectIDto] != null)
		{
			len = this.BackEdges[objectIDto].length;
			for (i = len - 1; i >= 0; i--)
			{
				if (this.BackEdges[objectIDto][i] != null && this.BackEdges[objectIDto][i].Node1 == this.Nodes[objectIDfrom])
				{
					deleted = this.BackEdges[objectIDto][i];
					// Note:  Don't need to remove this child, did it above on the regular edge
					this.BackEdges[objectIDto][i] = this.BackEdges[objectIDto][len - 1];
					len -= 1;
					this.BackEdges[objectIDto].pop();
				}
			}
		}
		return undo;
	}

	this.deleteIncident = function(objectID)
	{
		var undoStack = [];

		if (this.Edges[objectID] != null)
		{
			var len = this.Edges[objectID].length;
			for (var i = len - 1; i >= 0; i--)
			{
				var deleted = this.Edges[objectID][i];
				var node2ID = deleted.Node2.identifier();
				undoStack.push(deleted.createUndoDisconnect());

				var len2 = this.BackEdges[node2ID].length;
				for (var j = len2 - 1; j >=0; j--)
				{
					if (this.BackEdges[node2ID][j] == deleted)
					{
						this.BackEdges[node2ID][j] = this.BackEdges[node2ID][len2 - 1];
						len2 -= 1;
						this.BackEdges[node2ID].pop();
					}
				}
			}
			this.Edges[objectID] = null;
		}
		if (this.BackEdges[objectID] != null)
		{
			len = this.BackEdges[objectID].length;
			for (i = len - 1; i >= 0; i--)
			{
				deleted = this.BackEdges[objectID][i];
				var node1ID = deleted.Node1.identifier();
				undoStack.push(deleted.createUndoDisconnect());

				len2 = this.Edges[node1ID].length;
				for (j = len2 - 1; j >=0; j--)
				{
					if (this.Edges[node1ID][j] == deleted)
					{
						this.Edges[node1ID][j] = this.Edges[node1ID][len2 - 1];
						len2 -= 1;
						this.Edges[node1ID].pop();
					}
				}
			}
			this.BackEdges[objectID] = null;
		}
		return undoStack;
	}


	this.removeObject = function(ObjectID)
	{
		var OldObject = this.Nodes[ObjectID];
		if (ObjectID == this.Nodes.length - 1)
		{
			this.Nodes.pop();
		}
		else
		{
			this.Nodes[ObjectID] = null;
		}
	}

	this.getObject = function(objectID)
	{
		if (this.Nodes[objectID] == null || this.Nodes[objectID] == undefined)
		{
			throw "getObject:Object with ID (" + String(objectID) + ") does not exist"
		}
		return this.Nodes[objectID];

	}


	this.addCircleObject = function (objectID, objectLabel)
	{
			if (this.Nodes[objectID] != null && this.Nodes[objectID] != undefined)
			{
				throw "addCircleObject:Object with same ID (" + String(objectID) + ") already Exists!"
			}
			var newNode = new AnimatedCircle(objectID, objectLabel);
			this.Nodes[objectID] = newNode;
	}

	this.getNodeX = function(nodeID)
	{
		if (this.Nodes[nodeID] == null || this.Nodes[nodeID] == undefined)
		{
			throw "getting x position of an object that does not exit";
		}
		return this.Nodes[nodeID].x;
	}

	this.getTextWidth = function(text)
	{
		// TODO:  Need to make fonts more flexible, and less hardwired.
		this.ctx.font = '10px sans-serif';
		if (text==undefined)
		{
			w = 3;
		}
		var strList = text.split("\n");
		var width = 0;
		if (strList.length == 1)
		{
 			width = this.ctx.measureText(text).width;
		}
		else
		{
			for (var i = 0; i < strList.length; i++)
			{
				width = Math.max(width, this.ctx.measureText(strList[i]).width);
			}
		}

		return width;
	}

	this.setText = function(nodeID, text, index)
	{
		if (this.Nodes[nodeID] == null || this.Nodes[nodeID] == undefined)
		{
			return;
			throw "setting text of an object that does not exit";
		}
		this.Nodes[nodeID].setText(text, index, this.getTextWidth(text));

	}

	this.getText = function(nodeID, index)
	{
		if (this.Nodes[nodeID] == null || this.Nodes[nodeID] == undefined)
		{
			throw "getting text of an object that does not exit";
		}
		return this.Nodes[nodeID].getText(index);

	}

	this.getNodeY = function(nodeID)
	{
		if (this.Nodes[nodeID] == null || this.Nodes[nodeID] == undefined)
		{
			throw "getting y position of an object that does not exit";
		}
		return this.Nodes[nodeID].y;
	}


	this.connectEdge = function(objectIDfrom, objectIDto, color, curve, directed, lab, connectionPoint)
	{
		var fromObj = this.Nodes[objectIDfrom];
		var toObj = this.Nodes[objectIDto];
		if (fromObj == null || toObj == null)
		{
			throw "Tried to connect two nodes, one didn't exist!";
		}
		var l = new Line(fromObj,toObj, color, curve, directed, lab, connectionPoint);
		if (this.Edges[objectIDfrom] == null || this.Edges[objectIDfrom] == undefined)
		{
			this.Edges[objectIDfrom] = [];
		}
		if (this.BackEdges[objectIDto] == null || this.BackEdges[objectIDto] == undefined)
		{
			this.BackEdges[objectIDto] = [];
		}
		l.addedToScene = fromObj.addedToScene && toObj.addedToScene;
		this.Edges[objectIDfrom].push(l);
		this.BackEdges[objectIDto].push(l);

	}


	this.setNull = function(objectID, nullVal)
	{
		if (this.Nodes[objectID] != null && this.Nodes[objectID] != undefined)
		{
			this.Nodes[objectID].setNull(nullVal);
		}
	}

	this.setPrevNull = function(objectID, nullVal)
	{
		if (this.Nodes[objectID] != null && this.Nodes[objectID] != undefined)
		{
			this.Nodes[objectID].setPrevNull(nullVal);
		}
	}

	this.setNextNull = function(objectID, nullVal)
	{
		if (this.Nodes[objectID] != null && this.Nodes[objectID] != undefined)
		{
			this.Nodes[objectID].setNextNull(nullVal);
		}
	}

	this.getNull = function(objectID)
	{
		if (this.Nodes[objectID] != null && this.Nodes[objectID] != undefined)
		{
			return this.Nodes[objectID].getNull();
		}
		return false;  // TODO:  Error here?
	}

	this.getLeftNull = function(objectID)
	{
		if (this.Nodes[objectID] != null && this.Nodes[objectID] != undefined)
		{
			return this.Nodes[objectID].getLeftNull();
		}
		return false;  // TODO:  Error here?
	}

	this.getRightNull = function(objectID)
	{
		if (this.Nodes[objectID] != null && this.Nodes[objectID] != undefined)
		{
			return this.Nodes[objectID].getRightNull();
		}
		return false;  // TODO:  Error here?
	}



	this.setEdgeColor = function(fromID, toID, color) // returns old color
	{
		var oldColor ="#000000";
		if (this.Edges[fromID] != null &&
			this.Edges[fromID] != undefined)
		{
			var len = this.Edges[fromID].length;
			for (var i = len - 1; i >= 0; i--)
			{
				if (this.Edges[fromID][i] != null &&
					this.Edges[fromID][i] != undefined &&
					this.Edges[fromID][i].Node2 == this.Nodes[toID])
				{
					oldColor = this.Edges[fromID][i].color();
					this.Edges[fromID][i].setColor(color);
				}
			}
		}
		return oldColor;
	}

	this.alignTop = function(id1, id2)
	{
		if (this.Nodes[id1] == null || this.Nodes[id1] == undefined ||
			this.Nodes[id2] == null || this.Nodes[id2] == undefined)
		{
			throw "Tring to align two nodes, one doesn't exist: " + String(id1) + "," + String(id2);
		}
		this.Nodes[id1].alignTop(this.Nodes[id2]);
	}

	this.alignLeft = function(id1, id2)
	{
		if (this.Nodes[id1] == null || this.Nodes[id1] == undefined ||
			this.Nodes[id2] == null || this.Nodes[id2] == undefined)
		{
			throw "Tring to align two nodes, one doesn't exist: " + String(id1) + "," + String(id2);
		}
		this.Nodes[id1].alignLeft(this.Nodes[id2]);
	}

	this.alignRight = function(id1, id2)
	{
		if (this.Nodes[id1] == null || this.Nodes[id1] == undefined ||
			this.Nodes[id2] == null || this.Nodes[id2] == undefined)
		{
			throw "Tring to align two nodes, one doesn't exist: " + String(id1) + "," + String(id2);
		}
		this.Nodes[id1].alignRight(this.Nodes[id2]);
	}



	this.getAlignRightPos = function(id1, id2)
	{
		if (this.Nodes[id1] == null || this.Nodes[id1] == undefined ||
			this.Nodes[id2] == null || this.Nodes[id2] == undefined)
		{
			throw "Tring to align two nodes, one doesn't exist: " + String(id1) + "," + String(id2);
		}
	        return this.Nodes[id1].getAlignRightPos(this.Nodes[id2]);
	}

	this.getAlignLeftPos = function(id1, id2)
	{
		if (this.Nodes[id1] == null || this.Nodes[id1] == undefined ||
			this.Nodes[id2] == null || this.Nodes[id2] == undefined)
		{
			throw "Tring to align two nodes, one doesn't exist: " + String(id1) + "," + String(id2);
		}
	        return this.Nodes[id1].getAlignLeftPos(this.Nodes[id2]);
	}



	this.alignBottom = function(id1, id2)
	{
		if (this.Nodes[id1] == null || this.Nodes[id1] == undefined ||
			this.Nodes[id2] == null || this.Nodes[id2] == undefined)
		{
			throw "Tring to align two nodes, one doesn't exist: " + String(id1) + "," + String(id2);
		}
		this.Nodes[id1].alignBottom(this.Nodes[id2]);
	}


	this.setEdgeHighlight = function(fromID, toID, val) // returns old color
	{
		var oldHighlight = false;
		if (this.Edges[fromID] != null &&
			this.Edges[fromID] != undefined)
		{
			var len = this.Edges[fromID].length;
			for (var i = len - 1; i >= 0; i--)
			{
				if (this.Edges[fromID][i] != null &&
					this.Edges[fromID][i] != undefined &&
					this.Edges[fromID][i].Node2 == this.Nodes[toID])
				{
					oldHighlight = this.Edges[fromID][i].highlighted;
					this.Edges[fromID][i].setHighlight(val);
				}
			}
		}
		return oldHighlight;
	}
	this.addLabelObject = function(objectID, objectLabel, centering)
	{
		if (this.Nodes[objectID] != null && this.Nodes[objectID] != undefined)
		{
			throw new Error("addLabelObject: Object Already Exists!");
		}

		var newLabel = new AnimatedLabel(objectID, objectLabel, centering, this.getTextWidth(objectLabel));
		this.Nodes[objectID] = newLabel;
	}


	this.addLinkedListObject = function(objectID, nodeLabel, width, height, linkPer, verticalOrientation, linkPosEnd, numLabels, backgroundColor, foregroundColor)
	{
		if (this.Nodes[objectID] != null)
		{
			throw new Error("addLinkedListObject:Object with same ID already Exists!");
			return;
		}
		var newNode  = new AnimatedLinkedList(objectID, nodeLabel, width, height, linkPer, verticalOrientation, linkPosEnd, numLabels, backgroundColor, foregroundColor);
		this.Nodes[objectID] = newNode;
	}

	this.addDoublyLinkedListObject = function(objectID, nodeLabel, width, height, linkPer, numLabels, backgroundColor, foregroundColor)
	{
		if (this.Nodes[objectID] != null)
		{
			throw new Error("addDoublyLinkedListObject:Object with same ID already Exists!");
			return;
		}
		var newNode  = new AnimatedDoublyLinkedList(objectID, nodeLabel, width, height, linkPer, numLabels, backgroundColor, foregroundColor);
		this.Nodes[objectID] = newNode;
	}

	this.addCircularlyLinkedListObject = function(objectID, nodeLabel, width, height, linkPer, numLabels, backgroundColor, foregroundColor)
	{
		if (this.Nodes[objectID] != null)
		{
			throw new Error("addCircularlyLinkedListObject:Object with same ID already Exists!");
			return;
		}
		var newNode  = new AnimatedCircularlyLinkedList(objectID, nodeLabel, width, height, linkPer, numLabels, backgroundColor, foregroundColor);
		this.Nodes[objectID] = newNode;
	}

	this.addSkipListObject = function(objectID, nodeLabel, width, height, labelColor, backgroundColor, foregroundColor)
	{
		if (this.Nodes[objectID] != null)
		{
			throw new Error("addSkipListObject:Object with same ID already Exists!");
			return;
		}
		var newNode  = new AnimatedSkipList(objectID, nodeLabel, width, height, labelColor, backgroundColor, foregroundColor);
		this.Nodes[objectID] = newNode;
	}


	this.getNumElements = function(objectID)
	{
		return this.Nodes[objectID].getNumElements();
	}


	this.setNumElements = function(objectID, numElems)
	{
		this.Nodes[objectID].setNumElements(numElems);
	}
	this.addBTreeNode = function(objectID, widthPerElem, height, numElems, backgroundColor, foregroundColor)
	 {
		 backgroundColor = (backgroundColor == undefined) ? "#FFFFFF" : backgroundColor;
		 foregroundColor = (foregroundColor == undefined) ? "#FFFFFF" : foregroundColor;

		 if (this.Nodes[objectID] != null && Nodes[objectID] != undefined)
		 {
			 throw "addBTreeNode:Object with same ID already Exists!";
		 }

		 var newNode = new AnimatedBTreeNode(objectID,widthPerElem, height, numElems, backgroundColor, foregroundColor);
		 this.Nodes[objectID] = newNode;
	 }

	 this.addRectangleObject = function(objectID,nodeLabel, width, height, xJustify , yJustify , backgroundColor, foregroundColor)
	 {
		 if (this.Nodes[objectID] != null || this.Nodes[objectID] != undefined)
		 {
			 throw new Error("addRectangleObject:Object with same ID already Exists!");
		 }
		 var newNode = new AnimatedRectangle(objectID, nodeLabel, width, height, xJustify, yJustify, backgroundColor, foregroundColor);
		 this.Nodes[objectID] = newNode;

	 }




	this.setNodePosition = function(nodeID, newX, newY)
	{
		if (this.Nodes[nodeID] == null || this.Nodes[nodeID] == undefined)
		{
			// TODO:  Error here?
			return;
		}
		if (newX == undefined || newY == undefined)
		{

			return;
		}
		this.Nodes[nodeID].x = newX;
		this.Nodes[nodeID].y = newY;
		/* Don't need to dirty anything, since we repaint everything every frame
		 (TODO:  Revisit if we do conditional redraws)
		 }*/

	}

}
