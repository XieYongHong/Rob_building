function callback(data){
    console.log(data);
}

var getFloor = (function(mod){

    var app = {}
    var _userInfo = {}

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
            data.number =b
            _userInfo = data
            saveUserInfo(data)
            localStorage.setItem('user_info',JSON.stringify(data))
        }else{
            localStorage.setItem('user_info','')
        }
    }

    mod.getToken = function(){
        var str = localStorage.getItem('user_info')
        _userInfo = JSON.parse(str)
        return  str ? JSON.parse(str) : false
    }

    mod.floor = function(){
        app.post('/getfloor',_userInfo,function(data){
            $('.floor_money').html(data.data.money.toFixed(2) + '元')
            $('.get_floors').html(data.data.floor + '楼')
            console.log(data.data.money);
        })
    }

    mod.share = function(){
        console.log('分享');
        app.post('/share', _userInfo, function(data){
            console.log(data.message);
        })
    }

    mod.init = function(){
        app.post('/queryFloor', _userInfo, function(data){
            if(!data.success){
                return;
            }
            var arr = data.data.list;
            var str = ''
            for(var i=0;i<arr.length;i++){
                str += '<li class="am-cf">'
                        +'<div class="userbox am-cf">'
                            +'<div class="userimg">'
                                +'<img  class="img" src="'+arr[i].image+'"/>'
                                +'<div class="userimgborder"></div>'
                            +'</div>'
                            +'<p class="username">'+arr[i].name+'</p>'
                            +'<p class="floor">'+arr[i].number+' 楼</p>'
                        +'</div>'
                        +'<p class="content">诡梦墙、原创短文墙携列表各位乡亲父老，在这特殊的日子里，给大伙儿送个祝福！祝大家在2019年，大吉大利，天天吃鸡！也祝各位老板在新的一年里，万事如意，心想事成！谢谢各位老板对墙君的支持，希望来年咱们也能继续相亲相爱！</p>'
                        +'<p class="date">'+arr[i].create_time+'</p>'
                        +'</li>'
            }
            $('.floor_money').html(data.data.money.toFixed(2) + '元')
            $('.get_floors').html(data.data.floor + '楼')
            $('#floor_items').html(str)
        })
        this.moneyList()
        this.rank()
    }
    
    mod.moneyList = function(){
        app.get('/getMoneyList', {}, function(data){
            if(data.success){
                var arr = data.data
                var str = ''
                for(var i=0;i<arr.length;i++){
                    str = '<li>'
                            +'<p>'
                                +'<span>'+arr[i].name+'</span>'
                                +' 获得 '
                                +'<span>'+arr[i].name+'元</span>'
                                +' 现金红包'
                            +'</p>'
                        +'</li>'
                }
                $('#red_list').html(str)
            }
        })
    }

    mod.rank = function(){
        app.get('/getRank', {}, function(data){
            if(data.success){
                var arr = data.data
                var str = ''
                for(var i=0;i<arr.length;i++){
                    str = '<li>'
                            +'<div>'
                                +'<img src="'+arr[i].img+'" class="userimg" />'
                            +'</div>'
                            +'<p class="username">'+arr[i].name+'</p>'
                            +'<p class="floornum">'+arr[i].floor+'</p>'
                        +'</li>'
                }
                $('#floor_rank').html(str)
            }
        })
    }

    function saveUserInfo(data){
        app.post('/saveuserInfo', data, function(data){
            if(data.success){
                console.log('保存成功');
            }else{
                console.log('保存失败'+data.message);
            }
        })
    }

    function _ajax(type, url, data, callback){
        $.ajax({
            type: type,
            url: 'http://localhost:8085'+url,
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

