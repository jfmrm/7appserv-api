import { Pool } from 'config';
import { Address } from 'models';

export class Place {
  constructor(customerId, address, answers, name, placeId) {
    this.id = placeId;
    this.name = name;
    this.customerId = customerId;
    this.address = address;
    this.answers = answers;
  }

  create() {
    return this.address.create()
      .then((address) => {
        let results = Pool.query('INSERT INTO place (customer_id, address_id, answers, name) VALUES (?, ?, ?, ?)',
          [this.customerId, address.id, JSON.stringify(this.answers), this.name])
        return { address: address, results: results }
      }).then(({ address: address, results: results }) => {
        return results.then((results) => {
          return this.get('id', results.insertId)
        })
      }).catch((error) => {
        throw error
      });
  }

  get(column, param) {
    return Pool.query('SELECT * FROM place WHERE ' + column + ' = ?', [param])
      .then((results) => {
        return new Place(results[0].customer_id, results[0].address_id, JSON.parse(results[0].answers), results[0].name, results[0].id)
      }).then((place) => {
        return new Address().get('id', place.address)
          .then((address) => {
            place.address = address
            return place
          })
      }).catch((error) => {
        throw error
      });
  }

  update() {
    return Pool.query('UPDATE place SET answers WHERE id = ?', [JSON.stringify(this.answers), this.id])
      .then(() => {
        return this.get('id', this.id)
      }).catch((error) => {
        throw error
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
          throw new Error('Place does not exist')
        }
      }).catch((error) => {
        throw error
      });
  }

  getListByCustomerId(customerId) {
    //queries all Places from a customer
    return Pool.query('SELECT id FROM place WHERE customer_id = ?', [customerId])
      .then((results) => {
        return Promise.all(results.map((place) => {
          return this.get('id', place.id)
        }))
      }).then((places) => {
        return places
      }).catch((error) => {
        throw error
      });
  }

  static updateAnswers(id, answers) {
    return Pool.query('UPDATE place SET answers = ? WHERE id = ?', [JSON.stringify(answers), id])
      .then((results) => {
        return new Place().get('id', id)
      }).catch(((error) => {
        throw error
      }));
  }

  static listPlaces(customerId) {
    return Pool.query('SELECT * FROM place WHERE customer_id = ?', [customerId])
      .then((results) => {
        return Promise.all(results.map((place) => {
          return new Place(place.id, place.customer_id, place.size, place.bathrooms, place.address_id, JSON.parse(place.answers))
        }));
      });
  }
}
