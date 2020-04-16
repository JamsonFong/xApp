
/**
 * main menu
 * @version 0.0.1
 * @author JamsonFong
 * @email jamson_php@126.com
 * Copyright (c) 2018 www.jamson.cn. All rights reserved.
 * *
 */
define(function (require, exports, module) {
    var MenuModule = require('./menu-module');
    var MenuItem = require('./menu-item');
	var App = require('../../core/app');
    // 基于Component组件定义MenuModule组件
    
    var MainMenu = App.Component.newClass({
        _className:"MainMenu",
        _constructor:function(options){
            arguments.callee.super._constructor.call(this);
            this._modules = App.createHashTable();     
            if(options){
                for(var i in options){
                    var m = options[i];
                    this.addModule(new MenuModule(m));
                }              
            }       
        },
        _addModule:function(item){
            this._tagTarget.accordion('add', {
                title: item['text'],
                iconCls: 'fa '+ item['iconCls']+' ',
                content: item.getTemplate(),
                selected: true
            });
            var $item=this._tagTarget.accordion('getPanel',item['text']);	
		    return $item;
        },
        _render:function($parent,region){
            this._tagTargetId = this.generateTagId();
            $parent.layout("remove",region);
            $parent.layout("add",{
                title:"主菜单",
                region:region,                   
                split: true,
                border:true,         
                width:250,
                content: '<div id="'+ this._tagTargetId +'" ></div>'
            });
            this._tagTarget = $("#"+this._tagTargetId).accordion({fit:true,border:false});  
            var items = this._modules.getValues();
            for(var i in items) {
                var item = items[i];
                item._render(this._addModule(item));
             }
        },
        addModule:function(item){
            if(!(item instanceof MenuModule)) throw new Error("The menu module does not match with the type of MainMenu.MenuModule.");
            if(!this._modules.containsKey(item.getId())) this._modules.add(item.getId(),item);
            if(this._tagTarget){
                this._addModule(item);
            }
        }
    });    
    MainMenu.MenuItem = MenuItem;
    MainMenu.MenuModule = MenuModule;
	return MainMenu;
});
