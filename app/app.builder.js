/**
 * 
 * @param require
 * @param exports
 * @param module
 * @returns
 */
define(function(require, exports ,module ){
	var XApp = require('xapp');
	var Builder = XApp.Builder;
	function AppBuilder(component){
		Builder.call(this,component);
	}
	var B = Builder.prototype;

	/**
	 * 创建个人菜单项
	 */
	B.createAccountMenuItem = function(compName,parent,menu){
		var options=this.accountMenuBtn.menubutton('options');
		if(options){if(options.menu==undefined) this.accountMenuBtn.menubutton({menu:"#"+this.tids.accountMenu});}
		var pTarget=parent&& parent.target?parent.target:null;
		this.accountMenu.menu('appendItem', {
			parent: pTarget,  
			text: menu['text'],
			name: menu['name'],
			iconCls: 'fa '+menu['iconCls']+' fa-lg fa-c-lb',
			onclick: menu['onClick']
		});
		var item=this.accountMenu.menu('findItem',{name:menu['name']});
		return item;
	};
	/**
	 * 创建菜单模块
	 */
	B.createMenuModule = function(module){
		this.accordion.accordion('add', {
			title: module['title'],
			iconCls: 'fa '+module['iconCls']+' ',
			content: '<div class="app-menu"></div>',
			selected: true
		});
		var $item=this.accordion.accordion('getPanel',module['title']);	
		return $item;
	};
	/**
	 * 创建菜单项
	 */
	B.createMenuItem = function($module,$parent,menu){
		var $item=null,$menu=$module.find('.app-menu');	
		var leftPadding=$parent?$parent.leftPadding+20:20;
		var html=''+
			'<div class="app-menu-item">'+
				'<div class="app-menu-info">'+		
					'<span class="app-menu-arrow fa fa-lg" style="padding-left:'+leftPadding+'px;"></span>'+		    					
					'<span class="app-menu-icon fa '+menu['iconCls']+' fa-lg "></span>'+
					'<span class="app-menu-text">'+menu['text']+'</span>'+
					'<span class=""></span>'+
				'</div>'+
				'<div class="app-menu-children "></div>'+
			'</div>';
		if($parent){ 
			$item=$(html).appendTo($parent.children('.app-menu-children'));
			$parent.children('.app-menu-info').find('.app-menu-arrow').addClass('fa-chevron-down');
		}else $item=$(html).appendTo($menu);
		$item.find('.app-menu-info').mouseover(function() {
			$('.app-menu-info').removeClass('on');
			$(this).addClass('on');					
		}).mouseout(function() {
			$(this).removeClass('on');					
		}).click(function(){
			$('.app-menu-info').removeClass('active');
			$(this).addClass('active').siblings('.app-menu-children').toggleClass('app-menu-hidden');
			$arrow=$(this).find('.app-menu-arrow');
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
				if(menu['route']) xframework.routeTo(menu['route']);
				else if(menu['href']) window.location.href=menu['href'];
			};
			if(xframework.isFunction(menu['onClick'])) onClick=menu['onClick'];
			onClick.apply($(this).parent());
		});
		$item.leftPadding=leftPadding;
		return $item;
	};
	/**
	 * 创建通知按钮
	 */
	B.createNoticeButton = function(name,button){				
		var html='<span class="notice-item easyui-tooltip" '+(button['text']?('title="'+button['text']+'"'):'')+'>'+'<span class="notice-button">'+
			'<span  class="easyui-linkbutton l-btn l-btn-small l-btn-plain" plain="true" iconCls="fa '+button['iconCls']+' fa-lg fa-c-lb">'+
			'<span class="l-btn-left l-btn-icon-left">'+
			'<span class="l-btn-text l-btn-empty">&nbsp;</span>'+
			'<span class="l-btn-icon fa '+button['iconCls']+' fa-lg fa-c-lb">&nbsp;</span>'+				                         
			'</span></span></span>'+
	        '<span class="notice-count notice-count-zero" '+(button['color']?'style="background-color:'+button['color']+'"':'')+'></span>'+            		
	        '</span>';
	    $button=$(html).appendTo("#"+this.tids.noticeBar);
	    if(xframework.isFunction(button['onClick'])) $button.click(button['onClick']);
	    $button.setCount=function(n){
	    	$target=this.find('.notice-count');
	    	$target.removeClass('notice-count-zero');			    	
	    	if(n>99) $target.text('99+');
	    	else if(n>0) $target.text(n);
	    	else $target.addClass('notice-count-zero');
	    	return this;
	    }
	    if(button['count']>0) $button.setCount(button['count']);
	    return $button;
	};
	
	B.msgAlert = function(msg,title,icon,url,delay){
		title=title||'错误';
		delay=delay||500;
		$.messager.alert(title, msg, 'error');
		if(xframework.isUrl(url)){ 
			setTimeout(function(){
				window.location.href=url;
			},delay);
		}
	};
	
});