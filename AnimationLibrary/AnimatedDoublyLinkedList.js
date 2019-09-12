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

function AnimatedDoublyLinkedList(id, val, wth, hgt, linkPer, numLab, fillColor, edgeColor)
{
	this.init(id, val, wth, hgt, linkPer, numLab, fillColor, edgeColor);
}

AnimatedDoublyLinkedList.prototype = new AnimatedObject();
AnimatedDoublyLinkedList.prototype.constructor = AnimatedDoublyLinkedList;
AnimatedDoublyLinkedList.superclass = AnimatedObject.prototype;


AnimatedDoublyLinkedList.prototype.init = function(id, val, wth, hgt, linkPer, numLab, fillColor, edgeColor)
{

	AnimatedDoublyLinkedList.superclass.init.call(this);

	this.w = wth;
	this.h = hgt;
	this.backgroundColor = fillColor;
	this.foregroundColor = edgeColor;

	this.linkPercent = linkPer;

	this.numLabels = numLab;

	this.labels = [];
	this.labelPosX = [];
	this.labelPosY = [];
	this.labelColors = [];
	this.prevNullPointer = false;
    this.nextNullPointer = false;

	this.currentHeightDif = 6;
	this.maxHeightDiff = 5;
	this.minHeightDiff = 3;



	for (var i = 0; i < this.numLabels; i++)
	{
		this.labels[i] = "";
		this.labelPosX[i] = 0;
		this.labelPosY[i] = 0;
		this.labelColors[i] = this.foregroundColor;
	}

	this.labels[0] = val;
	this.highlighted = false;
	this.objectID = id;
}



AnimatedDoublyLinkedList.prototype.setPrevNull = function(np)
{
	if (this.prevNullPointer != np)
	{
		this.prevNullPointer = np;
	}
}

AnimatedDoublyLinkedList.prototype.setNextNull = function(np)
{
	if (this.nextNullPointer != np)
	{
		this.nextNullPointer = np;
	}
}

AnimatedDoublyLinkedList.prototype.getLeftNull = function()
{
	return this.prevNullPointer;
}

AnimatedDoublyLinkedList.prototype.getRightNull = function()
{
	return this.nextNullPointer;
}

AnimatedDoublyLinkedList.prototype.left = function()
{
	return this.x - ((this.w * (1 - this.linkPercent)) / 2);
}

AnimatedDoublyLinkedList.prototype.right = function()
{
	return this.x + ((this.w * (this.linkPercent + 1)) / 2);
}

AnimatedDoublyLinkedList.prototype.top = function()
{
	return this.y - this.h / 2.0;
}

AnimatedDoublyLinkedList.prototype.bottom = function()
{
	return this.y + this.h / 2.0;
}


// TODO: Should we move this to the draw function, and save the
//       space of the arrays?  Bit of a leftover from the Flash code,
//       which did drawing differently
AnimatedDoublyLinkedList.prototype.resetTextPosition = function()
{
	this.labelPosY[0] = this.y;
	this.labelPosX[0] = this.left() + this.w * (this.linkPercent * 2); //* (1 / this.numLabels - 1);
	for (var i = 1; i < this.numLabels; i++)
	{
		this.labelPosY[i] = this.y;
		this.labelPosX[i] = this.labelPosX[i-1] +  this.w*(1-this.linkPercent)/this.numLabels;
	}
}


AnimatedDoublyLinkedList.prototype.getTailPointerAttachPos = function(fromX, fromY, anchor)
{
    if(anchor == 0)
    {
        return [this.x + this.w / 2.0, this.y - (this.h * 0.2)];
    }
    else
    {
        return [this.left() + (this.w * this.linkPercent) / 2, this.y + (this.h * 0.2)];
    }
}


AnimatedDoublyLinkedList.prototype.getHeadPointerAttachPos = function(fromX, fromY)
{
    var closest = this.getClosestCardinalPoint(fromX, fromY)
    if(closest[1] == this.y)
    {
        if(closest[0] == this.left())
        {
            return [closest[0], this.y - (this.h * 0.2)];
        }
        else
        {
            return [closest[0], this.y + (this.h * 0.2)];
        }
    }
    else
    {
        return [closest[0], closest[1]]
    }
}


AnimatedDoublyLinkedList.prototype.setWidth = function(wdth)
{
	this.w = wdth;
	this.resetTextPosition();
}


AnimatedDoublyLinkedList.prototype.setHeight = function(hght)
{
	this.h = hght;
	this.resetTextPosition();
}

AnimatedDoublyLinkedList.prototype.getWidth = function()
{
	return this.w;
}

AnimatedDoublyLinkedList.prototype.getHeight = function()
{
	return this.h;
}

AnimatedDoublyLinkedList.prototype.draw = function(context)
{
	var startX;
	var startY;

	startX = this.left();
	startY = this.top();

    // Highlighted edges
	if (this.highlighted)
	{
		context.strokeStyle = "#ff0000";
		context.fillStyle = "#ff0000";

		context.beginPath();
		context.moveTo(startX - this.highlightDiff,startY- this.highlightDiff);
		context.lineTo(startX+this.w + this.highlightDiff,startY- this.highlightDiff);
		context.lineTo(startX+this.w+ this.highlightDiff,startY+this.h + this.highlightDiff);
		context.lineTo(startX - this.highlightDiff,startY+this.h + this.highlightDiff);
		context.lineTo(startX - this.highlightDiff,startY - this.highlightDiff);
		context.closePath();
		context.stroke();
		context.fill();
	}

    // Node edges
	context.strokeStyle = this.foregroundColor;
	context.fillStyle = this.backgroundColor;

	context.beginPath();
	context.moveTo(startX, startY);
	context.lineTo(startX + this.w, startY);
	context.lineTo(startX + this.w, startY + this.h);
	context.lineTo(startX, startY + this.h);
	context.lineTo(startX, startY);
	context.closePath();
	context.stroke();
	context.fill();

    // Multiple label stuff (might be able to remove)
	var i;
	startY = this.top();
	for (i = 1; i < this.numLabels; i++)
	{
		startX = this.x + this.w*(1-this.linkPercent)*(i / this.numLabels - 1/2);
		context.beginPath();
		context.moveTo(startX ,startY);
		context.lineTo(startX, startY + this.h);
		context.closePath();
		context.stroke();
	}

    // Left inner line between node and pointer area
	startX = this.left() + this.w * this.linkPercent;
	startY = this.top();

	context.beginPath();
	context.moveTo(startX, startY + this.h);
	context.lineTo(startX, startY);
	if (this.prevNullPointer)
	{
        // Left null marker
        context.moveTo(this.left(), startY);
		context.lineTo(this.left() + this.w * this.linkPercent, startY + this.h);
	}
	context.closePath();
	context.stroke();

    // Right inner line between node and pointer area
	startX = this.right() - this.w * this.linkPercent;
	startY = this.top();

	context.beginPath();
	context.moveTo(startX, startY + this.h);
	context.lineTo(startX, startY);
	if (this.nextNullPointer)
	{
        // Right null marker
		context.moveTo(this.right() - this.w * this.linkPercent, startY);
		context.lineTo(this.right(), startY + this.h);
	}
	context.closePath();
	context.stroke();


    // Label
	context.textAlign = 'center';
	context.font = '10px sans-serif';
	context.textBaseline = 'middle';
	context.lineWidth = 1;


	this.resetTextPosition();
	for (i = 0; i < this.numLabels; i++)
	{
		context.fillStyle = this.labelColors[i];
		context.fillText(this.labels[i], this.labelPosX[i], this.labelPosY[i]);
	}
}



AnimatedDoublyLinkedList.prototype.setTextColor = function(color, textIndex)
{
	this.labelColors[textIndex] = color;
}



AnimatedDoublyLinkedList.prototype.getTextColor = function(textIndex)
{
	return this.labelColors[textIndex];
}



AnimatedDoublyLinkedList.prototype.getText = function(index)
{
	return this.labels[index];
}

AnimatedDoublyLinkedList.prototype.setText = function(newText, textIndex)
{
	this.labels[textIndex] = newText;
	this.resetTextPosition();
}







AnimatedDoublyLinkedList.prototype.createUndoDelete = function()
{
	return new UndoDeleteDoublyLinkedList(this.objectID, this.numLabels, this.labels, this.x, this.y, this.w, this.h, this.linkPercent,
									this.labelColors, this.backgroundColor, this.foregroundColor, this.layer, this.prevNullPointer, this.nextNullPointer);
}

AnimatedDoublyLinkedList.prototype.setHighlight = function(value)
{
	if (value != this.highlighted)
	{
		this.highlighted = value;
	}
}




function UndoDeleteDoublyLinkedList(id, numlab, lab, x, y, w, h, linkper, labColors, bgColor, fgColor, l, lnp, rnp)
{
	this.objectID = id;
	this.posX = x;
	this.posY = y;
	this.width = w;
	this.height = h;
	this.backgroundColor= bgColor;
	this.foregroundColor = fgColor;
	this.labels = lab;
	this.linkPercent = linkper;
	this.labelColors = labColors
	this.layer = l;
	this.numLabels = numlab;
	this.prevNullPointer = lnp;
    this.nextNullPointer = rnp;
}

UndoDeleteDoublyLinkedList.prototype = new UndoBlock();
UndoDeleteDoublyLinkedList.prototype.constructor = UndoDeleteDoublyLinkedList;



UndoDeleteDoublyLinkedList.prototype.undoInitialStep =function(world)
{
	world.addDoublyLinkedListObject(this.objectID,this.labels[0], this.width, this.height, this.linkPercent, this.numLabels, this.backgroundColor, this.foregroundColor);
	world.setNodePosition(this.objectID, this.posX, this.posY);
	world.setLayer(this.objectID, this.layer);
	world.setPrevNull(this.objectID, this.prevNullPointer);
    world.setNextNull(this.objectID, this.nextNullPointer);
	for (var i = 0; i < this.numLabels; i++)
	{
		world.setText(this.objectID, this.labels[i], i);
		world.setTextColor(this.objectID, this.labelColors[i], i);
	}
}
