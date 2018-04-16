import { Customer, Pro, ProVIP, Address, City, Service } from '../../models';
import { Router } from 'express';
import { uploadProProfilePic,
         getPic,
         generateClientToken } from '../helpers';
import { chatkit } from '../../../config';

let router = Router();
//creates new Pro
router.post('/', (req, res) => {
  let firstName = req.body.firstName;
  let lastName = req.body.lastName;
  let email = req.body.email;
  let birthDate = req.body.birthDate;
  let address = req.body.address;
  let description = req.body.description;
  let id = req.body.id;
  let deviceToken = req.body.deviceToken;

  if (!firstName || !lastName || !email || !birthDate || !address || !description || !id || !deviceToken) {
    res.status(400).json({ message: 'missing parameters' });
  } else {
    new City().get('id', address.cityId)
      .then((city) => {
        let addr = new Address(address.addressLine, address.addressLine2, address.district, city, address.zipCode, address.latitude, address.longitude)
        let pro = new Pro(firstName, lastName, email, birthDate, addr, description, null, id);
        return pro.create()
      }).then((pro) => {
        return Promise.all([
          Pro.updateDeviceToken(pro.id, deviceToken),
          chatkit.createUser({ id: pro.id, name: `${pro.firstName} ${pro.lastName}`, avatarURL: `https://s3.amazonaws.com/7appserv/profilePic/pros/${pro.id}.jpg`})
        ]).then(() => {
            pro.profilePic = `https://s3.amazonaws.com/7appserv/profilePic/pros/${pro.id}.jpg`
            res.status(201).json(pro)
          })
      }).catch((error) => {
        res.status(500).json({ message: error })
      });
  }
});

router.patch('/:proId/device_token', (req, res) => {
  let deviceToken = req.body.deviceToken;
  let proId = req.params.proId;

  if(!proId || !deviceToken) {
    res.status(400).json({ message: "missing parameters" })
  } else {
    Pro.updateDeviceToken(proId, deviceToken)
      .then((result) => {
        res.status(200).json({ message: 'success' })
      }).catch((error) => {
        res.status(500).json({ message: error.message })
      });
  }
});

router.post('/:proId/profile_picture', uploadProProfilePic.single('profilePic'), (req, res, next) => {
  res.status(201).json({ message: 'success' })
});

router.patch('/:proId/profile_picture', uploadProProfilePic.single('profilePic'), (req, res, next) => {
  res.status(200).json({ message: 'success' })
});

//edit Pro
//rever error
router.put('/:proId', (req, res) => {
  let proId = req.params.proId;
  let firstName = req.body.firstName;
  let lastName = req.body.lastName;
  let email = req.body.email;
  let birthDate = req.body.birthDate;
  let address = req.body.address;
  let description = req.body.description;

  if(!firstName || !lastName || !email || !birthDate || !address || !description) {
    res.status(400).json({ message: 'missing parameters' });
  } else {
    new Pro().get('id', proId)
      .then((pro) => {
        return new Address(address.addressLine, address.addressLine2, address.district, null, address.zipCode, address.latitude, address.longitude, pro.address.id)
      }).then((newAddress) => {
        return new City().get('id', address.cityId)
          .then((city) => {
            newAddress.city = city
            return newAddress
          })
      }).then((address) => {
        return new Pro(firstName, lastName, email, null, birthDate, address, description, null, proId).update()
      }).then((pro) => {
        pro.profilePic = `https://s3.amazonaws.com/7appserv/profilePic/pros/${pro.id}.jpg`;
        res.status(200).json(pro)
      }).catch((error) => {
        res.status(500).json({ message: error.message })
      });
  }
});

//delete Pro
router.delete('/:proId', (req, res) => {
  let proId = req.params.proId;

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
router.get('/:proId', (req, res) => {
  let proId = req.params.proId;

  if(!proId) {
    res.status(400).json({ message: 'missing parameters' });
  } else {
    new Pro().get('id', proId)
      .then((pro) => {
        pro.profilePic = `https://s3.amazonaws.com/7appserv/profilePic/pros/${pro.id}.jpg`
        res.status(200).json(pro)
      }).catch((error) => {
        res.status(500).json({ message: error.message })
      });
  }
});

router.get('/payments/client_token', (req, res) => {
  generateClientToken().then((token) => {
      res.status(200).json({ token: token.clientToken })
  }).catch((error) => {
      res.status(500).json({ message: error.message })
  });
})

router.get('/:proId/projects', (req, res) => {
  let proId = req.params.proId;

  Promise.all([
      Service.listServices(proId, 'Next few days'),
      Service.listServices(proId, 'Next week'),
      Service.listServices(proId, 'Next month')
  ]).then((data) => {
      let serviceList = {
          nextFewDays: data[0],
          nextWeek: data[1],
          nextMonth: data[2]
      }
      res.status(200).json(serviceList)
  }).catch((error) => {
      res.status(500).json({ message: error })
  });
});

//list pros avable on the given city
router.get('/vip/cities/:cityId', (req, res) => {
  let cityId = req.params.cityId;

  ProVIP.getProVIPList(cityId)
    .then((proVIPList) => {
      res.status(200).json(proVIPList)
    }).catch((error) => {
      res.status(500).json({ message: error.message })
    });
});

router.post('/:proId/turn_vip', (req, res) => {
  let proId = req.params.proId;
  let ein = req.body.ein;
  let companyName = req.body.companyName;
  let licenseNumber = req.body.licenseNumber;

  if(!ein || !companyName || !licenseNumber) {
    res.status(400).json({ message: "missing parameters" })
  } else {
    new Pro().get('id', proId)
      .then((pro) => {
        return new ProVIP(pro, ein, companyName, licenseNumber).create();
      }).then((proVIP) => {
        res.status(201).json(proVIP);
      }).catch((error) => {
        res.status(500).json({ message: error });
      });
  }
});

router.get('/:proId/chats', (req, res) => {
  let proId = req.params.proId;

  chatkit.getUserRooms({
    userId: proId 
  }).then((chats) => {
    res.status(200).json(chats)
  }).catch((error) => {
    res.status(500).json({ message: error.message })
  })
})

export const ProUserRouter = router;
