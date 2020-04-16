/**
 * 当前账户的消息浏览组件(easyui组件)
 * @Author JamsonFong
 */
boneframe.define(
	"ui.index.message.tips",
	[],
	{
	parent:'ui.window',
	selectors:{
		ids:{
			id:"app-currUser-message"
	}},             //组件UI选择器
	templateUrl:"{:url('tipsTpl')}",   	  //组件模板
	title:"我的消息",                       //组件标题
	type:'window',
	iconCls:'fa-envelope',
	
	//自定义属性
	window:null,	
	width:480,
	height:480,
	closing:false,	
	collapsible:false,
	minimizable:false,
	maximizable:false,
	closable:true,
	draggable:false,
	resizable:false,
	modal:true,
	border:'thin',

	onLoaded:function(){		
		var cThis=this;
		boneframe.require('ui',function(ui){
			cThis.msgBtn=ui.createNoticeButton(cThis.id,{
			iconCls:'fa-envelope',
			onClick:function(){
				cThis.open();
			}});
		});
		this.height=document.body.clientHeight;/**/
	},	
	onResize:function(){
		var height=document.body.clientHeight;
		this.height=height>480?height:480;
		this.target.window('resize',{width:this.width,height:this.height});
		this.target.window('move',{left:document.body.clientWidth-this.width,top:0});
	},
	onInitUI:function(e){
		var cThis=this;
		cThis.original.onInitUI.apply(this,arguments);
		 window.addEventListener('resize',this.onResize.bind(this),false);
		 this.target.window('move',{left:document.body.clientWidth-this.width,top:0});
	}
	
	
});	