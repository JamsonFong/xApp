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
    var ShortcutButton = App.Component.newClass({
        _className : "ShortcutButton",
        _constructor:function(options){
            arguments.callee.super._constructor.call(this);
            if(options instanceof Object){
                this.iconCls = options.iconCls || '';
                this.text = options.text || null;
                this.color = options.color || null;
                this.count = options.count || 5;
                this.onClick = options.onClick || function(){};
            }
        },
        template:'<span class="notice-item easyui-tooltip" {{text | getData}}>'+'<span class="notice-button">'+
        '<span  class="easyui-linkbutton l-btn l-btn-small l-btn-plain" plain="true" iconCls="fa {{ iconCls | getData }} fa-lg fa-c-lb">'+
        // '<span class="l-btn-left l-btn-icon-left">'+
        // '<span class="l-btn-text l-btn-empty">&nbsp;</span>'+
        // '<span class="l-btn-icon fa {{ iconCls | getData }} fa-lg fa-c-lb">&nbsp;</span>'+				                         
        '</span></span>'+
        '<span class="notice-count notice-count-zero" {{ color | getData }}></span>'+            		
        '</span>',
        _render:function($parent){   
            var el = App.TemplateParser.getInstance().parse(this.template,this);
            this._tagTarget=$(el).appendTo($parent);
            this._tagTarget.find('.easyui-linkbutton').linkbutton({});
            this._tagTarget.tooltip({});
            if(App.isFunction(this.onClick)) this._tagTarget.click(this.onClick);
            this._tagTarget.setCount=function(n){
                $target=this.find('.notice-count');
                $target.removeClass('notice-count-zero');			    	
                if(n>99) $target.text('99+');
                else if(n>0) $target.text(n);
                else $target.addClass('notice-count-zero');
                return this;
            }
            if(this.count>0) this._tagTarget.setCount(this.count);
            return this._tagTarget;
        },
        setCount:function(num){
            if(this._tagTarget) {
                this._tagTarget.setCount(num);
            }
        },
        getData:function(name){
            switch(name){
                case 'iconCls':
                    return this.iconCls;
                case 'text':
                    return this.text?'title="'+this.text+'"':'';
                case 'color':
                    return this.color?'style="background-color:'+this.color+'"':'';
                default:
                    return name;
            };
        }        
    });    
    
	return ShortcutButton;
});
