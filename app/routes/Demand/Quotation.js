import { Router } from 'express';
import { Demand, Quotation } from 'models';

let router = Router();

//Create quotation
router.post('/', (req, res) => {
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
  
  //update quotations
router.put('/', (req, res) => {
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
  
  //remove quotations
router.delete('/:quotationId', (req, res) => {
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
  
  
  
router.patch('/visualize/:demandId', (req, res) => {
    let demandId = req.params.demandId;
  
    new Quotation().visualize(demandId)
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
          .then((result) => {
              if (result == true) return
          }).then(() => {
              return new Quotation().get('id', quotationId)
          }).then((quotation) => {
              console.log(quotation.demand.id)
              return new Service(quotation.demand, quotation.pro.id).create()
          }).then((service) => {
              new Demand().close(service.id)
                  .then((result) => {
                      res.status(201).json(service)
                  })
          }).catch((error) => {
              console.log(error)
              res.status(500).json({ message: error.message })
          });
});
  
export const QuotationRouter = router;