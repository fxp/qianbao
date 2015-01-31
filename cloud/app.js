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

//getAccessToken('00160807e0a6b6e97e84d4b9a5da5a47')

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
    console.log('start get access token,%s', JSON.stringify(accessTokenUrl))
    AV.Cloud.httpRequest({
        url: accessTokenUrl,
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(function (httpResponse) {
        console.log('success get access token,%s', httpResponse.text)
        deferred.resolve(JSON.parse(httpResponse.text))
    }, function (err) {
        console.log('weixin failed,%s', JSON.stringify(err))
        deferred.reject(err)
    })
    return deferred
}

//getUserInfo('OezXcEiiBSKSxW0eoylIeG0ON5E3jo_9PTmRmY1N1sbwX0EqNj8YJe1JyeAPMXyTqFRodeY6H32KwyLDO2k3oqaH4cH0EZgozj4QuJ4wV6VFS5xVU3FAeGsrHZ1D6Jpsrk6irEuWtt9MP1YG9Qo4IQ','oAWh3tx8QWRqxsSi7K5Pj')

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
    console.log('get userinfo,%s', JSON.stringify(userInfoUrl))
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

    console.log('hongbao request,%s,%s,%s', targetHongbaoId, JSON.stringify(req.params), JSON.stringify(req.query))

    if (req.query.code) {
        //console.log('code:%s', req.query.code)
        //res.send(req.query.code)
        //return;
        // TODO Get pre saved userinfo for this code
        getAccessToken(req.query.code).then(function (token) {
            //res.send(token);
            //return;

            console.log('got token,%s', JSON.stringify(token));
            if (token.errcode) {
                return AV.Promise.error('fetch access token failed,' + JSON.stringify(token))
            } else {
                return getUserInfo(token.access_token, token.openid)
            }
        }).then(function (info) {
            userInfo = info;
            console.log('userinfo,%s', userInfo.openid);
            var query = new AV.Query(Hongbao)
            query.equalTo('openId', userInfo.openid)
            return query.first()
        }).then(function (hongbao) {
            var promises = []
            if (hongbao) {
                console.log('exists hongbao,%s', JSON.stringify(hongbao));
                promises.push(AV.Promise.as(hongbao))
            } else {
                console.log('not exists hongbao');
                promises.push(new Hongbao({
                    openId: userInfo.openid,
                    nickname: userInfo.nickname,
                    headimgurl: userInfo.headimgurl,
                    profile: userInfo,
                    supports: generateSupportSequence()
                }).save())
            }
            if (targetHongbaoId) {
                console.log('1');
                promises.push(new AV.Query(Hongbao).get(targetHongbaoId))
            } else {
                console.log('2');
                promises.push(AV.Promise.as(hongbao))
            }
            return AV.Promise.when(promises)
        }).then(function (me, target) {
            console.log('me:%s', JSON.stringify(me))
            console.log('target:%s', JSON.stringify(target))
            res.render('hongbao', {
                me: me,
                target: target
            })
        }, function (err) {
            console.log(err)
            res.status(500).send("failed," + JSON.stringify(err))
        })
    } else {
        if (__local) {
            new AV.Query(Hongbao).get(targetHongbaoId)
                .then(function (hongbao) {
                    return AV.Promise.when([
                        new AV.Query(Hongbao).get('54cd1569e4b0294adb89da4a'),
                        new AV.Query(Hongbao).get('54cd17e8e4b00472cd840cee')
                    ])
                }).then(function (me, target) {
                    res.render('hongbao', {
                        me: me,
                        //target: undefined
                        target: target
                    })
                }, function (err) {
                    res.status(404).send('hongbao not exists,%s', targetHongbaoId)
                })
        } else {
            console.log('start weixin auth')
            res.redirect(getOAuthUrl(targetHongbaoId))
        }

    }
});

app.listen();