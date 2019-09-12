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


function TestAlgorithm(am)
{
	this.init(am);

}

TestAlgorithm.prototype = new Algorithm();
TestAlgorithm.prototype.constructor = TestAlgorithm;
TestAlgorithm.superclass = Algorithm.prototype;

TestAlgorithm.prototype.init = function(am)
{
	var sc = TestAlgorithm.superclass;
	var fn = sc.init;
	fn.call(this,am);
//	TestAlgorithm.superclass.init.call(this,am);
	this.addControls();
	this.nextIndex = 0;
	
}

TestAlgorithm.prototype.addControls =  function()
{
	this.doWorkButton = addControlToAlgorithmBar("Button", "Do Work");
	this.doWorkButton.onclick = this.doWork.bind(this);
}

TestAlgorithm.prototype.reset = function()
{
	this.nextIndex = 0;
}

TestAlgorithm.prototype.doWork = function()
{
	this.implementAction(this.work.bind(this), "ignore");
}


TestAlgorithm.prototype.work = function(ignore)
{
	var circle1 = this.nextIndex++;
	var circle2 = this.nextIndex++;
	var circle3 = this.nextIndex++;
	this.commands = [];
	this.cmd("CreateCircle", circle1, circle1, 100,100);
	this.cmd("Step");
	this.cmd("Move", circle1, 200,100);
	this.cmd("Step");
	this.cmd("CreateCircle", circle2, circle2, 75,75);
	this.cmd("Step");
	this.cmd("Connect", circle1, circle2, "#FF3333", 0, true, "Label");
	this.cmd("Step");
	this.cmd("CreateCircle", circle3, "Foo" + String(circle3), 200,200);
	this.cmd("Step");
	this.cmd("Delete", circle1);
	this.cmd("Step");
	this.cmd("Move", circle2, 100, 200);
	this.cmd("Step");
	this.cmd("Move", circle3, 0, 0);
	return this.commands;
}


TestAlgorithm.prototype.disableUI = function(event)
{
	this.doWorkButton.disabled = true;
}

TestAlgorithm.prototype.enableUI = function(event)
{
	this.doWorkButton.disabled = false;
}


var currentAlg;

function init()
{
	var animManag = initCanvas();
	currentAlg = new TestAlgorithm(animManag);
}