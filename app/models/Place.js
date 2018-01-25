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
      }).catch((error) => {
        throw new Error('This place does not exist')
      });
  }

  get(column, param) {
    return Pool.query('SELECT * FROM place WHERE ' + column + ' = ?', [param])
      .then((results) => {
        return new Place(results[0].costumer_id, results[0].size, results[0].bathrooms, results[0].address_id, results[0].id)
      }).then((place) => {
        return new Address().get('id', place.address)
          .then((address) => {
            place.address = address
            return place
          })
      }).catch(() => {
        throw new Error('This place does not exist')
      });
  }

  update() {
    return Pool.query('UPDATE place SET size = ?, bathrooms = ? WHERE id = ?', [this.size, this.bathrooms, this.id])
      .then(() => {
        return this.get('id', this.id)
      });
  }

  remove() {
    return this.get('id', this.id)
      .then((place) => {
        place.address.remove()
      }).then((res) => {
          return Pool.query('DELETE FROM place WHERE id = ?', [this.id])
      }).then((results) => {
        if(results.affectedRows == 1) {
          return true
        } else {
          return new Error('Place does not exist')
        }
      }).catch((error) => {
        throw error
      });
  }

  getListByCostumerId(costumerId) {
    //queries all Places from a costumer
    return Pool.query('SELECT id FROM place WHERE costumer_id = ?', [costumerId])
      .then((results) => {
        return Promise.all(results.map((place) => {
          return this.get('id', place.id)
        }))
      }).then((places) => {
        return places
      });
  }
}
