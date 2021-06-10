module.exports = {
    data: {
        put: async (req, res) => {
            console.log(req.body)
            res.err('ok')
        }
    }
}