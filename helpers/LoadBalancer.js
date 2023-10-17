class LoadBalancer {
    constructor() {
        this.endpoints = [
            'https://rocknrolla.treblle.com',
            'https://punisher.treblle.com',
            'https://sicario.treblle.com',
        ]
    }

    defined(index) {
        return this.endpoints[index]
    }

    balanced() {
        const indexer = Math.floor(Math.random() * this.endpoints.length)
        return this.endpoints[indexer]
    }

    getDurationInMilliseconds (start) {
        const NS_PER_SEC = 1e9
        const NS_TO_MS = 1e6
        const diff = process.hrtime(start)
    
        return (diff[0] * NS_PER_SEC + diff[1]) / NS_TO_MS
    }
}

module.exports = LoadBalancer;