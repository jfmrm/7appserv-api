import { Pool } from 'config';
import { City } from 'models';

export class Address {
  constructor(addressLine, addressLine2, district, city, zipCode, latitude, longitude, addressId) {
    this.addressLine = addressLine;
    this.addressLine2 = addressLine2;
    this.district = district;
    this.city = city;
    this.zipCode = zipCode;
    this.id = addressId;
    this.latitude = latitude;
    this.longitude = longitude;
  }

  create() {
    return Pool.query('INSERT INTO address (address_line, address_line2, district, city_id, zip_code, latitude, longitude) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [this.addressLine, this.addressLine2, this.district, this.city.id, this.zipCode, this.latitude, this.longitude])
        .then((results) => {
          return this.get('id', results.insertId);
        }).catch((error) => {
          throw new Error(error.message)
        });
  }

  get(column, param) {
    return Pool.query('SELECT * FROM address WHERE ' + column + ' = ?', [param])
      .then((results) => {
        let city = new City().get('id', results[0].city_id)
        return { results: results, city: city }
      }).then(({ results: results, city: city }) => {
        return city.then((city) => {
          return new Address(results[0].address_line, results[0].address_line2, results[0].district, city, results[0].zip_code, results[0].latitude, results[0].longitude, results[0].id)
        })
      }).catch((error) => {
        throw new Error('This address does not exists')
      });
  }

  update() {
    return Pool.query('UPDATE address SET address_line = ?, address_line2 = ?, district = ?, city_id = ?, zip_code = ?, latitude = ?, longitude = ? WHERE id = ?',
      [this.addressLine, this.addressLine2, this.district, this.city.id, this.zipCode, this.latitude, this.longitude, this.id])
        .then((results) => {
          return this.get('id', this.id);
        }).catch((error) => {
          throw new Error(error.message)
        });
  }

  remove() {
    return Pool.query('DELETE FROM address WHERE id = ?', [this.id])
      .then((results) => {
        console.log(results)
        if(results.affectedRows == 1) {
          return true
        } else {
          throw new Error('Address does not exist')
        }
      });
  }
}
