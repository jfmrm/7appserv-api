import { Costumer, Pro, ProVIP, Address, City } from '../models';
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

//creates new Pro
router.post('/pro', (req, res) => {
  let firstName = req.body.firstName;
  let lastName = req.body.lastName;
  let email = req.body.email;
  let password = req.body.password;
  let contactNumber = req.body.contactNumber;
  let address = req.body.address;
  let hasInsurance = req.body.hasInsurance;

  if (!firstName || !lastName || !email || !password || !contactNumber || !address || !hasInsurance) {
    res.status(403).json({ message: 'missing parameters' });
  } else {
    new City().get('id', address.cityId)
      .then((city) => {
        address = new Address(address.addressLine, address.addressLine2, address.district, city, address.zipCode)
        let pro = new Pro(firstName, lastName, email, password, contactNumber, address, hasInsurance);
        return pro.create()
      }).then((pro) => {
        res.status(200).json(pro)
      }).catch((error) => {
        res.status(500).json(error)
      });
  }
});

//from here needs authentication
//edit Costumer
//this method doesn't edit the email and the password, theese will have its own methods
router.post('/costumer/edit', (req, res) => {
  let firstName = req.body.firstName;
  let lastName = req.body.lastName;
  let email = req.body.email;
  let contactNumber = req.body.contactNumber;

  if(!firstName || !lastName || !email || !contactNumber) {
    res.status(403).json({ message: 'missing parameters' });
  } else {
    new Costumer(firstName, lastName, email, null, contactNumber).update()
      .then((costumer) => {
        res.status(200).json(costumer)
      }).catch((error) => {
        res.status(500).json(error)
      });
  }
});

router.post('/pro/edit', (req, res) => {
  let firstName = req.body.firstName;
  let lastName = req.body.lastName;
  let email = req.body.email;
  let contactNumber = req.body.contactNumber;
  let address = req.body.address;
  let hasInsurance = req.body.hasInsurance;

  if(!firstName || !lastName || !email || !contactNumber || !address || !hasInsurance) {
    res.status(403).json({ message: 'missing parameters' });
  } else {
    new Pro().get('email', email)
      .then((pro) => {
        return new Address(address.addressLine, address.addressLine2, address.district, null, address.zipCode, pro.address.id)
      }).then((newAddress) => {
        return new City().get('id', address.cityId)
          .then((city) => {
            newAddress.city = city
            return newAddress
          })
      }).then((address) => {
        return new Pro(firstName, lastName, email, null, contactNumber, address, hasInsurance).update()
      }).then((pro) => {
        res.status(200).json(pro)
      }).catch((error) => {
        console.log(error)
        res.status(500).json(error)
      });
  }
});

export const UserRouter = router;
