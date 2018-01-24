import { Pool } from '../../config';
import { City } from './';

export class Address {
  constructor(addressLine, addressLine2, district, city, zipCode, addressId) {
    this.addressLine = addressLine;
    this.addressLine2 = addressLine2;
    this.district = district;
    this.city = city;
    this.zipCode = zipCode;
    this.id = addressId;
  }

  create() {
    return Pool.query('INSERT INTO address (address_line, address_line2, district, city_id, zip_code) VALUES (?, ?, ?, ?, ?)',
      [this.addressLine, this.addressLine2, this.district, this.city.id, this.zipCode])
        .then((results) => {
          return this.get('id', results.insertId);
        });
  }

  get(column, param) {
    return Pool.query('SELECT * FROM address WHERE ' + column + ' = ?', [param])
      .then((results) => {
        let city = new City().get('id', results[0].city_id)
        return { results: results, city: city }
      }).then(({ results: results, city: city }) => {
        return city.then((city) => {
          return new Address(results[0].address_line, results[0].address_line2, results[0].district, city, results[0].zip_code, results[0].id)
        })
      });
  }

  update() {
    return Pool.query('UPDATE address SET address_line = ?, address_line2 = ?, district = ?, city_id = ?, zip_code = ? WHERE id = ?',
      [this.addressLine, this.addressLine2, this.district, this.city.id, this.zipCode, this.id])
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
          return new Error('Address does not exist')
        }
      });
  }
}
