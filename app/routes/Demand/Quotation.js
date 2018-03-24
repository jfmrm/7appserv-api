import { Router } from 'express';
import { Demand, Quotation, Service } from 'models';

let router = Router();

//Create quotation
router.post('/', (req, res) => {
    let proId = req.body.proId;
    let demandId = req.demand.id;
    let value = req.body.value;
    let details = req.body.details;
  
    if(!proId || !demandId || !value) {
        res.status(400).json({ message: 'missing parameters' });
    } else {
        new Quotation(proId, demandId, value, details).create()
            .then((quotation) => {
                res.status(201).json(quotation)
            }).catch((error) => {
                console.log(error)
                res.status(500).json({ message: error.message })
            });
    }
});
  
  //update quotations
router.patch('/:quotationId', (req, res) => {
    let value = req.body.value;
    let quotationId = req.params.quotationId;

    if(!value) {
        res.status(400).json({ message: 'missing parameters' })
    } else {
        new Quotation(null, null, value, null, null, quotationId).update()
        .then((quotation) => {
            res.status(200).json(quotation)
        }).catch((error) => {
            res.status(500).json({ message: error.message })
        });
    }
});
  
  //remove quotations
router.delete('/:quotationId', (req, res) => {
    let quotationId = req.params.quotationId;
    
    new Quotation().get('id', quotationId)
    .then((quotation) => {
        return quotation.remove()
    }).then((result) => {
        if (result == true) {
            res.status(200).json({ message: "Quotation deleted successfully" })
        } else {
            res.status(500).json({ message: "Could not remove this quotation" })
        }
    }).catch((error) => {
        console.log(error)
        res.status(500).json({ message: error.message })
    });
})
  
  //gets a given quotation
  router.get('/:quotationId', (req, res) => {
    let quotationId = req.params.quotationId;
  
    new Quotation().get('id', quotationId)
        .then((quotation) => {
            res.status(200).json(quotation);
        }).catch((error) => {
            res.status(500).json({ message: error.message })
        });
});
  
  
  
router.patch('/visualize', (req, res) => {
    let demandId = req.demand;
  
    new Quotation().visualize(demand.id)
      .then((response) => {
        if (response == true) {
          res.status(200).json({ message: "Success"})
        }
      }).catch((error) => {
        res.status(500).json({ message: error.message })
      });
});
  
router.patch('/:quotationId/accept', (req, res) => {
    let quotationId = req.params.quotationId;

    new Quotation().accept(quotationId)
        .then((service) => {
            res.status(201).json(service)
        }).catch((error) => {
            res.status(500).json({ message: error.message })
        });
});
  
export const QuotationRouter = router;