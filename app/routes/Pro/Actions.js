import { Router } from 'express';
import { Demand } from '../../models';

let router = Router();

router.get('/demands/public/:cityId', (req, res) => {
    let cityId = req.params.cityId;

    new Demand().getPublicDemandList(cityId)
        .then((demandList) => {
            res.status(200).json(demandList)
        }).catch((error) => {
            res.status(500).json({ message: error.message })
        });
});

router.get('/demands/:demandId', (req, res) => {
    let demandId = req.params.demandId;

    new Demand().get('id', demandId)
        .then((demand) => {
            res.status(200).json(demand)
        }).catch((error) => {
            res.status(500).json({ message: error.message })
        });
});

export const ProActionsRouter = router;