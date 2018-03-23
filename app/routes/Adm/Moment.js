import { Router } from 'express';
import { Moment, ServiceType } from '../../models';

let router = Router();

router.post('/', (req, res) => {
    let title = req.body.title;
    let description = req.body.description;

    if(!title || !description) {
        res.status(400).json({ message: 'missing marameters' })
        return
    }
    new Moment(title, description).create()
        .then(moment => {
            res.status(201).json(moment)
        })
        .catch((error) => {
            res.status(500).json({ message: error.message })
        });
});

router.get('/:momentId', (req, res) => {
    let momentId = req.params.momentId;

    Moment.get('id', momentId)
        .then(moment => {
            res.status(200).json(moment)
        }).catch((error) => {
            res.status(500).json({ message: error.message })
        });
});

router.put('/:momentId', (req, res) => {
    let momentId = req.params.momentId;
    let title = req.body.title;
    let description = req.body.description;

    if(!title || !description) {
        res.status(400).json({ message: 'missing parameters' })
        return
    }

    new Moment(title, description, [], momentId).update()
        .then(moment => {
            res.status(200).json(moment)
        })
        .catch((error) => {
            res.status(500).json({ message: error.message })
        });
});

router.delete('/:momentId', (req, res) => {
    let momentId = req.params.momentId;

    Moment.get('id', momentId)
        .then(moment => {
            return moment.remove(momentId)
        })    
        .then(removed => {
            res.status(200).json({ message: 'Service Type successfully deleted'})
        })
        .catch(error => {
            res.status(500).json({ message: error.message })
        });
});

router.post('/:momentId/service_types/:serviceTypeId', (req, res) => {
    const { momentId, serviceTypeId } = req.params

    Moment.addServiceType(momentId, serviceTypeId)
        .then(ok => {
            res.status(201).end();
        })
        .catch(error => {
            res.status(500).json({ message: error.message })
        });
});

router.delete('/:momentId/service_types/:serviceTypeId', (req, res) => {
    const { momentId, serviceTypeId } = req.params
    
    Moment.removeServiceType(momentId, serviceTypeId)
        .then(ok => {
            res.status(200).end();
        })
        .catch(error => {
            res.status(500).json({ message: error.message })
        });
});

export const MomentAdmRouter = router;