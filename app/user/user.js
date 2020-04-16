/**
 * 用户管理模块
 * @Author JamsonFong
 */
define(function(require,exports,module){
	var app=require('../app.js'),
	    parent=require('../role/role');//继承role组件界面
	
	exports=app.createComponent('user',module,parent);
	
	exports.tids={
			id:"app-user",
			toolbar:"app-user-toolbar",
			searchForm:"app-user-search-form",
			pagination:"app-user-pagination"
	};
	exports.title="账号管理";
	exports.iconCls='fa-user';
	exports.serviceOptions={
		idField:'user_id',
		id:0,
		url:{
			createUrl:"/resource/user/create",
			saveUrl:"/resource/user",
			readUrl:"/resource/user/",
			updateUrl:"/resource/user/",
			deleteUrl:"/resource/user/",
			searchUrl:"/resource/user",
		},   
		fields:[
			{ title: "账号ID", field: 'role_id', width: 80 },
			{ title: "账号名称", field: 'role_name', width: 180 },
            { title: "账号描述", field: 'description', width: 300 }
		]
	};
	return exports;
});	
