class LoadBalancer {
    constructor(index) {
        this.endpoints = [
            'https://rocknrolla.treblle.com',
            'https://punisher.treblle.com',
            'https://sicario.treblle.com',
        ]
        return this.endpoints[index]
    }

    balanced() {
        const indexer = Math.floor(Math.random() * endpoints.length)
        return this.endpoints[indexer]
    }
}

module.exports = LoadBalancer;