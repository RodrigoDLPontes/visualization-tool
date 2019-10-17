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

// "Class" animatedCircle


var HighlightCircle = function(objectID, color, radius)
{
	this.objectID = objectID;
	this.radius = radius;
	this.thickness = 4;
	this.foregroundColor = color;
	this.x = 0;
	this.y = 0;
	this.alpha = 1;
}

HighlightCircle.prototype = new AnimatedObject();
HighlightCircle.prototype.constructor = HighlightCircle;


HighlightCircle.prototype.draw = function(ctx)
{
	ctx.globalAlpha = this.alpha;
	ctx.strokeStyle = this.foregroundColor;
	ctx.lineWidth = this.thickness;
	ctx.beginPath();
	ctx.arc(this.x,this.y,this.radius,0,Math.PI*2, true);
	ctx.closePath();
	ctx.stroke();
}


HighlightCircle.prototype.createUndoDelete = function()
{
	return new UndoDeleteHighlightCircle(this.objectID, this.x, this.y, this.foregroundColor, this.radius, this.layer, this.alpha);
}

		
function UndoDeleteHighlightCircle(objectID, x, y, circleColor, r, layer, alpha)
{
	this.objectID = objectID;
	this.x = x;
	this.y = y;
	this.color = circleColor;
	this.r = r;
	this.layer = layer;
	this.alpha = alpha
}
		
UndoDeleteHighlightCircle.prototype = new UndoBlock();
UndoDeleteHighlightCircle.prototype.constructor = UndoDeleteHighlightCircle;

UndoDeleteHighlightCircle.prototype.undoInitialStep = function(world)
{
	world.addHighlightCircleObject(this.objectID, this.color, this.r);
	world.setLayer(this.objectID, this.layer)
	world.setNodePosition(this.objectID, this.x, this.y);
	world.setAlpha(this.objectID, this.alpha)
}




