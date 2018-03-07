import { Pro, Demand } from '../../app/models';

export function getPro (req, res, next) {
    let proId = req.params.proId;

    new Pro().get('id', proId)
        .then((pro) => {
            req.pro = pro
            next()
        }).catch((error) => {
            res.status(500).json({ message: error.message })
        })
}

export function getDemand(req, res, next) {
    let demandId = req.params.demandId;

    new Demand().get('id', demandId)
        .then((demand) => {
            req.demand = demand
            next()
        }).catch((error) => {
            res.status(500).json({ message: error.message })
        })
}
