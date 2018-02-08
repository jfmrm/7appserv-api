import { Router } from 'express';
import { Costumer, Place, ServiceType, Demand, Quotation } from 'models';

let router = Router();

//needs authentication
//Create new Demand to be posted to all pros in the area
router.post('/public', (req, res) => {
    let costumerId = req.body.costumerId;
    let placeId = req.body.placeId;
    let serviceTypeId = req.body.serviceTypeId;
    let dueDate = req.body.dueDate;
    let details = req.body.details;
    let isPublic = true;

    if(!costumerId || !placeId || !serviceTypeId || !dueDate || !details) {
        res.status(400).json({ message: "missing parameters" });
    } else {
        //retrieves demand dependecies
        Promise.all([
        new Costumer().get('id', costumerId),
        new Place().get('id', placeId),
        new ServiceType().get('id', serviceTypeId)
        ]).then((results) => {
            return new Demand(results[0], results[1], results[2], dueDate, details, isPublic).create()
        }).then((demand) => {
            res.status(201).json(demand)
        }).catch((error) => {
            res.status(500).json({ message: error.message })
        });
    }
});

// create private demand
router.post('/private', (req, res) => {
    let costumerId = req.body.costumerId;
    let placeId = req.body.placeId;
    let serviceTypeId = req.body.serviceTypeId;
    let dueDate = req.body.dueDate;
    let details = req.body.details;
    let isPublic = false;
    let proVIPId = req.body.proVIPId;
  
    if(!costumerId || !placeId || !serviceTypeId || !dueDate || !details || !proVIPId) {
      res.status(400).json({ message: "missing parameters" });
    } else {
      Promise.all([
        new Costumer().get('id', costumerId),
        new Place().get('id', placeId),
        new ServiceType().get('id', serviceTypeId),
      ]).then((results) => {
        return new Demand(results[0], results[1], results[2], dueDate, details, isPublic, proVIPId).create()
      }).then((demand) => {
        res.status(201).json(demand)
      }).catch((error) => {
        res.status(500).json({ message: error.message })
      })
    }
});
  
  //edit demand
router.put('/', (req, res) => {
    let demandId = req.body.demandId;
    let placeId = req.body.placeId;
    let serviceTypeId = req.body.serviceTypeId;
    let dueDate = req.body.dueDate;
    let details = req.body.details;
  
    if(!demandId || !placeId || !serviceTypeId || !dueDate || !details) {
      res.status(400).json({ message: "missing parameters" });
    } else {
      //gets dependecies
      Promise.all([
        new Place().get('id', placeId),
        new ServiceType().get('id', serviceTypeId)
      ]).then((res) => {
        return new Demand(null, res[0], res[1], dueDate, details, null, null, null, null, demandId).update()
      }).then((demand) => {
        res.status(200).json(demand)
      }).catch((error) => {
        console.log(error)
        res.status(500).json({ message: error.message })
      });
    }
});
  
  //delete demand
router.delete('/', (req, res) => {
    let demandId = req.query.demandId;
  
    if(!demandId) {
      res.status(400).json({ message: 'missing parameters' });
    } else {
      let demand = new Demand();
      demand.id = demandId
      demand.remove()
        .then((deleted) => {
          if (deleted) res.status(200).json({ message: 'demand successfully deleted' })
        }).catch((error) => {
          res.status(500).json({ message: error.message })
        });
    }
});
  
//get demand
router.get('/:demandId', (req, res) => {
    let demandId = req.params.demandId;

    new Demand().get('id', demandId)
    .then((demand) => {
        res.status(200).json(demand)
    }).catch((error) => {
        res.status(500).json({ message: error.message })
    });
});
 
//lists demands avable on the given city
router.get('/public/:cityId', (req, res) => {
    let cityId = req.params.cityId;

    new Demand().getPublicDemandList(cityId)
        .then((demandList) => {
            res.status(200).json(demandList)
        }).catch((error) => {
            res.status(500).json({ message: error.message })
        });
});

//Quotation stuff
router.post('/quotations', (req, res) => {
  let proId = req.body.proId;
  let demandId = req.body.demandId;
  let value = req.body.value;
  let dueDate = req.body.dueDate;
  let details = req.body.details;

  if(!proId || !demandId || !value || !dueDate) {
      res.status(400).json({ message: 'missing parameters' });
  } else {
      new Quotation(proId, demandId, value, dueDate, details).create()
          .then((quotation) => {
              res.status(201).json(quotation)
          }).catch((error) => {
              res.status(500).json({ message: error.message })
          });
  }
});


router.put('/quotations', (req, res) => {
  let value = req.body.value;
  let dueDate = req.body.dueDate;
  let details = req.body.details;
  let quotationId = req.body.quotationId;
  
  if(!value || !dueDate || !details || !quotationId) {
      res.status(400).json({ message: 'missing parameters' })
  } else {
      new Quotation(null, null, value, dueDate, details, null, quotationId).update()
      .then((quotation) => {
          res.status(200).json(quotation)
      }).catch((error) => {
          res.status(500).json({ message: error.message })
      });
  }
});

router.delete('/quotations/:quotationId', (req, res) => {
  let quotationId = req.params.quotationId;
  
  new Quotation().get('id', quotationId)
  .then((quotation) => {
      console.log(quotation)
      return quotation.remove()
  }).then((result) => {
      if (result == true) {
          res.status(200).json({ message: "Quotation deleted successfully" })
      } else {
          res.status(500).json({ message: "Could not remove this quotation" })
      }
  }).catch((error) => {
      res.status(500).json({ message: error.message })
  });
})

router.get('/quotations/:quotationId', (req, res) => {
  let quotationId = req.params.quotationId;

  new Quotation().get('id', quotationId)
      .then((quotation) => {
          res.status(200).json(quotation);
      }).catch((error) => {
          res.status(500).json({ message: error.message })
      });
});

//Lists quotations related to the given demand
router.get('/:demandId/quotations', (req, res) => {
  let demandId = req.params.demandId;

  new Quotation().getQuotationListFromDemand(demandId)
      .then((quotationList) => {
          res.status(200).json(quotationList)
      }).catch((error) => {
          res.status(500).json({ message: error.message })
      });
});

export const DemandRouter = router;