import { Customer, Address, City, Place } from 'models';
import { Router } from 'express';
import { uploadCustomerProfilePic,
         getPic } from '../helpers';

let router = Router();
//creates a new Customer
router.post('/', (req, res) => {
  let firstName = req.body.firstName;
  let lastName = req.body.lastName;
  let email = req.body.email;
  let password = req.body.password;
  let contactNumber = req.body.contactNumber;

  if(!firstName || !lastName || !email || !password || !contactNumber) {
    res.status(400).json({ message: 'missing arguments'});
  } else {
    let customer = new Customer(firstName, lastName, email, password, contactNumber);
    customer.create()
      .then((customer) => {
        res.status(201).json(customer)
      }).catch((error) => {
        res.status(500).json({ message: error.message })
      });
  }
});

router.post('/:customerId/profile_picture', uploadCustomerProfilePic.single('profilePic'), (req, res, next) => {
  res.status(201).json({ message: 'success' })
});

router.patch('/:customerId/profile_picture', uploadCustomerProfilePic.single('profilePic'), (error, req, res, next) => {
  res.status(200).json({ message: 'success' })
});

router.get('/:customerId/profile_picture', (req, res) => {
  let customerId = req.params.customerId;

  getPic('profilePic/customers/', customerId)
    .then((profilePic) => {
      res.status(200).json(profilePic);
    });
});

//from here needs authentication
//edit Customer
//this method doesn't edit the email and the password, theese will have its own methods
router.put('/:customerId', (req, res) => {
  let customerId = req.params.customerId;
  let firstName = req.body.firstName;
  let lastName = req.body.lastName;
  let email = req.body.email;
  let contactNumber = req.body.contactNumber;

  if(!firstName || !lastName || !email || !contactNumber) {
    res.status(400).json({ message: 'missing parameters' });
  } else {
    new Customer(firstName, lastName, email, null, contactNumber, customerId).update()
      .then((customer) => {
        res.status(200).json(customer)
      }).catch((error) => {
        res.status(500).json({ message: error.message })
      });
  }
});

router.delete('/:customerId', (req, res) => {
  let customerId = req.params.customerId;

  if(!customerId) {
    res.status(400).json({ message: "missing parameters" })
  } else {
    let customer = new Customer();
    customer.id = customerId;
    customer.remove()
      .then((deleted) => {
        if (deleted) res.status(200).json({ message: "Customer successfully deleted" })
      }).catch((error) => {
        res.status(500).json({ messate: error.message })
      });
  }
});

//get customer
router.get('/:customerId', (req, res) => {
  let customerId = req.params.customerId;
  
  new Customer().get('id', customerId)
    .then((customer) => {
      res.status(200).json(customer)
  }).catch((error) => {
    res.status(500).json({ message: error.message })
  });
});

//Place stuff
//crate Place
router.post('/:customerId/places', (req, res) => {
  let customerId = req.params.customerId;
  let size = req.body.size;
  let bathrooms = req.body.bathrooms;
  let address = req.body.address;

  if(!customerId || !size || !bathrooms || !address) {
    res.status(400).json({ message: "missing parameters" });
  } else {
    new City().get('id', address.cityId)
      .then((city) => {
        let addr = new Address(address.addressLine, address.addressLine2, address.district, city, address.zipCode, address.latitude, address.longitude, address.id)
        return new Place(customerId, size, bathrooms, addr).create()
      }).then((place) => {
        res.status(201).json(place)
      }).catch((error) => {
        console.log(error)
        res.status(500).json({ message: error.message })
      });
  }
});

router.put('/:customerId/places', (req, res) => {
  let customer = req.body.customerId;
  let placeId = req.body.placeId;
  let size = req.body.size;
  let bathrooms = req.body.bathrooms;
  let address = req.body.address;

  if(!size || !bathrooms || !address || !placeId) {
    res.status(400).json({ message: "missing parameters" })
  } else {
    new City().get('id', address.cityId)
      .then((city) => {
        return new Address(address.addressLine, address.addressLine2, address.district, city, address.zipCode, address.latitude, address.longitude, address.addressId).update()
      }).then((address) => {
        return new Place(null, size, bathrooms, address, placeId).update()
      }).then((place) => {
        res.status(200).json(place)
      }).catch((error) => {
        console.log(error)
        res.status(500).json({ message: error.message })
      });
  }
});

router.delete('/:customerId/places/:placeId', (req, res) => {
  let placeId = req.params.placeId;

  if(!placeId) {
    res.status(400).json({ message: 'missing parameters' })
  } else {
    let place = new Place();
    place.id = placeId;
    place.remove()
      .then((deleted) => {
        if(deleted) {
          res.status(200).json({ message: 'Place successfully deleted' })
        }
      }).catch((error) => {
        console.log(error)
        res.status(500).json({message: 'Place does not exists, or is corrupted'})
      });
  }
});

router.get('/:customerId/places', (req, res) => {
  let placeId = req.query.placeId;

  if(!placeId) {
    res.status(400).json({ message: 'missing parameters' })
  } else {
    new Place().get('id', placeId)
      .then((place) => {
        res.status(200).json(place)
      }).catch((error) => {
        res.status(500).json({ message: error.message })
      });
  }
});

export const CustomerUserRouter = router;
