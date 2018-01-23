import { Costumer, Pro, ProVIP } from '../models';
import { Router } from 'express';

let router = Router();

//creates a new Costumer
router.post('/costumer', (req, res) => {
  let firstName = req.body.firstName;
  let lastName = req.body.lastName;
  let email = req.body.email;
  let password = req.body.password;
  let contactNumber = req.body.contactNumber;

  if(!firstName || !lastName || !email || !password || !contactNumber) {
    res.status(403).json({ message: 'missing arguments'});
  } else {
    let costumer = new Costumer(firstName, lastName, email, password, contactNumber);
    costumer.create()
      .then((costumer) => {
        res.status(200).json(costumer)
      }).catch((error) => {
        res.status(500).json(error)
      });
  }
});

export const UserRouter = router;
