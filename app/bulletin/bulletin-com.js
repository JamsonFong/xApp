/**
 * 当前账户的消息浏览组件(easyui组件)
 * @Author JamsonFong
 */
jsFrame.component({
	name:"index.currUser.bulletin",          //组件名称
	id:"app-currUser-bulletin",             //组件UI选择器
	templateUrl:"{:url('CurrentUser/bulletinTpl')}",   //组件模板
	iconCls:'fa-bell',
	
	/**
	 * 组件安装完成后执行
	 */
	onInstall:function(){
		var cThis=this;
		//创建菜单样例
    	this.bellBtn=jsFrame.createNoticeButton(this.name,{
			iconCls:this.iconCls,
			color:'#ff9800'});
    	var queue=jsFrame.createEmptyQueue();
    	if(!jsFrame.isString(this.template)){
    		queue.entry(jsFrame.createEvent(this,"onLoadTemplate",null,true,true));
    	}
    	queue.entry(jsFrame.createEvent(this,function(){
    		var template=cThis.template;
			cThis.id=jsFrame.getNewId();
			cThis.bellBtn.tooltip({
	    		showEvent:'click',
	    		content: function(){return $('<div id="'+cThis.id+'" class="easyui-panel" style="height:640px;width:480px;">'+template+'</div>');},
	    		onShow: function(cc){
	    			$.parser.parse('#'+cThis.id);
	    			var t = $(this);
	    			 t.tooltip('tip').unbind().bind('mouseenter', function(){
	                     t.tooltip('show');
	                 }).bind('mouseleave', function(){
	                     t.tooltip('hide');
	                 });
	            }
	    	});
		}));
    	queue.fireEvents();
    	
	}
	
});	