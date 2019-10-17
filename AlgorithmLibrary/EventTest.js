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


function.prototype.bind = function(scope) {
	var _function = this;
	
	return function() {
		return _function.apply(scope, arguments);
	}
}


function EventListener()
{
	this.events = [];
}


EventListener.prototype.removeListener = function(kind, scope, func)
{
	if (this.events[kind] == undefined)
	{
		return;
	}
	var scopeFunctions == null;
	var i;
	for (i = 0; i < this.events[kind].length; i++)
	{
		if (this.events[kind][i].scope == scope)
		{
			scopeFunctions = this.events[kind][i];
			break;
		}	
	}
	if (scopeFunctions == null)
	{
		return;
	}
	for (i = 0; i < scopeFunctions.functions.length; i++)
	{
		if (scopeFunctions.functions[i] == func)
		{
			scopeFunctions.functions.splice(i,1);
			return;
		}
	}
}


EventListener.prototype.addListener = function(kind, scope, func)
{
	if (this.events[kind] === undefined)
	{
		this.events[kind] = [];
	}
	var i;
	var scopeFunctions = null;
	for (i = 0; i < this.events[kind].length; i++)
	{
		if (this.events[kind][i].scope == scope)
		{
			scopeFunctions = this.events[kind][i];
			break;
		}
	}
	if (scopeFunctions === null)
	{
		this.events[kind].push({scope:scope, functions:[] });
		scopeFunctions = this.events[kind][this.events[kind].length - 1];
	}
	for (i = 0; i < scopeFunctions.functions.length; i++)
	{
		if (scopeFunctions.functions[i] == func)
		{
			return;
		}
	}
	scopeFunctions.functions.push(func);
}

EventListener.prototype.fireEvent = function(kind, event)
{
	// TODO:  Should add a deep clone here ...
	if (this.events[kind] !== null)
	{
		for (var i = 0; i < this.events[kind].length; i++)
		{
			var objects = this.events[kind][i];
			var functs = objects.functions;
			for (var j = 0; j <functs.length; j++)
			{
				var func = functs[j];
				func(event);
			}
		}
	}

}



function Source()
{
	
}

Source.prototype = new EventListener();
Source.prototype.constructor = Source;
Source.prototype.testFire = function()
{
	this.fireEvent("test","testcontents");
	this.fireEvent("test2","test2contents");
}



function Client(eventSource)
{
		
	this.first = function(blah)
	{
		alert("first:" + blah);
	}
	
	this.second = function(blah)
	{
		alert("second:" + blah);
	}
	eventSource.addListener("test", this, this.first);
	eventSource.addListener("test", this, this.first);
	eventSource.addListener("test", this, this.second);
	
	if (this.first == this.first)
	{
		alert("same");
	}
	else
	{
		alert("different");
	}
	/*eventSource.addListener("test2", this.first.bind());
	eventSource.addListener("test2", this.second.bind());
	eventSource.addListener("test2", this.second.bind()); */
	
							
}
							
							
function init()
{
	var src = new Source;
	var c = new Client(src);
	src.testFire();
}
							
							


