/**
 * 
 * 
 */
boneframe.define(
	"ui.window",
	[],
	{
	parent:"component",          //组件名称
	selectors:{
		ids:{
			id:"app-window"
	}},            
	template:"<div id='app-window'></div>",  //组件模板
	title:"新窗口",                       //组件标题
	type:'window',
	iconCls:'fa-envelope',
	
	//自定义属性
	window:null,	
	width:640,
	height:480,
	closing:false,	
	collapsible:true,
	minimizable:true,
	maximizable:true,
	closable:true,
	draggable:true,
	resizable:true,
	modal:true,
	border:'thin',

	onInitUI:function(e){
		var cThis=this;
		if(cThis.isInitialized()==false){
			console.log(this);
			cThis.target=$('#'+cThis.selectors.ids.id).window({
        		title:cThis.title,
        		width:cThis.width,
        		height:cThis.height,
        		iconCls:'fa '+cThis.iconCls,
        		closed:cThis.closed,
        		collapsible:cThis.collapsible,
        		minimizable:cThis.minimizable,
        		maximizable:cThis.maximizable,
        		closable:cThis.closable,
        		draggable:cThis.draggable,
        		resizable:cThis.resizable,
        		modal:cThis.modal,
        		border:cThis.border,
        		onBeforeClose:function(){ 
        			if(cThis.closing) return true;
	        		setTimeout(function(){
	        			cThis.hide();
	        		});			    	
			    	return false;
        	}});  						
        	$.parser.parse('#'+cThis.selectors.ids.id);
        }else{
        	e.cancel();
        }
	},
			
	/**
	 * 设置标题
	 */
	setTitle:function(title){
		this.title=title;
		this.target.window({title:this.title});
	}	
});	