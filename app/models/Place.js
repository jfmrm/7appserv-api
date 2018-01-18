import { Pool } from '../../config';
import { Address } from './';

export class Place {
  constructor(costumerId, size, bathrooms, address, placeId) {
    this.costumerId = costumerId;
    this.size = size; //feet squered
    this.bathrooms = bathrooms;
    this.address = address;
    this.id = placeId;
  }

  create() {
    return this.address.create()
      .then((address) => {
        let results = Pool.query('INSERT INTO place (costumer_id, size, bathrooms, address_id) VALUES (?, ?, ?, ?)',
          [this.costumerId, this.size, this.bathrooms, address.id])
        return { address: address, results: results }
      }).then(({ address: address, results: results }) => {
        return results.then((results) => {
          return this.get('id', results.insertId)
        })
      });
  }

  get(column, param) {
    return Pool.query('SELECT * FROM place WHERE ' + column + ' = ?', [param])
      .then((results) => {
        let address = new Address().get('id', results[0].address_id)
        return { address: address, results: results}
      }).then(({ address: address, results: results}) => {
        return address.then((address) => {
          return new Place(results[0].costumer_id, results[0].size, results[0].bathrooms, address, results[0].id)
        })
      });
  }

  update() {
    return Pool.query('UPDATE place SET size = ?, bathrooms = ?', [this.size, this.bathrooms])
      .then(() => {
        return this.get('id', this.id)
      });
  }

  remove() {
    return this.address.remove()
      .then((res) => {
        if (!res) {
          throw new Error('could not remove this places address')
        } else {
          return Pool.query('DELETE FROM place WHERE id = ?', [this.id])
        }
      }).then((results) => {
        if(results.affectedRows == 1) {
          return true
        } else {
          return false
        }
      });
  }

  getListByCostumerId(costumerId) {
    //queries all Places from a costumer
    return Pool.query('SELECT * FROM place WHERE costumer_id = ?', [costumerId])
      .then((results) => {
        //for each place queries its address, and mounts an array of address
        let addresses = Promise.all(results.map(function(place){
          new Address().getByPlaceOrProId(place.id)
            .then((address) => {
              return address
            })
          }))
      return { addresses: addresses, results: results}
    }).then(({ addresses: addresses, results: results}) => {
        let places = []
        for (let i = 0; i < results; i++) {
          places.push(new Place(results[i].size, results[i].bathrooms, addresses[i]))
        }
        return places;
      });
  }
}
