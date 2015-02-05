require("cloud/app.js");

var Hongbao = AV.Object.extend('Hongbao')
var Support = AV.Object.extend('Support')

var CONVERT_TABLE = [
    [10, 20, 30],
    [40, 50, 60],
    [70, 80, 90],
    [80, 100, 100]
]
var GOAL_AMOUNT = 900;
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
        if (total >= GOAL_AMOUNT) {
            supportSequence.push(newAmount - (total - GOAL_AMOUNT));
            break;
        }
        supportSequence.push(newAmount);
    }
    return supportSequence;
}

AV.Cloud.define("setFetched", function (request, response) {
    var hongbaoId = request.params.hongbaoId;
    new AV.Query(Hongbao)
        .get(hongbaoId)
        .then(function (hongbao) {
            hongbao.set('isFetched', true)
            return hongbao.save()
        }).then(function (hongbao) {
            response.success(hongbao)
        }, function () {
            response.error('no such hongbao')
        })
})

AV.Cloud.define("createHongbao", function (request, response) {
    // Check if phone exists
    var openId = request.params.openId;
    if (!openId) {
        response.error('invalid params,' + openId);
        return;
    }

    var query = new AV.Query(Hongbao);
    query.equalTo('openId', openId);
    query.first().then(function (hongbao) {
        return (hongbao) ?
            AV.Promise.as(hongbao) :
            new Hongbao({
                //phoneNo: phoneNo,
                openId: openId,
                supports: generateSupportSequence()
            }).save();
    }).then(function (hongbao) {
        response.success(hongbao);
    }, function (err) {
        response.error(err);
    })
});

AV.Cloud.define("updatePhoneNo", function (request, response) {
    var phoneNo = request.params.phoneNo,
        hongbaoId = request.params.hongbaoId;

    var phoneNoQuery = new AV.Query(Hongbao);
    phoneNoQuery.equalTo('phoneNo', phoneNo);

    AV.Promise.when([
        phoneNoQuery.first(),
        new AV.Query(Hongbao).get(hongbaoId)
    ]).then(function (existsHongbao, hongbao) {
        if (existsHongbao) {
            return AV.Promise.error('phone number already exists')
        } else {
            hongbao.set('phoneNo', phoneNo)
            return hongbao.save()
        }
    }).then(function (hongbao) {
        response.success(hongbao)
    }, function (err) {
        response.error(err)
    })

})

AV.Cloud.define("supportHongbao", function (request, response) {
    var supporterId = request.params.supporterId,
        targetId = request.params.targetId,
        alreadySupported = false;

    // get all supports of this Hongbao
    var query = new AV.Query(Support)
    query.equalTo('target', new Hongbao({id: targetId}))
    AV.Promise.when([
        new AV.Query(Hongbao).get(targetId), query.find()
    ]).then(function (target, supports) {
        if (supports) {
            supports.forEach(function (support) {
                if (support.get('supporter').id == supporterId) {
                    alreadySupported = true
                }
            })
            if (alreadySupported) {
                response.error('already supported')
            } else {
                new Support({
                    target: new Hongbao({id: targetId}),
                    supporter: new Hongbao({id: supporterId}),
                    amount: target.get('supports')[supports.length]
                }).save().then(function (support) {
                        response.success(support)
                    }, function (err) {
                        response.error(err)
                    })
            }
        } else {
            new Support({
                target: new Hongbao({id: targetId}),
                supporter: new Hongbao({id: supporterId}),
                amount: target.get('supports')[supports.length]
            }).save().then(function (support) {
                    response.success(support)
                }, function (err) {
                    response.error(err)
                })
        }
    })
})