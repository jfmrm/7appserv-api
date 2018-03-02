import { Router } from 'express';
import { generateClientToken,
         createSubscription,
         createBraintreeCustomer } from '../helpers';
import { Pro } from '../../models';

let router = Router();

router.get('/client_token', (req, res) => {
    generateClientToken().then((token) => {
        res.status(200).json({ token: token.clientToken })
    }).catch((error) => {
        res.status(500).json({ message: error.message })
    });
})

router.post('/:proId/checkout', (req, res) => {
    let proId = req.params.proId
    let paymentMethodNonce = req.body.paymentMethodNonce;
    let planId = req.body.planId;

    if (!planId) {
        res.status(400).json({ message: "missing parameters" })
    } else {
        new Pro().get('id', proId)
            .then((pro) => {
                return createBraintreeCustomer(pro.firstName, pro.lastName, proId, paymentMethodNonce)
            }).then((result) => {
                let paymentMethodToken = result.customer.paymentMethods[0].token
                return createSubscription(paymentMethodToken, planId)
            }).then((result) => {
                console.log(result)
                res.status(200).json(result)
            }).catch((error) => {
                console.log(error)
                res.status(500).json(error)
            })
    }
})


router.post('/confirm', (req, res) => {
    let token = req.body.token
    let planId = req.body.planId

    createSubscription(token, planId).then((subscription) => {
        res.status(200).json(subscription)
    }).catch((error) => {
        res.status(500).json(error)
    })
})

export const ProPaymentsRouter = router;