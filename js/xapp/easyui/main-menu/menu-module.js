/**
 * page 
 * @version 0.0.1
 * @author JamsonFong
 * @email jamson_php@126.com
 * Copyright (c) 2018 www.jamson.cn. All rights reserved.
 * *
 */
define(function (require, exports, module) {
    var MenuItem = require('./menu-item');
	var App = require('../../core/app');
    // 基于Component组件定义MenuModule组件
    var MenuModule = App.Component.newClass({
        _className:"MainMenu.MenuModule",
        _constructor:function(options){
            arguments.callee.super._constructor.call(this);
            this._menus = App.createHashTable();
            if(options instanceof Object){
                this.text = options.text;
                this.iconCls = options.iconCls;
                if(options.children){
                    for(var i in options.children){
                        var m = options.children[i];
                        this.addMenuItem(new MenuItem(m));
                    }
                }
            }
        },
        template:'<div class="xapp-menu"></div>',
        _render:function($parent){
            this._tagTarget = $parent.find('.xapp-menu');
            var items = this._menus.getValues();
            for(var i in items){
                var item = items[i];
                item._render(this._tagTarget);    
            }
        },
        setParentTarget:function(parent){
            this._parentTarget = parent;
        },
        addMenuItem:function(item){
            if(!(item instanceof MenuItem)) throw new Error("The menu item does not match with the type of MainMenu.MenuItem.");
            if(!this._menus.containsKey(item.getId())) this._menus.add(item.getId(),item);
            if(this._tagTarget){
                this._tagTarget.appendChild(item.getTagTarget());
            }
        }
    });    
    
	return MenuModule;
});
