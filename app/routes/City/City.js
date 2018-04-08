import { Router } from 'express';
import { City } from '../../models';

let router = Router();

router.get('/', (req, res) => {
    City.listCities()
        .then((cities) => {
            res.status(200).json(cities);
        }).catch((error) => {
            res.status(500).json({ message: error.message });
        });
});

export const CityRouter = router;