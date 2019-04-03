/**
 * 模板预处理器
 * 
 * @version 1.0.0
 * @author JamsonFong
 * @email jamson_php@126.com
 * Copyright (c) 2018 www.jamson.cn. All rights reserved.
 * *
 */

define(function (require, exports, module) {
	var U = require('./util');
	var Class = require('./class');
	var T = require('./translator');

	var Preprocessor = Class.newClass({
		_className : "Preprocessor",
		execute:function(exp,comp){
			var result = '';
			var fnList = exp.split('|');
			var params = fnList[0].split(',');
			if(fnList.length == 1){
				var fn = U.trim(fnList[0].trim(),"()");
				if(!comp.hasOwnProperty(fn)) console.log("The component '"+ comp.getName()+"' does not have the property '"+ fn +"'.");
				if(comp.hasMethod(fn)) result = comp.getMethod(fn).call(comp);
				else result = comp[fn] || '';
			}else{
				var i = 1;
				for(var p in params) {params[p] = U.trim(U.trim(params[p].trim(),'"'),"'"); }
				do{
					var fn = U.trim(fnList[i++].trim(),"()");
					if(comp.hasMethod(fn)) result = comp.getMethod(fn).apply(comp,params);
					else throw new Error("The component '"+ comp.getName()+"' does not have the method '"+ fn +"'.");
					if ( i == fnList.length) break;
					params = [result];
				}while(true);
			}
			return result;
		},		
		parse : function (tpl, comp) {
			var parser = this;
			var html = tpl.replace(/\{\{([\w\|\s,'"\(\)]+)\}\}/g,
				function (match, exp, offset) {
					var result = match;
					result = parser.execute(exp,comp);
					return result;
				});
			parser = null;
			return html;
		},
		translate : function (key) {
			return T.getInstance().translate(key);
		}
	});
	

	//默认模板解析器
	var _default = new Preprocessor();
	Preprocessor.setInstance = function (parser) {
		_default = parser;
	}
	Preprocessor.getInstance = function () {
		return _default;
	}
	return Preprocessor;
});