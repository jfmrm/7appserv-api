import { Router } from 'express';
import { Moment } from '../../models';
import { getPic } from '../helpers';

let router = Router();

router.get('/', (req, res) => {
    Moment.list()
        .then(result => {
            res.status(200).json(result)
        })
        .catch(error => {
            res.status(200).json({ message: error.message })
        });
});

router.get('/:momentId/', (req, res) => {
    let momentId = req.params.momentId;
    Promise.all([
        getPic('momentPic/', momentId),
        Moment.get('id', momentId)
    ]).then(data => {
        let moment = data[1];
        moment.pic = data[0];
        res.status(200).json(moment)
    }).catch(error => {
        res.status(500).json({ message: error.message })
    });
})

export const MomentRouter = router;