
/**
 * account menu 
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

    var MenuItem = App.Component.newClass({
        _className:"AccountMenu.MenuItem",
        _constructor:function(options){
            arguments.callee.super._constructor.call(this);
            this._menus = App.createHashTable();     
            if(options){
                for(var i in options){
                    var m = options[i];
                    this.addMenuItem(new MenuItem(m));
                }              
            }       
        },
        _render : function($menu,$parent){
            $menu.menu('appendItem', {
                parent: $parent,  
                text: this['text'],
                name: this['name'],
                iconCls: 'fa '+this['iconCls']+' fa-lg fa-c-lb',
                onclick: this['onClick']
            });
            this._$menu = $menu;
            this._tagTarget = $menu.menu('findItem',{name:this['name']});  
            var items = this._menus.getValues();
            for(var i in items) {
                var item = items[i];
                item._render($menu,this._tagTarget);
             }
        },
        addMenuItem:function(item){
            if(!(item instanceof MenuItem)) throw new Error("The menu item does not match with the type of AccountMenu.MenuItem.");
            if(!this._menus.containsKey(item.getId())) this._menus.add(item.getId(),item);
            if(this._tagTarget){
                item._render(this._$menu, this._tagTarget);
            }
        }
    });    
	return MenuItem;
});
