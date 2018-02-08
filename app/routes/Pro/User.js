import { Costumer, Pro, ProVIP, Address, City } from 'models';
import { Router } from 'express';

let router = Router();
//creates new Pro
router.post('/', (req, res) => {
  let firstName = req.body.firstName;
  let lastName = req.body.lastName;
  let email = req.body.email;
  let password = req.body.password;
  let contactNumber = req.body.contactNumber;
  let address = req.body.address;
  let hasInsurance = req.body.hasInsurance;
  let actionRadious = req.body.actionRadious;

  if (!firstName || !lastName || !email || !password || !contactNumber || !address || !hasInsurance || !actionRadious) {
    res.status(400).json({ message: 'missing parameters' });
  } else {
    new City().get('id', address.cityId)
      .then((city) => {
        let addr = new Address(address.addressLine, address.addressLine2, address.district, city, address.zipCode, address.latitude, address.longitude)
        let pro = new Pro(firstName, lastName, email, password, contactNumber, addr, hasInsurance, actionRadious);
        return pro.create()
      }).then((pro) => {
        res.status(201).json(pro)
      }).catch((error) => {
        res.status(500).json({ message: error.message })
      });
  }
});


//edit Pro
router.put('/', (req, res) => {
  let firstName = req.body.firstName;
  let lastName = req.body.lastName;
  let email = req.body.email;
  let contactNumber = req.body.contactNumber;
  let address = req.body.address;
  let hasInsurance = req.body.hasInsurance;
  let actionRadious = req.body.actionRadious;

  if(!firstName || !lastName || !email || !contactNumber || !address || !hasInsurance || !actionRadious) {
    res.status(400).json({ message: 'missing parameters' });
  } else {
    new Pro().get('email', email)
      .then((pro) => {
        return new Address(address.addressLine, address.addressLine2, address.district, null, address.zipCode, address.latitude, address.longitude, pro.address.id)
      }).then((newAddress) => {
        return new City().get('id', address.cityId)
          .then((city) => {
            newAddress.city = city
            return newAddress
          })
      }).then((address) => {
        return new Pro(firstName, lastName, email, null, contactNumber, address, hasInsurance, actionRadious).update()
      }).then((pro) => {
        res.status(200).json(pro)
      }).catch((error) => {
        res.status(500).json({ message: error.message })
      });
  }
});

//delete Pro
router.delete('/', (req, res) => {
  let proId = req.query.proId;

  if(!proId) {
    res.status(400).json({ message: "missing parameters" })
  } else {
    let pro = new Pro();
    pro.id = proId;
    pro.remove()
      .then((deleted) => {
        res.status(200).json({ message: "pro deleted successfully" })
      }).catch((error) => {
        res.status(500).json({ message: error.message })
      });
  }
});

//get pro
router.get('/', (req, res) => {
  let proId = req.query.proId;

  if(!proId) {
    res.status(400).json({ message: 'missing parameters' });
  } else {
    new Pro().get('id', proId)
      .then((pro) => {
        res.status(200).json(pro)
      }).catch((error) => {
        res.status(500).json({ message: error.message })
      });
  }
});

//list pros avable on the given city
router.get('/vip/:cityId', (req, res) => {
  let cityId = req.params.cityId

  new ProVIP().getProVIPList(cityId)
    .then((proVIPList) => {
      res.status(200).json(proVIPList)
    }).catch((error) => {
      res.status(500).json({ message: error.message })
    });
});

export const ProUserRouter = router;
