module.exports = {
    //服务启动端口 
    port: 5000,

    // mongo配置
    mongo: 'mongodb://127.0.0.1/teambition',

    // redis配置
    redis: {
        host: '127.0.0.1',
        port: 6379,
        db: 2,
        no_ready_check: true
    },

    // 默认管理员账户密码
    defaultAdmin: {
        username: 'admin',
        password: 'admin888'
    },

    // 极验验证码key
    geetest: {
        geetest_id: '9f92596d4327f7c4ebddff0facd10d52',
        geetest_key: '8b45045553e8ecdea78ed499dc552203'
    },

    // 访客白名单url
    whiteUrl: [
        {
            name: '用户登录获取挑战参数',
            method: 'GET',
            reg: '/^api\/login$/'
        },
        {
            name: '用户登录提交登录参数',
            method: 'PUT',
            reg: '/^api\/login$/'
        }
    ]
}