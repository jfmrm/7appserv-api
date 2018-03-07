import { Router } from 'express';
import { Pro } from '../../models';
import { generateClientToken,
         createSubscription,
         createBraintreeCustomer,
         findBraintreeCustomer,
         updateSubscription,
         cancelSubscription,
         createPaymentMethod } from '../helpers';
import { BraintreeGateway } from '../../../config';

let router = Router();

// first payment
router.post('/', (req, res) => {
    let pro = req.pro;
    let paymentMethodNonce = req.body.paymentMethodNonce;
    let planId = req.body.planId;

    if (!planId) {
        res.status(400).json({ message: "missing parameters" })
    } else {
        createBraintreeCustomer(pro.firstName, pro.lastName, pro.id, paymentMethodNonce)
            .then((result) => {
                let paymentMethodToken = result.customer.paymentMethods[0].token
                return createSubscription(paymentMethodToken, planId)
            }).then((result) => {
                res.status(200).json(result)
            }).catch((error) => {
                res.status(500).json({message: error.message})
            })
    }
})

router.post('/subscribe', (req, res) => {
    let pro = req.pro;
    let planId = req.body.planId;

    findBraintreeCustomer(pro.id)
        .then((customer) => {
            return createSubscription(customer.paymentMethods[0].token, planId)
        }).then((subscription) => {
            res.status(200).json({ success: true })
        }).catch((error) => {
            res.status(500).json(error)
        })
})

//updates plan (vip or standard)
router.patch('/', (req, res) => {
    let pro = req.pro;
    let planId = req.body.planId;

    if (!planId) {
        res.status(400).json({ message: "missing parameters" })
    } else {
        findBraintreeCustomer(pro.id)
            .then((customer) => {
                let subscriptionId = customer.paymentMethods[0].subscriptions[0].transactions[0].subscriptionId
                let paymentMethodToken = customer.paymentMethods[0].token;
                
                updateSubscription(subscriptionId, planId, paymentMethodToken)
                    .then((response) => {
                        res.status(200).json(response.success)
                    }).catch((error) => {
                        res.status(500).json({ message: error.message })
                    })
            }).catch((error) => {
                res.status(500).json({ message: "this user does not have a subscription"})
            })
    }
})

//cancel subscription but do not delete Braintree customer
router.delete('/', (req, res) => {
    let pro = req.pro
    findBraintreeCustomer(pro.id)
        .then((customer) => {
            let subscriptionId = customer.paymentMethods[0].subscriptions[0].transactions[0].subscriptionId
            cancelSubscription(subscriptionId)
                .then((response) => {
                    res.status(200).json(response.success)
                }).catch((error) => {
                    res.status(500).json(error)
                })
        }).catch((error) => { 
            res.status(500).json({ message: "this user does not have a subscription"})
        })
})

export const ProPaymentsRouter = router;