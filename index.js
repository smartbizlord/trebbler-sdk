function trebbler(req, res, next) {
    // 
    const mumu  = "dddd"
    // next(mumu)
    return function(req, res, next) {
        // 
        next()
    }
}

module.exports = trebbler;