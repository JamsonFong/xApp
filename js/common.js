String.prototype.endWith = function(str){  
     if(str==null || str=="" || this.length == 0 ||str.length > this.length){      
       return false;  
     }  
     if(this.substring(this.length - str.length)){  
         return true;  
     }else{  
         return false;  
     }  
     return true;  
};  
  
 String.prototype.startWith = function(str){  
  if(str == null || str== "" || this.length== 0 || str.length > this.length){  
     return false;  
  }   
  if(this.substr(0,str.length) == str){  
     return true;  
  }else{  
     return false;  
   }         
  return true;   
 }; 

jQuery.download = function (url, data, method) {
    if (url && data) {// 获取url和data        
        data = typeof data == 'string' ? data : jQuery.param(data); // data 是 string 或者 array/object        
        var inputs = ''; // 把参数组装成 form的  input
        jQuery.each(data.split('&'), function () { var pair = this.split('='); inputs += '<input type="hidden" name="' + pair[0] + '" value="' + pair[1] + '" />'; });
        jQuery('<form action="' + url + '" method="' + (method || 'post') + '">' + inputs + '</form>').appendTo('body').submit().remove(); // request发送请求
    };
};

Date.prototype.Format = function (fmt) { //author: meizz   
    var o = {
        "M+": this.getMonth() + 1,                 //月份   
        "d+": this.getDate(),                    //日   
        "h+": this.getHours(),                   //小时   
        "m+": this.getMinutes(),                 //分   
        "s+": this.getSeconds(),                 //秒   
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度   
        "S": this.getMilliseconds()             //毫秒   
    };
    if (/(y+)/.test(fmt))
        fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt))
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
};


jQuery.fn.datebox.defaults.formatter = function (date) {
    if (date instanceof Date) {
        var y = date.getFullYear();
        var m = date.getMonth() + 1;
        var d = date.getDate();
        var str = y + '-' + (m < 10 ? ('0' + m) : m) + '-' + (d < 10 ? ('0' + d) : d) ;
        return str;
    }
    else return "";
};
jQuery.fn.datebox.defaults.parser = function (s) {
    if (s && s.length === 11) {
        //var reg = /[\u4e00-\u9fa5]/;  含中文时,利用正则表达式分隔 
        var ss = (s.split('-'));
        var y = parseInt(ss[0], 10);
        var m = parseInt(ss[1], 10);
        var d = parseInt(ss[2], 10);
        if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
            return new Date(y, m - 1, d);
        } else {
            return new Date();
        }
    }
    else return new Date();
};

jQuery.fn.datetimebox.defaults.formatter = function (date) {
    if (date instanceof Date) {
        var y = date.getFullYear();
        var m = date.getMonth() + 1;
        var d = date.getDate();
        var h = date.getHours();
        var min = date.getMinutes();
        var sec = date.getSeconds();
        var str = y + '-' + (m < 10 ? ('0' + m) : m) + '-' + (d < 10 ? ('0' + d) : d) + ' ' + (h < 10 ? ('0' + h) : h) + ':' + (min < 10 ? ('0' + min) : min) + ':' + (sec < 10 ? ('0' + sec) : sec);
        return str;
    }
    else return "";
};
jQuery.fn.datetimebox.defaults.parser = function (s) {
    if (s && s.length >= 18) {
        //var reg = /[\u4e00-\u9fa5]/; 含中文时,利用正则表达式分隔  
        var str = s.split(' ');
        var ss = (str[0].split('-'));
        var tt = (str[1].split(":"));
        var y = parseInt(ss[0], 10);
        var m = parseInt(ss[1], 10);
        var d = parseInt(ss[2], 10);
        var h = parseInt(tt[0], 10);
        var min = parseInt(tt[1], 10);
        var sec = parseInt(tt[2], 10);
        if (!isNaN(y) && !isNaN(m) && !isNaN(d) && !isNaN(h) && !isNaN(min) && !isNaN(sec)) {
            return new Date(y, m - 1, d, h, min, sec);
        } else {
            return new Date();
        }
    }
    else {
        return new Date();
    }
};

