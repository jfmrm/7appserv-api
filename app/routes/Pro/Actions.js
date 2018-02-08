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

export const ProActionsRouter = router;