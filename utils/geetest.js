"use strict";
var crypto = require('crypto'),
    request = require('request'),
    config = require('../data/config'),
    pkg = require("../package.json");

var md5 = function (str) {
    return crypto.createHash('md5').update(String(str)).digest('hex');
};
var randint = function (from, to) {
    // range: from ~ to
    return Math.floor(Math.random() * (to - from + 1) + from);
};
function Geetest(config) {
    if (typeof config.geetest_id !== 'string') {
        throw new Error('Geetest ID Required');
    }
    if (typeof config.geetest_key !== 'string') {
        throw new Error("Geetest KEY Required");
    }
    if (typeof config.protocol === 'string') {
        this.PROTOCOL = config.protocol;
    }
    if (typeof config.api_server === 'string') {
        this.API_SERVER = config.api_server;
    }
    if (typeof config.timeout === 'number') {
        this.TIMEOUT = config.timeout;
    }

    this.geetest_id = config.geetest_id;
    this.geetest_key = config.geetest_key;
}
Geetest.prototype = {
    PROTOCOL: 'http://',
    API_SERVER: 'api.geetest.com',
    VALIDATE_PATH: '/validate.php',
    REGISTER_PATH: '/register.php',
    TIMEOUT: 2000,
    NEW_CAPTCHA: true,
    JSON_FORMAT: 1,
    register: function (data, callback) {
        var that = this;
        return new Promise(function (resolve, reject) {
            that._register(data, function (err, data) {
                if (typeof callback === 'function') {
                    callback(err, data);
                }
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            });
        });
    },
    _register: function (data, callback) {
        data = data || {};
        var that = this;
        request({
            url: this.PROTOCOL + this.API_SERVER + this.REGISTER_PATH,
            method: 'GET',
            timeout: this.TIMEOUT,
            json: true,
            qs: {
                gt: this.geetest_id,
                json_format: this.JSON_FORMAT,
                sdk: 'Node_' + pkg.version,
                client_type: data.client_type || 'unknown',
                ip_address: data.ip_address || 'unknown'
            }
        }, function (err, res, data) {
            var challenge;
            if (err || !data || !data.challenge) {
                // fallback
                challenge = that._make_challenge();
                callback(null, {
                    success: 0,
                    challenge: challenge,
                    gt: that.geetest_id,
                    new_captcha: that.NEW_CAPTCHA
                });
            } else {
                challenge = md5(data.challenge + that.geetest_key);
                callback(null, {
                    success: 1,
                    challenge: challenge,
                    gt: that.geetest_id,
                    new_captcha: that.NEW_CAPTCHA
                });
            }
        });
    },
    validate: function (fallback, result, callback) {
        var that = this;
        return new Promise(function (resolve, reject) {
            that._validate(fallback, result, function (err, data) {
                if (typeof callback === 'function') {
                    callback(err, data);
                }
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            });
        })
    },
    _validate: function (fallback, result, callback) {
        var challenge = result.challenge || result.geetest_challenge;
        var validate = result.validate || result.geetest_validate;
        var seccode = result.seccode || result.geetest_seccode;
        if (fallback) {
            if (md5(challenge) === validate) {
                callback(null, true);
            } else {
                callback(null, false);
            }
        } else {
            var hash = this.geetest_key + 'geetest' + challenge;
            if (validate === md5(hash)) {
                request({
                    url: this.PROTOCOL + this.API_SERVER + this.VALIDATE_PATH,
                    method: 'POST',
                    timeout: this.TIMEOUT,
                    json: true,
                    form: {
                        gt: this.geetest_id,
                        seccode: seccode,
                        json_format: this.JSON_FORMAT
                    }
                }, function (err, res, data) {
                    if (err || !data || !data.seccode) {
                        callback(err);
                    } else {
                        callback(null, data.seccode === md5(seccode));
                    }
                });
            } else {
                callback(null, false);
            }
        }
    },
    _make_challenge: function () {
        var rnd1 = randint(0, 90);
        var rnd2 = randint(0, 90);
        var md5_str1 = md5(rnd1);
        var md5_str2 = md5(rnd2);
        return md5_str1 + md5_str2.slice(0, 2);
    }
};

const captcha = new Geetest(config.geetest);


const registerClick = (req, res) => {
    return new Promise((resolve, reject) => {
        // 向极验申请每次验证所需的challenge
        captcha.register(null, (err, data) => {
            if (err) {
                reject({ success: false, data: err })
                return
            }

            if (!data.success) {
                // 进入 failback，如果一直进入此模式，检查服务器到极验服务器是否可访问
                // 可以通过修改 hosts 把极验服务器 api.geetest.com 指到不可访问的地址

                // 为以防万一，可以选择以下两种方式之一：

                // 1. 继续使用极验提供的failback备用方案
                req.session.fallback = true;
                resolve({ success: true, data: data })

                // 2. 使用自己提供的备用方案
                // todo

            } else {
                // 正常模式
                req.session.fallback = false;
                resolve({ success: true, data: data })
            }
        });
    })
}

const validateClick = (req, res) => {
    return new Promise((resolve, reject) => {
        captcha.validate(req.session.fallback, {
            geetest_challenge: req.body.geetest_challenge,
            geetest_validate: req.body.geetest_validate,
            geetest_seccode: req.body.geetest_seccode
        }, (err, success) => {

            if (err) {
                // 网络错误
                reject({ success: false, data: err })
            } else if (!success) {
                reject({ success: false, data: '图形验证码校验失败' })
            } else {
                resolve({ success: true, data: '图形验证码校验成功' })
            }
        });
    })
}

module.exports = {
    registerClick: registerClick,
    validateClick: validateClick
}





