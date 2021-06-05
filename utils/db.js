const mongoose = require('mongoose');
const glob = require("glob");
const config = require('../data/config');

// 创建mongodb客户端 
mongoose.connect(config.mongo, {
    useNewUrlParser: true, useUnifiedTopology: true
}).then(() => console.log('Database connection successful'))
    .catch((error) => console.log('Database connection failed:' + error))

// 获取所有数据库模型文件
const fix = "modules"
const path = glob.sync(fix + "/**.js")

// 遍历数据库模型文件
path.forEach((ele, i) => {
    // 构造模型名称
    let name = ele.replace(fix + '/', '').replace('.js', '').toLowerCase();
    let modeName = name.replace(name[0], name[0].toUpperCase());
    modeName += "Mode"
    const schema = require('../' + ele)
    const mode = mongoose.Schema(schema)
    global[modeName] = mongoose.model(name, mode)
})

console.log('Database model successfully mounted')
module.exports = (req, res, next) => {
    next()
}