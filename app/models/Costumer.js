import { User, Place } from './';
import { Pool } from '../../config';

export class Costumer extends User {
  constructor (firstName, lastName, email, password = null, contactNumber, places = [], costumerId) {
    super(firstName, lastName, email, password, contactNumber);
    this.places = places;
    this.id = costumerId;
  }

  create() {
    return Pool.query('INSERT INTO costumer (email, first_name, last_name, password, cell_phone) VALUES (?, ?, ?, ?, ?)',
    [this.email, this.firstName, this.lastName, this.password, this.contactNumber])
      .then((results) => {
        return this.get('id', results.insertId)
      }).catch((error) => {
        throw error
      });
  }

  get(column, param) {
    return Pool.query('SELECT * FROM costumer where ' + column + ' = ?', [param])
      .then((results) => {
        return new Costumer(results[0].first_name, results[0].last_name, results[0].email, results[0].password, results[0].cell_phone, null, results[0].id )
      }).then((costumer) => {
        return new Place().getListByCostumerId(costumer.id)
          .then((places) => {
            return { places: places, costumer: costumer }
          })
      }).then(({ places: places, costumer: costumer }) => {
        costumer.places = places;
        return costumer;
      }).catch((error) => {
        throw error
      });
  }


  update() {
    return Pool.query('UPDATE costumer SET email = ?, first_name = ?, last_name = ?, cell_phone = ? WHERE email = ?',
    [this.email, this.firstName, this.lastName, this.contactNumber, this.email])
      .then((results) => {
        return this.get('email', this.email)
      }).catch((error) => {
        throw error
      });
  }

  remove() {
    return Pool.query('DELETE FROM costumer WHERE id = ?', [this.id])
      .then((results) => {
        if(results.affectedRows == 1) {
          return true
        } else {
          return new Error('Costumer does not exist')
        }
      }).catch((error) => {
        throw error
      });
  }
}
