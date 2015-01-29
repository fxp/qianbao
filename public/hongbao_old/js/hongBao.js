window.onload = function () {
    var i=init();
    if(checkFrom()){//A!
        if(checkFirst()){//第一次登录
            showWelcome();
        }else{//第二次登录
            if(!checkFinished()){//活动结束
                showMyFinished(i);
            }else{
                showMyShared(i);
            }
        }
    }else{//B
        if(!checkFrom()){//自己的红包
            if(checkFinished()){//活动结束
                showMyFinished(i);
            }else{
                showMyShared(i);
            }
        }else{//别人的红包
            if(!checkFinished()){//活动结束
                showAFinished();
            }else{
                if(!checkFirst()){//已经帮助过
                    showHelped();
                }else{
                    showHelpA();
                    if(!checkAndShare(i)){
                        showHelped();
                    }
                }
            }
        }
    }
}
function init(){
//        初始化微信
    //如果此处用户分享给了好友,需要调用微信分享时间监听函数，首先应该初始化微信插件
    wx.config({
        debug: true, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
        appId: 'wxa75b0e20f33b5d6a', // 必填，公众号的唯一标识
        timestamp: '', // 必填，生成签名的时间戳
        nonceStr: '', // 必填，生成签名的随机串
        signature: '',// 必填，签名，见附录1
        jsApiList: [] // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
    });
//初始化leanCloud
    AV.initialize("pxu918ooco9l3s66xldjpyb42jlxgt5d8kp354ot75fkxr8i", "amvkbm9du0i35ulqccod2o0n6k6eawphw0akomf8hkf5hry4");
    return 1;
}
/////////////////////////// CHECK
function checkFinished(){
    var curTime = new Date();
    var endTime = new Date("2015,2,26");
    var leftTime = Math.floor((endTime.getTime() - curTime.getTime()) / (24 * 60 * 60 * 1000));
    return leftTime;
}
function checkFirst(){
    return true;
}
function checkPhone(){
    //todo 如何利用css里的pattern?
    var checked =0;
    if(checked==0){
        return true;
    }else if(checked==1){
        btn.innerHTML = "此号码已参加活动";
        setTimeout(function(){btn.innerHTML="领红包";},1500);
        return false;
    }else{
        btn.innerHTML = "手机号码输入错误";
        setTimeout(function(){btn.innerHTML="领红包";},1500);
        return false;
    }
}
//TODO 检查OpenID是否是自己的红包
function checkFrom(){
    return true;
}
//        红包总额已满时，修改文案
//        todo check the nowMoney
function checkFull(who) {
    var m = document.getElementById("nowMoney");
    m.parentNode.className = "fonttwo_man";
    m.style.fontSize = "3.3em";
    if(who=="A"){
        t=document.getElementById("yy_hb_no").firstElementChild;
        if (parseInt(m.innerHTML) == 1000) {
            t.innerHTML = "您已获得满额红包";
            t.className = "fontone_man";
            return true;
        }else{
            return false;
        }
    }else{
        t=document.getElementById("open_hb").lastElementChild;
        document.getElementById("open_hb_help").style.display="none";
        document.getElementById("hb_man").style.display="block";
        if (parseInt(m.innerHTML) == 1000) {
            t.innerHTML = "已获得满额红包";
            t.className = "fontone_help_man";
            return true;
        }else{
            return false;
        }
    }
}
function checkNowMoney(i){
//    使用参数查询当前用户的总额
    return 888;
}
/////////////////////////// SHOW
function initView(){
    document.getElementById("lqhbb").parentNode.className="bd";
    var inputphone=document.getElementById("inputphone");
    inputphone.style.display="none";
    inputphone.firstElementChild.firstElementChild.style.display="none";
    document.getElementById("helplist").firstElementChild.innerHTML='已有<span id="friendsNum">1</span>位好友帮你聚财';
    var open_hb=document.getElementById("open_hb");
    open_hb.firstElementChild.className="fontone1_help";
    open_hb.lastElementChild.className="fontone_help";
    document.getElementById("money").firstElementChild.className="fonttwo";
    var hideArr = document.getElementsByName("hide");
    for(var i=0,len=hideArr.length;i<len;i++){
        hideArr[i].style.display="none";
    }
}
function showWelcome(){
    initView();
    var lqhbb=document.getElementById("lqhbb");
    lqhbb.style.display="block";
    lqhbb.parentNode.className="bd_begin";
    var inputphone=document.getElementById("inputphone");
    inputphone.style.display="block";
    inputphone.firstElementChild.firstElementChild.style.display="block";
    document.getElementById("intro").style.display="block";
    var ling=document.getElementById("btn");//error??
    ling.onclick=function(){
        if(checkPhone()){
            alertDiv(document.getElementById("alertDiv"));
//            if(shared())
            showMyShared();
        }
    };
    
}

//        监听分享给好友事件
function showMyShared(){
    initView();
    
    document.getElementById("yy_hb_no").style.display="block";
    document.getElementById("money").style.display="block";
    document.getElementById("dayTips").style.display="-webkit-box";
    document.getElementById("myButtons").style.display="-webkit-box";
    document.getElementById("helplist").style.display="block";
    
    var m=document.getElementById("nowMoney");
    m.innerHTML = checkNowMoney();
    document.getElementById("leftTime").innerHTML = checkFinished();
    document.getElementById("frindsList").style.display="block";
    
    checkFull("A");
    
    var friendsNum= document.getElementById("friendsNum");
    if(parseInt(friendsNum.innerHTML) == 0){
        document.getElementById("frindsList").style.display="none";
        document.getElementById("nohelp").style.display="block";
    }
    document.getElementById("inviteFriends").onclick=function(){
        alertDiv(document.getElementById("alertDiv"));
    }
}
document.getElementById("useNow").onclick = function () {
    alert("used");
}
function showMyFinished(){
    initView();
    document.getElementById("yy_hb_no").style.display="block";
    document.getElementById("money").style.display="block";
    document.getElementById("help_hb_stop").style.display="-webkit-box";
    document.getElementById("helplist").style.display="block";
}
//todo 优化渲染
function showAFinished(){
    initView();
    console.log("showAFinished");
    document.getElementById("open_hb").style.display="block";
    var money=document.getElementById("money");
    money.style.display="block";
    money.firstElementChild.className="fonttwo_help";
    document.getElementById("help_hb_stop").style.display="-webkit-box";
    var helplist = document.getElementById("helplist");
    helplist.style.display="block";
    helplist.firstElementChild.innerHTML='已有<span id="friendsNum">1</span>位好友帮TA聚财';
    document.getElementById("frindsList").style.display="block";
    checkFull();
    var friendsNum= document.getElementById("friendsNum");
    if(parseInt(friendsNum.innerHTML) == 0){
        document.getElementById("frindsList").style.display="none";
        document.getElementById("nohelp").style.display="block";
    }
}
function showSee(){
    initView();
    
}

function showHelped(){
    console.log("showHelped");
    initView();
    document.getElementById("open_hb").style.display="block";
    var money=document.getElementById("money");
    money.style.display="block";
    money.firstElementChild.className="fonttwo_help";
    document.getElementById("help_hb").style.display="block";
    document.getElementById("leftTime2").innerHTML=checkFinished();
    var helplist = document.getElementById("helplist");
    helplist.style.display="block";
    helplist.firstElementChild.innerHTML='已有<span id="friendsNum">1</span>位好友帮TA聚财';
    document.getElementById("frindsList").style.display="block";
    checkFull();
    var friendsNum= document.getElementById("friendsNum");
    if(parseInt(friendsNum.innerHTML) == 0){
        document.getElementById("frindsList").style.display="none";
        document.getElementById("nohelp").style.display="block";
    }
    document.getElementById("help_friend").onclick=function(){
        showWelcomeB();
    }
}
//    监听点击事件
function showHelpA(){
    initView();
    var open_hb=document.getElementById("open_hb");
    open_hb.style.display="block";
    open_hb.parentNode.className="bd_open";
    var money=document.getElementById("money");
    money.style.display="block";
    money.firstElementChild.className="fonttwo_help";
    document.getElementById("open_hb_help").style.display="block";
    var helplist = document.getElementById("helplist");
    helplist.style.display="block";
    helplist.firstElementChild.innerHTML='已有<span id="friendsNum">1</span>位好友帮TA聚财';
    document.getElementById("frindsList").style.display="block";
    checkFull("B");
    var friendsNum= document.getElementById("friendsNum");
    if(parseInt(friendsNum.innerHTML) == 0){
        document.getElementById("frindsList").style.display="none";
        document.getElementById("nohelp").style.display="block";
    }
    document.getElementById("help_friend").onclick=function(){
        showWelcomeB();
    }
}
function showWelcomeB(){
    initView();
    var open_hb=document.getElementById("open_hb");
    open_hb.style.display="block";
    open_hb.parentNode.className="bd_begin";
    open_hb.firstElementChild.className="fontone1_help_begin";
    open_hb.lastElementChild.className="fontone_help_begin";
    var money=document.getElementById("money");
    money.style.display="block";
    money.firstElementChild.className="fonttwo_help_begin";
    document.getElementById("helpFrindsTips").style.display="-webkit-box";
    document.getElementById("inputphone").style.display="block";
    document.getElementById("intro").style.display="block";
    if(!checkPhone()){
        showHelped();
    }
}

function share(obj){
    // 2.1 监听“分享给朋友”，按钮点击、自定义分享内容及分享结果接口
    //        已领红包邀请指定好友聚财
    obj.onclick = function () {
//            弹出蒙版
//            微信处理响应
        wx.onMenuShareAppMessage({
            title: '零钱包送钱啦',
            desc: '零钱包送1000元红包，戳这里帮我聚聚财，你也能领钱哈！',
            //todo create the link and the img url
            link: '',
            imgUrl: '',

            success: function (res) {
//                    关闭蒙版，此处无需跳转
                closeDiv();
                return true;
            },

            fail: function (res) {
                alert(JSON.stringify(res));
                return false;
            }
        });
    };
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
    obj.t = setInterval(function () { doMove(obj, iTarget) }, 30);
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
                obj.style.display = "none"; document.body.removeChild(document.getElementById("mybody")); //删除节点
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
    var size = { width: 0, height: 0 };
    size.width = Math.max(document.documentElement.scrollWidth, document.documentElement.clientWidth || document.body.clientWidth) + "px";
    size.height = Math.max(document.documentElement.scrollHeight, document.documentElement.clientHeight || document.body.clientHeight) + "px";
    //获取页面高度 和 宽度 最大值
    if (!_bg) return;
    _bg.style.width = size.width;
    _bg.style.height = size.height;

    with (obj.style) { //调整弹出框位置
        left = (parseInt(document.documentElement.clientWidth || document.body.clientWidth)) / 2 + (document.documentElement.scrollLeft || document.body.scrollLeft)-obj.offsetWidth / 2  + "px"; ;
        top = (parseInt(document.documentElement.clientHeight || document.body.clientHeight)) / 2 + (document.documentElement.scrollTop || document.body.scrollTop)-obj.offsetHeight / 2 + "px";
    }
}
window.onresize = function () {
    //窗口发生改变，触发onResize函数 调整弹出框
    onResize(document.getElementById("alertdiv"));
};



