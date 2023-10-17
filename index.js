const Masker = require('./helpers/Masker');
const os = require('os')
const { version } = require('./package.json');
const Sender = require('./helpers/Sender');
const LoadBalancer = require('./helpers/LoadBalancer');





function trebbler(something, other, customMaskFields) {
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
        res.on('finish', function finishListener() {
            const start = process.hrtime()
            let errors = []
            const body = req.body || {}
            const query = req.query || {}
            const requestPayload = { ...body, ...query }
            
            const maskedRequestData = new Masker(requestPayload, customMaskFields).objectMaskers()
            
            const [maskedResponseData, error] = new Masker("", customMaskFields).maskedResponse(res.__response)
        
            if (error) {
                errors.push(error)
            }
        
            let request = {
                ip: req.ip,
                url: `${req.protocol}://${req.headers['host']}${req.originalUrl}`,
                user_agent: req.headers['user-agent'],
                method: req.method,
                headers: new Masker(req.headers, customMaskFields).objectMaskers(),
                body: maskedRequestData,
            }
        
            let response = {
                headers: new Masker(res.getHeaders(), customMaskFields).objectMaskers(),
                code: res.statusCode,
                size: res.get('content-length'),
                load_time: new LoadBalancer().getDurationInMilliseconds(start),
                body: maskedResponseData,
            }
        
            let server = {
                protocol : `${req.protocol}/${req.httpVersion}`,
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                os: {
                name: os.platform(),
                release: os.release(),
                architecture: os.arch(),
                },
                software: null,
                signature: null,
            }
        
            let language = {
                name: 'node',
                version: process.version,
            }
        
            const payload = {
                api_key: "",
                project_id: "",
                sdk: "express",
                version,
                data: {
                    server,
                    language,
                    request,
                    response,
                    errors
                }
            }
        
            try {
                console.log(payload, "payload to be sent")
                new Sender("").send(payload)
            } catch (e) {
                console.log(e, "sdk caught error")
            }
        
        })
        next()
    }
}

function finishListener(req, res) {
    let errors = []
    const body = req.body || {}
    const query = req.query || {}
    const requestPayload = { ...body, ...query }
    
    const maskedRequestData = new Masker(requestPayload, customMaskFields).objectMaskers()
    
    const [maskedResponseData, error] = new Masker(null, customMaskFields).maskedResponse(res.__response)

    if (error) {
        errors.push(error)
    }

    let request = {
        ip: req.ip,
        url: `${req.protocol}://${req.headers['host']}${req.originalUrl}`,
        user_agent: req.headers['user-agent'],
        method: req.method,
        headers: new Masker(req.headers, customMaskFields).objectMaskers(),
        body: maskedRequestData,
    }

    let response = {
        headers: new Masker(res.getHeaders(), customMaskFields).objectMaskers(),
        code: res.statusCode,
        size: res.get('content-length'),
        load_time: 23,
        body: maskedResponseData,
    }

    let server = {
        protocol : `${req.protocol}/${req.httpVersion}`,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        os: {
        name: os.platform(),
        release: os.release(),
        architecture: os.arch(),
        },
        software: null,
        signature: null,
    }

    let language = {
        name: 'node',
        version: process.version,
    }

    const payload = {
        api_key: "",
        project_id: "",
        sdk: "express",
        version,
        data: {
            server,
            language,
            request,
            response,
            errors
        }
    }

    try {
        console.log(payload, "payload to be sent")
        // new Sender("").send(payload)
    } catch (e) {
        console.log(e, "sdk caught error")
    }

}

module.exports = trebbler;