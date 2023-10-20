const Masker = require('./helpers/Masker');
const os = require('os')
const { version } = require('./package.json');
const Sender = require('./helpers/Sender');
const LoadBalancer = require('./helpers/LoadBalancer');



/**
 * 
 * @param {string} apiKey 
 * @param {string} projectId 
 * @param {array<string>} customMaskFields 
 * @param {boolean} debug 
 * @returns 
 */

function trebbler(apiKey, projectId, customMaskFields, debug = false) {
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
            const sender = new Sender(apiKey)
            const resSize = res.get('content-length');
            // const processedHeaderArr = (req.headers.accept)//.split("',") || []
            // let reqHeaders = {}
            // // processedHeaderArr.reduce(function(obj, key) {
            // //     // 
            // //     let data = key.split(": ")
            // //     obj[data[0]] = obj[data[1]]
            // //     return obj
            // // }, {})
            const processedHeaders = {
                "content-type": req.headers["content-type"],
                "content-length": req.headers["content-length"],
                "user-agent": req.headers["user-agent"],
                "host": req.headers.host,
            }
            
            let maskedRequestData
            if(Object.keys(body).length > 0) { maskedRequestData = new Masker(requestPayload, customMaskFields).objectMaskers()}
            if(Object.keys(body).length == 0) { maskedRequestData = {}}
            
            
            const [maskedResponseData, error] = new Masker("", customMaskFields).maskedResponse(res.__response)
        
            if (error) {
                errors.push(error)
            }
        
            let request = {
                timestamp: new Date().toISOString().replace('T', ' ').substr(0, 19),
                ip: req.ip,
                url: `${req.protocol}://${req.headers['host']}${req.originalUrl}`,
                user_agent: req.headers['user-agent'],
                method: req.method,
                headers: new Masker(processedHeaders, customMaskFields).objectMaskers(),
                body: maskedRequestData,
            }
        
            let response = {
                headers: new Masker(res.getHeaders(), customMaskFields).objectMaskers(),
                code: res.statusCode,
                size: resSize,
                load_time: new LoadBalancer().getDurationInMilliseconds(start),
                body: maskedResponseData,
            }
            // console.log(maskedResponseData, "masked response body")
        
            let server = {
                ip: req.connection.remoteAddress,
                protocol : `${req.protocol}/${req.httpVersion}`,
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                os: {
                name: os.platform(),
                release: os.release(),
                architecture: os.arch(),
                },
                software: null,
                signature: null,
                encoding: req.headers['accept-encoding'],
            }
        
            let language = {
                name: 'node',
                version: process.version,
            }
        
            const payload = {
                api_key: apiKey,
                project_id: projectId,
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

            let debugPayload = new Masker().debugParser(payload)
            debugPayload.data.response.size = 'number'
            // let newdebugd = {
            //     ...debugPayload
            // }
            // newdebugd.data = debugPayload.data || {}
            // newdebugd.data.response = debugPayload.data.response || {}
            // newdebugd.data.response.size = 4
            // console.log(payload, "wahalurd")
            // console.log(payload.data.server.os, "operating system")
            // console.log(payload.data.request.headers, "Request headers")
            // console.log(payload.data.response.headers, "response headers")
            // console.log(processedHeaderArr, "lets see")
            // console.log(reqHeaders, "lets see")
        
            try {
                if(debug) {
                    sender.sendDebug(payload)
                    // new Sender("").sendDebug(debugPayload)
                } else {
                    sender.send(payload)
                }
                // console.log(debugPayload, "payload to be sent")
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
        // console.log(payload, "payload to be sent")
        new Sender("").send(payload)
    } catch (e) {
        console.log(e, "sdk caught error")
    }

}

module.exports = trebbler;