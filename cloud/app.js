// 在 Cloud code 里初始化 Express 框架
var express = require('express');
var app = express();
var url = require('url')

// App 全局配置
app.set('views', 'cloud/views');   // 设置模板目录
app.set('view engine', 'ejs');    // 设置 template 引擎
app.use(express.bodyParser());    // 读取请求 body 的中间件

function getOAuthUrl(hongbaoId) {
    var redirectUrl = 'http://qianbao.avosapps.com/hongbao/' + ((hongbaoId) ? hongbaoId : '')
    var authUrl = url.format({
        protocol: 'https',
        hostname: 'open.weixin.qq.com',
        pathname: '/connect/oauth2/authorize',
        query: {
            appid: 'wx85447170f9e1db12',
            redirect_uri: encodeURI(redirectUrl),
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
        console.log('weixin failed,%s', JSON.stringify(err))
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


var CONVERT_TABLE = [
    [10, 20, 30],
    [40, 50, 60],
    [70, 80, 90],
    [80, 100, 100]
]
var GOAL_AMOUNT = 1000;
var MAX_SUPPORT_COUNT = 25;
var SPECIAL_SUPPORT_AMOUNT = 100;
function generateSupportSequence() {
    var supportSequence = [];
    var firstBlood = Math.floor(Math.random() * 3);
    var total = 0;

    for (var i = 0; i < MAX_SUPPORT_COUNT; i++) {
        var newAmount = -1;
        if (i === firstBlood) {
            newAmount = SPECIAL_SUPPORT_AMOUNT;
        } else {
            var convertLevel = i % 4;
            convertLevel = (convertLevel >= 2) ? (convertLevel - 2) : (convertLevel + 2)
            newAmount = CONVERT_TABLE[convertLevel][Math.floor(Math.random() * 3)]
            if (i < 3 && (newAmount === 100)) {
                newAmount -= 10;
            }
        }
        total += newAmount
        if (total >= 1000) {
            supportSequence.push(newAmount - (total - GOAL_AMOUNT));
            break;
        }
        supportSequence.push(newAmount);
    }
    return supportSequence;
}


var Hongbao = AV.Object.extend('Hongbao')
var Support = AV.Object.extend('Support')

app.get('/hongbao/:hongbaoId?', function (req, res) {
    var userInfo;
    var targetHongbaoId = req.params.hongbaoId;

    if (req.query.code) {
        console.log('code:%s', req.query.code)
        // TODO Get pre saved userinfo for this code
        getAccessToken(req.query.code).then(function (token) {
            if (token.errcode) {
                return AV.Promise.error('fetch access token failed')
            } else {
                return getUserInfo(token.access_token, token.openid)
            }
        }).then(function (info) {
            console.log('userinfo,%s', JSON.stringify(info))
            userInfo = info
            var query = new AV.Query(Hongbao)
            query.equalTo('openId', userInfo.openid)
            return query.first()
        }).then(function (hongbao) {
            var promises = []
            if (hongbao) {
                promises.push(AV.Promise.as(hongbao))
            } else {
                promises.push(new Hongbao({
                    openId: userInfo.openid,
                    nickname: userInfo.nickname,
                    headimgurl: userInfo.headimgurl,
                    profile: userInfo,
                    supports: generateSupportSequence()
                }).save())
            }
            if (targetHongbaoId) {
                promises.push(new AV.Query(Hongbao).get(targetHongbaoId))
            }
            //if (targetHongbaoId) {
            //console.log('hoho,%s,%s,%s',
            //    (targetHongbaoId),
            //    JSON.stringify(req.params),
            //    (typeof targetHongbaoId == 'undefined'))
            //console.log('targetHongbaoId,' + targetHongbaoId)
            //}
            return AV.Promise.when(promises)
        }).then(function (me, target) {
            console.log('me:%s', JSON.stringify(me))
            console.log('target:%s', JSON.stringify(target))
            res.render('hongbao', {
                me: me,
                target: target
                //me: JSON.stringify(me.toJSON()),
                //target: JSON.stringify(target.toJSON())
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
            res.status(500).send("failed," + JSON.stringify(err))
        })
    } else {
        if (__local) {
            new AV.Query(Hongbao).get(targetHongbaoId)
                .then(function (hongbao) {
                    console.log('test data')
                    var me = {
                            "headimgurl": "",
                            "nickname": "这家伙",
                            "openId": "oAWh3t_Y023E4iWtc_lHxvOA6tNA",
                            "profile": {
                                "sex": 0,
                                "nickname": "这家伙",
                                "city": "",
                                "headimgurl": "",
                                "openid": "oAWh3t_Y023E4iWtc_lHxvOA6tNA",
                                "language": "zh_CN",
                                "province": "",
                                "country": "",
                                "privilege": []
                            },
                            "id": "54c9d7a1e4b0c6c6afb793e2",
                            "phoneNo": "13488892615",
                            "createdAt": "2015-01-29T04:17:50.211Z",
                            "updatedAt": "2015-01-29T04:17:50.211Z"
                        },
                        target = {
                            "phoneNo": "13488892615",
                            "headimgurl": "http://wx.qlogo.cn/mmopen/zLXB5r0QMUuDzCAdic2gZCpeugbAYZN2j8icM2TibtA8oib7PoaF0cECgVGVou3xziavwS9WoWosAoGZZ3pbYghnohuTJicpap0ZmT/0",
                            "nickname": "冯小平",
                            "openId": "oAWh3tx8QWRqxsSi7K5Pj-79Tlw8",
                            "profile": {
                                "sex": 1,
                                "nickname": "冯小平",
                                "city": "海淀",
                                "headimgurl": "http://wx.qlogo.cn/mmopen/zLXB5r0QMUuDzCAdic2gZCpeugbAYZN2j8icM2TibtA8oib7PoaF0cECgVGVou3xziavwS9WoWosAoGZZ3pbYghnohuTJicpap0ZmT/0",
                                "openid": "oAWh3tx8QWRqxsSi7K5Pj-79Tlw8",
                                "language": "en",
                                "province": "北京",
                                "country": "中国",
                                "privilege": []
                            },
                            "id": "54c9d7a1e4b0c6c6afb793e2",
                            "createdAt": "2015-01-29T04:00:13.829Z",
                            "updatedAt": "2015-01-29T04:00:21.249Z"
                        };
                    me.id = (me.objectId) ? me.objectId : me.id;
                    target.id = (target.objectId) ? target.objectId : target.id;
                    res.render('hongbao', {
                        me: me,
                        //target: undefined
                        target: target
                    })
                }, function (err) {
                    res.status(404).send('hongbao not exists,%s', targetHongbaoId)
                })
        } else {
            res.redirect(getOAuthUrl(targetHongbaoId))
        }

    }
});

app.listen();