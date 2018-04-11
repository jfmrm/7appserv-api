import { Router } from 'express';
import { ServiceType } from '../../models';
import { uploadServiceTypePic } from '../helpers';

let router = Router();

router.post('/', (req, res) => {
    let name = req.body.name;
    let form = req.body.form;

    if(!name || !form) {
        res.status(400).json({ message: 'missing marameters' })
    } else {
        new ServiceType(name, form).create()
            .then((serviceType) => {
                res.status(201).json(serviceType)
            }).catch((error) => {
                res.status(500).json({ message: error.message })
            });
    }
});

router.post('/:serviceTypeId/picture', uploadServiceTypePic.single('serviceTypePic'), (req, res, next) => {
    res.status(201).json({ message: 'success'})
});

router.patch('/:serviceTypeId/picture', uploadServiceTypePic.single('serviceTypePic'), (req, res, next) => {
    res.status(200).json({ message: 'success' })
});

router.put('/:serviceTypeId', (req, res) => {
    let serviceTypeId = req.params.serviceTypeId;
    let serviceType = req.body.type;
    let form = req.body.form;

    if(!serviceType || !form) {
        res.status(400).json({ message: 'missing parameters' })
    } else {
        new ServiceType(serviceTypeId, serviceType, form).update()
            .then((serviceType) => {
                res.status(200).json(serviceType)
            }).catch((error) => {
                res.status(500).json({ message: error.message })
            });
    }
});

router.delete('/:serviceTypeId', (req, res) => {
    let serviceTypeId = req.params.serviceTypeId;

    new ServiceType(serviceTypeId).remove()
        .then(() => {
            res.status(200).json({ message: 'Service Type successfully deleted'})
        }).catch((error) => {
            res.status(500).json({ message: error.message })
        });
});

export const ServiceTypeAdmRouter = router;