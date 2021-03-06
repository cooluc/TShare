const { getKey } = require('../utils/redis');
const { whiteUrl } = require('../data/config');
const requestIp = require('request-ip');

console.log('Interceptor successfully mounted')
module.exports = async (req, res, next) => {

    // 获取ip
    req.ip = requestIp.getClientIp(req).replace('::ffff:', '')
    req.time = new Date()
    req.fixUrl = req.originalUrl.split('?')[0]
    res.back = (result) => {
        res.json({
            status: 20000,
            result: result,
            errMsg: null
        })
    }
    res.err = (err, errCode = 20200) => {
        res.json({
            status: errCode,
            result: null,
            errMsg: err
        })
    }
    // 路由白名单
    let type = false
    for (let index in whiteUrl) {
        let ele = whiteUrl[index]
        const reg = new RegExp(ele.reg)
        if (reg.test(req.fixUrl) && req.method.toUpperCase() == ele.method) {
            type = true
        }
    }

    // 静态文件
    if (req.fixUrl.indexOf('/api') != 0) {
        return next()
    }

    if (type) {

        // 白名单直接过
        return next()
    } else {

        // 非白名单，检测授权凭证
        let authorization = req.headers['authorization']
        if (!authorization) {
            return res.sendStatus(403)
        } else {

            // 判断授权凭证是否有效
            if (await getKey(authorization)) {
                return next()
            } else {
                return res.sendStatus(403)
            }
        }
    }
}
