/**
 * Super Class 超类
 * @version 1.0.0
 * @author JamsonFong
 * @email jamson_php@126.com
 * Copyright (c) 2018 www.jamson.cn. All rights reserved.
 * *
 */
define(function (require, exports, module) {
	var U = require('./util');
	//超类
	function Class() { }
	//定义新的派生类
	Class.newClass = function (options) {
		function SubClass() {
			if (arguments[0] != Class) {
				this._constructor.apply(this, arguments);
			}
		}
		var proto = new this(Class);
		var superClass = this.prototype;
		for (var n in options) {
			var item = options[n];
			if (item instanceof Function) item.super = superClass;
			proto[n] = item;
		}
		SubClass.newClass = this.newClass;
		SubClass.selfExtend = this.selfExtend;
		SubClass.prototype = proto;
		return SubClass;
	};
	//扩展类自身属性
	Class.selfExtend = function (opts) {
		var superClass = this.prototype;
		var proto = new this(Class);
		for (var n in opts) {
			var item = opts[n];
			if (item instanceof Function) {
				var superCaller = superClass[n];
				if (superCaller instanceof Function && superCaller.super instanceof Function) {
					item.super = superCaller.super;
				}
				else { item.super = superClass; }
			}
			proto[n] = item;
		}
		this.prototype = proto;
		return this;
	};
	Class.prototype._className = "Class";
	Class.prototype._constructor = function () { }
	Class.prototype.hasMethod = function (fnName) { return U.hasMethod(this, fnName); }
	Class.prototype.getMethod = function (fnName) { return U.getMethod(this, fnName); }
	Class.prototype.extend = function (){
		if (arguments.length>0) {
			for(var i in arguments){
				var options = arguments[i];
				for (var prop in options) {
					if (prop.indexOf("_") == 0 && this.hasOwnProperty(prop)){ 
						console.debug("The given property '"+prop+"' conflict with the original property of the "+ this._className +".");
						continue;
					}else{
						this[prop] = options[prop];
					}
				}	
			}				
		}	
		return this;
	};

	return Class;
});
