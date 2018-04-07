import { User, Address } from 'models';
import { Pool } from 'config';

export class Pro extends User {
  constructor (firstName, lastName, email, birthDate, address, description, rate = null, proId) {
    super(firstName, lastName, email, birthDate);
    this.address = address;
    this.rate = rate;
    this.proType = 'Standard';
    this.description = description;
    this.id = proId;
  }

  create() {
    return this.address.create()
      .then((address) => {
        console.log(this.email)
        return Pool.query(`INSERT INTO pro (email, first_name, last_name, pro_type, birth_date, address_id, description, id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [this.email, this.firstName, this.lastName, this.proType, this.birthDate, address.id, this.description, this.id])
      }).then((results) => {
        return this.get('id', results.insertId)
      }).catch((error) => {
        throw error
      });
  }

  get(column, param) {
    return Pool.query('SELECT * FROM pro WHERE ' + column + ' = ?', [param])
      .then((results) => {
        let address = new Address().get('id', results[0].address_id)
        return { results: results, address: address }
      }).then(({results: results, address: address}) => {
        return address.then((address) => {
          return new Pro(results[0].first_name, results[0].last_name, results[0].email, results[0].birth_date, address, results[0].description, results[0].rate, results[0].id)
        })
      }).catch((error) => {
        throw error
      });
  }

  update() {
    let pro = Pool.query('UPDATE pro SET first_name = ?, last_name = ?, birth_date = ?, description = ? WHERE id = ?',
    [this.firstName, this.lastName, this.birthDate, this.description, this.id])
    let address = this.address.update()
    return Promise.all([pro, address])
      .then((result) => {
        return this.get('id', this.id)
      }).catch((error) => {
        throw error
      });
  }

  remove() {
    return Pool.query('DELETE FROM pro WHERE id = ?', [this.id])
      .then((result) => {
        if (result.affectedRows == 1) {
          return true
        } else {
          throw new Error('Pro does not exist')
        }
      }).catch((error) => {
        throw error
      });
  }

  static updateDeviceToken(id, token) {
    return Pool.query('UPDATE pro SET device_token = ? WHERE id = ?', [token, id])
      .then((results) => {
        if (results.affectedRows == 1) {
          return true
        } else  {
          throw new Error('could not update device token')
        }
      }).catch((error) => {
        throw error
      })
  }
}
