import { User, Place } from './';
import { Pool } from '../../config';

export class Costumer extends User {
  constructor (firstName, lastName, email, password = null, contactNumber, places = []) {
    super(firstName, lastName, email, password, contactNumber);
    this.places = places;
  }

  create() {
    return Pool.query('INSERT INTO costumer (email, first_name, last_name, password, cell_phone) VALUES (?, ?, ?, ?, ?)',
    [this.email, this.firstName, this.lastName, this.password, this.contactNumber])
      .then((results) => {
        return this.get('id', results.insertId)
      });
  }

  get(column, param) {
    return Pool.query('SELECT * FROM costumer where ' + column + ' = ?', [param])
      .then((results) => {
        let costumer = new Costumer(results[0].first_name, results[0].last_name, results[0].email, results[0].password, results[0].cell_phone)
        return { costumer: costumer, id: results[0].id }
      }).then(({ costumer: costumer, id: id }) => {
        return new Place().getListByCostumerId(id)
          .then((places) => {
            return { places: places, costumer: costumer }
          })
      }).then(({ places: places, costumer: costumer }) => {
        costumer.places = places;
        return costumer;
      });
  }


  update() {
    return Pool.query('UPDATE costumer SET email = ?, first_name = ?, last_name = ?, password = ?, cell_phone = ? WHERE email = ?',
    [this.email, this.firstName, this.lastName, this.password, this.contactNumber, this.email])
      .then((results) => {
        return this.get('email', this.email)
      });
  }

  remove() {
    return Pool.query('DELETE FROM costumer WHERE email = ?', [this.email])
      .then((results) => {
        if(results.affectedRows == 1) {
          return true
        } else {
          return false
        }
      });
  }
}