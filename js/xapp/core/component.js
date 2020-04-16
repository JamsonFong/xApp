/**
 * Component 组件基类 
 * @version 1.0.0
 * @author JamsonFong
 * @email jamson_php@126.com
 * Copyright (c) 2018 www.jamson.cn. All rights reserved.
 * *
 */
define(function (require, exports, module) {
	var U = require('./util'),
		TP = require('./template-parser'),
		TS = require('./translate-service'),
		config = require('./config'),
		Class = require('./class');
	var _comId = 0;
	var Component = Class.newClass({
			_className : "Component",
			/**
			 * 构造方法
			 */
			_constructor : function (options) {
				this._componentId = "xComponent-" + (++_comId);
				this._componentName = "xComponent-" + (_comId);
				this._enabled = true;		
				this._targetParent = null;
				this._parentId = null;
				this.extend(options);	
				this.onCreate();
			},
			/*================ 内部方法  =============*/
			_preprocess : function (template) {
				if(template==null || typeof(template) ==="undefined") return null;
				if (this._doc) return this._doc;
				var tpl = TP.getInstance().parse(template, this);	
				if (this._targetParent == null && this._parentId != null) {
					this._targetParent = document.getElementById(this._parentId);
				}			
				if (this._targetParent == null && rootTarget == null) {
					this._targetParent = document.createElement('div');
					rootTarget = this._targetParent;
					rootParentResize();
					this._parentId = this._targetParent.id = this.generateTagId();
					window.addEventListener('resize', rootParentResize, false);
					document.body.appendChild(this._targetParent);
				}
				if (tpl != null) {
					var doc = (new DOMParser()).parseFromString(tpl, 'text/html');
					if (this.tagIds) {
						this.tagIds = this._createNewTagId(doc, this.tagIds);
					}
					this._doc = doc.body.childNodes
					return this._doc;			
				}
				return null;
			},
			_createNewTagId : function (doc, ids) {
				if (U.isString(ids)) {
					var id = ids;
					var newId = this.generateTagId();
					var tag = doc.getElementById(id);
					if (tag) tag.setAttribute('id', newId);
					return newId;
				} else {
					var arr = [];
					for (var j in ids) { arr[j] = this._createNewTagId(doc, ids[j]); }
					return arr;
				}
			},			
			_render:function(){
				var el = this._preprocess(this.template);
				if (el) {
					for (var i = 0; i < el.length; i++) {
						this._targetParent.appendChild(el.item(i));
					}
				}
				return el;
			},
			_remove : function () {
				var el = this._targetParent;
				if (el && el.children) for (var i = el.children.length - 1; i >= 0; i--) el.removeChild(el.children[i]);
				if (el == rootTarget) {
					document.body.removeChild(el);
					window.removeEventListener('resize', rootParentResize, false);
					this._targetParent = null;
					rootTarget = null;
				}
			},	
					
			/*================ 实例事件  =============*/
			onCreate:function(){},
			onEnabled:function(){},
			onDisabled:function(){},

			/*=================== 实例方法 ===============*/	
			extend : function (options){
				if (options) {
					for (var prop in options) {
						if (prop.indexOf("_") == 0 && this.hasOwnProperty(prop)){ 
							console.log("The given property '"+prop+"' conflict with the original property of the component.");
							continue;
						}else{
							this[prop] = options[prop];
						}
					}					
				}	
				return this;
			},
			translate:function(key){
				return TS.getInstance().translate(key);
			},
			getRootTarget: function(){
				return rootTarget;
			},		
			generateTagId: function() { return config.tagIdPrefix + (++_tid); },	
			setParentTagId:function(id) { 
				if(U.isString(id)){  this._parentId = id;this._targetParent = document.getElementById(this._parentId);}
				else throw new Error("The parent tag id should be a string.");
			},		
			getTemplate : function () { return this.template; },
			getId : function () { return this._componentId; },
			getName : function () { return this.name || this._className || this._componentName; },
			disable : function (){ this._enabled = false;this.onDisabled();},
			enable: function(){this._enabled = true;this.onEnabled();}

	});

	/*=====================  相关辅助函数以及私有变量  ======================*/	
	var rootTarget = null;
	var _tid = 0;
	function rootParentResize() {
		var width = window.innerWidth || document.body.clientWidth  || document.documentElement.clientWidth;
		var height = window.innerHeight || document.body.clientHeigh || document.documentElement.clientHeight;
		rootTarget.style.width = width + "px" 
		rootTarget.style.height = height + "px";
	}
			
	return Component;
});
