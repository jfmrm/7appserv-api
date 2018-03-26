import { Router } from 'express';
import { Service } from 'models';

let router = Router();

router.post('/:serviceId/going', (req, res) => {
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

    Service.startService(serviceId)
        .then((result) => {
            res.status(200).json(result)
        }).catch((error) => {
            res.status(500).json({ message: error.message })
        });
});

router.post('/:serviceId/finish_service', (req, res) => {
    let serviceId = req.params.serviceId;
    
    Service.finishService(serviceId)
        .then((doneTime) => {
            res.status(200).json(doneTime)
        }).catch((error) => {
            console.log(error)
            res.status(500).json({ message: error.message })
        });
});

router.get('/pros/:proId', (req, res) => {
    let proId = req.params.proId;

    Promise.all([
        Service.listServices(proId, 'Next few days'),
        Service.listServices(proId, 'Next week'),
        Service.listServices(proId, 'Next month')
    ]).then((data) => {
        let serviceList = {
            nextFewDays: data[0],
            nextWeek: data[1],
            nextMonth: data[2]
        }
        res.status(200).json(serviceList)
    }).catch((error) => {
        console.log(error)
        res.status(500).json({ message: error })
    });
});

export const ServiceRouter = router;