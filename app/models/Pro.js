import { User, Address } from 'models';
import { Pool } from 'config';

export class Pro extends User {
  constructor (firstName, lastName, email, password, birthDate, address, hasInsurance, actionRadious, avarageResponseTime = null, rate = null, lastPaymentDate = null, proId) {
    super(firstName, lastName, email, password, birthDate);
    this.address = address;
    this.avarageResponseTime = avarageResponseTime;
    this.rate = rate;
    this.lastPaymentDate = lastPaymentDate;
    this.hasInsurance = hasInsurance;
    this.proType = 'Standard';
    this.id = proId;
    this.actionRadious = actionRadious;
  }

  create() {
    return this.address.create()
      .then((address) => {
        return Pool.query('INSERT INTO pro (email, password, first_name, last_name, average_response_time, rate, last_payment_date, pro_type, has_insurance, birth_date, address_id, action_radious) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [this.email, this.password, this.firstName, this.lastName, this.avarageResponseTime, this.rate, this.lastPayment, 'Standard', this.hasInsurance, this.birthDate, address.id, this.actionRadious])
      }).then((results) => {
        return this.get('id', results.insertId)
      }).catch((error) => {
        console.log(error)
        throw new Error('This e-mail is already registered')
      });
  }

  get(column, param) {
    return Pool.query('SELECT * FROM pro WHERE ' + column + ' = ?', [param])
      .then((results) => {
        let address = new Address().get('id', results[0].address_id)
        return { results: results, address: address }
      }).then(({results: results, address: address}) => {
        return address.then((address) => {
          return new Pro(results[0].first_name, results[0].last_name, results[0].email, null, results[0].birth_date, address, results[0].has_insurance, results[0].action_radious, results[0].average_response_time, results[0].rate, results[0].last_payment_date, results[0].id)
        })
      }).catch((error) => {
        throw new Error('Pro could not be found')
      });
  }

  update() {
    let pro = Pool.query('UPDATE pro SET first_name = ?, last_name = ?, has_insurance = ?, birth_date = ?, action_radious = ? WHERE id = ?',
    [this.firstName, this.lastName, this.hasInsurance, this.birthDate, this.actionRadious, this.id])
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
