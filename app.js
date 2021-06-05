const express = require('express');
const bodyParser = require('body-parser');
const { port } = require('./data/config');
const app = express();

// 解析json
app.use(bodyParser.json({ limit: '50mb' }));

// 设置静态文件
app.use(express.static('./public'));

// 挂载数据库
app.use(require('./utils/db'));

// 挂载拦截器
app.use(require('./routers/inject'));

// 挂载路由
app.use(require('./routers/index'));

app.listen(port, () => {
    console.log('server start in http://127.0.0.1:' + port)
})