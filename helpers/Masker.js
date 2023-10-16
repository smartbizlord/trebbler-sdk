class Masker {
    constructor() {}

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
    
    
    objectMaskers(fields, data) {
        if(data == null || data == undefined) return null
        if(typeof data !== 'object') return data
    
        const targetObj = {
            ...data,
        }
        const maskedObj = Object.keys(targetObj).reduce(asserter, {})
        return maskedObj
    }
    
    arrayMaskers(fields, data, key) {
        if(data == null || data == undefined) return null
        if(!Array.isArray(data)) {
            if(typeof data == 'object') return this.objectMaskers(fields, data)
        }
    
        return data.map((value) => {
            if(typeof value == 'string') {
                if(fields[key] == true) {
                    return this.masker(value, key)
                }
                else {
                    return value
                }
            }
            else {
                return this.objectMaskers(fields, value)
            }
        })
    }
    
    asserter(obj, key) {
        if(typeof targetObj[key] == 'string') {
            if(fields[key] == true) {
                obj[key] = this.masker(targetObj[key], key)
            } else {
                obj[key] = targetObj[key]
            }
        }
        else if(typeof targetObj[key] == 'object') {
            obj[key] = this.objectMaskers(fields, targetObj[key])
        }
        else if(Array.isArray(targetObj[key])) {
            obj[key] = this.arrayMaskers(fields, targetObj[key], key)
        }
        else {
            obj[key] = targetObj[key]
        }
    
        return obj
    }
    
    activateMaskedFields(customFields) {
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
        const combination = [...defaultMaskFields, ...customFields]
        const fields = combination.reduce((former, value) => {
            former[value] = true
            return former
        }, {})
        return fields
    }
}


module.exports = Masker