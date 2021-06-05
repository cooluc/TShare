const glob = require("glob")
const router = require('express').Router();

const fix = "controllers";

// 获取所有控制器文件
const path = glob.sync(fix + "/**")

// 设置路由前缀
const routingPrefix = '/api'

// 拒绝
const forbidden = (req, res) => {
    return res.sendStatus(403)
}

// 遍历控制器
path.forEach(ele => {
    if (/\.js$/.test(ele)) {
        // 获取所有控制器方法
        let e = require('../' + ele)

        // 构造请求基址
        let url = ele.replace(fix, '').replace('.js', '');

        // s为用户访问的分享直链，不走api通道
        if (url != 's') {
            url = routingPrefix + ele.replace(fix, '').replace('.js', '')
        }

        // 遍历所有方法，构造最终请求地址
        for (let key in e) {
            let urlPath = url + '/' + key
            if (typeof e[key] == 'object') {
                if (key == 'data') {
                    router.route(url)
                        .post(e[key].post || forbidden)
                        .get(e[key].get || forbidden)
                        .put(e[key].put || forbidden)
                        .delete(e[key].delete || forbidden)
                } else {
                    router.route(urlPath)
                        .post(e[key].post || forbidden)
                        .get(e[key].get || forbidden)
                        .put(e[key].put || forbidden)
                        .delete(e[key].delete || forbidden)
                }

            } else {
                router.use(url, e[key])
            }

        }
    }
})

router.use('*', forbidden)
console.log('Route successfully mounted')
module.exports = router