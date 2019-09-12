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



function RotateTranslate2D(am, w, h)
{
	this.init(am, w, h);
}


RotateTranslate2D.prototype = new Algorithm();
RotateTranslate2D.prototype.constructor = RotateTranslate2D;
RotateTranslate2D.superclass = Algorithm.prototype;

RotateTranslate2D.XAxisYPos = 300;
RotateTranslate2D.XAxisStart = 100;
RotateTranslate2D.XAxisEnd = 700;

RotateTranslate2D.MATRIX_ELEM_WIDTH = 50;
RotateTranslate2D.MATRIX_ELEM_HEIGHT = 20;


RotateTranslate2D.MATRIX_MULTIPLY_SPACING = 10;
RotateTranslate2D.EQUALS_SPACING = 30;
RotateTranslate2D.MATRIX_START_X = 10 + 3 * RotateTranslate2D.MATRIX_ELEM_WIDTH + RotateTranslate2D.MATRIX_MULTIPLY_SPACING;
RotateTranslate2D.MATRIX_START_Y = 10;



RotateTranslate2D.YAxisXPos = 400;
RotateTranslate2D.YAxisStart = 100;
RotateTranslate2D.YAxisEnd = 500;


RotateTranslate2D.OBJECTS = [
						 [[100, 100], [-100, 100], [-100,-100], [100, -100]], // Square
						 [[10, 100], [-10, 100], [-10,-100], [100, -100], [100, -80], [10,-80]], // L
						 [[0, 141], [-134, 44], [-83, -114 ], [83, -114], [134,44]], // Pentagon
						 [[0, 141], [-35,48],[-134, 44], [-57, -19], [-83, -114 ], [0, -60],[83,-114], [57, -19], [134,44], [35, 48]], // Star
						 ]


RotateTranslate2D.AXIS_COLOR = "#9999FF"

RotateTranslate2D.LOCAL_VERTEX_FOREGORUND_COLOR = "#000000";
RotateTranslate2D.LOCAL_VERTEX_BACKGROUND_COLOR = RotateTranslate2D.LOCAL_VERTEX_FOREGORUND_COLOR;
RotateTranslate2D.LOCAL_EDGE_COLOR = "#000000";

RotateTranslate2D.GLOBAL_VERTEX_FOREGORUND_COLOR = "#00FF00";
RotateTranslate2D.GLOBAL_VERTEX_BACKGROUND_COLOR = RotateTranslate2D.GLOBAL_VERTEX_FOREGORUND_COLOR;
RotateTranslate2D.GLOBAL_EDGE_COLOR = "#00FF00";



RotateTranslate2D.TRANSFORMED_VERTEX_FOREGORUND_COLOR = "#66FF66";
RotateTranslate2D.TRANSFORMED_VERTEX_BACKGROUND_COLOR = RotateTranslate2D.TRANSFORMED_VERTEX_FOREGORUND_COLOR;
RotateTranslate2D.TRANSFORMED_EDGE_COLOR = "#66FF66";




RotateTranslate2D.VECTOR_COLOR = "#FF0000";

RotateTranslate2D.VERTEX_WIDTH = 3;
RotateTranslate2D.VERTEX_HEIGHT = RotateTranslate2D.VERTEX_WIDTH;

RotateTranslate2D.prototype.init = function(am, w, h)
{
	var sc = RotateTranslate2D.superclass.init.call(this, am, w, h);
	this.rowMajor = true;
	this.posYUp = true;
	this.rotateFirst = true;
	this.addControls();
	this.currentShape = 0;
	
	this.commands = [];
	this.nextIndex = 0;

	this.setupAxis();

	
	this.transformMatrix = this.createMatrix([[1, 0, 0], [ 0, 1, 0], [0, 0, 1]], RotateTranslate2D.MATRIX_START_X, RotateTranslate2D.MATRIX_START_Y);
	
	this.savedNextIndex = this.nextIndex;
	this.setupObject();
	this.setupObjectGraphic();

	this.animationManager.StartNewAnimation(this.commands);
	this.animationManager.skipForward();
	this.animationManager.clearHistory();
	this.clearHistory();
	
	
}

RotateTranslate2D.prototype.setupAxis =  function()
{
	this.xAxisLeft = this.nextIndex++;
	this.xAxisRight = this.nextIndex++;
	this.yAxisTop = this.nextIndex++;
	this.yAxisBottom = this.nextIndex++;
	
	this.xAxisLabel = this.nextIndex++;
	this.yAxisLabel = this.nextIndex++;
	
	this.originID = this.nextIndex++;
	
	this.cmd("CreateRectangle", this.originID, "", 0, 0, RotateTranslate2D.YAxisXPos, RotateTranslate2D.XAxisYPos);

	
	this.cmd("CreateRectangle", this.xAxisLeft, "", 0, 0, RotateTranslate2D.XAxisStart, RotateTranslate2D.XAxisYPos);
	this.cmd("SetAlpha", this.xAxisLeft, 0);
	this.cmd("CreateRectangle", this.xAxisRight, "", 0, 0,  RotateTranslate2D.XAxisEnd, RotateTranslate2D.XAxisYPos);
	this.cmd("SetAlpha", this.xAxisRight, 0);
	this.cmd("Connect", this.xAxisLeft, this.xAxisRight, RotateTranslate2D.AXIS_COLOR, 0, 1, "");
	this.cmd("Connect", this.xAxisRight, this.xAxisLeft, RotateTranslate2D.AXIS_COLOR, 0, 1, "");

	
	this.cmd("CreateRectangle", this.yAxisTop, "", 0, 0,  RotateTranslate2D.YAxisXPos, RotateTranslate2D.YAxisStart);
	this.cmd("SetAlpha", this.yAxisTop, 0);
	this.cmd("CreateRectangle", this.yAxisBottom, "", 0, 0, RotateTranslate2D.YAxisXPos, RotateTranslate2D.YAxisEnd);
	this.cmd("SetAlpha", this.yAxisBottom, 0);
	this.cmd("Connect", this.yAxisTop, this.yAxisBottom, RotateTranslate2D.AXIS_COLOR, 0, 1, "");
	this.cmd("Connect", this.yAxisBottom, this.yAxisTop, RotateTranslate2D.AXIS_COLOR, 0, 1, "");
	if (this.posYUp)
	{
		this.cmd("CreateLabel", this.yAxisLabel, "+y", RotateTranslate2D.YAxisXPos + 10, RotateTranslate2D.YAxisStart + 10);
	}
	else
	{
		this.cmd("CreateLabel", this.yAxisLabel, "+y", RotateTranslate2D.YAxisXPos + 10, RotateTranslate2D.YAxisEnd - 10);
	}
	this.cmd("CreateLabel", this.xAxisLabel, "+x", RotateTranslate2D.XAxisEnd - 10, RotateTranslate2D.XAxisYPos - 10);
	this.cmd("SetForegroundColor", this.yAxisLabel, RotateTranslate2D.AXIS_COLOR);
	this.cmd("SetForegroundColor", this.xAxisLabel, RotateTranslate2D.AXIS_COLOR);
}


RotateTranslate2D.prototype.setupObject =  function()
{
	var i = 0;
	this.objectVertexLocalPosition = new Array(RotateTranslate2D.OBJECTS[this.currentShape].length);
	this.objectVertexWorldPosition = new Array(RotateTranslate2D.OBJECTS[this.currentShape].length);
	for (i = 0; i < RotateTranslate2D.OBJECTS[this.currentShape].length; i++)
	{
		this.objectVertexLocalPosition[i] = RotateTranslate2D.OBJECTS[this.currentShape][i].slice(0)
		this.objectVertexWorldPosition[i] = RotateTranslate2D.OBJECTS[this.currentShape][i].slice(0);
		
	}
}


RotateTranslate2D.prototype.worldToScreenSpace = function(point)
{
	var transformedPoint = new Array(2);
	transformedPoint[0] = point[0] + RotateTranslate2D.YAxisXPos;
	if (this.posYUp)
	{
		transformedPoint[1] = RotateTranslate2D.XAxisYPos - point[1];		
	}
	else
	{
		transformedPoint[1] = RotateTranslate2D.XAxisYPos + point[1];		
		
	}
	return transformedPoint;
}








RotateTranslate2D.prototype.setupObjectGraphic =  function()
{
	var i;
	
	this.objectVertexLocalID = new Array(this.objectVertexLocalPosition.length);
	this.objectVertexWorldID = new Array(this.objectVertexWorldPosition.length);
	for (i= 0; i < this.objectVertexLocalPosition.length; i++)
	{
		this.objectVertexLocalID[i] = this.nextIndex++;
	}
	for (i= 0; i < this.objectVertexWorldPosition.length; i++)
	{
		this.objectVertexWorldID[i] = this.nextIndex++;
	}
	
	
	var point = this.worldToScreenSpace(this.objectVertexLocalPosition[0])
	var xLocal = point[0];
	var yLocal = point[1];
	point = this.worldToScreenSpace(this.objectVertexWorldPosition[0])
	var xGlobal = point[0];
	var yGlobal = point[1];
	
	for (i = 0; i < this.objectVertexLocalPosition.length; i++)
	{
		point = this.worldToScreenSpace(this.objectVertexLocalPosition[i]);
		
		xLocal = Math.min(xLocal, point[0]);
		yLocal = Math.max(yLocal, point[1]);
		
		
		this.cmd("CreateRectangle", this.objectVertexLocalID[i], "", RotateTranslate2D.VERTEX_WIDTH, RotateTranslate2D.VERTEX_HEIGHT, point[0], point[1]);
		this.cmd("SetForegroundColor", this.objectVertexLocalID[i], RotateTranslate2D.LOCAL_VERTEX_FOREGORUND_COLOR);
		this.cmd("SetBackgroundColor", this.objectVertexLocalID[i], RotateTranslate2D.LOCAL_VERTEX_BACKGROUND_COLOR);
		
		
		
		point = this.worldToScreenSpace(this.objectVertexWorldPosition[i]);

		xGlobal = Math.min(xGlobal, point[0]);
		yGlobal = Math.min(yGlobal, point[1]);
		
		this.cmd("CreateRectangle", this.objectVertexWorldID[i], "", RotateTranslate2D.VERTEX_WIDTH, RotateTranslate2D.VERTEX_HEIGHT, point[0], point[1]);
		this.cmd("SetForegroundColor", this.objectVertexWorldID[i], RotateTranslate2D.GLOBAL_VERTEX_FOREGORUND_COLOR);
		this.cmd("SetBackgroundColor", this.objectVertexWorldID[i], RotateTranslate2D.GLOBAL_VERTEX_BACKGROUND_COLOR);
		
	}
	for (i = 1; i < this.objectVertexLocalID.length; i++)
	{
		this.cmd("Connect", this.objectVertexLocalID[i-1], this.objectVertexLocalID[i], RotateTranslate2D.LOCAL_EDGE_COLOR, 0, 0, "");
		this.cmd("Connect", this.objectVertexWorldID[i-1], this.objectVertexWorldID[i], RotateTranslate2D.GLOBAL_EDGE_COLOR, 0, 0, "");
	}
	this.cmd("Connect", this.objectVertexLocalID[this.objectVertexLocalID.length - 1], this.objectVertexLocalID[0], RotateTranslate2D.LOCAL_EDGE_COLOR, 0, 0, "");
	this.cmd("Connect", this.objectVertexWorldID[this.objectVertexWorldID.length - 1], this.objectVertexWorldID[0], RotateTranslate2D.GLOBAL_EDGE_COLOR, 0, 0, "");
	this.localLabelID = this.nextIndex++;
	this.globalLabelID = this.nextIndex++;
	
	
	this.cmd("CreateLabel", this.localLabelID, "Local Space", xLocal, yLocal + 2, 0);
	this.cmd("SetForegroundColor", this.localLabelID, RotateTranslate2D.LOCAL_VERTEX_FOREGORUND_COLOR);

	labelPos = this.worldToScreenSpace([xGlobal, yGlobal]);

	this.cmd("CreateLabel", this.globalLabelID, "World Space", xGlobal, yGlobal - 12, 0);
	this.cmd("SetForegroundColor", this.globalLabelID, RotateTranslate2D.GLOBAL_VERTEX_FOREGORUND_COLOR);

	

}

RotateTranslate2D.prototype.addControls =  function()
{
	this.controls = [];
	
	addLabelToAlgorithmBar("Rotation Angle");
						   
	this.rotationField = addControlToAlgorithmBar("Text", "");
	this.rotationField.onkeydown = this.returnSubmitFloat(this.rotationField,  this.transformCallback.bind(this), 4, true);
	this.controls.push(this.rotationField);
	
	addLabelToAlgorithmBar("Translate X");
	
	this.scaleXField = addControlToAlgorithmBar("Text", "");
	this.scaleXField.onkeydown = this.returnSubmitFloat(this.scaleXField,  this.transformCallback.bind(this), 4, true);
	this.controls.push(this.scaleXField);

	
	addLabelToAlgorithmBar("Translate Y");
	
	this.scaleYField = addControlToAlgorithmBar("Text", "");
	this.scaleYField.onkeydown = this.returnSubmitFloat(this.scaleYField,  this.transformCallback.bind(this), 4, true);
	this.controls.push(this.scaleYField);
	

	var transformButton = addControlToAlgorithmBar("Button", "Transform");
	transformButton.onclick = this.transformCallback.bind(this);
	
	this.controls.push(transformButton);
	
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
	
	var radioButtonList = addRadioButtonGroupToAlgorithmBar(["+y Up", 
															 "+y Down", 
															 ], 
															"yAxisDirection");
	this.posYUpButton = radioButtonList[0];
	this.posYUpButton.onclick = this.changePosYCallback.bind(this, true);
	this.controls.push(this.posYUpButton);
	
	this.posYDownButton = radioButtonList[1];
	this.posYDownButton.onclick = this.changePosYCallback.bind(this, false);
	this.controls.push(this.posYDownButton);
	
	this.posYUpButton.checked = this.posYUp;
	this.posYDownButton.checked = !this.posYUp;

	
	var changeShapeButton = addControlToAlgorithmBar("Button", "Change Shape");
	changeShapeButton.onclick = this.changeShapeCallback.bind(this);
	
	this.controls.push(changeShapeButton);
	
}






RotateTranslate2D.prototype.reset = function()
{
	this.rowMajor = true;
	this.posYUp = true;
	this.rotateFirst = true;
	this.currentShape = 0;
	this.rowMajorButton.checked = this.rowMajor;
	this.posYUpButton.checked = this.posYUp;
	this.transformMatrix.data = [[1,0,0],[0,1,0],[0,0,1]];
	this.nextIndex = this.savedNextIndex;
	this.setupObject();
	this.setupObjectGraphic();
}


RotateTranslate2D.prototype.enableUI = function(event)
{
	for (var i = 0; i < this.controls.length; i++)
	{
		this.controls[i].disabled = false;
	}
	
	
}
RotateTranslate2D.prototype.disableUI = function(event)
{
	for (var i = 0; i < this.controls.length; i++)
	{
		this.controls[i].disabled = true;
	}
}



RotateTranslate2D.prototype.changePosYCallback = function(posYUp) 
{
	if (this.posYUp != posYUp)
	{
		this.implementAction(this.changePosY.bind(this),  posYUp);
	}
}

RotateTranslate2D.prototype.changePosY = function(posYUp)
{
	this.commands = new Array();
	this.posYUp= posYUp;		
	if (this.posYUpButton.checked != this.posYUp)
	{
		this.posYUpButton.checked = this.posYUp;
	}
	if (this.posYDownButton.checked == this.posYUp)
	{
		this.posYDownButton.checked = !this.posYUp;
	}
	if (this.posYUp)
	{
		this.cmd("Move", this.yAxisLabel,  RotateTranslate2D.YAxisXPos + 10, RotateTranslate2D.YAxisStart + 10);
	}
	else
	{
		this.cmd("Move", this.yAxisLabel,  RotateTranslate2D.YAxisXPos + 10, RotateTranslate2D.YAxisEnd - 10);
		
	}
	
	this.moveObjectToNewPosition(this.objectVertexLocalPosition, this.objectVertexLocalID, this.localLabelID, false);
	this.moveObjectToNewPosition(this.objectVertexWorldPosition, this.objectVertexWorldID, this.globalLabelID, true);	
		 

	return this.commands;				
}


RotateTranslate2D.prototype.moveObjectToNewPosition = function(objectLocations, objectIDs, labelID, top)
{
	var point = this.worldToScreenSpace(objectLocations[0])
	var labelX = point[0];
	var labelY = point[1];

	for (var i = 0; i < objectLocations.length; i++)
	{
		point = this.worldToScreenSpace(objectLocations[i]);
		this.cmd("Move", objectIDs[i], point[0], point[1]);
		
		labelX = Math.min(labelX, point[0]);
		if (top)
		{
			labelY = Math.min(labelY, point[1]);
		}
		else
		{
			labelY = Math.max(labelY, point[1]);
			
		}
	}
	if (top)
	{
		this.cmd("Move", labelID, labelX, labelY - 12);
	}
	else
	{
		this.cmd("Move", labelID, labelX, labelY + 2);
	}
}

RotateTranslate2D.prototype.changeRowColMajorCallback = function(rowMajor) 
{
	if (this.rowMajor != rowMajor)
	{
		this.implementAction(this.changeRowCol.bind(this),  rowMajor);
	}
}

RotateTranslate2D.prototype.changeRowCol = function(rowMajor)
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
	
	this.transformMatrix.transpose();
	this.resetMatrixLabels(this.transformMatrix);
	
	
	return this.commands;				
}


RotateTranslate2D.prototype.fixNumber = function(value, defaultVal)
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

RotateTranslate2D.prototype.transformCallback = function()
{
	
	
	this.rotationField.value = this.fixNumber(this.rotationField.value, "0");
	this.scaleXField.value = this.fixNumber(this.scaleXField.value, "0");
	this.scaleYField.value = this.fixNumber(this.scaleYField.value, "0");
	this.implementAction(this.transform.bind(this), this.rotationField.value + ";" + this.scaleXField.value + ";" + this.scaleYField.value);
	
}


RotateTranslate2D.prototype.changeShapeCallback = function()
{
	this.implementAction(this.changeShape.bind(this), 0);	
}

RotateTranslate2D.prototype.changeShape = function()
{
	this.commands = [];
	var i;
	for (i = 0; i < this.objectVertexLocalID.length; i++)
	{
		this.cmd("Delete", this.objectVertexLocalID[i]);
		this.cmd("Delete", this.objectVertexWorldID[i]);
	}
	this.cmd("Delete", this.localLabelID);
	this.cmd("Delete", this.globalLabelID);
	this.currentShape++;
	if (this.currentShape >= RotateTranslate2D.OBJECTS.length)
	{
		this.currentShape = 0;
	}
	this.transformMatrix.data = [[1,0,0],[0,1,0],[0,0,1]];
	this.resetMatrixLabels(this.transformMatrix);
	this.setupObject();
	this.setupObjectGraphic();
	return this.commands;
}


function toRadians(degrees)
{
	return (degrees * 2 * Math.PI) / 360.0; 	
}

RotateTranslate2D.prototype.transform = function(input)
{
	this.commands = [];
	
	var inputs = input.split(";");
	var rotateDegree = parseFloat(inputs[0]);
	var deltaX  = parseFloat(inputs[1]);
	var deltaY   = parseFloat(inputs[2]);
	var rotateRadians = toRadians(rotateDegree);

	
	var deltaMatrix;
	if (this.rowMajor)
	{
		deltaMatrix = this.createMatrix([["cos \u0398", "sin \u0398", 0], ["-sin \u0398", "cos \u0398", 0],["\u0394x", "\u0394y", "1"]], 
										RotateTranslate2D.MATRIX_START_X +3 * RotateTranslate2D.MATRIX_ELEM_WIDTH + RotateTranslate2D.MATRIX_MULTIPLY_SPACING, 
										RotateTranslate2D.MATRIX_START_Y);
	}
	else
	{
		deltaMatrix = this.createMatrix([["cos \u0398", "-sin \u0398", "\u0394x"], ["sin \u0398", "cos \u0398", "\u0394y"],[0, 0, 1]], 
										RotateTranslate2D.MATRIX_START_X -3 * RotateTranslate2D.MATRIX_ELEM_WIDTH - RotateTranslate2D.MATRIX_MULTIPLY_SPACING, 
										RotateTranslate2D.MATRIX_START_Y);
	}
	this.cmd("Step");
	
	if (this.rowMajor)
	{
		deltaMatrix.data = [["cos " + inputs[0], "sin " + inputs[0], 0], ["-sin " + inputs[0], "cos " + inputs[0], 0],["\u0394x", "\u0394y", "1"]]
	}
	else
	{
		deltaMatrix.data = [["cos " + inputs[0], "-sin " + inputs[0], "\u0394 x"], ["sin " + inputs[0], "cos " + inputs[0], "\u0394y"],[0, 0, 1]];
	}
	this.resetMatrixLabels(deltaMatrix);
	this.cmd("Step");

	if (this.rowMajor)
	{
		deltaMatrix.data = [[Math.cos(rotateRadians), Math.sin(rotateRadians), 0], [-Math.sin(rotateRadians), Math.cos(rotateRadians), 0],[deltaX, deltaY, 1]]
	}
	else
	{
		deltaMatrix.data = [[Math.cos(rotateRadians), -Math.sin(rotateRadians), deltaX], [Math.sin(rotateRadians), Math.cos(rotateRadians), deltaY],[0,0, 1]]
	}
	this.resetMatrixLabels(deltaMatrix);
	this.cmd("Step");
	
	var equalLabel = this.nextIndex++;
	var resultMatrix;
	var explainID = this.nextIndex++;
	var resultXPos;
	
	if (this.rowMajor)
	{
		resultXPos =  RotateTranslate2D.MATRIX_START_X +6 * RotateTranslate2D.MATRIX_ELEM_WIDTH + RotateTranslate2D.MATRIX_MULTIPLY_SPACING;
	}
	else
	{
		resultXPos =  RotateTranslate2D.MATRIX_START_X +3 * RotateTranslate2D.MATRIX_ELEM_WIDTH;		
	}
	resultMatrix = this.createMatrix([["", "", ""],["", "", ""],["", "", ""]], 
									 resultXPos + RotateTranslate2D.EQUALS_SPACING,
									 RotateTranslate2D.MATRIX_START_Y);
	this.cmd("CreateLabel", equalLabel, "=", resultXPos + RotateTranslate2D.EQUALS_SPACING / 2,
			 RotateTranslate2D.MATRIX_START_Y + 1.5 * RotateTranslate2D.MATRIX_ELEM_HEIGHT);
	
	this.cmd("CreateLabel", explainID, "",  resultXPos + RotateTranslate2D.EQUALS_SPACING, RotateTranslate2D.MATRIX_START_Y + 3 * RotateTranslate2D.MATRIX_ELEM_HEIGHT + 5, 0);		
	
	
	this.cmd("Step"); // TODO:  Remove this?
	if (this.rowMajor)
	{
		this.multiplyMatrix(this.transformMatrix, deltaMatrix, resultMatrix, explainID);
	}
	else
	{
		this.multiplyMatrix(deltaMatrix, this.transformMatrix, resultMatrix, explainID);		
	}
	
	this.setMatrixAlpha(this.transformMatrix, 0);
	this.transformMatrix.data = resultMatrix.data;
	this.resetMatrixLabels(this.transformMatrix);
	this.moveMatrix(resultMatrix, RotateTranslate2D.MATRIX_START_X, RotateTranslate2D.MATRIX_START_Y);
	this.deleteMatrix(deltaMatrix);
	this.cmd("Delete", equalLabel);
	this.cmd("SetText", explainID, "");
	this.cmd("Step");
	this.deleteMatrix(resultMatrix);
	this.setMatrixAlpha(this.transformMatrix, 1);
	var i;
	
	var transformedObjectID = new Array(this.objectVertexLocalPosition.length);

	var xy;
	
	if (this.rowMajor)
	{
		xy = this.createMatrix([["x", "y", 1]], RotateTranslate2D.MATRIX_START_X - 3 * RotateTranslate2D.MATRIX_ELEM_WIDTH - RotateTranslate2D.MATRIX_MULTIPLY_SPACING,
							   RotateTranslate2D.MATRIX_START_Y);
	}
	else
	{
		xy = this.createMatrix([["x"], ["y"], [1]], RotateTranslate2D.MATRIX_START_X + 3 * RotateTranslate2D.MATRIX_ELEM_WIDTH + RotateTranslate2D.MATRIX_MULTIPLY_SPACING,
							   RotateTranslate2D.MATRIX_START_Y);
		
	}
	this.cmd("Step");
	var equalX;
	var equalY;
	
	if (this.rowMajor)
	{
		equalX = RotateTranslate2D.MATRIX_START_X + 3*RotateTranslate2D.MATRIX_ELEM_WIDTH + RotateTranslate2D.EQUALS_SPACING / 2;
		equalY = RotateTranslate2D.MATRIX_START_Y + 0.5 * RotateTranslate2D.MATRIX_ELEM_HEIGHT;	
		this.cmd("SetPosition", explainID, equalX + RotateTranslate2D.EQUALS_SPACING / 2, RotateTranslate2D.MATRIX_START_Y + RotateTranslate2D.MATRIX_ELEM_HEIGHT + 10);
	}
	else
	{
		equalX = RotateTranslate2D.MATRIX_START_X + 4*RotateTranslate2D.MATRIX_ELEM_WIDTH + RotateTranslate2D.MATRIX_MULTIPLY_SPACING + RotateTranslate2D.EQUALS_SPACING / 2;
		equalY = RotateTranslate2D.MATRIX_START_Y + 1.5 * RotateTranslate2D.MATRIX_ELEM_HEIGHT;		
		this.cmd("SetPosition", explainID, equalX + RotateTranslate2D.EQUALS_SPACING / 2, RotateTranslate2D.MATRIX_START_Y + 3 * RotateTranslate2D.MATRIX_ELEM_HEIGHT + 10);
	}
	for (i = 0; i < this.objectVertexLocalPosition.length; i++)
	{
		this.cmd("Connect", this.originID, this.objectVertexLocalID[i], RotateTranslate2D.VECTOR_COLOR, 0, 1, "");
		if (this.rowMajor)
		{			
			xy.data[0][0] = this.objectVertexLocalPosition[i][0];
			xy.data[0][1] = this.objectVertexLocalPosition[i][1];
			xy.data[0][2] = 1;
		}
		else
		{
			xy.data[0][0] = this.objectVertexLocalPosition[i][0];
			xy.data[1][0] = this.objectVertexLocalPosition[i][1];
			xy.data[2][0] = 1;
		}
		this.resetMatrixLabels(xy);
		this.cmd("Step");
		
		this.cmd("CreateLabel", equalLabel, "=", equalX, equalY);
		if (this.rowMajor)
		{
			output = this.createMatrix([["","", ""]],  equalX + RotateTranslate2D.EQUALS_SPACING / 2, RotateTranslate2D.MATRIX_START_Y);
			this.multiplyMatrix(xy, this.transformMatrix, output, explainID);
		}
		else
		{
			output = this.createMatrix([[""],[""], [""]],   equalX + RotateTranslate2D.EQUALS_SPACING / 2, RotateTranslate2D.MATRIX_START_Y)			
			this.multiplyMatrix(this.transformMatrix, xy, output, explainID);
		}
		
		transformedObjectID[i] = this.nextIndex++;
		var point;
		if (this.rowMajor)
		{
			point = this.worldToScreenSpace([output.data[0][0], output.data[0][1]]);
		}
		else
		{
			point = this.worldToScreenSpace([output.data[0][0], output.data[1][0]]);			
		}
		
		this.cmd("CreateRectangle", transformedObjectID[i], "", RotateTranslate2D.VERTEX_WIDTH, RotateTranslate2D.VERTEX_HEIGHT, point[0], point[1]);
		this.cmd("SetForegroundColor", transformedObjectID[i], RotateTranslate2D.TRANSFORMED_VERTEX_FOREGORUND_COLOR);
		this.cmd("SetBackgroundColor", transformedObjectID[i], RotateTranslate2D.TRANSFORMED_VERTEX_BACKGROUND_COLOR);
		this.cmd("Connect", this.originID, transformedObjectID[i], RotateTranslate2D.TRANSFORMED_EDGE_COLOR, 0, 1, "");
		this.cmd("Step");
		this.cmd("Disconnect", this.originID, transformedObjectID[i]);
		
		if (i > 0)
		{
			this.cmd("Connect", transformedObjectID[i-1], transformedObjectID[i], RotateTranslate2D.TRANSFORMED_EDGE_COLOR, 0, 0, "");
		}
		
		this.cmd("Disconnect", this.originID, this.objectVertexLocalID[i]);
		if (this.rowMajor)
		{
			this.objectVertexWorldPosition[i][0] = output.data[0][0];			
			this.objectVertexWorldPosition[i][1] = output.data[0][1];			
		}
		else
		{
			this.objectVertexWorldPosition[i][0] = output.data[0][0];			
			this.objectVertexWorldPosition[i][1] = output.data[1][0];			
		}
		this.cmd("Delete", equalLabel);
		this.deleteMatrix(output);
	}
	this.cmd("Step");
	this.cmd("Connect", transformedObjectID[transformedObjectID.length-1], transformedObjectID[0], RotateTranslate2D.TRANSFORMED_EDGE_COLOR, 0, 0, "");
	
	this.cmd("Step","B");
	this.moveObjectToNewPosition(this.objectVertexWorldPosition, this.objectVertexWorldID, this.globalLabelID, true);	
	this.cmd("Step");
	
	for (i = 0; i < transformedObjectID.length; i++)
	{
		this.cmd("Delete", transformedObjectID[i]);
	}
	
	
	this.deleteMatrix(xy);
	return this.commands;
}


RotateTranslate2D.prototype.multiplyMatrix = function(mat1, mat2, mat3, explainID)
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
				explainText = explainText + String(mat1.data[i][k]) + " * " + String(mat2.data[k][j]);
				this.cmd("SetText", explainID, explainText);
				this.cmd("Step");
				this.cmd("SetHighlight", mat1.dataID[i][k], 0);	
				this.cmd("SetHighlight", mat2.dataID[k][j], 0);				
			}
			value = this.standardize(value);
			explainText += " = " + String(value);
			this.cmd("SetText", explainID, explainText);
			mat3.data[i][j] = value;
			this.cmd("SetText", mat3.dataID[i][j], value);
			this.cmd("Step");
		}
	}
	this.cmd("SetText", explainID, "");
	
	
}

RotateTranslate2D.prototype.standardize = function(lab)
{
	var newLab =  Math.round(lab * 1000) / 1000;
	if (isNaN(newLab))
	{
		return lab;
	}
	else
	{
		return newLab;
	}
}


RotateTranslate2D.prototype.resetMatrixLabels = function(mat)
{
	var i,j;
	for (i = 0; i < mat.data.length; i++)
	{
		for (j = 0; j < mat.data[i].length; j++)
		{
			mat.data[i][j] = this.standardize(mat.data[i][j]);
			this.cmd("SetText", mat.dataID[i][j], mat.data[i][j]);
		}		
	}
}



RotateTranslate2D.prototype.moveMatrix = function(mat, x, y)
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
	this.cmd("Move", mat.leftBrack3, x, y +  height * RotateTranslate2D.MATRIX_ELEM_HEIGHT);
	
	this.cmd("Move", mat.rightBrack1,  x + width * RotateTranslate2D.MATRIX_ELEM_WIDTH, y);
	this.cmd("Move", mat.rightBrack2,   x + width * RotateTranslate2D.MATRIX_ELEM_WIDTH, y);
	this.cmd("Move", mat.rightBrack3,  x+ width * RotateTranslate2D.MATRIX_ELEM_WIDTH, y +  height * RotateTranslate2D.MATRIX_ELEM_HEIGHT);
	
	for (i = 0; i < mat.data.length; i++)
	{
		for (j = 0; j < mat.data[i].length; j++)
		{
			this.cmd("Move", mat.dataID[i][j], 
					 x + j*RotateTranslate2D.MATRIX_ELEM_WIDTH + RotateTranslate2D.MATRIX_ELEM_WIDTH / 2,
					 y + i*RotateTranslate2D.MATRIX_ELEM_HEIGHT + RotateTranslate2D.MATRIX_ELEM_HEIGHT / 2);
		}		
	}
}

RotateTranslate2D.prototype.deleteMatrix = function(mat)
{
	this.cmd("Delete",mat.leftBrack1);
	this.cmd("Delete",mat.leftBrack2);
	this.cmd("Delete",mat.leftBrack3);
	this.cmd("Delete",mat.rightBrack1);
	this.cmd("Delete",mat.rightBrack2);
	this.cmd("Delete",mat.rightBrack3);
	var i,j;
	for (i = 0; i < mat.data.length; i++)
	{
		for (j = 0; j < mat.data[i].length; j++)
		{
			this.cmd("Delete", mat.dataID[i][j]);
		}		
	}
}

RotateTranslate2D.prototype.setMatrixAlpha = function(mat, alpha)
{
	this.cmd("SetAlpha",mat.leftBrack1, alpha);
	this.cmd("SetAlpha",mat.leftBrack2, alpha);
	this.cmd("SetAlpha",mat.leftBrack3, alpha);
	this.cmd("SetAlpha",mat.rightBrack1, alpha);
	this.cmd("SetAlpha",mat.rightBrack2, alpha);
	this.cmd("SetAlpha",mat.rightBrack3, alpha);
	var i,j;
	for (i = 0; i < mat.data.length; i++)
	{
		for (j = 0; j < mat.data[i].length; j++)
		{
			this.cmd("SetAlpha", mat.dataID[i][j], alpha);
		}		
	}
}


RotateTranslate2D.prototype.createMatrix = function(contents, x, y)
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
	this.cmd("CreateRectangle", mat.leftBrack2, "", 1, height * RotateTranslate2D.MATRIX_ELEM_HEIGHT,  x, y, "center","top");
	this.cmd("CreateRectangle", mat.leftBrack3, "", 5, 1,  x, y +  height * RotateTranslate2D.MATRIX_ELEM_HEIGHT , "left","center");

	this.cmd("CreateRectangle", mat.rightBrack1, "", 5, 1,  x + width * RotateTranslate2D.MATRIX_ELEM_WIDTH, y, "right","center");
	this.cmd("CreateRectangle", mat.rightBrack2, "", 1, height * RotateTranslate2D.MATRIX_ELEM_HEIGHT,  x + width * RotateTranslate2D.MATRIX_ELEM_WIDTH, y, "center","top");
	this.cmd("CreateRectangle", mat.rightBrack3, "", 5, 1,  x+ width * RotateTranslate2D.MATRIX_ELEM_WIDTH, y +  height * RotateTranslate2D.MATRIX_ELEM_HEIGHT , "right","center");
	
	for (i = 0; i < mat.data.length; i++)
	{
		for (j = 0; j < mat.data[i].length; j++)
		{
			this.cmd("CreateLabel", mat.dataID[i][j], mat.data[i][j], 
					 x + j*RotateTranslate2D.MATRIX_ELEM_WIDTH + RotateTranslate2D.MATRIX_ELEM_WIDTH / 2,
					 y + i*RotateTranslate2D.MATRIX_ELEM_HEIGHT + RotateTranslate2D.MATRIX_ELEM_HEIGHT / 2);
		}		
	}
	return mat;
}

var currentAlg;

function init()
{
	var animManag = initCanvas();
	currentAlg = new RotateTranslate2D(animManag, canvas.width, canvas.height);
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


