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
    Moment.get('id', momentId)
        .then(moment => {
            moment.serviceTypes.forEach(element => {
                getPic(`serviceTypePic/${element.id}.jpg`).then((pic) => {
                    element.pic = pic
                })
            });
            getPic(`momentPic/${momentId}.jpg`).then((pic) => {
                moment.pic = pic;
                res.status(200).json(moment)
            })
        }).catch(error => {
            res.status(500).json({ message: error.message })
        });
})

export const MomentRouter = router;