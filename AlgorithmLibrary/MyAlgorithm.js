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



function MyAlgorithm(am, w, h)
{
	this.init(am, w, h);
}

MyAlgorithm.prototype = new Algorithm();
MyAlgorithm.prototype.constructor = MyAlgorithm;
MyAlgorithm.superclass = Algorithm.prototype;

MyAlgorithm.prototype.init = function(am, w, h)
{
	// Call the unit function of our "superclass", which adds a couple of
	// listeners, and sets up the undo stack
	MyAlgorithm.superclass.init.call(this, am, w, h);
	
	this.addControls();
	
	// Useful for memory management
	this.nextIndex = 0;

	// TODO:  Add any code necessary to set up your own algorithm.  Initialize data
	// structures, etc.
	
}

MyAlgorithm.prototype.addControls =  function()
{
	this.controls = [];
	
	// Add any necessary controls for your algorithm.
	//   There are libraries that help with text entry, buttons, check boxes, radio groups
	//
	// To add a button myButton:
	//	   this.mybytton = addControlToAlgorithmBar("Button", "MyButtonText");
	//     this.mybytton.onclick = this.myCallback.bind(this);
	//     this.controls.push(this.mybutton);
	//   where myCallback is a method on this function that implemnts the callback
	//
	// To add a text field myField:
	//    this.myField = addControlToAlgorithmBar("Text", "");
	//    this.myField.onkeydown = this.returnSubmit(this.myField,  
	//                                               this.anotherCallback.bind(this), // callback to make when return is pressed
	//                                               maxFieldLen,                     // integer, max number of characters allowed in field
	//                                               intOnly);                        // boolean, true of only digits can be entered.
	//    this.controls.push(this.myField);
	//
    // To add a textbox:
	//   	this.myCheckbox = addCheckboxToAlgorithmBar("Checkbox Label");
	//      this.myCheckbox.onclick = this.checkboxCallback.bind(this);
	//      this.controls.push(myCheckbox);
	//
	// To add a radio button group:
	//	  this.radioButtonList = addRadioButtonGroupToAlgorithmBar(["radio button label 1", 
	//                                                              "radio button label 2", 
	//                                                              "radio button label 3"], 
    //                                                             "MyButtonGroupName");
	//    this.radioButtonList[0].onclick = this.firstRadioButtonCallback.bind(this);
	//    this.controls.push(this.radioButtonList[0]);
	//    this.radioButtonList[1].onclick = this.secondRadioButtonCallback.bind(this);
	//    this.controls.push(this.radioButtonList[1]);
	//    this.radioButtonList[2].onclick = this.thirdRadioButtonCallback.bind(this);
	//    this.controls.push(this.radioButtonList[1]);
	//
	// Note that we are adding the controls to the controls array so that they can be enabled / disabled
	// by the animation manager (see enableUI / disableUI below)
}

MyAlgorithm.prototype.reset = function()
{
	// Reset all of your data structures to *exactly* the state they have immediately after the init
	// function is called.  This method is called whenever an "undo" is performed.  Your data
	// structures are completely cleaned, and then all of the actions *up to but not including* the
	// last action are then redone.  If you implement all of your actions through the "implementAction"
	// method below, then all of this work is done for you in the Animation "superclass"
	
	// Reset the (very simple) memory manager
	this.nextIndex = 0;

}

//////////////////////////////////////////////
// Callbacks:
//////////////////////////////////////////////
//
//   All of your callbacks should *not* do any work directly, but instead should go through the
//   implement action command.  That way, undos are handled by ths system "behind the scenes"
//
//   A typical example:
//
//MyAlgorithm.prototype.insertCallback = function(event)
//{
//	// Get value to insert from textfield (created in addControls above)
//	var insertedValue = this.insertField.value;
//
//  // If you want numbers to all have leading zeroes, you can add them like this:
//	insertedValue = this.normalizeNumber(insertedValue, 4);
//
//  // Only do insertion if the text field is not empty ...
//	if (insertedValue != "")
//	{
//		// Clear text field after operation
//		this.insertField.value = "";
//      // Do the actual work.  The function implementAction is defined in the algorithm superclass
//		this.implementAction(this.insertElement.bind(this), insertedValue);
//	}
//}
//  Note that implementAction takes as parameters a function and an argument, and then calls that
//  function using that argument (while also storing the function/argument pair for future undos)

//////////////////////////////////////////////
// Doing actual work
//////////////////////////////////////////////
//   The functions that are called by implementAction (like insertElement in the comments above) need to:
//
//      1. Create an array of strings that represent commands to give to the animation manager
//      2. Return this array of commands
//
//    We strongly recommend that you use the this.cmd function, which is a handy utility function that
//    appends commands onto the instance variable this.commands
//
//    A simple example:
//
//MyAlgorithm.simpleAction(input)
//{
//	this.commands = [];  // Empty out our commands variable, so it isn't corrupted by previous actions
//
//	// Get a new memory ID for the circle that we are going to create
//	var circleID = nextIndex++;
//	var circleX = 50;
//	var circleY = 50;
//	
//	// Create a circle
//	this.cmd("CreateCircle", circleID, "Label",  circleX, circleY);
//	circleX = 100; 
//	// Move the circle
//	this.cmd("Move", circleID, circleX, circleY);
//	// First Animation step done
//	this.cmd("Step");
//	circleX = 50; 
//	circleY = 100; 
//	// Move the circle again
//	this.cmd("Move", circleID, circleX, circleY);
//	// Next Animation step done
//	this.cmd("Step");
//	// Return the commands that were generated by the "cmd" calls:
//	return this.commands;
//}



// Called by our superclass when we get an animation started event -- need to wait for the
// event to finish before we start doing anything
MyAlgorithm.prototype.disableUI = function(event)
{
	for (var i = 0; i < this.controls.length; i++)
	{
		this.controls[i].disabled = true;
	}
}

// Called by our superclass when we get an animation completed event -- we can
/// now interact again.
MyAlgorithm.prototype.enableUI = function(event)
{
	for (var i = 0; i < this.controls.length; i++)
	{
		this.controls[i].disabled = false;
	}
}


var currentAlg;

function init()
{
	var animManag = initCanvas();
	currentAlg = new MyAlgorithm(animManag, canvas.width, canvas.height);
	
}