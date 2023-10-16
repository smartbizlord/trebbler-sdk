function trebbler(req, res, next) {
    // 
    const mumu  = "dddd"
    // next(mumu)
    return function(req, res, next) {
        // 
        let oldSend = res.send;

        res.send = function(data) {
            this.__response = data
            // console.log(data) // do something with the data
            // res.send = oldSend // set function back to avoid the 'double-send'
            // return res.send(data) // just call as normal with data
            oldSend.call(this, data)
        }
        res.on('finish', function() {
            console.log(res.__response)
        })
        next()
    }
}

module.exports = trebbler;