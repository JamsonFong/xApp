/**
 * “首页”JS组件(easyui组件)
 * @Author JamsonFong
 */
define(function(require,exports,module){
	var engine=require('../core/engine'),app=require('../app');
	exports=app.createComponent('home',module);
	exports.tids={
		id:"app-index-home",
		p1:'p1',
		p2:'p2',
		p3:'p3',
		p4:'p4',
		p5:'p5',
		p6:'p6',
		p7:'p7',
		p8:'p8',
		p9:'p9'
	};
	exports.title="首页";
	exports.iconCls='fa-home';

	exports.onAfterLoad=function(e){
    	for(var i in this.tids){
    		if(i=='id') continue;
    		$('#'+this.tids[i]).panel({});
    	}/**/
    	$.parser.parse('#'+this.tids.id);
    };
    exports.onInit=function(){
    	
    };
	
	return exports;
		
});	