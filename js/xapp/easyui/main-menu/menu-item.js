/**
 * menu item
 * @version 0.0.1
 * @author JamsonFong
 * @email jamson_php@126.com
 * Copyright (c) 2018 www.jamson.cn. All rights reserved.
 * *
 */
define(function (require, exports, module) {
	var App = require('../../core/app');
    // 基于Component组件定义MenuModule组件
    var MenuItem = App.Component.newClass({
        _className : "MainMenu.MenuItem",
        _constructor:function(options){
            arguments.callee.super._constructor.call(this);
            this._menus = App.createHashTable();
            this._leftPadding = 20;
            if(options instanceof Object){
                this.iconCls = options.iconCls || '';
                this.text = options.text || '';
                this.onClick = options.onClick || function(){};
                if(options.children){
                    for(var i in options.children){
                        var m = options.children[i];
                        this.addMenuItem(new MenuItem(m));
                    }
                }
            }
        },
        template:'<div class="xapp-menu-item">'+
                '<div class="xapp-menu-info">'+		
                    '<span class="xapp-menu-arrow fa fa-lg" style="padding-left:{{leftPadding | getData }}px;"></span>'+		    					
                    '<span class="xapp-menu-icon fa {{ iconCls | getData }} fa-lg "></span>'+
                    '<span class="xapp-menu-text"> {{ text | getData }}</span>'+
                    '<span class=""></span>'+
                '</div>'+
                '<div class="xapp-menu-children "></div>'+
                '</div>',
        _render:function($parent){   
            var comp = this;
            var el = App.TemplateParser.getInstance().parse(this.template,this);
            this._tagTarget = $(el).appendTo($parent);            
            if(this._tagTarget){
                var $item = this._tagTarget;
                $item.find('.xapp-menu-info').mouseover(function() {
                    $('.xapp-menu-info').removeClass('on');
                    $(this).addClass('on');					
                }).mouseout(function() {
                    $(this).removeClass('on');					
                }).click(function(){
                    $('.xapp-menu-info').removeClass('active');
                    $(this).addClass('active').siblings('.xapp-menu-children').toggleClass('xapp-menu-hidden');
                    $arrow=$(this).find('.xapp-menu-arrow');
                    if($arrow.hasClass('fa-chevron-down')){ 
                        $arrow.removeClass('fa-chevron-down');
                        $arrow.addClass('fa-chevron-right');						
                    }else{
                        if($arrow.hasClass('fa-chevron-right')){
                            $arrow.removeClass('fa-chevron-right');
                            $arrow.addClass('fa-chevron-down');
                        }
                    }
                    var onClick=function(){
                            console.log("The menu item '"+comp.text + "' is clicked.");
                    };
                    if(App.isFunction(this['onClick'])) onClick=this['onClick'];
                    onClick.apply($(this).parent());
                });
                var items = this._menus.getValues();                
                for(var i in items){
                    var item = items[i];
                    this.addMenuItem(item);
                }
            }
        },        
        addLeftPadding :function(parent){
            if(parent) this._leftPadding = parent._leftPadding + 20;
        },
        getData:function(name){
            switch(name){
                case 'leftPadding':
                    return this._leftPadding;
                case 'iconCls':
                    return this.iconCls;
                case 'text':
                    return this.text;
                default:
                    return name;
            };
        },
        addMenuItem:function(item){
            if(!(item instanceof MenuItem)) throw new Error("The menu item does not match with the type of MainMenu.MenuItem.");
            if(!this._menus.containsKey(item.getId())) this._menus.add(item.getId(),item);
            if(this._tagTarget){
                this._tagTarget.children('.xapp-menu-info').find('.xapp-menu-arrow').addClass('fa-chevron-down');
                item.addLeftPadding(this);
                item._render(this._tagTarget.children('.xapp-menu-children'));
            }
        }
        
    });    
    
	return MenuItem;
});
