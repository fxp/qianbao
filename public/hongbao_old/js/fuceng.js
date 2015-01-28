// JavaScript Document
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
        document.getElementById("btn").onclick = function () { //显示弹出框
            alertDiv(document.getElementById("alertdiv"));
        }
        document.getElementById("close").onclick = function () {
            closeDiv();
        }
        function closeDiv() { //关闭弹出框
            startMove(document.getElementById("alertdiv"), 0);
        }