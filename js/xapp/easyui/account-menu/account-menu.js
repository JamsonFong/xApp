
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

    var AccountMenu = MenuItem.newClass({
        _className:"AccountMenu",
        _setMenuButtonTagId:function(id){
            this._menuBtnTagId = id;
        },
        
        _render:function(){         	
            this._tagTarget = $("#"+this._parentId).menu({});   
			this._menuBtn=$("#"+this._menuBtnTagId).menubutton({menu:"#"+this._parentId});	
            var items = this._menus.getValues();
            for(var i in items) {
                var item = items[i];
                item._render(this._tagTarget,null);
             }
        }
    });    
    AccountMenu.MenuItem = MenuItem;
	return AccountMenu;
});
