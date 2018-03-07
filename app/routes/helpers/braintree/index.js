import { BraintreeGateway } from '../../../../config';

export function generateClientToken() {
    return new Promise((resolve, reject) => {
        BraintreeGateway.clientToken.generate({}, (error, response) => {
            if (error) reject(error)
            resolve(response)
          });   
    })
}

/**
 * 
 * @param {String} firstName 
 * @param {String} lastName 
 * @param {Number} proId 
 * @param {String} paymentMethodNonce 
 */
export function createBraintreeCustomer(firstName, lastName, proId, paymentMethodNonce) {
    return new Promise((resolve, reject) => {
        BraintreeGateway.customer.create({
            firstName,
            lastName,
            id: proId,
            paymentMethodNonce: "fake-valid-nonce"
        }, (error, result) => {
            if (error) reject(error)
            if (result.success == false) reject(result)
            resolve(result)
        })
    })
}

/**
 * 
 * @param {Number} proId 
 */
export function createPaymentMethod(proId) {
    return new Promise((resolve, reject) => {
        BraintreeGateway.paymentMethod.create({
            customerId: proId,
            paymentMethodNonce: "fake-valid-nonce"
        }, (error, response) => {
            if (error) reject(error)
            if (response.success == false) reject(response)
            resolve(response)
        })
    })
}
/**
 * 
 * @param {Number} proId 
 */
export function findBraintreeCustomer(proId) {
    return new Promise((resolve, reject) => {
        BraintreeGateway.customer.find(proId.toString(), (error, customer) => {
            if (error) reject(error)
            resolve(customer)
        })
    })
}

/**
 * 
 * @param {String} token 
 * @param {String} planId 
 * @param {Number} proId 
 */
export function createSubscription(paymentMethodToken, planId) {
    return new Promise((resolve, reject) => {
        BraintreeGateway.subscription.create({
            paymentMethodToken,
            planId,
        }, (error, response) => {
            if (error) reject(error)
            if (response.success == false) reject(response)
            resolve(response)
        })
    })
}

/**
 * 
 * @param {String} subscriptionId 
 * @param {Number} planId 
 * @param {String} paymentMethodToken 
 */
export function updateSubscription(subscriptionId, planId, paymentMethodToken) {
    return new Promise((resolve, reject) => {
        let price;
        if(planId == "vip") price = "60.00"
        else price = "30.00"

        BraintreeGateway.subscription.update(subscriptionId, {
            planId,
            paymentMethodToken,
            price
        }, (error, response) => {
            if (error) reject(error)
            if (response.success == false) reject(response)
            resolve(response)
        })
    })
}

/**
 * 
 * @param {String} subscriptionId 
 */
export function cancelSubscription(subscriptionId) {
    return new Promise((resolve, reject) => {
        BraintreeGateway.subscription.cancel(subscriptionId, (error, response) => {
            if (error) reject(error)
            if(response.success == false) reject(response)
            resolve(response)
        })
    })
}