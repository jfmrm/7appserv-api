import { Pro } from '../../app/models';

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
