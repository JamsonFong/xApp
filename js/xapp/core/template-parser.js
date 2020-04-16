/**
 * 语言管理模块 负责加载以及翻译模板语言。
 * 
 * @version 1.0.0
 * @author JamsonFong
 * @email jamson_php@126.com
 * Copyright (c) 2018 www.jamson.cn. All rights reserved.
 * *
 */
define(function (require, exports, module) {
	var U = require('./util'),
		Class = require('./class'),
	    TS = require('./translate-service');
	var TemplateParser = Class.newClass({
		_className : "TemplateParser",
		execute:function(exp,comp){
			var result = '';
			var fnList = exp.split('|');
			var params = fnList[0].split(',');
			if(fnList.length == 1){
				var fn = U.trim(fnList[0].trim(),"()");
				if(!comp.hasOwnProperty(fn)) throw new Error("The component '"+ comp.getName()+"' does not have the property '"+ fn +"'.");
				if(comp.hasMethod(fn)) result = comp.getMethod(fn).call(comp);
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
					return parser.execute(exp,comp);
				});
			return html;
		},
		translate : function (key) {
			return TS.getInstance().translate(key);
		}
	});
	
	

	//默认模板解析器
	var _default = new TemplateParser();
	TemplateParser.setInstance = function (parser) {
		_default = parser;
	}
	TemplateParser.getInstance = function () {
		return _default;
	}
	return TemplateParser;
});