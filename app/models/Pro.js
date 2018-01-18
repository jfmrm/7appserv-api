import { User, Address } from './';
import { Pool } from '../../config';

export class Pro extends User {
  constructor (firstName, lastName, email, password, contactNumber, address, hasInsurance, avarageResponseTime = null, rate = null, lastPaymentDate = null, proId) {
    super(firstName, lastName, email, password, contactNumber);
    this.address = address;
    this.avarageResponseTime = avarageResponseTime;
    this.rate = rate;
    this.lastPaymentDate = lastPaymentDate;
    this.hasInsurance = hasInsurance;
    this.proType = 'Standard';
    this.id = proId;
  }

  create() {
    return this.address.create()
      .then((address) => {
        return Pool.query('INSERT INTO pro (email, password, first_name, last_name, average_response_time, rate, last_payment_date, pro_type, has_insurance, contact_number, address_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [this.email, this.password, this.firstName, this.lastName, this.avarageResponseTime, this.rate, this.lastPayment, 'Standard', this.hasInsurance, this.contactNumber, address.id])
      }).then((results) => {
        return this.get('id', results.insertId)
      });
  }

  get(column, param) {
    return Pool.query('SELECT * FROM pro WHERE ' + column + ' = ?', [param])
      .then((results) => {
        let address = new Address().get('id', results[0].address_id)
        return { results: results, address: address }
      }).then(({results: results, address: address}) => {
        return address.then((address) => {
          return new Pro(results[0].first_name, results[0].last_name, results[0].email, results[0].password, results[0].contact_number, address, results[0].has_insurance, results[0].average_response_time, results[0].rate, results[0].last_payment_date, results[0].id)
        })
      });
  }

  update() {
    return Pool.query('UPDATE pro SET email = ?, password = ?, first_name = ?, last_name = ?, average_response_time = ?, rate = ?, last_payment_date = ?, pro_type = ?, has_insurance = ?, contact_number = ?',
    [this.email, this.password, this.firstName, this.lastName, this.avarageResponseTime, this.rate, this.lastPayment, 'Standard', this.hasInsurance, this.contactNumber])
      .then((result) => {
        return this.get('id', this.id)
      });
  }

  remove() {
    return Pool.query('DELETE FROM pro WHERE id = ?', [this.id])
      .then((result) => {
        if (result.affectedRows == 1) {
          return true
        } else {
          return false
        }
      });
  }
}