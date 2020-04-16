/**
 * app主模块
 * @version 1.0.0
 * @author JamsonFong
 * @email jamson_php@126.com
 * Copyright (c) 2018 www.jamson.cn. All rights reserved.
 */
define(function(require,exports,module){
	var App = require('xapp'),		
	    tpl = require('./home/home.html'),
		menus = require('./menus.json');
	//var tabs = App.createHashTable(),isAddingTab=false,isRouting=false;
	var app = new App({
		logo :"/assets/images/logo.png",
		name: "App",
	 	onBeforeRun:function(e) {
	 		this.setTitle(this.translate("APP_NAME"));
	 	},	
		onRunning:function(){
			var app = this;
			setTimeout(function(){
				app.setMainMenu(menus);	
			},100);
			setTimeout(function(){				
				app.addShortcutButton({iconCls:'fa-envelope',text:'我的消息'});
				app.addShortcutButton({iconCls:'fa-bell',text:'我的通知'});	
			},200);
			this.addPermission('test',false);
			setTimeout(function(){
				app.addPage(new App.GridPage({
					context:app,
					title:'首页',
					iconCls:'fa-home',
					template:tpl,
					name:'page1'})
				,false);
			},200);
			setTimeout(function(){
				app.addPage(new App.GridPage({
					context:app,
					title:'浏览数据',
					dataSettings:{
						fields:[
							{title:"编号",field:'id',visible:true, isKey: true},
							{title:"名称",field:'name',visible:true},
							{title:"说明",field:'text',visible:true}
						]
					},
					name:'page2'})
				,true);
			},200);
		}
	});	 
	return app;
});