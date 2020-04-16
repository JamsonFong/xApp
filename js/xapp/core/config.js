define({
	//开启引擎调试模式, 方便从控制台查看相关调试信息。
	debug:false,
	//RESTful 模式
	RESTful:true,
	//指定所使用的语言包
	lang:navigator.language||navigator.userLanguage,
	
	basePath:'/app',
	//默认路由地址
	defaultPage:'/app/home',

	tagIdPrefix:'_xapp_tag-',
	
	templateExt:"html"
});