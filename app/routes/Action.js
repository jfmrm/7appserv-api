import { Router } from 'express';
import { Demand, Service, Costumer, Place, ServiceType } from  '../models';

let router = Router();

//needs authentication
//Create new Demand
router.post('/demand', (req, res) => {
  let costumerId = req.body.costumerId;
  let placeId = req.body.placeId;
  let serviceTypeId = req.body.serviceTypeId;
  let dueDate = req.body.dueDate;
  let details = req.body.details;

  if(!costumerId || !placeId || !serviceTypeId || !dueDate || !details) {
    res.status(403).json({ message: "missing parameters" });
  } else {
    //retrieves demand dependecies
    Promise.all([
      new Costumer().get('id', costumerId),
      new Place().get('id', placeId),
      new ServiceType().get('id', serviceTypeId)
    ]).then((results) => {
      return new Demand(results[0], results[1], results[2], dueDate, details).create()
    }).then((demand) => {
      res.status(200).json(demand)
    }).catch((error) => {
      res.status(500).json(error)
    });
  }
});

//edit demand
router.post('/demand/edit', (req, res) => {
  let demandId = req.body.demandId;
  let placeId = req.body.placeId;
  let serviceTypeId = req.body.serviceTypeId;
  let dueDate = req.body.dueDate;
  let details = req.body.details;

  if(!demandId || !placeId || !serviceTypeId || !dueDate || !details) {
    res.status(403).json({ message: "missing parameters" });
  } else {
    //gets dependecies
    Promise.all([
      new Place().get('id', placeId),
      new ServiceType().get('id', serviceTypeId)
    ]).then((res) => {
      return new Demand(null, res[0], res[1], dueDate, details, null, null,demandId).update()
    }).then((demand) => {
      res.status(200).json(demand)
    }).catch((error) => {
      console.log(error)
      res.status(500).json(error)
    });
  }
});

export const ActionRouter = router;
