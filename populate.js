import { Costumer, Pro, ProVIP, Place, Address } from './app/models';

export function populate () {
//costumer stuff

  // let costumer = new Costumer('joao', 'moura', 'joao@filipe.com', '123', '+1123456789');
  // costumer.create()
  //   .then((costumer) => {
  //     console.log(costumer)
  //     costumer.password = 321;
  //     return costumer.update();
  //   }).then((costumer2) => {
  //     console.log(costumer2)
  //   }).catch((error) => {
  //     console.log(error)
  //   });

  // costumer.create()
  //   .then((costumer) => {
  //     return costumer.remove()
  //   }).then((results) => {
  //     console.log(results)
  //   })

//---------------------------------------------------------------------------------------
//address and place stuff

  let address = new Address(null, 20, 'street', 'unit', 'city', 'st', 12345);
  // address.create()
  //   .then((address) => {
  //     console.log(address)
  //     address.street = 'rua'
  //     return address.update()
  //   }).then((address) => {
  //     console.log(address)
  //     return address.remove()
  //   }).then((result) => {
  //     console.log(result)
  //   });

  // let place = new Place(1, 1, 2, address);
  // place.create()
  //   .then((place) => {
  //     console.log(place)
  //     place.size = 10
  //     return place.update()
  //   }).then((place) => {
  //     console.log(place)
  //     return place.remove()
  //   }).then((result) => {
  //     console.log(result)
  //   });

//-----------------------------------------------------------------------------------
//Pro stuff

  let pro = new Pro('pedro', 'Moura', 'pedro@moura.com', '123', '+1123456789', address , true, null, null, null);
  // pro.create()
  //   .then((pro) => {
  //     console.log(pro)
  //     pro.firstName = 'joao'
  //     return pro.update()
  //   }).then((pro) => {
  //     console.log(pro)
  //     return pro.remove()
  //   }).then((result) => {
  //     console.log(result)
  //   });

  pro.create()
    .then((pro) => {
      console.log(pro)
      return new ProVIP(pro, '123456789', 'companyName').create();
    }).then((proVIP) => {
      console.log(proVIP)
      proVIP.companyName = 'myCompany'
      return proVIP.update()
    }).then((proVIP) => {
      console.log(proVIP)
      return proVIP.remove()
    }).then((res) => {
      console.log(res)
      return proVIP.remove()
    });

}
