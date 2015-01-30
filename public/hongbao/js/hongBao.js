AV.initialize("pxu918ooco9l3s66xldjpyb42jlxgt5d8kp354ot75fkxr8i", "amvkbm9du0i35ulqccod2o0n6k6eawphw0akomf8hkf5hry4");

function initView() {
    document.getElementById("lqhbb").parentNode.className = "bd";
    var inputphone = document.getElementById("inputphone");
    inputphone.style.display = "none";
    inputphone.firstElementChild.firstElementChild.style.display = "none";
    document.getElementById("helplist").firstElementChild.innerHTML = '已有<span id="friendsNum">0</span>位好友帮你聚财';
    var open_hb = document.getElementById("open_hb");
    open_hb.firstElementChild.className = "fontone1_help";
    open_hb.lastElementChild.className = "fontone_help";
    document.getElementById("money").firstElementChild.className = "fonttwo";
    var hideArr = document.getElementsByName("hide");
    for (var i = 0, len = hideArr.length; i < len; i++) {
        hideArr[i].style.display = "none";
    }
}

/////////////////////////// OTHER
//todo 用户点击使用钱的按钮

// 此处为用户不分享给好友的处理方式
document.getElementById("close").onclick = function () {
    closeDiv();
}
function closeDiv() { //关闭弹出框
    startMove(document.getElementById("alertdiv"), 0);
}

function alertDiv(obj) {
    var w = document.createElement("div");
    w.setAttribute("id", "mybody"); //创建透明背景层(mybody)
    with (w.style) {
        position = 'absolute';
        zIndex = '10000';
        left = '0';
        top = '0';
        background = '#000000';
        filter = 'Alpha(opacity=50)';
        opacity = '0.5';
    }
    document.body.appendChild(w);
    w.onclick = closeDiv;
    if (!obj) return false;
    obj.style.display = "block";
    startMove(obj, 300);
    with (obj.style) { // 设置 弹出框一些基本属性
        position = 'absolute';
        zIndex = '10001';
        left = "50%";
    }
};
var t = [];

function startMove(obj, iTarget) { //运动
    if (obj.t) {
        clearInterval(obj.t);
        obj.t = null;
    }
    obj.t = setInterval(function () {
        doMove(obj, iTarget)
    }, 30);
};
var iSpeed = 0;

function doMove(obj, iTarget) {
    iSpeed = (iTarget - obj.offsetHeight) / 5;
    iSpeed = iSpeed > 0 ? Math.ceil(iSpeed) : Math.floor(iSpeed); //速度取整
    if (obj.offsetHeight == iTarget) { // 目标点结束
        if (obj.t) {
            clearInterval(obj.t);
            obj.t = null;
            if (iTarget == 0) {
                obj.style.display = "none";
                document.body.removeChild(document.getElementById("mybody")); //删除节点
            }
        }
    } else {
        obj.style.height = obj.offsetHeight + iSpeed + "px";
    }

    onResize(obj); //调整弹出框位置
};
function onResize(obj) {
    if (!obj) return;
    var _bg = document.getElementById("mybody");
    var size = {width: 0, height: 0};
    size.width = Math.max(document.documentElement.scrollWidth, document.documentElement.clientWidth || document.body.clientWidth) + "px";
    size.height = Math.max(document.documentElement.scrollHeight, document.documentElement.clientHeight || document.body.clientHeight) + "px";
    //获取页面高度 和 宽度 最大值
    if (!_bg) return;
    _bg.style.width = size.width;
    _bg.style.height = size.height;

    with (obj.style) { //调整弹出框位置
        left = (parseInt(document.documentElement.clientWidth || document.body.clientWidth)) / 2 + (document.documentElement.scrollLeft || document.body.scrollLeft) - obj.offsetWidth / 2 + "px";
        ;
        top = (parseInt(document.documentElement.clientHeight || document.body.clientHeight)) / 2 + (document.documentElement.scrollTop || document.body.scrollTop) - obj.offsetHeight / 2 + "px";
    }
}

function daysBetween(first, second) {

    // Copy date parts of the timestamps, discarding the time parts.
    var one = new Date(first.getFullYear(), first.getMonth(), first.getDate());
    var two = new Date(second.getFullYear(), second.getMonth(), second.getDate());

    // Do the math.
    var millisecondsPerDay = 1000 * 60 * 60 * 24;
    var millisBetween = two.getTime() - one.getTime();
    var days = millisBetween / millisecondsPerDay;

    // Round down.
    return Math.floor(days);
}

function resetGetHongbaoBtn() {
    document.getElementById('getHongbaoBtn').innerHTML = "领红包"
}

window.onresize = function () {
    //窗口发生改变，触发onResize函数 调整弹出框
    onResize(document.getElementById("alertdiv"));
};

angular.module('ngQianbao', [])
    .controller('QianbaoController', function ($scope) {
        var Hongbao = AV.Object.extend("Hongbao");
        var Support = AV.Object.extend("Support");

        function clearUrl() {
            var cleanUrl = window.location.protocol + "//" + window.location.host + window.location.pathname
            window.history.pushState({path: cleanUrl}, '', cleanUrl);
        }

        function init() {
            var leftDays = daysBetween(new Date(), new Date(2015, 1, 26));
            document.getElementById('leftTime2').innerHTML = leftDays;
            document.getElementById('leftTime').innerHTML = leftDays;
            clearUrl()
            if (typeof me === 'undefined') {
                // TODO
                alert('Internal error, should not be here')
            } else if (typeof target === 'undefined') {
                // Seed users
                if (typeof me.phoneNo === 'undefined') {
                    // I have no phone number set
                    changeState('init')
                } else {
                    // I have set my number, so jump to target url
                    window.history.replaceState('Object', 'Title', '/hongbao/' + me.objectId);
                    changeState('mine')
                }
            } else if (target.objectId === me.objectId) {
                changeState('mine')
            } else {
                changeState('others')
            }
        }

        var page = (function () {
            return {
                showWelcome: function () {
                    console.log('welcome')
                    initView()
                    showWelcome()
                },
                showMine: function () {
                    console.log('mine')
                    showMyShared()
                },
                showOthers: function () {
                    console.log('others')
                    showHelped()
                }
            }
        })()

        function changeState(state) {
            switch (state) {
                case 'init':
                    page.showWelcome();
                    break;
                case 'mine':
                    page.showMine();
                    break;
                case 'others':
                    page.showOthers();
                    break;
            }
        }


        function checkPhone(phoneNo) {
            if (phoneNo.length === 11) {
                for (var i = 0; i < phoneNo.length; i++) {
                    var num = phoneNo[i];
                    if (num > '9' || num < '0') {
                        return false
                    }
                }
                return true
            } else {
                return false
            }
        }

        $scope.getHongbao = function () {
            var phoneNo = document.getElementById("phoneNo").value
            if (checkPhone(phoneNo)) {
                AV.Cloud.run('updatePhoneNo', {
                    hongbaoId: me.objectId,
                    phoneNo: phoneNo
                }).then(function (hongbao) {
                    me = hongbao
                    target = hongbao
                    window.history.replaceState('Object', 'Title', '/hongbao/' + me.objectId);
                    showMyShared()
                    alertDiv(document.getElementById("alertdiv"));
                }, function (err) {
                    document.getElementById('getHongbaoBtn').innerHTML = "此号码已参加活动"
                })
                //alertDiv(document.getElementById("alertDiv"));
            } else {
                document.getElementById('getHongbaoBtn').innerHTML = "手机号码输入错误"
            }
        }


//输入手机号页面
        function showWelcome(res) {
            initView();
            var lqhbb = document.getElementById("lqhbb");
            lqhbb.style.display = "block";
            lqhbb.parentNode.className = "bd_begin";
            var inputphone = document.getElementById("inputphone");
            inputphone.style.display = "block";
            inputphone.firstElementChild.firstElementChild.style.display = "block";
            document.getElementById("intro").style.display = "block";
        }

//分享页
        function showMyShared(res) {
            initView();

            document.getElementById("yy_hb_no").style.display = "block";
            document.getElementById("money").style.display = "block";
            document.getElementById("dayTips").style.display = "-webkit-box";
            document.getElementById("myButtons").style.display = "-webkit-box";
            document.getElementById("helplist").style.display = "block";
            //document.getElementById("leftTime").innerHTML = checkFinished();
            document.getElementById("frindsList").style.display = "block";

            refreshSupportList()
                .then(function (supports) {
                    var total = 100
                    if (supports) {
                        supports.forEach(function (support) {
                            total += support.get("amount")
                        })
                        if (total >= 1000) {
                            document.getElementById("nowMoney").innerHTML = 1000;
                            alert('check full');
                            checkFull('A')
                        } else {
                            document.getElementById("nowMoney").innerHTML = total;
                        }
                    } else {
                        document.getElementById("nowMoney").innerHTML = total;
                    }
                })

            //var friendsNum = document.getElementById("friendsNum");
            //var query = new AV.Query(Support);
            //query.equalTo('target', new Hongbao({id: me.objectId}))
            //query.find().then(function (supports) {
            //    if (supports.length == 0) {
            //        document.getElementById("frindsList").style.display = "none";
            //        document.getElementById("nohelp").style.display = "block";
            //        var m = document.getElementById("nowMoney");
            //        m.innerHTML = 100;
            //
            //    } else {
            //        //通过support表查询捐助者名单
            //        //friendsNum.innerHTML = supports.length
            //    }
            //}, function (err) {
            //    console.log(err)
            //})
        }

        document.getElementById("inviteFriends").onclick = function () {
            alertDiv(document.getElementById("alertdiv"));
        }

        $scope.goInit = function () {
            location.href = "/hongbao/"
        }

//活动结束页
        function checkFinished() {
            var curTime = new Date();
            var endTime = new Date("2015,2,26");
            var leftTime = Math.floor((endTime.getTime() - curTime.getTime()) / (24 * 60 * 60 * 1000));
            return leftTime;
        }

        function showMyFinished(res) {
            initView();
            document.getElementById("yy_hb_no").style.display = "block";
            document.getElementById("money").style.display = "block";
            document.getElementById("help_hb_stop").style.display = "-webkit-box";
            document.getElementById("helplist").style.display = "block";

        }

//红包已满页
        function checkFull(who) {
            var m = document.getElementById("nowMoney");
            m.parentNode.className = "fonttwo_man";
            m.style.fontSize = "3.3em";
            if (who == "A") {
                t = document.getElementById("yy_hb_no").firstElementChild;
                if (parseInt(m.innerHTML) == 1000) {
                    t.innerHTML = "您已获得满额红包";
                    t.className = "fontone_man";
                    return true;
                } else {
                    return false;
                }
            } else {
                t = document.getElementById("open_hb").lastElementChild;
                document.getElementById("open_hb_help").style.display = "none";
                document.getElementById("hb_man").style.display = "block";
                if (parseInt(m.innerHTML) == 1000) {
                    t.innerHTML = "已获得满额红包";
                    t.className = "fontone_help_man";
                    return true;
                } else {
                    return false;
                }
            }
        }

        function refreshSupportList() {
            var deferred = new AV.Promise()
            var friendsNum = document.getElementById("friendsNum");

            var query = new AV.Query(Support);
            query.include('supporter')
            query.equalTo('target', new Hongbao({id: target.objectId}))
            query.find().then(function (supports) {
                friendsNum.innerHTML = supports.length
                $scope.$apply(function () {
                    $scope.supports = supports
                })
                deferred.resolve(supports)
            }, function (err) {
                console.log(err)
                deferred.reject(err)
            })
            return deferred
        }

        //帮助页
        function showHelped() {
            initView();
            document.getElementById("open_hb").style.display = "block";
            var money = document.getElementById("money");
            money.style.display = "block";
            money.firstElementChild.className = "fonttwo_help";
            //document.getElementById("leftTime2").innerHTML = checkFinished();

            var helplist = document.getElementById("helplist");
            helplist.style.display = "block";
            helplist.firstElementChild.innerHTML = '已有<span id="friendsNum">0</span>位好友帮TA聚财';
            document.getElementById("frindsList").style.display = "block";

            var m = document.getElementById("nowMoney");
            m.innerHTML = 100;

            document.getElementById("open_hb_help").style.display = "block";
            document.getElementById("targetNickname").innerHTML = target.nickname

            function refresh() {
                refreshSupportList()
                    .then(function (supports) {
                        if (supports.length == 0) {
                            document.getElementById("frindsList").style.display = "none";
                            document.getElementById("nohelp").style.display = "block";
                        } else {
                            //通过support表查询捐助者名单
                            document.getElementById("frindsList").style.display = "block";
                            document.getElementById("nohelp").style.display = "none";

                            var total = 0
                            var alreadySupported = true
                            supports.forEach(function (support) {
                                total += support.get('amount')
                                if (support.get('supporter').objectId == target.objectId) {
                                    alreadySupported = true
                                }
                                if (alreadySupported) {
                                    document.getElementById("open_hb_help").style.display = "none";
                                    document.getElementById("help_hb").style.display = "none";
                                }
                            })
                            var m = document.getElementById("nowMoney");
                            m.innerHTML = total + 100;
                            checkFull('B')
                        }
                    }, function (err) {
                        console.log(err)
                    })
            }

            refresh()

            var ling = document.getElementById("help_friend");//error??
            ling.onclick = function () {
                AV.Cloud.run('supportHongbao', {
                    targetId: target.objectId,
                    supporterId: me.objectId
                }).then(function (support) {
                    if (typeof me.phoneNo === "undefined") {
                        showWelcomeB()
                    } else {
                        //document.getElementById("open_hb_help").style.display = "none";
                        //document.getElementById("help_hb").style.display = "block";
                        //document.getElementById("helpedMoney").innerHTML = support.amount;
                        // TODO refresh support list
                        // TODO refresh supported amount
                        refresh()
                    }
                }, function (err) {
                    document.getElementById("open_hb_help").style.display = "none";
                    document.getElementById("help_hb").style.display = "none";
                })
            };
        }

//帮助&手机页
        function showWelcomeB() {
            initView();
            var open_hb = document.getElementById("open_hb");
            open_hb.style.display = "block";
            open_hb.parentNode.className = "bd_begin";
            open_hb.firstElementChild.className = "fontone1_help_begin";
            open_hb.lastElementChild.className = "fontone_help_begin";
            var money = document.getElementById("money");
            money.style.display = "block";
            money.firstElementChild.className = "fonttwo_help_begin";
            document.getElementById("helpFrindsTips").style.display = "-webkit-box";
            document.getElementById("inputphone").style.display = "block";
            document.getElementById("intro").style.display = "block";
            //if (checkPhone()) {
            //    showHelped();
            //}
        }

//读取当前的URI
//返回Object对象
        function GetRequest() {
            var url = location.search; //获取url中"?"符后的字串
            var theRequest = new Object();
            if (url.indexOf("?") != -1) {
                var str = url.substr(1);
                var strs = str.split("&");
                for (var i = 0; i < strs.length; i++) {
                    theRequest[strs[i].split("=")[0]] = unescape(strs[i].split("=")[1]);
                }
            }
            return theRequest;
        }


        init();
    })




