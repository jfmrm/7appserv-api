import { Router } from 'express';
import { Service } from 'models';

let router = Router();

router.post('/:serviceId/going', (req, res) => {
    let demandId = req.params.demandId;
    let serviceId = req.params.serviceId;

    Service.going(serviceId)
        .then((result) => {
            if (result == true) {
                //trigger notification to user
                res.status(200).json({ message: 'Success'})
            }
        }).catch((error) => {
            res.status(500).json({ message: error.message })
        });
});

router.post('/:serviceId/start_service', (req, res) => {
    let serviceId = req.params.serviceId;
    let demandId = req.params.demandId;

    Service.startService(serviceId)
        .then((result) => {
            res.status(200).json(result)
        }).catch((error) => {
            res.status(500).json({ message: error.message })
        });
});

router.post('/:serviceId/finish_service', (req, res) => {
    let serviceId = req.params.serviceId;
    let demandId = req.params.demandId;
    
    Service.finishService(serviceId)
        .then((doneTime) => {
            res.status(200).json(doneTime)
        }).catch((error) => {
            console.log(error)
            res.status(500).json({ message: error.message })
        });
});

export const ServiceRouter = router;