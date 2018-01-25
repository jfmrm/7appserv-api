import { Costumer, Address, City, Place } from '../models';
import { Router } from 'express';

let router = Router();
//creates a new Costumer
router.post('/', (req, res) => {
  let firstName = req.body.firstName;
  let lastName = req.body.lastName;
  let email = req.body.email;
  let password = req.body.password;
  let contactNumber = req.body.contactNumber;

  if(!firstName || !lastName || !email || !password || !contactNumber) {
    res.status(400).json({ message: 'missing arguments'});
  } else {
    let costumer = new Costumer(firstName, lastName, email, password, contactNumber);
    costumer.create()
      .then((costumer) => {
        res.status(201).json(costumer)
      }).catch((error) => {
        res.status(500).json(error)
      });
  }
});

//from here needs authentication
//edit Costumer
//this method doesn't edit the email and the password, theese will have its own methods
router.put('/', (req, res) => {
  let firstName = req.body.firstName;
  let lastName = req.body.lastName;
  let email = req.body.email;
  let contactNumber = req.body.contactNumber;

  if(!firstName || !lastName || !email || !contactNumber) {
    res.status(400).json({ message: 'missing parameters' });
  } else {
    new Costumer(firstName, lastName, email, null, contactNumber).update()
      .then((costumer) => {
        res.status(200).json(costumer)
      }).catch((error) => {
        res.status(500).json(error)
      });
  }
});

router.delete('/', (req, res) => {
  let costumerId = req.query.costumerId;

  if(!costumerId) {
    res.status(400).json({ message: "missing parameters" })
  } else {
    let costumer = new Costumer();
    costumer.id = costumerId;
    costumer.remove()
      .then((deleted) => {
        if (deleted) res.status(200).json({ message: "Costumer successfully deleted" })
      }).catch((error) => {
        console.log(error)
        res.status(500).json(error)
      });
  }
});

//get costumer
router.get('/', (req, res) => {
  let costumerId = req.query.costumerId;

  if(!costumerId) {
    res.status(400).json({ message: 'missing parameters' });
  } else {
    new Costumer().get('id', costumerId)
      .then((costumer) => {
        res.status(200).json(costumer)
      }).catch((error) => {
        console.log(error)
        res.status(500).json(error)
      });
  }
});

//Place stuff
//crate Place
router.post('/places', (req, res) => {
  let costumerId = req.body.costumerId;
  let size = req.body.size;
  let bathrooms = req.body.bathrooms;
  let address = req.body.address

  if(!costumerId || !size || !bathrooms || !address) {
    res.status(400).json({ message: "missing parameters" });
  } else {
    new City().get('id', address.cityId)
      .then((city) => {
        return new Address(address.addressLine, address.addressLine2, address.district, city, address.zipCode, address.id)
          .create()
      }).then((address) => {
        return new Place(costumerId, size, bathrooms, address).create()
      }).then((place) => {
        res.status(201).json(place)
      }).catch((error) => {
        console.log(error)
        res.status(500).json(error)
      });
  }
});

router.put('/places', (req, res) => {
  let costumerId = req.body.costumerId;
  let placeId = req.body.placeId;
  let size = req.body.size;
  let bathrooms = req.body.bathrooms;
  let address = req.body.address;

  if(!size || !bathrooms || !address || !costumerId || !placeId) {
    res.status(400).json({ message: "missing parameters" })
  } else {
    new City().get('id', address.cityId)
      .then((city) => {
        return new Address(address.addressLine, address.addressLine2, address.district, city, address.zipCode, address.addressId).update()
      }).then((address) => {
        return new Place(costumerId, size, bathrooms, address, placeId).update()
      }).then((place) => {
        res.status(200).json(place)
      }).catch((error) => {
        console.log(error)
        res.status(500).json(error)
      });
  }
});

export const CostumerRouter = router;
