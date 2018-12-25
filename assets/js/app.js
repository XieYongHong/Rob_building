function callback(data){
    console.log(data);
}

var getFloor = (function(mod){

    var app = {}

    app.get = function(url,data,callback){
        _ajax('get',url,data,callback)
    }
    app.post = function(url,data,callback){
        _ajax('post',url,data,callback)
    }
    
    mod.setToken = function(data){
        if(typeof data === 'Object' || typeof data === 'object'){
            var a = location.href
            var index1 = a.indexOf('token')
            var index2 = a.indexOf('&')
            var b = a.substring(index1+6,index2)
            data.number = b
            saveUserInfo(data)
            localStorage.setItem('user_info',JSON.stringify(data))
        }else{
            localStorage.setItem('user_info','')
        }
    }

    mod.getToken = function(){
        var str = localStorage.getItem('user_info')
        return  str ? JSON.parse(str) : false
    }

    function saveUserInfo(data){
        app.post('/saveuserInfo',data,function(data){
            if(data.success){
                console.log('保存成功');
            }else{
                console.log('保存失败'+data.message);
            }
        })
    }

    function _ajax(type,url,data,callback){
        $.ajax({
            type: type,
            url: 'http://localhost:8090'+url,
            data: data,
            success: function (data) {
                callback(data)
            },
            error(data){
                console.log(data);
            }
        });
    }
    return mod
})(window.getFloor || {})

