/**
 * xApp 
 * @version 0.0.1
 * @author JamsonFong
 * @email jamson_php@126.com
 * Copyright (c) 2018 www.jamson.cn. All rights reserved.
 * *
 */

define(function (require, exports, module) {
	var U = require('./util');
	var Component = require('./component');
	var TranslateService = require('./translator');		
	var config = require('./config');
		
	var Context = Component.newClass({
		_className : "Context",
		_constructor : function(options) {
			arguments.callee.super._constructor.call(this);
			if(this._hasInstance()) throw new Error("One application is allowed to have only one instance of Context. ");
			this._permissions = U.createHashTable();
			U.setContext(this);
			this.onCreate();
		},
		_hasInstance: function(){
			return U.getContext() != null;
		},
		/*=========== 事件  =================*/
		onCreate:function(){},

		/*=========== 方法  =================*/
		setTitle : function (title) {
			if (document.title) document.title = title;
			else {
				document.getElementsByTagName("title")[0].innerText = title;
			}
		},
		setTranslateService : function (translateService) {
			TranslateService.setInstance(translateService);
		},
		translate : function(key){
			return TranslateService.getInstance().translate(key);
		},
		getConfig : function (key) {
			return config.hasOwnProperty(key) ? config[key] : null;
		},
		config : function (cfg) {
			if (config) { for (var prop in cfg) config[prop] = cfg[prop]; }
		},
		addPermission : function(key,value){
			this._permissions.add(key,value);
		},
		getPermission : function(key){
			return this._permissions.getValue(key);
		},
		addPage:function(){},
		removePage:function(){}
	});	
		
	return Context;
});
