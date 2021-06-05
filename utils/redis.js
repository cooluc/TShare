// 创建redis客户端
const redis = require('redis')
const bluebird = require("bluebird");

// Promise化Redis
bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);

const config = require('../data/config')
const redisClient = redis.createClient(config.redis)

redisClient.on("error", err => {
    console.log("Redis connection failed:" + err);
})

redisClient.on('connect', () => {
    console.log('Redis connection succeeded');
})

module.exports = {
    // 设置key
    async setKey(key, value, time = 3600) {
        return new Promise((resolve, reject) => {
            try {
                value = JSON.stringify(value)
            } catch (error) {

            }
            redisClient.set(key, value, (err, replay) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(replay);
                }
            })
            redisClient.expire(key, time);
        })
    },

    // 获取key
    async getKey(key) {
        return new Promise((resolve, reject) => {
            redisClient.get(key, (err, replay) => {
                if (err) {
                    reject(err);
                } else {
                    try {
                        replay = JSON.parse(replay)
                    } catch (error) {

                    }
                    resolve(replay);
                }
            })
        })
    },

    // 删除key
    async delKey(key) {
        return new Promise((resolve, reject) => {
            redisClient.del(key, (err, replay) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(true);
                }
            })
        })
    }
}