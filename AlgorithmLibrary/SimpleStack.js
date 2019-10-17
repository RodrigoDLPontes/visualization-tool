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



function SimpleStack(am, w, h)
{
	this.init(am, w, h);
}

SimpleStack.prototype = new Algorithm();
SimpleStack.prototype.constructor = SimpleStack;
SimpleStack.superclass = Algorithm.prototype;


SimpleStack.ELEMENT_WIDTH = 30;
SimpleStack.ELEMENT_HEIGHT = 30;
SimpleStack.INSERT_X = 30;
SimpleStack.INSERT_Y = 30;
SimpleStack.STARTING_X = 30;
SimpleStack.STARTING_Y = 100;
SimpleStack.FOREGROUND_COLOR = "#000055"
SimpleStack.BACKGROUND_COLOR = "#AAAAFF"


SimpleStack.prototype.init = function(am, w, h)
{
	// Call the unit function of our "superclass", which adds a couple of
	// listeners, and sets up the undo stack
	SimpleStack.superclass.init.call(this, am, w, h);
	
	this.addControls();
	
	// Useful for memory management
	this.nextIndex = 0;

	this.stackID = [];
	this.stackValues = [];
	
	this.stackTop = 0;
}

SimpleStack.prototype.addControls =  function()
{
	this.controls = [];

	
    this.pushField = addControlToAlgorithmBar("Text", "");
    this.pushField.onkeydown = this.returnSubmit(this.pushField,  
                                               this.pushCallback.bind(this), // callback to make when return is pressed
                                               4,                           // integer, max number of characters allowed in field
                                               false);                      // boolean, true of only digits can be entered.
	this.controls.push(this.pushField);
	
	this.pushButton = addControlToAlgorithmBar("Button", "Push");
	this.pushButton.onclick = this.pushCallback.bind(this);
	this.controls.push(this.pushButton);
	
	this.popButton = addControlToAlgorithmBar("Button", "Pop");
	this.popButton.onclick = this.popCallback.bind(this);
	this.controls.push(this.popButton);	
}

SimpleStack.prototype.reset = function()
{
	// Reset the (very simple) memory manager.
	//  NOTE:  If we had added a number of objects to the scene *before* any user
	//         input, then we would want to set this to the appropriate value based
	//         on objects added to the scene before the first user input
	this.nextIndex = 0;
	
	// Reset our data structure.  (Simple in this case)
	this.stackTop = 0;
}


SimpleStack.prototype.pushCallback = function()
{
	var pushedValue = this.pushField.value;
	
	if (pushedValue != "")
	{
		this.pushField.value = "";
		this.implementAction(this.push.bind(this), pushedValue);
	}
	
}

SimpleStack.prototype.popCallback = function()
{
	this.implementAction(this.pop.bind(this), "");
}


SimpleStack.prototype.push = function(pushedValue)
{
	this.commands = [];
	
	this.stackID[this.stackTop] = this.nextIndex++;
	
	this.cmd("CreateRectangle", this.stackID[this.stackTop], 
			                    pushedValue, 
								SimpleStack.ELEMENT_WIDTH,
								SimpleStack.ELEMENT_HEIGHT,
								SimpleStack.INSERT_X, 
			                    SimpleStack.INSERT_Y);
	this.cmd("SetForegroundColor", this.stackID[this.stackTop], SimpleStack.FOREGROUND_COLOR);
	this.cmd("SetBackgroundColor", this.stackID[this.stackTop], SimpleStack.BACKGROUND_COLOR);
	this.cmd("Step");
	var nextXPos = SimpleStack.STARTING_X + this.stackTop * SimpleStack.ELEMENT_WIDTH;
	var nextYPos = SimpleStack.STARTING_Y;
	this.cmd("Move", this.stackID[this.stackTop], nextXPos, nextYPos);
	this.cmd("Step"); // Not necessary, but not harmful either
	this.stackTop++;
	return this.commands;
}

SimpleStack.prototype.pop = function(unused)
{
	this.commands = [];
	
	if (this.stackTop > 0)
	{
		this.stackTop--;
		
		this.cmd("Move", this.stackID[this.stackTop], SimpleStack.INSERT_X, SimpleStack.INSERT_Y);
		this.cmd("Step");
		this.cmd("Delete", this.stackID[this.stackTop]);
		this.cmd("Step");
		
		// OPTIONAL:  We can do a little better with memory leaks in our own memory manager by
		//            reclaiming this memory.  It is recommened that you *NOT* do this unless
		//            you really know what you are doing (memory management leads to tricky bugs!)
		//            *and* you really need to (very long runnning visualizaitons, not common)
		//            Because this is a stack, we can reclaim memory easily.  Most of the time, this
		//            is not the case, and can be dangerous.
		// nextIndex = this.stackID[this.stackTop];
	}
	return this.commands;
}





// Called by our superclass when we get an animation started event -- need to wait for the
// event to finish before we start doing anything
SimpleStack.prototype.disableUI = function(event)
{
	for (var i = 0; i < this.controls.length; i++)
	{
		this.controls[i].disabled = true;
	}
}

// Called by our superclass when we get an animation completed event -- we can
/// now interact again.
SimpleStack.prototype.enableUI = function(event)
{
	for (var i = 0; i < this.controls.length; i++)
	{
		this.controls[i].disabled = false;
	}
}

////////////////////////////////////////////////////////////
// Script to start up your function, called from the webapge:
////////////////////////////////////////////////////////////

var currentAlg;

function init()
{
	var animManag = initCanvas();
	currentAlg = new SimpleStack(animManag, canvas.width, canvas.height);
	
}