/**
 * menu item
 * @version 0.0.1
 * @author JamsonFong
 * @email jamson_php@126.com
 * Copyright (c) 2018 www.jamson.cn. All rights reserved.
 * *
 */
define(function (require, exports, module) {
	var ShortcutButton = require('./shortcut-button');
	var App = require('../../core/app');
    // 基于Component组件定义MenuModule组件
    var ShortcutBar = App.Component.newClass({
        _className : "ShortcutBar",
        _constructor:function(options){
            arguments.callee.super._constructor.call(this);
            this._buttons = App.createHashTable();
            if(options){
                for(var i in options){
                    var btn= options[i];
                    this.addButton(new ShorcutButton(btn));
                }
            }            
        },
        template:'',
        _render:function(){   
            this._tagTarget = document.getElementById(this._parentId);
            return this._tagTarget;
        },
        addButton:function(btn){            
            if(!(btn instanceof ShortcutButton)) throw new Error("The button is not match with the type of ShortcutButton .");
            if(!this._buttons.containsKey(btn.getId())) this._buttons.add(btn.getId(),btn);
            if(this._tagTarget){
                btn._render(this._tagTarget);
            }
        }
    });    
    
	return ShortcutBar;
});
