import { Pool } from '../../config';

export class Address {
  constructor(addressId, numPlace, street, unit, city, state, zipCode) {
    this.id = addressId;
    this.numPlace = numPlace;
    this.street = street;
    this.unit = unit;
    this.city = city;
    this.state = state;
    this.zipCode = zipCode;
  }

  create() {
    return Pool.query('INSERT INTO address (num_place, street, unit, city, state, zip_code) VALUES (?, ?, ?, ?, ?, ?)',
      [this.numPlace, this.street, this.unit, this.city, this.state, this.zipCode])
        .then((results) => {
          return this.get('id', results.insertId);
        });
  }

  get(column, param) {
    return Pool.query('SELECT * FROM address WHERE ' + column + ' = ?', [param])
      .then((results) => {
        return new Address(results[0].id, results[0].num_place, results[0].street, results[0].unit, results[0].city, results[0].state, results[0].zip_code)
      });
  }

  update() {
    return Pool.query('UPDATE address SET num_place = ?, street = ?, unit = ?, city = ?, state = ?, zip_code = ? WHERE id = ?',
      [this.numPlace, this.street, this.unit, this.city, this.state, this.zipCode, this.id])
        .then((results) => {
          return this.get('id', this.id);
        });
  }

  remove() {
    return Pool.query('DELETE FROM address WHERE id = ?', [this.id])
      .then((results) => {
        if(results.affectedRows == 1) {
          return true
        } else {
          return false
        }
      });
  }
}
