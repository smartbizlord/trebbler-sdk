class Masker {
    constructor(data, customFields = [], ) {
        const defaultMaskFields = [
            'password',
            'pwd',
            'secret',
            'password_confirmation',
            'passwordConfirmation',
            'cc',
            'card_number',
            'cardNumber',
            'ccv',
            'ssn',
            'credit_score',
            'creditScore',
            'api_key'
        ]
        this.maskFields = [...defaultMaskFields, ...customFields]
        this.targetObj = {
            ...data,
        }
    }

    masker(value, objKey) {
        if(value.length < 1) return
        if (['authorization'].includes(objKey.toLowerCase()) && value.match(/^(bearer|basic)/i)) {
          const [tokenType, token] = value.split(' ')
          const maskedAuthToken = '*'.repeat(token.length)
          const newValue = `${tokenType} ${maskedAuthToken}`
          return newValue
        }
        return '*'.repeat(value.length)
    }
    
    
    objectMaskers(data = this.targetObj) {
        console.log(data, "make we see")
        if(data == null || data == undefined) return null
        if(typeof data !== 'object') return data
        if(Object.keys(data).length == 0) return null
    
        const targetObj = {
            ...data,
        }
        this.targetObj = targetObj
        const maskedFields = this.maskFields
        const maskedObj = Object.keys(targetObj).reduce(function (obj, key) {
            if(typeof targetObj[key] == 'string') {
                if(maskedFields.includes(key)) {
                    obj[key] = masker(targetObj[key], key)
                } else {
                    obj[key] = targetObj[key]
                }
            }
            else if(typeof targetObj[key] == 'object') {
                obj[key] = objectMaskers(targetObj[key])
            }
            else if(Array.isArray(targetObj[key])) {
                obj[key] = arrayMaskers(targetObj[key], key)
            }
            else {
                obj[key] = targetObj[key]
            }
        
            return obj
        }, {})
        return maskedObj
    }
    
    arrayMaskers(data, key) {
        if(data == null || data == undefined) return null
        if(!Array.isArray(data)) {
            if(typeof data == 'object') return this.objectMaskers(data)
        }
    
        return data.map((value) => {
            if(typeof value == 'string') {
                if(this.maskFields.includes(key)) {
                    return this.masker(value, key)
                }
                else {
                    return value
                }
            }
            else {
                return this.objectMaskers(value)
            }
        })
    }
    
    asserter(obj, key) {
        if(typeof this.targetObj[key] == 'string') {
            if(this.maskFields.includes(key)) {
                obj[key] = this.masker(targetObj[key], key)
            } else {
                obj[key] = targetObj[key]
            }
        }
        else if(typeof targetObj[key] == 'object') {
            obj[key] = this.objectMaskers(targetObj[key])
        }
        else if(Array.isArray(targetObj[key])) {
            obj[key] = this.arrayMaskers(targetObj[key], key)
        }
        else {
            obj[key] = targetObj[key]
        }
    
        return obj
    }

    maskedResponse(responseBody) {
        // 
        let data = null, error = null;
        console.log(responseBody, "response body")
        try {
            if (Buffer.isBuffer(responseBody)) {
                responseBody = responseBody.toString('utf-8')
                data = this.objectMaskers(responseBody)
            }
            if (typeof responseBody == 'string') {
                let jsonData =JSON.parse(responseBody)
                data = this.objectMaskers(jsonData)
            }
            if (typeof responseBody == 'object') {
                // 
                data = this.objectMaskers(responseBody)
            }
        } catch (err) {
            console.log(err, "error")
            error = {
                source: "response",
                type: "invalid",
                message: "the response could not be parsed as JSON",
                file: null,
                line: null,
            }
        }
        return [data, error]
    }
    
    // activateMaskedFields(customFields) {
    //     const defaultMaskFields = [
    //         'password',
    //         'pwd',
    //         'secret',
    //         'password_confirmation',
    //         'passwordConfirmation',
    //         'cc',
    //         'card_number',
    //         'cardNumber',
    //         'ccv',
    //         'ssn',
    //         'credit_score',
    //         'creditScore',
    //         'api_key'
    //     ]
    //     const combination = [...defaultMaskFields, ...customFields]
    //     const fields = combination.reduce((former, value) => {
    //         former[value] = true
    //         return former
    //     }, {})
    //     return fields
    // }
}


module.exports = Masker