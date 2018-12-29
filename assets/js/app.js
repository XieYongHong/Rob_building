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
            // var a = location.href
            // var index1 = a.indexOf('token')
            // var index2 = a.indexOf('&')
            // var b = a.substring(index1+6,index2)
            // data.number =b
            _userInfo = data
            saveUserInfo(data)
            localStorage.setItem('user_info', JSON.stringify(data))
        } else {
            localStorage.setItem('user_info', '')
        }
    }

    mod.getToken = function () {
        var str = localStorage.getItem('user_info')
        _userInfo = JSON.parse(str)
        return str ? JSON.parse(str) : false
    }

    mod.floor = function () {
        if (!_userInfo.number) {
            return tipMessage('请先登录')
        }
        if(!status){
            $(".getfloor-btn").removeClass('un-active');
            $('#prize_code_modal').modal('open')
            $('#prize_code').text(_userInfo.number)
            return 
        }
        app.post('/getfloor', _userInfo, function (data) {
            _time()
            if (data.success) {
                $('.floor_money').html(data.data.money.toFixed(2) + '元')
                $('.get_floors').html(data.data.floor + '楼')
                var code = data.code
                if (code == 9) {
                    tipMessage(data.message)
                }

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
                    '<p class="content">诡梦墙、原创短文墙携列表各位乡亲父老，在这特殊的日子里，给大伙儿送个祝福！祝大家在2019年，大吉大利，天天吃鸡！也祝各位老板在新的一年里，万事如意，心想事成！谢谢各位老板对墙君的支持，希望来年咱们也能继续相亲相爱！</p>' +
                    '<p class="date">' + arr[i].create_time + '</p>' +
                    '</li>'
            }
            if(data.data.code == 9){
                status = false
                $('.getfloor-btn').text('查看领奖码')
            }
            $('#floor_items').html(str)
        })

        if (!_userInfo) return;

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
                    str += '<li>' +
                        '<div>' +
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
        var src = type == 0 ? 'images/meng.jpg' : 'images/mo.jpg'
        $('#prize_img img').attr('src', src)
        $('#prize_img').modal('open')
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
            url: 'http://localhost:8085' + url,
            // url: 'http://139.159.146.159:8085' + url,
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