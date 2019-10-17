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
// FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL David Galles OR
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



function ChangeCoordinate3D(am, w, h)
{
	this.init(am, w, h);
}


ChangeCoordinate3D.prototype = new Algorithm();
ChangeCoordinate3D.prototype.constructor = ChangeCoordinate3D;
ChangeCoordinate3D.superclass = Algorithm.prototype;

ChangeCoordinate3D.XAxisYPos = 300;
ChangeCoordinate3D.XAxisStart = 100;
ChangeCoordinate3D.XAxisEnd = 700;

ChangeCoordinate3D.MATRIX_ELEM_WIDTH = 40;
ChangeCoordinate3D.MATRIX_ELEM_HEIGHT = 15;


ChangeCoordinate3D.MATRIX_MULTIPLY_SPACING = 5;
ChangeCoordinate3D.EQUALS_SPACING = 20;

ChangeCoordinate3D.ROBOT_MATRIX_START_X = 10 + 3 * ChangeCoordinate3D.MATRIX_ELEM_WIDTH + ChangeCoordinate3D.MATRIX_MULTIPLY_SPACING;
ChangeCoordinate3D.ROBOT_MATRIX_START_Y = 30;

ChangeCoordinate3D.HAND_MATRIX_START_X = 10 +3 * ChangeCoordinate3D.MATRIX_ELEM_WIDTH + ChangeCoordinate3D.MATRIX_MULTIPLY_SPACING;
ChangeCoordinate3D.HAND_MATRIX_START_Y = 10 + 25 + 20 + 20 +  3*ChangeCoordinate3D.MATRIX_ELEM_HEIGHT;


ChangeCoordinate3D.ROBOT_POSITION_START_X = ChangeCoordinate3D.ROBOT_MATRIX_START_X + 5*ChangeCoordinate3D.MATRIX_ELEM_WIDTH + 100;
ChangeCoordinate3D.HAND_POSITION_START_X = ChangeCoordinate3D.HAND_MATRIX_START_X + 5*ChangeCoordinate3D.MATRIX_ELEM_WIDTH + 100;


ChangeCoordinate3D.ROBOT_POSITION_START_Y = ChangeCoordinate3D.ROBOT_MATRIX_START_Y;
ChangeCoordinate3D.HAND_POSITION_START_Y = ChangeCoordinate3D.HAND_MATRIX_START_Y;


ChangeCoordinate3D.YAxisXPos = 400;
ChangeCoordinate3D.YAxisStart = 100;
ChangeCoordinate3D.YAxisEnd = 500;

ChangeCoordinate3D.ROBOT_POINTS = [[-15,5,100],[15,5,100],[15, 5,80],[30,5,80],[30,5,-10],[15,5,-10], [15,5, -100], [0,5,-100],[0,5,-30],[0,5,-100], [-15,5, -100],
								   [-15,5,-10], [-30, 5,-10], [-30, 5, 80],[-15, 5, 80], [-15, 5, 100],

								   [-15,-5,100],[15,-5,100],[15, -5,80],[30,-5,80],[30,-5,-10],[15,-5,-10], [15,-5, -100], [0,-5,-100],[0,-5,-30],[0,-5,-100], [-15,-5, -100],
								   [-15,-5,-10], [-30, -5,-10], [-30, -5, 80],[-15, -5, 80], [-15, -5, 100]];

ChangeCoordinate3D.ROBOT_EXTRA_CONNECTIONS = [[0, 16], [1, 17], [2, 18], [3, 19], [4, 20], [5, 21], [6, 22], [7, 23], [8, 24], [9, 25],
											  [10, 26], [11, 27], [12, 28], [13, 29], [14, 30], [15, 31]];



ChangeCoordinate3D.HAND_POINTS = [[0,3, 0],[-10,3, 0],[-10,3, 10], [-6, 3,10], [-6, 3,6], [6, 3,6], [6, 3, 10], [10, 3, 10], [10, 3, 0],[0,3,0],
								  [0,-3, 0],[-10,-3, 0],[-10,-3, 10], [-6, -3,10], [-6, -3,6], [6, -3,6], [6, -3, 10], [10, -3, 10], [10, -3, 0],[0,-3,0]];



ChangeCoordinate3D.HAND_EXTRA_CONNECTIONS = [[0,  10], [1, 11], [2, 12], [3, 13], [4, 14], [5, 15], [6, 16], [7, 17], [8, 18], [9, 19]]; 


ChangeCoordinate3D.ROBOT_HAND_ATTACH_POINT = [0, 0,40];


ChangeCoordinate3D.M1 = [[Math.cos(3*Math.PI / 4), Math.sin(3*Math.PI/4), 0],[-Math.sin(3*Math.PI/4), Math.cos(3*Math.PI/4), 0],[0,0,1]];
ChangeCoordinate3D.M2 = [[Math.cos(3*Math.PI / 4), 0, Math.sin(3*Math.PI/4)],[0,1,0], [-Math.sin(3*Math.PI/4), 0, Math.cos(3*Math.PI/4)]];
ChangeCoordinate3D.M3 = [[1,0,0], [0, Math.cos(3*Math.PI / 4), Math.sin(3*Math.PI/4)],[0, -Math.sin(3*Math.PI/4), Math.cos(3*Math.PI/4)]];



ChangeCoordinate3D.ROBOT_MATRIX_VALUES = [
										  [[1,0,0],[0, Math.cos(Math.PI / 6), Math.sin(Math.PI / 6)],[0, -Math.sin(Math.PI / 6), Math.cos(Math.PI / 6)]],
										  [[Math.cos(Math.PI / 4), Math.sin(Math.PI / 4), 0],[-Math.sin(Math.PI / 4), Math.cos(Math.PI / 4), 0], [0,0,1]],
										  [[Math.cos(0), Math.sin(0), 0],[-Math.sin(0), Math.cos(0), 0], [0, 0, 1]],
										  [[Math.cos(3*Math.PI / 4), Math.sin(3*Math.PI/4), 0],[-Math.sin(3*Math.PI/4), Math.cos(3*Math.PI/4), 0],[0,0,1]],
										  multiply(ChangeCoordinate3D.M2, ChangeCoordinate3D.M3)
										  
		                                 ];


ChangeCoordinate3D.ROBOT_POSITION_VALUES = [[75,0, 40], [200,100, 30],[100,100, 0], [100, 200, 0], [40,50,50]];


ChangeCoordinate3D.HAND_MATRIX_VALUES = [
										 [[Math.cos(-Math.PI / 4),0, Math.sin(-Math.PI / 4)],[0,1,0],[-Math.sin(-Math.PI / 4), 0, Math.cos(-Math.PI / 4)]],
										 [[Math.cos(Math.PI / 4), Math.sin(Math.PI / 4), 0],[-Math.sin(Math.PI / 4), Math.cos(-Math.PI / 4), 0], [0,0,1]],
										 [[Math.cos(0), Math.sin(0), 0],[-Math.sin(0), Math.cos(0), 0], [0,0,1]],
										 [[Math.cos(Math.PI/2), Math.sin(Math.PI/2), 0],[-Math.sin(Math.PI/2), Math.cos(Math.PI/2), 0], [0,0,1]],
										  multiply(ChangeCoordinate3D.M1, ChangeCoordinate3D.M2)
										];


ChangeCoordinate3D.HAND_POSITION_VALUES = [[80,0, 20],[30,90, 0],[100,100, 0],[-50, -20, 0], [50,10,20]];


//ChangeCoordinate3D.ROBOT_POINTS = [[-20, 40], [20,40],[
									

ChangeCoordinate3D.CAMERA_TRANS_ANGLE = toRadians(30);
ChangeCoordinate3D.L = 0.5;

ChangeCoordinate3D.CAMERA_TRANSFORM = [[1, 0, 0],
								  [ChangeCoordinate3D.L * Math.cos(ChangeCoordinate3D.CAMERA_TRANS_ANGLE), 0, ChangeCoordinate3D.L * Math.sin(ChangeCoordinate3D.CAMERA_TRANS_ANGLE)],
								  [0, 0, 1]];


ChangeCoordinate3D.AXIS_CENTER = [[750,470],[750,150],[100, 550]]; 

ChangeCoordinate3D.AXIS_COLOR_0 = "#990000"
ChangeCoordinate3D.AXIS_COLOR_1 = "#009900"
ChangeCoordinate3D.AXIS_COLOR_2 = "#000099"

ChangeCoordinate3D.LOCAL_VERTEX_FOREGORUND_COLOR = "#000000";
ChangeCoordinate3D.LOCAL_VERTEX_BACKGROUND_COLOR = ChangeCoordinate3D.LOCAL_VERTEX_FOREGORUND_COLOR;
ChangeCoordinate3D.LOCAL_EDGE_COLOR = "#000000";

ChangeCoordinate3D.GLOBAL_VERTEX_FOREGORUND_COLOR = "#00FF00";
ChangeCoordinate3D.GLOBAL_VERTEX_BACKGROUND_COLOR = ChangeCoordinate3D.GLOBAL_VERTEX_FOREGORUND_COLOR;
ChangeCoordinate3D.GLOBAL_EDGE_COLOR = "#00FF00";



ChangeCoordinate3D.TRANSFORMED_VERTEX_FOREGORUND_COLOR = "#66FF66";
ChangeCoordinate3D.TRANSFORMED_VERTEX_BACKGROUND_COLOR = ChangeCoordinate3D.VERTEX_FOREGORUND_COLOR;
ChangeCoordinate3D.TRANSFORMED_EDGE_COLOR = "#66FF66";


ChangeCoordinate3D.TRANSFORMED_POINT_COLORS = ["#990000", "#009900", "#000099"]


ChangeCoordinate3D.VECTOR_COLOR = "#FF0000";

ChangeCoordinate3D.VERTEX_WIDTH = 3;
ChangeCoordinate3D.VERTEX_HEIGHT = ChangeCoordinate3D.VERTEX_WIDTH;

ChangeCoordinate3D.prototype.init = function(am, w, h)
{
	var sc = ChangeCoordinate3D.superclass.init.call(this, am, w, h);
	this.rowMajor = true;
	this.posYUp = true;
	this.rotateFirst = true;
	this.addControls();
	this.currentShape = 0;
	
	this.cameraTransform = ChangeCoordinate3D.CAMERA_TRANSFORM;

	this.commands = [];
	this.nextIndex = 0;
	
	this.PositionIndex = 0;
	
	this.RobotPositionValues = ChangeCoordinate3D.ROBOT_POSITION_VALUES[this.PositionIndex];
	this.RobotMatrixValues = ChangeCoordinate3D.ROBOT_MATRIX_VALUES[this.PositionIndex];
	this.HandPositionValues = ChangeCoordinate3D.HAND_POSITION_VALUES[this.PositionIndex];
	this.HandMatrixValues = ChangeCoordinate3D.HAND_MATRIX_VALUES[this.PositionIndex];

	this.setupAxis();

	this.robotLabel1ID = this.nextIndex++;
	this.handLabel1ID = this.nextIndex++;
	this.robotLabel2ID = this.nextIndex++;
	this.handLabel2ID = this.nextIndex++;
	
	this.cmd("CreateLabel", this.robotLabel1ID, "Robot Space to World Space\n(Orientation)", ChangeCoordinate3D.ROBOT_MATRIX_START_X, ChangeCoordinate3D.ROBOT_MATRIX_START_Y - 25, 0);
	this.cmd("SetForegroundColor", this.robotLabel1ID, "#0000FF");

	this.cmd("CreateLabel", this.robotLabel2ID, "Robot Space to World Space\n(Position)", ChangeCoordinate3D.ROBOT_POSITION_START_X, ChangeCoordinate3D.ROBOT_MATRIX_START_Y - 25, 0);
	this.cmd("SetForegroundColor", this.robotLabel2ID, "#0000FF");
	
	
	
	this.RobotMatrix = this.createMatrix(this.RobotMatrixValues, ChangeCoordinate3D.ROBOT_MATRIX_START_X, ChangeCoordinate3D.ROBOT_MATRIX_START_Y);
	this.resetMatrixLabels(this.RobotMatrix);
	this.HandMatrix = this.createMatrix(this.HandMatrixValues, ChangeCoordinate3D.HAND_MATRIX_START_X, ChangeCoordinate3D.HAND_MATRIX_START_Y);
	this.resetMatrixLabels(this.HandMatrix);

	this.cmd("CreateLabel", this.handLabel1ID, "Hand Space to Robot Space\n(Orientation)", ChangeCoordinate3D.HAND_MATRIX_START_X, ChangeCoordinate3D.HAND_MATRIX_START_Y - 25, 0);
	this.cmd("SetForegroundColor", this.handLabel1ID, "#0000FF");

	this.cmd("CreateLabel", this.handLabel2ID, "Hand Space to Robot Space\n(Position)", ChangeCoordinate3D.HAND_POSITION_START_X, ChangeCoordinate3D.HAND_MATRIX_START_Y - 25, 0);
	this.cmd("SetForegroundColor", this.handLabel2ID, "#0000FF");
	
	
	
	this.RobotPosition = this.createMatrix([this.RobotPositionValues], ChangeCoordinate3D.ROBOT_POSITION_START_X, ChangeCoordinate3D.ROBOT_POSITION_START_Y);
	this.resetMatrixLabels(this.RobotMatrix);
	this.HandPosition = this.createMatrix([this.HandPositionValues], ChangeCoordinate3D.HAND_POSITION_START_X, ChangeCoordinate3D.HAND_POSITION_START_Y);
	this.resetMatrixLabels(this.HandMatrix);
	
	
	var i;
	this.RobotPointWorldIDs = new Array(ChangeCoordinate3D.ROBOT_POINTS.length);
	this.RobotPointRobotIDs = new Array(ChangeCoordinate3D.ROBOT_POINTS.length);
	this.HandPointWorldIDs = new Array(ChangeCoordinate3D.HAND_POINTS.length);
	this.HandPointRobotIDs = new Array(ChangeCoordinate3D.HAND_POINTS.length);
	this.HandPointHandIDs = new Array(ChangeCoordinate3D.HAND_POINTS.length);
	this.RobotHandAttachRobotID = this.nextIndex++;
	this.RobotHandAttachWorldID = this.nextIndex++;
	for (i = 0; i < ChangeCoordinate3D.ROBOT_POINTS.length; i++)
	{
		this.RobotPointWorldIDs[i] = this.nextIndex++;		
		this.RobotPointRobotIDs[i] = this.nextIndex++;		
	}
	for (i = 0; i < ChangeCoordinate3D.HAND_POINTS.length; i++)
	{
		this.HandPointWorldIDs[i] = this.nextIndex++;
		this.HandPointRobotIDs[i] = this.nextIndex++;
		this.HandPointHandIDs[i] = this.nextIndex++;		
	}
	
	this.savedNextIndex = this.nextIndex;
	this.setupObjects();
	this.setupObjectGraphic();

	this.animationManager.StartNewAnimation(this.commands);
	this.animationManager.skipForward();
	this.animationManager.clearHistory();
	this.clearHistory();
	this.animationManager.setAllLayers([0, 1]);
	this.lastLocalToGlobal = true;
	this.oldIDs = [];
	
	
}

ChangeCoordinate3D.prototype.addAxis = function(origin, x1, x2, y1, y2, z1, z2, color)
{
	var idArray = [];
	var originID = this.nextIndex++;
	idArray.push(originID);
	this.cmd("CreateRectangle", originID, "", 0, 0, origin[0], origin[1]);
	this.cmd("SetAlpha", originID, 0);
	
	var axisID = this.nextIndex++;
	this.cmd("CreateRectangle", axisID, "", 0, 0, x1[0], x1[1]);
	this.cmd("SetAlpha", axisID, 0);
	this.cmd("Connect", originID, axisID, color, 0, 1, "");
	idArray.push(axisID);
	
	axisID = this.nextIndex++;
	this.cmd("CreateRectangle", axisID, "", 0, 0, x2[0], x2[1]);
	this.cmd("SetAlpha", axisID, 0);
	this.cmd("Connect", originID, axisID, color, 0, 1, "");
	idArray.push(axisID);

	axisID = this.nextIndex++;
	this.cmd("CreateRectangle", axisID, "", 0, 0, y1[0], y1[1]);
	this.cmd("SetAlpha", axisID, 0);
	this.cmd("Connect", originID, axisID, color, 0, 1, "");
	idArray.push(axisID);
	
	axisID = this.nextIndex++;
	this.cmd("CreateRectangle", axisID, "", 0, 0, y2[0], y2[1]);
	this.cmd("SetAlpha", axisID, 0);
	this.cmd("Connect", originID, axisID, color, 0, 1, "");
	idArray.push(axisID);
	
	axisID = this.nextIndex++;
	this.cmd("CreateRectangle", axisID, "", 0, 0, z1[0], z1[1]);
	this.cmd("SetAlpha", axisID, 0);
	this.cmd("Connect", originID, axisID, color, 0, 1, "");
	idArray.push(axisID);
	
	axisID = this.nextIndex++;
	this.cmd("CreateRectangle", axisID, "", 0, 0, z2[0], z2[1]);
	this.cmd("SetAlpha", axisID, 0);
	this.cmd("Connect", originID, axisID, color, 0, 1, "");
	idArray.push(axisID);
	
	

	var labelID = this.nextIndex++;
	this.cmd("CreateLabel", labelID, "+y", y2[0] - 10, y2[1] + 10);
	this.cmd("SetForegroundColor", labelID, color);
	idArray.push(labelID);


	labelID = this.nextIndex++;
	this.cmd("CreateLabel", labelID, "+x", x2[0] - 10, x2[1] + 10);
	this.cmd("SetForegroundColor", labelID, color);
	idArray.push(labelID);
	
	
	labelID = this.nextIndex++;
	this.cmd("CreateLabel", labelID, "+z", z2[0] - 10, z2[1] + 10);
	this.cmd("SetForegroundColor", labelID, color);
	idArray.push(labelID);

	
	return idArray;
}


ChangeCoordinate3D.prototype.transformPoint = function(point, matrix, position)
{
	return this.add(multiply([point], matrix), [position])[0];
}


ChangeCoordinate3D.prototype.setupExtraAxes =  function()
{
	var robotOrigin = this.RobotPositionValues;
	var x1 = this.transformPoint([-150, 0, 0], this.RobotMatrixValues, this.RobotPositionValues);
	var x2 = this.transformPoint([150, 0, 0], this.RobotMatrixValues, this.RobotPositionValues);
	var y1 = this.transformPoint([0, -150, 0], this.RobotMatrixValues, this.RobotPositionValues);
	var y2 = this.transformPoint([0, 150, 0], this.RobotMatrixValues, this.RobotPositionValues);
	var z1 = this.transformPoint([0, 0, -150], this.RobotMatrixValues, this.RobotPositionValues);
	var z2 = this.transformPoint([0, 0, 150], this.RobotMatrixValues, this.RobotPositionValues);
	
	this.otherAxes = [];
	
	var tmpAxis = this.addAxis(this.worldToScreenSpace(robotOrigin, 2),
							   this.worldToScreenSpace(x1, 2),
							   this.worldToScreenSpace(x2, 2),
							   this.worldToScreenSpace(y1, 2),
							   this.worldToScreenSpace(y2, 2),
							   this.worldToScreenSpace(z1, 2),
							   this.worldToScreenSpace(z2, 2),
							   ChangeCoordinate3D.AXIS_COLOR_1);
	
	this.otherAxes.push(tmpAxis);
	
	for (var i = 0; i < tmpAxis.length; i++)
	{
		this.cmd("SetLayer", tmpAxis[i], 1);
	}
	this.setAxisAlpha(tmpAxis, 0.5);
	
	
	var handOrigin = this.HandPositionValues;
	x1 = this.transformPoint([-150, 0, 0], this.HandMatrixValues, this.HandPositionValues);
	x2 = this.transformPoint([150, 0, 0], this.HandMatrixValues, this.HandPositionValues);
	y1 = this.transformPoint([0, -150, 0], this.HandMatrixValues, this.HandPositionValues);
	y2 = this.transformPoint([0, 150, 0], this.HandMatrixValues, this.HandPositionValues);
	z1 = this.transformPoint([0, 0, -150], this.HandMatrixValues, this.HandPositionValues);
	z2 = this.transformPoint([0, 0, 150], this.HandMatrixValues, this.HandPositionValues);
	
	
	tmpAxis = this.addAxis(this.worldToScreenSpace(handOrigin, 1),
						   this.worldToScreenSpace(x1, 1),
						   this.worldToScreenSpace(x2, 1),
						   this.worldToScreenSpace(y1, 1),
						   this.worldToScreenSpace(y2, 1),
						   this.worldToScreenSpace(z1, 1),
						   this.worldToScreenSpace(z2, 1),
						   ChangeCoordinate3D.AXIS_COLOR_0);
	
	for (var i = 0; i < tmpAxis.length; i++)
	{
		this.cmd("SetLayer", tmpAxis[i], 1);
	}	
	this.setAxisAlpha(tmpAxis, 0.5);
	
	
	this.otherAxes.push(tmpAxis);

	
	handOrigin = this.transformPoint(handOrigin, this.RobotMatrixValues, this.RobotPositionValues);
	x1 = this.transformPoint(x1, this.RobotMatrixValues, this.RobotPositionValues);
	x2 = this.transformPoint(x2, this.RobotMatrixValues, this.RobotPositionValues);
	y1 = this.transformPoint(y1, this.RobotMatrixValues, this.RobotPositionValues);
	y2 = this.transformPoint(y2, this.RobotMatrixValues, this.RobotPositionValues);
	z1 = this.transformPoint(z1, this.RobotMatrixValues, this.RobotPositionValues);
	z2 = this.transformPoint(z2, this.RobotMatrixValues, this.RobotPositionValues);
	
	
	tmpAxis = this.addAxis(this.worldToScreenSpace(handOrigin, 2),
						   this.worldToScreenSpace(x1, 2),
						   this.worldToScreenSpace(x2, 2),
						   this.worldToScreenSpace(y1, 2),
						   this.worldToScreenSpace(y2, 2),
						   this.worldToScreenSpace(z1, 2),
						   this.worldToScreenSpace(z2, 2),
						   ChangeCoordinate3D.AXIS_COLOR_0);
	for (var i = 0; i < tmpAxis.length; i++)
	{
		this.cmd("SetLayer", tmpAxis[i], 1);
	}
	
	this.setAxisAlpha(tmpAxis, 0.5);
	
	this.otherAxes.push(tmpAxis);

}


ChangeCoordinate3D.prototype.setupAxis =  function()
{
	
	this.axisHand = 	this.addAxis(this.worldToScreenSpace([0,0,0], 0), 
									 this.worldToScreenSpace([-150, 0, 0], 0),
									 this.worldToScreenSpace([150,0, 0],  0),
									 this.worldToScreenSpace([0, -150, 0], 0),
									 this.worldToScreenSpace([0, 150, 0], 0),
									 this.worldToScreenSpace([0, 0, -150], 0),
									 this.worldToScreenSpace([0, 0, 150], 0),
									 ChangeCoordinate3D.AXIS_COLOR_0);
	this.setAxisAlpha(this.axisHand, 0.5);

	this.axisRobot = 	this.addAxis(this.worldToScreenSpace([0,0, 0], 1), 
									 this.worldToScreenSpace([-150, 0, 0], 1),
									 this.worldToScreenSpace([150,0, 0],  1),
									 this.worldToScreenSpace([0, -150, 0], 1),
									 this.worldToScreenSpace([0, 150, 0], 1),
									 this.worldToScreenSpace([0, 0, -150], 1),
									 this.worldToScreenSpace([0, 0, 150], 1),
									 ChangeCoordinate3D.AXIS_COLOR_1);
	this.setAxisAlpha(this.axisRobot, 0.5);

	this.axisWorld = 	this.addAxis(this.worldToScreenSpace([0,0, 0], 2), 
									 this.worldToScreenSpace([-50, 0, 0], 2),
									 this.worldToScreenSpace([400,0, 0],  2),
									 this.worldToScreenSpace([0, -50, 0], 2),
									 this.worldToScreenSpace([0, 400, 0], 2),
									 this.worldToScreenSpace([0, 0, -50], 2),
									 this.worldToScreenSpace([0, 0, 400], 2),
									 ChangeCoordinate3D.AXIS_COLOR_2);
	this.setAxisAlpha(this.axisWorld, 0.5);
	
	this.setupExtraAxes();
	
	

	
	
}


ChangeCoordinate3D.prototype.setAxisAlpha =  function(axisList, newAlpha)
{
	for (var i = 0; i < axisList.length; i++)
	{
		this.cmd("SetAlpha", axisList[i], newAlpha);
		if (i > 0)
		{
			this.cmd("SetEdgeAlpha", axisList[0], axisList[i], newAlpha);
		}
	}
	
}

ChangeCoordinate3D.prototype.setupObjects =  function()
{
		
	var i;
	for (i = 0; i < ChangeCoordinate3D.ROBOT_POINTS.length; i++)
	{
		
		
		var point = this.worldToScreenSpace(ChangeCoordinate3D.ROBOT_POINTS[i], 1);
		this.cmd("CreateRectangle", this.RobotPointRobotIDs[i], "", 0, 0, point[0], point[1]);
		if (i > 0)
		{
			this.cmd("Connect", this.RobotPointRobotIDs[i-1], this.RobotPointRobotIDs[i], "#000000", 0, 0);
		}
		
		point = this.transformPoint(ChangeCoordinate3D.ROBOT_POINTS[i], this.RobotMatrixValues, this.RobotPositionValues);
		point = this.worldToScreenSpace(point, 2);

		this.cmd("CreateRectangle", this.RobotPointWorldIDs[i], "", 0, 0, point[0], point[1]);
		if (i > 0)
		{
			this.cmd("Connect", this.RobotPointWorldIDs[i-1], this.RobotPointWorldIDs[i], "#000000", 0, 0);
		}		
	}
	
	for (var i = 0; i < ChangeCoordinate3D.ROBOT_EXTRA_CONNECTIONS.length; i++)
	{
		this.cmd("Connect", this.RobotPointRobotIDs[ChangeCoordinate3D.ROBOT_EXTRA_CONNECTIONS[i][0]], this.RobotPointRobotIDs[ChangeCoordinate3D.ROBOT_EXTRA_CONNECTIONS[i][1]], "#000000", 0, 0, "");		
		this.cmd("Connect", this.RobotPointWorldIDs[ChangeCoordinate3D.ROBOT_EXTRA_CONNECTIONS[i][0]], this.RobotPointWorldIDs[ChangeCoordinate3D.ROBOT_EXTRA_CONNECTIONS[i][1]], "#000000", 0, 0, "");		
	}
	

	
	for (i = 0; i < ChangeCoordinate3D.HAND_POINTS.length; i++)
	{
		
		
		var point = this.worldToScreenSpace(ChangeCoordinate3D.HAND_POINTS[i], 0);
		this.cmd("CreateRectangle", this.HandPointHandIDs[i], "", 0, 0, point[0], point[1]);
		if (i > 0)
		{
			this.cmd("Connect", this.HandPointHandIDs[i-1], this.HandPointHandIDs[i], "#000000", 0, 0);
		}
		
		point = this.transformPoint(ChangeCoordinate3D.HAND_POINTS[i], this.HandMatrixValues, this.HandPositionValues);
		var point2 = this.worldToScreenSpace(point, 1);
		
		this.cmd("CreateRectangle", this.HandPointRobotIDs[i], "", 0, 0, point2[0], point2[1]);
		if (i > 0)
		{
			this.cmd("Connect", this.HandPointRobotIDs[i-1], this.HandPointRobotIDs[i], "#000000", 0, 0);
		}
		
		point = this.transformPoint(point, this.RobotMatrixValues, this.RobotPositionValues);
		point = this.worldToScreenSpace(point,2);
		
		this.cmd("CreateRectangle", this.HandPointWorldIDs[i], "", 0, 0, point[0], point[1]);
		if (i > 0)
		{
			this.cmd("Connect", this.HandPointWorldIDs[i-1], this.HandPointWorldIDs[i], "#000000", 0, 0);
		}
	}
	for (var i = 0; i < ChangeCoordinate3D.HAND_EXTRA_CONNECTIONS.length; i++)
	{
		this.cmd("Connect", this.HandPointHandIDs[ChangeCoordinate3D.HAND_EXTRA_CONNECTIONS[i][0]], this.HandPointHandIDs[ChangeCoordinate3D.HAND_EXTRA_CONNECTIONS[i][1]], "#000000", 0, 0, "");		
		this.cmd("Connect", this.HandPointRobotIDs[ChangeCoordinate3D.HAND_EXTRA_CONNECTIONS[i][0]], this.HandPointRobotIDs[ChangeCoordinate3D.HAND_EXTRA_CONNECTIONS[i][1]], "#000000", 0, 0, "");		
		this.cmd("Connect", this.HandPointWorldIDs[ChangeCoordinate3D.HAND_EXTRA_CONNECTIONS[i][0]], this.HandPointWorldIDs[ChangeCoordinate3D.HAND_EXTRA_CONNECTIONS[i][1]], "#000000", 0, 0, "");		
	}
	
	
	
	point = this.worldToScreenSpace(ChangeCoordinate3D.ROBOT_HAND_ATTACH_POINT, 1);
	this.cmd("CreateRectangle", this.RobotHandAttachRobotID, "", 0, 0, point[0], point[1]);
	this.cmd("Connect", this.RobotHandAttachRobotID, this.HandPointRobotIDs[0], "#000000", 0, 0);

	point = this.transformPoint(ChangeCoordinate3D.ROBOT_HAND_ATTACH_POINT, this.RobotMatrixValues, this.RobotPositionValues);
	point = this.worldToScreenSpace(point, 2);
	this.cmd("CreateRectangle", this.RobotHandAttachWorldID, "", 0, 0, point[0], point[1]);
	this.cmd("Connect", this.RobotHandAttachWorldID, this.HandPointWorldIDs[0], "#000000", 0, 0);
}



ChangeCoordinate3D.prototype.worldToScreenSpace = function(point, space)
{
	var transformedPoint = multiply([point], this.cameraTransform)[0];
	var worldSpace = new Array(2);
	worldSpace[0] = transformedPoint[0] + ChangeCoordinate3D.AXIS_CENTER[space][0];
	worldSpace[1] =  ChangeCoordinate3D.AXIS_CENTER[space][1] - transformedPoint[2];
	
	return worldSpace;
}




ChangeCoordinate3D.prototype.removeOldIDs = function()
{
	var i;
	for (i = 0; i < this.oldIDs.length; i++)
	{
		this.cmd("Delete", this.oldIDs[i]);
	}
	this.oldIDs = [];
}



ChangeCoordinate3D.prototype.setupObjectGraphic =  function()
{
	var i;
	

	

}

ChangeCoordinate3D.prototype.addControls =  function()
{
	this.controls = [];
	
	addLabelToAlgorithmBar("x");
						   
	this.xField = addControlToAlgorithmBar("Text", "");
	this.xField.onkeydown = this.returnSubmitFloat(this.xField,  this.transformPointCallback.bind(this), 4, true);
	this.controls.push(this.xField);
	
	addLabelToAlgorithmBar("y");
	
	this.yField = addControlToAlgorithmBar("Text", "");
	this.yField.onkeydown = this.returnSubmitFloat(this.yField,  this.transformPointCallback.bind(this), 4, true);
	this.controls.push(this.yField);
	
	
	addLabelToAlgorithmBar("z");
	
	this.zField = addControlToAlgorithmBar("Text", "");
	this.zField.onkeydown = this.returnSubmitFloat(this.zField,  this.transformPointCallback.bind(this), 4, true);
	this.controls.push(this.zField);
	

	var transformButton = addControlToAlgorithmBar("Button", "Transform Point");
	transformButton.onclick = this.transformPointCallback.bind(this);
	this.controls.push(transformButton);
	
	
	
	
	var radioButtonList = addRadioButtonGroupToAlgorithmBar(["Hand Space -> World Space", 
															 "World Space -> Hand Space", 
															 ], 
															"Transform Type");
	this.handToWorldButton = radioButtonList[0];
	this.handToWorldButton.onclick = this.transformTypeChangedCallback.bind(this, false);
	this.controls.push(this.handToWorldButton);
	
	
	this.worldToHandButton = radioButtonList[1];
	this.worldToHandButton.onclick = this.transformTypeChangedCallback.bind(this, true);
	this.controls.push(this.worldToHandButton);
	
	this.worldToHandButton.checked = this.lastLocalToGlobal;
	this.handToWorldButton.checked = !this.lastLocalToGlobal;

	
	
	
	var radioButtonList = addRadioButtonGroupToAlgorithmBar(["Row Major", 
															 "Column Major", 
															 ], 
															"RankType");
	this.rowMajorButton = radioButtonList[0];
	this.rowMajorButton.onclick = this.changeRowColMajorCallback.bind(this, true);
	this.controls.push(this.rowMajorButton);

	this.colMajorButton = radioButtonList[1];
	this.colMajorButton.onclick = this.changeRowColMajorCallback.bind(this, false);
	this.controls.push(this.colMajorButton);
	
	this.rowMajorButton.checked = this.rowMajor;
	this.colMajorButton.checked = !this.rowMajor;
	
	
	this.showAxisBox = addCheckboxToAlgorithmBar("Show all axes");
	this.showAxisBox.onclick = this.showAllAxesCallback.bind(this);
	this.showAxisBox.checked = true;
	
	//this.controls.push(this.showAxisBox);
	
	

	var moveObjectsButton = addControlToAlgorithmBar("Button", "Move Objects");
	moveObjectsButton.onclick = this.moveObjectsCallback.bind(this);
	
	this.controls.push(moveObjectsButton);
	
}



ChangeCoordinate3D.prototype.showAllAxesCallback = function()
{
	if (this.showAxisBox.checked)
	{
		this.animationManager.setAllLayers([0,1]);		
	}
	else
	{
		this.animationManager.setAllLayers([0]);				
	}
	
	
}


ChangeCoordinate3D.prototype.reset = function()
{
	this.rowMajor = true;
	this.rowMajorButton.checked = this.rowMajor;
	this.nextIndex = this.savedNextIndex;
}


ChangeCoordinate3D.prototype.enableUI = function(event)
{
	for (var i = 0; i < this.controls.length; i++)
	{
		this.controls[i].disabled = false;
	}
	
	
}
ChangeCoordinate3D.prototype.disableUI = function(event)
{
	for (var i = 0; i < this.controls.length; i++)
	{
		this.controls[i].disabled = true;
	}
}


ChangeCoordinate3D.prototype.transformTypeChangedCallback = function(globalToLocal)
{
	if (this.lastLocalToGlobal == globalToLocal)
	{
		this.implementAction(this.changeTransformType.bind(this,globalToLocal));			
	}
}


							 

ChangeCoordinate3D.prototype.changeRowColMajorCallback = function(rowMajor) 
{
	if (this.rowMajor != rowMajor)
	{
		this.implementAction(this.changeRowCol.bind(this),  rowMajor);
	}
}

ChangeCoordinate3D.prototype.transposeVisual = function(matrix)
{
	if (matrix.data.length == matrix.data[0].length)
	{
		var matrixSize = matrix.data.length;
		var i, j, tmp, moveLabel1, moveLabel2;
		var moveLabels = [];
		for (i = 1; i < matrixSize; i++)
		{
			for (j = 0; j <= i; j++)
			{
				this.cmd("SetText", matrix.dataID[i][j], "");
				this.cmd("SetText", matrix.dataID[j][i], "");
				moveLabel1 = this.nextIndex++;
				moveLabel2 = this.nextIndex++;
				moveLabels.push(moveLabel1);
				moveLabels.push(moveLabel2);
				this.cmd("CreateLabel", moveLabel1, 
						 this.standardize(matrix.data[i][j]), matrix.x + ChangeCoordinate3D.MATRIX_ELEM_WIDTH / 2+ i * ChangeCoordinate3D.MATRIX_ELEM_WIDTH,
						 matrix.y  + ChangeCoordinate3D.MATRIX_ELEM_HEIGHT / 2+  j * ChangeCoordinate3D.MATRIX_ELEM_HEIGHT);
				this.cmd("CreateLabel", moveLabel2, 
						 this.standardize(matrix.data[j][i]), matrix.x + ChangeCoordinate3D.MATRIX_ELEM_WIDTH / 2+ j * ChangeCoordinate3D.MATRIX_ELEM_WIDTH, 
						 matrix.y + ChangeCoordinate3D.MATRIX_ELEM_HEIGHT / 2 +  i * ChangeCoordinate3D.MATRIX_ELEM_HEIGHT);
				this.cmd("Move", moveLabel1, matrix.x + ChangeCoordinate3D.MATRIX_ELEM_WIDTH / 2+ j * ChangeCoordinate3D.MATRIX_ELEM_WIDTH, 
						 matrix.y + ChangeCoordinate3D.MATRIX_ELEM_HEIGHT / 2 +  i * ChangeCoordinate3D.MATRIX_ELEM_HEIGHT);
				this.cmd("Move", moveLabel2, matrix.x + ChangeCoordinate3D.MATRIX_ELEM_WIDTH / 2+  i * ChangeCoordinate3D.MATRIX_ELEM_WIDTH, 
						 matrix.y + ChangeCoordinate3D.MATRIX_ELEM_HEIGHT / 2 +  j * ChangeCoordinate3D.MATRIX_ELEM_HEIGHT);
				tmp = matrix.data[i][j];
				matrix.data[i][j] = matrix.data[j][i];
				matrix.data[j][i] = tmp;
			}
		}
		this.cmd("Step");
		for (i = 0; i < moveLabels.length; i++)
		{
			this.cmd("Delete", moveLabels[i]);
		}
		this.resetMatrixLabels(matrix);
		return matrix;
	}
	else
	{
		var savedData = matrix.data;
		var newData = new Array(savedData[0].length);
		var i,j;
		for (i = 0; i < savedData[0].length; i++)
		{
			newData[i] = [];
		}
		for (i = 0; i < savedData.length; i++)
		{	
			for (j = 0; j < savedData[0].length; j++)
			{
				newData[j][i] = savedData[i][j];
			}
			
		}
		var newMatrix = this.createMatrix(newData, matrix.x, matrix.y);
		this.deleteMatrix(matrix);
		return newMatrix;		
	}
}

ChangeCoordinate3D.prototype.changeRowCol = function(rowMajor)
{
	this.commands = new Array();
	this.rowMajor= rowMajor;		
	if (this.rowMajorButton.checked != this.rowMajor)
	{
		this.rowMajorButton.checked = this.rowMajor;
	}
	if (this.colMajorButton.checked == this.rowMajor)
	{
		this.colMajorButton.checked = !this.rowMajor;
	}
	this.removeOldIDs();	
	this.RobotMatrix = this.transposeVisual(this.RobotMatrix);
	this.RobotPosition = this.transposeVisual(this.RobotPosition);
	this.HandMatrix = this.transposeVisual(this.HandMatrix);
	this.HandPosition = this.transposeVisual(this.HandPosition);
	
	
	return this.commands;				
}


ChangeCoordinate3D.prototype.fixNumber = function(value, defaultVal)
{
		if (value == "" || value == "-" || value == "." || value == "-." || isNaN(parseFloat(value)))
		{
			value = defaultVal;
		}
		else
		{
			value = String(parseFloat(value));
		}
		return value
}

ChangeCoordinate3D.prototype.transformPointCallback = function()
{
	
	
	this.xField.value = this.fixNumber(this.xField.value, "0");
	this.yField.value = this.fixNumber(this.yField.value, "0");
	this.zField.value = this.fixNumber(this.zField.value, "0");
	this.implementAction(this.doPointTransform.bind(this), this.xField.value + ";" + this.yField.value + ";" + this.zField.value);
	
}


ChangeCoordinate3D.prototype.doPointTransform = function(params)
{
	if (this.lastLocalToGlobal)
	{
		return this.localToGlobal(params);
	}
	else
	{
		return this.globalToLocal(params);
	}
}





ChangeCoordinate3D.prototype.rotatePoint = function(point, matrix, xPos, yPos, fromSpace, toSpace)
{
	var logicalPoint;
	var descriptLabel = this.nextIndex++;
	// this.oldIDs.push(descriptLabel);
	if (this.rowMajor)
	{
	this.cmd("CreateLabel", descriptLabel, "", xPos + 3 * ChangeCoordinate3D.MATRIX_ELEM_WIDTH + ChangeCoordinate3D.EQUALS_SPACING,
			 yPos + 2*ChangeCoordinate3D.MATRIX_ELEM_HEIGHT + 3, 0);
	}
	else
	{
		this.cmd("CreateLabel", descriptLabel, "", xPos + 3 * ChangeCoordinate3D.MATRIX_ELEM_WIDTH + ChangeCoordinate3D.EQUALS_SPACING,
				 yPos + 3*ChangeCoordinate3D.MATRIX_ELEM_HEIGHT + 3, 0);
		
	}
	
	var inertialPositionMatrix;
	
	if (this.rowMajor)
	{
		inertialPositionMatrix =  this.createMatrix([["", "", ""]], xPos + 3 * ChangeCoordinate3D.MATRIX_ELEM_WIDTH + ChangeCoordinate3D.EQUALS_SPACING, 
													yPos);
	}
	else
	{
		inertialPositionMatrix =  this.createMatrix([[""], [""], [""]], 
													xPos + 4 * ChangeCoordinate3D.MATRIX_ELEM_WIDTH + ChangeCoordinate3D.EQUALS_SPACING + ChangeCoordinate3D.MATRIX_MULTIPLY_SPACING, 
													yPos);
		
	}
	var equalLabel1 = this.nextIndex++;
	this.oldIDs.push(equalLabel1);
	if (this.rowMajor)
	{
		opX = xPos + 3 * ChangeCoordinate3D.MATRIX_ELEM_WIDTH + ChangeCoordinate3D.EQUALS_SPACING / 2;
		opY = yPos + ChangeCoordinate3D.MATRIX_ELEM_HEIGHT / 2;
	}
	else
	{
		opX = xPos + 4 * ChangeCoordinate3D.MATRIX_ELEM_WIDTH + ChangeCoordinate3D.EQUALS_SPACING / 2 + ChangeCoordinate3D.MATRIX_MULTIPLY_SPACING;
		opY = yPos + ChangeCoordinate3D.MATRIX_ELEM_HEIGHT;
		
		
	}
	
	this.cmd("CreateLabel", equalLabel1, "=", opX , opY);
	if (this.rowMajor)
	{
		this.multiplyMatrix(point, matrix, inertialPositionMatrix, descriptLabel, 2);
		
	}
	else
	{
		this.multiplyMatrix(matrix, point, inertialPositionMatrix, descriptLabel, 2);
		
	}
	this.addMatrixIDsToList(inertialPositionMatrix, this.oldIDs);
	this.cmd("Delete", descriptLabel);
	var inertialPositionID = this.nextIndex++;
	if (this.rowMajor)
	{
		logicalPoint = inertialPositionMatrix.data[0].slice(0);
		
	}
	else
	{
		logicalPoint =  [inertialPositionMatrix.data[0][0], inertialPositionMatrix.data[1][0], inertialPositionMatrix.data[2][0]];		
	}
	screenPoint = this.worldToScreenSpace(logicalPoint, fromSpace);
	

	this.cmd("CreateCircle", inertialPositionID, "", screenPoint[0], screenPoint[1]);
	this.cmd("SetWidth", inertialPositionID, ChangeCoordinate3D.VERTEX_WIDTH);
	
	var originID = this.nextIndex++;
	this.oldIDs.push(originID);
	var origin  = this.worldToScreenSpace([0,0,0], fromSpace); 
	
	
	this.cmd("CreateRectangle", originID, "", 0, 0, origin[0], origin[1]);
	
	this.cmd("Connect", originID, inertialPositionID, ChangeCoordinate3D.TRANSFORMED_POINT_COLORS[toSpace], 0, 1, "");
	
	
	return [inertialPositionMatrix, inertialPositionID, originID];
}

ChangeCoordinate3D.prototype.translatePoint = function(point, transVector, xPos, yPos, fromSpace, toSpace, pointID)
{
	var logicalPoint = new Array(2);
	var robotPositionMatrix;
	if (this.rowMajor)
	{
		logicalPoint[0] = point.data[0][0] + transVector.data[0][0];
		logicalPoint[1] = point.data[0][1] +  transVector.data[0][1];
		logicalPoint[2] = point.data[0][2] +  transVector.data[0][2];
		robotPositionMatrix = this.createMatrix([["", "", ""]], xPos + 3*ChangeCoordinate3D.MATRIX_ELEM_WIDTH + ChangeCoordinate3D.EQUALS_SPACING, 
												yPos);
	}
	else
	{
		logicalPoint[0] = point.data[0][0] + transVector.data[0][0];
		logicalPoint[1] = point.data[1][0] +  transVector.data[1][0];
		logicalPoint[2] = point.data[2][0] +  transVector.data[2][0];
		robotPositionMatrix = this.createMatrix([[""],[""], [""]], xPos + ChangeCoordinate3D.MATRIX_ELEM_WIDTH + ChangeCoordinate3D.EQUALS_SPACING, 
												yPos);
		
	}
	
	var addLabel1 = this.nextIndex++;
	var equalLabel3 = this.nextIndex++;
	this.oldIDs.push(addLabel1);
	this.oldIDs.push(equalLabel3);
	var op2X, op2Y;
	if (this.rowMajor)
	{
		opX = xPos + 3*ChangeCoordinate3D.MATRIX_ELEM_WIDTH + ChangeCoordinate3D.EQUALS_SPACING / 2;
		opY = yPos + ChangeCoordinate3D.MATRIX_ELEM_HEIGHT / 2;
		op2X = xPos - ChangeCoordinate3D.EQUALS_SPACING / 2;
		op2Y = yPos + ChangeCoordinate3D.MATRIX_ELEM_HEIGHT / 2;
		
	}
	else
	{
		opX = xPos + ChangeCoordinate3D.MATRIX_ELEM_WIDTH + ChangeCoordinate3D.EQUALS_SPACING / 2;
		opY = yPos + ChangeCoordinate3D.MATRIX_ELEM_HEIGHT;
		op2X = xPos - ChangeCoordinate3D.EQUALS_SPACING / 2;
		op2Y = yPos + ChangeCoordinate3D.MATRIX_ELEM_HEIGHT;
		
		
	}
	this.cmd("CreateLabel", equalLabel3, "=",opX , opY);
	this.cmd("CreateLabel", addLabel1, "+",op2X , op2Y);
	
	
	
	
	this.addMatrix(point, transVector, robotPositionMatrix, 2);
	this.addMatrixIDsToList(robotPositionMatrix, this.oldIDs);
	
	var screenPoint = this.worldToScreenSpace(logicalPoint, fromSpace);
	
	var robotPositionID = this.nextIndex++;
	
	this.cmd("CreateCircle", robotPositionID, "", screenPoint[0], screenPoint[1]);
	this.cmd("SetWidth", robotPositionID, ChangeCoordinate3D.VERTEX_WIDTH);
	
	
	this.cmd("Connect",pointID, robotPositionID, ChangeCoordinate3D.TRANSFORMED_POINT_COLORS[toSpace], 0, 1, "");
	this.cmd("Step")
	
	
	
	var originID = this.nextIndex++;
	this.oldIDs.push(originID);
	var origin  = this.worldToScreenSpace([0,0, 0], fromSpace); 
	
	this.cmd("CreateCircle", originID, "", origin[0], origin[1]);
	this.cmd("SetWidth", originID, 0);
	this.cmd("SetAlpha", originID, 0);

	this.cmd("Connect",originID, robotPositionID, ChangeCoordinate3D.TRANSFORMED_POINT_COLORS[toSpace], 0, 1, "");
	
	return [robotPositionMatrix, robotPositionID, originID];
	
	
}


ChangeCoordinate3D.prototype.addMultiply = function(position, transVector, rotMatrix, transX, transY, rotX, rotY, initialPointID, fromSpace, toSpace)
{
	
	var posMatrixAndPointID = this.translatePoint(position, transVector, transX, transY, fromSpace, toSpace, initialPointID);
	var newPosition = posMatrixAndPointID[0];
	var pointID = posMatrixAndPointID[1];
	var originID = posMatrixAndPointID[2];
	
	this.cmd("Step");
	
	this.cmd("Disconnect", initialPointID, pointID);

	if (this.rowMajor)
	{
		this.moveMatrix(newPosition, rotX - 3 * ChangeCoordinate3D.MATRIX_ELEM_WIDTH - ChangeCoordinate3D.MATRIX_MULTIPLY_SPACING,transY)
	}
	else
	{
		this.moveMatrix(newPosition, rotX +  3 * ChangeCoordinate3D.MATRIX_ELEM_WIDTH + ChangeCoordinate3D.MATRIX_MULTIPLY_SPACING, transY)		
	}
	
	
	var posMatrixAndPointID =  this.rotatePoint(newPosition, rotMatrix, rotX, rotY, fromSpace, toSpace);
	this.cmd("Delete", pointID);
	this.cmd("Step");
	
	var robotPositionMatrix = posMatrixAndPointID[0];
	var robotPositionID = posMatrixAndPointID[1];
	var movingOriginID = posMatrixAndPointID[2];
	
	var origin = this.worldToScreenSpace([0,0, 0], toSpace);
	this.cmd("Move", movingOriginID, origin[0], origin[1]);
	
	
	var logicalPoint;
	if (this.rowMajor)
	{
		logicalPoint = robotPositionMatrix.data[0].slice(0);
		
	}
	else
	{
		logicalPoint =  [robotPositionMatrix.data[0][0], robotPositionMatrix.data[1][0], robotPositionMatrix.data[2][0]];		
	}
	
	
	
	
	var screenPoint = this.worldToScreenSpace(logicalPoint, toSpace);
	this.cmd("Move", robotPositionID, screenPoint[0], screenPoint[1]);
	
	this.cmd("Step");
	
	
	this.oldIDs.push(robotPositionID);

	
	return [robotPositionMatrix, robotPositionID ];
}


ChangeCoordinate3D.prototype.multiplyAdd = function(position, rotMatrix, transVector, rotX, rotY, transX, transY, fromSpace, toSpace)
{
	var posMatrixAndPointID =  this.rotatePoint(position, rotMatrix, rotX, rotY, fromSpace, toSpace);
	var inertialPositionMatrix = posMatrixAndPointID[0];
	var inertialPositionID = posMatrixAndPointID[1];
	

	this.cmd("Step");
	
	if (this.rowMajor)
	{
		this.moveMatrix(inertialPositionMatrix, transX - 3 * ChangeCoordinate3D.MATRIX_ELEM_WIDTH - ChangeCoordinate3D.EQUALS_SPACING,transY)
	}
	else
	{
		this.moveMatrix(inertialPositionMatrix, transX -  ChangeCoordinate3D.MATRIX_ELEM_WIDTH - ChangeCoordinate3D.EQUALS_SPACING, transY)		
	}
	
	
	posMatrixAndPointID = this.translatePoint(inertialPositionMatrix, transVector, transX, transY, fromSpace, toSpace, inertialPositionID);
	var robotPositionMatrix = posMatrixAndPointID[0];
	var robotPositionID = posMatrixAndPointID[1];
	var movingOriginID = posMatrixAndPointID[2];
	
	this.oldIDs.push(robotPositionID);

	var logicalPoint;
	if (this.rowMajor)
	{
		logicalPoint = robotPositionMatrix.data[0].slice(0);
		
	}
	else
	{	
		logicalPoint =  [robotPositionMatrix.data[0][0], robotPositionMatrix.data[1][0], robotPositionMatrix.data[2][0]];		
	}
	
	
	this.cmd("Step");
	
	this.cmd("Delete", inertialPositionID);
	origin = this.worldToScreenSpace([0,0, 0], toSpace);
	this.cmd("Move", movingOriginID, origin[0], origin[1]);
	screenPoint = this.worldToScreenSpace(logicalPoint, toSpace);
	this.cmd("Move", robotPositionID, screenPoint[0], screenPoint[1]);
	
	this.cmd("Step");
	return robotPositionMatrix;
	
}

ChangeCoordinate3D.prototype.localToGlobal = function (params)
{
	this.commands = [];
	this.removeOldIDs();
	
	
	var paramList = params.split(";");
	var x = parseFloat(paramList[0]);
	var y = parseFloat(paramList[1]);
	var z = parseFloat(paramList[2]);
	
	var opX, opY;

		
	var screenPoint = this.worldToScreenSpace([x,y,z], 0);
	var logicalPoint;

	var pointInHandSpaceID = this.nextIndex++;
	this.oldIDs.push(pointInHandSpaceID);
	
	this.cmd("CreateCircle", pointInHandSpaceID, "", screenPoint[0], screenPoint[1]);
	this.cmd("SetWidth", pointInHandSpaceID, ChangeCoordinate3D.VERTEX_WIDTH);
	
	this.cmd("Connect", this.axisHand[0], pointInHandSpaceID, ChangeCoordinate3D.TRANSFORMED_POINT_COLORS[0], 0, 1, "");
	
	var initialPointMatrix;
	if (this.rowMajor)
	{
		initialPointMatrix = this.createMatrix([[x, y, z]], ChangeCoordinate3D.HAND_MATRIX_START_X - 3 * ChangeCoordinate3D.MATRIX_ELEM_WIDTH - ChangeCoordinate3D.MATRIX_MULTIPLY_SPACING, 
									  ChangeCoordinate3D.HAND_MATRIX_START_Y);		
	}
	else
	{
		initialPointMatrix = this.createMatrix([[x], [y], [z]], ChangeCoordinate3D.HAND_MATRIX_START_X + 3 * ChangeCoordinate3D.MATRIX_ELEM_WIDTH + ChangeCoordinate3D.MATRIX_MULTIPLY_SPACING, 
											   ChangeCoordinate3D.HAND_MATRIX_START_Y);		
		
	}
	this.addMatrixIDsToList(initialPointMatrix, this.oldIDs);
	this.cmd("Step");
	
	var robotPositionMatrix = this.multiplyAdd(initialPointMatrix, this.HandMatrix, this.HandPosition,
													  ChangeCoordinate3D.HAND_MATRIX_START_X, ChangeCoordinate3D.HAND_MATRIX_START_Y,
													  ChangeCoordinate3D.HAND_POSITION_START_X, ChangeCoordinate3D.HAND_POSITION_START_Y,
													  0, 1);
	
													  
	

	if (this.rowMajor)
	{
		this.moveMatrix(robotPositionMatrix,  ChangeCoordinate3D.ROBOT_MATRIX_START_X - 3 * ChangeCoordinate3D.MATRIX_ELEM_WIDTH - ChangeCoordinate3D.MATRIX_MULTIPLY_SPACING, 
						ChangeCoordinate3D.ROBOT_MATRIX_START_Y);
	}
	else
	{
		this.moveMatrix(robotPositionMatrix,  ChangeCoordinate3D.ROBOT_MATRIX_START_X + 3* ChangeCoordinate3D.MATRIX_ELEM_WIDTH + ChangeCoordinate3D.MATRIX_MULTIPLY_SPACING, 
						ChangeCoordinate3D.ROBOT_MATRIX_START_Y);
		
	}

	
	this.multiplyAdd(robotPositionMatrix, this.RobotMatrix, this.RobotPosition,
					 ChangeCoordinate3D.ROBOT_MATRIX_START_X, ChangeCoordinate3D.ROBOT_MATRIX_START_Y,
					 ChangeCoordinate3D.ROBOT_POSITION_START_X, ChangeCoordinate3D.ROBOT_POSITION_START_Y,
					 1, 2);
		
	
	
	
	
	return this.commands;
}

ChangeCoordinate3D.prototype.changeTransformType = function(globalToLocal)
{
	this.commands = [];
	this.lastLocalToGlobal = !globalToLocal;
	this.removeOldIDs();
	if (globalToLocal)
	{
		this.cmd("SetText", this.robotLabel1ID, "World Space to Robot Space\n(Orientation)");

	}
	else
	{
		this.cmd("SetText", this.robotLabel1ID, "Robot Space to World Space\n(Orientation)");
	}
	this.cmd("Step");
	this.RobotMatrix = this.transposeVisual(this.RobotMatrix)
	
	if (globalToLocal)
	{
		this.cmd("SetText", this.robotLabel2ID, "World Space to Robot Space\n(Position)");
		
	}
	else
	{
		this.cmd("SetText", this.robotLabel2ID, "Robot Space to World Space\n(Position)");
	}
	this.cmd("Step");
	this.negateMatrixVisual(this.RobotPosition);
	this.cmd("Step");
	
	if (globalToLocal)
	{
		this.cmd("SetText", this.handLabel1ID, "Robot Space to Hand Space\n(Orientation)");
		
	}
	else
	{
		this.cmd("SetText", this.handLabel1ID, "Hand Space to Robot Space\n(Orientation)");
	}
	
	this.cmd("Step");
	this.HandMatrix = this.transposeVisual(this.HandMatrix)
	
	if (globalToLocal)
	{
		this.cmd("SetText", this.handLabel2ID, "Robot Space to Hand Space\n(Position)");
		
	}
	else
	{
		this.cmd("SetText", this.handLabel2ID, "Hand Space to Robot Space\n(Position)");
	}
	this.cmd("Step");
	this.negateMatrixVisual(this.HandPosition);
	this.cmd("Step");
	
	if (globalToLocal)
	{
		this.cmd("Move", this.robotLabel1ID, ChangeCoordinate3D.ROBOT_POSITION_START_X, ChangeCoordinate3D.ROBOT_POSITION_START_Y - 25);
		this.moveMatrix(this.RobotMatrix, ChangeCoordinate3D.ROBOT_POSITION_START_X, ChangeCoordinate3D.ROBOT_POSITION_START_Y)

		this.cmd("Move", this.robotLabel2ID, ChangeCoordinate3D.ROBOT_MATRIX_START_X+ ChangeCoordinate3D.EQUALS_SPACING, ChangeCoordinate3D.ROBOT_MATRIX_START_Y - 25);
		this.moveMatrix(this.RobotPosition, ChangeCoordinate3D.ROBOT_MATRIX_START_X+ ChangeCoordinate3D.EQUALS_SPACING, ChangeCoordinate3D.ROBOT_MATRIX_START_Y)
		
		this.cmd("Move", this.handLabel1ID, ChangeCoordinate3D.HAND_POSITION_START_X, ChangeCoordinate3D.HAND_POSITION_START_Y - 25);
		this.moveMatrix(this.HandMatrix,  ChangeCoordinate3D.HAND_POSITION_START_X, ChangeCoordinate3D.HAND_POSITION_START_Y);
						
						
		this.cmd("Move", this.handLabel2ID, ChangeCoordinate3D.HAND_MATRIX_START_X+ ChangeCoordinate3D.EQUALS_SPACING, ChangeCoordinate3D.HAND_MATRIX_START_Y - 25);
		this.moveMatrix(this.HandPosition,  ChangeCoordinate3D.HAND_MATRIX_START_X+ ChangeCoordinate3D.EQUALS_SPACING, ChangeCoordinate3D.HAND_MATRIX_START_Y);
	}
	else
	{
		this.cmd("Move", this.robotLabel1ID, ChangeCoordinate3D.ROBOT_MATRIX_START_X, ChangeCoordinate3D.ROBOT_MATRIX_START_Y - 25);
		this.moveMatrix(this.RobotMatrix, ChangeCoordinate3D.ROBOT_MATRIX_START_X, ChangeCoordinate3D.ROBOT_MATRIX_START_Y)

		this.cmd("Move", this.robotLabel2ID, ChangeCoordinate3D.ROBOT_POSITION_START_X, ChangeCoordinate3D.ROBOT_POSITION_START_Y - 25);
		this.moveMatrix(this.RobotPosition, ChangeCoordinate3D.ROBOT_POSITION_START_X, ChangeCoordinate3D.ROBOT_POSITION_START_Y)
		
		this.cmd("Move", this.handLabel1ID, ChangeCoordinate3D.HAND_MATRIX_START_X, ChangeCoordinate3D.HAND_MATRIX_START_Y - 25);	
		this.moveMatrix(this.HandMatrix,  ChangeCoordinate3D.HAND_MATRIX_START_X, ChangeCoordinate3D.HAND_MATRIX_START_Y);

		this.cmd("Move", this.handLabel2ID, ChangeCoordinate3D.HAND_POSITION_START_X, ChangeCoordinate3D.HAND_POSITION_START_Y - 25);
		this.moveMatrix(this.HandPosition,  ChangeCoordinate3D.HAND_POSITION_START_X, ChangeCoordinate3D.HAND_POSITION_START_Y);

	}
	return this.commands;
}


ChangeCoordinate3D.prototype.negateMatrixVisual = function(matrix)
{
	var i,j
	for (i = 0; i < matrix.data.length; i++)
	{
		for (j = 0; j < matrix.data[i].length; j++)
		{
			matrix.data[i][j] = -matrix.data[i][j]
		}
	}
	this.resetMatrixLabels(matrix);
}


ChangeCoordinate3D.prototype.globalToLocal = function(params)
{
	this.commands = [];
	this.removeOldIDs();
	
	
	var paramList = params.split(";");
	var x = parseFloat(paramList[0]);
	var y = parseFloat(paramList[1]);
	var z = parseFloat(paramList[2]);
	
	var opX, opY;
	
	
	var screenPoint = this.worldToScreenSpace([x,y, z], 2);
	var logicalPoint;
	
	var pointInWorldSpaceID = this.nextIndex++;
	this.oldIDs.push(pointInWorldSpaceID);
	this.cmd("CreateCircle", pointInWorldSpaceID, "", screenPoint[0], screenPoint[1]);
	this.cmd("SetWidth", pointInWorldSpaceID, ChangeCoordinate3D.VERTEX_WIDTH);
	this.cmd("Connect", this.axisWorld[0], pointInWorldSpaceID, ChangeCoordinate3D.TRANSFORMED_POINT_COLORS[2], 0, 1, "");
	
	var initialPointMatrix;
	if (this.rowMajor)
	{
		initialPointMatrix = this.createMatrix([[x, y, z]], ChangeCoordinate3D.ROBOT_MATRIX_START_X - 3 * ChangeCoordinate3D.MATRIX_ELEM_WIDTH, 
											   ChangeCoordinate3D.ROBOT_MATRIX_START_Y);		
	}
	else
	{
		initialPointMatrix = this.createMatrix([[x], [y], [z]], ChangeCoordinate3D.ROBOT_MATRIX_START_X -  ChangeCoordinate3D.MATRIX_ELEM_WIDTH, 
											   ChangeCoordinate3D.ROBOT_MATRIX_START_Y);		
		
	}
	this.addMatrixIDsToList(initialPointMatrix, this.oldIDs);
	this.cmd("Step");
	
	var positionAndID = this.addMultiply(initialPointMatrix, this.RobotPosition, this.RobotMatrix,
											   ChangeCoordinate3D.ROBOT_MATRIX_START_X + ChangeCoordinate3D.EQUALS_SPACING, ChangeCoordinate3D.ROBOT_MATRIX_START_Y,
											   ChangeCoordinate3D.ROBOT_POSITION_START_X, ChangeCoordinate3D.ROBOT_POSITION_START_Y,
											   pointInWorldSpaceID,
											   2, 1);
	
	var robotPositionMatrix = positionAndID[0];
	var newPositionID = positionAndID[1];
	
	if (this.rowMajor)
	{
		this.moveMatrix(robotPositionMatrix,  ChangeCoordinate3D.HAND_MATRIX_START_X  - 3 * ChangeCoordinate3D.MATRIX_ELEM_WIDTH, 
						ChangeCoordinate3D.HAND_MATRIX_START_Y);
	}
	else
	{
		this.moveMatrix(robotPositionMatrix,  ChangeCoordinate3D.HAND_MATRIX_START_X - ChangeCoordinate3D.MATRIX_ELEM_WIDTH, 
						ChangeCoordinate3D.HAND_MATRIX_START_Y);
		
	}
 
	
	this.addMultiply(robotPositionMatrix, this.HandPosition, this.HandMatrix,
					 ChangeCoordinate3D.HAND_MATRIX_START_X + ChangeCoordinate3D.EQUALS_SPACING, ChangeCoordinate3D.HAND_MATRIX_START_Y,
					 ChangeCoordinate3D.HAND_POSITION_START_X, ChangeCoordinate3D.HAND_POSITION_START_Y,
					 newPositionID,
					 1, 0);

	
		
	return this.commands;
}

ChangeCoordinate3D.prototype.moveObjectsCallback = function()
{
	this.implementAction(this.moveObjects.bind(this), 0);	
}

ChangeCoordinate3D.prototype.moveObjects = function()
{
	this.commands = [];
	this.removeOldIDs();
	var i, j;
	
	for (i = 0; i < this.otherAxes.length; i++)
	{
		for (j = 0; j < this.otherAxes[i].length; j++)
		{
			this.cmd("Delete", this.otherAxes[i][j]);			
		}
	}
	
	
	var i;
	for (i = 0; i < ChangeCoordinate3D.ROBOT_POINTS.length; i++)
	{
		
		this.cmd("Delete", this.RobotPointRobotIDs[i]);
		this.cmd("Delete", this.RobotPointWorldIDs[i]);
	}
	for (i = 0; i < ChangeCoordinate3D.HAND_POINTS.length; i++)
	{
		this.cmd("Delete", this.HandPointHandIDs[i]);
		this.cmd("Delete", this.HandPointRobotIDs[i]);		
		this.cmd("Delete", this.HandPointWorldIDs[i]);		
	}
	this.cmd("Delete", this.RobotHandAttachRobotID);
	this.cmd("Delete", this.RobotHandAttachWorldID);
	this.PositionIndex+= 1;
	if (this.PositionIndex >= ChangeCoordinate3D.ROBOT_POSITION_VALUES.length)
	{
		this.PositionIndex = 0;		
	}
	
	this.RobotPositionValues = ChangeCoordinate3D.ROBOT_POSITION_VALUES[this.PositionIndex];
	this.RobotMatrixValues = ChangeCoordinate3D.ROBOT_MATRIX_VALUES[this.PositionIndex];
	this.HandPositionValues = ChangeCoordinate3D.HAND_POSITION_VALUES[this.PositionIndex];
	this.HandMatrixValues = ChangeCoordinate3D.HAND_MATRIX_VALUES[this.PositionIndex];
	
	this.setupExtraAxes();
	this.setupObjects();
	
	
	this.RobotPosition.data = [this.RobotPositionValues];
	this.RobotMatrix.data = this.RobotMatrixValues;
	this.HandPosition.data = [this.HandPositionValues];
	this.HandMatrix.data =this.HandMatrixValues;
	if (!this.rowMajor)
	{
		this.RobotPosition.transpose();
		this.RobotMatrix.transpose();
		this.HandPosition.transpose();
		this.HandMatrix.transpose();
	}
	this.resetMatrixLabels(this.RobotMatrix);
	this.resetMatrixLabels(this.RobotPosition);
	this.resetMatrixLabels(this.HandMatrix);
	this.resetMatrixLabels(this.HandPosition);
		
	
	return this.commands;
}


function toRadians(degrees)
{
	return (degrees * 2 * Math.PI) / 360.0; 	
}


ChangeCoordinate3D.prototype.addMatrix = function(mat1, mat2, mat3, numDigits)
{
	var i;
	var j;
	for (i = 0; i < mat1.data.length; i++)
	{
		for (j = 0; j < mat1.data[i].length; j++)
		{
			explainText = "";
			var value = 0;
			this.cmd("SetHighlight", mat1.dataID[i][j], 1);	
			this.cmd("SetHighlight", mat2.dataID[i][j], 1);	
			this.cmd("Step");
			mat3.data[i][j] = mat1.data[i][j] + mat2.data[i][j];
			this.cmd("SetHighlight", mat1.dataID[i][j], 0);	
			this.cmd("SetHighlight", mat2.dataID[i][j], 0);	
			this.cmd("SetText", mat3.dataID[i][j], this.standardize(mat3.data[i][j], numDigits));
			this.cmd("Step");
		}
	}
}




ChangeCoordinate3D.prototype.multiplyMatrix = function(mat1, mat2, mat3, explainID, numDigits)
{
	var i;
	var j;
	var explainText = "";
	for (i = 0; i < mat1.data.length; i++)
	{
		for (j = 0; j < mat2.data[0].length; j++)
		{
			var explainText = "";
			var value = 0;
			for (k = 0; k < mat2.data.length; k++)
			{
				this.cmd("SetHighlight", mat1.dataID[i][k], 1);	
				this.cmd("SetHighlight", mat2.dataID[k][j], 1);	
				if (explainText != "")
				{
						explainText = explainText + " + ";
				}
				value = value + mat1.data[i][k] * mat2.data[k][j];
				explainText = explainText + this.standardize(String(mat1.data[i][k]), numDigits) + " * " + this.standardize(String(mat2.data[k][j]),numDigits);
				this.cmd("SetText", explainID, explainText);
				this.cmd("Step");
				this.cmd("SetHighlight", mat1.dataID[i][k], 0);	
				this.cmd("SetHighlight", mat2.dataID[k][j], 0);				
			}
			explainText += " = " + this.standardize(String(value), numDigits);
			this.cmd("SetText", explainID, explainText);
			mat3.data[i][j] = value;
			this.cmd("SetText", mat3.dataID[i][j], this.standardize(value,numDigits));
			this.cmd("Step");
		}
	}
	this.cmd("SetText", explainID, "");
	
	
}

ChangeCoordinate3D.prototype.standardize = function(lab, digits)
{
	digits = (digits == undefined) ? 3 : digits;
	var shift = Math.pow(10, digits);
	var newLab =  Math.round(lab * shift) / shift;
	if (isNaN(newLab))
	{
		return lab;
	}
	else
	{
		return newLab;
	}
}


ChangeCoordinate3D.prototype.resetMatrixLabels = function(mat, numDigits)
{
	var i,j, newLab;
	for (i = 0; i < mat.data.length; i++)
	{
		for (j = 0; j < mat.data[i].length; j++)
		{
			newLab = this.standardize(mat.data[i][j], numDigits);
			this.cmd("SetText", mat.dataID[i][j], newLab);
		}		
	}
}



ChangeCoordinate3D.prototype.moveMatrix = function(mat, x, y)
{
	var height = mat.data.length;
	var width = 0;
	
	var i, j;
	for (i = 0; i < mat.data.length; i++)
	{
		width = Math.max(width, mat.data[i].length);
	}	
	
	
	this.cmd("Move", mat.leftBrack1, x, y);
	this.cmd("Move", mat.leftBrack2, x, y);
	this.cmd("Move", mat.leftBrack3, x, y +  height * ChangeCoordinate3D.MATRIX_ELEM_HEIGHT);
	
	this.cmd("Move", mat.rightBrack1,  x + width * ChangeCoordinate3D.MATRIX_ELEM_WIDTH, y);
	this.cmd("Move", mat.rightBrack2,   x + width * ChangeCoordinate3D.MATRIX_ELEM_WIDTH, y);
	this.cmd("Move", mat.rightBrack3,  x+ width * ChangeCoordinate3D.MATRIX_ELEM_WIDTH, y +  height * ChangeCoordinate3D.MATRIX_ELEM_HEIGHT);
	
	for (i = 0; i < mat.data.length; i++)
	{
		for (j = 0; j < mat.data[i].length; j++)
		{
			this.cmd("Move", mat.dataID[i][j], 
					 x + j*ChangeCoordinate3D.MATRIX_ELEM_WIDTH + ChangeCoordinate3D.MATRIX_ELEM_WIDTH / 2,
					 y + i*ChangeCoordinate3D.MATRIX_ELEM_HEIGHT + ChangeCoordinate3D.MATRIX_ELEM_HEIGHT / 2);
		}		
	}
	mat.x = x;
	mat.y = y;
}




ChangeCoordinate3D.prototype.addMatrixIDsToList = function(mat, list)
{
	list.push(mat.leftBrack1);
	list.push(mat.leftBrack2);
	list.push(mat.leftBrack3);
	list.push(mat.rightBrack1);
	list.push(mat.rightBrack2);
	list.push(mat.rightBrack3);
	var i,j;
	for (i = 0; i < mat.data.length; i++)
	{
		for (j = 0; j < mat.data[i].length; j++)
		{
			list.push(mat.dataID[i][j]);
		}		
					  
	}
}

ChangeCoordinate3D.prototype.deleteMatrix = function(mat)
{
	var IDList = [];
	this.addMatrixIDsToList(mat, IDList);
	var i;
	for (i = 0; i < IDList.length; i++)
	{
		this.cmd("Delete", IDList[i]);
	}
}

				 
				 
				 
ChangeCoordinate3D.prototype.aplyFunctionToMatrixElems = function(mat, command, value)
{
	this.cmd(command, mat.leftBrack1, value);
	this.cmd(command, mat.leftBrack2, value);
	this.cmd(command, mat.leftBrack3, value);
	this.cmd(command, mat.rightBrack1, value);
	this.cmd(command, mat.rightBrack2, value);
	this.cmd(command, mat.rightBrack3, value);
	var i,j;
	for (i = 0; i < mat.data.length; i++)
	{
		for (j = 0; j < mat.data[i].length; j++)
		{
			this.cmd(command, mat.dataID[i][j], value);
		}		
	}
}



// Multiply two (data only!) matrices (not complete matrix object with graphics, just
// the data
function multiply(lhs, rhs)
{
	var resultMat = new Array(lhs.length);
	var i, j, k;
	
	for (i = 0; i < lhs.length; i++)
	{
		resultMat[i] = new Array(rhs[0].length);		
	}
	for (i = 0; i < lhs.length; i++)
	{
		for (j = 0; j < rhs[0].length; j++)
		{
			var value = 0;
			for (k = 0; k < rhs.length; k++)
			{
				value = value + lhs[i][k] * rhs[k][j];
			}
			resultMat[i][j] = value;
		}
	}
	return resultMat;
}

// Add two (data only!) matrices (not complete matrix object with graphics, just
// the data)
ChangeCoordinate3D.prototype.add = function(lhs, rhs)
{
	var resultMat = new Array(lhs.length);
	var i,j;
	
	for (i = 0; i < lhs.length; i++)
	{
		resultMat[i] = new Array(lhs[i].length);
		for (j = 0; j < lhs[i].length; j++)
		{
			resultMat[i][j] = lhs[i][j] + rhs[i][j];
			
		}
	}
	return resultMat;
}


ChangeCoordinate3D.prototype.createMatrix = function(contents, x, y)
{
	var mat = new Matrix(contents, x, y);
	mat.leftBrack1 = this.nextIndex++;
	mat.leftBrack2 = this.nextIndex++;
	mat.leftBrack3 = this.nextIndex++;
	mat.rightBrack1 = this.nextIndex++;
	mat.rightBrack2 = this.nextIndex++;
	mat.rightBrack3 = this.nextIndex++;
	
	var height = mat.data.length;
	var width = 0;
	
	var i, j;
	mat.dataID = new Array(mat.data.length);
	for (i = 0; i < mat.data.length; i++)
	{
		width = Math.max(width, mat.data[i].length);
		mat.dataID[i] = new Array(mat.data[i].length);
		for (j = 0; j < mat.data[i].length; j++)
		{
			mat.dataID[i][j] = this.nextIndex++;			
		}
	}
		
	this.cmd("CreateRectangle", mat.leftBrack1, "", 5, 1,  x, y, "left","center");
	this.cmd("CreateRectangle", mat.leftBrack2, "", 1, height * ChangeCoordinate3D.MATRIX_ELEM_HEIGHT,  x, y, "center","top");
	this.cmd("CreateRectangle", mat.leftBrack3, "", 5, 1,  x, y +  height * ChangeCoordinate3D.MATRIX_ELEM_HEIGHT , "left","center");

	this.cmd("CreateRectangle", mat.rightBrack1, "", 5, 1,  x + width * ChangeCoordinate3D.MATRIX_ELEM_WIDTH, y, "right","center");
	this.cmd("CreateRectangle", mat.rightBrack2, "", 1, height * ChangeCoordinate3D.MATRIX_ELEM_HEIGHT,  x + width * ChangeCoordinate3D.MATRIX_ELEM_WIDTH, y, "center","top");
	this.cmd("CreateRectangle", mat.rightBrack3, "", 5, 1,  x+ width * ChangeCoordinate3D.MATRIX_ELEM_WIDTH, y +  height * ChangeCoordinate3D.MATRIX_ELEM_HEIGHT , "right","center");
	
	for (i = 0; i < mat.data.length; i++)
	{
		for (j = 0; j < mat.data[i].length; j++)
		{
			this.cmd("CreateLabel", mat.dataID[i][j], mat.data[i][j], 
					 x + j*ChangeCoordinate3D.MATRIX_ELEM_WIDTH + ChangeCoordinate3D.MATRIX_ELEM_WIDTH / 2,
					 y + i*ChangeCoordinate3D.MATRIX_ELEM_HEIGHT + ChangeCoordinate3D.MATRIX_ELEM_HEIGHT / 2);
		}		
	}
	return mat;
}

var currentAlg;

function init()
{
	var animManag = initCanvas();
	currentAlg = new ChangeCoordinate3D(animManag, canvas.width, canvas.height);
}

function Matrix(contents, x, y)
{
	this.data = contents;
	this.x = x;
	this.y = y;
}

Matrix.prototype.transpose = function()
{
	var newData = new Array(this.data[0].length);
	var i,j;
	for (i = 0; i < this.data[0].length; i++)
	{
		newData[i] = new Array(this.data.length);		
	}
	for (i = 0; i < this.data.length; i++)
	{
		for (j = 0; j < this.data[i].length; j++)
		{
			newData[j][i] = this.data[i][j];			
		}
	}
	this.data = newData;
}





