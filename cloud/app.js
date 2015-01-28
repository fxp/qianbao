// 在 Cloud code 里初始化 Express 框架
var express = require('express');
var app = express();
var url = require('url')

// App 全局配置
app.set('views', 'cloud/views');   // 设置模板目录
app.set('view engine', 'ejs');    // 设置 template 引擎
app.use(express.bodyParser());    // 读取请求 body 的中间件

function getOAuthUrl(hongbaoId) {
    var authUrl = url.format({
        protocol: 'https',
        hostname: 'open.weixin.qq.com',
        pathname: '/connect/oauth2/authorize',
        query: {
            appid: 'wx85447170f9e1db12',
            redirect_uri: encodeURI('http://qianbao.avosapps.com/hongbao/' + hongbaoId),
            response_type: 'code',
            scope: 'snsapi_userinfo'
        },
        hash: 'wechat_redirect'
    })
    return authUrl
}

function getAccessToken(code) {
    var deferred = new AV.Promise()
    var accessTokenUrl = url.format({
        protocol: 'https',
        hostname: 'api.weixin.qq.com',
        pathname: '/sns/oauth2/access_token',
        query: {
            appid: 'wx85447170f9e1db12',
            secret: '3b5addd4fc9038765e00af3d3f349fe1',
            code: code,
            grant_type: 'authorization_code'
        }
    })
    AV.Cloud.httpRequest({
        url: accessTokenUrl,
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(function (httpResponse) {
        deferred.resolve(JSON.parse(httpResponse.text))
    }, function (err) {
        deferred.reject(err)
    })
    return deferred
}

function getUserInfo(accessToken, openid) {
    var deferred = new AV.Promise()
    var userInfoUrl = url.format({
        protocol: 'https',
        hostname: 'api.weixin.qq.com',
        pathname: '/sns/userinfo',
        query: {
            access_token: accessToken,
            openid: openid,
            lang: 'zh_CN'
        }
    })
    AV.Cloud.httpRequest({
        url: userInfoUrl,
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(function (httpResponse) {
        deferred.resolve(JSON.parse(httpResponse.text))
    }, function (err) {
        deferred.reject(err)
    })
    return deferred
}

function getHongbaoByOpenid(openId) {
    var query = new AV.Query(Hongbao)
    query.equalTo('openId', openId)
    return query.first()
}

var Hongbao = AV.Object.extend('Hongbao')
var Support = AV.Object.extend('Support')

app.get('/hongbao/:hongbaoId?', function (req, res) {
    var userInfo;
    var targetHongbaoId = req.params.hongbaoId;
    if (req.query.code) {
        // TODO Get pre saved userinfo for this code
        getAccessToken(req.query.code).then(function (token) {
            return getUserInfo(token.access_token, token.openid)
        }).then(function (info) {
            userInfo = info
            var query = new AV.Query(Hongbao)
            query.equalTo('openId', userInfo.userid)
            return query.first()
        }).then(function (hongbao) {
            var promises = []
            if (hongbao) {
                promises.push(AV.Promise.as(hongbao))
            } else {
                promises.push(new Hongbao({
                    openId: userInfo.openid,
                    nickname: userInfo.nickname,
                    headimgurl: userInfo.headimgurl
                }).save())
            }
            if (targetHongbaoId) {
                promises.push(new AV.Query(Hongbao).get(targetHongbaoId))
            }
            return AV.Promise.when(promises)
        }).then(function (me, target) {
            res.render('hb', {
                me: JSON.stringify(me.toJSON()),
                target: (target) ? JSON.stringify(target.toJSON()) : {}
            })
            //if (hongbao.get('phoneNo')) {
            //    res.render('hongbao_23', {
            //        hongbao: hongbao.toJSON()
            //    })
            //} else {
            //    res.render('hongbao_1', {hongbao: hongbao.toJSON()})
            //}
        }, function (err) {
            console.log(err)
            res.status(500).send("failed")
        })
    } else {
        //new AV.Query(Hongbao).get(req.params.hongbaoId)
        //    .then(function (hongbao) {
        //        //if (hongbao.get('phoneNo')) {
        //        //    res.render('hongbao_23', {
        //        //        hongbao: hongbao.toJSON()
        //        //    })
        //        //} else {
        //        //    res.render('hongbao_1', {hongbao: hongbao.toJSON()})
        //        //}
        //        res.render('hb', {
        //            me: {
        //                "phoneNo": "",
        //                "openId": "oAWh3tx8QWRqxsSi7K5Pj-79Tlw8",
        //                "nickname": "冯小平",
        //                "headimgurl": "http://wx.qlogo.cn/mmopen/zLXB5r0QMUuDzCAdic2gZCpeugbAYZN2j8icM2TibtA8oib7PoaF0cECgVGVou3xziavwS9WoWosAoGZZ3pbYghnohuTJicpap0ZmT/0",
        //                "amount": 100,
        //                "objectId": "54c7bbb3e4b0ae7e69828107",
        //                "createdAt": "2015-01-27T16:24:19.127Z",
        //                "updatedAt": "2015-01-27T17:56:05.864Z"
        //            },
        //            target: undefined
        //            //{
        //            //    "phoneNo": "",
        //            //    "openId": "oAWh3tx8QWRqxsSi7K5Pj-79Tlw8",
        //            //    "nickname": "冯小平",
        //            //    "headimgurl": "http://wx.qlogo.cn/mmopen/zLXB5r0QMUuDzCAdic2gZCpeugbAYZN2j8icM2TibtA8oib7PoaF0cECgVGVou3xziavwS9WoWosAoGZZ3pbYghnohuTJicpap0ZmT/0",
        //            //    "amount": 100,
        //            //    "objectId": "54c7bbb3e4b0ae7e69828107",
        //            //    "createdAt": "2015-01-27T16:24:19.127Z",
        //            //    "updatedAt": "2015-01-27T17:56:05.864Z"
        //            //}
        //        })
        //
        //    }, function (err) {
        //        res.status(404).send()
        //    })
        res.redirect(getOAuthUrl(targetHongbaoId))
    }
});

app.listen();