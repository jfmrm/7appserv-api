import { User, Address } from 'models';
import { Pool } from 'config';

export class Pro extends User {
  constructor (firstName, lastName, email, password, birthDate, address, description, rate = null, proId) {
    super(firstName, lastName, email, password, birthDate);
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
        return Pool.query(`INSERT INTO pro (email, password, first_name, last_name, rate, pro_type, birth_date, address_id, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, [this.email, this.password, this.firstName, this.lastName, this.rate, this.proType, this.birthDate, address.id, this.description])
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
          return new Pro(results[0].first_name, results[0].last_name, results[0].email, null, results[0].birth_date, address, results[0].description, results[0].rate, results[0].id)
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
}
