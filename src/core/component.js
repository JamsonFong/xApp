/**
 * Component 
 * @version 1.0.0
 * @author JamsonFong
 * @email jamson_php@126.com
 * Copyright (c) 2018 www.jamson.cn. All rights reserved.
 * *
 */
define(function (require) {
	var U = require('./util');
	var P = require('./preprocessor');
	var TS = require('./translator');
	var config = require('./config');
	var Class = require('./class');
	var _comId = 0;

	// 所有UI组件的父类
	var Component = Class.newClass({
			_className : "Component",
			_constructor : function () {
				this._componentId = "xComponent-" + (++_comId);
				this._componentName = "xComponent-" + (_comId);
				this._enabled = true;
				this._$target = null // 当前关联DOM元素		
				this._$parent = null; // DOM 父元素
				this._pTagId = null; // DOM 父元素 ID
 				this.onCreate();
			},
			
			_createNewTagId : function ($target, ids) {
				if (U.isString(ids)) {
					var id = ids;
					var newId = this.generateTagId();
					if($target.attr('id') === id) { $target.attr('id',newId);}
					else {
						var $item = $target.find('#'+id);
						if ($item.length>0){ $item.attr('id', newId); }
					}
					return newId;
				} else {
					var arr = [];
					for (var j in ids) { arr[j] = this._createNewTagId($target, ids[j]); }
					return arr;
				}
			},
			/*================ 内部方法 =============*/
			preprocess : function (template) {
				if(template==null || typeof(template) ==="undefined") return null;

				//如果模板已经被处理过，则返回先前已经处理过的结果
				if (this._html) return this._html;
				
				//对模板进行预处理，包括语言翻译、模板变量赋值等
				var html = P.getInstance().parse(template, this);	

				if (this._$parent == null && this._pTagId != null) {
					this._$parent = $("#"+this._pTagId);
				}
			
				/**
				 * 模块化开发中，模板ID容易冲突，我们使用tagIds属性来管理所有的DOM 标签ID。在html被添加到文档之前，我们应该对这些ID进行替换预处理来托管。
				 */
				if (html != null) {
					var $target = $(html);
					if (this.tagIds) {
						this.tagIds = this._createNewTagId($target, this.tagIds);
					}	
					this._html = $target.prop("outerHTML");	
					return this._html;			
				}
				return null;
			},			
			render:function($parent){
				this._$parent = $parent;
				var html = this.preprocess(this.template);
				if (html) {
					this._$target = $(html).appendTo(this._$parent);
				}
				return this._$target;
			},
			remove : function () {
				if(this._$target) this._$target.remove();
				this._$target = null;
			},	
			destroy:function(){
				this.remove();
				for(var i in this){
					var c = this[i];
					if(c instanceof Component) c.destroy();
					this[i] = null;
					delete this[i];
				}
			},
					
			/*================ 实例事件  =============*/
			onCreate:function(){},
			onEnabled:function(){},
			onDisabled:function(){},

			/*=================== 实例方法 ===============*/	
			
			translate:function(key){
				return TS.getInstance().translate(key);
			},	
			generateTagId: function() { return config.tagIdPrefix + (++_tid); },	
			setParentTagId:function(id) { 
				if(U.isString(id)){  this._pTagId = id;}
				else throw new Error("The parent tag id should be a string.");
			},		
			getTemplate : function () { return this.template; },
			getId : function () { return this._componentId; },
			getName : function () { return this.name || this._className || this._componentName; },
			disable : function (){ this._enabled = false;this.onDisabled();},
			enable: function(){this._enabled = true;this.onEnabled();},
			getContext:function(){
				return U.getContext();
			}

	});

	for (var prop in U) { if (prop != "__proto__") Component[prop] = U[prop]; }

	/*=====================  相关辅助函数以及私有变量  ======================*/	
	var _tid = 0;	
			
	return Component;
});
