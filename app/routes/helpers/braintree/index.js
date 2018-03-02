import { BraintreeGateway } from '../../../../config';

export function generateClientToken() {
    return new Promise((resolve, reject) => {
        BraintreeGateway.clientToken.generate({}, (error, response) => {
            if (error) reject(error)
            resolve(response)
          });   
    })
}

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

export function createSubscription(token, planId) {
    return new Promise((resolve, reject) => {
        BraintreeGateway.subscription.create({
            paymentMethodToken: token,
            planId: planId
        }, (error, response) => {
            if (error) reject(error)
            if (response.success == false) reject(response)
            resolve(response)
        })
    })
}