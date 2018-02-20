import { Router } from 'express';
import { ServiceType } from '../../models';

let router = Router();

router.get('/', (req, res) => {
    ServiceType.listServiceTypes()
        .then((serviceTypes) => {
            res.status(200).json(serviceTypes)
        }).catch((error) => {
            res.status(200).json({ message: error.message })
        });
});

router.get('/:serviceTypeId/form', (req, res) => {
    let serviceTypeId = req.params.serviceTypeId;

    ServiceType.getForm(serviceTypeId)
        .then((form) => {
            res.status(200).json(form)
        }).catch((error) => {
            res.status(500).json({ message: error.message })
        })
})

export const ServiceTypeRouter = router;