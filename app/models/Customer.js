import { User, Place } from 'models';
import { Pool } from 'config';

export class Customer extends User {
  constructor (firstName, lastName, email, password = null, contactNumber, places = [], customerId) {
    super(firstName, lastName, email, password, contactNumber);
    this.places = places;
    this.id = customerId;
  }

  create() {
    return Pool.query('INSERT INTO customer (email, first_name, last_name, password, cell_phone) VALUES (?, ?, ?, ?, ?)',
    [this.email, this.firstName, this.lastName, this.password, this.contactNumber])
      .then((results) => {
        return this.get('id', results.insertId)
      }).catch((error) => {
        throw error
      });
  }

  get(column, param) {
    return Pool.query('SELECT * FROM customer where ' + column + ' = ?', [param])
      .then((results) => {
        return new Customer(results[0].first_name, results[0].last_name, results[0].email, results[0].password, results[0].cell_phone, null, results[0].id )
      }).then((customer) => {
        return new Place().getListByCustomerId(customer.id)
          .then((places) => {
            return { places: places, customer: customer }
          })
      }).then(({ places: places, customer: customer }) => {
        customer.places = places;
        return customer;
      }).catch((error) => {
        console.log(error)
        throw error
      });
  }


  update() {
    return Pool.query('UPDATE customer SET email = ?, first_name = ?, last_name = ?, cell_phone = ? WHERE email = ?',
    [this.email, this.firstName, this.lastName, this.contactNumber, this.email])
      .then((results) => {
        return this.get('email', this.email)
      }).catch((error) => {
        throw error
      });
  }

  remove() {
    return Pool.query('DELETE FROM customer WHERE id = ?', [this.id])
      .then((results) => {
        if(results.affectedRows == 1) {
          return true
        } else {
          throw new Error('Customer does not exist')
        }
      }).catch((error) => {
        throw error
      });
  }
}
