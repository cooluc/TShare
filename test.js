const superagent = require('superagent');


(async () => {
    let s = await superagent.get('https://account.teambition.com/login/password');
    let cookie = s.header['set-cookie']
    let config = JSON.parse(s.text.split('\n')[12])

    try {
        s = await superagent.post('https://account.teambition.com/api/login/phone')
            .set({
                'Referer': 'https://account.teambition.com/login/password',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36',
                'origin': 'https://account.teambition.com',
                cookie,
            })
            .send({
                "phone": '1567772124',
                "password": 'maomao99LING.',
                "token": config.TOKEN,
                "client_id": config.CLIENT_ID,
                "response_type": "session",
            })

        console.log(s.body)
    } catch (error) {
        console.log(error.response.body)
    }
})()