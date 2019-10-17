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

function AnimatedObject()
{
	this.init();
}

AnimatedObject.prototype.init  = function()
{
	this.backgroundColor = "#FFFFFF";
	this.foregroundColor = "#000000";
	this.highlighted = false;
	this.objectID = -1;
	this.layer = 0;
	this.addedToScene = true;
	this.label = "";
	this.labelColor = "#000000";
	this.alpha = 1.0;
	this.x = 0;
	this.y = 0;
	this.minHeightDiff = 3;
	this.range = 5;
        this.highlightIndex = -1;
        this.highlightIndexDirty = true;
}

AnimatedObject.prototype.alwaysOnTop = false;

AnimatedObject.prototype.setBackgroundColor = function(newColor)
{
	this.backgroundColor = newColor;
}

AnimatedObject.prototype.setForegroundColor = function(newColor)
{
	this.foregroundColor = newColor;
}

AnimatedObject.prototype.setNull = function()
{
	
}

AnimatedObject.prototype.getNull = function()
{
	return false;
}

AnimatedObject.prototype.setAlpha = function(newAlpha)
{
	this.alpha = newAlpha;
}

AnimatedObject.prototype.getAlpha = function()
{
	return this.alpha;
}

AnimatedObject.prototype.setForegroundColor = function(newColor)
{
	this.foregroundColor = newColor;
	this.labelColor = newColor;
}


AnimatedObject.prototype.getHighlight = function()
{
	return this.highlighted;
}

AnimatedObject.prototype.getWidth = function()
{
	// TODO:  Do we want to throw here?  Should always override this ...
	return 0;
}

AnimatedObject.prototype.getHeight = function()
{
	// TODO:  Do we want to throw here?  Should always override this ...
	return 0;
}

AnimatedObject.prototype.setHighlight = function(value)
{
	this.highlighted = value;
}

AnimatedObject.prototype.centerX = function()
{
	return this.x;
}

AnimatedObject.prototype.setWidth = function(newWidth)
{
	// TODO:  Do we want to throw here?  Should always override this ... 
}



AnimatedObject.prototype.centerY = function()
{
	return this.y;
}


AnimatedObject.prototype.getAlignLeftPos = function(otherObject)
{
    return [otherObject.right()+ this.getWidth() / 2, otherObject.centerY()];
}

AnimatedObject.prototype.getAlignRightPos = function(otherObject)
{
	
    return [otherObject.left() - this.getWidth() / 2, otherObject.centerY()];
}

AnimatedObject.prototype.getAlignTopPos = function(otherObject)
{

    return [otherObject.centerX(), otherObject.top() - this.getHeight() / 2];
}
AnimatedObject.prototype.getAlignBottomPos = function(otherObject)
{
    return [otherObject.centerX(), otherObject.bottom() + this.getHeight() / 2];
}


AnimatedObject.prototype.alignLeft = function(otherObject)
{
	// Assuming centering.  Overridden method could modify if not centered
	//  (See AnimatedLabel, for instance)
	this.y = otherObject.centerY();
	this.x = otherObject.right() + this.getWidth() / 2;	
}

AnimatedObject.prototype.alignRight = function(otherObject)
{
	// Assuming centering.  Overridden method could modify if not centered
	//  (See AnimatedLabel, for instance)
	this.y = otherObject.centerY();
	this.x = otherObject.left() - this.getWidth() / 2;	
}


AnimatedObject.prototype.alignTop = function(otherObject)
{
	// Assuming centering.  Overridden method could modify if not centered
	
	this.x = otherObject.centerX();
	this.y = otherObject.top() - this.getHeight() / 2;	
	
	
}


AnimatedObject.prototype.alignBottom = function(otherObject)
{
	this.x = otherObject.centerX();
	this.y = otherObject.bottom() + this.getHeight() / 2;		
	
}



/* TODO:  Do we need these in the base? 		
		function left(): Number
		{
			return x - getWidth() / 2;
		}
		
		function right():Number
		{
			return x + getWidth() / 2;
		}
		
		function top():Number
		{
			return y - getHeight() / 2;
		}
		
		function bottom():Number
		{
			return y + getHeight() / 2;
		}
		
		function centerX():Number
		{
			return x;
		}
		
		function centerY():Number
		{
			return y;
		}
		*/
		
		
AnimatedObject.prototype.getClosestCardinalPoint = function(fromX, fromY)
{
	var xDelta;
	var yDelta;
	var xPos;
	var yPos;
			
	if (fromX < this.left())
	{
		xDelta = this.left() - fromX;
		xPos = this.left();
 	}
	else if (fromX > this.right())
	{
		xDelta = fromX - this.right();
		xPos = this.right();
    }
	else
	{
		xDelta = 0;
		xPos = this.centerX();
	}
	
	if (fromY < this.top())
	{
		yDelta = this.top() - fromY;
		yPos = this.top();
	}
	else if (fromY > this.bottom())
	{
		yDelta = fromY - this.bottom();
		yPos = this.bottom();
    }
	else
	{
		yDelta = 0;
		yPos = this.centerY();
	}
			
	if (yDelta > xDelta)
	{
		xPos = this.centerX();
	}
	else 
	{
		yPos  = this.centerY();
	}
	
	return [xPos, yPos];
}
		
		
AnimatedObject.prototype.centered = function()
{
	return false;
}


AnimatedObject.prototype.pulseHighlight = function(frameNum)
{			
	if (this.highlighted)
	{
				var frameMod = frameNum / 7.0;
				var delta  = Math.abs((frameMod) % (2 * this.range  - 2) - this.range + 1)
				this.highlightDiff =  delta + this.minHeightDiff;
	}
			
}
		
AnimatedObject.prototype.getTailPointerAttachPos = function(fromX, fromY, anchorPoint) 
{
	return [this.x, this.y];
}
		
		
AnimatedObject.prototype.getHeadPointerAttachPos = function(fromX, fromY) 
{
	return [this.x, this.y];
}
		
/*public function createUndoDelete() : UndoBlock
{
			// Must be overriden!
			return null;
}
*/		
AnimatedObject.prototype.identifier = function()
{
	return this.objectID;
}

AnimatedObject.prototype.getText = function(index)
{
	return this.label;
}
		
AnimatedObject.prototype.getTextColor = function(textIndex)
{			
	return this.labelColor
}
		
AnimatedObject.prototype.setTextColor = function(color, textIndex)
{
		this.labelColor = color;
}
		
AnimatedObject.prototype.setText = function(newText, textIndex)
{
	this.label = newText;
}

AnimatedObject.prototype.setHighlightIndex = function(hlIndex)
{
   this.highlightIndex = hlIndex;
   this.highlightIndexDirty = true;
}


AnimatedObject.prototype.getHighlightIndex = function()
{
   return this.highlightIndex;
}
