function callback(data) {
    console.log(data);
}

var getFloor = (function (mod) {
    var status = true
    var app = {}
    var _userInfo = {}

    app.get = function (url, data, cb) {
        _ajax('get', url, data, cb)
    }
    app.post = function (url, data, cb) {
        _ajax('post', url, data, cb)
    }

    mod.setToken = function (data) {
        if (typeof data === 'Object' || typeof data === 'object') {
            var a = location.href
            var index1 = a.indexOf('access_token')
           debugger
            if(index1 != -1){
                var b = a.substr(index1)
                var c = b.split('&')
                for(var i=0;i<c.length;i++){
                    var arr = c[i].split('=')
                    if(arr[0].indexOf('token') != -1){
                        data.number = arr[1]
                    }
                }
            }
            console.log(data);
            _userInfo = data
            saveUserInfo(data)
            localStorage.setItem('user_info', JSON.stringify(data))
        } else {
            localStorage.setItem('user_info', '')
        }
    }

    mod.getToken = function () {
        var str = localStorage.getItem('user_info')
        if(str) _userInfo = JSON.parse(str);
        return str ? JSON.parse(str) : false
    }

    mod.floor = function () {
        _time()
        if (!_userInfo.number) {
            $(".getfloor-btn").removeClass('un-active');
            return tipMessage('请先登录')
        }
        if(!status){
            $(".getfloor-btn").removeClass('un-active');
            $('#prize_code_modal').modal('open')
            $('#prize_code').text(_userInfo.number)
            return 
        }
        app.post('/getfloor', _userInfo, function (data) {
            
            if (data.success) {
                $('.floor_money').html(data.data.money.toFixed(2) + '元')
                $('.get_floors').html(data.data.floor + '楼')
                var code = data.code
                if (code == 9) {
                    return tipMessage(data.message)
                }
                addfloor()

                if (data.data.getMoney) {
                    tip('中奖啦！！获得 '+data.data.getMoney+ '元')
                }
            } else {
                if (data.code == 3) {
                    return $('#getfloor_share').modal('open')
                } else {
                    tipMessage(data.message)
                }
            }

        })
    }

    mod.share = function () {
        if (!_userInfo.number) {
            return tipMessage('请先登录')
        }
        qZone()
        app.post('/share', _userInfo, function (data) {
            if (!data.success) {
                tipMessage(data.message)
            }
        })
    }

    mod.init = function () {
        domInit()
        this.moneyList()
        this.rank()
        app.get('/queryFloor', {}, function (data) {
            if (!data.success) {
                return tipMessage(data.message);
            }
            var arr = data.data.list;
            var str = ''
            for (var i = 0; i < arr.length; i++) {
                str += '<li class="am-cf">' +
                    '<div class="userbox am-cf">' +
                    '<div class="userimg">' +
                    '<img  class="img" src="' + arr[i].image + '"/>' +
                    '<div class="userimgborder"></div>' +
                    '</div>' +
                    '<p class="username">' + arr[i].name + '</p>' +
                    '<p class="floor">' + arr[i].number + ' 楼</p>' +
                    '</div>' +
                    '<p class="content">各位父老乡亲们！又是新的一年啦！祝各位美梦成真，步步高升，新年新气象！</p>' +
                    '<p class="date">' + arr[i].create_time + '</p>' +
                    '</li>'
            }
            if(data.data.code == 9){
                status = false
                $('.getfloor-btn').text('查看领奖码')
            }
            $('#floor_items').html(str)
        })

        console.log(_userInfo);
        if (!_userInfo || JSON.stringify(_userInfo) === '{}') return;

        if (!_userInfo.number) {
            return tipMessage('请先登录')
        }

        app.post('/getUserInfo', _userInfo, function (data) {
            if (data.success) {
                $('.floor_money').html(data.data.money.toFixed(2) + '元')
                $('.get_floors').html(data.data.floor + '楼')
            } else {
                $('.floor_money').html('0.00元')
                $('.get_floors').html('0楼')
            }
        })

    }

    mod.moneyList = function () {
        app.get('/getMoneyList', {}, function (data) {
            if (data.success) {
                var arr = data.data
                var str = ''
                for (var i = 0; i < arr.length; i++) {
                    str += '<li>' +
                        '<p>' +
                        '<span>' + arr[i].name + '</span>' +
                        ' 获得 ' +
                        '<span>' + arr[i].money + '元</span>' +
                        ' 现金红包' +
                        '</p>' +
                        '</li>'
                }
                $('#red_list').html(str)
                //数字跳动
                var scrollIndex = 0;
                var Timer = null;
                clearInterval(Timer);
                var ul = $(".radline_box ul");
                var li = ul.children("li");
                var h = li.height();
                ul.css("height", h * li.length * 2);
                ul.html(ul.html() + ul.html());

                function run() {
                    if (scrollIndex >= li.length) {
                        ul.css({
                            top: 0
                        });
                        scrollIndex = 1;
                        ul.animate({
                            top: -scrollIndex * h
                        }, 100);
                    } else {
                        scrollIndex++;
                        ul.animate({
                            top: -scrollIndex * h
                        }, 100);
                    }
                }
                Timer = setInterval(run, 3000);
            }
        })
    }

    mod.rank = function () {
        app.get('/getRank', {}, function (data) {
            if (data.success) {
                var arr = data.data
                var str = ''
                for (var i = 0; i < arr.length; i++) {
                    str += '<li class="am-cf">' +
                        '<div class="userimg">' +
                        '<img src="' + arr[i].img + '" class="userimg" />' +
                        '</div>' +
                        '<p class="username">' + arr[i].name + '</p>' +
                        '<p class="floornum">' + arr[i].floor + '</p>' +
                        '</li>'
                }
                $('#floor_rank').html(str)
            }
        })
    }

    mod.checkImg = function (type) {
        if(type == 0){
            $('#prize_img_meng').modal('open')
        }else if(type === 1){
            $('#prize_img_mo').modal('open')
        }
    }
    function addfloor(){
        var floor = $('#floor_items li:first-child .floor').text()
        var number = Number(floor.substring(0,floor.length-2)) + 1
        var str = '<li class="am-cf">' +
        '<div class="userbox am-cf">' +
        '<div class="userimg">' +
        '<img  class="img" src="' + _userInfo.figureurl_qq_1 + '"/>' +
        '<div class="userimgborder"></div>' +
        '</div>' +
        '<p class="username">' + _userInfo.nickname + '</p>' +
        '<p class="floor">' + number + ' 楼</p>' +
        '</div>' +
        '<p class="content">各位父老乡亲们！又是新的一年啦！祝各位美梦成真，步步高升，新年新气象！</p>' +
        '<p class="date">' + newTime() + '</p>' +
        '</li>'

        $('#floor_items').prepend(str);
    }

    function newTime(){
        var date = new Date();
        var y = date.getFullYear();
        var m = date.getMonth() + 1;
        m = m < 10 ? ('0' + m) : m;
        var d = date.getDate();
        d = d < 10 ? ('0' + d) : d;
        var h = date.getHours();
        h = h < 10 ? ('0' + h) : h;
        var minute = date.getMinutes();
        var second = date.getSeconds();
        minute = minute < 10 ? ('0' + minute) : minute;
        second = second < 10 ? ('0' + second) : second;
        return y + '-' + m + '-' + d + ' ' + h + ':' + minute + ':' + second;
    }

    function tip(text) {
        $("#box").append('<div id="tip">' + text + '</div>');
        $("#tip").css({
            "opacity": 1,
            "z-index": 999999,
        })
        setTimeout(function () {
            $("#tip").css({
                "opacity": 0,
                "z-index": 0
            })
        }, 2000)
    }

    function domInit() {
        $('.getfloor-btn').on('click', function () {
            var classType = $(this).hasClass('un-active');
            if (!classType) {
                getFloor.floor()
                $(this).addClass('un-active');
            }
        })
    }

    function tipMessage(msg) {
        $('#message').text(msg)
        $('#top_message_modal').modal('open')
    }

    function saveUserInfo(data) {
        app.post('/saveuserInfo', data, function (data) {
            if (data.success) {
                console.log('保存成功');
            } else {
                console.log('保存失败' + data.message);
            }
        })
    }
    //倒计时
    function _time() {
        var countDown = 3;
        //默认样式
        (function settime() {
            if (countDown == 0) {
                countDown = 3;
                classChange();
            } else {
                $(".getfloor-btn").text(countDown + "s");
                --countDown;
                setTimeout(function () {
                    settime()
                }, 1000)
            }
        })()

        function classChange() { //时间到了后，改变样式
            $(".getfloor-btn").text("抢楼！！");
            $(".getfloor-btn").removeClass('un-active');
        }
    }

    function qZone() {
        var p = {
            url: 'getfloor.lieqidao.club',
            showcount: '0',
            /*是否显示分享总数,显示：'1'，不显示：'0' */
            desc: '「诡梦墙」&「原创短文墙」请你来抢红包啦！',
            /*默认分享理由(可选)*/
            summary: '',
            /*分享摘要(可选)*/
            title: '2018元旦抢楼活动',
            /*分享标题(可选)*/
            site: 'getfloor.lieqidao.club',
            /*分享来源 如：腾讯网(可选)summary*/
            pics: 'getfloor.lieqidao.club/images/banner_03.png',
            /*分享图片的路径(可选)*/
            style: '',
            width: 199,
            height: 30
        };
        var s = [];
        for (var i in p) {
            s.push(i + '=' + encodeURIComponent(p[i] || ''));
        }
        var target_url =
            "http://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?" + s.join('&');
        window.open(target_url, 'qZone',
            'height=430, width=400');
    }

    function _ajax(type, url, data, callback) {
        $.ajax({
            type: type,
            // url: 'http://localhost:8085' + url,
            url: 'http://139.159.146.159:8085' + url,
            data: data,
            success: function (data) {
                callback(data)
            },
            error(data) {
                console.log(data);
            }
        });
    }
    return mod
})(window.getFloor || {})