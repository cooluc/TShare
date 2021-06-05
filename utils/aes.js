const crypto = require('crypto');
module.exports = class {
    constructor(key, iv) {
        this.AES_conf = {
            key: key, //密钥
            iv: iv //偏移向量
        }
    }

    /**
     * AES加密的配置 
     * 1.密钥 
     * 2.偏移向量 
     * 3.算法模式CBC 
     * 4.补全值
     */
    encryption(data) {
        const key = this.AES_conf.key;
        const iv = this.AES_conf.iv;

        let cipherChunks = [];
        let cipher = crypto.createCipheriv('aes-128-cbc', key, iv);
        cipherChunks.push(cipher.update(data, 'utf8', 'hex'));
        cipherChunks.push(cipher.final('hex'));
        return cipherChunks.join('');
    }

    /**
     * 解密
     * return utf8
     */
    decryption(data) {
        const key = this.AES_conf.key;
        const iv = this.AES_conf.iv;

        let cipherChunks = [];
        let decipher = crypto.createDecipheriv('aes-128-cbc', key, iv);
        cipherChunks.push(decipher.update(data, 'hex', 'utf8'));
        cipherChunks.push(decipher.final('utf8'));
        return cipherChunks.join('');
    }
}
