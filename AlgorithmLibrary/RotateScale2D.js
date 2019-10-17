// Copyright 2011 David Galles, University of San Francisco. All rights reserved.
//
// Redistribution and use in source and binary forms, with or without modification, areobjectVertexLocalPosition
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



function RotateScale2D(am, w, h)
{
	this.init(am, w, h);
}


RotateScale2D.prototype = new Algorithm();
RotateScale2D.prototype.constructor = RotateScale2D;
RotateScale2D.superclass = Algorithm.prototype;

RotateScale2D.XAxisYPos = 300;
RotateScale2D.XAxisStart = 100;
RotateScale2D.XAxisEnd = 700;


RotateScale2D.MATRIX_START_X = 10;
RotateScale2D.MATRIX_START_Y = 10;
RotateScale2D.MATRIX_MULTIPLY_SPACING = 10;
RotateScale2D.EQUALS_SPACING = 30;



RotateScale2D.YAxisXPos = 400;
RotateScale2D.YAxisStart = 100;
RotateScale2D.YAxisEnd = 500;

RotateScale2D.MATRIX_ELEM_WIDTH = 50;
RotateScale2D.MATRIX_ELEM_HEIGHT = 20;

RotateScale2D.OBJECTS = [
						 [[100, 100], [-100, 100], [-100,-100], [100, -100]], // Square
						 [[10, 100], [-10, 100], [-10,-100], [100, -100], [100, -80], [10,-80]], // L
						 [[0, 141], [-134, 44], [-83, -114 ], [83, -114], [134,44]], // Pentagon
						 [[0, 141], [-35,48],[-134, 44], [-57, -19], [-83, -114 ], [0, -60],[83,-114], [57, -19], [134,44], [35, 48]], // Star
						 ]


RotateScale2D.AXIS_COLOR = "#0000FF"
RotateScale2D.VERTEX_FOREGORUND_COLOR = "#000000";
RotateScale2D.VERTEX_BACKGROUND_COLOR = RotateScale2D.VERTEX_FOREGORUND_COLOR;
RotateScale2D.EDGE_COLOR = "#000000";



RotateScale2D.TRANSFORMED_VERTEX_FOREGORUND_COLOR = "#66FF66";
RotateScale2D.TRANSFORMED_VERTEX_BACKGROUND_COLOR = RotateScale2D.VERTEX_FOREGORUND_COLOR;
RotateScale2D.TRANSFORMED_EDGE_COLOR = "#66FF66";




RotateScale2D.VECTOR_COLOR = "#FF0000";

RotateScale2D.VERTEX_WIDTH = 3;
RotateScale2D.VERTEX_HEIGHT = RotateScale2D.VERTEX_WIDTH;

RotateScale2D.prototype.init = function(am, w, h)
{
	var sc = RotateScale2D.superclass.init.call(this, am, w, h);
	this.rowMajor = true;
	this.posYUp = true;
	this.rotateFirst = true;
	this.addControls();
	this.currentShape = 0;
	
	this.commands = [];
	this.nextIndex = 0;

	this.setupAxis();
	
	this.savedNextIndex = this.nextIndex;
	this.setupObject();
	this.setupObjectGraphic();

	this.animationManager.StartNewAnimation(this.commands);
	this.animationManager.skipForward();
	this.animationManager.clearHistory();
	this.clearHistory();
	
	
}

RotateScale2D.prototype.setupAxis =  function()
{
	this.xAxisLeft = this.nextIndex++;
	this.xAxisRight = this.nextIndex++;
	this.yAxisTop = this.nextIndex++;
	this.yAxisBottom = this.nextIndex++;
	
	this.xAxisLabel = this.nextIndex++;
	this.yAxisLabel = this.nextIndex++;
	
	this.originID = this.nextIndex++;
	
	this.cmd("CreateRectangle", this.originID, "", 0, 0, RotateScale2D.YAxisXPos, RotateScale2D.XAxisYPos);

	
	this.cmd("CreateRectangle", this.xAxisLeft, "", 0, 0, RotateScale2D.XAxisStart, RotateScale2D.XAxisYPos);
	this.cmd("SetAlpha", this.xAxisLeft, 0);
	this.cmd("CreateRectangle", this.xAxisRight, "", 0, 0,  RotateScale2D.XAxisEnd, RotateScale2D.XAxisYPos);
	this.cmd("SetAlpha", this.xAxisRight, 0);
	this.cmd("Connect", this.xAxisLeft, this.xAxisRight, RotateScale2D.AXIS_COLOR, 0, 1, "");
	this.cmd("Connect", this.xAxisRight, this.xAxisLeft, RotateScale2D.AXIS_COLOR, 0, 1, "");

	
	this.cmd("CreateRectangle", this.yAxisTop, "", 0, 0,  RotateScale2D.YAxisXPos, RotateScale2D.YAxisStart);
	this.cmd("SetAlpha", this.yAxisTop, 0);
	this.cmd("CreateRectangle", this.yAxisBottom, "", 0, 0, RotateScale2D.YAxisXPos, RotateScale2D.YAxisEnd);
	this.cmd("SetAlpha", this.yAxisBottom, 0);
	this.cmd("Connect", this.yAxisTop, this.yAxisBottom, RotateScale2D.AXIS_COLOR, 0, 1, "");
	this.cmd("Connect", this.yAxisBottom, this.yAxisTop, RotateScale2D.AXIS_COLOR, 0, 1, "");
	if (this.posYUp)
	{
		this.cmd("CreateLabel", this.yAxisLabel, "+y", RotateScale2D.YAxisXPos + 10, RotateScale2D.YAxisStart + 10);
	}
	else
	{
		this.cmd("CreateLabel", this.yAxisLabel, "+y", RotateScale2D.YAxisXPos + 10, RotateScale2D.YAxisEnd - 10);
	}
	this.cmd("CreateLabel", this.xAxisLabel, "+x", RotateScale2D.XAxisEnd - 10, RotateScale2D.XAxisYPos - 10);
	this.cmd("SetForegroundColor", this.yAxisLabel, RotateScale2D.AXIS_COLOR);
	this.cmd("SetForegroundColor", this.xAxisLabel, RotateScale2D.AXIS_COLOR);
}


RotateScale2D.prototype.setupObject =  function()
{
	this.objectVertexPosition = RotateScale2D.OBJECTS[this.currentShape].slice(0);	
}


RotateScale2D.prototype.worldToScreenSpace = function(point)
{
	var transformedPoint = new Array(2);
	transformedPoint[0] = point[0] + RotateScale2D.YAxisXPos;
	if (this.posYUp)
	{
		transformedPoint[1] = RotateScale2D.XAxisYPos - point[1];		
	}
	else
	{
		transformedPoint[1] = RotateScale2D.XAxisYPos + point[1];		
		
	}
	return transformedPoint;
}



RotateScale2D.prototype.moveObjectToNewPosition = function()
{
	var i;
	for (i = 0; i < this.objectVertexID.length; i++)
	{
		var point = this.worldToScreenSpace(this.objectVertexPosition[i]);
		this.cmd("Move", this.objectVertexID[i], point[0], point[1]);
	}
	
}


RotateScale2D.prototype.setupObjectGraphic =  function()
{
	this.objectVertexID = new Array(this.objectVertexPosition.length);
	var i;
	for (i = 0; i < this.objectVertexPosition.length; i++)
	{
		this.objectVertexID[i] = this.nextIndex++;
		var point = this.worldToScreenSpace(this.objectVertexPosition[i]);
		
		this.cmd("CreateRectangle", this.objectVertexID[i], "", RotateScale2D.VERTEX_WIDTH, RotateScale2D.VERTEX_HEIGHT, point[0], point[1]);
		this.cmd("SetForegroundColor", this.objectVertexID[i], RotateScale2D.VERTEX_FOREGORUND_COLOR);
		this.cmd("SetBackgroundColor", this.objectVertexID[i], RotateScale2D.VERTEX_BACKGROUND_COLOR);
	}
	for (i = 1; i < this.objectVertexID.length; i++)
	{
		this.cmd("Connect", this.objectVertexID[i-1], this.objectVertexID[i], RotateScale2D.EDGE_COLOR, 0, 0, "");
	}
	this.cmd("Connect", this.objectVertexID[this.objectVertexID.length - 1], this.objectVertexID[0], RotateScale2D.EDGE_COLOR, 0, 0, "");
}

RotateScale2D.prototype.addControls =  function()
{
	this.controls = [];
	
	addLabelToAlgorithmBar("Rotation Angle");
						   
	this.rotationField = addControlToAlgorithmBar("Text", "");
	this.rotationField.onkeydown = this.returnSubmitFloat(this.rotationField,  this.transformCallback.bind(this), 4, true);
	this.controls.push(this.rotationField);
	
	addLabelToAlgorithmBar("Scale X");
	
	this.scaleXField = addControlToAlgorithmBar("Text", "");
	this.scaleXField.onkeydown = this.returnSubmitFloat(this.scaleXField,  this.transformCallback.bind(this), 4, true);
	this.controls.push(this.scaleXField);

	
	addLabelToAlgorithmBar("Scale Y");
	
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

	var radioButtonList = addRadioButtonGroupToAlgorithmBar(["Rotate, then scale", 
															 "Scale, then rotate", 
															 ], 
															"RotateFirst");
	this.rotateScaleButton = radioButtonList[0];
	this.rotateScaleButton.onclick = this.rotateScaleOrderCallback.bind(this, true);
	this.controls.push(this.rotateScaleButton);
	
	this.scaleRotateButton = radioButtonList[1];
	this.scaleRotateButton.onclick = this.rotateScaleOrderCallback.bind(this, false);
	this.controls.push(this.scaleRotateButton);
	
	this.rotateScaleButton.checked = this.rotateFirst;
	this.scaleRotateButton.checked = !this.rotateFirst;
	
	var changeShapeButton = addControlToAlgorithmBar("Button", "Change Shape");
	changeShapeButton.onclick = this.changeShapeCallback.bind(this);
	
	this.controls.push(changeShapeButton);
	
}






RotateScale2D.prototype.reset = function()
{
	this.rowMajor = true;
	this.posYUp = true;
	this.rotateFirst = true;
	this.currentShape = 0;
	this.rowMajorButton.checked = this.rowMajor;
	this.posYUpButton.checked = this.posYUp;
	this.rotateScaleButton.checked = this.rotateFirst;
	
	this.nextIndex = this.savedNextIndex;
	this.setupObject();
	this.setupObjectGraphic();
}


RotateScale2D.prototype.enableUI = function(event)
{
	for (var i = 0; i < this.controls.length; i++)
	{
		this.controls[i].disabled = false;
	}
	
	
}
RotateScale2D.prototype.disableUI = function(event)
{
	for (var i = 0; i < this.controls.length; i++)
	{
		this.controls[i].disabled = true;
	}
}



RotateScale2D.prototype.changePosYCallback = function(posYUp) 
{
	if (this.posYUp != posYUp)
	{
		this.implementAction(this.changePosY.bind(this),  posYUp);
	}
}

RotateScale2D.prototype.changePosY = function(posYUp)
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
		this.cmd("Move", this.yAxisLabel,  RotateScale2D.YAxisXPos + 10, RotateScale2D.YAxisStart + 10);
	}
	else
	{
		this.cmd("Move", this.yAxisLabel,  RotateScale2D.YAxisXPos + 10, RotateScale2D.YAxisEnd - 10);
		
	}
	
	this.moveObjectToNewPosition();
		
	
	
	
	// Move +y on axis up/down
	return this.commands;				
}



RotateScale2D.prototype.changeRowColMajorCallback = function(rowMajor) 
{
	if (this.rowMajor != rowMajor)
	{
		this.implementAction(this.changeRowCol.bind(this),  rowMajor);
	}
}

RotateScale2D.prototype.changeRowCol = function(rowMajor)
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
	return this.commands;				
}


RotateScale2D.prototype.fixNumber = function(value, defaultVal)
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

RotateScale2D.prototype.transformCallback = function()
{
	
	
	this.rotationField.value = this.fixNumber(this.rotationField.value, "0");
	this.scaleXField.value = this.fixNumber(this.scaleXField.value, "1");
	this.scaleYField.value = this.fixNumber(this.scaleYField.value, "1");
	this.implementAction(this.transform.bind(this), this.rotationField.value + ";" + this.scaleXField.value + ";" + this.scaleYField.value);
	
}


RotateScale2D.prototype.changeShapeCallback = function()
{
	this.implementAction(this.changeShape.bind(this), 0);	
}

RotateScale2D.prototype.changeShape = function()
{
	this.commands = [];
	var i;
	for (i = 0; i < this.objectVertexID.length; i++)
	{
		this.cmd("Delete", this.objectVertexID[i]);
	}
	this.currentShape++;
	if (this.currentShape >= RotateScale2D.OBJECTS.length)
	{
		this.currentShape = 0;
	}
	this.setupObject();
	this.setupObjectGraphic();
	return this.commands;
}

RotateScale2D.prototype.rotateScaleOrderCallback = function(rotateFirst) 
{
	if (this.rotateFirst != rotateFirst)
	{
			this.implementAction(this.rotateScaleOrder.bind(this),  rotateFirst);
	}
}


RotateScale2D.prototype.rotateScaleOrder = function(rotateFirst)
{
	this.commands = new Array();
	this.rotateFirst= rotateFirst;		
	if (this.rotateScaleButton.checked != this.rotateFirst)
	{
		this.rotateScaleButton.checked = this.rotateFirst;
	}
	if (this.scaleRotateButton.checked == this.rotateFirst)
	{
		this.scaleRotateButton.checked = !this.rotateFirst;
	}
	return this.commands;				
}


function toRadians(degrees)
{
	return (degrees * 2 * Math.PI) / 360.0; 	
}

RotateScale2D.prototype.transform = function(input)
{
	var oldNextIndex = this.nextIndex;
	this.commands = [];
	var inputs = input.split(";");
	var rotateDegree = toRadians(parseFloat(inputs[0]));
	var scaleX  = parseFloat(inputs[1]);
	var scaleY   = parseFloat(inputs[2]);
		
	var xpos = RotateScale2D.MATRIX_START_X;
	var ypos = RotateScale2D.MATRIX_START_Y;
	if (!this.rowMajor)
	{
		xpos += 2 * RotateScale2D.MATRIX_ELEM_WIDTH + RotateScale2D.EQUALS_SPACING;
	}
	
	var xy;
	if (this.rowMajor)
	{
		xy = this.createMatrix([["x", "y"]], xpos, ypos);		
		xpos += xy.data[0].length * RotateScale2D.MATRIX_ELEM_WIDTH + RotateScale2D.MATRIX_MULTIPLY_SPACING;
		
	}
	
	var matrixData;
	if (this.rotateFirst)
	{
		if (this.rowMajor)
		{
			matrixData = [["cos \u0398", "sin \u0398"], ["-sin \u0398", "cos \u0398"]]			
		}
		else
		{
			matrixData = [["ScaleX", "0"], ["0", "ScaleY"]];						
		}
	
	}
	else
	{
		if (this.rowMajor)
		{
			matrixData = [["ScaleX", "0"], ["0", "ScaleY"]];			
		}
		else
		{
			matrixData = [["cos \u0398", "-sin \u0398"], ["sin \u0398", "cos \u0398"]]
			
		}
	}
	
	
	var firstMat = this.createMatrix(matrixData, xpos, ypos);
	
	xpos += firstMat.data[0].length * RotateScale2D.MATRIX_ELEM_WIDTH + RotateScale2D.MATRIX_MULTIPLY_SPACING;

	
	if (this.rotateFirst)
	{		
		if (this.rowMajor)
		{
			matrixData = [["ScaleX", "0"], ["0", "ScaleY"]];			
		}
		else
		{
			matrixData = [["cos \u0398", "-sin \u0398"], ["sin \u0398", "cos \u0398"]]
			
		}		
	}
	else
	{
		if (this.rowMajor)
		{
			matrixData = [["cos \u0398", "sin \u0398"], ["-sin \u0398", "cos \u0398"]]			
		}
		else
		{
			matrixData = [["ScaleX", "0"], ["0", "ScaleY"]];						
		}
	}
	
	var secondMat = this.createMatrix(matrixData,xpos, ypos);
	xpos += secondMat.data[0].length * RotateScale2D.MATRIX_ELEM_WIDTH;
	
	if (!this.rowMajor)
	{
		xpos += RotateScale2D.MATRIX_MULTIPLY_SPACING;
		xy = this.createMatrix([["x"], ["y"]], xpos, ypos);		
		xpos += xy.data[0].length * RotateScale2D.MATRIX_ELEM_WIDTH;
	}
	
	this.cmd("Step");
	
	var rotMat, scaleMat
	if ((this.rotateFirst  && this.rowMajor) || (!this.rotateFirst && !this.rowMajor))
	{
		rotMat = firstMat;
		scaleMat = secondMat;
	}
	else
	{
		rotMat = secondMat;
		scaleMat = firstMat;
		
	}
	
	if (this.rowMajor)
	{
		rotMat.data = [["cos " + inputs[0], "sin " + inputs[0]],["-sin " +inputs[0], "cos " + inputs[0]]];
	}
	else
	{
		rotMat.data = [["cos " + inputs[0], "-sin " + inputs[0]],["sin " +inputs[0], "cos " + inputs[0]]];		
	}
	this.resetMatrixLabels(rotMat);
	
	scaleMat.data = [[scaleX, 0],[0, scaleY]];
	this.resetMatrixLabels(scaleMat);
	
	this.cmd("Step");	
	
	if (this.rowMajor)
	{
		rotMat.data = [[Math.cos(rotateDegree), Math.sin(rotateDegree)],[-Math.sin(rotateDegree), Math.cos(rotateDegree)]];
	}
	else
	{
		rotMat.data = [[Math.cos(rotateDegree), -Math.sin(rotateDegree)],[Math.sin(rotateDegree), Math.cos(rotateDegree)]];		
	}
	this.resetMatrixLabels(rotMat);
	this.cmd("Step");
	this.setMatrixAlpha(xy, 0.3);


	var equalID = this.nextIndex++;
	var equaXlPos;
	if (this.rowMajor)
	{
		equalXPos = xpos + RotateScale2D.EQUALS_SPACING / 2;
	}
	else
	{
		equalXPos = RotateScale2D.MATRIX_START_X + 2 * RotateScale2D.MATRIX_ELEM_WIDTH + RotateScale2D.EQUALS_SPACING / 2;
	}
	
	this.cmd("CreateLabel", equalID, "=", equalXPos, ypos + rotMat.data.length / 2 * RotateScale2D.MATRIX_ELEM_HEIGHT);

	xpos += RotateScale2D.EQUALS_SPACING;
			 	
	
	var paren1 = this.nextIndex++
	var paren2 = this.nextIndex++
	var paren3 = this.nextIndex++
	var paren4 = this.nextIndex++
	
	var parenX;
	parenX  =  2 * RotateScale2D.MATRIX_ELEM_WIDTH + RotateScale2D.MATRIX_START_X + RotateScale2D.MATRIX_MULTIPLY_SPACING - 2;
	if (!this.rowMajor)
	{
		parenX += RotateScale2D.EQUALS_SPACING - RotateScale2D.MATRIX_MULTIPLY_SPACING;
	}
		
	this.cmd("CreateRectangle", paren1, "", 0, 0, parenX, RotateScale2D.MATRIX_START_Y, "center","center");
	this.cmd("CreateRectangle", paren2, "", 0, 0,  parenX, RotateScale2D.MATRIX_START_Y + 2*RotateScale2D.MATRIX_ELEM_HEIGHT, "center","center");
	this.cmd("Connect", paren1, paren2, "#000000", 0.2, 0, "");

	parenX = 6*RotateScale2D.MATRIX_ELEM_WIDTH + RotateScale2D.MATRIX_START_X + 2*RotateScale2D.MATRIX_MULTIPLY_SPACING + 2;
	if (!this.rowMajor)
	{
		parenX += RotateScale2D.EQUALS_SPACING - RotateScale2D.MATRIX_MULTIPLY_SPACING;
	}
	
	this.cmd("CreateRectangle", paren3, "", 0, 0,  parenX, RotateScale2D.MATRIX_START_Y, "center","center");
	this.cmd("CreateRectangle", paren4, "", 0, 0,  parenX, RotateScale2D.MATRIX_START_Y+ 2*RotateScale2D.MATRIX_ELEM_HEIGHT, "center","center");

	this.cmd("Connect", paren3, paren4, "#000000", -0.2, 0 ,"");
	
	this.cmd("Step");
	var tmpMat;
	if (this.rowMajor)
	{
		tmpMat = this.createMatrix([["",""],["",""]],xpos, ypos);
	}
	else
	{
		tmpMat = this.createMatrix([["",""],["",""]],RotateScale2D.MATRIX_START_X, RotateScale2D.MATRIX_START_Y);		
	}
	var explainID = this.nextIndex++;
	if (this.rowMajor)
	{
		this.cmd("CreateLabel", explainID, "",  6*RotateScale2D.MATRIX_ELEM_WIDTH + 2*RotateScale2D.MATRIX_MULTIPLY_SPACING + 
				 RotateScale2D.EQUALS_SPACING + RotateScale2D.MATRIX_START_X, 20 + 2*RotateScale2D.MATRIX_ELEM_HEIGHT, 0);
	}
	else
	{
		this.cmd("CreateLabel", explainID, "",  RotateScale2D.MATRIX_START_X, 20 + 2*RotateScale2D.MATRIX_ELEM_HEIGHT, 0);		
	}
	this.cmd("Step");
	this.multiplyMatrix(firstMat, secondMat, tmpMat, explainID);
	
	
	this.deleteMatrix(firstMat);
	this.deleteMatrix(secondMat);
	this.cmd("Delete", paren1);
	this.cmd("Delete", paren2);
	this.cmd("Delete", paren3);
	this.cmd("Delete", paren4);
	this.cmd("Delete", equalID);
	
	if (this.rowMajor)
	{
		this.moveMatrix(tmpMat,  xy.data[0].length * RotateScale2D.MATRIX_ELEM_WIDTH + RotateScale2D.MATRIX_MULTIPLY_SPACING + RotateScale2D.MATRIX_START_X,
									RotateScale2D.MATRIX_START_Y);
		xpos = (RotateScale2D.MATRIX_START_X + xy.data[0].length*RotateScale2D.MATRIX_ELEM_WIDTH + 
				RotateScale2D.MATRIX_MULTIPLY_SPACING + tmpMat.data[0].length * RotateScale2D.MATRIX_ELEM_WIDTH);
			this.cmd("SetPosition", explainID, 4*RotateScale2D.MATRIX_ELEM_WIDTH + 1*RotateScale2D.MATRIX_MULTIPLY_SPACING + 
					 RotateScale2D.EQUALS_SPACING + RotateScale2D.MATRIX_START_X, 20 + 2*RotateScale2D.MATRIX_ELEM_HEIGHT, 0);		

	}
	else
	{
		this.moveMatrix(tmpMat, RotateScale2D.MATRIX_START_X + 4*RotateScale2D.MATRIX_ELEM_WIDTH + RotateScale2D.EQUALS_SPACING + RotateScale2D.MATRIX_MULTIPLY_SPACING,
						RotateScale2D.MATRIX_START_Y);
		xpos = (RotateScale2D.MATRIX_START_X + 7*RotateScale2D.MATRIX_ELEM_WIDTH + 
				2 * RotateScale2D.MATRIX_MULTIPLY_SPACING + RotateScale2D.EQUALS_SPACING);

		this.cmd("SetPosition", explainID,  7*RotateScale2D.MATRIX_ELEM_WIDTH + 2 * RotateScale2D.EQUALS_SPACING + 3*RotateScale2D.MATRIX_MULTIPLY_SPACING, RotateScale2D.MATRIX_START_Y + 10 + 2*RotateScale2D.MATRIX_ELEM_HEIGHT);
		
	}
	this.setMatrixAlpha(xy, 1);
	this.cmd("Step");
	
			
	var i;
	var output;
	
	
	var transformedObjectID = new Array(this.objectVertexID.length);
	
	for (i = 0; i < this.objectVertexID.length; i++)
	{
		this.cmd("Connect", this.originID, this.objectVertexID[i], RotateScale2D.VECTOR_COLOR, 0, 1, "");
		if (this.rowMajor)
		{			
			xy.data = [this.objectVertexPosition[i].slice(0)];
		}
		else
		{
			xy.data[0][0] = this.objectVertexPosition[i][0];
			xy.data[1][0] = this.objectVertexPosition[i][1];
		}
		this.resetMatrixLabels(xy);
		this.cmd("Step");
		this.cmd("CreateLabel", equalID, "=", xpos + RotateScale2D.EQUALS_SPACING  / 2, ypos + tmpMat.data.length / 2 * RotateScale2D.MATRIX_ELEM_HEIGHT);
		if (this.rowMajor)
		{
			output = this.createMatrix([["",""]],  xpos + RotateScale2D.EQUALS_SPACING, ypos)
			this.multiplyMatrix(xy, tmpMat, output, explainID);
		}
		else
		{
			output = this.createMatrix([[""],[""]],  xpos + RotateScale2D.EQUALS_SPACING, ypos)			
			this.multiplyMatrix(tmpMat, xy, output, explainID);
		}
		
		
		transformedObjectID[i] = this.nextIndex++;
		var point;
		if (this.rowMajor)
		{
			point = this.worldToScreenSpace(output.data[0]);
		}
		else
		{
			point = this.worldToScreenSpace([output.data[0][0], output.data[1][0]]);			
		}
		
		this.cmd("CreateRectangle", transformedObjectID[i], "", RotateScale2D.VERTEX_WIDTH, RotateScale2D.VERTEX_HEIGHT, point[0], point[1]);
		this.cmd("SetForegroundColor", transformedObjectID[i], RotateScale2D.TRANSFORMED_VERTEX_FOREGORUND_COLOR);
		this.cmd("SetBackgroundColor", transformedObjectID[i], RotateScale2D.TRANSFORMED_VERTEX_BACKGROUND_COLOR);
		this.cmd("Connect", this.originID, transformedObjectID[i], RotateScale2D.TRANSFORMED_EDGE_COLOR, 0, 1, "");
		this.cmd("Step");
		this.cmd("Disconnect", this.originID, transformedObjectID[i]);

		if (i > 0)
		{
			this.cmd("Connect", transformedObjectID[i-1], transformedObjectID[i], RotateScale2D.TRANSFORMED_EDGE_COLOR, 0, 0, "");

		}
		
		this.cmd("Disconnect", this.originID, this.objectVertexID[i]);
		if (this.rowMajor)
		{
			this.objectVertexPosition[i] = output.data[0];			
		}
		else
		{
			this.objectVertexPosition[i][0] = output.data[0][0];
			this.objectVertexPosition[i][1] = output.data[1][0];
		}
		this.cmd("Delete", equalID);
		this.deleteMatrix(output);

	}
	this.cmd("Step");

	this.cmd("Connect", transformedObjectID[0], transformedObjectID[transformedObjectID.length-1], RotateScale2D.TRANSFORMED_EDGE_COLOR, 0, 0, "");

	this.cmd("Step","B");
	this.moveObjectToNewPosition();
	this.cmd("Step","C");
	
	for (i = 0; i < transformedObjectID.length; i++)
	{
		this.cmd("Delete", transformedObjectID[i]);
	}
	
	
	this.deleteMatrix(xy);
	this.deleteMatrix(tmpMat);
	this.cmd("Delete", explainID);

	this.nextIndex = oldNextIndex

	return this.commands;
}


RotateScale2D.prototype.multiplyMatrix = function(mat1, mat2, mat3, explainID)
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

RotateScale2D.prototype.standardize = function(lab)
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


RotateScale2D.prototype.resetMatrixLabels = function(mat)
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



RotateScale2D.prototype.moveMatrix = function(mat, x, y)
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
	this.cmd("Move", mat.leftBrack3, x, y +  height * RotateScale2D.MATRIX_ELEM_HEIGHT);
	
	this.cmd("Move", mat.rightBrack1,  x + width * RotateScale2D.MATRIX_ELEM_WIDTH, y);
	this.cmd("Move", mat.rightBrack2,   x + width * RotateScale2D.MATRIX_ELEM_WIDTH, y);
	this.cmd("Move", mat.rightBrack3,  x+ width * RotateScale2D.MATRIX_ELEM_WIDTH, y +  height * RotateScale2D.MATRIX_ELEM_HEIGHT);
	
	for (i = 0; i < mat.data.length; i++)
	{
		for (j = 0; j < mat.data[i].length; j++)
		{
			this.cmd("Move", mat.dataID[i][j], 
					 x + j*RotateScale2D.MATRIX_ELEM_WIDTH + RotateScale2D.MATRIX_ELEM_WIDTH / 2,
					 y + i*RotateScale2D.MATRIX_ELEM_HEIGHT + RotateScale2D.MATRIX_ELEM_HEIGHT / 2);
		}		
	}
}

RotateScale2D.prototype.deleteMatrix = function(mat)
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

RotateScale2D.prototype.setMatrixAlpha = function(mat, alpha)
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


RotateScale2D.prototype.createMatrix = function(contents, x, y)
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
	this.cmd("CreateRectangle", mat.leftBrack2, "", 1, height * RotateScale2D.MATRIX_ELEM_HEIGHT,  x, y, "center","top");
	this.cmd("CreateRectangle", mat.leftBrack3, "", 5, 1,  x, y +  height * RotateScale2D.MATRIX_ELEM_HEIGHT , "left","center");

	this.cmd("CreateRectangle", mat.rightBrack1, "", 5, 1,  x + width * RotateScale2D.MATRIX_ELEM_WIDTH, y, "right","center");
	this.cmd("CreateRectangle", mat.rightBrack2, "", 1, height * RotateScale2D.MATRIX_ELEM_HEIGHT,  x + width * RotateScale2D.MATRIX_ELEM_WIDTH, y, "center","top");
	this.cmd("CreateRectangle", mat.rightBrack3, "", 5, 1,  x+ width * RotateScale2D.MATRIX_ELEM_WIDTH, y +  height * RotateScale2D.MATRIX_ELEM_HEIGHT , "right","center");
	
	for (i = 0; i < mat.data.length; i++)
	{
		for (j = 0; j < mat.data[i].length; j++)
		{
			this.cmd("CreateLabel", mat.dataID[i][j], mat.data[i][j], 
					 x + j*RotateScale2D.MATRIX_ELEM_WIDTH + RotateScale2D.MATRIX_ELEM_WIDTH / 2,
					 y + i*RotateScale2D.MATRIX_ELEM_HEIGHT + RotateScale2D.MATRIX_ELEM_HEIGHT / 2);
		}		
	}
	return mat;
}

var currentAlg;

function init()
{
	var animManag = initCanvas();
	currentAlg = new RotateScale2D(animManag, canvas.width, canvas.height);
}

function Matrix(contents, x, y)
{
	this.data = contents;
	this.x = x;
	this.y = y;
}

