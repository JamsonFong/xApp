/**
 * 修改当前密码(easyui组件)
 * @Author JamsonFong
 */
boneframe.define(
	"ui.index.user.password",	//模块id
	[], 					//依赖项
	{
	parent:'ui.window',
	templateUrl:"{:url('passwordTpl')}",  //组件模板
	selectors:{										  //组件UI选择器
		ids:{id:"app-password"}             
		},
	title:"修改密码",                       			  //组件标题
	//自定义属性
	original:'ui.window',
	width:320,
	height:280,
	iconCls:'fa-key',
	collapsible:false,
	minimizable:false,
	maximizable:false,
	closing:false,
	modal:true,	
	border:'thin',
	/**
	 * 组件安装完成后执行
	 */
	onLoaded:function(){
		var cThis=this;
		boneframe.require('ui',function(ui){
			cThis.menu=ui.createAccountMenuItem(cThis.id,null,{
			iconCls:'fa-key',
			text:'修改密码',
			name:'changePwd',
			onClick:function(){
				cThis.open();
			}});
		});
	},	
	
	/**
	 * 
	 */
	onBeforeClose:function(e){
		e.pauseDefault();
		$.messager.confirm('确认','您确定要阻止关闭“'+this.title+'”',function(r){
			if (r){
				e.preventDefault();
			}else{
				e.continueDefault();
			}
		});/**///阻止事件生效
	},
			
	/**
	 * 设置标题
	 */
	setTitle:function(title){
		this.title=title;
		this.target.window('setTitle',this.title);
	}	
});	