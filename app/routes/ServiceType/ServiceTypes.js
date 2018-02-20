import { Router } from 'express';
import { ServiceType, Question } from '../../models';

let router = Router();

router.get('/', (req, res) => {
    ServiceType.listServiceTypes()
        .then((serviceTypes) => {
            res.status(200).json(serviceTypes)
        }).catch((error) => {
            res.status(200).json({ message: error.message })
        });
});

export const ServiceTypeRouter = router;