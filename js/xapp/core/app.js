/**
 * xApp 
 * @version 0.0.1
 * @author JamsonFong
 * @email jamson_php@126.com
 * Copyright (c) 2018 www.jamson.cn. All rights reserved.
 * *
 */
define(function (require, exports, module) {
	var U = require('./util'),
		E = require('./events'),
		Class = require('./class'),
		Action = require('./action'),
		Component = require('./component'),
		TranslateService = require('./translate-service'),
		TemplateParser = require('./template-parser');
		
	var config = require('./config');
	

	var S ={
		Created:0,
		Ready:10,
		Running:20,
		Stopped:30
	};
	var _app = null;
	
	var App = Component.newClass({
		_className : "App",
		_constructor : function(options) {
			if(this._hasInstance()) throw new Error("One application is allowed to have only one instance of App. ");
			arguments.callee.super._constructor.call(this,options);
			this._status = S.Created;
			this._permissions = U.createHashTable();
			_app = this;
			this.onCreate();
		},
		_hasInstance: function(){
			return _app != null;
		},
		/*=========== 事件  =================*/
		onCreate:function(){},
		onBeforeRun : function () { },
		onRunning : function() { },
		onBeforeStop : function () { },
		onStopped: function () {},

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
		run : function () {
			var app = this, status = this._status;
			if(status != S.Created && status != S.Stopped) return;
			TranslateService.getInstance().use(config.lang, function (l) {
				app._status = S.Ready;
				E.createEvent(app)
				.next("onBeforeRun")
				.next(function(){
					this._render();
					this._status = S.Running;
				})
				.next("onRunning")				
				.run();
			});	
		},
		stop : function(){
			var app = this,status = this._status;
			if(status != S.Running) return;
			E.createEvent(app)
			.next("onBeforeStop")
			.next(function(){
				this._remove();
				this._status = S.Stopped;
			})
			.next("onStopped")
			.run();
		},
		
		addPermission : function(key,value){
			this._permissions.add(key,value);
		},
		getPermission : function(key){
			return this._permissions.getValue(key);
		}
	});	
	for (var prop in U) { if (prop != "prototype" && prop != "__proto__") App[prop] = U[prop]; }
	
	App.getInstance = function(){
		if(_app == null) _app = new App();
		return _app;
	};
	
	App.Class = Class;
	App.Action = Action;
	App.TemplateParser = TemplateParser;
	App.TranslateService = TranslateService;
	App.Component = Component;
	App.Status = S;
	return App;
});
