const axios = require('axios')
const LoadBalancer = require('./LoadBalancer')

class Sender {
    constructor(apiKey) {
        this.apiKey = apiKey
        this.LoadBalancer = new LoadBalancer()
        this.debugURL = "https://debug.treblle.com/"
    }

    serializer(
        projectDetail,
        { server, request, response },
        errors = []
    ) {
        this.payload = {
            ...projectDetail,
            data: {
              server: Object.assign(
                {
                  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                  os: {
                    name: os.platform(),
                    release: os.release(),
                    architecture: os.arch(),
                  },
                  software: null,
                  signature: null,
                },
                server
              ),
              language: {
                  name: 'node',
                  version: process.version,
              },
              request,
              response,
              errors,
            },
        }

        return this.payload
    }
    send(payload) {
        axios.default.post(
            this.LoadBalancer.balanced(),
            payload,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': this.apiKey
                }
            }
        ).then(() => console.log("request successful"))
        .catch((err) => console.log(err, "sdk could not send the request"))
    }

    sendDebug(payload) {
        axios.default.post(
            this.debugURL,
            payload,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': this.apiKey
                }
            }
        ).then((response) => console.log(response, "request successful"))
        .catch((err) => console.log(err, "sdk could not send the request"))
    }
}


module.exports = Sender