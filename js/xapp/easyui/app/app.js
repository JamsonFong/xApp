/**
 * xApp 
 * @version 0.0.1
 * @author JamsonFong
 * @email jamson_php@126.com
 * Copyright (c) 2018 www.jamson.cn. All rights reserved.
 * 
 */
define(function (require, exports, module) {
	require('easyui'),
	require('easyui-css'),
	require('easyui-icon-css'),
	require('font-awesome'),
	require('./app.css');	
	var E = require('../../core/events');
	var Page = require('../page/page');
	var GridPage = require('../grid-page/grid-page');
	var ShortcutBar = require('../shortcut-bar/shortcut-bar');
	var ShortcutButton = require('../shortcut-bar/shortcut-button');
	var MainMenu = require('../main-menu/main-menu');
	var AccountMenu = require('../account-menu/account-menu');
	var App = require('../../core/app');
	var tpl = require('./app.html');
	var EasyuiApp = App.newClass({
		_className:"EasyuiApp",
		_constructor : function(options) {
			if(this._hasInstance()) throw new Error("One application is allowed to have only one instance of App. ");
			this.tagIds = {
				framework:"app-framework",
				logoId: "app-logo",
				accountMenuBtn:"app-account-menubutton",
				tabs:"app-tabs",
				logoutBtnId:"app-logout",
				accountMenu:"app-account-menu",
				pagesMask:"app-pages-mask",
				pagesMaskMsg:"app-pages-mask-msg",
				shortcutBar:"app-shortcut-bar"
			};	
			this.template = tpl;
			this._pages = App.createHashTable();
			this._tabPages = App.createHashTable();
			this._mainMenu = new MainMenu();
			this._accountMenu = new AccountMenu();
			this._shortcutBar = new ShortcutBar();
			arguments.callee.super._constructor.call(this,options);
		},
		_render : function(){			
			var el = this._preprocess(this.template);
			if (el) { for (var i = 0; i < el.length; i++) { this._targetParent.appendChild(el.item(i)); } }
			if(this.logo) $("#"+this.tagIds.logoId).attr("src",this.logo);
			var cThis = this;
			this._tabs = $("#"+this.tagIds.tabs).tabs({
				fit:true,border:false,
				onBeforeClose:function(title,index){
					var page = cThis._tabPages.getValue(index);
					if(page){
						cThis.removePage(page);		
						return false;
					}else {
						return true;
					}	
				}});
			var app = this;
			$("#"+this.tagIds.logoutBtnId).linkbutton({plain:true,onClick:function(){app.stop(); }});
			$("#"+this.tagIds.accountMenuBtn).menubutton({});
			$("#"+this.tagIds.mainMenu).accordion({fit:true,border:false});
			this._tagTarget=$("#"+this.tagIds.framework).layout({fit:true});
			this._accountMenu.setParentTagId(this.tagIds.accountMenu);
			this._accountMenu._setMenuButtonTagId(this.tagIds.accountMenuBtn);
			this._accountMenu._render();
			this._shortcutBar.setParentTagId(this.tagIds.shortcutBar);
			this._shortcutBar._render();

			return el;
		},
		_registerPopstate:function(){
			window.addEventListener('popstate', popstate);
		},
		_unregisterPopstate:function(){
			window.removeEventListener('popstate', popstate);
		},
		_onUnloadChildren:function(){
            var event = this.currentEvent;
			var cThis = this;
			var pages = this._pages.getValues();
            for(var i = 0; i < pages.length; i++){
                var item = pages[i];
                (function(page){      
					var e = E.createEvent(page)
					.next("onBeforeUnload")
					.next("_onUnloadChildren")
					.next(function(){
						cThis._tabPages.remove(page._tabIndex);
						cThis._tabs.tabs('close',page._tabIndex);
						cThis._pages.remove(page.getId());	
						page._status = Page.Status.Unloaded;	
						cThis._registerPopstate();
					})
					.next("onUnloaded");  
					event.next(e);
                })(item);
            }
		},
		stop : function(){
			var app = this,status = this._status;
			if(status != App.Status.Running) return;
			E.createEvent(app)
			.next("onBeforeStop")
			.next("_onUnloadChildren")
			.next(function(){
				this._remove();
				this._status = App.Status.Stopped;
				this._unregisterPopstate();
			})			
			.next("onStopped")
			.run();
		},
		getShorcutBar: function(){
			return this._shortcutBar;
		},
		addShortcutButton: function(btn){
			if(!(btn instanceof ShortcutButton)) { btn = new ShortcutButton(btn);}
			this._shortcutBar.addButton(btn);
		},
		setAccountMenu: function (m){
			if(!(m instanceof AccountMenu)) { m = new AccountMenu(m); }
			this._accountMenu._remove();
			this._accountMenu = m;
			this._accountMenu.setParentTagId(this.tagIds.accountMenu);
			this._accountMenu._setMenuButtonTagId(this.tagIds.accountMenuBtn);
			this._accountMenu._render();
		},
		getAccountMenu: function(){
			return this._accountMenu;
		},
		setMainMenu:function(m,region){
			if(!(m instanceof MainMenu)) {	m = new MainMenu(m);}	
			var cThis = this;
			cThis._mainMenu._remove();
			cThis._mainMenu = m;
			cThis._mainMenu._render(this._tagTarget,region||'west');
		},
		getMainMenu:function(){
			return this._mainMenu;
		},		
		_showLoading : function(){
			$("#"+this.tagIds.pagesMask).css('display','block');
			$("#"+this.tagIds.pagesMaskMsg).css('display','block');
		},
		_hideLoading : function(){		
			$("#"+this.tagIds.pagesMask).css('display','none');
			$("#"+this.tagIds.pagesMaskMsg).css('display','none');
		},	
		addPage:function(page,closable){
			if(this._pages.containsKey(page.getId())) return;
			if(!(page instanceof Page)) throw new Error("The page does not match with the type of Page.");
			var cThis = this;
			if(this._pages.getSize()>=10){
				$.messager.alert('Warning',this.tranlate("APP_PAGES_TOO_MUCH"));
				return;
			}
			E.createEvent(page)
				.next(function(){
					cThis._showLoading();
				})
				.next("onBeforeLoad")
                .next(function(){
                    isAddingTab=true;
					var tagId = cThis.generateTagId();
					var btnId = cThis.generateTagId();
					var pathId = cThis.generateTagId();
					var tpl = '<div id="' + tagId + '" class="easyui-layout" fit="true">'+                        
									'<div class="north" region="north" border="false">' +
										'<div style="float:left;height:40px;padding-top:10px;"><div style="float:left;">&nbsp;&nbsp;<b>{{ PAGE_YOUR_LOCATION  | translate }}:</b>&nbsp;&nbsp;</div><div id="'+ pathId +'"  style="float:left;"></div></div>' +
										'<div style="float:left;height:40px;padding-top:5px;">&nbsp;<div id="'+ btnId +'" ><b>{{ PAGE_BACK_BTN | translate }}</b></div></div>' +
									'</div>' +
								'</div>';
					cThis._tabs.tabs('add',{
						title: page.title,
						content: App.TemplateParser.getInstance().parse(tpl,cThis),
						border:false,
						selected:true,
						closable: typeof(closable) === "undefined"? false : closable,
						iconCls:"fa "+page.iconCls+" fa-lg"
					});		
					var $path = $("#"+pathId);
					var $parent = $("#"+tagId).layout({});
					var $btn = $("#"+btnId).linkbutton({plain:true,iconCls:'icon-undo'});
					var tab=cThis._tabs.tabs('getSelected');
					var index=cThis._tabs.tabs('getTabIndex',tab);
					page._tabIndex = index;
					page._render($parent,'center',$btn,$path);
					cThis._tabPages.add(index,page);
					cThis._pages.add(page.getId(),page);	
					page._status = Page.Status.Loaded;				
                })
				.next("onLoaded")
				.final(function(){					
					cThis._hideLoading();
				})
                .run();  
		},
		removePage:function(page){
			if(!(page instanceof Page)) return;
			var cThis = this;
			if(this._pages.containsKey(page.getId()) && this._tabPages.containsKey(page._tabIndex)){
				E.createEvent(page)
				.next("onBeforeUnload")
				.next("_onUnloadChildren")
				.next(function(){
					cThis._tabPages.remove(page._tabIndex);
					cThis._tabs.tabs('close',page._tabIndex);
					cThis._pages.remove(page.getId());	
					page._status = Page.Status.Unloaded;	
				})
				.next("onUnloaded")
				.run();
			}
		}
	});

	function popstate(event){

	}

	EasyuiApp.Page = Page;
	EasyuiApp.GridPage = GridPage;
	EasyuiApp.MainMenu = MainMenu;
	EasyuiApp.AccountMenu = AccountMenu;
	EasyuiApp.ShortcutBar = ShortcutBar;
	EasyuiApp.ShortcutButton = ShortcutButton;
	return EasyuiApp;
});
